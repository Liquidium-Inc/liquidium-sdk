import { describe, expect, test } from "vitest";
import { CK_CANISTER_IDS, resolveCanisterIds } from "./config";
import { LiquidiumErrorCode } from "./errors";

describe("config", () => {
  test("should resolve only canonical canister id override fields", () => {
    // given
    const lendingCanisterId = "aaaaa-aa";
    const btcPoolCanisterId = "bbbbb-bb";
    const ethPoolCanisterId = "ccccc-cc";

    // when
    const canisterIds = resolveCanisterIds("mainnet", {
      lending: lendingCanisterId,
      pools: {
        btc: btcPoolCanisterId,
        eth: ethPoolCanisterId,
      },
    });

    // then
    expect(canisterIds.lending).toBe(lendingCanisterId);
    expect(canisterIds.pools.btc).toBe(btcPoolCanisterId);
    expect(canisterIds.pools.eth).toBe(ethPoolCanisterId);
    expect(canisterIds).not.toHaveProperty("btcPool");
    expect(canisterIds).not.toHaveProperty("ercPool");
  });

  test("should resolve mainnet ETH pool and ckETH canister ids", () => {
    // given
    const EXPECTED_ETH_POOL_CANISTER_ID = "qcg7y-syaaa-aaaar-qb75q-cai";
    const EXPECTED_CKETH_MINTER_CANISTER_ID = "sv3dd-oaaaa-aaaar-qacoa-cai";
    const EXPECTED_CKETH_LEDGER_CANISTER_ID = "ss2fx-dyaaa-aaaar-qacoq-cai";
    const EXPECTED_CKETH_ARCHIVE_CANISTER_ID = "yhujl-liaaa-aaaar-qaiha-cai";

    // when
    const canisterIds = resolveCanisterIds("mainnet");

    // then
    expect(canisterIds.pools.eth).toBe(EXPECTED_ETH_POOL_CANISTER_ID);
    expect(CK_CANISTER_IDS.ETH).toEqual({
      minter: EXPECTED_CKETH_MINTER_CANISTER_ID,
      ledger: EXPECTED_CKETH_LEDGER_CANISTER_ID,
      archive: EXPECTED_CKETH_ARCHIVE_CANISTER_ID,
    });
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
        sol: "ddddd-dd",
      },
    };

    // when
    const resolveWithUnsupportedPoolOverrides = () =>
      resolveCanisterIds("mainnet", unsupportedPoolOverrides as never);

    // then
    expect(resolveWithUnsupportedPoolOverrides).toThrowError(
      "Unsupported canisterIds.pools override: sol"
    );
    expect(resolveWithUnsupportedPoolOverrides).toThrowError(
      expect.objectContaining({ code: LiquidiumErrorCode.VALIDATION_ERROR })
    );
  });
});
