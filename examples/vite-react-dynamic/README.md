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

The example calls `@liquidium/client` directly from each page. The only
non-SDK code is small, focused helpers under `src/lib/` and wallet glue for
Dynamic.

- `src/App.tsx` — borrow page: quote-first borrow, position reads, history
- `src/SupplyPage.tsx` — unified supply page for BTC and ETH stablecoin pools
- `src/SdkMethodQueryPage.tsx` — developer tool to run any SDK method with raw
  JSON args and inspect the raw response
- `src/Root.tsx` — simple hash-based page switcher
- `src/lib/client.ts` — one-liner factory that builds a `LiquidiumClient`
- `src/lib/profile.ts` — `createOrResolveProfile()` helper that handles the
  "profile already exists" race explicitly
- `src/lib/pools.ts` — pool predicates and default-selection helpers
- `src/lib/format.ts` — amount parsing and display helpers (bigint base units,
  USD, percentages)
- `src/lib/assets.ts` — asset decimals and stablecoin detection
- `src/lib/borrow-capacity.ts` — capacity validation that scales quote USD to
  profile-stats USD before comparing
- `src/wallet-signing.ts` — adapts Dynamic wallets to the SDK signing flow
- `src/example-wallet.ts` — Dynamic-specific wallet helpers (chain label,
  preferred BTC payment address)

## Notes

- Pages call the SDK directly (`client.market.getPools()`,
  `client.lending.borrow(...)`, etc) so the SDK surface stays visible
- The borrow flow is quote-first so it mirrors the sats terminal interaction
  model
- The supply page uses the unified `supply()` API and lets the pool pick the
  transfer or contract-interaction path
- For Bitcoin wallets, the example prefers the payment address when available
