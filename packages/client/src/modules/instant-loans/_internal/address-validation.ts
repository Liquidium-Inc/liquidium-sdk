import { normalizeExternalAddress } from "../../../core/address-validation";
import { LiquidiumError, LiquidiumErrorCode } from "../../../core/errors";
import type { InstantLoanAsset } from "../types";

export function validateInstantLoanBorrowDestination(
  address: string,
  asset: InstantLoanAsset
): string {
  const result = normalizeExternalAddress({
    address,
    asset,
  });

  if (result.success) {
    return result.address;
  }

  if (result.error === "invalid_mainnet_btc_address") {
    throw new LiquidiumError(
      LiquidiumErrorCode.INVALID_ADDRESS,
      "Instant loan borrow destination must be a valid mainnet BTC address"
    );
  }

  throw new LiquidiumError(
    LiquidiumErrorCode.INVALID_ADDRESS,
    "Instant loan borrow destination must be a valid EVM address"
  );
}

export function validateInstantLoanRefundDestination(
  address: string,
  asset: InstantLoanAsset
): string {
  const result = normalizeExternalAddress({
    address,
    asset,
  });

  if (result.success) {
    return result.address;
  }

  if (result.error === "invalid_mainnet_btc_address") {
    throw new LiquidiumError(
      LiquidiumErrorCode.INVALID_ADDRESS,
      "Instant loan refund destination must be a valid mainnet BTC address"
    );
  }

  throw new LiquidiumError(
    LiquidiumErrorCode.INVALID_ADDRESS,
    "Instant loan refund destination must be a valid EVM address"
  );
}
