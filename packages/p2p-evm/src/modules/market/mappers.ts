import type { Market } from "./types";

export interface MarketApiItem {
  collectionSlug: string;
  collections: `0x${string}`[];
  asset: `0x${string}`;
  assetSymbol: string;
  assetDecimals: number;
  terms: { durationSeconds: number; aprBps: number }[];
}

export function toMarket(item: MarketApiItem): Market {
  return {
    collectionSlug: item.collectionSlug,
    collections: item.collections,
    asset: item.asset,
    assetSymbol: item.assetSymbol,
    assetDecimals: item.assetDecimals,
    terms: item.terms.map((term) => ({
      durationSeconds: term.durationSeconds,
      aprBps: term.aprBps,
    })),
  };
}
