import { describe, expect, test } from "vitest";
import { LiquidiumErrorCode } from "../../errors";
import type { ProtocolError, SignatureVerificationError } from "./actor";
import {
  mapLendingProtocolErrorToLiquidiumError,
  mapLendingSignatureVerificationErrorToLiquidiumError,
} from "./error-mappers";

describe("mapLendingProtocolErrorToLiquidiumError", () => {
  test("should map a protocol error code without a payload", () => {
    // given
    const protocolError = {
      InsufficientCollateral: null,
    } satisfies ProtocolError;

    // when
    const error = mapLendingProtocolErrorToLiquidiumError(protocolError);

    // then
    const EXPECTED_MESSAGE = "Insufficient collateral";
    expect(error.code).toBe(LiquidiumErrorCode.INSUFFICIENT_COLLATERAL);
    expect(error.message).toBe(EXPECTED_MESSAGE);
  });

  test("should preserve a protocol error payload as the message", () => {
    // given
    const POOL_ID = "pool-principal";
    const protocolError = {
      PoolNotFound: POOL_ID,
    } satisfies ProtocolError;

    // when
    const error = mapLendingProtocolErrorToLiquidiumError(protocolError);

    // then
    expect(error.code).toBe(LiquidiumErrorCode.POOL_NOT_FOUND);
    expect(error.message).toBe(POOL_ID);
  });

  test("should map fee claim receiver configuration to internal error", () => {
    // given
    const protocolError = {
      FeeClaimReceiverNotConfigured: null,
    } satisfies ProtocolError;

    // when
    const error = mapLendingProtocolErrorToLiquidiumError(protocolError);

    // then
    const EXPECTED_MESSAGE = "Fee claim receiver is not configured";
    expect(error.code).toBe(LiquidiumErrorCode.INTERNAL);
    expect(error.message).toBe(EXPECTED_MESSAGE);
  });

  test("should map nested signature errors", () => {
    // given
    const protocolError = {
      SignatureError: {
        InvalidBtcSignature: null,
      },
    } satisfies ProtocolError;

    // when
    const error = mapLendingProtocolErrorToLiquidiumError(protocolError);

    // then
    expect(error.code).toBe(LiquidiumErrorCode.INVALID_BTC_SIGNATURE);
  });
});

describe("mapLendingSignatureVerificationErrorToLiquidiumError", () => {
  test("should map a signature error code without a payload", () => {
    // given
    const signatureError = {
      InvalidEthSignature: null,
    } satisfies SignatureVerificationError;

    // when
    const error =
      mapLendingSignatureVerificationErrorToLiquidiumError(signatureError);

    // then
    const EXPECTED_MESSAGE = "Invalid eth signature";
    expect(error.code).toBe(LiquidiumErrorCode.INVALID_ETH_SIGNATURE);
    expect(error.message).toBe(EXPECTED_MESSAGE);
  });

  test("should map unsupported SDK signature errors to signature error", () => {
    // given
    const signatureError = {
      InvalidSolSignature: null,
    } satisfies SignatureVerificationError;

    // when
    const error =
      mapLendingSignatureVerificationErrorToLiquidiumError(signatureError);

    // then
    const EXPECTED_MESSAGE = "Invalid SOL signature";
    expect(error.code).toBe(LiquidiumErrorCode.SIGNATURE_ERROR);
    expect(error.message).toBe(EXPECTED_MESSAGE);
  });
});
