import { LiquidiumError, LiquidiumErrorCode } from "../../core/errors";
import type { CanisterContext } from "../../core/transports/canister-context";
import type { HealthFactor, Position, UserStats } from "./types";

export class PositionsModule {
  constructor(readonly canisterContext: CanisterContext) {}

  async get(profileId: string, poolId: string): Promise<Position | null> {
    void profileId;
    void poolId;

    throw new LiquidiumError(
      LiquidiumErrorCode.INTERNAL,
      "Not yet implemented"
    );
  }

  async list(profileId: string): Promise<Position[]> {
    void profileId;

    throw new LiquidiumError(
      LiquidiumErrorCode.INTERNAL,
      "Not yet implemented"
    );
  }

  async getHealthFactor(profileId: string): Promise<HealthFactor> {
    void profileId;

    throw new LiquidiumError(
      LiquidiumErrorCode.INTERNAL,
      "Not yet implemented"
    );
  }

  async getUserStats(profileId: string): Promise<UserStats> {
    void profileId;

    throw new LiquidiumError(
      LiquidiumErrorCode.INTERNAL,
      "Not yet implemented"
    );
  }
}
