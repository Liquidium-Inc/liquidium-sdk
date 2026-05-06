export interface UserHistoryEntry {
  id: string;
  type: "supply" | "borrow" | "repay" | "withdraw" | "liquidation";
  amount: bigint;
  poolId: string;
  timestamp: string;
  status: "REQUESTED" | "PENDING" | "CONFIRMED" | "FAILED";
  txids?: string[];
}

export interface UserTransactionHistoryFilters {
  cursor?: string;
  limit?: number;
  market?: string;
  poolId?: string;
  types?: UserHistoryEntry["type"][];
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

export interface ApySample {
  date: string;
  avgRate: bigint;
}

export interface ApySampleApiItem {
  date: string;
  avgRate: string;
}

export interface BorrowRateHistoryResponse {
  success: true;
  items: ApySampleApiItem[];
  nextCursor?: string;
}

export interface UserHistoryEntryApiItem {
  id: string;
  type: UserHistoryEntry["type"];
  amount: string;
  poolId: string;
  timestamp: string;
  status: UserHistoryEntry["status"];
  txids?: string[];
}

export interface UserHistoryResponse {
  success: true;
  items: UserHistoryEntryApiItem[];
  nextCursor?: string;
}

export interface PoolHistoryEntry {
  id: string;
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
  lastUpdated?: bigint;
}

export interface PoolHistoryEntryApiItem {
  id: string;
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
  lastUpdated?: string;
}

export interface PoolHistoryResponse {
  success: true;
  items: PoolHistoryEntryApiItem[];
  nextCursor?: string;
}

export type HistoryEntry = UserHistoryEntry | PoolHistoryEntry;

export interface PaginatedResponse<T> {
  items: T[];
  nextCursor?: string;
}
