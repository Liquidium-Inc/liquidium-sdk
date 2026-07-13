import { describe, expect, test } from "vitest";
import { RATE_DECIMALS } from "../../../core/rates";
import type { AssetPrices, Pool } from "../../market/types";
import { QuoteModule } from "../quote";
import { QuoteValidationErrorCode, QuoteWarningCode } from "../types";

describe("QuoteModule", () => {
  const quoteModule = new QuoteModule();

  const btcPool: Pool = {
    id: "aaaaa-btc-pool",
    asset: "BTC",
    chain: "BTC",
    decimals: 8n,
    frozen: false,
    totalSupply: 100000000000n,
    totalDebt: 30000000000n,
    availableLiquidity: 70000000000n,
    maxLtv: 7500n,
    liquidationThreshold: 8000n,
    liquidationBonus: 500n,
    protocolLiquidationFee: 1000n,
    reserveFactor: 2000n,
    rateDecimals: RATE_DECIMALS,
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
    chain: "ETH",
    decimals: 6n,
    frozen: false,
    totalSupply: 500000000000n,
    totalDebt: 200000000000n,
    availableLiquidity: 300000000000n,
    maxLtv: 8500n,
    liquidationThreshold: 9000n,
    liquidationBonus: 500n,
    protocolLiquidationFee: 1000n,
    reserveFactor: 1000n,
    rateDecimals: RATE_DECIMALS,
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

  test("should calculate LTV from borrow and collateral amounts", () => {
    // given
    const BORROW_AMOUNT_USDT_BASE_UNITS = 100_000_000n;
    const COLLATERAL_AMOUNT_SATS = 200_000n;
    const request = {
      borrowAmount: BORROW_AMOUNT_USDT_BASE_UNITS,
      borrowPoolId: usdtPool.id,
      collateralAmount: COLLATERAL_AMOUNT_SATS,
      collateralPoolId: btcPool.id,
    };

    // when
    const result = quoteModule.calculateLtv(request, pools, prices);

    // then
    const EXPECTED_BORROW_USD_INTERNAL = 10_000_000_000n;
    const EXPECTED_COLLATERAL_USD_INTERNAL = 20_000_000_000n;
    const EXPECTED_LTV_BPS = 5_000n;

    expect(result.validationErrors).toHaveLength(0);
    expect(result.borrowAmount).toBe(BORROW_AMOUNT_USDT_BASE_UNITS);
    expect(result.collateralAmount).toBe(COLLATERAL_AMOUNT_SATS);
    expect(result.borrowUsd).toBe(EXPECTED_BORROW_USD_INTERNAL);
    expect(result.collateralUsd).toBe(EXPECTED_COLLATERAL_USD_INTERNAL);
    expect(result.ltvBps).toBe(EXPECTED_LTV_BPS);
    expect(result.maxAllowedLtvBps).toBe(btcPool.maxLtv);
    expect(result.borrowAsset).toBe(usdtPool.asset);
    expect(result.collateralAsset).toBe(btcPool.asset);
  });

  test("should return validation errors when LTV inputs cannot be valued", () => {
    // given
    const pricesWithoutUsdt: AssetPrices = { BTC: 100000 };
    const request = {
      borrowAmount: 100_000_000n,
      borrowPoolId: usdtPool.id,
      collateralAmount: 0n,
      collateralPoolId: btcPool.id,
    };

    // when
    const result = quoteModule.calculateLtv(request, pools, pricesWithoutUsdt);

    // then
    expect(result.ltvBps).toBe(0n);
    expect(result.validationErrors).toEqual([
      expect.objectContaining({
        code: QuoteValidationErrorCode.PRICE_NOT_AVAILABLE,
      }),
      expect.objectContaining({ code: QuoteValidationErrorCode.INVALID_LTV }),
    ]);
  });

  test("returns validation error when LTV borrow amount is below the asset minimum", () => {
    // given
    const request = {
      borrowAmount: 5_000n,
      borrowPoolId: usdtPool.id,
      collateralAmount: 200_000n,
      collateralPoolId: btcPool.id,
    };

    // when
    const result = quoteModule.calculateLtv(request, pools, prices);

    // then
    expect(result.validationErrors).toHaveLength(1);
    expect(result.validationErrors[0]).toMatchObject({
      code: QuoteValidationErrorCode.BORROW_AMOUNT_TOO_LOW,
      message: "Borrow amount must be at least 1000000 base units for USDT",
    });
  });

  test("calculates required collateral for valid cross-asset quote", () => {
    // given
    const request = {
      borrowAmount: 100000000n,
      borrowPoolId: "xxxxx-usdt-pool",
      collateralPoolId: "aaaaa-btc-pool",
      targetLtvBps: 5000n,
    };

    // when
    const result = quoteModule.getQuote(request, pools, prices);

    // then
    expect(result.validationErrors).toHaveLength(0);
    expect(result.borrowAmount).toBe(100000000n);
    expect(result.borrowUsd).toBe(10_000_000_000n);
    expect(result.requiredCollateralAmount).toBe(200_000n);
    expect(result.requiredCollateralUsd).toBe(20_000_000_000n);
  });

  test("should use pool decimals for quote calculations", () => {
    // given
    const TOKEN_BASE_UNITS = 1_000_000_000_000_000_000n;
    const highPrecisionUsdcPool: Pool = {
      ...usdtPool,
      id: "eeee-usdc-pool",
      asset: "USDC",
      decimals: 18n,
    };
    const request = {
      borrowAmount: TOKEN_BASE_UNITS,
      borrowPoolId: highPrecisionUsdcPool.id,
      collateralPoolId: btcPool.id,
      targetLtvBps: 5_000n,
    };
    const pricesWithUsdc: AssetPrices = {
      ...prices,
      USDC: 2_500,
    };

    // when
    const result = quoteModule.getQuote(
      request,
      [btcPool, highPrecisionUsdcPool],
      pricesWithUsdc
    );

    // then
    const EXPECTED_BORROW_USD_INTERNAL = 250_000_000_000n;
    const EXPECTED_REQUIRED_COLLATERAL_USD_INTERNAL = 500_000_000_000n;
    const EXPECTED_REQUIRED_COLLATERAL_SATS = 5_000_000n;

    expect(result.validationErrors).toHaveLength(0);
    expect(result.borrowUsd).toBe(EXPECTED_BORROW_USD_INTERNAL);
    expect(result.requiredCollateralUsd).toBe(
      EXPECTED_REQUIRED_COLLATERAL_USD_INTERNAL
    );
    expect(result.requiredCollateralAmount).toBe(
      EXPECTED_REQUIRED_COLLATERAL_SATS
    );
  });

  test("rounds required collateral UP when LTV does not divide evenly", () => {
    // given
    const request = {
      borrowAmount: 1_000_000n,
      borrowPoolId: "xxxxx-usdt-pool",
      collateralPoolId: "aaaaa-btc-pool",
      targetLtvBps: 6500n,
    };

    // when
    const result = quoteModule.getQuote(request, pools, prices);

    // then
    expect(result.validationErrors).toHaveLength(0);
    expect(result.borrowUsd).toBe(100_000_000n);
    expect(result.requiredCollateralUsd).toBe(153_846_154n);
    expect(result.requiredCollateralAmount).toBe(1_539n);
  });

  test("returns error when borrow pool not found", () => {
    // given
    const request = {
      borrowAmount: 100000000n,
      borrowPoolId: "invalid-pool",
      collateralPoolId: "aaaaa-btc-pool",
      targetLtvBps: 5000n,
    };

    // when
    const result = quoteModule.getQuote(request, pools, prices);

    // then
    expect(result.validationErrors).toHaveLength(1);
    expect(result.validationErrors[0]?.code).toBe(
      QuoteValidationErrorCode.POOL_NOT_FOUND
    );
  });

  test("returns error when LTV exceeds max allowed", () => {
    // given
    const request = {
      borrowAmount: 100000000n,
      borrowPoolId: "xxxxx-usdt-pool",
      collateralPoolId: "aaaaa-btc-pool",
      targetLtvBps: 9000n,
    };

    // when
    const result = quoteModule.getQuote(request, pools, prices);

    // then
    expect(result.validationErrors).toHaveLength(1);
    expect(result.validationErrors[0]?.code).toBe(
      QuoteValidationErrorCode.LTV_EXCEEDS_MAX
    );
  });

  test("returns error when LTV exceeds 100%", () => {
    // given
    const request = {
      borrowAmount: 100000000n,
      borrowPoolId: "xxxxx-usdt-pool",
      collateralPoolId: "aaaaa-btc-pool",
      targetLtvBps: 10_001n,
    };

    // when
    const result = quoteModule.getQuote(request, pools, prices);

    // then
    expect(
      result.validationErrors.some(
        (e) => e.code === QuoteValidationErrorCode.INVALID_LTV
      )
    ).toBe(true);
  });

  test("returns error when same asset borrowing not allowed", () => {
    // given
    const request = {
      borrowAmount: 100000000n,
      borrowPoolId: "aaaaa-btc-pool",
      collateralPoolId: "aaaaa-btc-pool",
      targetLtvBps: 5000n,
    };

    // when
    const result = quoteModule.getQuote(request, pools, prices);

    // then
    expect(result.validationErrors).toHaveLength(1);
    expect(result.validationErrors[0]?.code).toBe(
      QuoteValidationErrorCode.SAME_ASSET_NOT_ALLOWED
    );
  });

  test("returns error when same asset borrowing uses different pool ids", () => {
    // given
    const secondBtcPool: Pool = {
      ...btcPool,
      id: "bbbbb-btc-pool",
    };
    const request = {
      borrowAmount: 100000000n,
      borrowPoolId: "bbbbb-btc-pool",
      collateralPoolId: "aaaaa-btc-pool",
      targetLtvBps: 5000n,
    };

    // when
    const result = quoteModule.getQuote(
      request,
      [btcPool, secondBtcPool, usdtPool],
      prices
    );

    // then
    expect(result.validationErrors).toHaveLength(1);
    expect(result.validationErrors[0]?.code).toBe(
      QuoteValidationErrorCode.SAME_ASSET_NOT_ALLOWED
    );
  });

  test("allows same asset borrowing when enabled on pool", () => {
    // given
    const request = {
      borrowAmount: 100000000n,
      borrowPoolId: "xxxxx-usdt-pool",
      collateralPoolId: "xxxxx-usdt-pool",
      targetLtvBps: 5000n,
    };

    // when
    const result = quoteModule.getQuote(request, pools, prices);

    // then
    expect(result.validationErrors).toHaveLength(0);
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]?.code).toBe(
      QuoteWarningCode.SAME_ASSET_BORROWING
    );
  });

  test("warns when same asset borrowing uses different pool ids and is enabled", () => {
    // given
    const secondUsdtPool: Pool = {
      ...usdtPool,
      id: "yyyyy-usdt-pool",
    };
    const request = {
      borrowAmount: 100000000n,
      borrowPoolId: "yyyyy-usdt-pool",
      collateralPoolId: "xxxxx-usdt-pool",
      targetLtvBps: 5000n,
    };

    // when
    const result = quoteModule.getQuote(
      request,
      [btcPool, usdtPool, secondUsdtPool],
      prices
    );

    // then
    expect(result.validationErrors).toHaveLength(0);
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]?.code).toBe(
      QuoteWarningCode.SAME_ASSET_BORROWING
    );
  });

  test("returns high LTV warning when at or above 80%", () => {
    // given
    const request = {
      borrowAmount: 100000000n,
      borrowPoolId: "aaaaa-btc-pool",
      collateralPoolId: "xxxxx-usdt-pool",
      targetLtvBps: 8200n,
    };

    // when
    const result = quoteModule.getQuote(request, pools, prices);

    // then
    expect(result.validationErrors).toHaveLength(0);
    expect(
      result.warnings.some((w) => w.code === QuoteWarningCode.HIGH_LTV)
    ).toBe(true);
  });

  test("returns error when stablecoin borrow amount is below the asset minimum", () => {
    // given
    const request = {
      borrowAmount: 999_999n,
      borrowPoolId: "xxxxx-usdt-pool",
      collateralPoolId: "aaaaa-btc-pool",
      targetLtvBps: 5000n,
    };

    // when
    const result = quoteModule.getQuote(request, pools, prices);

    // then
    expect(result.validationErrors).toHaveLength(1);
    expect(result.validationErrors[0]?.code).toBe(
      QuoteValidationErrorCode.BORROW_AMOUNT_TOO_LOW
    );
    expect(result.validationErrors[0]?.message).toBe(
      "Borrow amount must be at least 1000000 base units for USDT"
    );
  });

  test("allows stablecoin borrow amount equal to the asset minimum", () => {
    // given
    const request = {
      borrowAmount: 1_000_000n,
      borrowPoolId: "xxxxx-usdt-pool",
      collateralPoolId: "aaaaa-btc-pool",
      targetLtvBps: 5000n,
    };

    // when
    const result = quoteModule.getQuote(request, pools, prices);

    // then
    expect(result.validationErrors).toHaveLength(0);
  });

  test("returns error when BTC borrow amount is below the asset minimum", () => {
    // given
    const request = {
      borrowAmount: 5_099n,
      borrowPoolId: "aaaaa-btc-pool",
      collateralPoolId: "xxxxx-usdt-pool",
      targetLtvBps: 5000n,
    };

    // when
    const result = quoteModule.getQuote(request, pools, prices);

    // then
    expect(result.validationErrors).toHaveLength(1);
    expect(result.validationErrors[0]).toMatchObject({
      code: QuoteValidationErrorCode.BORROW_AMOUNT_TOO_LOW,
      message: "Borrow amount must be at least 5100 base units for BTC",
    });
  });

  test("returns error when price not available", () => {
    // given
    const usdcPool: Pool = {
      ...usdtPool,
      id: "eeee-usdc-pool",
      asset: "USDC",
      chain: "ETH",
    };
    const request = {
      borrowAmount: 100000000n,
      borrowPoolId: usdcPool.id,
      collateralPoolId: "aaaaa-btc-pool",
      targetLtvBps: 5000n,
    };

    // when
    const result = quoteModule.getQuote(request, [btcPool, usdcPool], prices);

    // then
    expect(result.validationErrors).toHaveLength(1);
    expect(result.validationErrors[0]?.code).toBe(
      QuoteValidationErrorCode.PRICE_NOT_AVAILABLE
    );
  });

  test("returns error when borrow price is zero or negative", () => {
    // given
    const zeroPrices: AssetPrices = { BTC: 100000, USDT: 0 };
    const request = {
      borrowAmount: 100000000n,
      borrowPoolId: "xxxxx-usdt-pool",
      collateralPoolId: "aaaaa-btc-pool",
      targetLtvBps: 5000n,
    };

    // when
    const result = quoteModule.getQuote(request, pools, zeroPrices);

    // then
    expect(
      result.validationErrors.some(
        (e) => e.code === QuoteValidationErrorCode.PRICE_NOT_AVAILABLE
      )
    ).toBe(true);
  });

  test("computes exact result when target LTV divides evenly", () => {
    // given
    const request = {
      borrowAmount: 100_000_000n,
      borrowPoolId: "xxxxx-usdt-pool",
      collateralPoolId: "aaaaa-btc-pool",
      targetLtvBps: 5_000n,
    };

    // when
    const result = quoteModule.getQuote(request, pools, prices);

    // then
    expect(result.requiredCollateralUsd).toBe(20_000_000_000n);
    expect(result.requiredCollateralAmount).toBe(200_000n);
  });

  test("preserves precision for very large borrow amounts", () => {
    // given
    const request = {
      borrowAmount: 1_000_000_000_000n,
      borrowPoolId: "xxxxx-usdt-pool",
      collateralPoolId: "aaaaa-btc-pool",
      targetLtvBps: 5_000n,
    };

    // when
    const result = quoteModule.getQuote(request, pools, prices);

    // then
    expect(result.validationErrors).toHaveLength(0);
    expect(result.borrowUsd).toBe(100_000_000_000_000n);
    expect(result.requiredCollateralUsd).toBe(200_000_000_000_000n);
    expect(result.requiredCollateralAmount).toBe(2_000_000_000n);
  });

  test("returns error when borrow amount is negative", () => {
    // given
    const request = {
      borrowAmount: -1n,
      borrowPoolId: "xxxxx-usdt-pool",
      collateralPoolId: "aaaaa-btc-pool",
      targetLtvBps: 5_000n,
    };

    // when
    const result = quoteModule.getQuote(request, pools, prices);

    // then
    expect(result.validationErrors).toHaveLength(1);
    expect(result.validationErrors[0]?.code).toBe(
      QuoteValidationErrorCode.BORROW_AMOUNT_TOO_LOW
    );
    expect(result.validationErrors[0]?.message).toBe(
      "Borrow amount must be greater than 0"
    );
  });
});
