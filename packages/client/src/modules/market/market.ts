import { Principal } from "@dfinity/principal";
import {
  createLendingActor,
  type PoolRateTuple,
} from "../../core/canisters/lending/actor";
import { LiquidiumError, LiquidiumErrorCode } from "../../core/errors";
import type { ApiClient } from "../../core/transports/api-client";
import type { InternalProvider } from "../../core/transports/provider";
import {
  mapGetPoolRateResponseToPoolRate,
  mapGetPricesResponseToAssetPrices,
  mapLendingPoolRecordToPool,
} from "./mappers";
import type { AssetPrices, Pool } from "./types";

const ZERO_POOL_RATE: PoolRateTuple = [0n, 0n, 0n];

export class MarketModule {
  constructor(
    readonly provider: InternalProvider,
    readonly apiClient: ApiClient | undefined
  ) {}

  async getPools(): Promise<Pool[]> {
    void this.apiClient;

    try {
      const lendingActor = createLendingActor(this.provider);
      const lendingPools = await lendingActor.list_pools();

      return await Promise.all(
        lendingPools.map(async (pool) => {
          const poolRate = await lendingActor.get_pool_rate(pool.principal);
          const resolvedPoolRate = poolRate[0] ?? ZERO_POOL_RATE;

          return mapLendingPoolRecordToPool(pool, resolvedPoolRate);
        })
      );
    } catch (error) {
      if (error instanceof LiquidiumError) {
        throw error;
      }

      throw new LiquidiumError(
        LiquidiumErrorCode.CANISTER_REJECTED,
        "Canister call failed: list_pools",
        error
      );
    }
  }

  async getAssetPrices(): Promise<AssetPrices> {
    try {
      return mapGetPricesResponseToAssetPrices(
        await createLendingActor(this.provider).get_prices()
      );
    } catch (error) {
      if (error instanceof LiquidiumError) {
        throw error;
      }

      throw new LiquidiumError(
        LiquidiumErrorCode.CANISTER_REJECTED,
        "Canister call failed: get_prices",
        error
      );
    }
  }

  async getPoolRate(poolId: string): Promise<{
    borrowRate: bigint;
    lendRate: bigint;
    utilizationRate: bigint;
  }> {
    try {
      const rate = await createLendingActor(this.provider).get_pool_rate(
        Principal.fromText(poolId)
      );

      if (!rate[0]) {
        throw new LiquidiumError(
          LiquidiumErrorCode.POOL_NOT_FOUND,
          `Pool not found: ${poolId}`
        );
      }

      return mapGetPoolRateResponseToPoolRate(rate[0]);
    } catch (error) {
      if (error instanceof LiquidiumError) {
        throw error;
      }

      throw new LiquidiumError(
        LiquidiumErrorCode.CANISTER_REJECTED,
        "Canister call failed: get_pool_rate",
        error
      );
    }
  }
}
