# Liquidium SDK

TypeScript SDK for Liquidium market data, instant loans, profile, quote, lending, activity, and history flows.

Recommended order: use `client.instantLoans` first, deposit-address profile flows second, and ETH contract interaction only when explicitly needed.

## Quick Start

```ts
import { LiquidiumClient } from "@liquidium/client";

const client = new LiquidiumClient({
  apiBaseUrl: "https://app.liquidium.fi/api/sdk",
});

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

const ltv = client.quote.calculateLtv(
  {
    borrowAmount: 2_000_000n,
    borrowPoolId: pools[1].id,
    collateralAmount: 10_000_000n,
    collateralPoolId: pools[0].id,
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
  ltvMaxBps: ltv.maxAllowedLtvBps,
  depositWindowSeconds: 3_600n,
  borrowDestination: {
    type: "External",
    address: "0x2222222222222222222222222222222222222222",
  },
  refundDestination: { type: "External", address: "bc1qrefunddestination" },
});

const depositAddress =
  instantLoan.depositTarget.type === "nativeAddress"
    ? instantLoan.depositTarget.address
    : instantLoan.depositTarget.account;
```

See `packages/client/README.md` for the full API guide, including instant loans, reference/address recovery, default deposit-address supply flows, explicit supply mechanism selection, activities, and history.
