import { normalizeExternalAddress } from "../../../core/address-validation";
import type { Chain } from "../../../core/types";
import type { SimpleLoanAsset } from "../types";

export function validateSimpleLoanBorrowDestination(
  address: string,
  asset: SimpleLoanAsset,
  chain: Chain
): string {
  return normalizeExternalAddress({
    address,
    asset,
    chain,
  });
}

export function validateSimpleLoanRefundDestination(
  address: string,
  asset: SimpleLoanAsset,
  chain: Chain
): string {
  return normalizeExternalAddress({
    address,
    asset,
    chain,
  });
}
