import { LiquidiumError, LiquidiumErrorCode } from "../../core/errors";
import {
  buildHistoryUserLiquidationsPath,
  buildHistoryUserTransactionsPath,
  buildProtocolActivityPath,
  SdkApiQueryParam,
} from "../../core/sdk-api-paths";
import type { ApiClient } from "../../core/transports/api-client";
import { parseBigInt } from "../../core/utils/bigint";
import type {
  PaginatedResponse,
  ProtocolActivityEntry,
  ProtocolActivityFeedFilters,
  ProtocolActivityOperation,
  UserHistoryResponse,
  UserLiquidationHistoryEntry,
  UserLiquidationHistoryFilters,
  UserTransactionHistoryEntry,
  UserTransactionHistoryFilters,
} from "./types";

interface ProtocolActivityEntryApiItem {
  id: string;
  operation: ProtocolActivityOperation;
  poolId: string;
  asset: string;
  decimals: number;
  amount: string;
  timestamp: string;
  txids?: string[];
}

interface ProtocolActivityFeedResponse {
  items: ProtocolActivityEntryApiItem[];
}

const MIN_HISTORY_LIMIT = 1;
const MAX_USER_HISTORY_LIMIT = 200;
const MAX_PROTOCOL_ACTIVITY_LIMIT = 100;

/** User and protocol history data helpers. */
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
   * @param profileId - The Liquidium profile principal text.
   * @param filters - Optional pool, operation, state, time range, and pagination filters.
   * @returns Paginated user history entries.
   */
  async getUserTransactionHistory(
    profileId: string,
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
      validateHistoryLimit(filters.limit, MAX_USER_HISTORY_LIMIT);
      query.set(SdkApiQueryParam.limit, String(filters.limit));
    }

    const requestPath = buildHistoryUserTransactionsPath(profileId, query);
    const response = await apiClient.get<UserHistoryResponse>(requestPath);

    return {
      items: response.items.map(mapUserTransactionHistoryEntry),
      nextCursor: response.nextCursor,
    };
  }

  /**
   * Returns liquidation history for a user.
   *
   * @param profileId - The Liquidium profile principal text.
   * @param filters - Optional pool, time range, and pagination filters.
   * @returns Paginated liquidation history entries.
   */
  async getLiquidationHistory(
    profileId: string,
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
      validateHistoryLimit(filters.limit, MAX_USER_HISTORY_LIMIT);
      query.set(SdkApiQueryParam.limit, String(filters.limit));
    }

    const requestPath = buildHistoryUserLiquidationsPath(profileId, query);
    const response = await apiClient.get<UserHistoryResponse>(requestPath);

    return {
      items: response.items.map(mapUserLiquidationHistoryEntry),
      nextCursor: response.nextCursor,
    };
  }

  /**
   * Returns recent protocol-wide lending activity across all users.
   *
   * @param filters - Optional pool, operation, and limit filters.
   * @returns Recent confirmed lending activity entries.
   */
  async getProtocolActivity(
    filters: ProtocolActivityFeedFilters = {}
  ): Promise<ProtocolActivityEntry[]> {
    const apiClient = this.requireApi();
    const query = new URLSearchParams();

    if (filters.poolId) {
      query.set(SdkApiQueryParam.poolId, filters.poolId);
    }
    if (filters.operations?.length) {
      query.set(SdkApiQueryParam.operations, filters.operations.join(","));
    }
    if (filters.limit !== undefined) {
      validateHistoryLimit(filters.limit, MAX_PROTOCOL_ACTIVITY_LIMIT);
      query.set(SdkApiQueryParam.limit, String(filters.limit));
    }

    const requestPath = buildProtocolActivityPath(query);
    const response =
      await apiClient.get<ProtocolActivityFeedResponse>(requestPath);

    return response.items.map(mapProtocolActivityEntry);
  }
}

function mapProtocolActivityEntry(
  item: ProtocolActivityEntryApiItem
): ProtocolActivityEntry {
  return {
    id: item.id,
    operation: item.operation,
    poolId: item.poolId,
    asset: item.asset,
    decimals: item.decimals,
    amount: parseBigInt(item.amount, "protocol activity amount"),
    timestamp: item.timestamp,
    txids: item.txids,
  };
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
    status: {
      operation: "liquidation",
      state: "completed",
      confirmations: null,
      requiredConfirmations: null,
    },
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

function validateHistoryLimit(limit: number, maximumLimit: number): void {
  if (
    Number.isInteger(limit) &&
    limit >= MIN_HISTORY_LIMIT &&
    limit <= maximumLimit
  ) {
    return;
  }

  throw new LiquidiumError(
    LiquidiumErrorCode.VALIDATION_ERROR,
    `History limit must be an integer between ${MIN_HISTORY_LIMIT} and ${maximumLimit}`
  );
}
