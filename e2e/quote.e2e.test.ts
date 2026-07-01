import { expect, test } from "vitest";
import { LiquidiumClient, type Pool } from "../packages/client/src";
import { describeLive } from "./_internal/live";
import {
  getMinimumBorrowAmount,
  listAvailableBorrowPools,
  selectBorrowPool,
  selectBtcCollateralPool,
} from "./_internal/pools";

describeLive("live quote e2e", () => {
  test("should produce valid quotes for every available BTC collateral and ETH stablecoin borrow pair", async () => {
    // given
    const client = new LiquidiumClient();
    const pools = await client.market.listPools();
    const assetPrices = await client.market.getAssetPrices();
    const collateralPool = selectBtcCollateralPool(pools);
    const borrowPools = listAvailableBorrowPools(pools);
    const targetLtvBps = getConservativeTargetLtvBps(collateralPool);

    // when
    const quoteResults = borrowPools.map((borrowPool) => {
      const borrowAmount = getMinimumBorrowAmount(borrowPool);
      const quote = client.quote.getQuote(
        {
          borrowAmount,
          borrowPoolId: borrowPool.id,
          collateralPoolId: collateralPool.id,
          targetLtvBps,
        },
        pools,
        assetPrices
      );
      const ltv = client.quote.calculateLtv(
        {
          borrowAmount,
          borrowPoolId: borrowPool.id,
          collateralAmount: quote.requiredCollateralAmount,
          collateralPoolId: collateralPool.id,
        },
        pools,
        assetPrices
      );

      return { borrowPool, quote, ltv };
    });

    // then
    expect(quoteResults.length).toBeGreaterThan(0);
    for (const { borrowPool, quote, ltv } of quoteResults) {
      expect(quote.validationErrors).toEqual([]);
      expect(quote.borrowAsset).toBe(borrowPool.asset);
      expect(quote.collateralAsset).toBe(collateralPool.asset);
      expect(quote.requiredCollateralAmount).toBeGreaterThan(0n);
      expect(quote.requiredCollateralUsd).toBeGreaterThan(0n);
      expect(ltv.validationErrors).toEqual([]);
      expect(ltv.ltvBps).toBeLessThanOrEqual(targetLtvBps);
      expect(ltv.ltvBps).toBeLessThanOrEqual(collateralPool.maxLtv);
    }
  });

  test("should require more collateral when the borrow amount increases", async () => {
    // given
    const client = new LiquidiumClient();
    const pools = await client.market.listPools();
    const assetPrices = await client.market.getAssetPrices();
    const collateralPool = selectBtcCollateralPool(pools);
    const borrowPool = selectBorrowPool(pools);
    const targetLtvBps = getConservativeTargetLtvBps(collateralPool);
    const borrowAmount = getMinimumBorrowAmount(borrowPool);
    const increasedBorrowAmount = borrowAmount * 2n;

    // when
    const baseQuote = client.quote.getQuote(
      {
        borrowAmount,
        borrowPoolId: borrowPool.id,
        collateralPoolId: collateralPool.id,
        targetLtvBps,
      },
      pools,
      assetPrices
    );
    const increasedQuote = client.quote.getQuote(
      {
        borrowAmount: increasedBorrowAmount,
        borrowPoolId: borrowPool.id,
        collateralPoolId: collateralPool.id,
        targetLtvBps,
      },
      pools,
      assetPrices
    );

    // then
    expect(baseQuote.validationErrors).toEqual([]);
    expect(increasedQuote.validationErrors).toEqual([]);
    expect(increasedQuote.requiredCollateralAmount).toBeGreaterThan(
      baseQuote.requiredCollateralAmount
    );
  });
});

function getConservativeTargetLtvBps(collateralPool: Pool): bigint {
  const targetLtvBps = collateralPool.maxLtv / 2n;
  if (targetLtvBps <= 0n) {
    throw new Error("Live BTC collateral pool has no usable max LTV");
  }

  return targetLtvBps;
}
