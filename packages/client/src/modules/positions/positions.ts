import { Principal } from "@dfinity/principal";
import { createLendingActor } from "../../core/canisters/lending/actor";
import { mapCanisterCallErrorToLiquidiumError } from "../../core/canisters/lending/error-mappers";
import { LiquidiumError } from "../../core/errors";
import type { CanisterContext } from "../../core/transports/canister-context";
import {
  mapPositionViewToPosition,
  mapUserStatsRecordToUserStats,
} from "./mappers";
import type { HealthFactor, Position, UserStats } from "./types";

export class PositionsModule {
  constructor(readonly canisterContext: CanisterContext) {}

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
      const result = await createLendingActor(
        this.canisterContext
      ).get_position(Principal.fromText(profileId), Principal.fromText(poolId));

      const view = result[0];
      if (!view) {
        return null;
      }

      return mapPositionViewToPosition(view);
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
      const actor = createLendingActor(this.canisterContext);
      const profilePrincipal = Principal.fromText(profileId);
      const stats = await actor.get_profile_stats(profilePrincipal);

      const positionViews = await Promise.all(
        stats.positions.map((position) =>
          actor.get_position(profilePrincipal, position.pool_id)
        )
      );

      return positionViews
        .map((result) => result[0])
        .filter((view): view is NonNullable<typeof view> => view !== undefined)
        .map(mapPositionViewToPosition);
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
      const [healthFactor, userStatsRecord] = await createLendingActor(
        this.canisterContext
      ).get_health_factor(Principal.fromText(profileId));

      return {
        healthFactor,
        userStats: mapUserStatsRecordToUserStats(userStatsRecord),
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
      const result = await createLendingActor(
        this.canisterContext
      ).get_profile_stats(Principal.fromText(profileId));

      return mapUserStatsRecordToUserStats(result);
    } catch (error) {
      if (error instanceof LiquidiumError) {
        throw error;
      }

      throw mapCanisterCallErrorToLiquidiumError("get_profile_stats", error);
    }
  }
}
