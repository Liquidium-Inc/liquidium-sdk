import { normalizeExternalAddress } from "../../../core/address-validation";
import { Asset, Chain } from "../../../core/types";
import type { InstantLoanAsset } from "../types";

export function validateInstantLoanBorrowDestination(
  address: string,
  asset: InstantLoanAsset
): string {
  return normalizeExternalAddress({
    address,
    asset,
    chain: getChainForInstantLoanAsset(asset),
  });
}

export function validateInstantLoanRefundDestination(
  address: string,
  asset: InstantLoanAsset
): string {
  return normalizeExternalAddress({
    address,
    asset,
    chain: getChainForInstantLoanAsset(asset),
  });
}

function getChainForInstantLoanAsset(asset: InstantLoanAsset): string {
  if (asset === Asset.BTC) return Chain.BTC;
  if (asset === Asset.USDC || asset === Asset.USDT) return Chain.ETH;

  return asset;
}
