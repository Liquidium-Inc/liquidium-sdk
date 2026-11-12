import {
  type Address,
  type Hex,
  hashTypedData,
  hexToNumber,
  numberToHex,
  size,
  slice,
} from "viem";
import { P2pEvmError, P2pEvmErrorCode } from "./errors";
import type { LenderOffer } from "./types";

const LOAN_CORE_DOMAIN_NAME = "LiquidiumLoanCore";
const FEE_SPLITTER_DOMAIN_NAME = "LiquidiumFeeSplitter";
const DOMAIN_VERSION = "1";

/** The lender's partner id is the first four bytes of the offer salt. */
export const PARTNER_ID_SALT_BYTES = 4;
const SALT_BYTES = 32;
export const MAX_PARTNER_ID = 0xffff_ffff;
/** Partner ids start at one. Zero means no partner. */
export const NO_PARTNER_ID = 0;

export const lenderOfferTypes = {
  LenderOffer: [
    { name: "lender", type: "address" },
    { name: "collection", type: "address" },
    { name: "asset", type: "address" },
    { name: "maxPrincipal", type: "uint256" },
    { name: "maxLtvBps", type: "uint16" },
    { name: "aprBps", type: "uint16" },
    { name: "duration", type: "uint32" },
    { name: "expiry", type: "uint64" },
    { name: "nonce", type: "uint256" },
    { name: "collectionNonce", type: "uint256" },
    { name: "assetNonce", type: "uint256" },
    { name: "salt", type: "bytes32" },
  ],
} as const;

export const valuationTypes = {
  Valuation: [
    { name: "collection", type: "address" },
    { name: "asset", type: "address" },
    { name: "value", type: "uint256" },
    { name: "epoch", type: "uint64" },
    { name: "validUntil", type: "uint64" },
  ],
} as const;

export const lenderAttributionTypes = {
  LenderAttribution: [
    { name: "partnerId", type: "uint32" },
    { name: "offerHash", type: "bytes32" },
  ],
} as const;

export const borrowerAttributionTypes = {
  BorrowerAttribution: [
    { name: "partnerId", type: "uint32" },
    { name: "offerHash", type: "bytes32" },
    { name: "borrower", type: "address" },
    { name: "deadline", type: "uint64" },
  ],
} as const;

/** The oracle's valuation of a collection in a loan asset, as LoanCore takes it. */
export interface Valuation {
  collection: Address;
  asset: Address;
  value: bigint;
  epoch: bigint;
  /** Unix timestamp after which LoanCore rejects the valuation. */
  validUntil: bigint;
}

/** What a partner signer signs to vouch that an offer was created through the partner. */
export interface LenderAttributionMessage {
  partnerId: number;
  offerHash: Hex;
}

/** What a partner signer signs to vouch that a borrower is filling an offer through it. */
export interface BorrowerAttributionMessage {
  partnerId: number;
  offerHash: Hex;
  borrower: Address;
  /** Unix timestamp after which the fee splitter rejects the signature. */
  deadline: bigint;
}

function loanCoreDomain(chainId: number, loanCoreAddress: Address) {
  return {
    name: LOAN_CORE_DOMAIN_NAME,
    version: DOMAIN_VERSION,
    chainId,
    verifyingContract: loanCoreAddress,
  } as const;
}

function feeSplitterDomain(chainId: number, feeSplitterAddress: Address) {
  return {
    name: FEE_SPLITTER_DOMAIN_NAME,
    version: DOMAIN_VERSION,
    chainId,
    verifyingContract: feeSplitterAddress,
  } as const;
}

/** EIP-712 typed data a lender signs for an offer. */
export function getLenderOfferTypedData(
  chainId: number,
  loanCoreAddress: Address,
  offer: LenderOffer
) {
  return {
    domain: loanCoreDomain(chainId, loanCoreAddress),
    types: lenderOfferTypes,
    primaryType: "LenderOffer",
    message: offer,
  } as const;
}

/** EIP-712 typed data the oracle signs for a valuation. */
export function getValuationTypedData(
  chainId: number,
  loanCoreAddress: Address,
  valuation: Valuation
) {
  return {
    domain: loanCoreDomain(chainId, loanCoreAddress),
    types: valuationTypes,
    primaryType: "Valuation",
    message: valuation,
  } as const;
}

/** EIP-712 typed data a partner signer signs for the lender side. */
export function getLenderAttributionTypedData(
  chainId: number,
  feeSplitterAddress: Address,
  message: LenderAttributionMessage
) {
  assertPartnerId(message.partnerId);
  return {
    domain: feeSplitterDomain(chainId, feeSplitterAddress),
    types: lenderAttributionTypes,
    primaryType: "LenderAttribution",
    message,
  } as const;
}

/** EIP-712 typed data a partner signer signs for the borrower side. */
export function getBorrowerAttributionTypedData(
  chainId: number,
  feeSplitterAddress: Address,
  message: BorrowerAttributionMessage
) {
  assertPartnerId(message.partnerId);
  return {
    domain: feeSplitterDomain(chainId, feeSplitterAddress),
    types: borrowerAttributionTypes,
    primaryType: "BorrowerAttribution",
    message,
  } as const;
}

/**
 * The offer hash LoanCore computes, derived locally. It commits to the chain and the LoanCore
 * address, so it identifies the offer everywhere.
 */
export function hashLenderOffer(
  chainId: number,
  loanCoreAddress: Address,
  offer: LenderOffer
): Hex {
  return hashTypedData(
    getLenderOfferTypedData(chainId, loanCoreAddress, offer)
  );
}

export function assertPartnerId(partnerId: number): void {
  if (
    !Number.isInteger(partnerId) ||
    partnerId <= NO_PARTNER_ID ||
    partnerId > MAX_PARTNER_ID
  ) {
    throw new P2pEvmError(
      P2pEvmErrorCode.VALIDATION_ERROR,
      "Partner id must be an integer from 1 to 4294967295"
    );
  }
}

/** The partner an offer salt names, or zero when it names none. */
export function getLenderPartnerId(salt: Hex): number {
  if (size(salt) !== SALT_BYTES) {
    throw new P2pEvmError(
      P2pEvmErrorCode.VALIDATION_ERROR,
      "Lender offer salt must be exactly 32 bytes"
    );
  }
  return hexToNumber(slice(salt, 0, PARTNER_ID_SALT_BYTES));
}

/**
 * A fresh offer salt: four bytes naming the partner, then 28 random bytes. The lender signs
 * the salt, so nobody can change the partner afterwards without invalidating the offer.
 */
export function generateLenderOfferSalt(partnerId: number): Hex {
  assertPartnerId(partnerId);
  const random = crypto.getRandomValues(
    new Uint8Array(SALT_BYTES - PARTNER_ID_SALT_BYTES)
  );
  const randomHex = Array.from(random, (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
  return `${numberToHex(partnerId, { size: PARTNER_ID_SALT_BYTES })}${randomHex}`;
}
