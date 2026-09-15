const MILLISECONDS_PER_SECOND = 1_000;
const SIGNATURE_VALIDITY_5_MINUTES_IN_SECONDS = 5n * 60n;

export function getCurrentUnixTimestampSeconds(): bigint {
  return BigInt(Math.floor(Date.now() / MILLISECONDS_PER_SECOND));
}

export function computeExpiryTimestampFromNow(
  signatureValidityInSeconds: bigint = SIGNATURE_VALIDITY_5_MINUTES_IN_SECONDS
): bigint {
  return getCurrentUnixTimestampSeconds() + signatureValidityInSeconds;
}
