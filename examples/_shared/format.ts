import { z } from "zod";

const DISPLAY_JSON_INDENT = 2;
const BIGINT_SCHEMA = z.bigint();
const ERROR_OBJECT_SCHEMA = z.looseObject({});
const STORED_VALUES_SCHEMA = z.array(z.unknown());
const STORED_STRING_SCHEMA = z.string();
const ERROR_FIELD_EXCLUDE_LIST = new Set(["name", "message", "stack", "cause"]);

export function stringifyForDisplay<Value>(value: Value): string {
  return JSON.stringify(
    value,
    (_key, nestedValue) => {
      const bigintValue = BIGINT_SCHEMA.safeParse(nestedValue);

      return bigintValue.success ? bigintValue.data.toString() : nestedValue;
    },
    DISPLAY_JSON_INDENT
  );
}

export function parseStoredStrings(storedValue: string): string[] {
  try {
    const parsedValues = STORED_VALUES_SCHEMA.safeParse(
      JSON.parse(storedValue)
    );

    if (!parsedValues.success) {
      return [];
    }

    return parsedValues.data.flatMap((value) => {
      const parsedString = STORED_STRING_SCHEMA.safeParse(value);

      return parsedString.success ? [parsedString.data] : [];
    });
  } catch {
    return [];
  }
}

export function formatError(cause: unknown): string {
  return formatErrorWithDetails(cause, new WeakSet<object>());
}

function formatErrorWithDetails(
  cause: unknown,
  seenErrors: WeakSet<object>
): string {
  if (!(cause instanceof Error)) {
    if (Array.isArray(cause) || ERROR_OBJECT_SCHEMA.safeParse(cause).success) {
      return stringifyForDisplay(cause);
    }

    return String(cause);
  }

  if (seenErrors.has(cause)) {
    return "[Circular error]";
  }

  seenErrors.add(cause);

  const code = "code" in cause ? String(cause.code) : null;
  const details = getErrorDetails(cause);
  const nestedCause = cause.cause;
  const parts = [code ? `${code}: ${cause.message}` : cause.message];

  if (details) {
    parts.push(`Details: ${details}`);
  }

  if (nestedCause !== undefined) {
    parts.push(`Cause: ${formatErrorWithDetails(nestedCause, seenErrors)}`);
  }

  return parts.join("\n");
}

function getErrorDetails(error: Error): string | undefined {
  const entries = Object.entries(error).filter(
    ([key, value]) => !ERROR_FIELD_EXCLUDE_LIST.has(key) && value !== undefined
  );

  if (entries.length === 0) {
    return undefined;
  }

  return stringifyForDisplay(Object.fromEntries(entries));
}
