import type {
  ActivityFilter,
  AssetPrices,
  GetActivityStatusResponse,
  OutflowDestination,
  OutflowDetails,
  Pool,
  SupplyFlow,
  TransferMode,
  WalletAdapter,
} from "@liquidium/client";
import { Chain, SupplyAction } from "@liquidium/client";
import { client } from "./client";

type MarketData = {
  pools: Pool[];
  assetPrices: AssetPrices;
};

type GetOrCreateWalletProfileParams = {
  account: string;
  walletAdapter: WalletAdapter;
};

type CreateDepositAddressSupplyParams = {
  profileId: string;
  poolId: string;
  transferMode: TransferMode;
};

type RegisterSupplyTxidParams = {
  supplyFlow: SupplyFlow;
  txid: string;
};

type GetActivityStatusParams = {
  profileId: string;
  id: string;
};

type BorrowWithWalletParams = {
  profileId: string;
  poolId: string;
  amount: bigint;
  receiver: OutflowDestination;
  signerWalletAddress: string;
  signerWalletAdapter: WalletAdapter;
};

type ListProfileActivitiesParams = {
  profileId: string;
  filter: ActivityFilter;
};

export async function loadMarketData(): Promise<MarketData> {
  const [pools, assetPrices] = await Promise.all([
    client.market.listPools(),
    client.market.getAssetPrices(),
  ]);

  return { pools, assetPrices };
}

export async function getOrCreateWalletProfile({
  account,
  walletAdapter,
}: GetOrCreateWalletProfileParams): Promise<{
  profileId: string;
  wasCreated: boolean;
}> {
  const existingProfileId = await client.accounts.getProfileId(account);

  if (existingProfileId) {
    return { profileId: existingProfileId, wasCreated: false };
  }

  const profileId = await client.accounts.createProfile({
    account,
    chain: Chain.ETH,
    walletAdapter,
  });

  return { profileId, wasCreated: true };
}

export async function createDepositAddressSupply({
  profileId,
  poolId,
  transferMode,
}: CreateDepositAddressSupplyParams): Promise<SupplyFlow> {
  return await client.lending.supply({
    profileId,
    poolId,
    action: SupplyAction.deposit,
    transferMode,
  });
}

export async function registerSupplyTxid({
  supplyFlow,
  txid,
}: RegisterSupplyTxidParams) {
  return await supplyFlow.submit({ txid });
}

export async function getActivityStatus({
  profileId,
  id,
}: GetActivityStatusParams): Promise<GetActivityStatusResponse> {
  return await client.activities.getStatus({
    profileId,
    id,
  });
}

export async function borrowWithWallet({
  profileId,
  poolId,
  amount,
  receiver,
  signerWalletAddress,
  signerWalletAdapter,
}: BorrowWithWalletParams): Promise<OutflowDetails> {
  return await client.lending.borrow({
    profileId,
    poolId,
    amount,
    receiver,
    signerWalletAddress,
    signerChain: Chain.ETH,
    signerWalletAdapter,
  });
}

export async function listProfileActivities({
  profileId,
  filter,
}: ListProfileActivitiesParams) {
  return await client.activities.list({
    profileId,
    filter,
  });
}
