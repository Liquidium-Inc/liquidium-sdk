---
name: liquidium-sdk-integration
description: "Use this skill first for the Liquidium TypeScript SDK accountless Simple Loans flow, `@liquidium/client`, `LiquidiumClient`, `client.simpleLoans`, wallet adapters, Liquidium profile creation, market data, quotes, borrowing, supply flows, positions, activities, or history. Use it whenever the user wants to integrate Liquidium into a TypeScript, React, or Vite app, or asks how to call Liquidium SDK methods correctly."
license: MIT
metadata:
  title: Liquidium SDK Integration
  category: TypeScript SDK
---

# Liquidium SDK Integration

`@liquidium/client` reads Liquidium market and position data, then executes accountless Simple Loans and advanced profile-based lending flows.

Priority: accountless Simple Loans are the default product flow. Use `client.simpleLoans` first, deposit-address profile flows second, and ETH contract interaction only when explicitly needed.

## Default Decision

When the user asks for a simple borrow, loan, collateral deposit, repayment target, or Liquidium integration and does not explicitly ask to manage Liquidium profiles, implement the accountless Simple Loans flow with `client.simpleLoans`.

Do not require the user to create a Liquidium profile, sign a borrow message, or call `client.lending.borrow(...)` for the default flow. The SDK creates the backing profile and returns generated initial-deposit and repayment quote targets.

Use profile-based `client.accounts` and `client.lending` only when the user explicitly asks for advanced profile management, existing profile positions, manual supply/repay tracking, signed borrow/withdraw flows, or lower-level wallet orchestration.

## Modules

```ts
import { LiquidiumClient } from "@liquidium/client";

const client = new LiquidiumClient({});
```

The client exposes: `simpleLoans`, `accounts`, `lending`, `positions`, `market`, `activities`, `history`, `quote`.

## Setup

Install the client package:

```bash
npm install @liquidium/client
pnpm add @liquidium/client
bun add @liquidium/client
```

Use the SDK in browser apps and modern TypeScript runtimes. Browser integrations
need `fetch`, `BigInt`, and standard ESM support. Follow the host app's package
manager and build tooling.

Minimal config:

```ts
const client = new LiquidiumClient({});
```

Richer config when the flow requires it:

```ts
const client = new LiquidiumClient({
  environment: "mainnet",
  apiBaseUrl: "https://your-app.example.com/api/sdk",
  headers: { "x-client-name": "my-app" },
  evmRpcUrl: "https://mainnet.infura.io/v3/<key>",
  timeoutMs: 30_000,
});
```

**Config requirements:**

- `environment`: sets the canister preset. Only `mainnet` is bundled; use `canisterIds` to override Liquidium canisters for custom deployments
- `apiBaseUrl`: defaults to `https://app.liquidium.fi/api/sdk`. Override it for another Liquidium SDK API deployment. It is used by history, activities, inflow reporting, `simpleLoans.create(...)`, `simpleLoans.get(...)`, and `simpleLoans.find(...)`, but not by `borrow(...)`, `withdraw(...)`, or default ETH stablecoin deposit-address supply/repay target resolution
- `headers`: adds headers to Liquidium SDK HTTP API requests, for example app attribution or auth from a backend proxy
- `fetch`: supplies a custom fetch implementation when the runtime needs one
- `evmRpcUrl` / `evmPublicClient`: required for lower-level USDC/USDT contract-interaction supply planning and allowance polling. Native ETH contract interaction does not perform ERC-20 reads. Use `evmRpcHeaders` when the RPC provider authenticates with HTTP headers
- `identity` / `icHost`: custom ICP agent configuration
- `canisterIds`: accepts partial overrides for `lending`, `ethDeposit`, `simpleLoans`, and `pools.{btc,eth,usdt,usdc,icp}`
- `canisterIds.simpleLoans`: defaults to mainnet `u5rm3-niaaa-aaaar-qb7eq-cai`; override it for custom deployments

Partial `canisterIds` overrides merge with mainnet defaults. For a fully custom
deployment, provide every deployment-specific Liquidium canister ID. The public
config does not override the ckBTC minter/ledger or the ckETH, ckUSDC, ckUSDT, and ICP
ledger IDs; those routes currently use fixed mainnet canisters.

For Vite example apps, expose the RPC URL through a `VITE_` variable. If using
Infura, prefer `VITE_INFURA_API_KEY` and derive the URL in app config:

```ts
const evmRpcUrl = import.meta.env.VITE_INFURA_API_KEY
  ? `https://mainnet.infura.io/v3/${import.meta.env.VITE_INFURA_API_KEY}`
  : import.meta.env.VITE_EVM_RPC_URL;
```

Vite env vars are bundled client-side. Treat Infura browser keys as publishable
or route RPC calls through a server if the key must remain private.

## Assets and Transfer Routes

The public asset symbols are `"BTC"`, `"ETH"`, `"USDC"`, `"USDT"`, and `"ICP"`.
Chain-key assets use the underlying asset plus `chain: "ICP"`; do not pass
`"ckBTC"`, `"ckETH"`, `"ckUSDC"`, or `"ckUSDT"` as `asset` values.

| Asset | Chain | Transfer representation |
| --- | --- | --- |
| `"BTC"` | `"BTC"` | Native BTC |
| `"BTC"` | `"ICP"` | ckBTC |
| `"ETH"` | `"ETH"` | Native ETH |
| `"ETH"` | `"ICP"` | ckETH |
| `"USDC"` | `"ETH"` | ERC-20 USDC |
| `"USDC"` | `"ICP"` | ckUSDC |
| `"USDT"` | `"ETH"` | ERC-20 USDT |
| `"USDT"` | `"ICP"` | ckUSDT |
| `"ICP"` | `"ICP"` | Native ICP |

Use exported `Asset`, `Chain`, `AssetIdentifier`, and `isAssetIdentifier(...)`
when constructing or validating routes. `ICP` is a transfer chain, but not a
`SigningChain`; profile authorization still uses a BTC or ETH wallet.

## Module Guide

### simpleLoans

Accountless Simple Loans. This is the default simple borrow UX: create a loan,
show the fee-inclusive initial deposit quote and generated collateral deposit
address, restore by reference, and show the actionable repayment amount after
debt exists.

```ts
client.simpleLoans.create(...);
client.simpleLoans.get({ ref });
client.simpleLoans.get({ loanId });
client.simpleLoans.find(query);
client.quote.calculateLtv(...); // pure helper for current LTV previews
```

`create(...)` accepts nested `collateral`, `borrow`, and `refund` legs plus
`ltvMaxBps` and `depositWindowSeconds`. Amounts use base units. The borrow and
refund legs include the delivery chain and destination. The SDK validates the
request, creates the loan, then returns hydrated deposit and repayment quotes
keyed by transfer chain.

There is no `collateral.chain` create field. `borrow.chain` selects borrowed
asset delivery, `refund.chain` selects collateral refunds and withdrawals, and
the user selects the collateral deposit rail from the returned
`loan.initialDeposit.targets`. Treat all three route choices independently; do
not derive them all from `Pool.chain`.

Current LTV guards require `ltvMaxBps` to be at least the current implied LTV
plus the SDK slippage buffer and no higher than the collateral pool max LTV. Do
not confuse the quote module's `targetLtvBps` with `create(...)`'s `ltvMaxBps`. Use
`client.quote.calculateLtv(...)` when clients need to preview the current LTV
from chosen borrow and collateral amounts before calling `create(...)`.

Pools expose `sameAssetBorrowing` and `sameAssetBorrowingDustThreshold`. When
same-asset borrowing is disabled, same-asset collateral must be strictly below
the base-unit dust threshold; equality is rejected. Quote helpers, Simple Loans
creation, and profile borrow preparation enforce this policy.

`create(...)` and `get(...)` do not require a wallet adapter, profile ID, or
message signing. Read a quote from `initialDeposit.targets[chain]` or
`repayment.targets[chain]`. Each quote contains the full amount to send, its fee
estimate, and a flat target with a primary `address`.

Target maps are partial. BTC-backed targets can offer `"BTC"` and `"ICP"`.
ETH, USDC, and USDT targets can offer `"ETH"` and `"ICP"`, while ICP-backed
targets offer only `"ICP"`. Check that the selected entry exists before showing
or executing it.

Initial-deposit quotes expose `amount` and `inflowFeeAmount`. Repayment quotes
also expose `inflowFeeEstimateAvailable`; use that flag when labeling the fee
rather than presenting every repayment fee as a live estimate.
For native ETH, Simple Loan quotes use a `0.00025 ETH` fallback when the live
deposit-canister estimate fails or returns a non-positive amount. Repayment
quotes mark that fallback with `inflowFeeEstimateAvailable: false`.

Deposit and repayment targets are distinct generated inflow targets. Select the
quote for the chain the user will transfer on. Do not assume the addresses
match, reuse the collateral deposit target for repayment, or cache one target
for both phases.

Hydrated Simple Loans use the current public shape: read terms from
`loan.terms.ltvMaxBps` and `loan.terms.depositWindowSeconds`; read deposit
instructions from `loan.initialDeposit.targets[chain]`; read repayment
instructions from `loan.repayment.targets[chain]`. Do not use removed top-level fields such as
`loan.depositTarget`, `loan.repayTarget`, `loan.ltvMaxBps`, or
`loan.depositWindowSeconds`.

Reload with `client.simpleLoans.get({ ref })` before displaying repayment
instructions so the app uses the canonical repayment amount and target.

If `create(...)` throws `SimpleLoanCreatedError`, the loan was already created.
Use the error's `loanId` or `ref` with `get(...)`; do not call `create(...)`
again, because that can create a duplicate loan.

Status-returning methods use the shared `LiquidiumStatus` shape:
`{ operation, state, confirmations, requiredConfirmations }`. `operation` is one
of `deposit`, `borrow`, `repayment`, `withdrawal`, or `liquidation`. `state` is
one of `action_required`, `confirming`, `processing`, `active`, `completed`,
`failed`, or `expired`. `confirmations` and `requiredConfirmations` are always
present and are `null` when unavailable or not applicable.

When showing deposit progress, use `loan.status` from `simpleLoans.get({ ref })`
for the canonical current lifecycle state. Use
`activities.list({ shortRef: ref, filter: "active" })` when the UI also needs
receipt ids, txids, top-up details, or a full activity timeline.

Use `find(...)` for recovery screens where the user may paste a short reference,
numeric loan id string, address, or transaction id. It returns lightweight loan
matches with indexed loan fields; call `get({ loanId })` after the user selects
one.

### market

Pool discovery, asset prices, and per-reserve data.

```ts
client.market.listPools();
client.market.findPool({ asset, chain });
client.market.getReserveData({ asset, chain });
client.market.getAssetPrices();
client.market.getPoolRate(poolId);
```

`Pool` includes `decimals`, `availableLiquidity`, caps, rates, and index data.
`Pool.chain` describes the backing lending pool, not every transfer rail users
can choose. Native and ck representations share a pool: for example,
`findPool({ asset: "ETH", chain: "ETH" })` and
`findPool({ asset: "ETH", chain: "ICP" })` resolve to the same ETH pool. Likewise,
`findPool({ asset: "USDT", chain: "ETH" })` and
`findPool({ asset: "USDT", chain: "ICP" })` resolve to the same ETH-backed USDT
pool. There are no separate ckBTC, ckETH, ckUSDC, or ckUSDT pools.

### quote

Quote-first planning. Use this to calculate borrow USD value, required
collateral, current LTV, validation errors, and warnings from caller-supplied market data.
For default accountless Simple Loans, the quote can help choose `collateralAmount` and
`borrowAmount`; execution still goes through `client.simpleLoans.create(...)`.
For advanced profile-based borrowing, fetch pools and prices first, then call
`quote` before preparing the signed borrow.

```ts
const pools = await client.market.listPools();
const prices = await client.market.getAssetPrices();
const quote = client.quote.getQuote(request, pools, prices);
const ltv = client.quote.calculateLtv(ltvRequest, pools, prices);
```

`getQuote(...)` is synchronous and pure after the app has already fetched pools
and prices. It returns `validationErrors` and `warnings`; it does not throw for
normal quote validation failures such as missing pools, missing prices, invalid
LTV, too-small borrow amounts, or disallowed same-asset borrowing. Treat a quote
with validation errors as non-executable.

`calculateLtv(...)` is also synchronous and pure after fetching pools and prices.
It accepts `borrowAmount`, `borrowPoolId`, `collateralAmount`, and
`collateralPoolId`, then returns `ltvBps`, `borrowUsd`, `collateralUsd`,
`maxAllowedLtvBps`, asset metadata, and `validationErrors`.

### accounts

Profile creation and resolution.

```ts
client.accounts.prepareCreateProfile(...);  // returns a signable action
client.accounts.createProfile(...);         // signs and submits through a wallet adapter
client.accounts.getProfileId(walletAddress);
client.accounts.listLinkedWallets(profileId);
```

### lending

Advanced profile-based borrow, withdraw, supply, repay, inflow reporting, and supply tracking. Do not use this as the default borrow UX; most apps should start with `client.simpleLoans`.

```ts
client.lending.prepareBorrow(...);
client.lending.prepareWithdraw(...);
client.lending.borrow(...);
client.lending.withdraw(...);
client.lending.supply(...);
client.lending.estimateInflowFee({ asset: "USDT", chain: "ETH" });
client.lending.submitInflow({ txid, chain: "BTC", operation: "deposit" });
```

Every `supply(...)` request requires `chain`. Valid transfer routes are BTC
pools via `"BTC"` or `"ICP"`, ETH/USDC/USDT pools via `"ETH"` or `"ICP"`, and
the ICP pool via `"ICP"` only. Use `mechanism: "transfer"` explicitly or omit
it for the same default. `mechanism: "contractInteraction"` is valid for native
ETH, USDC, and USDT on Ethereum.

`estimateInflowFee({ asset, chain })` accepts any supported `AssetIdentifier`
and returns `{ totalFee: bigint }`. It does not take a pool ID, profile ID, or
supply action. BTC L1 estimates include ckBTC minter and ledger fees. Native ETH
and ETH stablecoins use the deposit-address canister, while ICP routes use the
relevant ledger fee.

### positions

Existing profile state plus aggregate position reads.

```ts
client.positions.getPosition(profileId, poolId);
client.positions.listPositions(profileId);
client.positions.getHealthFactor(profileId);
client.positions.getUserStats(profileId);
client.positions.getUserPositionSummary(profileId);  // aggregate: collateral, debt, availableBorrows, netWorth, LTV, HF
client.positions.getUserReserves(profileId);         // per-reserve view joined with pool + price data
client.positions.getMaxRepayAmount(profileId, poolId, bufferBps?); // full-repay amount with accrual buffer
client.positions.getFullWithdrawAmount(profileId, poolId);         // current supplied balance for full withdraw
```

`getFullWithdrawAmount(...)` returns `{ amount, decimals }`. Pass `amount` to
`client.lending.withdraw(...)` or `prepareWithdraw(...)`; use `decimals` only
for UI formatting. Do not add `earnedInterest` to the returned amount.

### activities

Receipt status and active/completed/all activity lists. Lists default to active
activities and use the configured SDK API base URL, which has a production
default.

```ts
client.activities.list({ profileId });
client.activities.list({ profileId, filter: "all" });
client.activities.getStatus({ profileId, id });
```

### history

User transaction and liquidation history. Uses the configured SDK API base URL,
which has a production default.

```ts
client.history.getUserTransactionHistory(profileId, filters?);
client.history.getLiquidationHistory(profileId, filters?);
```

Activities and user history entries expose `txids?: string[]`; do not expect
legacy singular or direction-specific txid fields. Transaction history uses
canonical operation names:
`deposit`, `borrow`, `repayment`, `withdrawal`, and `liquidation`.
Use `operations` for operation filters and `states` for lifecycle-state filters;
do not use removed `type`, `status`, or `kind` filters.

## Rate and Amount Formatting

Amount fields are `bigint` base units. Format them with the asset or pool
`decimals`; do not display raw base-unit values as user amounts.
BTC uses satoshis, ETH and ckETH use wei with 18 decimals, ICP uses e8s, and
USDC/USDT use token base units according to the selected pool's `decimals`.
The ETH deposit, borrow, and withdrawal minimum is
`5_000_000_000_000_000n` wei (`0.005 ETH`). Wallet-executed deposits enforce
this minimum; manual deposit-address flows must apply
`getMinimumDepositAmount(Asset.ETH)` before broadcasting. Repayments do not use
the deposit minimum.

Rate and risk-ratio fields such as `lendingRate`, `borrowingRate`,
`utilizationRate`, `maxLtv`, and `liquidationThreshold` are fixed-point values scaled by `rateDecimals`, usually
`27`. Do not render raw scaled values as percentages.

Never convert a raw scaled rate directly to display text or append `%` to it.
That can produce impossible UI values such as `3.7e+24%`. Divide by
`10 ** rateDecimals` first, then multiply by `100` only for percentage display,
and format the final value with fixed decimals or `Intl.NumberFormat`.

```ts
function formatScaledRatePercent(
  scaledRate: bigint,
  rateDecimals: bigint,
  fractionDigits = 2,
): string {
  const scale = 10n ** rateDecimals;
  const percentScale = 100n;
  const displayScale = 10n ** BigInt(fractionDigits);
  const rounded =
    (scaledRate * percentScale * displayScale + scale / 2n) / scale;
  const whole = rounded / displayScale;
  const fraction = rounded % displayScale;

  if (fractionDigits === 0) {
    return `${whole}%`;
  }

  return `${whole}.${fraction.toString().padStart(fractionDigits, "0")}%`;
}
```

## Error Handling

Validate user-selected amounts before calling state-changing methods:

```ts
const ltv = client.quote.calculateLtv(request, pools, prices);

if (ltv.validationErrors.length > 0) {
  return {
    ok: false,
    message: ltv.validationErrors.map((error) => error.message).join(" "),
  };
}
```

Catch SDK errors at the boundary where the app can show user-facing copy,
retry, or log diagnostic context:

```ts
import {
  LiquidiumError,
  LiquidiumErrorCode,
  SimpleLoanCreatedError,
} from "@liquidium/client";

try {
  return await client.simpleLoans.create(request);
} catch (error) {
  if (error instanceof SimpleLoanCreatedError) {
    return await client.simpleLoans.get({ loanId: error.loanId });
  }

  if (error instanceof LiquidiumError) {
    if (error.code === LiquidiumErrorCode.REQUEST_TIMEOUT) {
      // Show retry copy or trigger the app's retry path.
    }

    throw error;
  }

  throw error;
}
```

Use exported `LiquidiumErrorCode` values when the UI needs different copy for
timeout, transport, validation, or protocol failures. Quote validation failures
are returned in `validationErrors`; do not rely on thrown errors for normal quote
invalidity.

`SimpleLoanCreatedError` means creation succeeded remotely but hydration failed.
Recover through `simpleLoans.get(...)` with its `loanId` or `ref`; never retry
`create(...)`, because that can create a duplicate loan.

## Wallet Adapter

The SDK uses a `WalletAdapter` for signing and transaction execution. Implement only the methods the selected flow needs.

Default accountless Simple Loans do not need a `WalletAdapter`. Add one only
for advanced profile creation, signed borrow/withdraw, or automated transfer
execution.

```ts
import type { WalletAdapter } from "@liquidium/client";

const walletAdapter: WalletAdapter = {
  signMessage: async ({ message }) => wallet.signMessage(message),
  sendEthTransaction: async ({ transaction }) =>
    wallet.sendTransaction(transaction),
};
```

**Method selection:**

- `signMessage`: account creation, borrow, and withdraw flows (signs a Liquidium message)
- `sendBtcTransaction`: transfer-path supply automation for BTC targets
- `sendEthTransaction`: transfer-path automation for ETH targets and contract-interaction supply automation
- `sendIcrcTransfer`: transfer-path supply automation for ICP-ledger targets

For ckBTC, ckETH, ckUSDC, ckUSDT, or native ICP wallet-executed supply and repayment,
forward the SDK-provided ledger transfer and return its transaction reference:

```ts
const walletAdapter: WalletAdapter = {
  sendIcrcTransfer: async ({ asset, transfer, account }) =>
    wallet.sendIcrcTransfer({ asset, transfer, account }),
};
```

`transfer` contains `ledgerCanisterId`, `to`, `amount`, and optional `fee` and
`memo` fields. Its `to` value is a normalized `IcrcAccount`.

## Flows

### Simple Loan default flow

Use `client.simpleLoans.create(...)` when the user should not create or manage
a Liquidium profile. The user supplies chain-specific borrow and refund
destinations, receives a numeric loan ID and short user-facing reference, then
sends collateral to the generated deposit address.

Default app sequence:

1. Fetch pools and prices for pool selection and optional quote display.
2. Optionally call `client.quote.calculateLtv(...)` to show current LTV and the collateral pool's max allowed LTV.
3. Call `client.simpleLoans.create(...)` with direct base-unit amounts, transfer chains, and matching destination account families.
4. Persist or display `loan.ref` as the primary recovery key.
5. Select and show the quote in `loan.initialDeposit.targets[chain]`; later reload the loan and select `loan.repayment.targets[chain]`.

Expose collateral deposit, borrow delivery, and refund/withdrawal as separate
route controls. For a backing BTC, ETH, USDC, or USDT pool, label the `"ICP"`
option as ckBTC, ckETH, ckUSDC, or ckUSDT so users understand which asset they
will transfer.

The default Simple Loans flow does not need a wallet adapter. The user signs or
broadcasts only the external wallet transfer to the generated deposit or repay
target outside the SDK.

The deposit target and repayment target are not interchangeable. If a UI has
separate deposit and repay screens, each screen must read the quote for that
exact phase and transfer chain instead of sharing one saved address.

```ts
const ltv = client.quote.calculateLtv(
  {
    collateralPoolId: btcPool.id,
    borrowPoolId: usdtPool.id,
    collateralAmount: 10_000_000n,
    borrowAmount: 2_000_000n,
  },
  pools,
  prices
);

const loan = await client.simpleLoans.create({
  collateral: {
    poolId: btcPool.id,
    asset: "BTC",
    amount: 10_000_000n,
  },
  borrow: {
    poolId: usdtPool.id,
    asset: "USDT",
    amount: 2_000_000n,
    chain: "ETH",
    destination: "0x2222222222222222222222222222222222222222",
  },
  refund: {
    chain: "BTC",
    destination: "1BoatSLRHtKNngkdXEeobR76b53LETtpyT",
  },
  ltvMaxBps: ltv.maxAllowedLtvBps,
  depositWindowSeconds: 3_600n,
});

const ref = loan.ref;
const initialDeposit = loan.initialDeposit.targets.BTC;
const repayment = loan.repayment.targets.ETH;
```

Create destinations are validated against the requested chain before the SDK
creates a loan. Use `"BTC"` for L1 BTC, `"ETH"` for native ETH or L1 ETH
stablecoins, and `"ICP"` for ICP-native or ck-ledger destinations.

Destination families:

| Asset path | Chain | Valid destination family |
| --- | --- | --- |
| BTC L1 | `"BTC"` | BTC mainnet chain address |
| Native ETH | `"ETH"` | EVM chain address |
| ETH L1 USDC/USDT | `"ETH"` | EVM chain address |
| ICP native | `"ICP"` | IC principal, ICRC account, or ICP account identifier |
| ckBTC, ckETH, ckUSDC, ckUSDT | `"ICP"` | IC principal |

Use typed destination objects when preventing fund-loss mistakes matters:
`{ type: "ChainAddress", address: "..." }`,
`{ type: "IcPrincipal", address: "..." }`,
`{ type: "IcrcAccount", address: "..." }`, or
`{ type: "IcpAccountIdentifier", address: "..." }`. The SDK rejects mismatched
families such as an ETH L1 address for a ck-ledger destination or a BTC/EVM
address for an ICP native destination before any create request is sent.

`LiquidiumAccountInput` is either a string or one of those `{ type, address }`
references. Returned `LiquidiumAccount` values are normalized discriminated
objects; returned `IcrcAccount` values additionally contain `owner` and optional
`subaccount`. `SupplyTarget` is a separate flat type with a primary `address`.

`collateral.amount` and `borrow.amount` are in each asset's base units.
`collateral.amount` is the intended credited collateral target before
deposit/inflow fees; use the selected initial-deposit quote's `amount` after
creation. Use pool `decimals` and the quote module when building UI inputs.
Keep the initial loan LTV under the SDK's Simple Loan starting-LTV guard and set
`ltvMaxBps` within the collateral pool's accepted max-LTV range.

Every public supply target has a primary `address`. Native ICP targets may also
include `icpAccountIdentifier` for legacy ledger integrations.

```ts
const depositAddress = initialDeposit?.target.address;
```

Transfer targets also include `poolId`, `asset`, `chain`, and `action`. Use
those fields to label and validate the UI before asking the user to send funds.

Restore a loan by `ref` whenever possible:

```ts
const loan = await client.simpleLoans.get({ ref: "8Y9AQQ" });
const repayment = loan.repayment.targets.ETH;
const repayAmount = repayment?.amount ?? 0n;
const repayAddress = repayAmount > 0n ? repayment?.target.address : null;
```

Use search only as recovery when the user lost the loan reference:

```ts
const results = await client.simpleLoans.find("bc1qrefunddestination");
const firstMatch = results[0];
const loan = firstMatch
  ? await client.simpleLoans.get({ loanId: firstMatch.loanId })
  : null;
```

Search results are lightweight: `loanId`, `ref`, `createdAt`, `profileId`,
`collateral.poolId`, `collateral.asset`, `collateral.amount`, `borrow.poolId`,
and `borrow.asset`. Reference lookup is canonical. Search may return multiple
matches; prefer `get({ ref })` once the app has a saved reference.

Do not use `client.lending.borrow(...)` for this flow. `lending.borrow(...)` is
the profile-based signed borrow primitive. Simple Loans automate the borrow
after collateral arrives.

Simple Loan status is UI-facing:

- `{ operation: "deposit", state: "action_required" }`: show the selected initial-deposit quote and show `expiryTimestamp` only when it is non-null
- `{ operation: "deposit", state: "confirming" }`: show deposit confirmation progress
- `{ operation: "deposit", state: "processing" }`: keep polling while Liquidium processes the confirmed collateral
- `{ operation: "borrow", state: "processing" }`: keep polling while the borrow outflow is created
- `{ operation: "repayment", state: "active" }`: show the selected repayment quote
- `{ operation: "repayment", state: "confirming" }`: show repayment confirmation progress
- `{ operation: "repayment", state: "processing" }`: keep polling while Liquidium applies the repayment
- `{ operation: "repayment", state: "completed" }`: show final state and stop prompting for repayment
- `{ operation: "deposit", state: "expired" }`: show timeout state and stop prompting for collateral deposit

### Advanced: create a profile

Only use this when the app intentionally manages Liquidium profiles. Do not add
profile creation to the default accountless Simple Loans flow.

Convenience method when the app already has wallet signing wired:

```ts
const profileId = await client.accounts.createProfile({
  account: walletAddress,
  chain: "ETH",
  walletAdapter: {
    signMessage: async ({ message }) => wallet.signMessage(message),
  },
});
```

Prepare flow when you want explicit control over signing:

```ts
const createAction = await client.accounts.prepareCreateProfile({
  account: walletAddress,
});

const signature = await wallet.signMessage(createAction.message);

const profileId = await createAction.submit({
  signature,
  chain: "ETH",
  account: walletAddress,
});
```

`prepareCreateProfile(...)` normalizes the account and fetches the signing nonce;
it does not pre-check profile uniqueness. Handle existing profiles by catching
`PROFILE_ALREADY_EXISTS` from submission/canister validation and resolving the
profile instead of retrying the create flow.

### Read market data and positions

```ts
const pools = await client.market.listPools();
const prices = await client.market.getAssetPrices();
const positions = await client.positions.listPositions(profileId);
const healthFactor = await client.positions.getHealthFactor(profileId);
```

For an aggregate position summary (`availableBorrowsUsd`, `netWorthUsd`,
`currentLtvBps`, `healthFactor`) plus a per-reserve USD breakdown:

```ts
const summary = await client.positions.getUserPositionSummary(profileId);
const reserves = await client.positions.getUserReserves(profileId);
```

### Advanced profile-based quote-first borrow

Use this only for apps that already manage profiles and need signed borrow
execution. For the accountless product flow, use the quote only for planning and
execute with `client.simpleLoans.create(...)`.

```ts
const pools = await client.market.listPools();
const prices = await client.market.getAssetPrices();

const quote = client.quote.getQuote(request, pools, prices);

const outflow = await client.lending.borrow({
  profileId,
  poolId: quote.borrowPoolId,
  amount: quote.borrowAmount,
  chain: "ETH",
  receiver: {
    type: "ChainAddress",
    address: destinationAddress,
  },
  signerWalletAddress: walletAddress,
  signerChain: "ETH",
  signerWalletAdapter: {
    signMessage: async ({ message }) => wallet.signMessage(message),
  },
});

// `outflow.id` is the outflow reference assigned by the canister. `outflow.txid`
// may be undefined until the canister broadcasts the on-chain transaction. The SDK
// does not poll for the txid; consumers should display `outflow.id` immediately
// and resolve the txid separately if needed.
```

### Advanced profile-based supply flow

Use this only for profile-based integrations that intentionally manage Liquidium
profiles. Use `client.simpleLoans` for the default accountless borrow UX.

```ts
const supplyFlow = await client.lending.supply({
  profileId,
  poolId,
  action: "deposit",
  chain: "BTC",
});

if (supplyFlow.type === "transfer") {
  const depositAddress = supplyFlow.target.address;
}

await supplyFlow.submit({ txid: "<broadcast-txid>" });
```

For profile-based inflows, `action: "deposit"` and `action: "repayment"`
derive different targets. Use the `supplyFlow.target` returned by the exact
`client.lending.supply(...)` call for the action being executed. Do not use a
deposit flow, cached deposit address, or previous `supplyFlow.target` for a
repayment transfer.

`supply(...)` returns a receipt. When the SDK broadcast for you (wallet-adapter
path), `supplyFlow.txid` is populated. The SDK does not poll inflow status;
when you have a txid, you are responsible for polling confirmation state.

If the app wants the SDK to broadcast the transfer-path transaction, provide
`walletAdapter`, `account`, and `amount`:

```ts
const autoBroadcastFlow = await client.lending.supply({
  profileId,
  poolId,
  action: "deposit",
  chain: "BTC",
  amount: 100_000n,
  account: walletAddress,
  walletAdapter: {
    sendBtcTransaction: async ({ toAddress, amountSats }) =>
      wallet.sendBtcTransaction({ toAddress, amountSats }),
  },
});
```

ETH, USDC, and USDT pools default to the deposit-address transfer path. With an
ETH wallet adapter, the SDK sends native ETH value or an ERC-20 transfer
directly to the generated deposit address:

```ts
const supplyFlow = await client.lending.supply({
  profileId,
  poolId,
  action: "deposit",
  chain: "ETH",
  account: walletAddress,
  amount: 10_000_000n,
  walletAdapter: {
    sendEthTransaction: async ({ transaction }) =>
      wallet.sendTransaction(transaction),
  },
});
```

This default flow does not require `apiBaseUrl` or an EVM RPC. Use lower-level
`getEvmSupplyContext(...)` only if you are intentionally building the
contract-interaction flow.

#### ETH Deposit Addresses

Native ETH and ETH USDT/USDC deposit-address supply use the ETH deposit-address
canister directly. They do not require `apiBaseUrl` for target resolution.

For `Asset.ETH` with `chain: "ETH"`, transfer mode returns a generated EVM
deposit address and sends a normal ETH value transfer to it. Contract-interaction
mode calls the payable ckETH deposit helper with the amount as transaction value.
For `Asset.ETH` with `chain: "ICP"`, the asset is ckETH and the target is an ICRC
account. Use `sendIcrcTransfer`, just as for other ck-ledger routes. Native ETH
and ckETH both use 18 decimals and wei base units.

For transfer mode (`mechanism: "transfer"`, or omit it for the default), the SDK
resolves the deposit address by calling:

```ts
get_deposit_address(
  {
    owner: Principal.fromText(poolId),
    subaccount: [
      encodeInflowSubaccount({
        action,
        principal: Principal.fromText(profileId),
      }),
    ],
  },
  [tokenContractAddress]
);
```

Important details:

- `owner` is the selected pool principal (`poolId`)
- `subaccount` is encoded from the Liquidium `profileId` and inflow `action`
- `tokenContractAddress` is the ETH token contract address for USDT or USDC
- The SDK calls `get_deposit_address`
- The user's EVM wallet address is not used to derive the deposit address
- `apiBaseUrl` is not involved in this deposit-address lookup

If this returns `DEPOSIT_ADDRESS_ERROR: unauthorized`, do not diagnose it as a
missing API URL. Check that the selected pool principal is authorized by the ETH
deposit-address canister for the same deployment/environment.

For prod/mainnet, the SDK default ETH deposit-address canister is:
`z5jz7-nyaaa-aaaar-qb6pq-cai`.

When testing manually in the IC dashboard, use a pool principal from the same
deployment as the deposit-address canister.

Override the default route only when the app intentionally needs a specific
mechanism:

```ts
const contractInteractionFlow = await client.lending.supply({
  profileId,
  poolId,
  action: "deposit",
  chain: "ETH",
  mechanism: "contractInteraction",
  account: walletAddress,
  amount: 10_000_000n,
  walletAdapter: {
    sendEthTransaction: async ({ transaction }) =>
      wallet.sendTransaction(transaction),
  },
});
```

`mechanism: "transfer"` explicitly selects the transfer path; omitting it selects
the same default. `mechanism: "contractInteraction"` requires `apiBaseUrl`,
`account`, `amount`, and `sendEthTransaction`. USDC and USDT additionally require
`evmRpcUrl` or `evmPublicClient` for allowance and balance reads. Native ETH skips
ERC-20 reads and calls the payable deposit helper. Contract interaction is not
valid for ckETH because that route uses an ICRC transfer on `chain: "ICP"`.

## Common Mistakes

1. Treating profile lending as the default borrow flow. Use `client.simpleLoans.create(...)` for the accountless product flow unless the user explicitly asks for profiles.
2. Adding profile creation, signed borrow, or wallet adapter requirements to Simple Loans. `simpleLoans.create(...)` and `simpleLoans.get(...)` do not need them.
3. Confusing `quote.targetLtvBps` with Simple Loan `ltvMaxBps`. The quote target helps plan amounts; `ltvMaxBps` is validated by the Simple Loan LTV guards.
4. `new LiquidiumClient({})` uses the default Liquidium service configuration. Override `apiBaseUrl` for custom service deployments. USDC/USDT contract-interaction planning also needs `evmRpcUrl` or `evmPublicClient`; native ETH contract interaction does not. Default Ethereum deposit-address supply, `borrow(...)`, and `withdraw(...)` do not use the service configuration.
5. Prepare methods return signable actions, not completed actions. `prepareCreateProfile`, `prepareBorrow`, and `prepareWithdraw` still need signing and submission.
6. Build a wallet adapter with only the methods the selected flow needs. Avoid adding `signMessage`, `sendBtcTransaction`, `sendEthTransaction`, or `sendIcrcTransfer` unless the flow uses them.
7. Do not `await client.quote.getQuote(...)`; it is synchronous once pools and prices are available.
8. Check `quote.validationErrors` before enabling borrow execution. Quote validation failures are returned in-band rather than thrown.
9. `client.lending.supply(...)` routes from the selected pool, required `chain`, and optional `mechanism`. BTC supports `"BTC"`/`"ICP"`, ETH/USDC/USDT supports `"ETH"`/`"ICP"`, and ICP supports only `"ICP"`; contract interaction is available for native ETH, USDC, and USDT on `chain: "ETH"`.
10. Handle existing profiles explicitly when account creation can race with existing state. Do not rely on `prepareCreateProfile(...)` to reject an existing profile before signing.
11. Work from the public modules and names exported by `@liquidium/client`. Do not invent SDK methods.
12. After `borrow(...)`, treat `outflow.id` as the user-visible reference immediately. Do not assume `outflow.txid` is set on the first response; resolve it later via activities or history if you need the chain transaction id.
13. History entries use `txids?: string[]`; do not look for legacy direction-specific txid fields.
14. ETH deposit-address `unauthorized` is usually not an `apiBaseUrl` problem. The deposit-address lookup is a direct canister call. Check the `poolId`, `ethDeposit` canister ID, token address, and deployment/environment alignment first.
15. Do not model Simple Loans as a `lending.supply(...)` mechanism. Use `client.simpleLoans` for the accountless product flow and `client.lending.supply(...)` only for advanced profile-based supply/repay integrations.
16. Do not trust address lookup as canonical loan state. Use it to find candidates, then hydrate the selected loan through `simpleLoans.get(...)`.
17. Do not confuse deposit/supply targets with repayment targets. They are generated for different inflow actions and may be different addresses/accounts.
18. Do not render raw `rateDecimals = 27` fixed-point values as percentages. Format scaled rates first or the UI can show scientific notation such as `3.7e+24%`.
19. Do not model `loan.repayment` as nullable. Select the desired chain quote and check its `amount > 0n` before prompting repayment.
20. Do not use `"ckBTC"`, `"ckETH"`, `"ckUSDC"`, or `"ckUSDT"` as asset symbols. Pair the underlying asset with `chain: "ICP"`.
21. Do not assume `Pool.chain` is the user's transfer chain or derive deposit, borrow, and refund rails from one shared selection.
22. Do not use `mechanism: "contractInteraction"` for ckETH on `chain: "ICP"`. Use it only for native ETH, USDC, or USDT on `chain: "ETH"`.

## Preferred Style

- Keep examples minimal and app-shaped
- Use convenience methods for end-to-end app flows
- Use prepare/sign/submit flows when the user asks for signing control or custom wallet orchestration
- Reuse the app's existing wallet provider instead of adding a parallel wallet framework
- Preserve the app's state management and fetch patterns

## Defaults

- Prefer `client.simpleLoans.create(...)` for the simple accountless borrow UX
- Start with `new LiquidiumClient({})` for market reads and accountless `simpleLoans.create(...)`
- Override `apiBaseUrl` only when the app uses a custom Liquidium service deployment
- Add `evmRpcUrl` or `evmPublicClient` when the requested flow reads Ethereum chain state
- Use `chain: "BTC"`, `chain: "ETH"`, or `chain: "ICP"` as required by the selected Chain + Asset pair
- Prefer a quote-first flow for advanced profile-based borrowing
- Prefer the BTC payment address when the wallet exposes both ordinals and payment addresses

## Source Files

When unsure, check these first:

- `packages/client/README.md`
- `README.md`
- `packages/client/src/modules/simple-loans/simple-loans.ts`
- `packages/client/src/core/types.ts`
- `packages/client/src/core/accounts.ts`
- `packages/client/src/core/config.ts`
- `packages/client/src/core/wallet-actions.ts`
- `packages/client/src/core/pool-ledger-assets.ts`
- `packages/client/src/modules/history/types.ts`
- `packages/client/src/modules/simple-loans/types.ts`
- `packages/client/src/modules/lending/types.ts`
- `packages/client/src/modules/lending/_internal/supply-targets.ts`
- `packages/client/src/modules/quote/types.ts`
- `examples/simple-loans-flow/src/App.tsx`
- `examples/simple-loans-flow/src/sdk-example.ts`
- `examples/deposit-address-flow/src/dynamic-wallet.ts`
- `examples/deposit-address-flow/src/sdk-example.ts`
- `examples/contract-interaction-flow/src/dynamic-wallet.ts`
- `examples/contract-interaction-flow/src/sdk-example.ts`
- `examples/sdk-method-query/README.md`
- `examples/sdk-method-query/src/lib/client.ts`
- `examples/sdk-method-query/src/SdkMethodQueryPage.tsx`

## Useful Resources

- General Liquidium docs for context: https://liquidium.fi/docs
- SDK docs overview: https://liquidium.fi/docs/sdk
- GitHub repo: https://github.com/Liquidium-Inc/liquidium-sdk
- npm package: https://www.npmjs.com/package/@liquidium/client
- Open SDK Developer Docs: https://liquidium-inc.github.io/liquidium-sdk/
