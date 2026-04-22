import type { MarketAsset } from "../../core/types";

export interface Position {
  poolId: string;
  asset: MarketAsset;
  deposited: bigint;
  depositedDecimals: bigint;
  borrowed: bigint;
  borrowedDecimals: bigint;
  earnedInterest: bigint;
  debtInterest: bigint;
  lastUpdate: bigint;
}

export interface BorrowingPower {
  weightedMaxLtv: bigint;
  maxBorrowableUsd: bigint;
  maxBorrowableUsdDecimals: bigint;
}

export interface UserStats {
  debt: bigint;
  debtDecimals: bigint;
  collateral: bigint;
  collateralDecimals: bigint;
  weightedLiquidationThreshold: bigint;
  borrowingPower: BorrowingPower;
}

export interface HealthFactor {
  healthFactor: bigint;
  userStats: UserStats;
}
