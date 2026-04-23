import { ceilDivBigint } from "../../core/utils/bigint";
import type { AssetPrices, Pool } from "../market/types";
import type {
  QuoteRequest,
  QuoteResult,
  QuoteValidationError,
  QuoteWarning,
} from "./types";
import { QuoteValidationErrorCode, QuoteWarningCode } from "./types";

const BASIS_POINTS_DENOMINATOR = 10_000n;
const BPS_PER_PERCENT = 100n;
const MIN_LTV_BPS = 0n;
const HIGH_LTV_WARNING_THRESHOLD_BPS = 8_000n;
const MIN_BORROW_AMOUNT_SATS = 5_000n;
const INTERNAL_USD_DECIMAL_PLACES = 8;
const PRICE_SCALE_DECIMAL_PLACES = 8;
const ASSET_DECIMAL_PLACES: Record<string, number> = {
  BTC: 8,
  USDC: 6,
  USDT: 6,
};

type CreateQuoteResultParams = {
  borrowAmount: bigint;
  borrowPoolId: string;
  collateralPoolId: string;
  borrowUsd: bigint;
  requiredCollateralAmount: bigint;
  requiredCollateralUsd: bigint;
  maxAllowedLtvBps: bigint;
  targetLtvBps: bigint;
  borrowAsset: string;
  collateralAsset: string;
  validationErrors: QuoteValidationError[];
  warnings: QuoteWarning[];
};

export class QuoteModule {
  /**
   * Calculates a loan quote based on borrow amount, LTV, and pool selections.
   *
   * All arithmetic is performed in bigint. `requiredCollateralAmount` and
   * `requiredCollateralUsd` are rounded UP so the caller never under-collateralizes
   * due to integer truncation. `borrowUsd` is floored for display.
   *
   * @param request - Quote request parameters.
   * @param pools - All available pools (use MarketModule.listPools() to fetch).
   * @param prices - Asset prices in USD (use MarketModule.getAssetPrices() to fetch).
   * @returns Quote result with required collateral and validation state.
   */
  async getQuote(
    request: QuoteRequest,
    pools: Pool[],
    prices: AssetPrices
  ): Promise<QuoteResult> {
    const { borrowAmount, borrowPoolId, collateralPoolId, targetLtvBps } =
      request;

    const validationErrors: QuoteValidationError[] = [];
    const warnings: QuoteWarning[] = [];

    const borrowPool = pools.find((p) => p.id === borrowPoolId);
    const collateralPool = pools.find((p) => p.id === collateralPoolId);

    if (!borrowPool) {
      validationErrors.push({
        code: QuoteValidationErrorCode.POOL_NOT_FOUND,
        message: `Borrow pool not found: ${borrowPoolId}`,
      });
    }

    if (!collateralPool) {
      validationErrors.push({
        code: QuoteValidationErrorCode.POOL_NOT_FOUND,
        message: `Collateral pool not found: ${collateralPoolId}`,
      });
    }

    if (!borrowPool || !collateralPool) {
      return createQuoteResult({
        borrowAmount,
        borrowPoolId,
        collateralPoolId,
        borrowUsd: 0n,
        requiredCollateralAmount: 0n,
        requiredCollateralUsd: 0n,
        maxAllowedLtvBps: 0n,
        targetLtvBps,
        borrowAsset: "",
        collateralAsset: "",
        validationErrors,
        warnings,
      });
    }

    const borrowAsset = borrowPool.asset;
    const collateralAsset = collateralPool.asset;
    const borrowPrice = prices[borrowAsset];
    const collateralPrice = prices[collateralAsset];

    if (
      borrowPrice === undefined ||
      !Number.isFinite(borrowPrice) ||
      borrowPrice <= 0
    ) {
      validationErrors.push({
        code: QuoteValidationErrorCode.PRICE_NOT_AVAILABLE,
        message: `Price not available for borrow asset: ${borrowAsset}`,
      });
    }

    if (
      collateralPrice === undefined ||
      !Number.isFinite(collateralPrice) ||
      collateralPrice <= 0
    ) {
      validationErrors.push({
        code: QuoteValidationErrorCode.PRICE_NOT_AVAILABLE,
        message: `Price not available for collateral asset: ${collateralAsset}`,
      });
    }

    if (borrowAmount < 0n) {
      validationErrors.push({
        code: QuoteValidationErrorCode.BORROW_AMOUNT_TOO_LOW,
        message: `Borrow amount must be non-negative`,
      });
    }

    if (targetLtvBps <= MIN_LTV_BPS) {
      validationErrors.push({
        code: QuoteValidationErrorCode.INVALID_LTV,
        message: `LTV must be greater than 0`,
      });
    }

    if (targetLtvBps > BASIS_POINTS_DENOMINATOR) {
      validationErrors.push({
        code: QuoteValidationErrorCode.INVALID_LTV,
        message: `LTV must not exceed ${formatBpsAsPercent(BASIS_POINTS_DENOMINATOR)}%`,
      });
    }

    const maxAllowedLtvBps = collateralPool.maxLtv;
    if (targetLtvBps > maxAllowedLtvBps) {
      validationErrors.push({
        code: QuoteValidationErrorCode.LTV_EXCEEDS_MAX,
        message: `Target LTV ${formatBpsAsPercent(targetLtvBps)}% exceeds max allowed ${formatBpsAsPercent(maxAllowedLtvBps)}%`,
      });
    }

    if (borrowAmount < MIN_BORROW_AMOUNT_SATS) {
      validationErrors.push({
        code: QuoteValidationErrorCode.BORROW_AMOUNT_TOO_LOW,
        message: `Borrow amount must be at least ${MIN_BORROW_AMOUNT_SATS} sats`,
      });
    }

    if (
      borrowPoolId === collateralPoolId &&
      !collateralPool.sameAssetBorrowing
    ) {
      validationErrors.push({
        code: QuoteValidationErrorCode.SAME_ASSET_NOT_ALLOWED,
        message: `Same asset borrowing not allowed for pool ${collateralPoolId}`,
      });
    }

    if (
      borrowPoolId === collateralPoolId &&
      collateralPool.sameAssetBorrowing
    ) {
      warnings.push({
        code: QuoteWarningCode.SAME_ASSET_BORROWING,
        message: `Using same asset for borrow and collateral`,
      });
    }

    if (targetLtvBps >= HIGH_LTV_WARNING_THRESHOLD_BPS) {
      warnings.push({
        code: QuoteWarningCode.HIGH_LTV,
        message: `LTV above ${formatBpsAsPercent(HIGH_LTV_WARNING_THRESHOLD_BPS)}% may put your position at higher risk of liquidation`,
      });
    }

    if (validationErrors.length > 0) {
      return createQuoteResult({
        borrowAmount,
        borrowPoolId,
        collateralPoolId,
        borrowUsd: 0n,
        requiredCollateralAmount: 0n,
        requiredCollateralUsd: 0n,
        maxAllowedLtvBps,
        targetLtvBps,
        borrowAsset,
        collateralAsset,
        validationErrors,
        warnings,
      });
    }

    const borrowAssetDecimals = getAssetDecimalPlaces(borrowAsset);
    const collateralAssetDecimals = getAssetDecimalPlaces(collateralAsset);
    const borrowPriceScaled = scalePriceUsdToBigint(borrowPrice as number);
    const collateralPriceScaled = scalePriceUsdToBigint(
      collateralPrice as number
    );

    const borrowUsdInternal = computeUsdInternalFromBaseUnits({
      amountBaseUnits: borrowAmount,
      priceScaled: borrowPriceScaled,
      assetDecimalPlaces: borrowAssetDecimals,
    });

    const requiredCollateralUsdInternal = ceilDivBigint(
      borrowUsdInternal * BASIS_POINTS_DENOMINATOR,
      targetLtvBps
    );

    const requiredCollateralAmount = computeBaseUnitsFromUsdInternalCeil({
      usdInternal: requiredCollateralUsdInternal,
      priceScaled: collateralPriceScaled,
      assetDecimalPlaces: collateralAssetDecimals,
    });

    return createQuoteResult({
      borrowAmount,
      borrowPoolId,
      collateralPoolId,
      borrowUsd: borrowUsdInternal,
      requiredCollateralAmount,
      requiredCollateralUsd: requiredCollateralUsdInternal,
      maxAllowedLtvBps,
      targetLtvBps,
      borrowAsset,
      collateralAsset,
      validationErrors,
      warnings,
    });
  }
}

function createQuoteResult(params: CreateQuoteResultParams): QuoteResult {
  return {
    borrowAmount: params.borrowAmount,
    borrowUsd: params.borrowUsd,
    requiredCollateralAmount: params.requiredCollateralAmount,
    requiredCollateralUsd: params.requiredCollateralUsd,
    maxAllowedLtvBps: params.maxAllowedLtvBps,
    targetLtvBps: params.targetLtvBps,
    borrowPoolId: params.borrowPoolId,
    collateralPoolId: params.collateralPoolId,
    borrowAsset: params.borrowAsset,
    collateralAsset: params.collateralAsset,
    validationErrors: params.validationErrors,
    warnings: params.warnings,
  };
}

function computeUsdInternalFromBaseUnits(params: {
  amountBaseUnits: bigint;
  priceScaled: bigint;
  assetDecimalPlaces: number;
}): bigint {
  const { amountBaseUnits, priceScaled, assetDecimalPlaces } = params;
  const scaleDiff = INTERNAL_USD_DECIMAL_PLACES - PRICE_SCALE_DECIMAL_PLACES;
  const numerator = amountBaseUnits * priceScaled;
  const assetDecimalFactor = 10n ** BigInt(assetDecimalPlaces);

  if (scaleDiff >= 0) {
    return (numerator * 10n ** BigInt(scaleDiff)) / assetDecimalFactor;
  }

  return numerator / (assetDecimalFactor * 10n ** BigInt(-scaleDiff));
}

function computeBaseUnitsFromUsdInternalCeil(params: {
  usdInternal: bigint;
  priceScaled: bigint;
  assetDecimalPlaces: number;
}): bigint {
  const { usdInternal, priceScaled, assetDecimalPlaces } = params;
  const scaleDiff = INTERNAL_USD_DECIMAL_PLACES - PRICE_SCALE_DECIMAL_PLACES;
  const assetDecimalFactor = 10n ** BigInt(assetDecimalPlaces);

  if (scaleDiff >= 0) {
    return ceilDivBigint(
      usdInternal * assetDecimalFactor,
      priceScaled * 10n ** BigInt(scaleDiff)
    );
  }

  return ceilDivBigint(
    usdInternal * assetDecimalFactor * 10n ** BigInt(-scaleDiff),
    priceScaled
  );
}

function scalePriceUsdToBigint(priceUsd: number): bigint {
  const scaled = Math.round(priceUsd * 10 ** PRICE_SCALE_DECIMAL_PLACES);
  return BigInt(scaled);
}

function getAssetDecimalPlaces(asset: string): number {
  return ASSET_DECIMAL_PLACES[asset] ?? INTERNAL_USD_DECIMAL_PLACES;
}

function formatBpsAsPercent(bps: bigint): string {
  const whole = bps / BPS_PER_PERCENT;
  const fractional = bps % BPS_PER_PERCENT;
  if (fractional === 0n) {
    return whole.toString();
  }

  const padded = fractional.toString().padStart(2, "0").replace(/0+$/, "");
  return `${whole}.${padded}`;
}
