import type { AssetPrices, Pool } from "../market/types";
import type {
  QuoteRequest,
  QuoteResult,
  QuoteValidationError,
  QuoteWarning,
} from "./types";
import { QuoteValidationErrorCode, QuoteWarningCode } from "./types";

const BASIS_POINTS = 10000n;
const MIN_LTV_BPS = 0n;
const MIN_BORROW_AMOUNT = 5000n;
const INTERNAL_USD_DECIMALS = 8;
const ASSET_DECIMALS: Record<string, number> = {
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

    if (borrowPrice === undefined || borrowPrice === 0) {
      validationErrors.push({
        code: QuoteValidationErrorCode.PRICE_NOT_AVAILABLE,
        message: `Price not available for borrow asset: ${borrowAsset}`,
      });
    }

    if (collateralPrice === undefined || collateralPrice === 0) {
      validationErrors.push({
        code: QuoteValidationErrorCode.PRICE_NOT_AVAILABLE,
        message: `Price not available for collateral asset: ${collateralAsset}`,
      });
    }

    if (targetLtvBps <= MIN_LTV_BPS) {
      validationErrors.push({
        code: QuoteValidationErrorCode.INVALID_LTV,
        message: `LTV must be greater than 0`,
      });
    }

    const maxAllowedLtvBps = collateralPool.maxLtv;
    if (targetLtvBps > maxAllowedLtvBps) {
      validationErrors.push({
        code: QuoteValidationErrorCode.LTV_EXCEEDS_MAX,
        message: `Target LTV ${Number(targetLtvBps) / 100}% exceeds max allowed ${Number(maxAllowedLtvBps) / 100}%`,
      });
    }

    if (borrowAmount < MIN_BORROW_AMOUNT) {
      validationErrors.push({
        code: QuoteValidationErrorCode.BORROW_AMOUNT_TOO_LOW,
        message: `Borrow amount must be at least ${MIN_BORROW_AMOUNT} sats`,
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

    if (targetLtvBps >= 8000n) {
      warnings.push({
        code: QuoteWarningCode.HIGH_LTV,
        message: `LTV above 80% may put your position at higher risk of liquidation`,
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

    const borrowAssetDecimals = getAssetDecimals(borrowAsset);
    const collateralAssetDecimals = getAssetDecimals(collateralAsset);
    const borrowUsd = toUsd(borrowAmount, borrowPrice, borrowAssetDecimals);
    const targetLtvDecimal = Number(targetLtvBps) / Number(BASIS_POINTS);
    const requiredCollateralUsd = borrowUsd / targetLtvDecimal;
    const requiredCollateralAmount = fromUsd(
      requiredCollateralUsd,
      collateralPrice,
      collateralAssetDecimals
    );

    return createQuoteResult({
      borrowAmount,
      borrowPoolId,
      collateralPoolId,
      borrowUsd: usdToInternal(borrowUsd),
      requiredCollateralAmount,
      requiredCollateralUsd: usdToInternal(requiredCollateralUsd),
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

function toUsd(amount: bigint, price: number, assetDecimals: number): number {
  return baseUnitsToDecimalAmount(amount, assetDecimals) * price;
}

function fromUsd(usd: number, price: number, assetDecimals: number): bigint {
  return decimalAmountToBaseUnits(usd / price, assetDecimals);
}

function usdToInternal(usd: number): bigint {
  return BigInt(Math.floor(usd * 10 ** INTERNAL_USD_DECIMALS));
}

function getAssetDecimals(asset: string): number {
  return ASSET_DECIMALS[asset] ?? INTERNAL_USD_DECIMALS;
}

function baseUnitsToDecimalAmount(
  amount: bigint,
  assetDecimals: number
): number {
  return Number(amount) / 10 ** assetDecimals;
}

function decimalAmountToBaseUnits(
  amount: number,
  assetDecimals: number
): bigint {
  return BigInt(Math.floor(amount * 10 ** assetDecimals));
}
