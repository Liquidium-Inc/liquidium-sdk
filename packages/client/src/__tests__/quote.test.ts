import { describe, expect, test } from "vitest";
import type { AssetPrices, Pool } from "../modules/market/types";
import { QuoteModule } from "../modules/quote/quote";
import {
  QuoteValidationErrorCode,
  QuoteWarningCode,
} from "../modules/quote/types";

describe("QuoteModule", () => {
  const quoteModule = new QuoteModule();

  const btcPool: Pool = {
    id: "aaaaa-btc-pool",
    asset: "BTC",
    chain: "Bitcoin",
    frozen: false,
    totalSupply: 100000000000n,
    totalDebt: 30000000000n,
    maxLtv: 7500n,
    liquidationThreshold: 8000n,
    liquidationBonus: 500n,
    protocolLiquidationFee: 1000n,
    reserveFactor: 2000n,
    lendingRate: 0n,
    borrowingRate: 0n,
    utilizationRate: 0n,
    baseRate: 0n,
    optimalUtilizationRate: 8000n,
    rateSlopeBefore: 0n,
    rateSlopeAfter: 0n,
    lendingIndex: 100000000n,
    borrowIndex: 100000000n,
    sameAssetBorrowing: false,
  };

  const usdtPool: Pool = {
    id: "xxxxx-usdt-pool",
    asset: "USDT",
    chain: "Ethereum",
    frozen: false,
    totalSupply: 500000000000n,
    totalDebt: 200000000000n,
    maxLtv: 8500n,
    liquidationThreshold: 9000n,
    liquidationBonus: 500n,
    protocolLiquidationFee: 1000n,
    reserveFactor: 1000n,
    lendingRate: 0n,
    borrowingRate: 0n,
    utilizationRate: 0n,
    baseRate: 0n,
    optimalUtilizationRate: 8000n,
    rateSlopeBefore: 0n,
    rateSlopeAfter: 0n,
    lendingIndex: 1000000n,
    borrowIndex: 1000000n,
    sameAssetBorrowing: true,
  };

  const pools = [btcPool, usdtPool];

  const prices: AssetPrices = {
    BTC: 100000,
    USDT: 1,
  };

  test("calculates required collateral for valid cross-asset quote", async () => {
    // given
    const request = {
      borrowAmount: 100000000n,
      borrowPoolId: "xxxxx-usdt-pool",
      collateralPoolId: "aaaaa-btc-pool",
      targetLtvBps: 5000n,
    };

    // when
    const result = await quoteModule.getQuote(request, pools, prices);

    // then
    expect(result.validationErrors).toHaveLength(0);
    expect(result.borrowAmount).toBe(100000000n);
    expect(result.borrowUsd).toBe(10_000_000_000n);
    expect(result.requiredCollateralAmount).toBe(200_000n);
    expect(result.requiredCollateralUsd).toBe(20_000_000_000n);
  });

  test("calculates quote values using asset decimals instead of raw base units", async () => {
    // given
    const request = {
      borrowAmount: 1_000_000n,
      borrowPoolId: "xxxxx-usdt-pool",
      collateralPoolId: "aaaaa-btc-pool",
      targetLtvBps: 6500n,
    };

    // when
    const result = await quoteModule.getQuote(request, pools, prices);

    // then
    expect(result.validationErrors).toHaveLength(0);
    expect(result.borrowUsd).toBe(100_000_000n);
    expect(result.requiredCollateralUsd).toBe(153_846_153n);
    expect(result.requiredCollateralAmount).toBe(1_538n);
  });

  test("returns error when borrow pool not found", async () => {
    // given
    const request = {
      borrowAmount: 100000000n,
      borrowPoolId: "invalid-pool",
      collateralPoolId: "aaaaa-btc-pool",
      targetLtvBps: 5000n,
    };

    // when
    const result = await quoteModule.getQuote(request, pools, prices);

    // then
    expect(result.validationErrors).toHaveLength(1);
    expect(result.validationErrors[0]?.code).toBe(
      QuoteValidationErrorCode.POOL_NOT_FOUND
    );
  });

  test("returns error when LTV exceeds max allowed", async () => {
    // given
    const request = {
      borrowAmount: 100000000n,
      borrowPoolId: "xxxxx-usdt-pool",
      collateralPoolId: "aaaaa-btc-pool",
      targetLtvBps: 9000n,
    };

    // when
    const result = await quoteModule.getQuote(request, pools, prices);

    // then
    expect(result.validationErrors).toHaveLength(1);
    expect(result.validationErrors[0]?.code).toBe(
      QuoteValidationErrorCode.LTV_EXCEEDS_MAX
    );
  });

  test("returns error when same asset borrowing not allowed", async () => {
    // given
    const request = {
      borrowAmount: 100000000n,
      borrowPoolId: "aaaaa-btc-pool",
      collateralPoolId: "aaaaa-btc-pool",
      targetLtvBps: 5000n,
    };

    // when
    const result = await quoteModule.getQuote(request, pools, prices);

    // then
    expect(result.validationErrors).toHaveLength(1);
    expect(result.validationErrors[0]?.code).toBe(
      QuoteValidationErrorCode.SAME_ASSET_NOT_ALLOWED
    );
  });

  test("allows same asset borrowing when enabled on pool", async () => {
    // given
    const request = {
      borrowAmount: 100000000n,
      borrowPoolId: "xxxxx-usdt-pool",
      collateralPoolId: "xxxxx-usdt-pool",
      targetLtvBps: 5000n,
    };

    // when
    const result = await quoteModule.getQuote(request, pools, prices);

    // then
    expect(result.validationErrors).toHaveLength(0);
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]?.code).toBe(
      QuoteWarningCode.SAME_ASSET_BORROWING
    );
  });

  test("returns high LTV warning when above 80%", async () => {
    // given - use USDT pool as collateral since it has maxLtv 8500, allowing target 8200
    const request = {
      borrowAmount: 100000000n,
      borrowPoolId: "aaaaa-btc-pool",
      collateralPoolId: "xxxxx-usdt-pool",
      targetLtvBps: 8200n,
    };

    // when
    const result = await quoteModule.getQuote(request, pools, prices);

    // then
    expect(result.validationErrors).toHaveLength(0);
    expect(
      result.warnings.some((w) => w.code === QuoteWarningCode.HIGH_LTV)
    ).toBe(true);
  });

  test("returns error when borrow amount too low", async () => {
    // given
    const request = {
      borrowAmount: 1000n,
      borrowPoolId: "xxxxx-usdt-pool",
      collateralPoolId: "aaaaa-btc-pool",
      targetLtvBps: 5000n,
    };

    // when
    const result = await quoteModule.getQuote(request, pools, prices);

    // then
    expect(result.validationErrors).toHaveLength(1);
    expect(result.validationErrors[0]?.code).toBe(
      QuoteValidationErrorCode.BORROW_AMOUNT_TOO_LOW
    );
  });

  test("returns error when price not available", async () => {
    // given
    const ethPool: Pool = {
      ...usdtPool,
      id: "eeee-eth-pool",
      asset: "ETH",
      chain: "Ethereum",
    };
    const request = {
      borrowAmount: 100000000n,
      borrowPoolId: "eeee-eth-pool",
      collateralPoolId: "aaaaa-btc-pool",
      targetLtvBps: 5000n,
    };

    // when
    const result = await quoteModule.getQuote(
      request,
      [btcPool, ethPool],
      prices
    );

    // then
    expect(result.validationErrors).toHaveLength(1);
    expect(result.validationErrors[0]?.code).toBe(
      QuoteValidationErrorCode.PRICE_NOT_AVAILABLE
    );
  });
});
