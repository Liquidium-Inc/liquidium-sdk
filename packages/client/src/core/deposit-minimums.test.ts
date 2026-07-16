import { describe, expect, test } from "vitest";
import {
  getDepositAmountMinimumValidationError,
  getMinimumDepositAmount,
  MIN_DEPOSIT_AMOUNTS_BY_ASSET,
} from "./deposit-minimums";

describe("deposit minimums", () => {
  test("should expose configured deposit amount minimums", () => {
    // given
    const btcAsset = "BTC";
    const ethAsset = "ETH";
    const icpAsset = "ICP";
    const usdcAsset = "USDC";
    const usdtAsset = "USDT";

    // when
    const btcMinimumAmount = getMinimumDepositAmount(btcAsset);
    const ethMinimumAmount = getMinimumDepositAmount(ethAsset);
    const icpMinimumAmount = getMinimumDepositAmount(icpAsset);
    const usdcMinimumAmount = getMinimumDepositAmount(usdcAsset);
    const usdtMinimumAmount = getMinimumDepositAmount(usdtAsset);

    // then
    const EXPECTED_BTC_MINIMUM_AMOUNT = 5_100n;
    const EXPECTED_ETH_MINIMUM_AMOUNT = 5_000_000_000_000_000n;
    const EXPECTED_ICP_MINIMUM_AMOUNT = 10_000n;
    const EXPECTED_STABLECOIN_MINIMUM_AMOUNT = 1_000_000n;
    expect(MIN_DEPOSIT_AMOUNTS_BY_ASSET).toEqual({
      BTC: EXPECTED_BTC_MINIMUM_AMOUNT,
      ETH: EXPECTED_ETH_MINIMUM_AMOUNT,
      ICP: EXPECTED_ICP_MINIMUM_AMOUNT,
      USDC: EXPECTED_STABLECOIN_MINIMUM_AMOUNT,
      USDT: EXPECTED_STABLECOIN_MINIMUM_AMOUNT,
    });
    expect(btcMinimumAmount).toBe(EXPECTED_BTC_MINIMUM_AMOUNT);
    expect(ethMinimumAmount).toBe(EXPECTED_ETH_MINIMUM_AMOUNT);
    expect(icpMinimumAmount).toBe(EXPECTED_ICP_MINIMUM_AMOUNT);
    expect(usdcMinimumAmount).toBe(EXPECTED_STABLECOIN_MINIMUM_AMOUNT);
    expect(usdtMinimumAmount).toBe(EXPECTED_STABLECOIN_MINIMUM_AMOUNT);
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

  test("should return minimum validation errors below every configured asset boundary", () => {
    // given
    const belowMinimumCases = [
      { amount: 5_099n, asset: "BTC", minimumAmount: 5_100n },
      {
        amount: 4_999_999_999_999_999n,
        asset: "ETH",
        minimumAmount: 5_000_000_000_000_000n,
      },
      { amount: 9_999n, asset: "ICP", minimumAmount: 10_000n },
      { amount: 999_999n, asset: "USDC", minimumAmount: 1_000_000n },
      { amount: 999_999n, asset: "USDT", minimumAmount: 1_000_000n },
    ];

    // when
    const validationErrors = belowMinimumCases.map(({ amount, asset }) =>
      getDepositAmountMinimumValidationError({ amount, asset })
    );

    // then
    for (const [index, validationError] of validationErrors.entries()) {
      const currentCase = belowMinimumCases[index];
      expect(validationError).toEqual({
        asset: currentCase?.asset,
        minimumAmount: currentCase?.minimumAmount,
        message: `Deposit amount must be at least ${currentCase?.minimumAmount} base units for ${currentCase?.asset}`,
      });
    }
  });

  test("should accept deposits equal to every configured asset minimum", () => {
    // given
    const minimumCases = Object.entries(MIN_DEPOSIT_AMOUNTS_BY_ASSET);

    // when
    const validationErrors = minimumCases.map(([asset, amount]) =>
      getDepositAmountMinimumValidationError({ amount, asset })
    );

    // then
    expect(validationErrors).toEqual(minimumCases.map(() => null));
  });

  test("should not return a minimum validation error for unsupported assets", () => {
    // given
    const amount = 1n;
    const asset = "SOL";

    // when
    const validationError = getDepositAmountMinimumValidationError({
      amount,
      asset,
    });

    // then
    expect(validationError).toBeNull();
  });
});
