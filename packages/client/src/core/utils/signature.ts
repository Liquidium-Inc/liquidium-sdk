export function normalizeHexSignature(signature: string): string {
  if (!signature.startsWith("0x")) {
    return signature;
  }

  const signatureWithoutPrefix = signature.slice(2);

  if (!/^[0-9a-fA-F]+$/.test(signatureWithoutPrefix)) {
    return signature;
  }

  return signatureWithoutPrefix;
}
