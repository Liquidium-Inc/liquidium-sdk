import { LiquidiumError, LiquidiumErrorCode } from "../../core/errors";
import { RATE_DECIMALS } from "../../core/rates";
import {
  buildHistoryPoolConfigPath,
  buildHistoryPoolPath,
  buildHistoryRatesPath,
  buildHistoryUserLiquidationsPath,
  buildHistoryUserTransactionsPath,
  SdkApiQueryParam,
} from "../../core/sdk-api-paths";
import type { LiquidiumState } from "../../core/status";
import type { ApiClient } from "../../core/transports/api-client";
import { parseBigInt, parseOptionalBigInt } from "../../core/utils/bigint";
import type {
  ApySample,
  BorrowApyHistoryRequest,
  BorrowRateHistoryResponse,
  PaginatedResponse,
  PoolConfigHistoryEntry,
  PoolConfigHistoryResponse,
  PoolHistoryEntry,
  PoolHistoryRequest,
  PoolHistoryResponse,
  UserHistoryResponse,
  UserLiquidationHistoryEntry,
  UserLiquidationHistoryFilters,
  UserTransactionHistoryEntry,
  UserTransactionHistoryFilters,
} from "./types";

/** Historical pool, rate, user transaction, and liquidation data helpers. */
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
   * Returns paginated rate and utilization history for a pool.
   *
   * @param poolId - The pool principal text.
   * @param window - Optional time window with from/to timestamps and limit.
   * @returns A page of pool rate history entries and the next cursor when more results are available.
   */
  async getPoolHistory(
    poolId: string,
    window: PoolHistoryRequest = {}
  ): Promise<PaginatedResponse<PoolHistoryEntry>> {
    const apiClient = this.requireApi();
    const query = createHistoryWindowQuery(window);
    const requestPath = buildHistoryPoolPath(poolId, query);
    const response = await apiClient.get<PoolHistoryResponse>(requestPath);

    return {
      items: response.items.map((item) => ({
        date: item.date,
        rateDecimals: RATE_DECIMALS,
        avgBorrowRate: parseBigInt(item.avgBorrowRate, "pool borrow rate"),
        avgLendRate: parseBigInt(item.avgLendRate, "pool lend rate"),
        avgUtilizationRate: parseBigInt(
          item.avgUtilizationRate,
          "pool utilization rate"
        ),
      })),
      nextCursor: response.nextCursor,
    };
  }

  /**
   * Returns paginated configuration change history for a pool.
   *
   * @param poolId - The pool principal text.
   * @param cursor - An optional pagination cursor from a previous response.
   * @returns A page of pool configuration changes and the next cursor when more results are available.
   */
  async getPoolConfigHistory(
    poolId: string,
    cursor?: string
  ): Promise<PaginatedResponse<PoolConfigHistoryEntry>> {
    const apiClient = this.requireApi();
    const requestPath = buildHistoryPoolConfigPath(poolId, cursor);
    const response =
      await apiClient.get<PoolConfigHistoryResponse>(requestPath);

    return {
      items: response.items.map((item) => ({
        type: item.type,
        poolId: item.poolId,
        asset: item.asset,
        chain: item.chain,
        timestamp: item.timestamp,
        totalSupply: parseBigInt(item.totalSupply, "pool history totalSupply"),
        totalDebt: parseBigInt(item.totalDebt, "pool history totalDebt"),
        supplyCap: parseOptionalBigInt(
          item.supplyCap,
          "pool history supplyCap"
        ),
        borrowCap: parseOptionalBigInt(
          item.borrowCap,
          "pool history borrowCap"
        ),
        maxLtv: parseBigInt(item.maxLtv, "pool history maxLtv"),
        liquidationThreshold: parseBigInt(
          item.liquidationThreshold,
          "pool history liquidationThreshold"
        ),
        liquidationBonus: parseBigInt(
          item.liquidationBonus,
          "pool history liquidationBonus"
        ),
        protocolLiquidationFee: parseBigInt(
          item.protocolLiquidationFee,
          "pool history protocolLiquidationFee"
        ),
        reserveFactor: parseBigInt(
          item.reserveFactor,
          "pool history reserveFactor"
        ),
        baseRate: parseBigInt(item.baseRate, "pool history baseRate"),
        optimalUtilizationRate: parseBigInt(
          item.optimalUtilizationRate,
          "pool history optimalUtilizationRate"
        ),
        rateSlopeBefore: parseBigInt(
          item.rateSlopeBefore,
          "pool history rateSlopeBefore"
        ),
        rateSlopeAfter: parseBigInt(
          item.rateSlopeAfter,
          "pool history rateSlopeAfter"
        ),
        lendingIndex: parseBigInt(
          item.lendingIndex,
          "pool history lendingIndex"
        ),
        borrowIndex: parseBigInt(item.borrowIndex, "pool history borrowIndex"),
        sameAssetBorrowing: item.sameAssetBorrowing,
        frozen: item.frozen,
      })),
      nextCursor: response.nextCursor,
    };
  }

  /**
   * Returns borrow rate history for a pool.
   *
   * @param poolId - The pool principal text.
   * @param window - Optional time window with from/to timestamps and limit.
   * @returns Paginated APY samples.
   */
  async getBorrowRateHistory(
    poolId: string,
    window: BorrowApyHistoryRequest = {}
  ): Promise<PaginatedResponse<ApySample>> {
    const apiClient = this.requireApi();
    const query = createHistoryWindowQuery(window);

    const requestPath = buildHistoryRatesPath(poolId, query);
    const response =
      await apiClient.get<BorrowRateHistoryResponse>(requestPath);

    return {
      items: response.items.map((item) => ({
        date: item.date,
        rateDecimals: RATE_DECIMALS,
        avgRate: parseBigInt(item.avgRate, "borrow rate"),
      })),
      nextCursor: response.nextCursor,
    };
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
    if (filters.types?.length) {
      query.set(SdkApiQueryParam.types, filters.types.join(","));
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
    type: item.type,
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
  if (item.type !== "liquidation") {
    throw new LiquidiumError(
      LiquidiumErrorCode.INTERNAL,
      `Invalid liquidation history type: ${item.type}`
    );
  }

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
    type: "liquidation",
    amount: parseBigInt(item.amount, "history user amount"),
    poolId: item.poolId,
    timestamp: item.timestamp,
    status: item.status,
    txids: item.txids,
  };
}

function createHistoryWindowQuery(
  window: BorrowApyHistoryRequest
): URLSearchParams {
  const query = new URLSearchParams();
  if (window.cursor) query.set(SdkApiQueryParam.cursor, window.cursor);
  if (window.from) query.set(SdkApiQueryParam.from, window.from);
  if (window.to) query.set(SdkApiQueryParam.to, window.to);
  if (window.limit !== undefined) {
    query.set(SdkApiQueryParam.limit, String(window.limit));
  }

  return query;
}

function createHistoryStateFilterParam(states: LiquidiumState[]): string {
  for (const state of states) {
    validateHistoryStateFilter(state);
  }

  return [...new Set(states)].join(",");
}

function validateHistoryStateFilter(state: LiquidiumState): void {
  switch (state) {
    case "action_required":
    case "confirming":
    case "processing":
    case "completed":
    case "failed":
      return;
    case "active":
    case "expired":
      throw new LiquidiumError(
        LiquidiumErrorCode.VALIDATION_ERROR,
        `History state filter is not supported: ${state}`
      );
  }
}
