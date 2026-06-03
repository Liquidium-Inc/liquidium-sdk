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
  return MIN_BORROW_AMOUNTS_BY_ASSET[asset as MinimumBorrowAsset] ?? 0n;
}

export function formatMinimumBorrowAmountMessage(
  asset: string,
  minimumAmount: bigint
): string {
  return `Borrow amount must be at least ${minimumAmount} base units for ${asset}`;
}
