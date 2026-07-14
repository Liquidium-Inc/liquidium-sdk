import { LiquidiumError, LiquidiumErrorCode } from "./errors";

export interface SameAssetBorrowingPolicy {
  sameAssetBorrowing: boolean;
  sameAssetBorrowingDustThreshold: bigint;
}

interface ValidateSameAssetBorrowingParams {
  borrowAsset: string;
  collateralAsset: string;
  collateralAmount: bigint;
  poolId: string;
  policy: SameAssetBorrowingPolicy;
}

export interface SameAssetBorrowingValidationError {
  message: string;
}

export function guardSameAssetBorrowing(
  params: ValidateSameAssetBorrowingParams
): void {
  const validationError = getSameAssetBorrowingValidationError(params);
  if (!validationError) {
    return;
  }

  throw new LiquidiumError(
    LiquidiumErrorCode.VALIDATION_ERROR,
    validationError.message
  );
}

export function getSameAssetBorrowingValidationError({
  borrowAsset,
  collateralAsset,
  collateralAmount,
  poolId,
  policy,
}: ValidateSameAssetBorrowingParams):
  | SameAssetBorrowingValidationError
  | undefined {
  if (borrowAsset !== collateralAsset) {
    return undefined;
  }

  if (policy.sameAssetBorrowing) {
    return undefined;
  }

  if (collateralAmount <= 0n) {
    return undefined;
  }

  if (collateralAmount < policy.sameAssetBorrowingDustThreshold) {
    return undefined;
  }

  return {
    message: `Same asset borrowing not allowed for pool ${poolId}`,
  };
}
