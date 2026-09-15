import type {
  ActivityFilter,
  GetActivityStatusResponse,
  LiquidiumAccountInput,
  OutflowDetails,
  Pool,
  SupplyFlow,
  WalletAdapter,
} from "@liquidium/client";
import {
  Chain,
  getMinimumDepositAmount,
  SupplyAction,
  SupplyPlanType,
} from "@liquidium/client";
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

type SubmitContractInteractionRepaymentParams = {
  profileId: string;
  poolId: string;
  account: string;
  amount: bigint;
  walletAdapter: WalletAdapter;
};

type CreateCkTransferTargetParams = {
  profileId: string;
  poolId: string;
  action: SupplyAction;
};

type ValidateDepositAmountParams = {
  amount: bigint;
  asset: string;
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

type WithdrawWithWalletParams = {
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

type GetActivityStatusParams = {
  profileId: string;
  id: string;
};

export async function listMarketPools(): Promise<Pool[]> {
  return await createClient().market.listPools();
}

export function validateDepositAmount({
  amount,
  asset,
}: ValidateDepositAmountParams): void {
  const minimumAmount = getMinimumDepositAmount(asset);
  if (amount >= minimumAmount) {
    return;
  }

  throw new Error(
    `Deposit amount must be at least ${minimumAmount} base units for ${asset}`
  );
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
    chain: Chain.ETH,
    mechanism: SupplyPlanType.contractInteraction,
    account,
    amount,
    walletAdapter,
  });
}

export async function submitContractInteractionRepayment({
  profileId,
  poolId,
  account,
  amount,
  walletAdapter,
}: SubmitContractInteractionRepaymentParams): Promise<SupplyFlow> {
  return await createClient().lending.supply({
    profileId,
    poolId,
    action: SupplyAction.repayment,
    chain: Chain.ETH,
    mechanism: SupplyPlanType.contractInteraction,
    account,
    amount,
    walletAdapter,
  });
}

export async function createCkTransferTarget({
  profileId,
  poolId,
  action,
}: CreateCkTransferTargetParams): Promise<SupplyFlow> {
  return await createClient().lending.supply({
    profileId,
    poolId,
    action,
    chain: Chain.ICP,
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
  return await createClient().lending.borrow({
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

export async function withdrawWithWallet({
  profileId,
  poolId,
  amount,
  chain,
  receiver,
  signerWalletAddress,
  signerWalletAdapter,
}: WithdrawWithWalletParams): Promise<OutflowDetails> {
  return await createClient().lending.withdraw({
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
