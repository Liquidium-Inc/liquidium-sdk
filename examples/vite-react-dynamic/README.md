# Vite React SDK Method Query Example

This example is a focused developer tool for calling `@liquidium/client` methods
from a Vite React app with Dynamic loaded.

It provides a single SDK method query screen where you can:

- Pick an SDK method from a dropdown
- Edit JSON arguments directly
- Apply connected-wallet defaults where relevant
- Run the method and inspect the raw return payload

## Setup

1. Copy `.env.example` to `.env`
2. Set `VITE_DYNAMIC_ENVIRONMENT_ID` from your Dynamic dashboard
3. Set `VITE_LIQUIDIUM_BASE_URL` to the Liquidium SDK API base URL. The example
   defaults to `https://app.liquidium.fi/api/sdk`.
4. Set `VITE_INFURA_API_KEY` for ETH reads that need an RPC provider.
   Alternatively, set `VITE_EVM_RPC_URL` to a full Ethereum mainnet RPC URL.
5. Install dependencies from the SDK root:

```bash
pnpm install
```

6. Run the example:

```bash
pnpm --filter @liquidium/example-vite-react-dynamic dev
```

## What To Look At

- `src/SdkMethodQueryPage.tsx` — method definitions, JSON templates, argument
  validation, and raw result rendering
- `src/Root.tsx` — mounts the single SDK method query page
- `src/lib/client.ts` — creates a `LiquidiumClient` from runtime config
- `src/liquidium-runtime-config.ts` — environment-driven client config

## Included Method Templates

The query page includes templates for account, market, position, activity,
history, quote, lending, and instant-loan methods, including:

- `history.getPoolHistory`
- `history.getPoolConfigHistory`
- `instantLoans.create`
- `instantLoans.get({ ref })`
- `instantLoans.get({ loanId })`
- `instantLoans.findByAddress`

`instantLoans.get(...)` returns canister loan state plus generated targets,
current position state, and the actionable repayment amount.
