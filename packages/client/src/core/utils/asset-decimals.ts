import { LiquidiumError, LiquidiumErrorCode } from "../errors";

const ASSET_NATIVE_DECIMALS = new Map([
  ["BTC", 8n],
  ["ETH", 18n],
  ["ICP", 8n],
  ["USDC", 6n],
  ["USDT", 6n],
  ["SOL", 9n],
]);

export function getAssetNativeDecimals(asset: string): bigint {
  const decimals = ASSET_NATIVE_DECIMALS.get(asset);

  if (decimals === undefined) {
    throw new LiquidiumError(
      LiquidiumErrorCode.VALIDATION_ERROR,
      `Native decimals are not configured for asset: ${asset}`
    );
  }

  return decimals;
}
