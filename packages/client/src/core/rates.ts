/** Fixed-point scale used by protocol rate values. */
export const RATE_SCALE = 1_000_000_000_000_000_000_000_000_000n;
/** Number of decimal places represented by {@link RATE_SCALE}. */
export const RATE_DECIMALS = BigInt(RATE_SCALE.toString().length - 1);
