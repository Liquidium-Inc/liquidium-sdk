# Create Account With Bitcoin Wallet

```ts
import { LiquidiumClient } from "@liquidium/client";

const client = LiquidiumClient.create({});
const createAction = await client.accounts.create({ account: address });
const signature = await bitcoinWallet.signMessage(createAction.message, {
  addressType: "payment",
});

const profileId = await createAction.submit({
  signature,
  chain: "BTC",
  account: address,
});
```
