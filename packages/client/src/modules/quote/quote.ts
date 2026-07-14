import { getBorrowAmountMinimumValidationError } from "../../core/borrow-minimums";
import { getSameAssetBorrowingValidationError } from "../../core/same-asset-borrowing";
import { ceilDivBigint } from "../../core/utils/bigint";
import type { AssetPrices, Pool } from "../market/types";
import type {
  CalculateLtvRequest,
  LtvCalculation,
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
const INTERNAL_USD_DECIMAL_PLACES = 8;
const PRICE_SCALE_DECIMAL_PLACES = 8;

interface CreateQuoteResultParams {
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
}

interface CreateLtvCalculationParams {
  request: CalculateLtvRequest;
  borrowUsd: bigint;
  collateralUsd: bigint;
  ltvBps: bigint;
  maxAllowedLtvBps: bigint;
  borrowAsset: string;
  collateralAsset: string;
  validationErrors: QuoteValidationError[];
}

interface ComputeUsdInternalFromBaseUnitsParams {
  amountBaseUnits: bigint;
  priceScaled: bigint;
  assetDecimalPlaces: number;
}

interface ComputeBaseUnitsFromUsdInternalCeilParams {
  usdInternal: bigint;
  priceScaled: bigint;
  assetDecimalPlaces: number;
}

/** Pure quote helpers for LTV and required-collateral calculations. */
export class QuoteModule {
  /**
   * Calculates current LTV from caller-supplied borrow and collateral amounts.
   *
   * Amount fields are base units. USD fields are scaled to 8 decimal places.
   *
   * @param request - Borrow and collateral pool ids plus base-unit amounts.
   * @param pools - Available pools, usually from `client.market.listPools()`.
   * @param prices - USD price map, usually from `client.market.getAssetPrices()`.
   * @returns LTV calculation plus validation errors when inputs are unusable.
   */
  calculateLtv(
    request: CalculateLtvRequest,
    pools: Pool[],
    prices: AssetPrices
  ): LtvCalculation {
    const validationErrors: QuoteValidationError[] = [];
    const borrowPool = pools.find((pool) => pool.id === request.borrowPoolId);
    const collateralPool = pools.find(
      (pool) => pool.id === request.collateralPoolId
    );

    if (!borrowPool) {
      validationErrors.push({
        code: QuoteValidationErrorCode.POOL_NOT_FOUND,
        message: `Borrow pool not found: ${request.borrowPoolId}`,
      });
    }

    if (!collateralPool) {
      validationErrors.push({
        code: QuoteValidationErrorCode.POOL_NOT_FOUND,
        message: `Collateral pool not found: ${request.collateralPoolId}`,
      });
    }

    if (!borrowPool || !collateralPool) {
      return createLtvCalculation({
        request,
        borrowUsd: 0n,
        collateralUsd: 0n,
        ltvBps: 0n,
        maxAllowedLtvBps: 0n,
        borrowAsset: "",
        collateralAsset: "",
        validationErrors,
      });
    }

    const borrowPrice = prices[borrowPool.asset];
    const collateralPrice = prices[collateralPool.asset];

    if (!isValidPrice(borrowPrice)) {
      validationErrors.push({
        code: QuoteValidationErrorCode.PRICE_NOT_AVAILABLE,
        message: `Price not available for borrow asset: ${borrowPool.asset}`,
      });
    }

    if (!isValidPrice(collateralPrice)) {
      validationErrors.push({
        code: QuoteValidationErrorCode.PRICE_NOT_AVAILABLE,
        message: `Price not available for collateral asset: ${collateralPool.asset}`,
      });
    }

    const borrowAmountError = createBorrowAmountValidationError({
      amount: request.borrowAmount,
      asset: borrowPool.asset,
    });
    if (borrowAmountError) {
      validationErrors.push(borrowAmountError);
    }

    if (request.collateralAmount <= 0n) {
      validationErrors.push({
        code: QuoteValidationErrorCode.INVALID_LTV,
        message: "Collateral amount must be greater than 0",
      });
    }

    const sameAssetBorrowingError = getSameAssetBorrowingValidationError({
      borrowAsset: borrowPool.asset,
      collateralAsset: collateralPool.asset,
      collateralAmount: request.collateralAmount,
      poolId: request.borrowPoolId,
      policy: borrowPool,
    });
    if (sameAssetBorrowingError) {
      validationErrors.push({
        code: QuoteValidationErrorCode.SAME_ASSET_NOT_ALLOWED,
        message: sameAssetBorrowingError.message,
      });
    }

    if (validationErrors.length > 0) {
      return createLtvCalculation({
        request,
        borrowUsd: 0n,
        collateralUsd: 0n,
        ltvBps: 0n,
        maxAllowedLtvBps: collateralPool.maxLtv,
        borrowAsset: borrowPool.asset,
        collateralAsset: collateralPool.asset,
        validationErrors,
      });
    }

    const borrowUsd = computeUsdInternalFromBaseUnits({
      amountBaseUnits: request.borrowAmount,
      priceScaled: scalePriceUsdToBigint(borrowPrice as number),
      assetDecimalPlaces: getPoolDecimalPlaces(borrowPool),
    });
    const collateralUsd = computeUsdInternalFromBaseUnits({
      amountBaseUnits: request.collateralAmount,
      priceScaled: scalePriceUsdToBigint(collateralPrice as number),
      assetDecimalPlaces: getPoolDecimalPlaces(collateralPool),
    });

    if (collateralUsd <= 0n) {
      validationErrors.push({
        code: QuoteValidationErrorCode.INVALID_LTV,
        message: "Collateral value must be greater than 0",
      });

      return createLtvCalculation({
        request,
        borrowUsd,
        collateralUsd,
        ltvBps: 0n,
        maxAllowedLtvBps: collateralPool.maxLtv,
        borrowAsset: borrowPool.asset,
        collateralAsset: collateralPool.asset,
        validationErrors,
      });
    }

    return createLtvCalculation({
      request,
      borrowUsd,
      collateralUsd,
      ltvBps: roundDivBigint(
        borrowUsd * BASIS_POINTS_DENOMINATOR,
        collateralUsd
      ),
      maxAllowedLtvBps: collateralPool.maxLtv,
      borrowAsset: borrowPool.asset,
      collateralAsset: collateralPool.asset,
      validationErrors,
    });
  }

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
  getQuote(
    request: QuoteRequest,
    pools: Pool[],
    prices: AssetPrices
  ): QuoteResult {
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

    const borrowAmountError = createBorrowAmountValidationError({
      amount: borrowAmount,
      asset: borrowAsset,
    });
    if (borrowAmountError) {
      validationErrors.push(borrowAmountError);
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

    const isSameAssetBorrowingRequest = borrowAsset === collateralAsset;
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

    const borrowAssetDecimals = getPoolDecimalPlaces(borrowPool);
    const collateralAssetDecimals = getPoolDecimalPlaces(collateralPool);
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

    const sameAssetBorrowingError = getSameAssetBorrowingValidationError({
      borrowAsset,
      collateralAsset,
      collateralAmount: requiredCollateralAmount,
      poolId: borrowPoolId,
      policy: borrowPool,
    });
    if (sameAssetBorrowingError) {
      validationErrors.push({
        code: QuoteValidationErrorCode.SAME_ASSET_NOT_ALLOWED,
        message: sameAssetBorrowingError.message,
      });
    }

    if (isSameAssetBorrowingRequest && !sameAssetBorrowingError) {
      warnings.push({
        code: QuoteWarningCode.SAME_ASSET_BORROWING,
        message: `Using same asset for borrow and collateral`,
      });
    }

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

function createLtvCalculation(
  params: CreateLtvCalculationParams
): LtvCalculation {
  return {
    borrowAmount: params.request.borrowAmount,
    collateralAmount: params.request.collateralAmount,
    borrowUsd: params.borrowUsd,
    collateralUsd: params.collateralUsd,
    ltvBps: params.ltvBps,
    maxAllowedLtvBps: params.maxAllowedLtvBps,
    borrowPoolId: params.request.borrowPoolId,
    collateralPoolId: params.request.collateralPoolId,
    borrowAsset: params.borrowAsset,
    collateralAsset: params.collateralAsset,
    validationErrors: params.validationErrors,
  };
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

function createBorrowAmountValidationError(params: {
  amount: bigint;
  asset: string;
}): QuoteValidationError | null {
  if (params.amount <= 0n) {
    return {
      code: QuoteValidationErrorCode.BORROW_AMOUNT_TOO_LOW,
      message: "Borrow amount must be greater than 0",
    };
  }

  const minimumBorrowAmountError =
    getBorrowAmountMinimumValidationError(params);
  if (!minimumBorrowAmountError) {
    return null;
  }

  return {
    code: QuoteValidationErrorCode.BORROW_AMOUNT_TOO_LOW,
    message: minimumBorrowAmountError.message,
  };
}

function computeUsdInternalFromBaseUnits(
  params: ComputeUsdInternalFromBaseUnitsParams
): bigint {
  const { amountBaseUnits, priceScaled, assetDecimalPlaces } = params;
  const scaleDiff = INTERNAL_USD_DECIMAL_PLACES - PRICE_SCALE_DECIMAL_PLACES;
  const numerator = amountBaseUnits * priceScaled;
  const assetDecimalFactor = 10n ** BigInt(assetDecimalPlaces);

  if (scaleDiff >= 0) {
    return (numerator * 10n ** BigInt(scaleDiff)) / assetDecimalFactor;
  }

  return numerator / (assetDecimalFactor * 10n ** BigInt(-scaleDiff));
}

function computeBaseUnitsFromUsdInternalCeil(
  params: ComputeBaseUnitsFromUsdInternalCeilParams
): bigint {
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

function roundDivBigint(numerator: bigint, denominator: bigint): bigint {
  return (numerator + denominator / 2n) / denominator;
}

function scalePriceUsdToBigint(priceUsd: number): bigint {
  const scaled = Math.round(priceUsd * 10 ** PRICE_SCALE_DECIMAL_PLACES);
  return BigInt(scaled);
}

function isValidPrice(price: number | undefined): price is number {
  return typeof price === "number" && Number.isFinite(price) && price > 0;
}

function getPoolDecimalPlaces(pool: Pool): number {
  return Number(pool.decimals);
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
