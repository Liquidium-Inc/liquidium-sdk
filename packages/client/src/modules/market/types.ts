import type { MarketAsset, MarketChain } from "../../core/types";

export interface Pool {
  id: string;
  asset: MarketAsset;
  chain: MarketChain;
  decimals: bigint;
  frozen: boolean;
  totalSupply: bigint;
  totalDebt: bigint;
  availableLiquidity: bigint;
  supplyCap?: bigint;
  borrowCap?: bigint;
  maxLtv: bigint;
  liquidationThreshold: bigint;
  liquidationBonus: bigint;
  protocolLiquidationFee: bigint;
  reserveFactor: bigint;
  rateDecimals: bigint;
  lendingRate: bigint;
  borrowingRate: bigint;
  utilizationRate: bigint;
  baseRate: bigint;
  optimalUtilizationRate: bigint;
  rateSlopeBefore: bigint;
  rateSlopeAfter: bigint;
  lendingIndex: bigint;
  borrowIndex: bigint;
  sameAssetBorrowing: boolean;
  lastUpdated?: bigint;
}

export type AssetPrices = Record<string, number>;

export interface FindPoolQuery {
  asset: MarketAsset;
  chain: MarketChain;
}

export interface PoolRate {
  rateDecimals: bigint;
  borrowRate: bigint;
  lendRate: bigint;
  utilizationRate: bigint;
}
