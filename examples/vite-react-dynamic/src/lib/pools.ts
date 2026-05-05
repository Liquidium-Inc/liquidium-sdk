import type { Pool, UserHistoryEntry } from "@liquidium/client";
import { isStablecoinAsset } from "./assets";
import { formatPoolAmount } from "./format";

export const BTC_ASSET = "BTC";
export const BTC_CHAIN = "BTC";

export function findBtcPool(pools: Pool[]): Pool | undefined {
  return pools.find(
    (pool) => pool.asset === BTC_ASSET && pool.chain === BTC_CHAIN
  );
}

export function isBtcPool(pool: Pool): boolean {
  return pool.asset === BTC_ASSET && pool.chain === BTC_CHAIN;
}

export function isEthStablecoinPool(pool: Pool): boolean {
  return pool.chain === "ETH" && isStablecoinAsset(pool.asset);
}

export function isSupportedSupplyPool(pool: Pool): boolean {
  return isBtcPool(pool) || isEthStablecoinPool(pool);
}

export function resolveDefaultBorrowPoolId(
  pools: Pool[],
  fallbackPoolId: string
): string {
  const stablePool = pools.find(isEthStablecoinPool);

  return stablePool?.id ?? fallbackPoolId;
}

export function resolveDefaultCollateralPoolId(
  pools: Pool[],
  borrowPoolId: string
): string {
  const btcPool = findBtcPool(pools);

  if (btcPool && btcPool.id !== borrowPoolId) {
    return btcPool.id;
  }

  return pools.find((pool) => pool.id !== borrowPoolId)?.id ?? borrowPoolId;
}

export function formatHistoryAmount(
  entry: UserHistoryEntry,
  pools: Pool[]
): string {
  const matchingPool = pools.find((pool) => pool.id === entry.poolId);

  if (!matchingPool) {
    return entry.amount.toString();
  }

  return formatPoolAmount(entry.amount, matchingPool.asset);
}
