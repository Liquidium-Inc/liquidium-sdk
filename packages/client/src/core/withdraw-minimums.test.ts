import { describe, expect, test } from "vitest";
import {
  getMinimumWithdrawAmount,
  getWithdrawAmountMinimumValidationError,
  MIN_WITHDRAW_AMOUNTS_BY_ASSET,
} from "./withdraw-minimums";

describe("withdraw minimums", () => {
  test("should expose configured withdraw amount minimums", () => {
    // given
    const btcAsset = "BTC";
    const usdcAsset = "USDC";
    const usdtAsset = "USDT";
    const ethAsset = "ETH";

    // when
    const btcMinimumAmount = getMinimumWithdrawAmount(btcAsset);
    const usdcMinimumAmount = getMinimumWithdrawAmount(usdcAsset);
    const usdtMinimumAmount = getMinimumWithdrawAmount(usdtAsset);
    const ethMinimumAmount = getMinimumWithdrawAmount(ethAsset);

    // then
    const EXPECTED_BTC_MINIMUM_AMOUNT = 5_000n;
    const EXPECTED_ETH_MINIMUM_AMOUNT = 5_000_000_000_000_000n;
    const EXPECTED_STABLECOIN_MINIMUM_AMOUNT = 1_000_000n;
    expect(MIN_WITHDRAW_AMOUNTS_BY_ASSET).toMatchObject({
      BTC: EXPECTED_BTC_MINIMUM_AMOUNT,
      ETH: EXPECTED_ETH_MINIMUM_AMOUNT,
      USDC: EXPECTED_STABLECOIN_MINIMUM_AMOUNT,
      USDT: EXPECTED_STABLECOIN_MINIMUM_AMOUNT,
    });
    expect(btcMinimumAmount).toBe(EXPECTED_BTC_MINIMUM_AMOUNT);
    expect(usdcMinimumAmount).toBe(EXPECTED_STABLECOIN_MINIMUM_AMOUNT);
    expect(usdtMinimumAmount).toBe(EXPECTED_STABLECOIN_MINIMUM_AMOUNT);
    expect(ethMinimumAmount).toBe(EXPECTED_ETH_MINIMUM_AMOUNT);
  });

  test("should not treat inherited object properties as configured assets", () => {
    // given
    const inheritedPropertyName = "toString";

    // when
    const minimumAmount = getMinimumWithdrawAmount(inheritedPropertyName);

    // then
    const EXPECTED_MINIMUM_AMOUNT = 0n;
    expect(minimumAmount).toBe(EXPECTED_MINIMUM_AMOUNT);
  });

  test("should return a minimum validation error when withdraw amount is too low", () => {
    // given
    const amount = 4_999n;
    const asset = "BTC";

    // when
    const validationError = getWithdrawAmountMinimumValidationError({
      amount,
      asset,
    });

    // then
    const EXPECTED_MINIMUM_AMOUNT = 5_000n;
    const EXPECTED_MESSAGE =
      "Withdraw amount must be at least 5000 base units for BTC";
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
    const validationError = getWithdrawAmountMinimumValidationError({
      amount,
      asset,
    });

    // then
    expect(validationError).toBeNull();
  });
});
