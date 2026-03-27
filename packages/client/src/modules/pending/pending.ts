import { LiquidiumError, LiquidiumErrorCode } from "../../core/errors";
import type { ApiClient } from "../../core/transports/api-client";
import type { InternalProvider } from "../../core/transports/provider";
import type { PendingInflow, PendingMovements, PendingOutflow } from "./types";

export class PendingModule {
  constructor(
    readonly provider: InternalProvider,
    readonly apiClient: ApiClient | undefined
  ) {}

  async getMovements(profileId: string): Promise<PendingMovements> {
    void profileId;
    void this.provider;
    void this.apiClient;

    throw new LiquidiumError(
      LiquidiumErrorCode.INTERNAL,
      "Not yet implemented"
    );
  }

  async getInflows(profileId: string): Promise<PendingInflow[]> {
    void profileId;

    throw new LiquidiumError(
      LiquidiumErrorCode.INTERNAL,
      "Not yet implemented"
    );
  }

  async getOutflows(profileId: string): Promise<PendingOutflow[]> {
    void profileId;

    throw new LiquidiumError(
      LiquidiumErrorCode.INTERNAL,
      "Not yet implemented"
    );
  }
}
