import { describe, expect, test } from "vitest";
import { LiquidiumErrorCode } from "./errors";
import {
  getSameAssetBorrowingValidationError,
  guardSameAssetBorrowing,
} from "./same-asset-borrowing";

const ASSET = "BTC";
const DIFFERENT_ASSET = "USDT";
const DUST_THRESHOLD = 100n;
const POOL_ID = "pool-id";

interface CreateValidationParamsOverrides {
  borrowAsset?: string;
  collateralAsset?: string;
  collateralAmount: bigint;
  sameAssetBorrowing?: boolean;
  sameAssetBorrowingDustThreshold?: bigint;
}

describe("getSameAssetBorrowingValidationError", () => {
  test("should allow borrowing different assets", () => {
    // given
    const params = createValidationParams({
      collateralAsset: ASSET,
      borrowAsset: DIFFERENT_ASSET,
      collateralAmount: DUST_THRESHOLD,
    });

    // when
    const result = getSameAssetBorrowingValidationError(params);

    // then
    expect(result).toBeUndefined();
  });

  test("should allow same-asset borrowing when enabled", () => {
    // given
    const params = createValidationParams({
      collateralAmount: DUST_THRESHOLD,
      sameAssetBorrowing: true,
    });

    // when
    const result = getSameAssetBorrowingValidationError(params);

    // then
    expect(result).toBeUndefined();
  });

  test("should allow disabled same-asset borrowing below the dust threshold", () => {
    // given
    const params = createValidationParams({
      collateralAmount: DUST_THRESHOLD - 1n,
    });

    // when
    const result = getSameAssetBorrowingValidationError(params);

    // then
    expect(result).toBeUndefined();
  });

  test("should allow zero same-asset collateral with a zero dust threshold", () => {
    // given
    const params = createValidationParams({
      collateralAmount: 0n,
      sameAssetBorrowingDustThreshold: 0n,
    });

    // when
    const result = getSameAssetBorrowingValidationError(params);

    // then
    expect(result).toBeUndefined();
  });

  test.each([
    ["at", DUST_THRESHOLD],
    ["above", DUST_THRESHOLD + 1n],
  ])("should reject disabled same-asset borrowing %s the dust threshold", (_position, collateralAmount) => {
    // given
    const params = createValidationParams({ collateralAmount });

    // when
    const result = getSameAssetBorrowingValidationError(params);

    // then
    expect(result).toEqual({
      message: `Same asset borrowing not allowed for pool ${POOL_ID}`,
    });
  });
});

describe("guardSameAssetBorrowing", () => {
  test("should throw a typed validation error when same-asset borrowing is rejected", () => {
    // given
    const params = createValidationParams({
      collateralAmount: DUST_THRESHOLD,
    });

    // when
    let result: unknown;
    try {
      guardSameAssetBorrowing(params);
    } catch (error) {
      result = error;
    }

    // then
    expect(result).toMatchObject({
      code: LiquidiumErrorCode.VALIDATION_ERROR,
      message: `Same asset borrowing not allowed for pool ${POOL_ID}`,
    });
  });
});

function createValidationParams(overrides: CreateValidationParamsOverrides) {
  return {
    borrowAsset: overrides.borrowAsset ?? ASSET,
    collateralAsset: overrides.collateralAsset ?? ASSET,
    collateralAmount: overrides.collateralAmount,
    poolId: POOL_ID,
    policy: {
      sameAssetBorrowing: overrides.sameAssetBorrowing ?? false,
      sameAssetBorrowingDustThreshold:
        overrides.sameAssetBorrowingDustThreshold ?? DUST_THRESHOLD,
    },
  };
}
