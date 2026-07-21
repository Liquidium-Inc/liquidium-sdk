import { Principal } from "@icp-sdk/core/principal";
import {
  createLendingActor,
  type PoolRateTuple,
} from "../../core/canisters/lending/actor";
import {
  createFlexibleLendingActor,
  type DecodedPool,
  decodeFlexiblePool,
  type FlexiblePool,
} from "../../core/canisters/lending/flexible-actor";
import { LiquidiumError, LiquidiumErrorCode } from "../../core/errors";
import type { CanisterContext } from "../../core/transports/canister-context";
import { Asset, Chain, isAssetIdentifier } from "../../core/types";
import {
  mapDecodedPoolToPool,
  mapGetPoolRateResponseToPoolRate,
  mapGetPricesResponseToAssetPrices,
} from "./mappers";
import type { AssetPrices, FindPoolQuery, Pool, PoolRate } from "./types";

const ZERO_POOL_RATE: PoolRateTuple = [0n, 0n, 0n];
const BACKING_POOL_CHAIN_BY_ASSET = {
  [Asset.BTC]: Chain.BTC,
  [Asset.ETH]: Chain.ETH,
  [Asset.ICP]: Chain.ICP,
  [Asset.USDC]: Chain.ETH,
  [Asset.USDT]: Chain.ETH,
} satisfies Record<Asset, Chain>;

/** Pool metadata, prices, and current rate helpers. */
export class MarketModule {
  constructor(private readonly canisterContext: CanisterContext) {}

  /**
   * Lists SDK-supported pools with their current rates.
   *
   * Unsupported asset or chain variants returned by the canister are omitted.
   *
   * @returns Supported lending pools enriched with their current rate data.
   */
  async listPools(): Promise<Pool[]> {
    try {
      const flexibleActor = createFlexibleLendingActor(this.canisterContext);
      const rawPools = await flexibleActor.list_pools();

      const decodedPools = decodeSupportedFlexiblePools(rawPools);

      return await Promise.all(
        decodedPools.map(async (pool) => {
          const poolRate = await flexibleActor.get_pool_rate(pool.principal);
          const resolvedPoolRate = poolRate[0] ?? ZERO_POOL_RATE;

          return mapDecodedPoolToPool(pool, resolvedPoolRate);
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
   * Resolves a single backing pool for the given Chain + Asset identifier.
   *
   * Native and chain-key identifiers share a pool. For example, both
   * `ETH/USDT` and `ICP/USDT` resolve to the USDT lending pool.
   *
   * @param query - The market asset and chain pair to match.
   * @returns The single pool that matches the requested asset and chain.
   */
  async findPool(query: FindPoolQuery): Promise<Pool> {
    const identifier = { chain: query.chain, asset: query.asset };

    if (!isAssetIdentifier(identifier)) {
      throw new LiquidiumError(
        LiquidiumErrorCode.VALIDATION_ERROR,
        `Unsupported asset identifier: ${identifier.chain}/${identifier.asset}`
      );
    }

    const pools = await this.listPools();
    const backingPoolChain = BACKING_POOL_CHAIN_BY_ASSET[identifier.asset];
    const matchedPools = pools.filter(
      (pool) =>
        pool.asset === identifier.asset && pool.chain === backingPoolChain
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
   * Returns the full pool record for the given asset and chain pair.
   *
   * Convenience wrapper over {@link MarketModule.findPool}. `listPools()` already
   * enriches each pool with its current rate data, so no extra canister call is made.
   *
   * @param query - The market asset and chain pair to match.
   * @returns The matching pool enriched with current rate data.
   */
  async getReserveData(query: FindPoolQuery): Promise<Pool> {
    return await this.findPool(query);
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

function decodeSupportedFlexiblePools(rawPools: FlexiblePool[]): DecodedPool[] {
  const decodedPools: DecodedPool[] = [];

  for (const rawPool of rawPools) {
    const decodedPool = decodeFlexiblePool(rawPool);

    // The canister may expose assets/chains before the SDK supports their flows.
    // Keep market.listPools() scoped to pools this SDK can safely map and use.
    if (!decodedPool) {
      continue;
    }

    decodedPools.push(decodedPool);
  }

  return decodedPools;
}
