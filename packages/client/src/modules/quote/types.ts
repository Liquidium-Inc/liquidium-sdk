/** Input for calculating required collateral from a target LTV. */
export interface QuoteRequest {
  /** Requested borrow amount in borrow asset base units. */
  borrowAmount: bigint;
  /** Pool principal text for the borrow side. */
  borrowPoolId: string;
  /** Pool principal text for the collateral side. */
  collateralPoolId: string;
  /** Target loan-to-value ratio in basis points. */
  targetLtvBps: bigint;
}

/** Input for calculating LTV from explicit borrow and collateral amounts. */
export interface CalculateLtvRequest {
  /** Requested borrow amount in borrow asset base units. */
  borrowAmount: bigint;
  /** Pool principal text for the borrow side. */
  borrowPoolId: string;
  /** Collateral amount in collateral asset base units. */
  collateralAmount: bigint;
  /** Pool principal text for the collateral side. */
  collateralPoolId: string;
}

/** Validation error produced by quote helpers. */
export interface QuoteValidationError {
  /** Stable machine-readable validation code. */
  code: QuoteValidationErrorCode;
  /** Human-readable validation message. */
  message: string;
}

/** Stable validation codes produced by quote helpers. */
export enum QuoteValidationErrorCode {
  INVALID_LTV = "INVALID_LTV",
  LTV_EXCEEDS_MAX = "LTV_EXCEEDS_MAX",
  SAME_ASSET_NOT_ALLOWED = "SAME_ASSET_NOT_ALLOWED",
  BORROW_AMOUNT_TOO_LOW = "BORROW_AMOUNT_TOO_LOW",
  PRICE_NOT_AVAILABLE = "PRICE_NOT_AVAILABLE",
  POOL_NOT_FOUND = "POOL_NOT_FOUND",
  UNKNOWN = "UNKNOWN",
}

/** Non-blocking warning produced by quote helpers. */
export interface QuoteWarning {
  /** Stable machine-readable warning code. */
  code: QuoteWarningCode;
  /** Human-readable warning message. */
  message: string;
}

/** Stable warning codes produced by quote helpers. */
export enum QuoteWarningCode {
  HIGH_LTV = "HIGH_LTV",
  SAME_ASSET_BORROWING = "SAME_ASSET_BORROWING",
}

/** Quote result for a requested borrow amount and target LTV. */
export interface QuoteResult {
  /** Requested borrow amount in borrow asset base units. */
  borrowAmount: bigint;
  /** Borrow value in internal USD units. */
  borrowUsd: bigint;
  /** Required collateral amount in collateral asset base units. */
  requiredCollateralAmount: bigint;
  /** Required collateral value in internal USD units. */
  requiredCollateralUsd: bigint;
  /** Maximum allowed LTV in basis points for the collateral pool. */
  maxAllowedLtvBps: bigint;
  /** Requested target LTV in basis points. */
  targetLtvBps: bigint;
  /** Pool principal text for the borrow side. */
  borrowPoolId: string;
  /** Pool principal text for the collateral side. */
  collateralPoolId: string;
  /** Borrow asset symbol. */
  borrowAsset: string;
  /** Collateral asset symbol. */
  collateralAsset: string;
  /** Blocking validation errors. Empty when the quote is usable. */
  validationErrors: QuoteValidationError[];
  /** Non-blocking quote warnings. */
  warnings: QuoteWarning[];
}

/** LTV calculation result for explicit borrow and collateral amounts. */
export interface LtvCalculation {
  /** Requested borrow amount in borrow asset base units. */
  borrowAmount: bigint;
  /** Collateral amount in collateral asset base units. */
  collateralAmount: bigint;
  /** Borrow value in internal USD units. */
  borrowUsd: bigint;
  /** Collateral value in internal USD units. */
  collateralUsd: bigint;
  /** Computed LTV in basis points. */
  ltvBps: bigint;
  /** Maximum allowed LTV in basis points for the collateral pool. */
  maxAllowedLtvBps: bigint;
  /** Pool principal text for the borrow side. */
  borrowPoolId: string;
  /** Pool principal text for the collateral side. */
  collateralPoolId: string;
  /** Borrow asset symbol. */
  borrowAsset: string;
  /** Collateral asset symbol. */
  collateralAsset: string;
  /** Blocking validation errors. Empty when the calculation is usable. */
  validationErrors: QuoteValidationError[];
}
