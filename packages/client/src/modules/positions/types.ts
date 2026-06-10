import type { MarketAsset } from "../../core/types";
import type { Pool } from "../market/types";

/** Current profile position in one lending pool. */
export interface Position {
  /** Pool principal text. */
  poolId: string;
  /** Pool asset symbol. */
  asset: MarketAsset;
  /** Current supplied amount in base units. */
  deposited: bigint;
  /** Decimal scale for supplied amounts. */
  depositedDecimals: bigint;
  /** Borrowed principal in base units. */
  borrowed: bigint;
  /** Decimal scale for borrowed amounts. */
  borrowedDecimals: bigint;
  /** Accrued supply interest in base units. */
  earnedInterest: bigint;
  /** Accrued borrow interest in base units. */
  debtInterest: bigint;
  /** Unix timestamp in seconds of the last position update. */
  lastUpdate: bigint;
}

/** Aggregate borrowing capacity for a profile. */
export interface BorrowingPower {
  /** Weighted maximum LTV, scaled by protocol rate decimals. */
  weightedMaxLtv: bigint;
  /** Maximum borrowable USD value, scaled by `maxBorrowableUsdDecimals`. */
  maxBorrowableUsd: bigint;
  /** Decimal scale for `maxBorrowableUsd`. */
  maxBorrowableUsdDecimals: bigint;
}

/** Aggregate debt, collateral, and liquidation stats for a profile. */
export interface UserStats {
  /** Total debt value in USD-scaled units. */
  debt: bigint;
  /** Decimal scale for `debt`. */
  debtDecimals: bigint;
  /** Total collateral value in USD-scaled units. */
  collateral: bigint;
  /** Decimal scale for `collateral`. */
  collateralDecimals: bigint;
  /** Weighted liquidation threshold, scaled by protocol rate decimals. */
  weightedLiquidationThreshold: bigint;
  /** Current borrowing capacity. */
  borrowingPower: BorrowingPower;
}

/** Health factor and supporting aggregate stats for a profile. */
export interface HealthFactor {
  /** Current health factor, scaled by protocol rate decimals. */
  healthFactor: bigint;
  /** Aggregate stats used to derive the health factor. */
  userStats: UserStats;
}

/** Derived profile-level position summary for dashboards. */
export interface UserPositionSummary {
  /** Total collateral USD value. */
  totalCollateralUsd: bigint;
  /** Total debt USD value. */
  totalDebtUsd: bigint;
  /** Available borrow capacity in USD-scaled units. */
  availableBorrowsUsd: bigint;
  /** Collateral minus debt in USD-scaled units. */
  netWorthUsd: bigint;
  /** Decimal scale for USD fields. */
  usdDecimals: bigint;
  /** Current LTV in basis points. */
  currentLtvBps: bigint;
  /** Weighted maximum LTV in basis points. */
  weightedMaxLtvBps: bigint;
  /** Weighted liquidation threshold in basis points. */
  weightedLiquidationThresholdBps: bigint;
  /** Current health factor. */
  healthFactor: bigint;
}

/** Position joined with pool metadata and current USD valuation. */
export interface UserReserve {
  /** Position data for the pool. */
  position: Position;
  /** Pool metadata and rate data. */
  pool: Pool;
  /** Current USD price for the reserve asset. */
  priceUsd: number;
  /** Supplied value in USD-scaled units. */
  suppliedUsd: bigint;
  /** Borrowed value in USD-scaled units. */
  borrowedUsd: bigint;
  /** Decimal scale for USD fields. */
  usdDecimals: bigint;
}

/** Full repayment amount for a position, including any requested buffer. */
export interface MaxRepayAmount {
  /** Amount to repay in the borrowed asset's base units. */
  amount: bigint;
  /** Decimal scale for `amount`. */
  decimals: bigint;
}

/** Full withdraw amount for a position. */
export interface FullWithdrawAmount {
  /** Amount to withdraw in the supplied asset's base units. */
  amount: bigint;
  /** Decimal scale for `amount`. */
  decimals: bigint;
}
