import { LiquidiumError, LiquidiumErrorCode } from "../errors";

export function getVariantKey<TVariant extends object>(
  variant: TVariant
): string {
  const [variantKey] = Object.keys(variant);

  if (!variantKey) {
    throw new LiquidiumError(
      LiquidiumErrorCode.INTERNAL,
      "Unexpected empty canister variant"
    );
  }

  return variantKey;
}
