import { LiquidiumError, LiquidiumErrorCode } from "../errors";
import type { ApiClient } from "../internal/api-client";

/**
 * User and pool history.
 *
 * All methods route through the API exclusively.
 */
export class HistoryModule {
  /** @internal */
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

  /**
   * Get transaction history for a user profile.
   */
  async getUser(
    profileId: string,
    cursor?: string
  ): Promise<PaginatedResponse<HistoryEntry>> {
    void this.requireApi();
    void profileId;
    void cursor;
    // TODO: wire to API via GET /v1/history/users/:profileId?cursor=...
    throw new LiquidiumError(
      LiquidiumErrorCode.INTERNAL,
      "Not yet implemented"
    );
  }

  /**
   * Get event history for a pool.
   */
  async getPool(
    poolId: string,
    cursor?: string
  ): Promise<PaginatedResponse<HistoryEntry>> {
    void this.requireApi();
    void poolId;
    void cursor;
    // TODO: wire to API via GET /v1/history/pools/:poolId?cursor=...
    throw new LiquidiumError(
      LiquidiumErrorCode.INTERNAL,
      "Not yet implemented"
    );
  }
}

export interface HistoryEntry {
  id: string;
  type: string;
  amount: bigint;
  asset: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  nextCursor?: string;
}
