import { encodeAbiParameters, getAbiItem, type Hex } from "viem";
import type { LenderOffer } from "../../core/types";
import { loanCoreAbi } from "../../generated/loan-core";
import type { SignedBorrowerAttribution } from "./types";

const EMPTY_BYTES: Hex = "0x";
const lenderOfferAbiParameter = getAbiItem({
  abi: loanCoreAbi,
  name: "borrowSigned",
}).inputs[0];

/** The lender half: the offer, whose salt names the partner, and the partner's signature. */
export function encodeLenderAttribution(
  offer: LenderOffer,
  signature: Hex
): Hex {
  return encodeAbiParameters(
    [lenderOfferAbiParameter, { type: "bytes" }],
    [offer, signature]
  );
}

/** The borrower half: partner id, deadline and the partner's signature. */
export function encodeBorrowerAttribution(
  attribution: SignedBorrowerAttribution
): Hex {
  return encodeAbiParameters(
    [{ type: "uint32" }, { type: "uint64" }, { type: "bytes" }],
    [attribution.partnerId, attribution.deadline, attribution.signature]
  );
}

/**
 * The attribution LoanCore forwards to the fee splitter, or `undefined` when neither side has
 * a partner. An unattributed borrow sends no attribution at all, not an empty pair.
 */
export function encodeAttributionParts(
  borrower: Hex | undefined,
  lender: Hex | undefined
): Hex | undefined {
  if (!borrower && !lender) {
    return undefined;
  }
  return encodeAbiParameters(
    [{ type: "bytes" }, { type: "bytes" }],
    [borrower ?? EMPTY_BYTES, lender ?? EMPTY_BYTES]
  );
}
