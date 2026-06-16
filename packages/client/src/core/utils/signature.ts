import { base64, base64nopad } from "@scure/base";
import { bytesToHex as encodeBytesToHex, isHex } from "viem";
import { LiquidiumError, LiquidiumErrorCode } from "../errors";
import { Chain, type Chain as ChainName } from "../types";

const HEX_PREFIX = "0x";
const HEX_BYTE_CHAR_LENGTH = 2;
const BASE64_PADDING = "=";

export function normalizeWalletSignature(
  signature: string,
  chain: ChainName
): string {
  switch (chain) {
    case Chain.BTC:
      return normalizeBtcSignature(signature);
    case Chain.ETH:
      return normalizeHexSignature(signature);
  }
}

export function normalizeHexSignature(signature: string): string {
  if (!isPrefixedHex(signature)) {
    return signature;
  }

  return signature.slice(HEX_PREFIX.length);
}

function normalizeBtcSignature(signature: string): string {
  const signatureWithoutPrefix = signature.startsWith(HEX_PREFIX)
    ? signature.slice(HEX_PREFIX.length)
    : signature;

  if (isHexBytes(signatureWithoutPrefix)) {
    return signatureWithoutPrefix;
  }

  if (signature.startsWith(HEX_PREFIX)) {
    throw invalidBtcSignatureFormatError();
  }

  return bytesToUnprefixedHex(decodeBase64Signature(signature));
}

function isHexBytes(signature: string): boolean {
  return (
    signature.length > 0 &&
    signature.length % HEX_BYTE_CHAR_LENGTH === 0 &&
    isHex(`${HEX_PREFIX}${signature}`)
  );
}

function decodeBase64Signature(signature: string): Uint8Array {
  try {
    const bytes = decodeBase64Bytes(signature);

    if (bytes.length === 0) {
      throw invalidBtcSignatureFormatError();
    }

    return bytes;
  } catch (error) {
    if (error instanceof LiquidiumError) {
      throw error;
    }

    throw invalidBtcSignatureFormatError(error);
  }
}

function bytesToUnprefixedHex(bytes: Uint8Array): string {
  return normalizeHexSignature(encodeBytesToHex(bytes));
}

function isPrefixedHex(signature: string): boolean {
  return signature.length > HEX_PREFIX.length && isHex(signature);
}

function decodeBase64Bytes(signature: string): Uint8Array {
  if (signature.includes(BASE64_PADDING)) {
    return base64.decode(signature);
  }

  return base64nopad.decode(signature);
}

function invalidBtcSignatureFormatError(cause?: unknown): LiquidiumError {
  return new LiquidiumError(
    LiquidiumErrorCode.SIGNATURE_ERROR,
    "BTC signature must be hex or base64-encoded bytes",
    cause
  );
}
