import { LiquidiumError, LiquidiumErrorCode } from "../../core/errors";
import {
  buildHistoryUserLiquidationsPath,
  buildHistoryUserTransactionsPath,
  SdkApiQueryParam,
} from "../../core/sdk-api-paths";
import type { ApiClient } from "../../core/transports/api-client";
import { parseBigInt } from "../../core/utils/bigint";
import type {
  PaginatedResponse,
  UserHistoryResponse,
  UserLiquidationHistoryEntry,
  UserLiquidationHistoryFilters,
  UserTransactionHistoryEntry,
  UserTransactionHistoryFilters,
} from "./types";

/** Historical user transaction and liquidation data helpers. */
export class HistoryModule {
  constructor(private readonly apiClient: ApiClient | undefined) {}

  private requireApi(): ApiClient {
    if (!this.apiClient) {
      throw new LiquidiumError(
        LiquidiumErrorCode.VALIDATION_ERROR,
        "History requires an API client"
      );
    }

    return this.apiClient;
  }

  /**
   * Returns transaction history for a user.
   *
   * @param user - The Liquidium profile principal text.
   * @param filters - Optional pool, type, state, time range, and pagination filters.
   * @returns Paginated user history entries.
   */
  async getUserTransactionHistory(
    user: string,
    filters: UserTransactionHistoryFilters = {}
  ): Promise<PaginatedResponse<UserTransactionHistoryEntry>> {
    const apiClient = this.requireApi();
    const query = new URLSearchParams();

    if (filters.cursor) {
      query.set(SdkApiQueryParam.cursor, filters.cursor);
    }
    if (filters.market) {
      query.set(SdkApiQueryParam.market, filters.market);
    }
    if (filters.poolId) {
      query.set(SdkApiQueryParam.poolId, filters.poolId);
    }
    if (filters.operations?.length) {
      query.set(SdkApiQueryParam.operations, filters.operations.join(","));
    }
    if (filters.states?.length) {
      query.set(
        SdkApiQueryParam.states,
        createHistoryStateFilterParam(filters.states)
      );
    }
    if (filters.from) {
      query.set(SdkApiQueryParam.from, filters.from);
    }
    if (filters.to) {
      query.set(SdkApiQueryParam.to, filters.to);
    }
    if (filters.limit !== undefined) {
      query.set(SdkApiQueryParam.limit, String(filters.limit));
    }

    const requestPath = buildHistoryUserTransactionsPath(user, query);
    const response = await apiClient.get<UserHistoryResponse>(requestPath);

    return {
      items: response.items.map(mapUserTransactionHistoryEntry),
      nextCursor: response.nextCursor,
    };
  }

  /**
   * Returns liquidation history for a user.
   *
   * @param user - The Liquidium profile principal text.
   * @param filters - Optional pool, time range, and pagination filters.
   * @returns Paginated liquidation history entries.
   */
  async getLiquidationHistory(
    user: string,
    filters: UserLiquidationHistoryFilters = {}
  ): Promise<PaginatedResponse<UserLiquidationHistoryEntry>> {
    const apiClient = this.requireApi();
    const query = new URLSearchParams();
    if (filters.cursor) {
      query.set(SdkApiQueryParam.cursor, filters.cursor);
    }
    if (filters.market) {
      query.set(SdkApiQueryParam.market, filters.market);
    }
    if (filters.poolId) {
      query.set(SdkApiQueryParam.poolId, filters.poolId);
    }
    if (filters.from) {
      query.set(SdkApiQueryParam.from, filters.from);
    }
    if (filters.to) {
      query.set(SdkApiQueryParam.to, filters.to);
    }
    if (filters.limit !== undefined) {
      query.set(SdkApiQueryParam.limit, String(filters.limit));
    }

    const requestPath = buildHistoryUserLiquidationsPath(user, query);
    const response = await apiClient.get<UserHistoryResponse>(requestPath);

    return {
      items: response.items.map(mapUserLiquidationHistoryEntry),
      nextCursor: response.nextCursor,
    };
  }
}

function mapUserTransactionHistoryEntry(
  item: UserHistoryResponse["items"][number]
): UserTransactionHistoryEntry {
  return {
    id: item.id,
    amount: parseBigInt(item.amount, "history user amount"),
    poolId: item.poolId,
    timestamp: item.timestamp,
    status: item.status,
    txids: item.txids,
  };
}

function mapUserLiquidationHistoryEntry(
  item: UserHistoryResponse["items"][number]
): UserLiquidationHistoryEntry {
  if (
    item.status.operation !== "liquidation" ||
    item.status.state !== "completed"
  ) {
    throw new LiquidiumError(
      LiquidiumErrorCode.INTERNAL,
      `Invalid liquidation history status: ${item.status.state}`
    );
  }

  return {
    id: item.id,
    amount: parseBigInt(item.amount, "history user amount"),
    poolId: item.poolId,
    timestamp: item.timestamp,
    status: item.status,
    txids: item.txids,
  };
}

function createHistoryStateFilterParam(states: string[]): string {
  for (const state of states) {
    validateHistoryStateFilter(state);
  }

  return [...new Set(states)].join(",");
}

function validateHistoryStateFilter(state: string): void {
  switch (state) {
    case "action_required":
    case "confirming":
    case "processing":
    case "completed":
    case "failed":
      return;
    default:
      throw new LiquidiumError(
        LiquidiumErrorCode.VALIDATION_ERROR,
        `History state filter is not supported: ${state}`
      );
  }
}
