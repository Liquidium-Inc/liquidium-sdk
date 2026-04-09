import { LiquidiumError, LiquidiumErrorCode } from "../errors";

export function getVariantKey(variant: Record<string, unknown>): string {
  const [variantKey] = Object.keys(variant);

  if (!variantKey) {
    throw new LiquidiumError(
      LiquidiumErrorCode.INTERNAL,
      "Unexpected empty canister variant"
    );
  }

  return variantKey;
}
