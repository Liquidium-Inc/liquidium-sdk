# Vite React Dynamic Example

This example shows how to use `@liquidium/client` in a Vite React app with
Dynamic wallet connection.

It walks through:

- Connecting an Ethereum or Bitcoin wallet with Dynamic
- Creating or resolving a Liquidium account
- Fetching live pools from the protocol
- Choosing the BTC pool and generating a supply destination
- Opening a `bitcoin:` URI to try sending funds to the returned address

## Setup

1. Copy `.env.example` to `.env`
2. Set `VITE_DYNAMIC_ENVIRONMENT_ID` from your Dynamic dashboard
3. Install dependencies from the SDK root:

```bash
pnpm install
```

4. Run the example:

```bash
pnpm --filter @liquidium/example-vite-react-dynamic dev
```

## Notes

- SDK-specific calls are isolated in `src/liquidium-client-sdk.ts` so the
  Liquidium flow is easy to follow separately from Dynamic UI wiring
- `destination: "nativeAddress"` currently works for the BTC pool
- `destination: "icrcAccount"` currently works for BTC and USDT pools
- The send step is a best-effort `bitcoin:` URI handoff, which lets you try the
  returned BTC address in a wallet installed on your machine
