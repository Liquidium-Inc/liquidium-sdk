/**
 * Stable string codes for {@link LiquidiumError}. Use for branching in application code.
 */
export const LiquidiumErrorCode = {
  // Protocol errors
  INVALID_TARGET_PRINCIPAL: "INVALID_TARGET_PRINCIPAL",
  INSUFFICIENT_COLLATERAL: "INSUFFICIENT_COLLATERAL",
  SIGNATURE_EXPIRY_TOO_FAR_IN_FUTURE: "SIGNATURE_EXPIRY_TOO_FAR_IN_FUTURE",
  MAX_LTV_EXCEEDED: "MAX_LTV_EXCEEDED",
  SIGNATURE_EXPIRED: "SIGNATURE_EXPIRED",
  ACCOUNT_ALREADY_LINKED: "ACCOUNT_ALREADY_LINKED",
  ACCOUNT_NOT_FOUND: "ACCOUNT_NOT_FOUND",
  CANNOT_REMOVE_SOLE_ACCOUNT: "CANNOT_REMOVE_SOLE_ACCOUNT",
  PROFILE_NOT_FOUND: "PROFILE_NOT_FOUND",
  PROFILE_ALREADY_EXISTS: "PROFILE_ALREADY_EXISTS",
  SIGNATURE_ERROR: "SIGNATURE_ERROR",
  POOL_NOT_FOUND: "POOL_NOT_FOUND",
  POOL_FROZEN: "POOL_FROZEN",
  POSITION_NOT_FOUND: "POSITION_NOT_FOUND",
  BORROW_CAP_EXCEEDED: "BORROW_CAP_EXCEEDED",
  SUPPLY_CAP_EXCEEDED: "SUPPLY_CAP_EXCEEDED",
  INSUFFICIENT_FUNDS: "INSUFFICIENT_FUNDS",
  HEALTH_FACTOR_TOO_LOW: "HEALTH_FACTOR_TOO_LOW",
  TRANSFER_FAILED: "TRANSFER_FAILED",
  LIQUIDATION_NOT_FOUND: "LIQUIDATION_NOT_FOUND",
  BORROWING_DISABLED: "BORROWING_DISABLED",
  NO_LIQUIDITY: "NO_LIQUIDITY",
  NOT_ALLOWED: "NOT_ALLOWED",

  // Signature verification
  INVALID_ETH_SIGNATURE: "INVALID_ETH_SIGNATURE",
  INVALID_BTC_SIGNATURE: "INVALID_BTC_SIGNATURE",
  INVALID_ETH_ADDRESS: "INVALID_ETH_ADDRESS",
  UNSUPPORTED_CHAIN: "UNSUPPORTED_CHAIN",

  // Client-side
  WITHDRAW_TOO_LOW: "WITHDRAW_TOO_LOW",
  REPAYMENT_EXCEEDS_DEBT: "REPAYMENT_EXCEEDS_DEBT",
  INVALID_ADDRESS: "INVALID_ADDRESS",
  DEPOSIT_ADDRESS_ERROR: "DEPOSIT_ADDRESS_ERROR",

  // Transport
  NETWORK_ERROR: "NETWORK_ERROR",
  SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
  REQUEST_TIMEOUT: "REQUEST_TIMEOUT",
  CANISTER_REJECTED: "CANISTER_REJECTED",

  // Catch-all
  INTERNAL: "INTERNAL",
  VALIDATION_ERROR: "VALIDATION_ERROR",
} as const;

export type LiquidiumErrorCode =
  (typeof LiquidiumErrorCode)[keyof typeof LiquidiumErrorCode];

export interface LiquidiumErrorContext {
  traceId?: string;
  requestId?: string;
}

/**
 * Typed error from the SDK or mapped protocol failures.
 *
 * Prefer checking `code` over parsing `message`.
 */
export class LiquidiumError extends Error {
  /** Machine-readable reason; compare to {@link LiquidiumErrorCode} values. */
  readonly code: LiquidiumErrorCode;
  /** Original error when the SDK wraps an underlying failure. */
  override readonly cause?: unknown;
  /** Backend trace id for support/debugging when available. */
  readonly traceId?: string;
  /** SDK API request id for support/debugging when available. */
  readonly requestId?: string;

  /**
   * @param code - Error code from {@link LiquidiumErrorCode}.
   * @param message - Human-readable detail (defaults to `code` when omitted).
   * @param cause - Optional underlying error.
   * @param context - Optional backend debug identifiers.
   */
  constructor(
    code: LiquidiumErrorCode,
    message?: string,
    cause?: unknown,
    context?: LiquidiumErrorContext
  ) {
    super(message ?? code);
    this.name = "LiquidiumError";
    this.code = code;
    this.cause = cause;
    this.traceId = context?.traceId;
    this.requestId = context?.requestId;
  }
}
