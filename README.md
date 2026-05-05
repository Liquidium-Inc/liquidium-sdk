# Liquidium SDK

TypeScript SDK for Liquidium market data, profile, quote, lending, activity, and history flows.

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

const createAction = await client.accounts.prepareCreateProfile({
  account: walletAddress,
});
const signature = await wallet.signMessage(createAction.message);

const profileId = await createAction.submit({
  signature,
  chain: "ETH",
  account: walletAddress,
});
```

See `packages/client/README.md` for the full API guide, including default deposit-address supply flows, explicit supply mechanism selection, activities, and history.
