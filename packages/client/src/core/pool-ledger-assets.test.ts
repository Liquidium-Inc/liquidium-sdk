import { describe, expect, test } from "vitest";
import {
  getPoolLedgerAssetRoute,
  isPoolLedgerAsset,
} from "./pool-ledger-assets";

describe("pool ledger asset routes", () => {
  test("should resolve every supported pool asset to its ledger family", () => {
    // given
    const SUPPORTED_ASSET_CHAIN_PAIRS = [
      { asset: "BTC", chain: "BTC" },
      { asset: "USDT", chain: "ETH" },
      { asset: "USDC", chain: "ETH" },
      { asset: "ICP", chain: "ICP" },
    ] as const;

    // when
    const routes = SUPPORTED_ASSET_CHAIN_PAIRS.map(({ asset, chain }) =>
      getPoolLedgerAssetRoute({ asset, chain })
    );

    // then
    const EXPECTED_ROUTES = [
      {
        asset: "BTC",
        chain: "BTC",
        ledgerCanisterId: "mxzaz-hqaaa-aaaar-qaada-cai",
        transferMode: "ck",
      },
      {
        asset: "USDT",
        chain: "ETH",
        ledgerCanisterId: "cngnf-vqaaa-aaaar-qag4q-cai",
        transferMode: "ck",
      },
      {
        asset: "USDC",
        chain: "ETH",
        ledgerCanisterId: "xevnm-gaaaa-aaaar-qafnq-cai",
        transferMode: "ck",
      },
      {
        asset: "ICP",
        chain: "ICP",
        ledgerCanisterId: "ryjl3-tyaaa-aaaaa-aaaba-cai",
        transferMode: "native",
      },
    ] as const;

    expect(routes).toEqual(EXPECTED_ROUTES);
  });

  test("should reject unsupported asset and chain pairs", () => {
    // given
    const unsupportedAsset = "SOL";
    const unsupportedChain = "SOL";

    // when
    const isSupported = isPoolLedgerAsset({
      asset: unsupportedAsset,
      chain: unsupportedChain,
    });

    // then
    expect(isSupported).toBe(false);
    expect(() =>
      getPoolLedgerAssetRoute({
        asset: unsupportedAsset,
        chain: unsupportedChain,
      })
    ).toThrow("IC ledger transfers are not supported for SOL on SOL");
  });
});
