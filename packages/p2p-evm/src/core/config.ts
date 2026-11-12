import type { Address } from "viem";

export const DEFAULT_API_BASE_URL =
  "https://app.liquidium.wtf/robinhood/api/sdk";
export const DEFAULT_TIMEOUT_MS = 30_000;

export const ROBINHOOD_CHAIN_ID = 4663;

/**
 * LoanCore proxies the SDK knows. Any other chain or deployment needs an explicit
 * `loanCoreAddress`. Everything else, the fee splitter included, is read from this contract.
 */
const LOAN_CORE_ADDRESS_BY_CHAIN_ID: Partial<Record<number, Address>> = {
  [ROBINHOOD_CHAIN_ID]: "0x853918Ed9f97944ed50Dc50f3C9Fc50469ba7B02",
};

/** Resolves the LoanCore proxy for a chain, preferring an explicit override. */
export function resolveLoanCoreAddress(
  chainId: number,
  override?: Address
): Address | undefined {
  return override ?? LOAN_CORE_ADDRESS_BY_CHAIN_ID[chainId];
}
