export interface QuoteRequest {
  borrowAmount: bigint;
  borrowPoolId: string;
  collateralPoolId: string;
  targetLtvBps: bigint;
}

export interface QuoteValidationError {
  code: QuoteValidationErrorCode;
  message: string;
}

export enum QuoteValidationErrorCode {
  INVALID_LTV = "INVALID_LTV",
  LTV_EXCEEDS_MAX = "LTV_EXCEEDS_MAX",
  SAME_ASSET_NOT_ALLOWED = "SAME_ASSET_NOT_ALLOWED",
  BORROW_AMOUNT_TOO_LOW = "BORROW_AMOUNT_TOO_LOW",
  PRICE_NOT_AVAILABLE = "PRICE_NOT_AVAILABLE",
  POOL_NOT_FOUND = "POOL_NOT_FOUND",
  UNKNOWN = "UNKNOWN",
}

export interface QuoteWarning {
  code: QuoteWarningCode;
  message: string;
}

export enum QuoteWarningCode {
  HIGH_LTV = "HIGH_LTV",
  SAME_ASSET_BORROWING = "SAME_ASSET_BORROWING",
}

export interface QuoteResult {
  borrowAmount: bigint;
  borrowUsd: bigint;
  requiredCollateralAmount: bigint;
  requiredCollateralUsd: bigint;
  maxAllowedLtvBps: bigint;
  targetLtvBps: bigint;
  borrowPoolId: string;
  collateralPoolId: string;
  borrowAsset: string;
  collateralAsset: string;
  validationErrors: QuoteValidationError[];
  warnings: QuoteWarning[];
}
