import type { MarketAsset } from "../../core/types";
import type { Pool } from "../market/types";

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

export interface UserPositionSummary {
  totalCollateralUsd: bigint;
  totalDebtUsd: bigint;
  availableBorrowsUsd: bigint;
  netWorthUsd: bigint;
  usdDecimals: bigint;
  currentLtvBps: bigint;
  weightedMaxLtvBps: bigint;
  weightedLiquidationThresholdBps: bigint;
  healthFactor: bigint;
}

export interface UserReserve {
  position: Position;
  pool: Pool;
  priceUsd: number;
  suppliedUsd: bigint;
  borrowedUsd: bigint;
  usdDecimals: bigint;
}

export interface MaxRepayAmount {
  amount: bigint;
  decimals: bigint;
}
