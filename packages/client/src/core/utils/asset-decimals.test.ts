import { describe, expect, test } from "vitest";
import { getAssetNativeDecimals } from "./asset-decimals";

describe("getAssetNativeDecimals", () => {
  test("should return 18 decimals for ETH", () => {
    // given
    const asset = "ETH";
    const EXPECTED_DECIMALS = 18n;

    // when
    const decimals = getAssetNativeDecimals(asset);

    // then
    expect(decimals).toBe(EXPECTED_DECIMALS);
  });
});
