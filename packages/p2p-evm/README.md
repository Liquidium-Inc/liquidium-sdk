# @liquidium/p2p-evm

TypeScript SDK for partners integrating Liquidium peer-to-peer NFT loans on EVM chains and earning
a share of Liquidium's protocol fees. Attribution is verified onchain by the fee splitter contract.

## Install

```bash
npm install @liquidium/p2p-evm viem
```

## Before you start

Liquidium registers you in the fee splitter contract and gives you:

| Item | What it is |
| --- | --- |
| Partner id | Your number in the fee splitter. It goes into every offer your lenders sign. |
| Share rate | Your share, in basis points, of the fee your side earns. |
| Payout address | Where claims are paid. |
| API key | For the order book and valuations. Keep it on your server. |

You give Liquidium the address of a **signer key** that you generate and hold on your backend. It
must be a plain EOA key. It signs attributions only and never holds funds.

Check the setup yourself before going live. Every value below is read from the chain:

```ts
import { P2pEvmClient, ROBINHOOD_CHAIN_ID } from "@liquidium/p2p-evm";
import { createPublicClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";

const signer = privateKeyToAccount(process.env.PARTNER_SIGNER_KEY as `0x${string}`);
const client = new P2pEvmClient({
  chainId: ROBINHOOD_CHAIN_ID,
  publicClient: createPublicClient({ transport: http(process.env.RPC_URL) }),
  partnerId: 7,
  apiKey: process.env.LIQUIDIUM_API_KEY,
});
// On any other chain or deployment, also pass `loanCoreAddress`.

const deployment = await client.revenue.getDeployment(); // LoanCore, fee splitter, its owner
const partner = await client.revenue.getPartner(); // payout, shareBps, active
const registered = await client.revenue.isRegisteredSigner(signer.address);
```

## What you earn

| You bring | You earn | When |
| --- | --- | --- |
| The lender (the offer was made in your app) | Your share of Liquidium's interest fee | When the loan is repaid. Nothing on default. |
| The borrower (the fill happened in your app) | Your share of the activation fee | At origination. |

Your share is taken from Liquidium's fee, never from the lender's interest or the borrower's
principal. The rate is read when the loan is filled and fixed for that loan.

## Create an offer for a lender

```ts
// 1. Build the offer. Nonces come from LoanCore; the salt carries your partner id.
const { offer, typedData } = await client.offers.prepareOffer({
  lender,
  terms: { collection, asset, maxPrincipal, maxLtvBps, aprBps, duration, expiry },
});

// 2. The lender signs in their wallet.
const offerSignature = await lenderWallet.signTypedData(typedData);

// 3. Your backend signs that the offer came through you.
const lenderAttributionSignature = await client.attribution.signLenderAttribution({
  signer,
  offer,
});

// 4. Publish to the shared order book.
const published = await client.offers.publishOffer({
  offer,
  offerSignature,
  lenderAttributionSignature,
});
```

The lender also needs an ERC-20 allowance to LoanCore for the loan asset. Use `duration` and
`aprBps` from `client.market.listMarkets()`; the order book rejects unlisted terms.

The partner signature can only be supplied at publish time. A published offer is immutable.

## Fill an offer for a borrower

```ts
const { offers } = await client.offers.listOffers({ collection });
const offer = offers[0];

// Optional: ask the chain whether it is fillable and who gets the lender share.
const { fillable, lenderPartner } = await client.offers.verifyOffer(offer);

// Your backend signs for this borrower and this offer. Valid for ten minutes by default.
const borrowerAttribution = await client.attribution.signBorrowerAttribution({
  signer,
  offerHash: offer.offerHash,
  borrower,
});

const { call } = await client.loans.prepareBorrow({
  borrower,
  tokenId,
  offer,
  borrowerAttribution,
});

// The borrower's wallet simulates and sends it. No NFT approval is needed.
const { request } = await publicClient.simulateContract({ ...call, account: borrower });
const hash = await borrowerWallet.writeContract(request);

const receipt = await publicClient.waitForTransactionReceipt({ hash });
const origination = client.loans.findOrigination(receipt.logs, offer.offerHash);
```

`prepareBorrow` always forwards the lender's partner signature when the offer has one, whoever
that partner is. Offers from Liquidium's app and from every partner sit in one book, so you will
fill other partners' offers and they will fill yours.

Repay with `client.loans.prepareRepay(loanId)`. It returns the call, the asset and the amount to
approve.

## Collect what you are owed

```ts
const claimable = await client.revenue.getClaimable(asset);

// Interest shares are reserved at origination and move to your balance once the loan is repaid.
const settle = await client.revenue.prepareSettleInterest([loanId]);
const claim = await client.revenue.prepareClaim(asset);
```

Anyone can send either call. `claim` always pays your registered payout address.

## What you can verify without trusting Liquidium

| Liquidium supplies | How the SDK checks it |
| --- | --- |
| Offers from the order book | Recomputes each offer hash locally for your chain and LoanCore. |
| Oracle valuations | Recovers the signer and compares it with LoanCore's `oracleSigner`. |
| The fee splitter address | Never configured: read from LoanCore's `feeRecipient`, and the splitter must name that LoanCore back. |
| Offer nonces | Read from LoanCore. |
| Your rate, signer, balances | Read from the fee splitter. |
| That your signature was stored | `publishOffer` fails if the stored offer does not carry it. |

One thing is detected rather than prevented. Whoever fills an offer must forward your lender
signature, and a fill that leaves it out still succeeds and pays you nothing. Audit for it from
chain events:

```ts
const audits = await client.revenue.auditLenderAttribution({
  offerHashes, // offers you signed for
  fromBlock,
});
// outcome: "credited" | "skipped" | "omitted"
```

`omitted` means you were owed a share and the fill dropped your signature. The entry includes the
transaction hash as evidence. `skipped` means your signature was forwarded but the splitter
rejected it, for example because your signer was removed.

## What Liquidium still controls

The fee splitter's owner, a Liquidium multisig, can:

- Change your share rate. The new rate applies to loans filled afterwards; your balances and open
  loans keep theirs.
- Deactivate you or remove your signer. New attributions stop; what you have accrued stays
  claimable.
- Release the reserved interest share of a loan that has not been repaid.
- Change your payout address. You can change it too, from the current payout address.

It cannot reduce a claimable balance or cancel the share of a repaid loan. Every one of these
actions emits an event, and `revenue.getDeployment()` and `revenue.getPartner()` read the current
owner, payout and rate.

## Errors

Every failure is a `P2pEvmError` with a `code` from `P2pEvmErrorCode`. The ones specific to
revenue sharing:

| Code | Meaning |
| --- | --- |
| `FEE_SPLITTER_NOT_CONFIGURED` | LoanCore's fee recipient is not a fee splitter for it. Revenue sharing is not live on this deployment. |
| `PARTNER_MISMATCH` | The offer's salt does not name the partner you are signing as. |
| `INVALID_ATTRIBUTION` | The splitter rejects the signature, or the order book stored an offer without it. |
| `OFFER_HASH_MISMATCH` | An offer from the API does not hash to its own terms. |
| `INVALID_VALUATION` | A valuation is expired, for another market, or not signed by LoanCore's oracle. |
| `CHAIN_MISMATCH` | The public client or the API is on a different chain or LoanCore. |

## Limits

- NFT-collateral loans only. Token-collateral loans are not supported yet.
- The SDK builds transactions and typed data. It never holds keys or sends transactions.
- The API key and signer key belong on a server. Do not ship either to a browser.
