import { describe, expect, test } from "vitest";
import { LiquidiumError, LiquidiumErrorCode } from "../errors";
import { ceilDivBigint, parseBigInt, parseOptionalBigInt } from "./bigint";

describe("ceilDivBigint", () => {
  test("returns exact quotient when evenly divisible", () => {
    // given
    const numerator = 100n;
    const denominator = 5n;

    // when
    const result = ceilDivBigint(numerator, denominator);

    // then
    const EXPECTED_RESULT = 20n;
    expect(result).toBe(EXPECTED_RESULT);
  });

  test("rounds up when remainder is non-zero", () => {
    // given
    const numerator = 10n;
    const denominator = 3n;

    // when
    const result = ceilDivBigint(numerator, denominator);

    // then
    const EXPECTED_RESULT = 4n;
    expect(result).toBe(EXPECTED_RESULT);
  });

  test("returns zero when numerator is zero", () => {
    // given
    const numerator = 0n;
    const denominator = 7n;

    // when
    const result = ceilDivBigint(numerator, denominator);

    // then
    expect(result).toBe(0n);
  });

  test("handles very large numerators without precision loss", () => {
    // given
    const numerator = 10n ** 30n + 1n;
    const denominator = 10n ** 15n;

    // when
    const result = ceilDivBigint(numerator, denominator);

    // then
    const EXPECTED_RESULT = 10n ** 15n + 1n;
    expect(result).toBe(EXPECTED_RESULT);
  });

  test("rounds negative results toward zero", () => {
    // given
    const numerator = -10n;
    const denominator = 3n;

    // when
    const result = ceilDivBigint(numerator, denominator);

    // then
    const EXPECTED_RESULT = -3n;
    expect(result).toBe(EXPECTED_RESULT);
  });

  test("throws when denominator is zero", () => {
    // given
    const numerator = 1n;
    const denominator = 0n;
    const callCeilDivWithZero = () => ceilDivBigint(numerator, denominator);

    // when

    // then
    expect(callCeilDivWithZero).toThrow(LiquidiumError);

    try {
      callCeilDivWithZero();
    } catch (error) {
      expect((error as LiquidiumError).code).toBe(LiquidiumErrorCode.INTERNAL);
    }
  });
});

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

    // when

    // then
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
