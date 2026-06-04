import { LiquidiumError, LiquidiumErrorCode } from "../../errors";
import type { ProtocolError, SignatureVerificationError } from "./actor";

type VariantKey<T> = keyof UnionToIntersection<T> & string;

type UnionToIntersection<T> = (
  T extends unknown
    ? (value: T) => void
    : never
) extends (value: infer Intersection) => void
  ? Intersection
  : never;

interface ErrorMapping {
  code: LiquidiumErrorCode;
  fallbackMessage?: string;
}

const LENDING_CANISTER_PROTOCOL_RESULT_ERROR_MAP = {
  InvalidTargetPrincipal: { code: LiquidiumErrorCode.INVALID_TARGET_PRINCIPAL },
  InsufficientCollateral: { code: LiquidiumErrorCode.INSUFFICIENT_COLLATERAL },
  SignatureExpiryTooFarInFuture: {
    code: LiquidiumErrorCode.SIGNATURE_EXPIRY_TOO_FAR_IN_FUTURE,
  },
  MaxLtvExceeded: { code: LiquidiumErrorCode.MAX_LTV_EXCEEDED },
  SignatureExpired: { code: LiquidiumErrorCode.SIGNATURE_EXPIRED },
  AccountAlreadyLinked: { code: LiquidiumErrorCode.ACCOUNT_ALREADY_LINKED },
  AccountNotFound: { code: LiquidiumErrorCode.ACCOUNT_NOT_FOUND },
  CannotRemoveSoleAccount: {
    code: LiquidiumErrorCode.CANNOT_REMOVE_SOLE_ACCOUNT,
  },
  ProfileNotFound: { code: LiquidiumErrorCode.PROFILE_NOT_FOUND },
  ProfileAlreadyExists: { code: LiquidiumErrorCode.PROFILE_ALREADY_EXISTS },
  SignatureError: { code: LiquidiumErrorCode.SIGNATURE_ERROR },
  PoolNotFound: {
    code: LiquidiumErrorCode.POOL_NOT_FOUND,
    fallbackMessage: "Pool not found",
  },
  PoolFrozen: { code: LiquidiumErrorCode.POOL_FROZEN },
  PositionNotFound: { code: LiquidiumErrorCode.POSITION_NOT_FOUND },
  BorrowCapExceeded: { code: LiquidiumErrorCode.BORROW_CAP_EXCEEDED },
  SupplyCapExceeded: { code: LiquidiumErrorCode.SUPPLY_CAP_EXCEEDED },
  InsufficientFunds: { code: LiquidiumErrorCode.INSUFFICIENT_FUNDS },
  HealthFactorTooLow: { code: LiquidiumErrorCode.HEALTH_FACTOR_TOO_LOW },
  TransferFailed: {
    code: LiquidiumErrorCode.TRANSFER_FAILED,
    fallbackMessage: "Transfer failed",
  },
  LiquidationNotFound: {
    code: LiquidiumErrorCode.LIQUIDATION_NOT_FOUND,
    fallbackMessage: "Liquidation not found",
  },
  BorrowingDisabled: { code: LiquidiumErrorCode.BORROWING_DISABLED },
  NoLiquidity: { code: LiquidiumErrorCode.NO_LIQUIDITY },
  NotAllowed: {
    code: LiquidiumErrorCode.NOT_ALLOWED,
    fallbackMessage: "Operation not allowed",
  },
  InvalidAddress: {
    code: LiquidiumErrorCode.INVALID_ADDRESS,
    fallbackMessage: "Invalid address",
  },
  Internal: {
    code: LiquidiumErrorCode.INTERNAL,
    fallbackMessage: "Internal protocol error",
  },
  FeeClaimReceiverNotConfigured: {
    code: LiquidiumErrorCode.INTERNAL,
    fallbackMessage: "Fee claim receiver is not configured",
  },
} as const satisfies Record<VariantKey<ProtocolError>, ErrorMapping>;

const LENDING_CANISTER_SIGNATURE_VERIFICATION_ERROR_MAP = {
  InvalidEthSignature: { code: LiquidiumErrorCode.INVALID_ETH_SIGNATURE },
  InvalidBtcSignature: { code: LiquidiumErrorCode.INVALID_BTC_SIGNATURE },
  InvalidEthAddress: { code: LiquidiumErrorCode.INVALID_ETH_ADDRESS },
  UnsupportedChain: { code: LiquidiumErrorCode.UNSUPPORTED_CHAIN },
  ProfileNotFound: { code: LiquidiumErrorCode.PROFILE_NOT_FOUND },
  CouldNotDecode: {
    code: LiquidiumErrorCode.SIGNATURE_ERROR,
    fallbackMessage: "Could not decode signature",
  },
  InvalidSolSignature: {
    code: LiquidiumErrorCode.SIGNATURE_ERROR,
    fallbackMessage: "Invalid SOL signature",
  },
} as const satisfies Record<
  VariantKey<SignatureVerificationError>,
  ErrorMapping
>;

/** Maps lending canister `Result.Err(ProtocolError)` responses. */
export function mapLendingProtocolErrorToLiquidiumError(
  error: ProtocolError
): LiquidiumError {
  const [key, payload] = getVariantEntry(error);

  if (key === "SignatureError") {
    return mapLendingSignatureVerificationErrorToLiquidiumError(
      payload as SignatureVerificationError
    );
  }

  return mapVariantToLiquidiumError(
    LENDING_CANISTER_PROTOCOL_RESULT_ERROR_MAP[key],
    payload
  );
}

/** Maps nested `ProtocolError.SignatureError` verification failures. */
export function mapLendingSignatureVerificationErrorToLiquidiumError(
  error: SignatureVerificationError
): LiquidiumError {
  const [key, payload] = getVariantEntry(error);

  return mapVariantToLiquidiumError(
    LENDING_CANISTER_SIGNATURE_VERIFICATION_ERROR_MAP[key],
    payload
  );
}

/** Maps thrown/rejected canister calls, not typed protocol `Err` responses. */
export function mapCanisterCallErrorToLiquidiumError(
  methodName: string,
  cause: unknown
): LiquidiumError {
  return new LiquidiumError(
    LiquidiumErrorCode.CANISTER_REJECTED,
    `Canister call failed: ${methodName}`,
    cause
  );
}

function getVariantEntry<T extends Record<string, unknown>>(
  variant: T
): [VariantKey<T>, unknown] {
  const [entry] = Object.entries(variant) as [
    [VariantKey<T>, unknown],
    ...Array<[VariantKey<T>, unknown]>,
  ];

  return entry;
}

function mapVariantToLiquidiumError(
  mapping: ErrorMapping,
  payload: unknown
): LiquidiumError {
  const message =
    typeof payload === "string"
      ? payload
      : (mapping.fallbackMessage ?? humanizeErrorCode(mapping.code));

  return new LiquidiumError(mapping.code, message);
}

function humanizeErrorCode(code: LiquidiumErrorCode): string {
  return code
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/^\w/, (firstLetter) => firstLetter.toUpperCase());
}
