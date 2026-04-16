---
name: liquidium-sdk-integration
description: "Use this skill when working with the Liquidium TypeScript SDK, `@liquidium/client`, `LiquidiumClient`, wallet adapters, Liquidium profile creation, market data, quotes, borrowing, supply flows, positions, pending movements, or history. Use it whenever the user wants to integrate Liquidium into a TypeScript, React, or Vite app, or asks how to call Liquidium SDK methods correctly."
license: MIT
metadata:
  title: Liquidium SDK Integration
  category: TypeScript SDK
---

# Liquidium SDK Integration

`@liquidium/client` reads Liquidium market and position data, then executes account and lending flows.

## Modules

```ts
import { LiquidiumClient } from "@liquidium/client";

const client = LiquidiumClient.create({});
```

The client exposes: `accounts`, `lending`, `positions`, `market`, `pending`, `history`, `quote`.

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
  timeoutMs: 30_000,
});
```

**Config requirements:**
- `environment`: sets the canister preset (`mainnet` or `staging`)
- `apiBaseUrl`: required for history, pending movements, inflow reporting, inflow status polling, and backend-assisted lending flows
- `identity` / `icHost`: custom ICP agent configuration
- `supplyStatusPollIntervalMs`: custom supply polling interval

## Module Guide

### market

Pool discovery and asset prices.

```ts
client.market.getPools();
client.market.findPool({ asset, chain });
client.market.getAssetPrices();
```

### quote

Quote-first UX. In borrow flows, fetch pools and prices first, then call `quote` before preparing the borrow.

```ts
const pools = await client.market.getPools();
const prices = await client.market.getAssetPrices();
const quote = await client.quote.quote(request, pools, prices);
```

### accounts

Profile creation and resolution.

```ts
client.accounts.prepareCreate(...);  // returns a signable action
client.accounts.create(...);          // signs and submits through a wallet adapter
client.accounts.resolveProfile(walletAddress);
```

### lending

Borrow, withdraw, supply, repay, inflow reporting, and supply tracking.

```ts
client.lending.prepareBorrow(...);
client.lending.prepareWithdraw(...);
client.lending.borrow(...);
client.lending.withdraw(...);
client.lending.supply(...);
client.lending.submitInflow(...);    // requires apiBaseUrl
client.lending.getInflowStatus(...); // requires apiBaseUrl
```

### positions

Existing profile state.

```ts
client.positions.list(profileId);
client.positions.getHealthFactor(profileId);
client.positions.getUserStats(profileId);
```

### pending

Pending inflows and outflows. Requires `apiBaseUrl`.

### history

User or pool history. Requires `apiBaseUrl`.

## Wallet Adapter

The SDK uses a `WalletAdapter` for signing and transaction execution. Implement only the methods the selected flow needs.

```ts
import type { WalletAdapter } from "@liquidium/client";

const walletAdapter: WalletAdapter = {
  signMessage: async ({ message }) => wallet.signMessage(message),
  sendEthTransaction: async ({ transaction }) => wallet.sendTransaction(transaction),
};
```

**Method selection:**
- `signMessage`: account creation, borrow, and withdraw flows (signs a Liquidium message)
- `sendBtcTransaction`: transfer-path supply automation for BTC targets
- `sendEthTransaction`: transfer-path automation for ETH targets and contract-interaction supply automation

## Flows

### Create a profile

Convenience method when the app already has wallet signing wired:
```ts
const profileId = await client.accounts.create({
  account: walletAddress,
  chain: "ETH",
  walletAdapter: {
    signMessage: async ({ message }) => wallet.signMessage(message),
  },
});
```

Prepare flow when you want explicit control over signing:
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

Handle existing profiles by catching the profile-exists error and resolving instead of retrying the create flow.

### Read market data and positions

```ts
const pools = await client.market.getPools();
const prices = await client.market.getAssetPrices();
const positions = await client.positions.list(profileId);
const healthFactor = await client.positions.getHealthFactor(profileId);
```

### Quote-first borrow

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

// `outflow.id` is the outflow reference assigned by the canister. `outflow.txid`
// may be null until the canister broadcasts the on-chain transaction. The SDK
// does not poll for the txid; consumers should display `outflow.id` immediately
// and resolve the txid separately if needed.
```

### Unified supply flow

```ts
const supplyFlow = await client.lending.supply({
  profileId,
  poolId,
  action: "deposit",
});

if (supplyFlow.type === "transfer" && supplyFlow.target.type === "nativeAddress") {
  const depositAddress = supplyFlow.target.address;
}

await supplyFlow.submit({ txid: "<broadcast-txid>" });

for await (const update of supplyFlow.watchStatus()) {
  if (update.isAvailable) {
    break;
  }
}
```

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

When the selected pool resolves to the contract-interaction path, the same
`supply(...)` call auto-routes there:

```ts
const supplyFlow = await client.lending.supply({
  profileId,
  poolId,
  action: "deposit",
  account: walletAddress,
  amount: 10_000_000n,
  walletAdapter: {
    sendEthTransaction: async ({ transaction }) => wallet.sendTransaction(transaction),
  },
});
```

This flow requires `apiBaseUrl` because the SDK needs backend approval planning.

## Common Mistakes

1. `LiquidiumClient.create({})` does not cover every method. History, pending, inflow reporting, inflow status polling, and some lending flows need `apiBaseUrl`.
2. Prepare methods return signable actions, not completed actions. `prepareCreate`, `prepareBorrow`, and `prepareWithdraw` still need signing and submission.
3. Build a wallet adapter with only the methods the selected flow needs. Avoid adding `signMessage`, `sendBtcTransaction`, or `sendEthTransaction` unless the flow uses them.
4. Skip the quote step in borrow UX only when you explicitly want a lower-level flow.
5. `client.lending.supply(...)` auto-routes by pool. BTC currently resolves to the transfer path, while ETH stablecoin pools resolve to the contract-interaction path.
6. Handle existing profiles explicitly when account creation can race with existing state.
7. Work from the public modules and names exported by `@liquidium/client`. Do not invent SDK methods.

## Preferred Style

- Keep examples minimal and app-shaped
- Use convenience methods for end-to-end app flows
- Use prepare/sign/submit flows when the user asks for signing control or custom wallet orchestration
- Reuse the app's existing wallet provider instead of adding a parallel wallet framework
- Preserve the app's state management and fetch patterns

## Defaults

- Start with `LiquidiumClient.create({})` for read-only market and position work
- Add `apiBaseUrl` when the requested flow touches backend-assisted endpoints
- Use `chain: "ETH"` or `chain: "BTC"` exactly as required by the SDK
- Prefer a quote-first borrow flow
- Prefer the BTC payment address when the wallet exposes both ordinals and payment addresses

## Source Files

When unsure, check these first:

- `packages/client/README.md`
- `README.md`
- `examples/vite-react-dynamic/README.md`
- `examples/vite-react-dynamic/src/liquidium-client-sdk.ts`
- `examples/vite-react-dynamic/src/wallet-signing.ts`