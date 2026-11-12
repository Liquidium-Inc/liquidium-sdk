import { decodeAbiParameters, type Hex, hexToBigInt, slice } from "viem";
import { describe, expect, it } from "vitest";
import {
  ASSET,
  BORROWER,
  CHAIN_ID,
  COLLECTION,
  createFakeApi,
  createFakeChain,
  createOffer,
  createTestClient,
  LOAN_CORE,
  lenderAccount,
  oracleAccount,
  PARTNER_ID,
} from "../../_internal/test-fixtures";
import { P2pEvmErrorCode } from "../../core/errors";
import {
  getValuationTypedData,
  hashLenderOffer,
  type Valuation,
} from "../../core/typed-data";
import type { PublishedOffer } from "../offers/types";
import type { SignedValuation } from "./types";

const OFFER_SIGNATURE: Hex = `0x${"22".repeat(65)}`;
const PARTNER_SIGNATURE: Hex = `0x${"33".repeat(65)}`;
const WORD_BYTES = 32;
const FOUR_FIELD_FIRST_OFFSET = 608n;
const FIVE_FIELD_FIRST_OFFSET = 640n;
const LENDER_OFFER_WORDS = 12;

const valuation: Valuation = {
  collection: COLLECTION,
  asset: ASSET,
  value: 2_000_000n,
  epoch: 1n,
  validUntil: 4_000_000_000n,
};

async function signValuation(
  value: Valuation,
  account = oracleAccount
): Promise<SignedValuation> {
  return {
    valuation: value,
    signature: await account.signTypedData(
      getValuationTypedData(CHAIN_ID, LOAN_CORE, value)
    ),
  };
}

function toApiValuation(signed: SignedValuation) {
  return {
    valuation: {
      collection: signed.valuation.collection,
      asset: signed.valuation.asset,
      value: signed.valuation.value.toString(),
      epoch: signed.valuation.epoch.toString(),
      validUntil: signed.valuation.validUntil.toString(),
    },
    signature: signed.signature,
  };
}

function publishedOffer(lenderAttributionSignature?: Hex): PublishedOffer {
  const offer = createOffer(lenderAttributionSignature ? PARTNER_ID : 0);
  return {
    offerHash: hashLenderOffer(CHAIN_ID, LOAN_CORE, offer),
    offer,
    offerSignature: OFFER_SIGNATURE,
    lenderPartnerId: lenderAttributionSignature ? PARTNER_ID : 0,
    lenderAttributionSignature,
  };
}

/** The first dynamic offset is how LoanCore tells a four-field payload from a five-field one. */
function firstDynamicOffset(data: Hex): bigint {
  const start = LENDER_OFFER_WORDS * WORD_BYTES;
  return hexToBigInt(slice(data, start, start + WORD_BYTES));
}

describe("LoansModule", () => {
  it("accepts a valuation signed by LoanCore's oracle signer", async () => {
    const signed = await signValuation(valuation);
    const api = createFakeApi(() => toApiValuation(signed));
    const client = createTestClient(createFakeChain(), api);

    await expect(
      client.loans.getValuation({ collection: COLLECTION, asset: ASSET })
    ).resolves.toEqual(signed);
    expect(api.requests[0]).toMatchObject({
      url: "https://api.test/sdk/v1/valuations",
      body: { chainId: CHAIN_ID, collection: COLLECTION, asset: ASSET },
    });
  });

  it("rejects a valuation signed by anyone else", async () => {
    const signed = await signValuation(valuation, lenderAccount);
    const api = createFakeApi(() => toApiValuation(signed));
    const client = createTestClient(createFakeChain(), api);

    await expect(
      client.loans.getValuation({ collection: COLLECTION, asset: ASSET })
    ).rejects.toMatchObject({ code: P2pEvmErrorCode.INVALID_VALUATION });
  });

  it("rejects a valuation for a different market", async () => {
    const signed = await signValuation({ ...valuation, asset: COLLECTION });
    const api = createFakeApi(() => toApiValuation(signed));
    const client = createTestClient(createFakeChain(), api);

    await expect(
      client.loans.getValuation({ collection: COLLECTION, asset: ASSET })
    ).rejects.toMatchObject({ code: P2pEvmErrorCode.INVALID_VALUATION });
  });

  it("builds the unattributed borrow as the four-field payload", async () => {
    const client = createTestClient();
    const offer = publishedOffer();

    const prepared = await client.loans.prepareBorrow({
      borrower: BORROWER,
      tokenId: 42n,
      offer,
      valuation: await signValuation(valuation),
    });

    expect(prepared.attribution).toBeUndefined();
    expect(prepared.call.address).toBe(COLLECTION);
    expect(prepared.call.functionName).toBe("safeTransferFrom");
    expect(prepared.call.args.slice(0, 3)).toEqual([BORROWER, LOAN_CORE, 42n]);
    expect(firstDynamicOffset(prepared.call.args[3])).toBe(
      FOUR_FIELD_FIRST_OFFSET
    );
    expect(prepared.validUntil).toBe(valuation.validUntil);
  });

  it("forwards the lender's partner signature in a five-field payload", async () => {
    const client = createTestClient();
    const offer = publishedOffer(PARTNER_SIGNATURE);

    const prepared = await client.loans.prepareBorrow({
      borrower: BORROWER,
      tokenId: 42n,
      offer,
      valuation: await signValuation(valuation),
    });

    expect(firstDynamicOffset(prepared.call.args[3])).toBe(
      FIVE_FIELD_FIRST_OFFSET
    );
    const [borrowerPart, lenderPart] = decodeAbiParameters(
      [{ type: "bytes" }, { type: "bytes" }],
      prepared.attribution ?? "0x"
    );
    expect(borrowerPart).toBe("0x");
    expect(lenderPart).toContain(PARTNER_SIGNATURE.slice(2));
  });

  it("adds the borrower attribution alongside the lender's", async () => {
    const client = createTestClient();

    const prepared = await client.loans.prepareBorrow({
      borrower: BORROWER,
      tokenId: 42n,
      offer: publishedOffer(PARTNER_SIGNATURE),
      valuation: await signValuation(valuation),
      borrowerAttribution: {
        partnerId: PARTNER_ID,
        deadline: 4_000_000_000n,
        signature: `0x${"44".repeat(65)}`,
      },
    });

    const [borrowerPart] = decodeAbiParameters(
      [{ type: "bytes" }, { type: "bytes" }],
      prepared.attribution ?? "0x"
    );
    const [partnerId, deadline] = decodeAbiParameters(
      [{ type: "uint32" }, { type: "uint64" }, { type: "bytes" }],
      borrowerPart
    );
    expect(partnerId).toBe(PARTNER_ID);
    expect(deadline).toBe(4_000_000_000n);
  });

  it("refuses an expired valuation", async () => {
    const client = createTestClient();

    await expect(
      client.loans.prepareBorrow({
        borrower: BORROWER,
        tokenId: 42n,
        offer: publishedOffer(),
        valuation: await signValuation({ ...valuation, validUntil: 1n }),
      })
    ).rejects.toMatchObject({ code: P2pEvmErrorCode.INVALID_VALUATION });
  });

  it("refuses a caller-supplied valuation the oracle did not sign", async () => {
    const client = createTestClient();

    await expect(
      client.loans.prepareBorrow({
        borrower: BORROWER,
        tokenId: 42n,
        offer: publishedOffer(),
        valuation: await signValuation(valuation, lenderAccount),
      })
    ).rejects.toMatchObject({ code: P2pEvmErrorCode.INVALID_VALUATION });
  });
});
