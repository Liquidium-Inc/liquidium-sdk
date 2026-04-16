# Vite React Dynamic Example

This example is intentionally small.

It shows one clear happy path for using `@liquidium/client` in a Vite React app
with Dynamic:

- Connect an Ethereum or Bitcoin wallet with Dynamic
- Create or resolve a Liquidium profile
- Load pools and prices
- Generate a quote with `client.quote.quote(...)`
- Borrow from the quoted pool with `client.lending.borrow(...)` and display the instant receipt (txid may resolve later)
- Start a supply flow with `client.lending.supply(...)` and let the SDK resolve the mechanism

The goal is to make the first SDK integration obvious, while also including an
SDK method query page for raw response inspection.

## Setup

1. Copy `.env.example` to `.env`
2. Set `VITE_DYNAMIC_ENVIRONMENT_ID` from your Dynamic dashboard
3. Set `VITE_LIQUIDIUM_BASE_URL` to the app host. The example defaults to
   `http://localhost:3000` and derives the SDK API URL as `/api/sdk` from it.
   - If you need a fully custom SDK endpoint, set
     `VITE_LIQUIDIUM_API_BASE_URL` instead.
4. Install dependencies from the SDK root:

```bash
pnpm install
```

5. Run the example:

```bash
pnpm --filter @liquidium/example-vite-react-dynamic dev
```

## What To Look At

- `src/App.tsx` is the borrow-focused page with quote-first borrow, position reads, and history
- `src/SupplyPage.tsx` is the unified supply page for supported BTC and ETH supply pools
- `src/SdkMethodQueryPage.tsx` lets you execute every public SDK method by
  passing JSON args and viewing raw results
- `src/Root.tsx` handles page switching between the borrow, supply, and SDK query pages
- `src/liquidium-client-sdk.ts` is the thin helper layer around the SDK
- `src/wallet-signing.ts` adapts Dynamic wallets to the SDK signing flow

## Notes

- The example uses direct SDK convenience methods instead of a prepare/execute
  walkthrough
- The borrow flow is intentionally quote-first so it mirrors the sats terminal
  interaction model
- The supply page demonstrates the unified `supply()` API and lets the pool pick the transfer or contract-interaction path
- For Bitcoin wallets, the example prefers the payment address when available
