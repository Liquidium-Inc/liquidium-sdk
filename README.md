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
import { Asset, Chain, LiquidiumClient } from "@liquidium/client";

const client = new LiquidiumClient();

const [collateralPool, borrowPool] = await Promise.all([
  client.market.findPool({ asset: Asset.BTC, chain: Chain.BTC }),
  client.market.findPool({ asset: Asset.USDC, chain: Chain.ETH }),
]);

const loan = await client.simpleLoans.create({
  collateral: {
    poolId: collateralPool.id,
    asset: Asset.BTC,
    amount: 50_000n,
  },
  borrow: {
    poolId: borrowPool.id,
    asset: Asset.USDC,
    amount: 9_000_000n,
    chain: Chain.ETH,
    destination: "0x2222222222222222222222222222222222222222",
  },
  refund: {
    chain: Chain.BTC,
    destination: "1BoatSLRHtKNngkdXEeobR76b53LETtpyT",
  },
  ltvMaxBps: 6_000n,
  depositWindowSeconds: 3_600n,
});

const deposit = loan.initialDeposit.targets[Chain.BTC];

console.log("Loan reference:", loan.ref);
console.log("Send collateral to:", deposit?.target.address);
```

Use `client.simpleLoans` for accountless borrowing. Use `client.accounts`, `client.lending`, and `client.positions` for profile-based lending.

Amounts use `bigint` values in each asset's smallest unit. Read pool decimals before converting user input.

See the [quick start](https://liquidium-inc.github.io/liquidium-sdk/getting-started/quick-start/) for LTV validation, repayment, and recovery.

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
