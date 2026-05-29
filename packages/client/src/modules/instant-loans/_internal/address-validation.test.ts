import { describe, expect, test } from "vitest";
import { normalizeExternalAddress } from "../../../core/address-validation";

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
    expect(result).toEqual({ success: true, address });
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
    expect(result).toEqual({ success: true, address });
  });

  test("should reject non-mainnet BTC destinations", () => {
    // given
    const address = "tb1qcr8te4kr609gcawutmrza0j4xv80jy5p8pe5uc";

    // when
    const result = normalizeExternalAddress({
      address,
      asset: "BTC",
      chain: "BTC",
    });

    // then
    expect(result).toEqual({
      success: false,
      error: "invalid_mainnet_btc_address",
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
    expect(result).toEqual({
      success: true,
      address: EXPECTED_CHECKSUM_ADDRESS,
    });
  });

  test("should reject invalid EVM destinations", () => {
    // given
    const address = "not-an-evm-address";

    // when
    const result = normalizeExternalAddress({
      address,
      asset: "USDC",
      chain: "ETH",
    });

    // then
    expect(result).toEqual({ success: false, error: "invalid_evm_address" });
  });
});
