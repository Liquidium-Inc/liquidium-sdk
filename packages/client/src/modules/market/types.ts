import type { MarketAsset, MarketChain } from "../../core/types";

/** Current protocol metadata and rate state for a lending pool. */
export interface Pool {
  /** Pool canister principal text. */
  id: string;
  /** Asset supplied to and borrowed from the pool. */
  asset: MarketAsset;
  /** Chain associated with the pool asset. */
  chain: MarketChain;
  /** Number of base-unit decimals for pool amounts. */
  decimals: bigint;
  /** Whether new pool activity is currently frozen. */
  frozen: boolean;
  /** Total supplied amount in base units. */
  totalSupply: bigint;
  /** Total borrowed amount in base units. */
  totalDebt: bigint;
  /** Currently available liquidity in base units. */
  availableLiquidity: bigint;
  /** Optional supply cap in base units. */
  supplyCap?: bigint;
  /** Optional borrow cap in base units. */
  borrowCap?: bigint;
  /** Maximum loan-to-value ratio, scaled by `rateDecimals`. */
  maxLtv: bigint;
  /** Liquidation threshold, scaled by `rateDecimals`. */
  liquidationThreshold: bigint;
  /** Liquidation bonus, scaled by `rateDecimals`. */
  liquidationBonus: bigint;
  /** Protocol liquidation fee, scaled by `rateDecimals`. */
  protocolLiquidationFee: bigint;
  /** Reserve factor, scaled by `rateDecimals`. */
  reserveFactor: bigint;
  /** Decimal scale used by rate and risk-ratio fields. */
  rateDecimals: bigint;
  /** Current supply APR, scaled by `rateDecimals`. */
  lendingRate: bigint;
  /** Current borrow APR, scaled by `rateDecimals`. */
  borrowingRate: bigint;
  /** Current pool utilization, scaled by `rateDecimals`. */
  utilizationRate: bigint;
  /** Base borrow rate, scaled by `rateDecimals`. */
  baseRate: bigint;
  /** Optimal utilization point, scaled by `rateDecimals`. */
  optimalUtilizationRate: bigint;
  /** Rate slope before optimal utilization, scaled by `rateDecimals`. */
  rateSlopeBefore: bigint;
  /** Rate slope after optimal utilization, scaled by `rateDecimals`. */
  rateSlopeAfter: bigint;
  /** Current lending index. */
  lendingIndex: bigint;
  /** Current borrow index. */
  borrowIndex: bigint;
  /** Whether borrowing the same asset as collateral is allowed. */
  sameAssetBorrowing: boolean;
  /** Unix timestamp in seconds of the last pool update when available. */
  lastUpdated?: bigint;
}

/** USD price map keyed by market asset symbol. */
export type AssetPrices = Record<string, number>;

/** Asset and chain pair used to find a unique pool. */
export interface FindPoolQuery {
  /** Asset symbol to match. */
  asset: MarketAsset;
  /** Chain name to match. */
  chain: MarketChain;
}

/** Current borrow, lend, and utilization rates for a pool. */
export interface PoolRate {
  /** Decimal scale used by rate fields. */
  rateDecimals: bigint;
  /** Borrow APR scaled by `rateDecimals`. */
  borrowRate: bigint;
  /** Lend APR scaled by `rateDecimals`. */
  lendRate: bigint;
  /** Utilization rate scaled by `rateDecimals`. */
  utilizationRate: bigint;
}
