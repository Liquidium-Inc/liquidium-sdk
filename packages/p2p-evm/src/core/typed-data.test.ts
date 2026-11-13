import { hashTypedData } from "viem";
import { describe, expect, it } from "vitest";
import {
  assertPartnerId,
  generateLenderOfferSalt,
  getBorrowerAttributionTypedData,
  getLenderAttributionTypedData,
  getLenderPartnerId,
  MAX_PARTNER_ID,
  NO_PARTNER_ID,
} from "./typed-data";

// Digests produced by FeeSplitter's own hashing in the contract test suite.
const SOLIDITY_CHAIN_ID = 31_337;
const SOLIDITY_FEE_SPLITTER = "0xa0Cb889707d426A7A386870A03bc70d1b0697598";
const OFFER_HASH =
  "0x00000000000000000000000000000000000000000000000000000000000000ab";

describe("attribution typed data", () => {
  it("hashes a lender attribution exactly as the fee splitter does", () => {
    const digest = hashTypedData(
      getLenderAttributionTypedData(SOLIDITY_CHAIN_ID, SOLIDITY_FEE_SPLITTER, {
        partnerId: 7,
        offerHash: OFFER_HASH,
      })
    );

    expect(digest).toBe(
      "0x309fb8c2e70da80c0248d1eab54835141eb98951c8c88ec70c2b548a9d9e2aac"
    );
  });

  it("hashes a borrower attribution exactly as the fee splitter does", () => {
    const digest = hashTypedData(
      getBorrowerAttributionTypedData(
        SOLIDITY_CHAIN_ID,
        SOLIDITY_FEE_SPLITTER,
        {
          partnerId: 7,
          offerHash: OFFER_HASH,
          borrower: "0x1111111111111111111111111111111111111111",
          deadline: 1_767_225_600n,
        }
      )
    );

    expect(digest).toBe(
      "0x7c99aeb708be029c24de3db9832e7840a2e4266ad1b875e49e07d95f2713db05"
    );
  });
});

describe("lender offer salt", () => {
  it("carries the partner id in its first four bytes", () => {
    const salt = generateLenderOfferSalt(MAX_PARTNER_ID);

    expect(salt).toMatch(/^0xffffffff[0-9a-f]{56}$/);
    expect(getLenderPartnerId(salt)).toBe(MAX_PARTNER_ID);
  });

  it("reads a zero prefix as no partner", () => {
    expect(getLenderPartnerId(`0x00000000${"ab".repeat(28)}`)).toBe(
      NO_PARTNER_ID
    );
  });

  it("refuses to generate a salt for no partner", () => {
    expect(() => generateLenderOfferSalt(NO_PARTNER_ID)).toThrow();
  });

  it("is random beyond the partner id", () => {
    expect(generateLenderOfferSalt(7)).not.toBe(generateLenderOfferSalt(7));
  });

  it("rejects ids that do not fit in four bytes", () => {
    expect(() => assertPartnerId(MAX_PARTNER_ID + 1)).toThrow();
    expect(() => assertPartnerId(-1)).toThrow();
    expect(() => assertPartnerId(1.5)).toThrow();
  });
});
