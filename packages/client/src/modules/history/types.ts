export const UserHistoryStatus = {
  requested: "requested",
  pending: "pending",
  confirmed: "confirmed",
  failed: "failed",
} as const;
export type UserHistoryStatus =
  (typeof UserHistoryStatus)[keyof typeof UserHistoryStatus];
export type UserHistoryStatusApi = Uppercase<UserHistoryStatus>;

export type UserTransactionHistoryType =
  | "supply"
  | "borrow"
  | "repay"
  | "withdraw";
export type UserLiquidationHistoryType = "liquidation";
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

export interface UserTransactionHistoryEntry extends BaseUserHistoryEntry {
  type: UserTransactionHistoryType;
  status: UserHistoryStatus;
}

export interface UserLiquidationHistoryEntry extends BaseUserHistoryEntry {
  type: UserLiquidationHistoryType;
  status: typeof UserHistoryStatus.confirmed;
}

export type UserHistoryEntry =
  | UserTransactionHistoryEntry
  | UserLiquidationHistoryEntry;

export interface UserTransactionHistoryFilters {
  cursor?: string;
  limit?: number;
  market?: string;
  poolId?: string;
  types?: UserTransactionHistoryType[];
  statuses?: UserHistoryEntry["status"][];
  from?: string;
  to?: string;
}

export interface UserLiquidationHistoryFilters {
  cursor?: string;
  limit?: number;
  market?: string;
  poolId?: string;
  from?: string;
  to?: string;
}

export type ActivitiesRequest = UserTransactionHistoryFilters;

export interface BorrowApyHistoryRequest {
  cursor?: string;
  limit?: number;
  from?: string;
  to?: string;
}

export type PoolHistoryRequest = BorrowApyHistoryRequest;

export interface ApySample {
  date: string;
  rateDecimals: bigint;
  avgRate: bigint;
}

export interface ApySampleApiItem {
  date: string;
  rateDecimals: number;
  avgRate: string;
}

export interface BorrowRateHistoryResponse {
  success: true;
  items: ApySampleApiItem[];
  nextCursor?: string;
}

export interface UserHistoryEntryApiItem {
  id: string;
  type: UserHistoryType;
  amount: string;
  poolId: string;
  timestamp: string;
  status: UserHistoryStatusApi;
  txids?: string[];
}

export interface UserHistoryResponse {
  success: true;
  items: UserHistoryEntryApiItem[];
  nextCursor?: string;
}

export interface PoolHistoryEntry {
  date: string;
  rateDecimals: bigint;
  avgBorrowRate: bigint;
  avgLendRate: bigint;
  avgUtilizationRate: bigint;
}

export interface PoolHistoryEntryApiItem {
  date: string;
  rateDecimals: number;
  avgBorrowRate: string;
  avgLendRate: string;
  avgUtilizationRate: string;
}

export interface PoolHistoryResponse {
  success: true;
  items: PoolHistoryEntryApiItem[];
  nextCursor?: string;
}

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

export interface PoolConfigHistoryResponse {
  success: true;
  items: PoolConfigHistoryEntryApiItem[];
  nextCursor?: string;
}

export type HistoryEntry =
  | UserHistoryEntry
  | PoolHistoryEntry
  | PoolConfigHistoryEntry;

export interface PaginatedResponse<T> {
  items: T[];
  nextCursor?: string;
}
