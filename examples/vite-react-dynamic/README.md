# Vite React Dynamic Example

This example is intentionally small.

It shows one clear happy path for using `@liquidium/client` in a Vite React app
with Dynamic:

- Connect an Ethereum or Bitcoin wallet with Dynamic
- Create or resolve a Liquidium profile
- Load pools
- Borrow from a pool with `client.lending.borrow(...)`
- Start a BTC supply flow with `client.lending.supply(...)`

The goal is to make the first SDK integration obvious without extra playgrounds,
page switching, or layered demo flows.

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

- `src/App.tsx` is the full example UI
- `src/liquidium-client-sdk.ts` is the thin helper layer around the SDK
- `src/wallet-signing.ts` adapts Dynamic wallets to the SDK signing flow

## Notes

- The example uses direct SDK convenience methods instead of a prepare/execute
  walkthrough
- BTC supply currently uses `destination: "nativeAddress"`
- For Bitcoin wallets, the example prefers the payment address when available
