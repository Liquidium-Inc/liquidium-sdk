import { describe, expect, test } from "vitest";
import { LiquidiumError, LiquidiumErrorCode } from "../errors";
import { getVariantKey } from "./variant";

describe("getVariantKey", () => {
  test("should return the first variant key", () => {
    // given
    const variant = { BTC: null };

    // when
    const variantKey = getVariantKey(variant);

    // then
    const EXPECTED_VARIANT_KEY = "BTC";
    expect(variantKey).toBe(EXPECTED_VARIANT_KEY);
  });

  test("should throw INTERNAL error when variant has no keys", () => {
    // given
    const emptyVariant = {};

    // when
    const getVariantKeyWithEmptyVariant = () => getVariantKey(emptyVariant);

    // then
    expect(getVariantKeyWithEmptyVariant).toThrow(LiquidiumError);
    expect(getVariantKeyWithEmptyVariant).toThrow(
      "Unexpected empty canister variant"
    );

    try {
      getVariantKeyWithEmptyVariant();
      throw new Error("Expected getVariantKey to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(LiquidiumError);
      expect((error as LiquidiumError).code).toBe(LiquidiumErrorCode.INTERNAL);
    }
  });
});
