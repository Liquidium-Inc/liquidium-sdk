import type { LiquidiumState, LiquidiumStatus } from "../../core/status";

/** User transaction kinds returned by profile transaction history. */
export type UserTransactionHistoryType =
  | "deposit"
  | "borrow"
  | "repayment"
  | "withdrawal"
  | "liquidation";
/** Any user history kind returned by the history API. */
export type UserHistoryType = UserTransactionHistoryType;

/** Lifecycle states accepted by profile transaction history filters. */
export type UserTransactionHistoryState = Exclude<
  LiquidiumState,
  "active" | "expired"
>;

interface BaseUserHistoryEntry {
  id: string;
  amount: bigint;
  poolId: string;
  timestamp: string;
  txids?: string[];
}

/** Deposit, borrow, repayment, withdrawal, or liquidation entry in user history. */
export interface UserTransactionHistoryEntry extends BaseUserHistoryEntry {
  /** Transaction history kind. */
  type: UserTransactionHistoryType;
  /** Current lifecycle status. */
  status: LiquidiumStatus;
}

/** Liquidation entry in user history. */
export interface UserLiquidationHistoryEntry extends BaseUserHistoryEntry {
  /** Liquidation kind discriminator. */
  type: "liquidation";
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
  states?: UserTransactionHistoryState[];
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

/** Generic SDK API paginated response. */
export interface PaginatedResponse<T> {
  /** Items in the current page. */
  items: T[];
  /** Cursor for the next page when more results are available. */
  nextCursor?: string;
}
