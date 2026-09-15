import { Asset } from "./types";

const MINIMUM_BTC_DEPOSIT_AMOUNT_SATS = 5_100n;
const MINIMUM_ETH_DEPOSIT_AMOUNT_WEI = 5_000_000_000_000_000n;
const MINIMUM_ICP_DEPOSIT_AMOUNT_E8S = 10_000n;
const MINIMUM_STABLECOIN_DEPOSIT_AMOUNT_BASE_UNITS = 1_000_000n;

/** Minimum deposit amounts in each asset's base units. */
export const MIN_DEPOSIT_AMOUNTS_BY_ASSET = {
  [Asset.BTC]: MINIMUM_BTC_DEPOSIT_AMOUNT_SATS,
  [Asset.ETH]: MINIMUM_ETH_DEPOSIT_AMOUNT_WEI,
  [Asset.ICP]: MINIMUM_ICP_DEPOSIT_AMOUNT_E8S,
  [Asset.USDC]: MINIMUM_STABLECOIN_DEPOSIT_AMOUNT_BASE_UNITS,
  [Asset.USDT]: MINIMUM_STABLECOIN_DEPOSIT_AMOUNT_BASE_UNITS,
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
