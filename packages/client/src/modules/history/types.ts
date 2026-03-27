export interface HistoryEntry {
  id: string;
  type: string;
  amount: bigint;
  asset: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  nextCursor?: string;
}
