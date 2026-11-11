import { expect, test } from "vite-plus/test";
import {
  formatError,
  parseStoredStrings,
  stringifyForDisplay,
} from "../../../_shared/format";
import { parseSelectedOption } from "../../../_shared/input";

test("keeps nested bigint amounts as strings in display JSON", () => {
  // given
  const amountBaseUnits = 100_000_000_000_000_001n;
  const value = { amounts: [amountBaseUnits], omitted: undefined };

  // when
  const formatted = stringifyForDisplay(value);

  // then
  const EXPECTED_JSON = JSON.stringify(
    { amounts: [amountBaseUnits.toString()] },
    null,
    2
  );

  expect(formatted).toBe(EXPECTED_JSON);
});

test("keeps only string entries from stored arrays without rejecting valid entries", () => {
  // given
  const storedValues = JSON.stringify([
    "loan-ref",
    null,
    1,
    {},
    "",
    "activity-id",
  ]);

  // when
  const values = parseStoredStrings(storedValues);

  // then
  expect(values).toEqual(["loan-ref", "", "activity-id"]);
});

test("returns no stored entries for malformed JSON and non-array values", () => {
  // given
  const invalidStoredValues = ["{", "null", "{}", '"loan-ref"'];

  // when
  const values = invalidStoredValues.map(parseStoredStrings);

  // then
  expect(values).toEqual(invalidStoredValues.map(() => []));
});

test("preserves error codes, details, causes, and circular-error detection", () => {
  // given
  const amountBaseUnits = 100_000n;

  const failure = Object.assign(new Error("Deposit failed"), {
    code: "DEPOSIT_ERROR",
    amount: amountBaseUnits,
  });

  failure.cause = failure;

  // when
  const formatted = formatError(failure);

  // then
  const EXPECTED_DETAILS = JSON.stringify(
    { code: failure.code, amount: amountBaseUnits.toString() },
    null,
    2
  );

  expect(formatted).toBe(
    `DEPOSIT_ERROR: Deposit failed\nDetails: ${EXPECTED_DETAILS}\nCause: [Circular error]`
  );
});

test("preserves JSON formatting for object and array error causes", () => {
  // given
  const causes = [
    { message: "Request failed" },
    ["Request failed"],
    new Date("2026-01-01T00:00:00Z"),
  ];

  // when
  const formatted = causes.map((cause) => formatError(cause));

  // then
  expect(formatted).toEqual(
    causes.map((cause) => JSON.stringify(cause, null, 2))
  );
});

test("accepts a rendered select option and rejects values outside its options", () => {
  // given
  const options = ["ETH", "ICP"] as const;
  const selectedValue = "ICP";
  const invalidValue = "BTC";

  // when
  const selectedOption = parseSelectedOption(selectedValue, options);

  // then
  expect(selectedOption).toBe(selectedValue);
  expect(() => parseSelectedOption(invalidValue, options)).toThrow(
    "Select an available option."
  );
});
