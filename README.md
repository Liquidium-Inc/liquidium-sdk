# Liquidium SDK

TypeScript SDK for Liquidium lending market interactions.

## Quick Start

```ts
import { LiquidiumClient } from "@liquidium/client";

const client = LiquidiumClient.create({});

const pools = await client.market.listPools();
const prices = await client.market.getAssetPrices();

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