import { LiquidiumError, LiquidiumErrorCode } from "../../core/errors";
import type { ApiClient } from "../../core/transports/api-client";
import type {
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
   * Returns paginated activity for a Liquidium profile.
   *
   * @param profileId - The Liquidium profile principal text.
   * @param cursor - An optional pagination cursor from a previous response.
   * @returns A page of user history entries and the next cursor when more results are available.
   */
  async getUser(
    profileId: string,
    cursor?: string
  ): Promise<PaginatedResponse<UserHistoryEntry>> {
    const apiClient = this.requireApi();
    const requestPath = createHistoryPath(
      `/v1/history/user/${encodeURIComponent(profileId)}`,
      cursor
    );
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
   * Returns paginated history for a pool.
   *
   * @param poolId - The pool principal text.
   * @param cursor - An optional pagination cursor from a previous response.
   * @returns A page of pool history entries and the next cursor when more results are available.
   */
  async getPool(
    poolId: string,
    cursor?: string
  ): Promise<PaginatedResponse<PoolHistoryEntry>> {
    const apiClient = this.requireApi();
    const requestPath = createHistoryPath(
      `/v1/history/pool/${encodeURIComponent(poolId)}`,
      cursor
    );
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
        supplyCap: parseOptionalBigInt(item.supplyCap),
        borrowCap: parseOptionalBigInt(item.borrowCap),
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
        lastUpdated: parseOptionalBigInt(item.lastUpdated),
      })),
      nextCursor: response.nextCursor,
    };
  }
}

function createHistoryPath(basePath: string, cursor?: string): string {
  if (!cursor) {
    return basePath;
  }

  const query = new URLSearchParams({ cursor });
  return `${basePath}?${query.toString()}`;
}

function parseOptionalBigInt(value?: string): bigint | undefined {
  if (value === undefined) {
    return undefined;
  }

  return parseBigInt(value, "history bigint");
}

function parseBigInt(value: string, label: string): bigint {
  try {
    return BigInt(value);
  } catch (error) {
    throw new LiquidiumError(
      LiquidiumErrorCode.INTERNAL,
      `Invalid bigint returned for ${label}`,
      error
    );
  }
}
