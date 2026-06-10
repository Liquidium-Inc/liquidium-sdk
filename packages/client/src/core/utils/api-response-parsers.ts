import { LiquidiumError, LiquidiumErrorCode } from "../errors";

const MILLISECONDS_PER_SECOND = 1_000;

export interface ApiResponseFieldContext {
  context: string;
  label: string;
}

export function parseNonEmptyApiString(
  value: string | undefined,
  field: ApiResponseFieldContext
): string {
  if (!value) {
    throwInvalidApiResponseField(field);
  }

  return value;
}

export function parseUnsignedApiBigint(
  value: string | undefined,
  field: ApiResponseFieldContext
): bigint {
  if (!value || !/^\d+$/.test(value)) {
    throwInvalidApiResponseField(field);
  }

  return BigInt(value);
}

export function parseIsoApiTimestampToUnixSeconds(
  value: string | undefined,
  field: ApiResponseFieldContext
): bigint {
  const timestamp = parseNonEmptyApiString(value, field);
  const timestampMilliseconds = Date.parse(timestamp);

  if (!Number.isFinite(timestampMilliseconds)) {
    throwInvalidApiResponseField(field);
  }

  return BigInt(Math.floor(timestampMilliseconds / MILLISECONDS_PER_SECOND));
}

export function parseApiStringUnion<const TValue extends string>(
  value: string | undefined,
  allowedValues: readonly TValue[],
  field: ApiResponseFieldContext
): TValue {
  if (value !== undefined && allowedValues.includes(value as TValue)) {
    return value as TValue;
  }

  throwInvalidApiResponseField(field);
}

function throwInvalidApiResponseField(field: ApiResponseFieldContext): never {
  throw new LiquidiumError(
    LiquidiumErrorCode.VALIDATION_ERROR,
    `Invalid ${field.context} ${field.label}`
  );
}
