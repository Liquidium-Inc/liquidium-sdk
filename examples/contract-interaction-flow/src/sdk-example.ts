import type {
  ActivityFilter,
  GetActivityStatusResponse,
  Pool,
  SupplyFlow,
  WalletAdapter,
} from "@liquidium/client";
import { Chain, SupplyAction, SupplyPlanType } from "@liquidium/client";
import { createClient } from "./client";

type GetOrCreateWalletProfileParams = {
  account: string;
  walletAdapter: WalletAdapter;
};

type SubmitContractInteractionSupplyParams = {
  profileId: string;
  poolId: string;
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
  return await createClient().market.listPools();
}

export async function getOrCreateWalletProfile({
  account,
  walletAdapter,
}: GetOrCreateWalletProfileParams): Promise<{
  profileId: string;
  wasCreated: boolean;
}> {
  const client = createClient();
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

export async function submitContractInteractionSupply({
  profileId,
  poolId,
  account,
  amount,
  walletAdapter,
}: SubmitContractInteractionSupplyParams): Promise<SupplyFlow> {
  return await createClient().lending.supply({
    profileId,
    poolId,
    action: SupplyAction.deposit,
    mechanism: SupplyPlanType.contractInteraction,
    account,
    amount,
    walletAdapter,
  });
}

export async function listProfileActivities({
  profileId,
  filter,
}: ListProfileActivitiesParams) {
  return await createClient().activities.list({
    profileId,
    filter,
  });
}

export async function getActivityStatus({
  profileId,
  id,
}: GetActivityStatusParams): Promise<GetActivityStatusResponse> {
  return await createClient().activities.getStatus({
    profileId,
    id,
  });
}
