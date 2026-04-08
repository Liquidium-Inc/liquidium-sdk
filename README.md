# Liquidium SDK

TypeScript SDK workspace for Liquidium.

## Quick Start

```ts
import { LiquidiumClient } from "@liquidium/client";

const client = LiquidiumClient.create({});

const pools = await client.market.getPools();
const prices = await client.market.getAssetPrices();

const createAction = await client.accounts.prepareCreate({
  account: walletAddress,
});
const signature = await wallet.signMessage(createAction.message);

const profileId = await createAction.submit({
  signature,
  chain: "ETH",
  account: walletAddress,
});
```
