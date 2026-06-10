import { expect, test } from "vitest";
import { LiquidiumError, LiquidiumErrorCode } from "../errors";
import {
  parseApiStringUnion,
  parseIsoApiTimestampToUnixSeconds,
  parseNonEmptyApiString,
  parseUnsignedApiBigint,
} from "./api-response-parsers";

test("should parse non-empty string API response fields", () => {
  // given
  const inputValue = "abc123";

  // when
  const result = parseNonEmptyApiString(inputValue, {
    context: "test response",
    label: "identifier",
  });

  // then
  expect(result).toBe(inputValue);
});

test("should reject missing string API response fields", () => {
  // given
  const inputValue = undefined;

  // when
  const parseMissingValue = () =>
    parseNonEmptyApiString(inputValue, {
      context: "test response",
      label: "identifier",
    });

  // then
  expect(parseMissingValue).toThrow("Invalid test response identifier");

  try {
    parseMissingValue();
  } catch (error) {
    expect(error).toBeInstanceOf(LiquidiumError);
    expect((error as LiquidiumError).code).toBe(
      LiquidiumErrorCode.VALIDATION_ERROR
    );
  }
});

test("should parse unsigned bigint API response fields", () => {
  // given
  const inputValue = "123456";

  // when
  const result = parseUnsignedApiBigint(inputValue, {
    context: "test response",
    label: "amount",
  });

  // then
  const EXPECTED_VALUE = 123456n;
  expect(result).toBe(EXPECTED_VALUE);
});

test("should reject non-digit bigint API response fields", () => {
  // given
  const inputValue = "12.34";

  // when
  const parseInvalidValue = () =>
    parseUnsignedApiBigint(inputValue, {
      context: "test response",
      label: "amount",
    });

  // then
  expect(parseInvalidValue).toThrow("Invalid test response amount");

  try {
    parseInvalidValue();
  } catch (error) {
    expect(error).toBeInstanceOf(LiquidiumError);
    expect((error as LiquidiumError).code).toBe(
      LiquidiumErrorCode.VALIDATION_ERROR
    );
  }
});

test("should parse ISO timestamp API response fields as Unix seconds", () => {
  // given
  const inputValue = "2026-05-21T08:26:04.419Z";

  // when
  const result = parseIsoApiTimestampToUnixSeconds(inputValue, {
    context: "test response",
    label: "creation timestamp",
  });

  // then
  const EXPECTED_TIMESTAMP_SECONDS = 1_779_351_964n;
  expect(result).toBe(EXPECTED_TIMESTAMP_SECONDS);
});

test("should reject invalid ISO timestamp API response fields", () => {
  // given
  const inputValue = "not a timestamp";

  // when
  const parseInvalidValue = () =>
    parseIsoApiTimestampToUnixSeconds(inputValue, {
      context: "test response",
      label: "creation timestamp",
    });

  // then
  expect(parseInvalidValue).toThrow("Invalid test response creation timestamp");

  try {
    parseInvalidValue();
  } catch (error) {
    expect(error).toBeInstanceOf(LiquidiumError);
    expect((error as LiquidiumError).code).toBe(
      LiquidiumErrorCode.VALIDATION_ERROR
    );
  }
});

test("should parse allowed string union API response fields", () => {
  // given
  const allowedValues = ["BTC", "USDC"] as const;
  const inputValue = "BTC";

  // when
  const result = parseApiStringUnion(inputValue, allowedValues, {
    context: "test response",
    label: "asset",
  });

  // then
  expect(result).toBe(inputValue);
});

test("should reject unsupported string union API response fields", () => {
  // given
  const allowedValues = ["BTC", "USDC"] as const;
  const inputValue = "ETH";

  // when
  const parseUnsupportedValue = () =>
    parseApiStringUnion(inputValue, allowedValues, {
      context: "test response",
      label: "asset",
    });

  // then
  expect(parseUnsupportedValue).toThrow("Invalid test response asset");

  try {
    parseUnsupportedValue();
  } catch (error) {
    expect(error).toBeInstanceOf(LiquidiumError);
    expect((error as LiquidiumError).code).toBe(
      LiquidiumErrorCode.VALIDATION_ERROR
    );
  }
});
