import type { Address, erc721Abi, Hex } from "viem";
import type { Valuation } from "../../core/typed-data";
import type { PreparedCall } from "../../core/types";
import type { loanCoreAbi } from "../../generated/loan-core";
import type { SignedBorrowerAttribution } from "../attribution/types";
import type { PublishedOffer } from "../offers/types";

/** Request for {@link LoansModule.getValuation}. */
export interface GetValuationRequest {
  collection: Address;
  asset: Address;
}

/** The oracle's valuation and its signature, checked against LoanCore's oracle signer. */
export interface SignedValuation {
  valuation: Valuation;
  signature: Hex;
}

/** Request for {@link LoansModule.prepareBorrow}. */
export interface PrepareBorrowRequest {
  /** The NFT owner. The same wallet must send the transaction. */
  borrower: Address;
  /** The NFT to pledge, from the offer's collection. */
  tokenId: bigint;
  /** The offer to fill, from `offers.listOffers`. */
  offer: PublishedOffer;
  /** A valuation from `getValuation`. Fetched when omitted. */
  valuation?: SignedValuation;
  /** Your signature for this borrower, from `attribution.signBorrowerAttribution`. */
  borrowerAttribution?: SignedBorrowerAttribution;
}

/** The NFT transfer that originates the loan: `safeTransferFrom(owner, loanCore, id, data)`. */
export type BorrowCall = PreparedCall<
  typeof erc721Abi,
  "safeTransferFrom",
  readonly [from: Address, to: Address, tokenId: bigint, data: Hex]
>;

/** A borrow ready for the borrower's wallet. */
export interface PreparedBorrow {
  /** Simulate it, then send it from the borrower's wallet. No NFT approval is needed. */
  call: BorrowCall;
  offerHash: Hex;
  /** The attribution the transaction carries, or `undefined` when neither side has a partner. */
  attribution?: Hex;
  /** Unix timestamp after which the valuation, and so the transaction, is rejected. */
  validUntil: bigint;
}

/** Lifecycle of a loan in LoanCore. */
export type LoanStatus = "active" | "repaid" | "defaulted";

/** A loan as LoanCore stores it. */
export interface Loan {
  loanId: bigint;
  borrower: Address;
  lender: Address;
  collection: Address;
  tokenId: bigint;
  asset: Address;
  principal: bigint;
  /** Principal plus interest, fixed at origination. */
  repayment: bigint;
  /** Liquidium's share of the interest, in basis points, fixed at origination. */
  feeBps: number;
  startTime: bigint;
  maturity: bigint;
  status: LoanStatus;
  /** True while the NFT is in escrow for this loan. */
  collateralHeld: boolean;
}

/** What LoanCore emitted when a borrow originated a loan. */
export interface LoanOrigination {
  loanId: bigint;
  offerHash: Hex;
  borrower: Address;
  lender: Address;
  collection: Address;
  tokenId: bigint;
  asset: Address;
  principal: bigint;
  repayment: bigint;
  maturity: bigint;
  /** Fee taken from the principal at origination. */
  activationFee: bigint;
}

/** The `repay(loanId)` call. */
export type RepayCall = PreparedCall<
  typeof loanCoreAbi,
  "repay",
  readonly [loanId: bigint]
>;

/** A repayment ready for a wallet. */
export interface PreparedRepay {
  /** Send it from any wallet holding `repaymentOwed` of `asset`, approved to LoanCore. */
  call: RepayCall;
  asset: Address;
  /** The amount LoanCore will pull. Approve at least this much. */
  repaymentOwed: bigint;
}
