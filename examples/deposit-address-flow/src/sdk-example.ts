import type {
  ActivityFilter,
  AssetPrices,
  GetActivityStatusResponse,
  LiquidiumAccountInput,
  OutflowDetails,
  Pool,
  SupplyAction,
  SupplyFlow,
  WalletAdapter,
} from "@liquidium/client";
import { Chain } from "@liquidium/client";
import { client } from "./client";

type MarketData = {
  pools: Pool[];
  assetPrices: AssetPrices;
};

type GetOrCreateWalletProfileParams = {
  account: string;
  walletAdapter: WalletAdapter;
};

type CreateSupplyFlowParams = {
  profileId: string;
  poolId: string;
  action: SupplyAction;
  chain: Chain;
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
  chain: Chain;
  receiver: LiquidiumAccountInput;
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

export async function createSupplyFlow({
  profileId,
  poolId,
  action,
  chain,
}: CreateSupplyFlowParams): Promise<SupplyFlow> {
  return await client.lending.supply({
    profileId,
    poolId,
    action,
    chain,
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
  chain,
  receiver,
  signerWalletAddress,
  signerWalletAdapter,
}: BorrowWithWalletParams): Promise<OutflowDetails> {
  return await client.lending.borrow({
    profileId,
    poolId,
    amount,
    chain,
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
