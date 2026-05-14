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
  UserHistoryEntry,
  UserHistoryResponse,
  UserLiquidationHistoryFilters,
  UserTransactionHistoryFilters,
} from "./types";

export class HistoryModule {
  constructor(readonly apiClient: ApiClient | undefined) {}

  private requireApi(): ApiClient {
    if (!this.apiClient) {
      throw new LiquidiumError(
        LiquidiumErrorCode.VALIDATION_ERROR,
        "History requires an API base URL in client config"
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
   * @param filters - Optional pool, type, status, time range, and pagination filters.
   * @returns Paginated user history entries.
   */
  async getUserTransactionHistory(
    user: string,
    filters?: UserTransactionHistoryFilters
  ): Promise<PaginatedResponse<UserHistoryEntry>>;
  async getUserTransactionHistory(
    user: string,
    market?: string,
    filters?: UserTransactionHistoryFilters
  ): Promise<PaginatedResponse<UserHistoryEntry>>;
  async getUserTransactionHistory(
    user: string,
    marketOrFilters?: string | UserTransactionHistoryFilters,
    filters: UserTransactionHistoryFilters = {}
  ): Promise<PaginatedResponse<UserHistoryEntry>> {
    const apiClient = this.requireApi();
    const normalizedFilters = normalizeTransactionHistoryFilters(
      marketOrFilters,
      filters
    );
    const query = new URLSearchParams();

    if (normalizedFilters.cursor) {
      query.set(SdkApiQueryParam.cursor, normalizedFilters.cursor);
    }
    if (normalizedFilters.market) {
      query.set(SdkApiQueryParam.market, normalizedFilters.market);
    }
    if (normalizedFilters.poolId) {
      query.set(SdkApiQueryParam.poolId, normalizedFilters.poolId);
    }
    if (normalizedFilters.types?.length) {
      query.set(SdkApiQueryParam.types, normalizedFilters.types.join(","));
    }
    if (normalizedFilters.statuses?.length) {
      query.set(
        SdkApiQueryParam.statuses,
        normalizedFilters.statuses.join(",")
      );
    }
    if (normalizedFilters.from) {
      query.set(SdkApiQueryParam.from, normalizedFilters.from);
    }
    if (normalizedFilters.to) {
      query.set(SdkApiQueryParam.to, normalizedFilters.to);
    }
    if (normalizedFilters.limit !== undefined) {
      query.set(SdkApiQueryParam.limit, String(normalizedFilters.limit));
    }

    const requestPath = buildHistoryUserTransactionsPath(user, query);
    const response = await apiClient.get<UserHistoryResponse>(requestPath);

    return {
      items: response.items.map((item) => ({
        id: item.id,
        type: item.type,
        amount: parseBigInt(item.amount, "history user amount"),
        poolId: item.poolId,
        timestamp: item.timestamp,
        status: item.status,
        txids: item.txids,
      })),
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
    filters?: UserLiquidationHistoryFilters
  ): Promise<PaginatedResponse<UserHistoryEntry>>;
  async getLiquidationHistory(
    user: string,
    market?: string,
    filters?: UserLiquidationHistoryFilters
  ): Promise<PaginatedResponse<UserHistoryEntry>>;
  async getLiquidationHistory(
    user: string,
    marketOrFilters?: string | UserLiquidationHistoryFilters,
    filters: UserLiquidationHistoryFilters = {}
  ): Promise<PaginatedResponse<UserHistoryEntry>> {
    const apiClient = this.requireApi();
    const normalizedFilters = normalizeLiquidationHistoryFilters(
      marketOrFilters,
      filters
    );
    const query = new URLSearchParams();
    if (normalizedFilters.cursor) {
      query.set(SdkApiQueryParam.cursor, normalizedFilters.cursor);
    }
    if (normalizedFilters.market) {
      query.set(SdkApiQueryParam.market, normalizedFilters.market);
    }
    if (normalizedFilters.poolId) {
      query.set(SdkApiQueryParam.poolId, normalizedFilters.poolId);
    }
    if (normalizedFilters.from) {
      query.set(SdkApiQueryParam.from, normalizedFilters.from);
    }
    if (normalizedFilters.to) {
      query.set(SdkApiQueryParam.to, normalizedFilters.to);
    }
    if (normalizedFilters.limit !== undefined) {
      query.set(SdkApiQueryParam.limit, String(normalizedFilters.limit));
    }

    const requestPath = buildHistoryUserLiquidationsPath(user, query);
    const response = await apiClient.get<UserHistoryResponse>(requestPath);

    return {
      items: response.items.map((item) => ({
        id: item.id,
        type: item.type,
        amount: parseBigInt(item.amount, "history user amount"),
        poolId: item.poolId,
        timestamp: item.timestamp,
        status: item.status,
        txids: item.txids,
      })),
      nextCursor: response.nextCursor,
    };
  }
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

function normalizeTransactionHistoryFilters(
  marketOrFilters: string | UserTransactionHistoryFilters | undefined,
  filters: UserTransactionHistoryFilters
): UserTransactionHistoryFilters {
  if (typeof marketOrFilters === "string") {
    return { ...filters, market: marketOrFilters };
  }

  return { ...(marketOrFilters ?? {}), ...filters };
}

function normalizeLiquidationHistoryFilters(
  marketOrFilters: string | UserLiquidationHistoryFilters | undefined,
  filters: UserLiquidationHistoryFilters
): UserLiquidationHistoryFilters {
  if (typeof marketOrFilters === "string") {
    return { ...filters, market: marketOrFilters };
  }

  return { ...(marketOrFilters ?? {}), ...filters };
}
