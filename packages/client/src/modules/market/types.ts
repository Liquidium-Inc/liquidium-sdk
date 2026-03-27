import type { MarketAsset, MarketChain } from "../../core/types";

export interface Pool {
  id: string;
  asset: MarketAsset;
  chain: MarketChain;
  frozen: boolean;
  totalSupply: bigint;
  totalDebt: bigint;
  supplyCap?: bigint;
  borrowCap?: bigint;
  maxLtv: bigint;
  liquidationThreshold: bigint;
  liquidationBonus: bigint;
  protocolLiquidationFee: bigint;
  reserveFactor: bigint;
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
