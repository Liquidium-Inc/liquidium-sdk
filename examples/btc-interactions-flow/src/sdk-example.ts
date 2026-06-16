import type {
  ActivityFilter,
  GetActivityStatusResponse,
  Pool,
  SupplyAction,
  SupplyFlow,
  WalletAdapter,
} from "@liquidium/client";
import { Chain } from "@liquidium/client";
import { client } from "./client";

type GetOrCreateWalletProfileParams = {
  account: string;
  walletAdapter: WalletAdapter;
};

type SubmitBtcSupplyParams = {
  profileId: string;
  poolId: string;
  action: SupplyAction;
  account: string;
  amount: bigint;
  walletAdapter: WalletAdapter;
};

type ListProfileActivitiesParams = {
  profileId: string;
  filter: ActivityFilter;
};

type GetActivityStatusParams = {
  profileId: string;
  id: string;
};

export async function listMarketPools(): Promise<Pool[]> {
  return await client.market.listPools();
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
    chain: Chain.BTC,
    walletAdapter,
  });

  return { profileId, wasCreated: true };
}

export async function submitBtcSupply({
  profileId,
  poolId,
  action,
  account,
  amount,
  walletAdapter,
}: SubmitBtcSupplyParams): Promise<SupplyFlow> {
  return await client.lending.supply({
    profileId,
    poolId,
    action,
    account,
    amount,
    walletAdapter,
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

export async function getActivityStatus({
  profileId,
  id,
}: GetActivityStatusParams): Promise<GetActivityStatusResponse> {
  return await client.activities.getStatus({
    profileId,
    id,
  });
}
