/** Minimum withdraw amounts in each asset's base units. */
export const MIN_WITHDRAW_AMOUNTS_BY_ASSET = {
  BTC: 5_000n, // 5,000 sats = 0.00005 BTC
  USDC: 1_000_000n, // 1 USDC
  USDT: 1_000_000n, // 1 USDT
} as const;

export type MinimumWithdrawAsset = keyof typeof MIN_WITHDRAW_AMOUNTS_BY_ASSET;

export interface WithdrawAmountMinimumValidationParams {
  amount: bigint;
  asset: string;
}

export interface WithdrawAmountMinimumValidationError {
  asset: string;
  minimumAmount: bigint;
  message: string;
}

/**
 * Returns the minimum withdraw amount for an asset in base units.
 *
 * Assets without a configured product minimum return `0n`.
 */
export function getMinimumWithdrawAmount(asset: string): bigint {
  if (!isMinimumWithdrawAsset(asset)) {
    return 0n;
  }

  return MIN_WITHDRAW_AMOUNTS_BY_ASSET[asset];
}

export function getWithdrawAmountMinimumValidationError(
  params: WithdrawAmountMinimumValidationParams
): WithdrawAmountMinimumValidationError | null {
  const minimumAmount = getMinimumWithdrawAmount(params.asset);
  if (minimumAmount <= 0n || params.amount >= minimumAmount) {
    return null;
  }

  return {
    asset: params.asset,
    minimumAmount,
    message: formatMinimumWithdrawAmountMessage(params.asset, minimumAmount),
  };
}

export function formatMinimumWithdrawAmountMessage(
  asset: string,
  minimumAmount: bigint
): string {
  return `Withdraw amount must be at least ${minimumAmount} base units for ${asset}`;
}

function isMinimumWithdrawAsset(asset: string): asset is MinimumWithdrawAsset {
  return Object.hasOwn(MIN_WITHDRAW_AMOUNTS_BY_ASSET, asset);
}
