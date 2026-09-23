# Interactive SDK architecture

The [LikeC4 model](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/docs/c4/liquidium-sdk.c4) shows the SDK in its system context, its modules and transports, and the main integration flows. The model describes the SDK boundary. The [public protocol architecture documentation](https://liquidium.fi/docs/technical/architecture) describes custody and settlement inside the canisters.

## Views

- **System context:** an integrating app uses the SDK to reach the IC canisters and the Liquidium SDK API; a wallet signs or sends transactions.
- **SDK components:** the public modules share an IC agent, an HTTP API client, and optional EVM read access.
- **Simple Loan creation and reload:** the SDK creates a loan through the HTTP API, then reads canonical canister state and builds transfer targets. Reload also uses the API for the collateral amount hint.
- **Profile borrow:** the SDK prepares a signed action, the wallet signs it, and the SDK submits it to Lending.
- **Supply or repayment:** the SDK resolves a transfer target, the wallet or user sends funds, and an HTTP indexing hint can follow a broadcast. A hint is not settlement.
- **Read paths:** market and position data come from Lending; activity and history data come from the HTTP API.

## Preview and validation

Use Node.js and pnpm versions from the [root README](https://github.com/Liquidium-Inc/liquidium-sdk#development). Install dependencies from the repository root, then run:

```bash
pnpm architecture:serve
pnpm architecture:validate
pnpm architecture:build
```

The build writes an interactive site to the ignored `docs/c4/dist/` directory.
The preview command ignores AI provider settings from your environment and serves diagrams without AI chat.
