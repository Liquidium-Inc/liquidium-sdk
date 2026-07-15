import { describe, expect, expectTypeOf, test } from "vitest";
import {
  Asset,
  type AssetIdentifier,
  Chain,
  isAssetIdentifier,
  type SigningChain,
} from "./types";

describe("AssetIdentifier", () => {
  test("should accept exactly the supported asset and chain pairs", () => {
    // given
    const supportedIdentifiers: AssetIdentifier[] = [
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
    const unsupportedIdentifiers = [
      { chain: Chain.BTC, asset: Asset.USDT },
      { chain: Chain.ETH, asset: Asset.BTC },
      { chain: "SOL", asset: "SOL" },
    ];

    // when
    const areSupportedIdentifiersValid =
      supportedIdentifiers.every(isAssetIdentifier);
    const areUnsupportedIdentifiersInvalid = unsupportedIdentifiers.every(
      (identifier) => !isAssetIdentifier(identifier)
    );

    // then
    expect(areSupportedIdentifiersValid).toBe(true);
    expect(areUnsupportedIdentifiersInvalid).toBe(true);
  });

  test("should keep signing chains limited to BTC and ETH", () => {
    // given
    type ExpectedSigningChain = "BTC" | "ETH";

    // when
    type ActualSigningChain = SigningChain;

    // then
    expectTypeOf<ActualSigningChain>().toEqualTypeOf<ExpectedSigningChain>();
  });

  test("should keep asset and chain pairs correlated in the public type", () => {
    // given
    type ValidEthIdentifier = {
      chain: "ICP";
      asset: "ETH";
    };
    type ValidUsdtIdentifier = {
      chain: "ICP";
      asset: "USDT";
    };
    type InvalidBtcIdentifier = {
      chain: "ETH";
      asset: "BTC";
    };

    // when
    type SupportedIdentifier = AssetIdentifier;

    // then
    expectTypeOf<ValidEthIdentifier>().toMatchTypeOf<SupportedIdentifier>();
    expectTypeOf<ValidUsdtIdentifier>().toMatchTypeOf<SupportedIdentifier>();
    expectTypeOf<InvalidBtcIdentifier>().not.toMatchTypeOf<SupportedIdentifier>();
  });
});
