import type { Asset, AssetIdentifier, Chain } from "../../core/types";

/** Current protocol metadata and rate state for a lending pool. */
export interface Pool {
  /** Pool canister principal text. */
  id: string;
  /** Asset supplied to and borrowed from the pool. */
  asset: Asset;
  /** Human-readable name of the pool asset. */
  displayName: string;
  /** Chain associated with the pool asset. */
  chain: Chain;
  /** Number of base-unit decimals for pool amounts. */
  decimals: bigint;
  /** Whether new pool activity is currently frozen. */
  frozen: boolean;
  /** Current supplied amount in base units after applying the lending index. */
  totalSupply: bigint;
  /** Current borrowed amount in base units after applying the borrow index. */
  totalDebt: bigint;
  /** Currently available liquidity in base units. */
  availableLiquidity: bigint;
  /** Optional supply cap in base units. */
  supplyCap?: bigint;
  /** Optional borrow cap in base units. */
  borrowCap?: bigint;
  /** Maximum loan-to-value ratio in basis points. */
  maxLtv: bigint;
  /** Liquidation threshold in basis points. */
  liquidationThreshold: bigint;
  /** Liquidation bonus in basis points. */
  liquidationBonus: bigint;
  /** Protocol liquidation fee in basis points. */
  protocolLiquidationFee: bigint;
  /** Reserve factor in basis points. */
  reserveFactor: bigint;
  /** Decimal scale used by APR and utilization fields. */
  rateDecimals: bigint;
  /** Current supply APR, scaled by `rateDecimals`. */
  lendingRate: bigint;
  /** Estimated supply APY, scaled by `rateDecimals`. */
  estimatedLendingApy: bigint;
  /** Current borrow APR, scaled by `rateDecimals`. */
  borrowingRate: bigint;
  /** Estimated borrow APY, scaled by `rateDecimals`. */
  estimatedBorrowingApy: bigint;
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
  /** Same-asset collateral below this base-unit amount is treated as dust. */
  sameAssetBorrowingDustThreshold: bigint;
  /** Unix timestamp in seconds of the last pool update when available. */
  lastUpdated?: bigint;
}

/** USD price map keyed by market asset symbol. */
export type AssetPrices = Record<string, number>;

/** Protocol prices with the time at which the SDK completed the fetch. */
export interface AssetPriceSnapshot {
  /** USD price map keyed by market asset symbol. */
  prices: AssetPrices;
  /** Unix timestamp in seconds when the SDK received the price response. */
  fetchedAt: bigint;
}

/** Supported Chain + Asset identifier used to find its backing lending pool. */
export type FindPoolQuery = AssetIdentifier;

/** Current borrow, lend, and utilization rates for a pool. */
export interface PoolRate {
  /** Decimal scale used by rate fields. */
  rateDecimals: bigint;
  /** Borrow APR scaled by `rateDecimals`. */
  borrowRate: bigint;
  /** Estimated borrow APY scaled by `rateDecimals`. */
  estimatedBorrowApy: bigint;
  /** Lend APR scaled by `rateDecimals`. */
  lendRate: bigint;
  /** Estimated lend APY scaled by `rateDecimals`. */
  estimatedLendApy: bigint;
  /** Utilization rate scaled by `rateDecimals`. */
  utilizationRate: bigint;
}
