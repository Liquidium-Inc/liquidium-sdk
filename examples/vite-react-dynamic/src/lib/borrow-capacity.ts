import type { QuoteResult, UserStats } from "@liquidium/client";

const INTERNAL_USD_DECIMALS = 8;
const PROFILE_STATS_USD_DECIMALS = 27;
const USD_DECIMAL_SCALE_FACTOR =
  10n ** BigInt(PROFILE_STATS_USD_DECIMALS - INTERNAL_USD_DECIMALS);

/**
 * Returns a user-facing validation error when the current quote exceeds the
 * borrower's available borrowing power. Returns null when the quote fits.
 *
 * Quote USD uses INTERNAL_USD_DECIMALS and profile stats USD uses
 * PROFILE_STATS_USD_DECIMALS, so we scale the quote value up before comparing.
 */
export function getBorrowCapacityValidationError(params: {
  quoteResult: QuoteResult | null;
  userPositionSummary: UserStats | null;
}): string | null {
  const { quoteResult, userPositionSummary } = params;

  if (!quoteResult || !userPositionSummary) {
    return null;
  }

  const availableBorrowUsd =
    userPositionSummary.borrowingPower.maxBorrowableUsd;

  if (availableBorrowUsd <= 0n) {
    return "No collateral available yet. Deposit collateral and wait for confirmations before borrowing.";
  }

  if (quoteResult.borrowUsd <= 0n) {
    return null;
  }

  const requestedBorrowUsdAtProfileScale =
    quoteResult.borrowUsd * USD_DECIMAL_SCALE_FACTOR;

  if (requestedBorrowUsdAtProfileScale > availableBorrowUsd) {
    return "Insufficient collateral for this borrow amount. Deposit more collateral or lower the borrow amount/LTV.";
  }

  return null;
}
