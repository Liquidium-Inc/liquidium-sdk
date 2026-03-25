import { LiquidiumError, LiquidiumErrorCode } from "../errors";
import type { ApiClient } from "../internal/api-client";
import type { InternalProvider } from "../internal/provider";
import type { AssetPrices, Pool } from "../types";

/**
 * Market and pool data.
 *
 * Read methods route through the API when available,
 * falling back to canister queries where needed.
 */
export class MarketModule {
  /** @internal */
  constructor(
    readonly provider: InternalProvider,
    readonly apiClient: ApiClient | undefined
  ) {}

  /**
   * Get all pools with current rates.
   */
  async getPools(): Promise<Pool[]> {
    void this.provider;
    void this.apiClient;
    // TODO: wire to canister via LendingPool.get_all_pools
    // or API via GET /v1/markets/pools
    throw new LiquidiumError(
      LiquidiumErrorCode.INTERNAL,
      "Not yet implemented"
    );
  }

  /**
   * Get current asset prices in USD.
   */
  async getAssetPrices(): Promise<AssetPrices> {
    // TODO: wire to canister via LendingPool.get_asset_prices
    // or API via GET /v1/markets/prices
    throw new LiquidiumError(
      LiquidiumErrorCode.INTERNAL,
      "Not yet implemented"
    );
  }

  /**
   * Get rate details for a specific pool (borrow, lend, utilization).
   */
  async getPoolRate(poolId: string): Promise<{
    borrowRate: bigint;
    lendRate: bigint;
    utilizationRate: bigint;
  }> {
    void poolId;
    // TODO: wire to canister via LendingPool.get_pool_rate
    throw new LiquidiumError(
      LiquidiumErrorCode.INTERNAL,
      "Not yet implemented"
    );
  }
}
