import type { Address, Hex } from "viem";
import type { PreparedCall } from "../../core/types";
import type { feeSplitterAbi } from "../../generated/fee-splitter";

/** The contracts a client is talking to, as the chain reports them. */
export interface RevenueDeployment {
  chainId: number;
  loanCoreAddress: Address;
  /** LoanCore's fee recipient, confirmed to be a splitter that names this LoanCore back. */
  feeSplitterAddress: Address;
  /** Who can change partner rates and signers. Expect Liquidium's Safe. */
  feeSplitterOwner: Address;
}

/** A partner as registered in the fee splitter. */
export interface Partner {
  partnerId: number;
  /** Where `claim` sends this partner's balances. */
  payout: Address;
  /**
   * The partner's share, in basis points, of the fee its side earns: the activation fee for
   * borrowers it brings, Liquidium's interest fee for lenders it brings.
   */
  shareBps: number;
  /** Whether new loans can be attributed to this partner. */
  active: boolean;
}

/** The interest-fee share reserved for a lender's partner on one loan. */
export interface LoanShare {
  /** The lender's partner, or zero when the loan has none. */
  partnerId: number;
  /** Reserved until the loan ends; zero once settled. */
  pendingInterestShare: bigint;
}

/** The `settleInterest(loanIds)` call. Anyone may send it. */
export type SettleInterestCall = PreparedCall<
  typeof feeSplitterAbi,
  "settleInterest",
  readonly [loanIds: readonly bigint[]]
>;

/** The `claim(partnerId, asset)` call. Anyone may send it; funds go to the partner's payout. */
export type ClaimCall = PreparedCall<
  typeof feeSplitterAbi,
  "claim",
  readonly [partnerId: number, asset: Address]
>;

/** Request for {@link RevenueModule.auditLenderAttribution}. */
export interface AuditLenderAttributionRequest {
  /** Hashes of offers you signed a lender attribution for. */
  offerHashes: readonly Hex[];
  /** Start of the block range to scan. */
  fromBlock: bigint;
  /** End of the block range. Defaults to the latest block. */
  toBlock?: bigint;
}

/**
 * What happened to your lender attribution on one loan:
 * - `credited`: your share of the interest fee was reserved.
 * - `skipped`: your signature was forwarded but the splitter rejected it (for example your
 *   signer was removed or your partner deactivated before the fill).
 * - `omitted`: whoever filled the offer did not forward your signature. You were owed a
 *   share and received none.
 */
export type LenderAttributionOutcome = "credited" | "skipped" | "omitted";

/** One loan originated from an offer you attributed. */
export interface LenderAttributionAudit {
  offerHash: Hex;
  loanId: bigint;
  outcome: LenderAttributionOutcome;
  /** The interest-fee share reserved for you. Zero unless `credited`. */
  reservedInterestShare: bigint;
  /** The transaction that originated the loan: your evidence for an `omitted` outcome. */
  transactionHash: Hex;
  blockNumber: bigint;
}
