# Liquidium SDK

TypeScript SDK for Liquidium market data, instant loans, profile, quote, lending, activity, and history flows.

Recommended order: use `client.instantLoans` first, deposit-address profile flows second, and ETH contract interaction only when explicitly needed.

## Quick Start

```ts
import { LiquidiumClient } from "@liquidium/client";

const client = LiquidiumClient.create({});

const pools = await client.market.listPools();
const prices = await client.market.getAssetPrices();

const quote = await client.quote.getQuote(
  {
    borrowAmount: 50_000n,
    borrowPoolId: pools[0].id,
    collateralPoolId: pools[1].id,
    targetLtvBps: 5_000n,
  },
  pools,
  prices
);

const instantLoan = await client.instantLoans.create({
  collateralPoolId: pools[0].id,
  borrowPoolId: pools[1].id,
  collateralAsset: "BTC",
  borrowAsset: "USDT",
  collateralAmount: 10_000_000n,
  borrowAmount: 2_000_000n,
  ltvMaxBps: 6_800n,
  depositWindowSeconds: 3_600n,
  borrowDestination: "0x2222222222222222222222222222222222222222",
  refundDestination: "bc1qrefunddestination",
});

const depositAddress =
  instantLoan.depositTarget.type === "nativeAddress"
    ? instantLoan.depositTarget.address
    : instantLoan.depositTarget.account;
```

See `packages/client/README.md` for the full API guide, including instant loans, reference/address recovery, default deposit-address supply flows, explicit supply mechanism selection, activities, and history.
