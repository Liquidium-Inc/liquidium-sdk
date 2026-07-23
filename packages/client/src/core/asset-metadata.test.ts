import { describe, expect, test } from "vitest";
import { ASSET_METADATA, getAssetMetadata } from "./asset-metadata";
import { Asset } from "./types";

describe("asset metadata", () => {
  test.each([
    [Asset.BTC, "Bitcoin", "btc.svg"],
    [Asset.ETH, "Ethereum", "eth.svg"],
    [Asset.ICP, "Internet Computer", "icp.svg"],
    [Asset.USDC, "USD Coin", "usdc.svg"],
    [Asset.USDT, "Tether USD", "usdt.svg"],
  ])("should return presentation metadata for %s", (asset, displayName, iconFileName) => {
    // given

    // when
    const metadata = getAssetMetadata(asset);

    // then
    expect(metadata).toEqual(ASSET_METADATA[asset]);
    expect(metadata.symbol).toBe(asset);
    expect(metadata.displayName).toBe(displayName);
    expect(metadata.iconUrl).toBe(
      `https://app.liquidium.fi/img/logos/crypto/${iconFileName}`
    );
  });
});
