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
3. Install dependencies from the SDK root:

```bash
pnpm install
```

4. Run the example:

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
history, quote, lending, and instant-loan methods:

- `history.getPoolHistory`
- `history.getPoolConfigHistory`
- `positions.getFullWithdrawAmount`
- `instantLoans.create`
- `instantLoans.get({ ref })`
- `instantLoans.get({ loanId })`
- `instantLoans.find`

`instantLoans.get(...)` returns current loan state plus generated targets,
initial deposit detection/expiry timestamps, position state, and the actionable
repayment amount.
