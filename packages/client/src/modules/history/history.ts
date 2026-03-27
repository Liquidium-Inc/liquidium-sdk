import { LiquidiumError, LiquidiumErrorCode } from "../../core/errors";
import type { ApiClient } from "../../core/transports/api-client";
import type { HistoryEntry, PaginatedResponse } from "./types";

export class HistoryModule {
  constructor(readonly apiClient: ApiClient | undefined) {}

  private requireApi(): ApiClient {
    if (!this.apiClient) {
      throw new LiquidiumError(
        LiquidiumErrorCode.SERVICE_UNAVAILABLE,
        "History requires an API base URL in client config"
      );
    }

    return this.apiClient;
  }

  async getUser(
    profileId: string,
    cursor?: string
  ): Promise<PaginatedResponse<HistoryEntry>> {
    void this.requireApi();
    void profileId;
    void cursor;

    throw new LiquidiumError(
      LiquidiumErrorCode.INTERNAL,
      "Not yet implemented"
    );
  }

  async getPool(
    poolId: string,
    cursor?: string
  ): Promise<PaginatedResponse<HistoryEntry>> {
    void this.requireApi();
    void poolId;
    void cursor;

    throw new LiquidiumError(
      LiquidiumErrorCode.INTERNAL,
      "Not yet implemented"
    );
  }
}
