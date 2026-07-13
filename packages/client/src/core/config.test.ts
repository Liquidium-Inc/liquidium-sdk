import { describe, expect, test } from "vitest";
import { resolveCanisterIds } from "./config";
import { LiquidiumErrorCode } from "./errors";

describe("config", () => {
  test("should resolve only canonical canister id override fields", () => {
    // given
    const lendingCanisterId = "aaaaa-aa";
    const btcPoolCanisterId = "bbbbb-bb";

    // when
    const canisterIds = resolveCanisterIds("mainnet", {
      lending: lendingCanisterId,
      pools: {
        btc: btcPoolCanisterId,
      },
    });

    // then
    expect(canisterIds.lending).toBe(lendingCanisterId);
    expect(canisterIds.pools.btc).toBe(btcPoolCanisterId);
    expect(canisterIds).not.toHaveProperty("btcPool");
    expect(canisterIds).not.toHaveProperty("ercPool");
  });

  test("should reject removed flat pool canister override fields", () => {
    // given
    const removedOverrides = {
      btcPool: "bbbbb-bb",
      ercPool: "ccccc-cc",
    };

    // when
    const resolveWithRemovedOverrides = () =>
      resolveCanisterIds("mainnet", removedOverrides as never);

    // then
    expect(resolveWithRemovedOverrides).toThrowError(
      "Unsupported canisterIds override: btcPool"
    );
    expect(resolveWithRemovedOverrides).toThrowError(
      expect.objectContaining({ code: LiquidiumErrorCode.VALIDATION_ERROR })
    );
  });

  test("should reject unsupported grouped pool canister override fields", () => {
    // given
    const unsupportedPoolOverrides = {
      pools: {
        eth: "ddddd-dd",
      },
    };

    // when
    const resolveWithUnsupportedPoolOverrides = () =>
      resolveCanisterIds("mainnet", unsupportedPoolOverrides as never);

    // then
    expect(resolveWithUnsupportedPoolOverrides).toThrowError(
      "Unsupported canisterIds.pools override: eth"
    );
    expect(resolveWithUnsupportedPoolOverrides).toThrowError(
      expect.objectContaining({ code: LiquidiumErrorCode.VALIDATION_ERROR })
    );
  });
});
