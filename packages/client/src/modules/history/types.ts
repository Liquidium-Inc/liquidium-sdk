export interface UserHistoryEntry {
  id: string;
  type: "supply" | "borrow" | "repay" | "withdraw" | "liquidation";
  amount: bigint;
  poolId: string;
  timestamp: string;
  status: "REQUESTED" | "PENDING" | "CONFIRMED" | "FAILED";
  txid?: string;
  txids?: string[];
}

export interface PoolHistoryEntry {
  id: string;
  type: "snapshot";
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

export type HistoryEntry = UserHistoryEntry | PoolHistoryEntry;

export interface PaginatedResponse<T> {
  items: T[];
  nextCursor?: string;
}
