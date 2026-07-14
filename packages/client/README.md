![npm](https://img.shields.io/npm/v/@liquidium/client?label=%40liquidium%2Fclient)
![license](https://img.shields.io/badge/license-MIT-blue)

<p align="center">
  <img src="https://raw.githubusercontent.com/Liquidium-Inc/liquidium-sdk/main/sdk.svg" alt="Liquidium SDK" width="700" />
</p>

# Liquidium SDK

TypeScript client for Liquidium lending and accountless Simple Loans.

[Documentation](https://liquidium-inc.github.io/liquidium-sdk/) · [API reference](https://liquidium-inc.github.io/liquidium-sdk/api-reference/) · [Simple Loans example](https://github.com/Liquidium-Inc/liquidium-sdk/tree/main/examples/simple-loans-flow)

## Install

```bash
npm install @liquidium/client
```

Use `npm install @liquidium/client@rc` when integrating against the current 0.5 release candidate. Untagged installs resolve to the latest stable release.

## Usage

```ts
import { LiquidiumClient } from "@liquidium/client";

const client = new LiquidiumClient();
const pools = await client.market.listPools();
const prices = await client.market.getAssetPrices();
```

Use `client.simpleLoans` for accountless borrowing. Use `client.accounts`, `client.lending`, and `client.positions` for profile-based lending.

Amounts use `bigint` values in each asset's smallest unit. Read pool decimals before converting user input.

See the [quick start](https://liquidium-inc.github.io/liquidium-sdk/getting-started/quick-start/) for loan creation, transfer targets, repayment, and recovery.

## Examples

- [Simple Loans](https://github.com/Liquidium-Inc/liquidium-sdk/tree/main/examples/simple-loans-flow)
- [SDK method query](https://github.com/Liquidium-Inc/liquidium-sdk/tree/main/examples/sdk-method-query)
- [Deposit address flow](https://github.com/Liquidium-Inc/liquidium-sdk/tree/main/examples/deposit-address-flow)
- [Contract interaction flow](https://github.com/Liquidium-Inc/liquidium-sdk/tree/main/examples/contract-interaction-flow)

## Development

Requires Node.js 20+ and pnpm 11+.

```bash
pnpm install
pnpm build
pnpm typecheck
pnpm test
```

## License

MIT
