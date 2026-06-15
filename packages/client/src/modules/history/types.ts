import type { LiquidiumState, LiquidiumStatus } from "../../core/status";

/** User transaction kinds returned by profile transaction history. */
export type UserTransactionHistoryType =
  | "supply"
  | "borrow"
  | "repay"
  | "withdraw";
/** User liquidation history kind. */
export type UserLiquidationHistoryType = "liquidation";
/** Any user history kind returned by the history API. */
export type UserHistoryType =
  | UserTransactionHistoryType
  | UserLiquidationHistoryType;

interface BaseUserHistoryEntry {
  id: string;
  amount: bigint;
  poolId: string;
  timestamp: string;
  txids?: string[];
}

/** Supply, borrow, repay, or withdraw entry in user history. */
export interface UserTransactionHistoryEntry extends BaseUserHistoryEntry {
  /** Transaction history kind. */
  type: UserTransactionHistoryType;
  /** Current lifecycle status. */
  status: LiquidiumStatus;
}

/** Liquidation entry in user history. */
export interface UserLiquidationHistoryEntry extends BaseUserHistoryEntry {
  /** Liquidation kind discriminator. */
  type: UserLiquidationHistoryType;
  /** Current lifecycle status. */
  status: LiquidiumStatus;
}

/** Any consumer-facing profile history entry. */
export type UserHistoryEntry =
  | UserTransactionHistoryEntry
  | UserLiquidationHistoryEntry;

/** Filters for profile transaction history requests. */
export interface UserTransactionHistoryFilters {
  /** Pagination cursor from a previous response. */
  cursor?: string;
  /** Maximum number of entries to return. */
  limit?: number;
  /** Market filter accepted by the SDK API. */
  market?: string;
  /** Pool principal text filter. */
  poolId?: string;
  /** Transaction kind filters. */
  types?: UserTransactionHistoryType[];
  /** Lifecycle state filters. */
  states?: LiquidiumState[];
  /** Inclusive start timestamp filter accepted by the SDK API. */
  from?: string;
  /** Inclusive end timestamp filter accepted by the SDK API. */
  to?: string;
}

/** Filters for profile liquidation history requests. */
export interface UserLiquidationHistoryFilters {
  /** Pagination cursor from a previous response. */
  cursor?: string;
  /** Maximum number of entries to return. */
  limit?: number;
  /** Market filter accepted by the SDK API. */
  market?: string;
  /** Pool principal text filter. */
  poolId?: string;
  /** Inclusive start timestamp filter accepted by the SDK API. */
  from?: string;
  /** Inclusive end timestamp filter accepted by the SDK API. */
  to?: string;
}

/** Backwards-compatible alias for user transaction history filters. */
export type ActivitiesRequest = UserTransactionHistoryFilters;

/** Time-window and pagination options for borrow APY history. */
export interface BorrowApyHistoryRequest {
  /** Pagination cursor from a previous response. */
  cursor?: string;
  /** Maximum number of samples to return. */
  limit?: number;
  /** Inclusive start timestamp filter accepted by the SDK API. */
  from?: string;
  /** Inclusive end timestamp filter accepted by the SDK API. */
  to?: string;
}

/** Time-window and pagination options for pool rate history. */
export type PoolHistoryRequest = BorrowApyHistoryRequest;

/** Borrow APY sample returned to SDK consumers. */
export interface ApySample {
  /** Sample date from the SDK API. */
  date: string;
  /** Decimal scale for `avgRate`. */
  rateDecimals: bigint;
  /** Average borrow rate for the sample, scaled by `rateDecimals`. */
  avgRate: bigint;
}

/** Wire-format borrow APY sample returned by the SDK API. */
export interface ApySampleApiItem {
  date: string;
  rateDecimals: number;
  avgRate: string;
}

/** Wire-format borrow rate history response returned by the SDK API. */
export interface BorrowRateHistoryResponse {
  success: true;
  items: ApySampleApiItem[];
  nextCursor?: string;
}

/** Wire-format user history item returned by the SDK API. */
export interface UserHistoryEntryApiItem {
  id: string;
  type: UserHistoryType;
  amount: string;
  poolId: string;
  timestamp: string;
  status: LiquidiumStatus;
  txids?: string[];
}

/** Wire-format user history page returned by the SDK API. */
export interface UserHistoryResponse {
  success: true;
  items: UserHistoryEntryApiItem[];
  nextCursor?: string;
}

/** Pool rate and utilization history entry returned to SDK consumers. */
export interface PoolHistoryEntry {
  /** Sample date from the SDK API. */
  date: string;
  /** Decimal scale for rate fields. */
  rateDecimals: bigint;
  /** Average borrow rate for the sample, scaled by `rateDecimals`. */
  avgBorrowRate: bigint;
  /** Average lend rate for the sample, scaled by `rateDecimals`. */
  avgLendRate: bigint;
  /** Average utilization rate for the sample, scaled by `rateDecimals`. */
  avgUtilizationRate: bigint;
}

/** Wire-format pool rate history item returned by the SDK API. */
export interface PoolHistoryEntryApiItem {
  date: string;
  rateDecimals: number;
  avgBorrowRate: string;
  avgLendRate: string;
  avgUtilizationRate: string;
}

/** Wire-format pool rate history page returned by the SDK API. */
export interface PoolHistoryResponse {
  success: true;
  items: PoolHistoryEntryApiItem[];
  nextCursor?: string;
}

/** Pool configuration snapshot returned to SDK consumers. */
export interface PoolConfigHistoryEntry {
  type: "configuration_change";
  poolId: string;
  asset: string;
  chain: string;
  timestamp: string;
  totalSupply: bigint;
  totalDebt: bigint;
  supplyCap?: bigint;
  borrowCap?: bigint;
  maxLtv: bigint;
  liquidationThreshold: bigint;
  liquidationBonus: bigint;
  protocolLiquidationFee: bigint;
  reserveFactor: bigint;
  baseRate: bigint;
  optimalUtilizationRate: bigint;
  rateSlopeBefore: bigint;
  rateSlopeAfter: bigint;
  lendingIndex: bigint;
  borrowIndex: bigint;
  sameAssetBorrowing: boolean;
  frozen: boolean;
}

/** Wire-format pool configuration history item returned by the SDK API. */
export interface PoolConfigHistoryEntryApiItem {
  type: "configuration_change";
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
}

/** Wire-format pool configuration history page returned by the SDK API. */
export interface PoolConfigHistoryResponse {
  success: true;
  items: PoolConfigHistoryEntryApiItem[];
  nextCursor?: string;
}

/** Any history entry returned by history module methods. */
export type HistoryEntry =
  | UserHistoryEntry
  | PoolHistoryEntry
  | PoolConfigHistoryEntry;

/** Generic SDK API paginated response. */
export interface PaginatedResponse<T> {
  /** Items in the current page. */
  items: T[];
  /** Cursor for the next page when more results are available. */
  nextCursor?: string;
}
