import { LiquidiumError, LiquidiumErrorCode } from "../../core/errors";
import {
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
  PoolHistoryEntry,
  PoolHistoryResponse,
  UserHistoryEntry,
  UserHistoryResponse,
} from "./types";

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

  /**
   * Returns paginated history for a pool.
   *
   * @param poolId - The pool principal text.
   * @param cursor - An optional pagination cursor from a previous response.
   * @returns A page of pool history entries and the next cursor when more results are available.
   */
  async getPoolHistory(
    poolId: string,
    cursor?: string
  ): Promise<PaginatedResponse<PoolHistoryEntry>> {
    const apiClient = this.requireApi();
    const requestPath = buildHistoryPoolPath(poolId, cursor);
    const response = await apiClient.get<PoolHistoryResponse>(requestPath);

    return {
      items: response.items.map((item) => ({
        id: item.id,
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
        lastUpdated: parseOptionalBigInt(
          item.lastUpdated,
          "pool history lastUpdated"
        ),
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
    const query = new URLSearchParams();
    if (window.cursor) query.set(SdkApiQueryParam.cursor, window.cursor);
    if (window.from) query.set(SdkApiQueryParam.from, window.from);
    if (window.to) query.set(SdkApiQueryParam.to, window.to);
    if (window.limit !== undefined) {
      query.set(SdkApiQueryParam.limit, String(window.limit));
    }

    const requestPath = buildHistoryRatesPath(poolId, query);
    const response =
      await apiClient.get<BorrowRateHistoryResponse>(requestPath);

    return {
      items: response.items.map((item) => ({
        date: item.date,
        avgRate: parseBigInt(item.avgRate, "borrow rate"),
      })),
      nextCursor: response.nextCursor,
    };
  }

  /**
   * Returns transaction history for a user.
   *
   * @param user - The Liquidium profile principal text.
   * @param market - Optional pool identifier to filter by.
   * @param filters - Optional filters for time range and pagination.
   * @returns Paginated user history entries.
   */
  async getUserTransactionHistory(
    user: string,
    market?: string,
    filters: {
      cursor?: string;
      from?: string;
      to?: string;
      limit?: number;
    } = {}
  ): Promise<PaginatedResponse<UserHistoryEntry>> {
    const apiClient = this.requireApi();
    const query = new URLSearchParams();

    if (filters.cursor) query.set(SdkApiQueryParam.cursor, filters.cursor);
    if (market) query.set(SdkApiQueryParam.market, market);
    if (filters.from) query.set(SdkApiQueryParam.from, filters.from);
    if (filters.to) query.set(SdkApiQueryParam.to, filters.to);
    if (filters.limit !== undefined) {
      query.set(SdkApiQueryParam.limit, String(filters.limit));
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
        txid: item.txid,
        txids: item.txids,
      })),
      nextCursor: response.nextCursor,
    };
  }

  /**
   * Returns liquidation history for a user.
   *
   * @param user - The Liquidium profile principal text.
   * @param market - Optional pool identifier to filter by.
   * @returns Paginated liquidation history entries.
   */
  async getLiquidationHistory(
    user: string,
    market?: string
  ): Promise<PaginatedResponse<UserHistoryEntry>> {
    const apiClient = this.requireApi();
    const query = new URLSearchParams();
    if (market) query.set(SdkApiQueryParam.market, market);

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
        txid: item.txid,
        txids: item.txids,
      })),
      nextCursor: response.nextCursor,
    };
  }
}
