const ASSET_NATIVE_DECIMALS: Record<string, bigint> = {
  BTC: 8n,
  USDC: 6n,
  USDT: 6n,
  SOL: 9n,
};

const FALLBACK_NATIVE_DECIMALS = 8n;

export function getAssetNativeDecimals(asset: string): bigint {
  return ASSET_NATIVE_DECIMALS[asset] ?? FALLBACK_NATIVE_DECIMALS;
}
