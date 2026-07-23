import { Asset, type Asset as AssetSymbol } from "./types";

/** Stable presentation metadata for an SDK-supported asset. */
export interface AssetMetadata {
  /** Canonical asset symbol used by SDK requests and responses. */
  symbol: AssetSymbol;
  /** Human-readable asset name. */
  displayName: string;
}

/** Presentation metadata keyed by SDK asset symbol. */
export const ASSET_METADATA: Readonly<Record<AssetSymbol, AssetMetadata>> = {
  [Asset.BTC]: {
    symbol: Asset.BTC,
    displayName: "Bitcoin",
  },
  [Asset.ETH]: {
    symbol: Asset.ETH,
    displayName: "Ethereum",
  },
  [Asset.ICP]: {
    symbol: Asset.ICP,
    displayName: "Internet Computer",
  },
  [Asset.USDC]: {
    symbol: Asset.USDC,
    displayName: "USD Coin",
  },
  [Asset.USDT]: {
    symbol: Asset.USDT,
    displayName: "Tether USD",
  },
};

/** Returns stable presentation metadata for an SDK-supported asset. */
export function getAssetMetadata(asset: AssetSymbol): AssetMetadata {
  return ASSET_METADATA[asset];
}
