import { describe, expect, test } from "vitest";
import { normalizeExternalAddress } from "./address-validation";
import { LiquidiumErrorCode } from "./errors";

describe("normalizeExternalAddress for ETH", () => {
  test("should normalize a valid EVM address", () => {
    // given
    const address = "0x52908400098527886e0f7030069857d2e4169ee7";

    // when
    const result = normalizeExternalAddress({
      address,
      asset: "ETH",
      chain: "ETH",
    });

    // then
    const EXPECTED_CHECKSUM_ADDRESS =
      "0x52908400098527886E0F7030069857D2E4169EE7";
    expect(result).toBe(EXPECTED_CHECKSUM_ADDRESS);
  });

  test("should reject an invalid EVM address", () => {
    // given
    const address = "not-an-evm-address";

    // when
    let result: unknown;
    try {
      normalizeExternalAddress({
        address,
        asset: "ETH",
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
});
