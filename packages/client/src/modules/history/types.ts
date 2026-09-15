import type {
  LiquidiumOperation,
  LiquidiumState,
  LiquidiumStatus,
} from "../../core/status";

/** User transaction operations returned by profile transaction history. */
export type UserTransactionHistoryOperation = LiquidiumOperation;
/** Any user history operation returned by the history API. */
export type UserHistoryOperation = UserTransactionHistoryOperation;

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
  /** Current lifecycle status. */
  status: LiquidiumStatus;
}

/** Liquidation entry in user history. */
export interface UserLiquidationHistoryEntry extends BaseUserHistoryEntry {
  /** Completed liquidation status. */
  status: UserLiquidationHistoryStatus;
}

/** Status returned by profile liquidation history. */
export interface UserLiquidationHistoryStatus {
  operation: "liquidation";
  state: "completed";
  confirmations: null;
  requiredConfirmations: null;
}

/** Any consumer-facing profile history entry. */
export type UserHistoryEntry =
  | UserTransactionHistoryEntry
  | UserLiquidationHistoryEntry;

/** Filters for profile transaction history requests. */
export interface UserTransactionHistoryFilters {
  /** Pagination cursor from a previous response. */
  cursor?: string;
  /** Number of entries to return, from 1 to 200. Defaults to 50. */
  limit?: number;
  /** Alias for poolId. Ignored when poolId is provided. */
  market?: string;
  /** Pool principal text filter. */
  poolId?: string;
  /** Transaction operation filters. */
  operations?: UserTransactionHistoryOperation[];
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
  /** Number of entries to return, from 1 to 200. Defaults to 50. */
  limit?: number;
  /** Alias for poolId. Ignored when poolId is provided. */
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
  amount: string;
  poolId: string;
  timestamp: string;
  status: LiquidiumStatus;
  txids?: string[];
}

/** Wire-format user history page returned by the SDK API. */
export interface UserHistoryResponse {
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

/** Protocol-wide lending activity operation. */
export type ProtocolActivityOperation = LiquidiumOperation;

/** Completed protocol-wide lending activity entry. */
export interface ProtocolActivityEntry {
  id: string;
  /** Lending operation that produced this activity. */
  operation: ProtocolActivityOperation;
  /** Pool principal text the activity belongs to. */
  poolId: string;
  /** Asset ticker of the pool. */
  asset: string;
  /** Decimal places of the raw amount. */
  decimals: number;
  /** Raw amount in base units. */
  amount: bigint;
  /** ISO-8601 timestamp of the confirmed activity. */
  timestamp: string;
  /** Chain transaction identifiers, when available. */
  txids?: string[];
}

/** Filters for protocol-wide activity feed requests. */
export interface ProtocolActivityFeedFilters {
  /** Number of entries to return, from 1 to 100. Defaults to 50. */
  limit?: number;
  /** Pool principal text filter. */
  poolId?: string;
  /** Operation filters. */
  operations?: ProtocolActivityOperation[];
}
