import { describe, expect, test } from "vitest";
import { ASSET_METADATA, getAssetMetadata } from "./asset-metadata";
import { Asset } from "./types";

describe("asset metadata", () => {
  test.each([
    [Asset.BTC, "Bitcoin"],
    [Asset.ETH, "Ethereum"],
    [Asset.ICP, "Internet Computer"],
    [Asset.USDC, "USD Coin"],
    [Asset.USDT, "Tether USD"],
  ])("should return presentation metadata for %s", (asset, displayName) => {
    // given

    // when
    const metadata = getAssetMetadata(asset);

    // then
    expect(metadata).toEqual(ASSET_METADATA[asset]);
    expect(metadata.symbol).toBe(asset);
    expect(metadata.displayName).toBe(displayName);
  });
});
