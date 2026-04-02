import { LiquidiumError, LiquidiumErrorCode } from "../../core/errors";
import type { ApiClient } from "../../core/transports/api-client";
import type {
  PaginatedResponse,
  PoolHistoryEntry,
  UserHistoryEntry,
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

  async getUser(
    profileId: string,
    cursor?: string
  ): Promise<PaginatedResponse<UserHistoryEntry>> {
    const apiClient = this.requireApi();
    const requestPath = createHistoryPath(
      `/v1/history/user/${encodeURIComponent(profileId)}`,
      cursor
    );
    const response = await apiClient.get<{
      success: true;
      items: Array<{
        id: string;
        type: UserHistoryEntry["type"];
        amount: string;
        poolId: string;
        timestamp: string;
        status: UserHistoryEntry["status"];
        txid?: string;
        txids?: string[];
      }>;
      nextCursor?: string;
    }>(requestPath);

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

  async getPool(
    poolId: string,
    cursor?: string
  ): Promise<PaginatedResponse<PoolHistoryEntry>> {
    const apiClient = this.requireApi();
    const requestPath = createHistoryPath(
      `/v1/history/pool/${encodeURIComponent(poolId)}`,
      cursor
    );
    const response = await apiClient.get<{
      success: true;
      items: Array<{
        id: string;
        type: "snapshot";
        poolId: string;
        asset: string;
        chain: string;
        timestamp: string;
        totalSupply: string;
        totalDebt: string;
        supplyCap?: string;
        borrowCap?: string;
        maxLtv: string;
        liquidationThreshold: string;
        liquidationBonus: string;
        protocolLiquidationFee: string;
        reserveFactor: string;
        baseRate: string;
        optimalUtilizationRate: string;
        rateSlopeBefore: string;
        rateSlopeAfter: string;
        lendingIndex: string;
        borrowIndex: string;
        sameAssetBorrowing: boolean;
        frozen: boolean;
        lastUpdated?: string;
      }>;
      nextCursor?: string;
    }>(requestPath);

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
        borrowIndex: parseBigInt(
          item.borrowIndex,
          "pool history borrowIndex"
        ),
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
