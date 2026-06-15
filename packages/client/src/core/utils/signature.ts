import { LiquidiumError, LiquidiumErrorCode } from "../errors";
import { Chain, type Chain as ChainName } from "../types";

const HEX_SIGNATURE_PATTERN = /^[0-9a-fA-F]+$/;

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
  if (!signature.startsWith("0x")) {
    return signature;
  }

  const signatureWithoutPrefix = signature.slice(2);

  if (!HEX_SIGNATURE_PATTERN.test(signatureWithoutPrefix)) {
    return signature;
  }

  return signatureWithoutPrefix;
}

function normalizeBtcSignature(signature: string): string {
  const signatureWithoutPrefix = signature.startsWith("0x")
    ? signature.slice(2)
    : signature;

  if (isHexBytes(signatureWithoutPrefix)) {
    return signatureWithoutPrefix;
  }

  if (signature.startsWith("0x")) {
    throw invalidBtcSignatureFormatError();
  }

  return bytesToHex(decodeBase64Signature(signature));
}

function isHexBytes(signature: string): boolean {
  return (
    signature.length > 0 &&
    signature.length % 2 === 0 &&
    HEX_SIGNATURE_PATTERN.test(signature)
  );
}

function decodeBase64Signature(signature: string): Uint8Array {
  try {
    const paddedSignature = signature.padEnd(
      signature.length + ((4 - (signature.length % 4)) % 4),
      "="
    );
    const binarySignature = globalThis.atob(paddedSignature);
    const bytes = new Uint8Array(binarySignature.length);

    for (let index = 0; index < binarySignature.length; index += 1) {
      bytes[index] = binarySignature.charCodeAt(index);
    }

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

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
    ""
  );
}

function invalidBtcSignatureFormatError(cause?: unknown): LiquidiumError {
  return new LiquidiumError(
    LiquidiumErrorCode.SIGNATURE_ERROR,
    "BTC signature must be hex or base64-encoded bytes",
    cause
  );
}
