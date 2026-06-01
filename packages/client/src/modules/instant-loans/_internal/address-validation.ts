import { normalizeExternalAddress } from "../../../core/address-validation";
import type { InstantLoanAsset } from "../types";

export function validateInstantLoanBorrowDestination(
  address: string,
  asset: InstantLoanAsset
): string {
  return normalizeExternalAddress({
    address,
    asset,
  });
}

export function validateInstantLoanRefundDestination(
  address: string,
  asset: InstantLoanAsset
): string {
  return normalizeExternalAddress({
    address,
    asset,
  });
}
