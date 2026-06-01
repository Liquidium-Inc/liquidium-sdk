import { describe, expect, test } from "vitest";
import { normalizeExternalAddress } from "../../../core/address-validation";
import { LiquidiumErrorCode } from "../../../core/errors";

describe("normalizeExternalAddress", () => {
  test("should accept valid mainnet BTC base58 destinations", () => {
    // given
    const address = "1BoatSLRHtKNngkdXEeobR76b53LETtpyT";

    // when
    const result = normalizeExternalAddress({
      address,
      asset: "BTC",
      chain: "BTC",
    });

    // then
    expect(result).toBe(address);
  });

  test("should accept valid mainnet BTC bech32 destinations", () => {
    // given
    const address = "bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4";

    // when
    const result = normalizeExternalAddress({
      address,
      asset: "BTC",
      chain: "BTC",
    });

    // then
    expect(result).toBe(address);
  });

  test("should reject non-mainnet BTC destinations", () => {
    // given
    const address = "tb1qcr8te4kr609gcawutmrza0j4xv80jy5p8pe5uc";

    // when
    let result: unknown;
    try {
      normalizeExternalAddress({
        address,
        asset: "BTC",
        chain: "BTC",
      });
    } catch (error) {
      result = error;
    }

    // then
    expect(result).toMatchObject({
      code: LiquidiumErrorCode.INVALID_ADDRESS,
      message: "Address must be a valid mainnet BTC address",
    });
  });

  test("should reject BTC destinations on a non-BTC chain", () => {
    // given
    const address = "1BoatSLRHtKNngkdXEeobR76b53LETtpyT";

    // when
    let result: unknown;
    try {
      normalizeExternalAddress({
        address,
        asset: "BTC",
        chain: "ETH",
      });
    } catch (error) {
      result = error;
    }

    // then
    expect(result).toMatchObject({
      code: LiquidiumErrorCode.INVALID_ADDRESS,
      message: "Address chain must match asset",
    });
  });

  test("should normalize valid EVM destinations", () => {
    // given
    const address = "0x52908400098527886e0f7030069857d2e4169ee7";
    const EXPECTED_CHECKSUM_ADDRESS =
      "0x52908400098527886E0F7030069857D2E4169EE7";

    // when
    const result = normalizeExternalAddress({
      address,
      asset: "USDT",
      chain: "ETH",
    });

    // then
    expect(result).toBe(EXPECTED_CHECKSUM_ADDRESS);
  });

  test("should reject invalid EVM destinations", () => {
    // given
    const address = "not-an-evm-address";

    // when
    let result: unknown;
    try {
      normalizeExternalAddress({
        address,
        asset: "USDC",
        chain: "ETH",
      });
    } catch (error) {
      result = error;
    }

    // then
    expect(result).toMatchObject({
      code: LiquidiumErrorCode.INVALID_ADDRESS,
      message: "Address must be a valid EVM address",
    });
  });

  test("should reject EVM destinations on a non-EVM chain", () => {
    // given
    const address = "0x52908400098527886e0f7030069857d2e4169ee7";

    // when
    let result: unknown;
    try {
      normalizeExternalAddress({
        address,
        asset: "USDT",
        chain: "BTC",
      });
    } catch (error) {
      result = error;
    }

    // then
    expect(result).toMatchObject({
      code: LiquidiumErrorCode.INVALID_ADDRESS,
      message: "Address chain must match asset",
    });
  });
});
