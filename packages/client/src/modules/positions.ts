import { LiquidiumError, LiquidiumErrorCode } from "../errors";
import type { InternalProvider } from "../internal/provider";
import type { HealthFactor, Position, UserStats } from "../types";

/**
 * Position reads.
 *
 * All methods route through the canister.
 */
export class PositionsModule {
  /** @internal */
  constructor(readonly provider: InternalProvider) {}

  /**
   * Get a profile's position in a specific pool.
   * Returns null if the profile has no position in that pool.
   */
  async get(profileId: string, poolId: string): Promise<Position | null> {
    void profileId;
    void poolId;
    // TODO: wire to canister via LendingPool.get_position
    throw new LiquidiumError(
      LiquidiumErrorCode.INTERNAL,
      "Not yet implemented"
    );
  }

  /**
   * Get all positions for a profile across all pools.
   */
  async list(profileId: string): Promise<Position[]> {
    void profileId;
    // TODO: wire to canister via LendingPool.get_all_positions
    throw new LiquidiumError(
      LiquidiumErrorCode.INTERNAL,
      "Not yet implemented"
    );
  }

  /**
   * Get the health factor and user stats for a profile.
   */
  async getHealthFactor(profileId: string): Promise<HealthFactor> {
    void profileId;
    // TODO: wire to canister via LendingPool.get_health_factor
    throw new LiquidiumError(
      LiquidiumErrorCode.INTERNAL,
      "Not yet implemented"
    );
  }

  /**
   * Get aggregate stats (debt, collateral, borrowing power) for a profile.
   */
  async getUserStats(profileId: string): Promise<UserStats> {
    void profileId;
    // TODO: wire to canister via LendingPool.get_user_stats
    throw new LiquidiumError(
      LiquidiumErrorCode.INTERNAL,
      "Not yet implemented"
    );
  }
}
