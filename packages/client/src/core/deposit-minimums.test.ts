import { describe, expect, test } from "vitest";
import {
  getDepositAmountMinimumValidationError,
  getMinimumDepositAmount,
  MIN_DEPOSIT_AMOUNTS_BY_ASSET,
} from "./deposit-minimums";

describe("deposit minimums", () => {
  test("should expose the configured ETH deposit amount minimum", () => {
    // given
    const ethAsset = "ETH";

    // when
    const ethMinimumAmount = getMinimumDepositAmount(ethAsset);

    // then
    const EXPECTED_ETH_MINIMUM_AMOUNT = 5_000_000_000_000_000n;
    expect(MIN_DEPOSIT_AMOUNTS_BY_ASSET).toEqual({
      ETH: EXPECTED_ETH_MINIMUM_AMOUNT,
    });
    expect(ethMinimumAmount).toBe(EXPECTED_ETH_MINIMUM_AMOUNT);
  });

  test("should not treat inherited object properties as configured assets", () => {
    // given
    const inheritedPropertyName = "toString";

    // when
    const minimumAmount = getMinimumDepositAmount(inheritedPropertyName);

    // then
    const EXPECTED_MINIMUM_AMOUNT = 0n;
    expect(minimumAmount).toBe(EXPECTED_MINIMUM_AMOUNT);
  });

  test("should return a minimum validation error when an ETH deposit is too low", () => {
    // given
    const amount = 4_999_999_999_999_999n;
    const asset = "ETH";

    // when
    const validationError = getDepositAmountMinimumValidationError({
      amount,
      asset,
    });

    // then
    const EXPECTED_MINIMUM_AMOUNT = 5_000_000_000_000_000n;
    const EXPECTED_MESSAGE =
      "Deposit amount must be at least 5000000000000000 base units for ETH";
    expect(validationError).toEqual({
      asset,
      minimumAmount: EXPECTED_MINIMUM_AMOUNT,
      message: EXPECTED_MESSAGE,
    });
  });

  test("should accept an ETH deposit equal to the minimum", () => {
    // given
    const amount = 5_000_000_000_000_000n;
    const asset = "ETH";

    // when
    const validationError = getDepositAmountMinimumValidationError({
      amount,
      asset,
    });

    // then
    expect(validationError).toBeNull();
  });
});
