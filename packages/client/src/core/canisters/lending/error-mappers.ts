import { LiquidiumError, LiquidiumErrorCode } from "../../errors";
import type { ProtocolError, SignatureVerificationError } from "./actor";

export function mapLendingProtocolErrorToLiquidiumError(
  error: ProtocolError
): LiquidiumError {
  const [key, payload] = getVariantEntry(error);

  switch (key) {
    case "InvalidTargetPrincipal":
      return new LiquidiumError(LiquidiumErrorCode.INVALID_TARGET_PRINCIPAL);
    case "InsufficientCollateral":
      return new LiquidiumError(LiquidiumErrorCode.INSUFFICIENT_COLLATERAL);
    case "SignatureExpiryTooFarInFuture":
      return new LiquidiumError(
        LiquidiumErrorCode.SIGNATURE_EXPIRY_TOO_FAR_IN_FUTURE
      );
    case "MaxLtvExceeded":
      return new LiquidiumError(LiquidiumErrorCode.MAX_LTV_EXCEEDED);
    case "SignatureExpired":
      return new LiquidiumError(LiquidiumErrorCode.SIGNATURE_EXPIRED);
    case "AccountAlreadyLinked":
      return new LiquidiumError(LiquidiumErrorCode.ACCOUNT_ALREADY_LINKED);
    case "AccountNotFound":
      return new LiquidiumError(LiquidiumErrorCode.ACCOUNT_NOT_FOUND);
    case "CannotRemoveSoleAccount":
      return new LiquidiumError(LiquidiumErrorCode.CANNOT_REMOVE_SOLE_ACCOUNT);
    case "ProfileNotFound":
      return new LiquidiumError(LiquidiumErrorCode.PROFILE_NOT_FOUND);
    case "ProfileAlreadyExists":
      return new LiquidiumError(LiquidiumErrorCode.PROFILE_ALREADY_EXISTS);
    case "SignatureError":
      return mapLendingSignatureVerificationErrorToLiquidiumError(
        payload as SignatureVerificationError
      );
    case "PoolNotFound":
      return new LiquidiumError(
        LiquidiumErrorCode.POOL_NOT_FOUND,
        getTextMessage(payload, "Pool not found")
      );
    case "PoolFrozen":
      return new LiquidiumError(LiquidiumErrorCode.POOL_FROZEN);
    case "PositionNotFound":
      return new LiquidiumError(LiquidiumErrorCode.POSITION_NOT_FOUND);
    case "BorrowCapExceeded":
      return new LiquidiumError(LiquidiumErrorCode.BORROW_CAP_EXCEEDED);
    case "SupplyCapExceeded":
      return new LiquidiumError(LiquidiumErrorCode.SUPPLY_CAP_EXCEEDED);
    case "InsufficientFunds":
      return new LiquidiumError(LiquidiumErrorCode.INSUFFICIENT_FUNDS);
    case "HealthFactorTooLow":
      return new LiquidiumError(LiquidiumErrorCode.HEALTH_FACTOR_TOO_LOW);
    case "TransferFailed":
      return new LiquidiumError(
        LiquidiumErrorCode.TRANSFER_FAILED,
        getTextMessage(payload, "Transfer failed")
      );
    case "LiquidationNotFound":
      return new LiquidiumError(
        LiquidiumErrorCode.LIQUIDATION_NOT_FOUND,
        getTextMessage(payload, "Liquidation not found")
      );
    case "BorrowingDisabled":
      return new LiquidiumError(LiquidiumErrorCode.BORROWING_DISABLED);
    case "NoLiquidity":
      return new LiquidiumError(LiquidiumErrorCode.NO_LIQUIDITY);
    case "NotAllowed":
      return new LiquidiumError(
        LiquidiumErrorCode.NOT_ALLOWED,
        getTextMessage(payload, "Operation not allowed")
      );
    case "InvalidAddress":
      return new LiquidiumError(
        LiquidiumErrorCode.INVALID_ADDRESS,
        getTextMessage(payload, "Invalid address")
      );
    case "Internal":
      return new LiquidiumError(
        LiquidiumErrorCode.INTERNAL,
        getTextMessage(payload, "Internal protocol error")
      );
    case "FeeClaimReceiverNotConfigured":
      return new LiquidiumError(
        LiquidiumErrorCode.INTERNAL,
        "Fee claim receiver is not configured"
      );
  }

  return new LiquidiumError(
    LiquidiumErrorCode.INTERNAL,
    "Unknown protocol error"
  );
}

export function mapLendingSignatureVerificationErrorToLiquidiumError(
  error: SignatureVerificationError
): LiquidiumError {
  const [key, payload] = getVariantEntry(error);

  switch (key) {
    case "InvalidEthSignature":
      return new LiquidiumError(LiquidiumErrorCode.INVALID_ETH_SIGNATURE);
    case "InvalidBtcSignature":
      return new LiquidiumError(LiquidiumErrorCode.INVALID_BTC_SIGNATURE);
    case "InvalidEthAddress":
      return new LiquidiumError(LiquidiumErrorCode.INVALID_ETH_ADDRESS);
    case "UnsupportedChain":
      return new LiquidiumError(LiquidiumErrorCode.UNSUPPORTED_CHAIN);
    case "ProfileNotFound":
      return new LiquidiumError(LiquidiumErrorCode.PROFILE_NOT_FOUND);
    case "CouldNotDecode":
      return new LiquidiumError(
        LiquidiumErrorCode.SIGNATURE_ERROR,
        getTextMessage(payload, "Could not decode signature")
      );
  }

  return new LiquidiumError(
    LiquidiumErrorCode.SIGNATURE_ERROR,
    "Unknown signature verification error"
  );
}

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
): [keyof T & string, unknown] {
  const [entry] = Object.entries(variant) as [
    [keyof T & string, unknown],
    ...Array<[keyof T & string, unknown]>,
  ];

  return entry;
}

function getTextMessage(payload: unknown, fallback: string): string {
  return typeof payload === "string" ? payload : fallback;
}
