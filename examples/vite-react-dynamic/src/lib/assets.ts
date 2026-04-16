const DEFAULT_ASSET_DECIMALS = 8;

const ASSET_DECIMALS: Record<string, number> = {
  BTC: 8,
  USDC: 6,
  USDT: 6,
};

export function getAssetDecimals(asset: string): number {
  return ASSET_DECIMALS[asset] ?? DEFAULT_ASSET_DECIMALS;
}

export function isStablecoinAsset(asset: string): boolean {
  return asset === "USDC" || asset === "USDT";
}
