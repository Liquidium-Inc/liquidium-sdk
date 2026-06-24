import { afterEach, describe, expect, test, vi } from "vitest";
import {
  executeWith,
  LiquidiumErrorCode,
  RATE_DECIMALS,
  RATE_SCALE,
} from "./index";

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("executeWith", () => {
  test("exports fixed-point rate scale metadata", () => {
    // given
    const expectedRateDecimals = 27n;
    const expectedRateScale = 10n ** expectedRateDecimals;

    // when

    // then
    expect(RATE_DECIMALS).toBe(expectedRateDecimals);
    expect(RATE_SCALE).toBe(expectedRateScale);
  });

  test("should throw a validation error for unsupported execution kinds", async () => {
    // given
    const action = { executionKind: "unsupported" } as never;
    const execute = executeWith({ walletAdapter: {} });

    // when
    const result = execute(action);

    // then
    await expect(result).rejects.toMatchObject({
      code: LiquidiumErrorCode.VALIDATION_ERROR,
    });
  });
});
