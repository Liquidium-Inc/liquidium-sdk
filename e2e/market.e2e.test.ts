import { expect, test } from "vitest";
import { LiquidiumClient, type Pool } from "../packages/client/src";
import { describeLive } from "./_internal/live";

describeLive("live market e2e", () => {
  test("should return supported pools with required fields and matching prices", async () => {
    // given
    const client = new LiquidiumClient();

    // when
    const pools = await client.market.listPools();
    const assetPrices = await client.market.getAssetPrices();

    // then
    expect(pools.length).toBeGreaterThan(0);
    expect(assetPrices.BTC).toBeGreaterThan(0);
    expect(assetPrices.ETH).toBeGreaterThan(0);
    expect(hasLiveStablecoinPrice(assetPrices)).toBe(true);
    expect(pools).toContainEqual(
      expect.objectContaining({ asset: "ETH", chain: "ETH", decimals: 18n })
    );

    for (const pool of pools) {
      expectPoolFieldsToBePopulated(pool);
      if (!pool.frozen) {
        expect(assetPrices[pool.asset]).toBeGreaterThan(0);
      }
    }
  });

  test("should return live pool rates for a listed pool", async () => {
    // given
    const client = new LiquidiumClient();
    const pools = await client.market.listPools();
    const pool = pools[0];

    if (!pool) {
      throw new Error("No live pool is available for e2e tests");
    }

    // when
    const poolRate = await client.market.getPoolRate(pool.id);

    // then
    expect(poolRate.rateDecimals).toBeGreaterThan(0n);
    expect(poolRate.borrowRate).toBeGreaterThanOrEqual(0n);
    expect(poolRate.lendRate).toBeGreaterThanOrEqual(0n);
    expect(poolRate.utilizationRate).toBeGreaterThanOrEqual(0n);
  });
});

function hasLiveStablecoinPrice(assetPrices: Record<string, number>): boolean {
  return (assetPrices.USDC ?? 0) > 0 || (assetPrices.USDT ?? 0) > 0;
}

function expectPoolFieldsToBePopulated(pool: Pool): void {
  expect(pool.id).toBeTruthy();
  expect(pool.asset).toBeTruthy();
  expect(pool.chain).toBeTruthy();
  expect(pool.decimals).toBeGreaterThan(0n);
  expect(typeof pool.frozen).toBe("boolean");
  expect(pool.totalSupply).toBeGreaterThanOrEqual(0n);
  expect(pool.totalDebt).toBeGreaterThanOrEqual(0n);
  expect(pool.availableLiquidity).toBeGreaterThanOrEqual(0n);
  expect(pool.maxLtv).toBeGreaterThanOrEqual(0n);
  expect(pool.liquidationThreshold).toBeGreaterThanOrEqual(0n);
  expect(pool.rateDecimals).toBeGreaterThan(0n);
  expect(pool.lendingRate).toBeGreaterThanOrEqual(0n);
  expect(pool.borrowingRate).toBeGreaterThanOrEqual(0n);
  expect(pool.utilizationRate).toBeGreaterThanOrEqual(0n);
}
