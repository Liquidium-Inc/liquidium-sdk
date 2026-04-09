import { LiquidiumError, LiquidiumErrorCode } from "../errors";

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
