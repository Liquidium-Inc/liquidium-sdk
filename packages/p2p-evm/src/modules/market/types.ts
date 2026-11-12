import type { Address } from "viem";

/** One duration and rate pair a market accepts. */
export interface MarketTerm {
  /** Loan duration in seconds. */
  durationSeconds: number;
  /** Annual rate in basis points. */
  aprBps: number;
}

/** A collection and loan asset Liquidium lists. An offer must use one of its `terms` exactly. */
export interface Market {
  collectionSlug: string;
  /** Every contract of the collection. An offer names exactly one of them. */
  collections: Address[];
  asset: Address;
  assetSymbol: string;
  assetDecimals: number;
  terms: MarketTerm[];
}
