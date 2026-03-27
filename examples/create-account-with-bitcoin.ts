import { LiquidiumClient } from "../packages/client/src";

type BitcoinWalletLike = {
  signMessage(
    message: string,
    options?: { addressType?: string }
  ): Promise<string>;
};

export function createLiquidiumClient() {
  return LiquidiumClient.create({});
}

export async function createLiquidiumAccount(
  wallet: BitcoinWalletLike,
  address: string
) {
  const client = createLiquidiumClient();
  const createAction = await client.accounts.create({ account: address });
  const signature = await wallet.signMessage(createAction.message, {
    addressType: "payment",
  });

  const profileId = await createAction.submit({
    signature,
    chain: "BTC",
    account: address,
  });

  return {
    client,
    profileId,
  };
}
