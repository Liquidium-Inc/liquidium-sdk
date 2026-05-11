import type { Chain, MarketAsset, MarketChain } from "../../core/types";
import type { SupplyTarget } from "../lending";

export type InstantLoanAsset = "BTC" | "SOL" | "USDC" | "USDT";

export interface ExternalAccount {
  type: "External";
  chain?: Chain | MarketChain;
  address: string;
}

export interface NativeAccount {
  type: "Native";
  principal: string;
}

export type InstantLoanAccount = ExternalAccount | NativeAccount;

export interface CreateInstantLoanRequest {
  collateralPoolId: string;
  borrowPoolId: string;
  collateralAsset: InstantLoanAsset;
  borrowAsset: InstantLoanAsset;
  collateralAmount: bigint;
  minBorrowAmount: bigint;
  targetLtvBps: bigint;
  depositWindowSeconds: bigint;
  borrowDestination: string | ExternalAccount;
  refundDestination: string | ExternalAccount;
}

export type InstantLoanGetRequest = { loanId: bigint } | { shortRef: string };

export interface InstantLoan {
  loanId: bigint;
  shortRef: string;
  profileId: string;
  started: boolean;
  depositDetectedTimestamp?: bigint;
  targetLtvBps: bigint;
  depositWindowSeconds: bigint;
  collateral: {
    poolId: string;
    asset: MarketAsset;
    chain: MarketChain;
    amountHint: bigint;
  };
  borrow: {
    poolId: string;
    asset: MarketAsset;
    chain: MarketChain;
    minAmount: bigint;
    destination: InstantLoanAccount;
  };
  refundDestination: InstantLoanAccount;
  depositTarget: SupplyTarget;
  repayTarget: SupplyTarget;
}

export interface InstantLoanCandidate {
  loanId: bigint;
  shortRef: string;
  profileId: string;
  createdAt?: Date;
  collateralPoolId: string;
  borrowPoolId: string;
  collateralAsset: MarketAsset;
  borrowAsset: MarketAsset;
  collateralAmountHint: bigint;
}
