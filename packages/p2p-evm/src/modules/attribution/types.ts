import type { Address, Hex, LocalAccount } from "viem";
import type { LenderOffer } from "../../core/types";

/**
 * Anything that can sign EIP-712 typed data with the partner's registered signer key: a viem
 * local account (`privateKeyToAccount`), or a KMS or HSM wrapped with viem's `toAccount`. The
 * key must be an EOA key; the fee splitter does not accept contract-wallet signatures.
 */
export interface AttributionSigner {
  signTypedData: LocalAccount["signTypedData"];
}

/** Request for {@link AttributionModule.signLenderAttribution}. */
export interface SignLenderAttributionRequest {
  signer: AttributionSigner;
  /** The offer the lender signed. Its salt must name your partner id. */
  offer: LenderOffer;
  /** Defaults to the client's `partnerId`. */
  partnerId?: number;
}

/** Request for {@link AttributionModule.signBorrowerAttribution}. */
export interface SignBorrowerAttributionRequest {
  signer: AttributionSigner;
  /** Hash of the offer the borrower is filling. */
  offerHash: Hex;
  /** The wallet that will send the borrow transaction. */
  borrower: Address;
  /** Seconds the signature stays valid. Defaults to ten minutes. */
  validForSeconds?: number;
  /** Defaults to the client's `partnerId`. */
  partnerId?: number;
}

/** A partner's signed statement that a borrower is filling an offer through it. */
export interface SignedBorrowerAttribution {
  partnerId: number;
  /** Unix timestamp after which the fee splitter rejects the signature. */
  deadline: bigint;
  signature: Hex;
}

/** Request for {@link AttributionModule.encode}. */
export interface EncodeAttributionRequest {
  /** The offer being filled. */
  offer: LenderOffer;
  /** The lender's partner signature, published with the offer. Omit when it has none. */
  lenderAttributionSignature?: Hex;
  /** Your signature for the borrower. Omit when the borrower is not yours. */
  borrowerAttribution?: SignedBorrowerAttribution;
}

/** Request for {@link AttributionModule.verifyBorrowerAttribution}. */
export interface VerifyBorrowerAttributionRequest {
  offerHash: Hex;
  borrower: Address;
  attribution: SignedBorrowerAttribution;
}

/** The partner the fee splitter would credit, and at what rate right now. */
export interface AttributedPartner {
  partnerId: number;
  /** The partner's current share of the fee, in basis points. Fixed per loan at fill time. */
  shareBps: number;
}
