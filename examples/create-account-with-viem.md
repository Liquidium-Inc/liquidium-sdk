# Create Account With viem

```ts
import "viem/window";
import { createWalletClient, custom } from "viem";
import { mainnet } from "viem/chains";
import { LiquidiumClient } from "@liquidium/client";

if (!window.ethereum) {
  throw new Error("No injected wallet found");
}

const [account] = await window.ethereum.request({
  method: "eth_requestAccounts",
});

const walletClient = createWalletClient({
  account,
  chain: mainnet,
  transport: custom(window.ethereum),
});

const client = LiquidiumClient.create({});
const createAction = await client.accounts.create({ account });
const signature = await walletClient.signMessage({
  account,
  message: createAction.message,
});

const profileId = await createAction.submit({
  signature,
  chain: "ETH",
  account,
});
```
