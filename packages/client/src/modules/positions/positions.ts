import { Principal } from "@dfinity/principal";
import { createLendingActor } from "../../core/canisters/lending/actor";
import { LiquidiumError, LiquidiumErrorCode } from "../../core/errors";
import type { CanisterContext } from "../../core/transports/canister-context";
import type { HealthFactor, Position, UserStats } from "./types";

const USD_VALUE_SCALE_DECIMALS = 27n;

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
    void profileId;
    void poolId;

    throw new LiquidiumError(
      LiquidiumErrorCode.INTERNAL,
      "Not yet implemented"
    );
  }

  /**
   * Lists all positions for a profile.
   *
   * @param profileId - The Liquidium profile principal text.
   * @returns All positions currently associated with the requested profile.
   */
  async listPositions(profileId: string): Promise<Position[]> {
    void profileId;

    throw new LiquidiumError(
      LiquidiumErrorCode.INTERNAL,
      "Not yet implemented"
    );
  }

  /**
   * Returns the current health factor for a profile.
   *
   * @param profileId - The Liquidium profile principal text.
   * @returns The current health factor for the requested profile.
   */
  async getHealthFactor(profileId: string): Promise<HealthFactor> {
    void profileId;

    throw new LiquidiumError(
      LiquidiumErrorCode.INTERNAL,
      "Not yet implemented"
    );
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

      return {
        debt: result.debt,
        debtDecimals: USD_VALUE_SCALE_DECIMALS,
        collateral: result.collateral,
        collateralDecimals: USD_VALUE_SCALE_DECIMALS,
        weightedLiquidationThreshold: result.weighted_liquidation_threshold,
        borrowingPower: {
          weightedMaxLtv: result.borrowing_power.weighted_max_ltv,
          maxBorrowableUsd: result.borrowing_power.max_borrowable_usd,
          maxBorrowableUsdDecimals: USD_VALUE_SCALE_DECIMALS,
        },
      };
    } catch (error) {
      if (error instanceof LiquidiumError) {
        throw error;
      }

      throw new LiquidiumError(
        LiquidiumErrorCode.CANISTER_REJECTED,
        "Canister call failed: get_profile_stats",
        error
      );
    }
  }
}
