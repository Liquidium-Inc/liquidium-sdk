import { describe, expect, test } from "vitest";
import type { AssetPrices, Pool } from "../../market/types";
import { QuoteModule } from "../quote";
import { QuoteValidationErrorCode, QuoteWarningCode } from "../types";

describe("QuoteModule", () => {
  const quoteModule = new QuoteModule();

  const btcPool: Pool = {
    id: "aaaaa-btc-pool",
    asset: "BTC",
    chain: "Bitcoin",
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
    const ETH_BASE_UNITS_PER_TOKEN = 1_000_000_000_000_000_000n;
    const ethPool: Pool = {
      ...usdtPool,
      id: "eeee-eth-pool",
      asset: "ETH",
      decimals: 18n,
    };
    const request = {
      borrowAmount: ETH_BASE_UNITS_PER_TOKEN,
      borrowPoolId: ethPool.id,
      collateralPoolId: btcPool.id,
      targetLtvBps: 5_000n,
    };
    const pricesWithEth: AssetPrices = {
      ...prices,
      ETH: 2_500,
    };

    // when
    const result = quoteModule.getQuote(
      request,
      [btcPool, ethPool],
      pricesWithEth
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

  test("returns error when borrow amount too low", () => {
    // given
    const request = {
      borrowAmount: 1000n,
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
  });

  test("returns error when price not available", () => {
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
    const result = quoteModule.getQuote(request, [btcPool, ethPool], prices);

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
      "Borrow amount must be non-negative"
    );
  });
});
