---
name: liquidium-sdk-integration
description: "Use this skill when working with the Liquidium TypeScript SDK, `@liquidium/client`, `LiquidiumClient`, wallet adapters, Liquidium profile creation, market data, quotes, borrowing, supply flows, positions, pending movements, or history. Use it whenever the user wants to integrate Liquidium into a TypeScript, React, or Vite app, or asks how to call Liquidium SDK methods correctly."
license: MIT
metadata:
  title: Liquidium SDK Integration
  category: TypeScript SDK
---

# Liquidium SDK Integration

## What This Is

`@liquidium/client` is the TypeScript SDK for reading Liquidium market and position data and executing account and lending flows.

The main entry point is `LiquidiumClient.create(config)`. The client exposes these modules:

- `accounts`
- `lending`
- `positions`
- `market`
- `pending`
- `history`
- `quote`

Prefer this skill when the task is about integrating the SDK into app code, wiring wallet execution, or choosing the correct SDK flow.

## How To Work

1. Start by checking whether the project already uses `@liquidium/client`.
2. Create a client with the smallest config that supports the requested flow.
3. Use read-only modules first to build context for the user flow.
4. For signing or transaction execution, determine whether the flow needs a `WalletAdapter`.
5. Prefer the SDK convenience methods unless the user explicitly wants raw prepare/sign/submit control.
6. Keep the integration close to the app's existing wallet and state patterns instead of introducing a new abstraction layer.

## Client Setup

Basic setup:

```ts
import { LiquidiumClient } from "@liquidium/client";

const client = LiquidiumClient.create({});
```

Use richer config only when the flow requires it:

```ts
import { LiquidiumClient } from "@liquidium/client";

const client = LiquidiumClient.create({
  environment: "mainnet",
  apiBaseUrl: "https://your-app.example.com/api/sdk",
  timeoutMs: 30_000,
});
```

### When Config Matters

- `environment`: choose the canister preset, usually `mainnet` or `staging`
- `apiBaseUrl`: required for history, pending movements, inflow reporting, inflow status polling, and backend-assisted lending flows
- `identity` / `icHost`: only needed when the app needs custom ICP agent configuration
- `supplyStatusPollIntervalMs`: use only when the app needs a different supply polling interval

## Module Guide

### `market`

Use for pool discovery and asset prices.

Common methods:

- `client.market.getPools()`
- `client.market.findPool({ asset, chain })`
- `client.market.getAssetPrices()`

### `quote`

Use for quote-first UX. In most borrow flows, fetch pools and prices first, then call `quote` before preparing the borrow.

```ts
const pools = await client.market.getPools();
const prices = await client.market.getAssetPrices();
const quote = await client.quote.quote(request, pools, prices);
```

### `accounts`

Use for Liquidium profile creation and resolution.

- `prepareCreate(...)`: returns a signable action
- `create(...)`: signs and submits through a wallet adapter
- `resolveProfile(walletAddress)`: find an existing profile id

### `lending`

Use for borrow, withdraw, supply, repay, inflow reporting, and supply tracking.

- `prepareBorrow(...)` and `prepareWithdraw(...)`: return signable actions
- `borrow(...)` and `withdraw(...)`: convenience execution methods
- `supply(...)`: returns a tracked supply flow
- `submitInflow(...)` and `getInflowStatus(...)`: require `apiBaseUrl`

### `positions`

Use for existing profile state.

- `client.positions.list(profileId)`
- `client.positions.getHealthFactor(profileId)`
- `client.positions.getUserStats(profileId)`

### `pending`

Use for pending inflows and outflows. This depends on `apiBaseUrl`.

### `history`

Use for user or pool history. This depends on `apiBaseUrl`.

## Wallet Adapter Rules

The SDK uses a `WalletAdapter` for signing and transaction execution.

Only implement the methods the selected flow needs.

```ts
import type { WalletAdapter } from "@liquidium/client";

const walletAdapter: WalletAdapter = {
  signMessage: async ({ message }) => wallet.signMessage(message),
  sendEthTransaction: async ({ transaction }) => wallet.sendTransaction(transaction),
};
```

### Method Selection

- `signMessage`: required for account creation, borrow, and withdraw flows that sign a Liquidium message
- `sendBtcTransaction`: used for BTC native-address supply automation
- `sendEthTransaction`: used for ETH stablecoin supply and repayment automation

Do not add all adapter methods by default. Add only the methods the requested flow actually needs.

## Common Flows

### Create a profile

Use the convenience method when the app already has wallet signing wired:

```ts
const profileId = await client.accounts.create({
  account: walletAddress,
  chain: "ETH",
  walletAdapter: {
    signMessage: async ({ message }) => wallet.signMessage(message),
  },
});
```

Use the prepare flow when the user wants explicit control over signing:

```ts
const createAction = await client.accounts.prepareCreate({
  account: walletAddress,
});

const signature = await wallet.signMessage(createAction.message);

const profileId = await createAction.submit({
  signature,
  chain: "ETH",
  account: walletAddress,
});
```

If the profile may already exist, resolve it after catching the profile-exists error instead of retrying the create flow blindly.

### Read market data and positions

```ts
const pools = await client.market.getPools();
const prices = await client.market.getAssetPrices();
const positions = await client.positions.list(profileId);
const healthFactor = await client.positions.getHealthFactor(profileId);
```

### Quote-first borrow flow

```ts
const pools = await client.market.getPools();
const prices = await client.market.getAssetPrices();

const quote = await client.quote.quote(request, pools, prices);

const outflow = await client.lending.borrow({
  profileId,
  poolId: quote.poolId,
  amount: quote.amount,
  receiverAddress,
  signerWalletAddress: walletAddress,
  signerChain: "ETH",
  signerWalletAdapter: {
    signMessage: async ({ message }) => wallet.signMessage(message),
  },
});
```

When building product UX, prefer quote-first borrowing because it matches how the example app guides the user through pool selection and amount validation.

### BTC supply flow

For the standard BTC path, use `destination: "nativeAddress"`.

```ts
const supplyFlow = await client.lending.supply({
  profileId,
  poolId,
  action: "deposit",
  destination: "nativeAddress",
});

const depositAddress =
  supplyFlow.target.type === "nativeAddress"
    ? supplyFlow.target.address
    : undefined;

await supplyFlow.submit({ txid: "<broadcast-txid>" });

for await (const update of supplyFlow.watchStatus()) {
  if (update.isAvailable) {
    break;
  }
}
```

If the app can broadcast BTC directly, provide `btcWalletAdapter` and the amount/account fields required by that path.

### ETH stablecoin supply flow

Use this when the pool is an ETH stablecoin pool and the backend is planning approvals and execution.

```ts
const supplyFlow = await client.lending.supply({
  profileId,
  poolId,
  action: "deposit",
  destination: "icrcAccount",
  ethAccount: walletAddress,
  ethAmount: 10_000_000n,
  ethWalletAdapter: {
    sendEthTransaction: async ({ transaction }) => wallet.sendTransaction(transaction),
  },
});
```

This flow depends on `apiBaseUrl` because the SDK needs backend approval planning.

## Pitfalls

1. Do not assume `LiquidiumClient.create({})` is enough for every method. `history`, `pending`, inflow reporting, inflow status polling, and some lending flows require `apiBaseUrl`.
2. Do not confuse prepare methods with completed actions. `prepareCreate`, `prepareBorrow`, and `prepareWithdraw` return signable actions that still need signing and submission.
3. Do not build a wallet adapter with unrelated methods. Add only `signMessage`, `sendBtcTransaction`, or `sendEthTransaction` when the selected flow needs them.
4. Do not skip the quote step in borrow UX unless the user explicitly wants a lower-level flow.
5. Do not treat BTC and ETH supply paths as interchangeable. BTC native supply and ETH stablecoin supply need different request fields and different wallet execution methods.
6. Do not hide profile resolution edge cases. If account creation can race with existing state, handle the existing-profile path explicitly.
7. Do not invent SDK methods. Work from the public modules and names exported by `@liquidium/client`.

## Preferred Integration Style

- Keep examples minimal and app-shaped
- Use convenience methods for end-to-end app flows
- Use prepare/sign/submit flows when the user asks for signing control or custom wallet orchestration
- Reuse the app's existing wallet provider instead of adding a parallel wallet framework
- Preserve the app's state management and fetch patterns

## Good Defaults

- Start with `LiquidiumClient.create({})` for read-only market and position work
- Add `apiBaseUrl` when the requested flow touches backend-assisted endpoints
- Use `chain: "ETH"` or `chain: "BTC"` exactly as required by the SDK
- Prefer a quote-first borrow flow
- Prefer the BTC payment address when the wallet exposes both ordinals and payment addresses

## Source Guidance

When unsure, ground the implementation in these repo sources first:

- `packages/client/README.md`
- `README.md`
- `examples/vite-react-dynamic/README.md`
- `examples/vite-react-dynamic/src/liquidium-client-sdk.ts`
- `examples/vite-react-dynamic/src/wallet-signing.ts`

Use those files to stay aligned with the current public API and the intended integration patterns.
