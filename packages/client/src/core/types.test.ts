import { describe, expect, expectTypeOf, test } from "vitest";
import {
  Asset,
  type AssetIdentifier,
  Chain,
  isAssetIdentifier,
  type SigningChain,
} from "./types";

describe("AssetIdentifier", () => {
  test("accepts exactly the supported asset and chain pairs", () => {
    const supported: AssetIdentifier[] = [
      { chain: Chain.BTC, asset: Asset.BTC },
      { chain: Chain.ETH, asset: Asset.ETH },
      { chain: Chain.ETH, asset: Asset.USDC },
      { chain: Chain.ETH, asset: Asset.USDT },
      { chain: Chain.ICP, asset: Asset.BTC },
      { chain: Chain.ICP, asset: Asset.ETH },
      { chain: Chain.ICP, asset: Asset.ICP },
      { chain: Chain.ICP, asset: Asset.USDC },
      { chain: Chain.ICP, asset: Asset.USDT },
    ];

    expect(supported.every(isAssetIdentifier)).toBe(true);
    expect(isAssetIdentifier({ chain: Chain.BTC, asset: Asset.USDT })).toBe(
      false
    );
    expect(isAssetIdentifier({ chain: Chain.ETH, asset: Asset.BTC })).toBe(
      false
    );
    expect(isAssetIdentifier({ chain: "SOL", asset: "SOL" })).toBe(false);
  });

  test("keeps signing chains limited to BTC and ETH", () => {
    expectTypeOf<SigningChain>().toEqualTypeOf<"BTC" | "ETH">();
  });

  test("keeps asset and chain pairs correlated in the public type", () => {
    expectTypeOf<{
      chain: "ICP";
      asset: "ETH";
    }>().toMatchTypeOf<AssetIdentifier>();
    expectTypeOf<{
      chain: "ICP";
      asset: "USDT";
    }>().toMatchTypeOf<AssetIdentifier>();
    expectTypeOf<{
      chain: "ETH";
      asset: "BTC";
    }>().not.toMatchTypeOf<AssetIdentifier>();
  });
});
