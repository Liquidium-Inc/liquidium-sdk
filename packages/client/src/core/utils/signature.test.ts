import { describe, expect, test } from "vitest";
import { LiquidiumErrorCode } from "../errors";
import { Chain } from "../types";
import { normalizeWalletSignature } from "./signature";

describe("normalizeWalletSignature", () => {
  test("should convert btc base64 signatures to hex bytes", () => {
    // given
    const BTC_SIGNATURE_BASE64 = "AQID/v8=";

    // when
    const result = normalizeWalletSignature(BTC_SIGNATURE_BASE64, Chain.BTC);

    // then
    const EXPECTED_SIGNATURE_HEX = "010203feff";
    expect(result).toBe(EXPECTED_SIGNATURE_HEX);
  });

  test("should keep btc hex signatures unchanged", () => {
    // given
    const BTC_SIGNATURE_HEX = "1babcdef";

    // when
    const result = normalizeWalletSignature(BTC_SIGNATURE_HEX, Chain.BTC);

    // then
    expect(result).toBe(BTC_SIGNATURE_HEX);
  });

  test("should keep eth signature normalization unchanged", () => {
    // given
    const ETH_SIGNATURE_HEX = "0xabcdef";

    // when
    const result = normalizeWalletSignature(ETH_SIGNATURE_HEX, Chain.ETH);

    // then
    const EXPECTED_SIGNATURE_HEX = "abcdef";
    expect(result).toBe(EXPECTED_SIGNATURE_HEX);
  });

  test("should reject btc signatures that are neither hex nor base64", () => {
    // given
    const INVALID_BTC_SIGNATURE = "not a signature!";

    // when
    const result = () =>
      normalizeWalletSignature(INVALID_BTC_SIGNATURE, Chain.BTC);

    // then
    expect(result).toThrow(
      expect.objectContaining({
        code: LiquidiumErrorCode.SIGNATURE_ERROR,
      })
    );
  });
});
