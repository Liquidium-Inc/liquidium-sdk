---
name: liquidium-sdk-integration
description: "Use this skill when working with the Liquidium TypeScript SDK, `@liquidium/client`, `LiquidiumClient`, wallet adapters, instant loans, Liquidium profile creation, market data, quotes, borrowing, supply flows, positions, activities, or history. Use it whenever the user wants to integrate Liquidium into a TypeScript, React, or Vite app, or asks how to call Liquidium SDK methods correctly."
license: MIT
metadata:
  title: Liquidium SDK Integration
  category: TypeScript SDK
---

# Liquidium SDK Integration

`@liquidium/client` reads Liquidium market and position data, then executes accountless instant loans and advanced profile-based lending flows.

Priority: use `client.instantLoans` first, deposit-address profile flows second, and ETH contract interaction only when explicitly needed.

## Modules

```ts
import { LiquidiumClient } from "@liquidium/client";

const client = LiquidiumClient.create({});
```

The client exposes: `instantLoans`, `accounts`, `lending`, `positions`, `market`, `activities`, `history`, `quote`.

## Setup

Minimal config:

```ts
const client = LiquidiumClient.create({});
```

Richer config when the flow requires it:

```ts
const client = LiquidiumClient.create({
  environment: "mainnet",
  apiBaseUrl: "https://your-app.example.com/api/sdk",
  evmRpcUrl: "https://mainnet.infura.io/v3/<key>",
  timeoutMs: 30_000,
});
```

**Config requirements:**

- `environment`: sets the canister preset. Only `mainnet` is bundled; pass `canisterIds` explicitly for custom deployments
- `apiBaseUrl`: required for history, activities, and inflow reporting. Not required for `borrow(...)`, `withdraw(...)`, or default ETH stablecoin deposit-address supply/repay targets
- `apiBaseUrl`: also required for `instantLoans.findByAddress(...)`. It is not required for `instantLoans.create(...)` or `instantLoans.get(...)`
- `evmRpcUrl` / `evmPublicClient`: required for lower-level ETH contract-interaction supply planning and allowance polling. Use `evmRpcHeaders` when the RPC provider authenticates with HTTP headers
- `identity` / `icHost`: custom ICP agent configuration
- `canisterIds.instantLoans`: defaults to mainnet `qdt2k-xqaaa-aaaae-qkapq-cai`; override it for custom deployments

Missing `apiBaseUrl` is a client configuration problem. Methods that require it
throw `LiquidiumErrorCode.VALIDATION_ERROR`, not `SERVICE_UNAVAILABLE`.

For Vite example apps, expose the RPC URL through a `VITE_` variable. If using
Infura, prefer `VITE_INFURA_API_KEY` and derive the URL in app config:

```ts
const evmRpcUrl = import.meta.env.VITE_INFURA_API_KEY
  ? `https://mainnet.infura.io/v3/${import.meta.env.VITE_INFURA_API_KEY}`
  : import.meta.env.VITE_EVM_RPC_URL;
```

Vite env vars are bundled client-side. Treat Infura browser keys as publishable
or route RPC calls through a server if the key must remain private.

## Module Guide

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

### quote

Quote-first UX. In borrow flows, fetch pools and prices first, then call `quote` before preparing the borrow.

```ts
const pools = await client.market.listPools();
const prices = await client.market.getAssetPrices();
const quote = client.quote.getQuote(request, pools, prices);
```

`getQuote(...)` is synchronous and pure after the app has already fetched pools
and prices. It returns `validationErrors` and `warnings`; it does not throw for
normal quote validation failures such as missing pools, missing prices, invalid
LTV, too-small borrow amounts, or disallowed same-asset borrowing. Treat a quote
with validation errors as non-executable.

### accounts

Profile creation and resolution.

```ts
client.accounts.prepareCreateProfile(...);  // returns a signable action
client.accounts.createProfile(...);         // signs and submits through a wallet adapter
client.accounts.getProfileId(walletAddress);
client.accounts.listLinkedWallets(profileId);
```

### lending

Advanced profile-based borrow, withdraw, supply, repay, inflow reporting, and supply tracking. Do not use this as the default borrow UX; most apps should start with `client.instantLoans`.

```ts
client.lending.prepareBorrow(...);
client.lending.prepareWithdraw(...);
client.lending.borrow(...);
client.lending.withdraw(...);
client.lending.supply(...);
client.lending.estimateInflowFee({ asset: "USDT", chain: "ETH" });
client.lending.submitInflow({ txid, chain: "BTC", type: "DEPOSIT" }); // requires apiBaseUrl
```

### instantLoans

Accountless instant loans. This is the default simple borrow UX: create a
loan, show the generated collateral deposit address, and let the protocol
borrow to the selected destination after the deposit confirms.

```ts
client.instantLoans.create(...);
client.instantLoans.get({ shortRef });
client.instantLoans.get({ loanId });
client.instantLoans.findByAddress(address); // requires apiBaseUrl
```

`create(...)` and `get(...)` are canister-first. The SDK derives deposit and
repay targets internally from the generated `lending_profile`.
`findByAddress(...)` is a backend-assisted recovery helper and returns
candidates only.

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
```

### activities

Receipt status and active/completed activity lists. Requires `apiBaseUrl`.

```ts
client.activities.list({ profileId, state: "active" });
client.activities.getStatus({ profileId, id });
```

### history

User or pool history. Requires `apiBaseUrl`.

```ts
client.history.getUserTransactionHistory(profileId, filters?);
client.history.getLiquidationHistory(profileId, filters?);
client.history.getPoolHistory(poolId, cursor?);
client.history.getBorrowRateHistory(poolId, window?);
```

User history entries expose `txids?: string[]`; do not expect separate inbound
or outbound txid fields. Pool history entries are reserve configuration-change
snapshots (`type: "configuration_change"`) with pool config, caps, indexes,
liquidity, debt, and `sameAssetBorrowing` fields.

## Wallet Adapter

The SDK uses a `WalletAdapter` for signing and transaction execution. Implement only the methods the selected flow needs.

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

## Flows

### Instant loan default flow

Use `client.instantLoans.create(...)` when the user should not create or manage
a Liquidium profile. The user supplies destination addresses, receives a short
loan ID, then sends collateral to the generated deposit address.

```ts
const loan = await client.instantLoans.create({
  collateralPoolId: btcPool.id,
  borrowPoolId: usdtPool.id,
  collateralAsset: "BTC",
  borrowAsset: "USDT",
  collateralAmount: 10_000_000n,
  minBorrowAmount: 2_000_000n,
  targetLtvBps: 3_000n,
  depositWindowSeconds: 3_600n,
  borrowDestination: "0x2222222222222222222222222222222222222222",
  refundDestination: "bc1qrefunddestination",
});

const shortRef = loan.shortRef;
const depositTarget = loan.depositTarget;
const repayTarget = loan.repayTarget;
```

If the target is a native address, show `target.address`. If it is an ICRC
account, show `target.account`.

```ts
const depositAddress =
  depositTarget.type === "nativeAddress"
    ? depositTarget.address
    : depositTarget.account;
```

Restore a loan by `shortRef` whenever possible:

```ts
const loan = await client.instantLoans.get({ shortRef: "8Y9AQQ" });
```

Use address lookup only as recovery when the user lost the short ref:

```ts
const candidates = await client.instantLoans.findByAddress(
  "bc1qrefunddestination"
);

const loan = await client.instantLoans.get({
  loanId: candidates[0].loanId,
});
```

Short ref lookup is canonical: the SDK decodes the short ref locally and queries
the instant-loans canister. Address lookup is discovery only: it requires
`apiBaseUrl`, may return multiple candidates, and should be followed by
`get({ loanId })` or `get({ shortRef })`.

Do not use `client.lending.borrow(...)` for this flow. `lending.borrow(...)` is
the profile-based signed borrow primitive. Instant loans automate the borrow
after collateral arrives.

### Create a profile

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

### Quote-first borrow

```ts
const pools = await client.market.listPools();
const prices = await client.market.getAssetPrices();

const quote = client.quote.getQuote(request, pools, prices);

const outflow = await client.lending.borrow({
  profileId,
  poolId: quote.borrowPoolId,
  amount: quote.borrowAmount,
  receiverAddress,
  signerWalletAddress: walletAddress,
  signerChain: "ETH",
  signerWalletAdapter: {
    signMessage: async ({ message }) => wallet.signMessage(message),
  },
});

// `outflow.id` is the outflow reference assigned by the canister. `outflow.txid`
// may be null until the canister broadcasts the on-chain transaction. The SDK
// does not poll for the txid; consumers should display `outflow.id` immediately
// and resolve the txid separately if needed.
```

### Advanced profile-based supply flow

Use this only for profile-based integrations that intentionally manage Liquidium
profiles. Use `client.instantLoans` for the default accountless borrow UX.

```ts
const supplyFlow = await client.lending.supply({
  profileId,
  poolId,
  action: "deposit",
});

if (
  supplyFlow.type === "transfer" &&
  supplyFlow.target.type === "nativeAddress"
) {
  const depositAddress = supplyFlow.target.address;
}

await supplyFlow.submit({ txid: "<broadcast-txid>" });
```

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
  amount: 100_000n,
  account: walletAddress,
  walletAdapter: {
    sendBtcTransaction: async ({ toAddress, amountSats }) =>
      wallet.sendBtcTransaction({ toAddress, amountSats }),
  },
});
```

ETH stablecoin pools default to the deposit-address transfer path. With an ETH
wallet adapter, the SDK sends an ERC-20 transfer directly to the generated
deposit address:

```ts
const supplyFlow = await client.lending.supply({
  profileId,
  poolId,
  action: "deposit",
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

#### ETH Stablecoin Deposit Addresses

ETH USDT/USDC deposit-address supply uses the ETH deposit-address canister
directly. It does not require `apiBaseUrl` for target resolution.

For `mechanism: "transfer"`, the SDK resolves the deposit address by calling:

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
  mechanism: "contractInteraction",
  account: walletAddress,
  amount: 10_000_000n,
  walletAdapter: {
    sendEthTransaction: async ({ transaction }) =>
      wallet.sendTransaction(transaction),
  },
});
```

`mechanism: "transfer"` keeps the deposit-address path explicit. `mechanism: "contractInteraction"` requires `apiBaseUrl`, `evmRpcUrl` or `evmPublicClient`, `account`, `amount`, and `sendEthTransaction`.

## Common Mistakes

1. `LiquidiumClient.create({})` does not cover every method. History, activities, and inflow reporting need `apiBaseUrl`; lower-level contract-interaction planning also needs `evmRpcUrl` or `evmPublicClient`. Default ETH stablecoin deposit-address supply, `borrow(...)`, and `withdraw(...)` do not.
2. Prepare methods return signable actions, not completed actions. `prepareCreateProfile`, `prepareBorrow`, and `prepareWithdraw` still need signing and submission.
3. Build a wallet adapter with only the methods the selected flow needs. Avoid adding `signMessage`, `sendBtcTransaction`, or `sendEthTransaction` unless the flow uses them.
4. Skip the quote step in borrow UX only when you explicitly want a lower-level flow.
5. Do not `await client.quote.getQuote(...)`; it is synchronous once pools and prices are available.
6. Check `quote.validationErrors` before enabling borrow execution. Quote validation failures are returned in-band rather than thrown.
7. `client.lending.supply(...)` auto-routes by pool. BTC and ETH USDT pools currently resolve to deposit-address transfer targets by default; use `mechanism` only when intentionally overriding that route.
8. Handle existing profiles explicitly when account creation can race with existing state. Do not rely on `prepareCreateProfile(...)` to reject an existing profile before signing.
9. Work from the public modules and names exported by `@liquidium/client`. Do not invent SDK methods.
10. After `borrow(...)`, treat `outflow.id` as the user-visible reference immediately. Do not assume `outflow.txid` is set on the first response; resolve it later via activities or history if you need the chain transaction id.
11. History entries use `txids?: string[]`; do not look for legacy direction-specific txid fields.
12. ETH deposit-address `unauthorized` is usually not an `apiBaseUrl` problem. The deposit-address lookup is a direct canister call. Check the `poolId`, `ethDeposit` canister ID, token address, and deployment/environment alignment first.
13. Do not model instant loans as a `lending.supply(...)` mechanism. Use `client.instantLoans` for the accountless product flow and `client.lending.supply(...)` only for advanced profile-based supply/repay integrations.
14. Do not trust address lookup as canonical loan state. Use it to find candidates, then hydrate the selected loan through `instantLoans.get(...)`.

## Preferred Style

- Keep examples minimal and app-shaped
- Use convenience methods for end-to-end app flows
- Use prepare/sign/submit flows when the user asks for signing control or custom wallet orchestration
- Reuse the app's existing wallet provider instead of adding a parallel wallet framework
- Preserve the app's state management and fetch patterns

## Defaults

- Start with `LiquidiumClient.create({})` for read-only market and position work
- Add `apiBaseUrl` when the requested flow touches backend-assisted endpoints
- Add `evmRpcUrl` or `evmPublicClient` when the requested flow reads Ethereum chain state
- Use `chain: "ETH"` or `chain: "BTC"` exactly as required by the SDK
- Prefer `client.instantLoans.create(...)` for the simple accountless borrow UX
- Prefer a quote-first flow for advanced profile-based borrowing
- Prefer the BTC payment address when the wallet exposes both ordinals and payment addresses

## Source Files

When unsure, check these first:

- `packages/client/README.md`
- `README.md`
- `packages/client/src/modules/history/types.ts`
- `packages/client/src/modules/instant-loans/types.ts`
- `packages/client/src/modules/lending/types.ts`
- `packages/client/src/modules/quote/types.ts`
- `examples/vite-react-dynamic/README.md`
- `examples/vite-react-dynamic/src/lib/client.ts`
- `examples/vite-react-dynamic/src/lib/profile.ts`
- `examples/vite-react-dynamic/src/wallet-signing.ts`
