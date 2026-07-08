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
      { asset: "BTC", chain: "ICP" },
      { asset: "USDT", chain: "ETH" },
      { asset: "USDT", chain: "ICP" },
      { asset: "USDC", chain: "ETH" },
      { asset: "USDC", chain: "ICP" },
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
      },
      {
        asset: "BTC",
        chain: "ICP",
        ledgerCanisterId: "mxzaz-hqaaa-aaaar-qaada-cai",
      },
      {
        asset: "USDT",
        chain: "ETH",
        ledgerCanisterId: "cngnf-vqaaa-aaaar-qag4q-cai",
      },
      {
        asset: "USDT",
        chain: "ICP",
        ledgerCanisterId: "cngnf-vqaaa-aaaar-qag4q-cai",
      },
      {
        asset: "USDC",
        chain: "ETH",
        ledgerCanisterId: "xevnm-gaaaa-aaaar-qafnq-cai",
      },
      {
        asset: "USDC",
        chain: "ICP",
        ledgerCanisterId: "xevnm-gaaaa-aaaar-qafnq-cai",
      },
      {
        asset: "ICP",
        chain: "ICP",
        ledgerCanisterId: "ryjl3-tyaaa-aaaaa-aaaba-cai",
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
