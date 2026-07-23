import { Asset, type Asset as AssetSymbol } from "./types";

const ASSET_ICON_BASE_URL = "https://app.liquidium.fi/img/logos/crypto";

/** Stable presentation metadata for an SDK-supported asset. */
export interface AssetMetadata {
  /** Canonical asset symbol used by SDK requests and responses. */
  symbol: AssetSymbol;
  /** Human-readable asset name. */
  displayName: string;
  /** Public Liquidium-hosted SVG icon URL. */
  iconUrl: string;
}

/** Presentation metadata keyed by SDK asset symbol. */
export const ASSET_METADATA: Readonly<Record<AssetSymbol, AssetMetadata>> = {
  [Asset.BTC]: {
    symbol: Asset.BTC,
    displayName: "Bitcoin",
    iconUrl: `${ASSET_ICON_BASE_URL}/btc.svg`,
  },
  [Asset.ETH]: {
    symbol: Asset.ETH,
    displayName: "Ethereum",
    iconUrl: `${ASSET_ICON_BASE_URL}/eth.svg`,
  },
  [Asset.ICP]: {
    symbol: Asset.ICP,
    displayName: "Internet Computer",
    iconUrl: `${ASSET_ICON_BASE_URL}/icp.svg`,
  },
  [Asset.USDC]: {
    symbol: Asset.USDC,
    displayName: "USD Coin",
    iconUrl: `${ASSET_ICON_BASE_URL}/usdc.svg`,
  },
  [Asset.USDT]: {
    symbol: Asset.USDT,
    displayName: "Tether USD",
    iconUrl: `${ASSET_ICON_BASE_URL}/usdt.svg`,
  },
};

/** Returns stable presentation metadata for an SDK-supported asset. */
export function getAssetMetadata(asset: AssetSymbol): AssetMetadata {
  return ASSET_METADATA[asset];
}
