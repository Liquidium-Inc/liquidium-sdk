import { LiquidiumError, LiquidiumErrorCode } from "../errors";

export function ceilDivBigint(numerator: bigint, denominator: bigint): bigint {
  if (denominator === 0n) {
    throw new LiquidiumError(
      LiquidiumErrorCode.INTERNAL,
      "ceilDivBigint called with zero denominator"
    );
  }

  if (numerator === 0n) {
    return 0n;
  }

  const numeratorIsNegative = numerator < 0n;
  const denominatorIsNegative = denominator < 0n;
  const resultIsNegative = numeratorIsNegative !== denominatorIsNegative;

  const absNumerator = numeratorIsNegative ? -numerator : numerator;
  const absDenominator = denominatorIsNegative ? -denominator : denominator;

  if (resultIsNegative) {
    return -(absNumerator / absDenominator);
  }

  return (absNumerator + absDenominator - 1n) / absDenominator;
}

export function parseBigInt(value: string, label: string): bigint {
  try {
    return BigInt(value);
  } catch (error) {
    throw new LiquidiumError(
      LiquidiumErrorCode.INTERNAL,
      `Invalid bigint returned for ${label}`,
      error
    );
  }
}

export function parseOptionalBigInt(
  value: string | undefined,
  label: string
): bigint | undefined {
  if (value === undefined) {
    return undefined;
  }

  return parseBigInt(value, label);
}
