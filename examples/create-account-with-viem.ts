import { LiquidiumClient } from "../packages/client/src";

type ViemWalletClientLike = {
  getAddresses(): Promise<readonly string[]>;
  signMessage(args: { account: string; message: string }): Promise<string>;
};

export function createLiquidiumClient() {
  return LiquidiumClient.create({});
}

export async function createLiquidiumAccount(
  walletClient: ViemWalletClientLike
) {
  const client = createLiquidiumClient();
  const [account] = await walletClient.getAddresses();

  if (!account) {
    throw new Error("No wallet address available");
  }

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

  return {
    client,
    profileId,
  };
}
