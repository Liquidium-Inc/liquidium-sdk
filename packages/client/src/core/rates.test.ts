import { describe, expect, test } from "vitest";
import { estimateBorrowApy, estimateSupplyApy, RATE_SCALE } from "./rates";

describe("rate APY estimates", () => {
  test("should return zero APY for a zero APR", () => {
    // given
    const ZERO_APR = 0n;

    // when
    const borrowApy = estimateBorrowApy(ZERO_APR);
    const supplyApy = estimateSupplyApy(ZERO_APR);

    // then
    const EXPECTED_ZERO_APY = 0n;
    expect(borrowApy).toBe(EXPECTED_ZERO_APY);
    expect(supplyApy).toBe(EXPECTED_ZERO_APY);
  });

  test("should compound positive APR estimates over a 365-day year", () => {
    // given
    const APR_PERCENT = 10n;
    const APR = (RATE_SCALE * APR_PERCENT) / 100n;

    // when
    const borrowApy = estimateBorrowApy(APR);
    const supplyApy = estimateSupplyApy(APR);

    // then
    expect(borrowApy).toBeGreaterThan(APR);
    expect(supplyApy).toBeGreaterThan(APR);
    expect(borrowApy).toBeGreaterThanOrEqual(supplyApy);
  });

  test("should reject a negative APR", () => {
    // given
    const NEGATIVE_APR = -1n;

    // when

    // then
    expect(() => estimateBorrowApy(NEGATIVE_APR)).toThrow(
      "APR cannot be negative"
    );
    expect(() => estimateSupplyApy(NEGATIVE_APR)).toThrow(
      "APR cannot be negative"
    );
  });
});
