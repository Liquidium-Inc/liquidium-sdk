# SDK Method Query Example

Use this example to call `@liquidium/client` methods from a Vite React app with Dynamic loaded.

The SDK method query screen lets you:

- Pick an SDK method from a dropdown
- Edit JSON arguments
- Apply connected-wallet defaults where relevant
- Run the method and inspect the return payload

## Setup

1. Copy `.env.example` to `.env`
2. Set `VITE_INFURA_API_KEY` for ETH reads that need an RPC provider.
   Alternatively, set `VITE_EVM_RPC_URL` to a full Ethereum mainnet RPC URL.
3. For SOL methods, set `VITE_LIQUIDIUM_SOL_POOL_ID` to the active SOL pool and
   `VITE_LIQUIDIUM_API_BASE_URL` to an SDK API deployment that serves it.
4. Install dependencies from the SDK root:

```bash
pnpm install
```

5. Run the example:

```bash
pnpm --filter @liquidium/example-sdk-method-query dev
```

## What To Look At

- `src/SdkMethodQueryPage.tsx`: method definitions, JSON templates, argument
  validation, and raw result rendering
- `src/Root.tsx`: mounts the single SDK method query page
- `src/lib/client.ts`: creates a `LiquidiumClient` from runtime config
- `src/liquidium-runtime-config.ts`: environment-driven client config

## Included Method Templates

The query page includes templates for account, market, position, activity,
history, quote, lending, and Simple Loans methods:

- `history.getUserTransactionHistory`
- `history.getLiquidationHistory`
- `history.getProtocolActivity`
- `positions.getFullWithdrawAmount`
- `simpleLoans.create`
- `simpleLoans.get({ ref })`
- `simpleLoans.get({ loanId })`
- `simpleLoans.find`

`simpleLoans.get(...)` returns current loan state plus generated targets,
initial deposit detection/expiry timestamps, position state, and the actionable
repayment amount.

Asset arguments accept `"ETH"` with `chain: "ETH"` for native ETH and `chain: "ICP"` for ckETH. Both routes use 18-decimal wei amounts. Native ETH supply supports a deposit-address value transfer with `mechanism: "transfer"` and a payable helper call with `mechanism: "contractInteraction"`; ckETH uses ICRC.
