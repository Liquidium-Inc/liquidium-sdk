import { describe, expect, test } from "vitest";
import { LiquidiumError, LiquidiumErrorCode } from "../errors";
import { parseBigInt, parseOptionalBigInt } from "./bigint";

describe("parseBigInt", () => {
  test("should parse a valid bigint string", () => {
    // given
    const inputValue = "123456789";

    // when
    const parsedValue = parseBigInt(inputValue, "test bigint");

    // then
    const EXPECTED_VALUE = 123456789n;
    expect(parsedValue).toBe(EXPECTED_VALUE);
  });

  test("should throw INTERNAL error for invalid bigint string", () => {
    // given
    const invalidValue = "not-a-bigint";
    const parseInvalidBigInt = () => parseBigInt(invalidValue, "test bigint");

    // when / then
    expect(parseInvalidBigInt).toThrow(LiquidiumError);
    expect(parseInvalidBigInt).toThrow(
      "Invalid bigint returned for test bigint"
    );

    try {
      parseInvalidBigInt();
      throw new Error("Expected parseBigInt to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(LiquidiumError);
      expect((error as LiquidiumError).code).toBe(LiquidiumErrorCode.INTERNAL);
    }
  });
});

describe("parseOptionalBigInt", () => {
  test("should return undefined when value is undefined", () => {
    // given
    const optionalValue = undefined;

    // when
    const parsedValue = parseOptionalBigInt(optionalValue, "optional bigint");

    // then
    expect(parsedValue).toBeUndefined();
  });

  test("should parse a valid optional bigint string", () => {
    // given
    const optionalValue = "42";

    // when
    const parsedValue = parseOptionalBigInt(optionalValue, "optional bigint");

    // then
    const EXPECTED_VALUE = 42n;
    expect(parsedValue).toBe(EXPECTED_VALUE);
  });
});
