import { Asset } from "./types";

const MINIMUM_ETH_DEPOSIT_AMOUNT_WEI = 5_000_000_000_000_000n;

/** Minimum deposit amounts in each asset's base units. */
export const MIN_DEPOSIT_AMOUNTS_BY_ASSET = {
  [Asset.ETH]: MINIMUM_ETH_DEPOSIT_AMOUNT_WEI,
} as const;

export type MinimumDepositAsset = keyof typeof MIN_DEPOSIT_AMOUNTS_BY_ASSET;

export interface DepositAmountMinimumValidationParams {
  amount: bigint;
  asset: string;
}

export interface DepositAmountMinimumValidationError {
  asset: string;
  minimumAmount: bigint;
  message: string;
}

/**
 * Returns the minimum deposit amount for an asset in base units.
 *
 * Assets without a configured product minimum return `0n`.
 */
export function getMinimumDepositAmount(asset: string): bigint {
  if (!isMinimumDepositAsset(asset)) {
    return 0n;
  }

  return MIN_DEPOSIT_AMOUNTS_BY_ASSET[asset];
}

export function getDepositAmountMinimumValidationError(
  params: DepositAmountMinimumValidationParams
): DepositAmountMinimumValidationError | null {
  const minimumAmount = getMinimumDepositAmount(params.asset);
  if (minimumAmount <= 0n || params.amount >= minimumAmount) {
    return null;
  }

  return {
    asset: params.asset,
    minimumAmount,
    message: `Deposit amount must be at least ${minimumAmount} base units for ${params.asset}`,
  };
}

function isMinimumDepositAsset(asset: string): asset is MinimumDepositAsset {
  return Object.hasOwn(MIN_DEPOSIT_AMOUNTS_BY_ASSET, asset);
}
