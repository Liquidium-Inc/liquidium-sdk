/**
 * Stable string codes for {@link P2pEvmError}. Use for branching in application code.
 */
export const P2pEvmErrorCode = {
  // SDK API
  UNAUTHORIZED: "UNAUTHORIZED",
  RATE_LIMITED: "RATE_LIMITED",
  NOT_FOUND: "NOT_FOUND",
  REQUEST_REJECTED: "REQUEST_REJECTED",

  // Verification: something supplied by Liquidium or a counterparty did not check out.
  OFFER_HASH_MISMATCH: "OFFER_HASH_MISMATCH",
  PARTNER_MISMATCH: "PARTNER_MISMATCH",
  INVALID_VALUATION: "INVALID_VALUATION",
  INVALID_ATTRIBUTION: "INVALID_ATTRIBUTION",
  CHAIN_MISMATCH: "CHAIN_MISMATCH",
  FEE_SPLITTER_NOT_CONFIGURED: "FEE_SPLITTER_NOT_CONFIGURED",

  // Transport
  NETWORK_ERROR: "NETWORK_ERROR",
  SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
  REQUEST_TIMEOUT: "REQUEST_TIMEOUT",

  // Catch-all
  INTERNAL: "INTERNAL",
  VALIDATION_ERROR: "VALIDATION_ERROR",
} as const;

export type P2pEvmErrorCode =
  (typeof P2pEvmErrorCode)[keyof typeof P2pEvmErrorCode];

/** Optional debug identifiers attached to mapped SDK errors. */
export interface P2pEvmErrorContext {
  /** SDK API request id for support/debugging when available. */
  requestId?: string;
}

/**
 * Typed error from the SDK.
 *
 * Prefer checking `code` over parsing `message`.
 */
export class P2pEvmError extends Error {
  /** Machine-readable reason; compare to {@link P2pEvmErrorCode} values. */
  readonly code: P2pEvmErrorCode;
  /** Original error when the SDK wraps an underlying failure. */
  override readonly cause?: unknown;
  /** SDK API request id for support/debugging when available. */
  readonly requestId?: string;

  /**
   * @param code - Error code from {@link P2pEvmErrorCode}.
   * @param message - Human-readable detail (defaults to `code` when omitted).
   * @param cause - Optional underlying error.
   * @param context - Optional backend debug identifiers.
   */
  constructor(
    code: P2pEvmErrorCode,
    message?: string,
    cause?: unknown,
    context?: P2pEvmErrorContext
  ) {
    super(message ?? code);
    this.name = "P2pEvmError";
    this.code = code;
    this.cause = cause;
    this.requestId = context?.requestId;
  }
}
