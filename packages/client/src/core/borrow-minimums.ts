import { Asset } from "./types";

const MINIMUM_BTC_BORROW_AMOUNT_SATS = 5_100n;
const MINIMUM_ETH_BORROW_AMOUNT_WEI = 5_000_000_000_000_000n;
const MINIMUM_STABLECOIN_BORROW_AMOUNT_BASE_UNITS = 1_000_000n;

/** Minimum borrow amounts in each asset's base units. */
export const MIN_BORROW_AMOUNTS_BY_ASSET = {
  [Asset.BTC]: MINIMUM_BTC_BORROW_AMOUNT_SATS,
  [Asset.ETH]: MINIMUM_ETH_BORROW_AMOUNT_WEI,
  [Asset.USDC]: MINIMUM_STABLECOIN_BORROW_AMOUNT_BASE_UNITS,
  [Asset.USDT]: MINIMUM_STABLECOIN_BORROW_AMOUNT_BASE_UNITS,
} as const;

export type MinimumBorrowAsset = keyof typeof MIN_BORROW_AMOUNTS_BY_ASSET;

export interface BorrowAmountMinimumValidationParams {
  amount: bigint;
  asset: string;
}

export interface BorrowAmountMinimumValidationError {
  asset: string;
  minimumAmount: bigint;
  message: string;
}

/**
 * Returns the minimum borrow amount for an asset in base units.
 *
 * Assets without a configured product minimum return `0n`.
 */
export function getMinimumBorrowAmount(asset: string): bigint {
  if (!isMinimumBorrowAsset(asset)) {
    return 0n;
  }

  return MIN_BORROW_AMOUNTS_BY_ASSET[asset];
}

export function getBorrowAmountMinimumValidationError(
  params: BorrowAmountMinimumValidationParams
): BorrowAmountMinimumValidationError | null {
  const minimumAmount = getMinimumBorrowAmount(params.asset);
  if (minimumAmount <= 0n || params.amount >= minimumAmount) {
    return null;
  }

  return {
    asset: params.asset,
    minimumAmount,
    message: formatMinimumBorrowAmountMessage(params.asset, minimumAmount),
  };
}

export function formatMinimumBorrowAmountMessage(
  asset: string,
  minimumAmount: bigint
): string {
  return `Borrow amount must be at least ${minimumAmount} base units for ${asset}`;
}

function isMinimumBorrowAsset(asset: string): asset is MinimumBorrowAsset {
  return Object.hasOwn(MIN_BORROW_AMOUNTS_BY_ASSET, asset);
}
