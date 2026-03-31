# Vite React Dynamic Example

This example shows how to use `@liquidium/client` in a Vite React app with
Dynamic wallet connection.

It walks through:

- Connecting an Ethereum or Bitcoin wallet with Dynamic
- Creating or resolving a Liquidium account
- Fetching live pools from the protocol
- Resolving the BTC pool and generating a tracked BTC supply flow
- Optionally submitting a BTC inflow txid as a faster indexing hint
- Polling BTC inflow status every 5 seconds through the flow helper
- Opening a `bitcoin:` URI to try sending funds to the returned address

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

## Notes

- SDK-specific calls are isolated in `src/liquidium-client-sdk.ts` so the
  Liquidium flow is easy to follow separately from Dynamic UI wiring
- Guided flow interactions are split into dedicated hooks under `src/hooks/`
  (create account, load pools, prepare BTC flow, submit BTC inflow, watch BTC inflow)
- BTC inflows are still detectable without txid submission via backend address
  scanning; txid submission is optional and can speed up indexing
- The guided flow now uses `client.lending.createSupplyFlow(...)` so status
  polling runs through the SDK helper every 5 seconds by default
- The Vite example now points at `http://localhost:3000/api/sdk` by default,
  which matches a local `apps/pools` dev server
- BTC pool resolution uses `client.market.findPool({ asset: "BTC", chain: "BTC" })`
  and only falls back to manual selection when the result is ambiguous
- `destination: "nativeAddress"` currently works for the BTC pool
- `destination: "icrcAccount"` currently works for BTC and USDT pools
- The send step is a best-effort `bitcoin:` URI handoff, which lets you try the
  returned BTC address in a wallet installed on your machine
