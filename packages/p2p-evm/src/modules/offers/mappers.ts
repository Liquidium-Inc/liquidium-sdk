import type { Hex } from "viem";
import { P2pEvmError, P2pEvmErrorCode } from "../../core/errors";
import { getLenderPartnerId, hashLenderOffer } from "../../core/typed-data";
import type { LenderOffer } from "../../core/types";
import type { PublishedOffer } from "./types";

/** A lender offer as the SDK API carries it: integers as decimal strings. */
export interface LenderOfferApiItem {
  lender: `0x${string}`;
  collection: `0x${string}`;
  asset: `0x${string}`;
  maxPrincipal: string;
  maxLtvBps: string;
  aprBps: string;
  duration: string;
  expiry: string;
  nonce: string;
  collectionNonce: string;
  assetNonce: string;
  salt: Hex;
}

export interface PublishedOfferApiItem {
  offerHash: Hex;
  chainId: number;
  loanCoreAddress: `0x${string}`;
  signedOffer: LenderOfferApiItem;
  offerSignature: Hex;
  lenderAttributionSignature?: Hex;
}

export function toLenderOfferApiItem(offer: LenderOffer): LenderOfferApiItem {
  return {
    lender: offer.lender,
    collection: offer.collection,
    asset: offer.asset,
    maxPrincipal: offer.maxPrincipal.toString(),
    maxLtvBps: offer.maxLtvBps.toString(),
    aprBps: offer.aprBps.toString(),
    duration: offer.duration.toString(),
    expiry: offer.expiry.toString(),
    nonce: offer.nonce.toString(),
    collectionNonce: offer.collectionNonce.toString(),
    assetNonce: offer.assetNonce.toString(),
    salt: offer.salt,
  };
}

function toLenderOffer(item: LenderOfferApiItem): LenderOffer {
  return {
    lender: item.lender,
    collection: item.collection,
    asset: item.asset,
    maxPrincipal: BigInt(item.maxPrincipal),
    maxLtvBps: Number(item.maxLtvBps),
    aprBps: Number(item.aprBps),
    duration: Number(item.duration),
    expiry: BigInt(item.expiry),
    nonce: BigInt(item.nonce),
    collectionNonce: BigInt(item.collectionNonce),
    assetNonce: BigInt(item.assetNonce),
    salt: item.salt,
  };
}

/**
 * Maps an API offer and proves it is the offer it claims to be: the hash is recomputed
 * locally for this client's chain and LoanCore, so the API cannot substitute other terms or
 * another deployment's offer under a familiar hash.
 */
export function toPublishedOffer(
  item: PublishedOfferApiItem,
  chainId: number,
  loanCoreAddress: `0x${string}`
): PublishedOffer {
  const offer = toLenderOffer(item.signedOffer);
  const offerHash = hashLenderOffer(chainId, loanCoreAddress, offer);
  if (offerHash.toLowerCase() !== item.offerHash.toLowerCase()) {
    throw new P2pEvmError(
      P2pEvmErrorCode.OFFER_HASH_MISMATCH,
      `Offer ${item.offerHash} does not hash to its terms on chain ${chainId} for LoanCore ${loanCoreAddress}`
    );
  }

  return {
    offerHash,
    offer,
    offerSignature: item.offerSignature,
    lenderPartnerId: getLenderPartnerId(offer.salt),
    lenderAttributionSignature: item.lenderAttributionSignature,
  };
}
