import { normalizeExternalAddress } from "../../../core/address-validation";
import type { Chain } from "../../../core/types";
import type { InstantLoanAsset } from "../types";

export function validateInstantLoanBorrowDestination(
  address: string,
  asset: InstantLoanAsset,
  chain: Chain
): string {
  return normalizeExternalAddress({
    address,
    asset,
    chain,
  });
}

export function validateInstantLoanRefundDestination(
  address: string,
  asset: InstantLoanAsset,
  chain: Chain
): string {
  return normalizeExternalAddress({
    address,
    asset,
    chain,
  });
}
