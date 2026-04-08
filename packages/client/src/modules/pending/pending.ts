import { LiquidiumError, LiquidiumErrorCode } from "../../core/errors";
import type { ApiClient } from "../../core/transports/api-client";
import type { CanisterContext } from "../../core/transports/canister-context";
import type { PendingInflow, PendingMovements, PendingOutflow } from "./types";

export class PendingModule {
  constructor(
    readonly canisterContext: CanisterContext,
    readonly apiClient: ApiClient | undefined
  ) {}

  /**
   * Returns the pending inflows and outflows for a profile.
   */
  async getMovements(profileId: string): Promise<PendingMovements> {
    void profileId;
    void this.canisterContext;
    void this.apiClient;

    throw new LiquidiumError(
      LiquidiumErrorCode.INTERNAL,
      "Not yet implemented"
    );
  }

  /**
   * Returns pending inflows for a profile.
   */
  async getInflows(profileId: string): Promise<PendingInflow[]> {
    void profileId;

    throw new LiquidiumError(
      LiquidiumErrorCode.INTERNAL,
      "Not yet implemented"
    );
  }

  /**
   * Returns pending outflows for a profile.
   */
  async getOutflows(profileId: string): Promise<PendingOutflow[]> {
    void profileId;

    throw new LiquidiumError(
      LiquidiumErrorCode.INTERNAL,
      "Not yet implemented"
    );
  }
}
