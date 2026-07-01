import { describe, expect, test } from "vitest";
import { intFromPublicId, publicIdFromInt } from "../ref-code";

describe("instant loan reference codes", () => {
  test("should encode known loan ids to fixed public references", () => {
    // given
    const FIRST_LOAN_ID = 0n;
    const NEXT_LOAN_ID = 1n;
    const LIVE_REGRESSION_LOAN_ID = 1_000_000_000n;

    // when
    const firstReference = publicIdFromInt(FIRST_LOAN_ID);
    const nextReference = publicIdFromInt(NEXT_LOAN_ID);
    const liveRegressionReference = publicIdFromInt(LIVE_REGRESSION_LOAN_ID);

    // then
    const EXPECTED_FIRST_REFERENCE = "3NQK8N";
    const EXPECTED_NEXT_REFERENCE = "4J46W2";
    const EXPECTED_LIVE_REGRESSION_REFERENCE = "6WZKRN";

    expect(firstReference).toBe(EXPECTED_FIRST_REFERENCE);
    expect(nextReference).toBe(EXPECTED_NEXT_REFERENCE);
    expect(liveRegressionReference).toBe(EXPECTED_LIVE_REGRESSION_REFERENCE);
  });

  test("should round trip boundary loan ids", () => {
    // given
    const PUBLIC_REFERENCE_SPACE_SIZE = 32n ** 6n;
    const boundaryLoanIds = [0n, 1n, 42n, PUBLIC_REFERENCE_SPACE_SIZE - 1n];

    // when
    const decodedLoanIds = boundaryLoanIds.map((loanId) =>
      intFromPublicId(publicIdFromInt(loanId))
    );

    // then
    expect(decodedLoanIds).toEqual(boundaryLoanIds);
  });

  test("should decode lowercase public references", () => {
    // given
    const LOAN_ID = 42n;
    const lowercaseReference = publicIdFromInt(LOAN_ID).toLowerCase();

    // when
    const decodedLoanId = intFromPublicId(lowercaseReference);

    // then
    expect(decodedLoanId).toBe(LOAN_ID);
  });

  test("should reject loan ids outside the public reference range", () => {
    // given
    const PUBLIC_REFERENCE_SPACE_SIZE = 32n ** 6n;
    const negativeLoanId = -1n;
    const outOfRangeLoanId = PUBLIC_REFERENCE_SPACE_SIZE;

    // when
    const encodeNegativeLoanId = () => publicIdFromInt(negativeLoanId);
    const encodeOutOfRangeLoanId = () => publicIdFromInt(outOfRangeLoanId);

    // then
    expect(encodeNegativeLoanId).toThrow("id out of range");
    expect(encodeOutOfRangeLoanId).toThrow("id out of range");
  });

  test("should reject malformed public references", () => {
    // given
    const shortReference = "ABC";
    const referenceWithInvalidCharacter = "ABC1O0";

    // when
    const decodeShortReference = () => intFromPublicId(shortReference);
    const decodeInvalidCharacterReference = () =>
      intFromPublicId(referenceWithInvalidCharacter);

    // then
    expect(decodeShortReference).toThrow("ref must be 6 characters");
    expect(decodeInvalidCharacterReference).toThrow(
      "ref contains invalid character"
    );
  });
});
