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

  test("should convert unpadded btc base64 signatures to hex bytes", () => {
    // given
    const BTC_SIGNATURE_BASE64_UNPADDED = "AQID/v8";

    // when
    const result = normalizeWalletSignature(
      BTC_SIGNATURE_BASE64_UNPADDED,
      Chain.BTC
    );

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

  test("should keep uppercase btc hex signatures unchanged", () => {
    // given
    const BTC_SIGNATURE_HEX = "1BABCDEF";

    // when
    const result = normalizeWalletSignature(BTC_SIGNATURE_HEX, Chain.BTC);

    // then
    expect(result).toBe(BTC_SIGNATURE_HEX);
  });

  test("should remove the 0x prefix from btc hex signatures", () => {
    // given
    const BTC_SIGNATURE_WITH_PREFIX = "0x1babcdef";

    // when
    const result = normalizeWalletSignature(
      BTC_SIGNATURE_WITH_PREFIX,
      Chain.BTC
    );

    // then
    const EXPECTED_SIGNATURE_HEX = "1babcdef";
    expect(result).toBe(EXPECTED_SIGNATURE_HEX);
  });

  test("should strip 0x prefix from eth hex signatures", () => {
    // given
    const ETH_SIGNATURE_HEX = "0xabcdef";

    // when
    const result = normalizeWalletSignature(ETH_SIGNATURE_HEX, Chain.ETH);

    // then
    const EXPECTED_SIGNATURE_HEX = "abcdef";
    expect(result).toBe(EXPECTED_SIGNATURE_HEX);
  });

  test("should keep unprefixed eth signatures unchanged", () => {
    // given
    const ETH_SIGNATURE = "signed";

    // when
    const result = normalizeWalletSignature(ETH_SIGNATURE, Chain.ETH);

    // then
    expect(result).toBe(ETH_SIGNATURE);
  });

  test("should keep invalid prefixed eth signatures unchanged", () => {
    // given
    const ETH_SIGNATURE_WITH_INVALID_PREFIX = "0xsigned";

    // when
    const result = normalizeWalletSignature(
      ETH_SIGNATURE_WITH_INVALID_PREFIX,
      Chain.ETH
    );

    // then
    expect(result).toBe(ETH_SIGNATURE_WITH_INVALID_PREFIX);
  });

  test("should remove the 0x prefix from uppercase eth hex signatures", () => {
    // given
    const ETH_SIGNATURE_HEX = "0xABCDEF";

    // when
    const result = normalizeWalletSignature(ETH_SIGNATURE_HEX, Chain.ETH);

    // then
    const EXPECTED_SIGNATURE_HEX = "ABCDEF";
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

  test("should reject empty btc signatures", () => {
    // given
    const EMPTY_BTC_SIGNATURE = "";

    // when
    const result = () =>
      normalizeWalletSignature(EMPTY_BTC_SIGNATURE, Chain.BTC);

    // then
    expect(result).toThrow(
      expect.objectContaining({
        code: LiquidiumErrorCode.SIGNATURE_ERROR,
      })
    );
  });

  test("should reject btc signatures with an invalid 0x-prefixed byte string", () => {
    // given
    const INVALID_BTC_SIGNATURE = "0xabc";

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
