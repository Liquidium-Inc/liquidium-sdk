import { z } from "zod";

const JSON_INDENT_SPACES = 2;
const BIGINT_SCHEMA = z.bigint();
const FUNCTION_SCHEMA = z.function();

export const UNDEFINED_JSON_VALUE = "[undefined]";

export function stringifyExampleValue<Value>(value: Value): string {
  return JSON.stringify(
    value,
    (key, value) => {
      const bigint = BIGINT_SCHEMA.safeParse(value);

      if (bigint.success) {
        return bigint.data.toString();
      }

      if (FUNCTION_SCHEMA.safeParse(value).success) {
        return `[Function ${key || "anonymous"}]`;
      }

      if (value === undefined) {
        return UNDEFINED_JSON_VALUE;
      }

      if (value instanceof Error) {
        return {
          name: value.name,
          message: value.message,
          stack: value.stack,
        };
      }

      return value;
    },
    JSON_INDENT_SPACES
  );
}
