import { describe, expect, test } from "vitest";
import {
  getBorrowAmountMinimumValidationError,
  getMinimumBorrowAmount,
  MIN_BORROW_AMOUNTS_BY_ASSET,
} from "./borrow-minimums";

describe("borrow minimums", () => {
  test("should expose configured borrow amount minimums", () => {
    // given
    const usdcAsset = "USDC";
    const ethAsset = "ETH";

    // when
    const usdcMinimumAmount = getMinimumBorrowAmount(usdcAsset);
    const ethMinimumAmount = getMinimumBorrowAmount(ethAsset);

    // then
    const EXPECTED_BTC_MINIMUM_AMOUNT = 5_100n;
    const EXPECTED_ETH_MINIMUM_AMOUNT = 5_000_000_000_000_000n;
    const EXPECTED_STABLECOIN_MINIMUM_AMOUNT = 1_000_000n;
    expect(MIN_BORROW_AMOUNTS_BY_ASSET).toMatchObject({
      BTC: EXPECTED_BTC_MINIMUM_AMOUNT,
      ETH: EXPECTED_ETH_MINIMUM_AMOUNT,
      USDC: EXPECTED_STABLECOIN_MINIMUM_AMOUNT,
      USDT: EXPECTED_STABLECOIN_MINIMUM_AMOUNT,
    });
    expect(usdcMinimumAmount).toBe(EXPECTED_STABLECOIN_MINIMUM_AMOUNT);
    expect(ethMinimumAmount).toBe(EXPECTED_ETH_MINIMUM_AMOUNT);
  });

  test("should not treat inherited object properties as configured assets", () => {
    // given
    const inheritedPropertyName = "toString";

    // when
    const minimumAmount = getMinimumBorrowAmount(inheritedPropertyName);

    // then
    const EXPECTED_MINIMUM_AMOUNT = 0n;
    expect(minimumAmount).toBe(EXPECTED_MINIMUM_AMOUNT);
  });

  test("should return a minimum validation error when borrow amount is too low", () => {
    // given
    const amount = 5_099n;
    const asset = "BTC";

    // when
    const validationError = getBorrowAmountMinimumValidationError({
      amount,
      asset,
    });

    // then
    const EXPECTED_MINIMUM_AMOUNT = 5_100n;
    const EXPECTED_MESSAGE =
      "Borrow amount must be at least 5100 base units for BTC";
    expect(validationError).toEqual({
      asset,
      minimumAmount: EXPECTED_MINIMUM_AMOUNT,
      message: EXPECTED_MESSAGE,
    });
  });

  test("should not return a minimum validation error for unsupported assets", () => {
    // given
    const amount = 1n;
    const asset = "SOL";

    // when
    const validationError = getBorrowAmountMinimumValidationError({
      amount,
      asset,
    });

    // then
    expect(validationError).toBeNull();
  });
});
