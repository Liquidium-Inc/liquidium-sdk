/** Fixed-point scale used by protocol rate values. */
export const RATE_SCALE = 1_000_000_000_000_000_000_000_000_000n;
/** Number of decimal places represented by {@link RATE_SCALE}. */
export const RATE_DECIMALS = BigInt(RATE_SCALE.toString().length - 1);
/** Number of seconds in the protocol's 365-day interest year. */
export const INTEREST_YEAR_365_DAYS_SECONDS = 31_536_000n;
/** Scheduled interval used for estimated supply APY compounding. */
export const SUPPLY_COMPOUNDING_INTERVAL_15_SECONDS = 15n;

/**
 * Estimates borrow APY from a current RAY-scaled APR.
 *
 * The estimate mirrors the protocol's per-second borrow compounding and assumes
 * the current APR remains unchanged for a 365-day year.
 */
export function estimateBorrowApy(borrowApr: bigint): bigint {
  return estimateCompoundedApy(borrowApr, 1n);
}

/**
 * Estimates supply APY from a current RAY-scaled APR.
 *
 * The estimate uses the protocol's scheduled 15-second pool synchronization
 * interval and assumes the current APR remains unchanged for a 365-day year.
 * Additional protocol activity can synchronize a pool between timer ticks, so
 * this is not a realized-yield guarantee.
 */
export function estimateSupplyApy(supplyApr: bigint): bigint {
  return estimateCompoundedApy(
    supplyApr,
    SUPPLY_COMPOUNDING_INTERVAL_15_SECONDS
  );
}

function estimateCompoundedApy(
  apr: bigint,
  compoundingIntervalSeconds: bigint
): bigint {
  if (apr < 0n) {
    throw new RangeError("APR cannot be negative");
  }

  if (apr === 0n) {
    return 0n;
  }

  const periodsPerYear =
    INTEREST_YEAR_365_DAYS_SECONDS / compoundingIntervalSeconds;
  const ratePerPeriod =
    (apr * compoundingIntervalSeconds) / INTEREST_YEAR_365_DAYS_SECONDS;
  const annualGrowth = fixedPointPow(
    RATE_SCALE + ratePerPeriod,
    periodsPerYear
  );

  return annualGrowth - RATE_SCALE;
}

function fixedPointPow(base: bigint, exponent: bigint): bigint {
  let remainingExponent = exponent;
  let currentBase = base;
  let result = RATE_SCALE;

  while (remainingExponent > 0n) {
    if (remainingExponent % 2n === 1n) {
      result = fixedPointMultiply(result, currentBase);
    }

    currentBase = fixedPointMultiply(currentBase, currentBase);
    remainingExponent /= 2n;
  }

  return result;
}

function fixedPointMultiply(left: bigint, right: bigint): bigint {
  return (left * right + RATE_SCALE / 2n) / RATE_SCALE;
}
