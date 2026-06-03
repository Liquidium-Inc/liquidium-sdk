/** Minimum borrow amounts in each asset's base units. */
export const MIN_BORROW_AMOUNTS_BY_ASSET = {
  BTC: 5_100n,
  USDC: 1_000_000n,
  USDT: 1_000_000n,
} as const;

export type MinimumBorrowAsset = keyof typeof MIN_BORROW_AMOUNTS_BY_ASSET;

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

export function formatMinimumBorrowAmountMessage(
  asset: string,
  minimumAmount: bigint
): string {
  return `Borrow amount must be at least ${minimumAmount} base units for ${asset}`;
}

function isMinimumBorrowAsset(asset: string): asset is MinimumBorrowAsset {
  return asset in MIN_BORROW_AMOUNTS_BY_ASSET;
}
