import { Principal } from "@icp-sdk/core/principal";
import { mapCanisterCallErrorToLiquidiumError } from "../../core/canisters/lending/error-mappers";
import {
  createFlexibleLendingActor,
  decodeFlexiblePositionView,
  decodeFlexibleUserStats,
} from "../../core/canisters/lending/flexible-actor";
import { LiquidiumError } from "../../core/errors";
import type { CanisterContext } from "../../core/transports/canister-context";
import type { MarketModule } from "../market/market";
import type { Pool } from "../market/types";
import {
  mapDecodedPositionViewToPosition,
  mapDecodedUserStatsToUserStats,
  USD_VALUE_SCALE_DECIMALS,
} from "./mappers";
import type {
  FullWithdrawAmount,
  HealthFactor,
  MaxRepayAmount,
  Position,
  UserPositionSummary,
  UserReserve,
  UserStats,
} from "./types";

const BPS_SCALE = 10000n;
const DEFAULT_REPAY_BUFFER_BPS = 10n;

/** Profile position, health factor, and reserve valuation helpers. */
export class PositionsModule {
  constructor(
    private readonly canisterContext: CanisterContext,
    readonly market: MarketModule
  ) {}

  /**
   * Returns a single position for a profile and pool.
   *
   * @param profileId - The Liquidium profile principal text.
   * @param poolId - The pool principal text.
   * @returns The position for the requested profile and pool, or `null` when no position exists.
   */
  async getPosition(
    profileId: string,
    poolId: string
  ): Promise<Position | null> {
    try {
      const result = await createFlexibleLendingActor(
        this.canisterContext
      ).get_position(Principal.fromText(profileId), Principal.fromText(poolId));

      const view = result[0];
      if (!view) {
        return null;
      }

      const decodedView = decodeFlexiblePositionView(view);
      if (!decodedView) {
        return null;
      }

      return mapDecodedPositionViewToPosition(decodedView);
    } catch (error) {
      if (error instanceof LiquidiumError) {
        throw error;
      }

      throw mapCanisterCallErrorToLiquidiumError("get_position", error);
    }
  }

  /**
   * Lists all positions for a profile.
   *
   * @param profileId - The Liquidium profile principal text.
   * @returns All positions currently associated with the requested profile.
   */
  async listPositions(profileId: string): Promise<Position[]> {
    try {
      const actor = createFlexibleLendingActor(this.canisterContext);
      const profilePrincipal = Principal.fromText(profileId);
      const stats = await actor.get_profile_stats(profilePrincipal);
      const decodedStats = decodeFlexibleUserStats(stats);

      const positionViews = await Promise.all(
        decodedStats.positions.map((position) =>
          actor.get_position(profilePrincipal, position.pool_id)
        )
      );

      return positionViews
        .map((result) => result[0])
        .filter((view): view is NonNullable<typeof view> => view !== undefined)
        .map(decodeFlexiblePositionView)
        .filter((view): view is NonNullable<typeof view> => view !== null)
        .map(mapDecodedPositionViewToPosition);
    } catch (error) {
      if (error instanceof LiquidiumError) {
        throw error;
      }

      throw mapCanisterCallErrorToLiquidiumError("list_positions", error);
    }
  }

  /**
   * Returns the current health factor for a profile.
   *
   * @param profileId - The Liquidium profile principal text.
   * @returns The current health factor for the requested profile.
   */
  async getHealthFactor(profileId: string): Promise<HealthFactor> {
    try {
      const [healthFactor, userStatsRecord] = await createFlexibleLendingActor(
        this.canisterContext
      ).get_health_factor(Principal.fromText(profileId));

      return {
        healthFactor,
        userStats: mapDecodedUserStatsToUserStats(
          decodeFlexibleUserStats(userStatsRecord)
        ),
      };
    } catch (error) {
      if (error instanceof LiquidiumError) {
        throw error;
      }

      throw mapCanisterCallErrorToLiquidiumError("get_health_factor", error);
    }
  }

  /**
   * Returns aggregate borrowing and collateral stats for a profile.
   *
   * @param profileId - The Liquidium profile principal text.
   * @returns Aggregate debt, collateral, and borrowing power metrics for the requested profile.
   */
  async getUserStats(profileId: string): Promise<UserStats> {
    try {
      const result = await createFlexibleLendingActor(
        this.canisterContext
      ).get_profile_stats(Principal.fromText(profileId));

      return mapDecodedUserStatsToUserStats(decodeFlexibleUserStats(result));
    } catch (error) {
      if (error instanceof LiquidiumError) {
        throw error;
      }

      throw mapCanisterCallErrorToLiquidiumError("get_profile_stats", error);
    }
  }

  /**
   * Returns an aggregate summary of a profile's position.
   *
   * Single canister round-trip (`get_health_factor`). Derived fields:
   * `availableBorrowsUsd = max(0, maxBorrowableUsd - debt)`,
   * `netWorthUsd = collateral - debt` (may be negative if underwater),
   * `currentLtvBps = debt * 10_000 / collateral` (0 when collateral is 0).
   *
   * @param profileId - The Liquidium profile principal text.
   * @returns Derived position summary for the requested profile.
   */
  async getUserPositionSummary(
    profileId: string
  ): Promise<UserPositionSummary> {
    const { healthFactor, userStats } = await this.getHealthFactor(profileId);

    const collateral = userStats.collateral;
    const debt = userStats.debt;
    const maxBorrowableUsd = userStats.borrowingPower.maxBorrowableUsd;
    const availableBorrowsUsd =
      maxBorrowableUsd > debt ? maxBorrowableUsd - debt : 0n;
    const netWorthUsd = collateral - debt;
    const currentLtvBps =
      collateral > 0n ? (debt * BPS_SCALE) / collateral : 0n;

    return {
      totalCollateralUsd: collateral,
      totalDebtUsd: debt,
      availableBorrowsUsd,
      netWorthUsd,
      usdDecimals: USD_VALUE_SCALE_DECIMALS,
      currentLtvBps,
      weightedMaxLtvBps: userStats.borrowingPower.weightedMaxLtv,
      weightedLiquidationThresholdBps: userStats.weightedLiquidationThreshold,
      healthFactor,
    };
  }

  /**
   * Returns the per-reserve breakdown of a profile's supplies and borrows,
   * joined with pool metadata, rates, and current USD prices.
   *
   * USD values are scaled to 27 decimals.
   *
   * @param profileId - The Liquidium profile principal text.
   * @returns Per-reserve position rows joined with pool metadata and USD values.
   */
  async getUserReserves(profileId: string): Promise<UserReserve[]> {
    const [positions, pools, prices] = await Promise.all([
      this.listPositions(profileId),
      this.market.listPools(),
      this.market.getAssetPrices(),
    ]);

    const poolsById = new Map<string, Pool>(
      pools.map((pool) => [pool.id, pool])
    );

    return positions.flatMap((position) => {
      const pool = poolsById.get(position.poolId);
      if (!pool) {
        return [];
      }

      const priceUsd = prices[position.asset] ?? 0;

      return [
        {
          position,
          pool,
          priceUsd,
          suppliedUsd: nativeAmountToUsdScaled(
            position.deposited,
            position.depositedDecimals,
            priceUsd
          ),
          borrowedUsd: nativeAmountToUsdScaled(
            position.borrowed + position.debtInterest,
            position.borrowedDecimals,
            priceUsd
          ),
          usdDecimals: USD_VALUE_SCALE_DECIMALS,
        },
      ];
    });
  }

  /**
   * Returns the full repayment amount for a position, with a small buffer to
   * account for interest that accrues between quote and submit.
   *
   * @param profileId - The Liquidium profile principal text.
   * @param poolId - The pool principal text.
   * @param bufferBps - Optional buffer in basis points (default 10 = 0.1%).
   * @returns Buffered repayment amount in the borrowed asset's base units.
   */
  async getMaxRepayAmount(
    profileId: string,
    poolId: string,
    bufferBps: bigint = DEFAULT_REPAY_BUFFER_BPS
  ): Promise<MaxRepayAmount> {
    const position = await this.getPosition(profileId, poolId);
    if (!position) {
      return { amount: 0n, decimals: 0n };
    }

    const rawDebt = position.borrowed + position.debtInterest;
    if (rawDebt <= 0n) {
      return { amount: 0n, decimals: position.borrowedDecimals };
    }

    const buffered = (rawDebt * (BPS_SCALE + bufferBps)) / BPS_SCALE;

    return { amount: buffered, decimals: position.borrowedDecimals };
  }

  /**
   * Returns the current full withdraw amount for a position.
   *
   * `Position.deposited` already reflects the current supplied balance at the
   * latest lending index; do not add `earnedInterest` to this amount.
   * Pass `amount` to withdraw calls and use `decimals` for display formatting.
   *
   * @param profileId - The Liquidium profile principal text.
   * @param poolId - The pool principal text.
   * @returns Full withdraw amount in the supplied asset's base units.
   */
  async getFullWithdrawAmount(
    profileId: string,
    poolId: string
  ): Promise<FullWithdrawAmount> {
    const position = await this.getPosition(profileId, poolId);
    if (!position) {
      return { amount: 0n, decimals: 0n };
    }

    return { amount: position.deposited, decimals: position.depositedDecimals };
  }
}

function nativeAmountToUsdScaled(
  amount: bigint,
  nativeDecimals: bigint,
  priceUsd: number
): bigint {
  if (amount <= 0n || priceUsd <= 0) {
    return 0n;
  }

  const priceScaleDecimals = 12n;
  const priceScale = 10n ** priceScaleDecimals;
  const priceScaled = BigInt(Math.round(priceUsd * Number(priceScale)));
  const nativeToUsdScale = USD_VALUE_SCALE_DECIMALS - nativeDecimals;

  return (amount * priceScaled * 10n ** nativeToUsdScale) / priceScale;
}
