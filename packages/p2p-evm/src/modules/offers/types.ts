import type { Address, Hex } from "viem";
import type { getLenderOfferTypedData } from "../../core/typed-data";
import type { LenderOffer } from "../../core/types";
import type { AttributedPartner } from "../attribution/types";

/** The terms a lender chooses. The SDK adds the lender, the nonces and the salt. */
export interface LenderOfferTerms {
  collection: Address;
  asset: Address;
  maxPrincipal: bigint;
  maxLtvBps: number;
  aprBps: number;
  /** Loan duration in seconds. Must be a term the market lists. */
  duration: number;
  /** Unix timestamp after which the offer cannot be filled. */
  expiry: bigint;
}

/** Request for {@link OffersModule.prepareOffer}. */
export interface PrepareOfferRequest {
  lender: Address;
  terms: LenderOfferTerms;
  /** Defaults to the client's `partnerId`. */
  partnerId?: number;
}

/** An offer ready for the lender's wallet to sign. */
export interface PreparedOffer {
  offer: LenderOffer;
  /** Pass to the lender wallet's `signTypedData`. */
  typedData: ReturnType<typeof getLenderOfferTypedData>;
  offerHash: Hex;
}

/** Request for {@link OffersModule.publishOffer}. */
export interface PublishOfferRequest {
  offer: LenderOffer;
  /** The lender's signature over `offer`. */
  offerSignature: Hex;
  /**
   * Your signature from `attribution.signLenderAttribution`. It can only be supplied here: a
   * published offer is immutable.
   */
  lenderAttributionSignature?: Hex;
}

/** Filters for {@link OffersModule.listOffers}. */
export interface ListOffersFilters {
  collection?: Address;
  asset?: Address;
}

/** A signed offer from Liquidium's order book, with everything needed to verify and fill it. */
export interface PublishedOffer {
  offerHash: Hex;
  offer: LenderOffer;
  offerSignature: Hex;
  /** The partner the offer's salt names, or zero for none. */
  lenderPartnerId: number;
  /** The lender partner's signature, when the offer was published with one. */
  lenderAttributionSignature?: Hex;
}

/** The fillable book at one moment. */
export interface OfferBook {
  /** False while Liquidium's indexer is catching up: fills or cancellations may be missing. */
  complete: boolean;
  offers: PublishedOffer[];
}

/** What the chain says about an offer right now. */
export interface OfferVerification {
  /** LoanCore accepts the lender's signature and the offer can be filled. */
  fillable: boolean;
  /** The partner the fee splitter would credit for the lender side, or `null` for nobody. */
  lenderPartner: AttributedPartner | null;
}
