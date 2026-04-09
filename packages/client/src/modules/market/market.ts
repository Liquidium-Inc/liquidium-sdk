import { Principal } from "@dfinity/principal";
import {
  createLendingActor,
  type PoolRateTuple,
} from "../../core/canisters/lending/actor";
import { LiquidiumError, LiquidiumErrorCode } from "../../core/errors";
import type { ApiClient } from "../../core/transports/api-client";
import type { CanisterContext } from "../../core/transports/canister-context";
import {
  mapGetPoolRateResponseToPoolRate,
  mapGetPricesResponseToAssetPrices,
  mapLendingPoolRecordToPool,
} from "./mappers";
import type { AssetPrices, FindPoolQuery, Pool, PoolRate } from "./types";

const ZERO_POOL_RATE: PoolRateTuple = [0n, 0n, 0n];

export class MarketModule {
  constructor(
    readonly canisterContext: CanisterContext,
    readonly apiClient: ApiClient | undefined
  ) {}

  /**
   * Lists all pools with their current rates.
   *
   * @returns All configured lending pools enriched with their current rate data.
   */
  async getPools(): Promise<Pool[]> {
    void this.apiClient;

    try {
      const lendingActor = createLendingActor(this.canisterContext);
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

  /**
   * Returns the latest asset prices reported by the protocol.
   *
   * @returns The latest protocol price map keyed by market asset symbol.
   */
  async getAssetPrices(): Promise<AssetPrices> {
    try {
      return mapGetPricesResponseToAssetPrices(
        await createLendingActor(this.canisterContext).get_prices()
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

  /**
   * Resolves a single pool for the given asset and chain pair.
   *
   * @param query - The market asset and chain pair to match.
   * @returns The single pool that matches the requested asset and chain.
   */
  async findPool(query: FindPoolQuery): Promise<Pool> {
    const pools = await this.getPools();
    const matchedPools = pools.filter(
      (pool) => pool.asset === query.asset && pool.chain === query.chain
    );

    if (matchedPools.length === 0) {
      throw new LiquidiumError(
        LiquidiumErrorCode.POOL_NOT_FOUND,
        `Pool not found for asset ${query.asset} on chain ${query.chain}`
      );
    }

    if (matchedPools.length > 1) {
      throw new LiquidiumError(
        LiquidiumErrorCode.VALIDATION_ERROR,
        `Multiple pools found for asset ${query.asset} on chain ${query.chain}. Select a specific pool id.`
      );
    }

    return matchedPools[0];
  }

  /**
   * Returns the current borrow, lend, and utilization rates for a pool.
   *
   * @param poolId - The pool principal text.
   * @returns The borrow, lend, and utilization rates for the requested pool.
   */
  async getPoolRate(poolId: string): Promise<PoolRate> {
    try {
      const rate = await createLendingActor(this.canisterContext).get_pool_rate(
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
