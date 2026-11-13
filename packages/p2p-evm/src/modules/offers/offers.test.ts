import type { Hex } from "viem";
import { describe, expect, it } from "vitest";
import {
  ASSET,
  CHAIN_ID,
  COLLECTION,
  createFakeApi,
  createFakeChain,
  createOffer,
  createTestClient,
  LOAN_CORE,
  lenderAccount,
  PARTNER_ID,
} from "../../_internal/test-fixtures";
import { P2pEvmErrorCode } from "../../core/errors";
import { getLenderPartnerId, hashLenderOffer } from "../../core/typed-data";
import type { LenderOffer } from "../../core/types";
import { type PublishedOfferApiItem, toLenderOfferApiItem } from "./mappers";

const OFFER_SIGNATURE: Hex = `0x${"22".repeat(65)}`;
const PARTNER_SIGNATURE: Hex = `0x${"33".repeat(65)}`;

function toApiItem(
  offer: LenderOffer,
  lenderAttributionSignature?: Hex
): PublishedOfferApiItem {
  return {
    offerHash: hashLenderOffer(CHAIN_ID, LOAN_CORE, offer),
    chainId: CHAIN_ID,
    loanCoreAddress: LOAN_CORE,
    signedOffer: toLenderOfferApiItem(offer),
    offerSignature: OFFER_SIGNATURE,
    lenderAttributionSignature,
  };
}

describe("OffersModule", () => {
  it("prepares an offer with onchain nonces and the partner id in its salt", async () => {
    const client = createTestClient();

    const prepared = await client.offers.prepareOffer({
      lender: lenderAccount.address,
      terms: {
        collection: COLLECTION,
        asset: ASSET,
        maxPrincipal: 1_000_000n,
        maxLtvBps: 5_000,
        aprBps: 1_200,
        duration: 604_800,
        expiry: 4_000_000_000n,
      },
    });

    expect(prepared.offer).toMatchObject({
      nonce: 3n,
      collectionNonce: 4n,
      assetNonce: 5n,
    });
    expect(getLenderPartnerId(prepared.offer.salt)).toBe(PARTNER_ID);
    expect(prepared.offerHash).toBe(client.offers.hashOffer(prepared.offer));
    expect(prepared.typedData.domain.verifyingContract).toBe(LOAN_CORE);
  });

  it("refuses to prepare an offer on the wrong chain", async () => {
    const client = createTestClient(createFakeChain({ chainId: 1 }));

    await expect(
      client.offers.prepareOffer({
        lender: lenderAccount.address,
        terms: {
          collection: COLLECTION,
          asset: ASSET,
          maxPrincipal: 1n,
          maxLtvBps: 1,
          aprBps: 1,
          duration: 1,
          expiry: 1n,
        },
      })
    ).rejects.toMatchObject({ code: P2pEvmErrorCode.CHAIN_MISMATCH });
  });

  it("publishes an offer with its partner signature", async () => {
    const offer = createOffer();
    const api = createFakeApi(() => ({
      offer: toApiItem(offer, PARTNER_SIGNATURE),
    }));
    const client = createTestClient(createFakeChain(), api);

    const published = await client.offers.publishOffer({
      offer,
      offerSignature: OFFER_SIGNATURE,
      lenderAttributionSignature: PARTNER_SIGNATURE,
    });

    expect(api.requests).toHaveLength(1);
    expect(api.requests[0]).toMatchObject({
      url: "https://api.test/sdk/v1/offers",
      method: "POST",
      body: {
        chainId: CHAIN_ID,
        offer: toLenderOfferApiItem(offer),
        offerSignature: OFFER_SIGNATURE,
        lenderAttributionSignature: PARTNER_SIGNATURE,
      },
    });
    expect(published.lenderPartnerId).toBe(PARTNER_ID);
    expect(published.lenderAttributionSignature).toBe(PARTNER_SIGNATURE);
  });

  it("fails when the API stores an offer without its partner signature", async () => {
    const offer = createOffer();
    const api = createFakeApi(() => ({ offer: toApiItem(offer) }));
    const client = createTestClient(createFakeChain(), api);

    await expect(
      client.offers.publishOffer({
        offer,
        offerSignature: OFFER_SIGNATURE,
        lenderAttributionSignature: PARTNER_SIGNATURE,
      })
    ).rejects.toMatchObject({ code: P2pEvmErrorCode.INVALID_ATTRIBUTION });
  });

  it("refuses a partner signature for an offer whose salt names no partner", async () => {
    const api = createFakeApi(() => ({}));
    const client = createTestClient(createFakeChain(), api);

    await expect(
      client.offers.publishOffer({
        offer: createOffer(0),
        offerSignature: OFFER_SIGNATURE,
        lenderAttributionSignature: PARTNER_SIGNATURE,
      })
    ).rejects.toMatchObject({ code: P2pEvmErrorCode.PARTNER_MISMATCH });
    expect(api.requests).toHaveLength(0);
  });

  it("lists offers and filters by market", async () => {
    const offer = createOffer();
    const api = createFakeApi(() => ({
      complete: true,
      offers: [toApiItem(offer, PARTNER_SIGNATURE)],
    }));
    const client = createTestClient(createFakeChain(), api);

    const book = await client.offers.listOffers({ collection: COLLECTION });

    expect(api.requests[0]?.url).toBe(
      `https://api.test/sdk/v1/offers?chainId=${CHAIN_ID}&collection=${COLLECTION}`
    );
    expect(book.complete).toBe(true);
    expect(book.offers[0]?.offer).toEqual(offer);
  });

  it("rejects a listed offer whose terms do not match its hash", async () => {
    const offer = createOffer();
    const tampered = {
      ...toApiItem(offer),
      signedOffer: toLenderOfferApiItem({ ...offer, aprBps: 9_999 }),
    };
    const api = createFakeApi(() => ({ complete: true, offers: [tampered] }));
    const client = createTestClient(createFakeChain(), api);

    await expect(client.offers.listOffers()).rejects.toMatchObject({
      code: P2pEvmErrorCode.OFFER_HASH_MISMATCH,
    });
  });

  it("requires an API key for the order book", async () => {
    const client = createTestClient();

    await expect(client.offers.listOffers()).rejects.toMatchObject({
      code: P2pEvmErrorCode.VALIDATION_ERROR,
    });
  });

  it("verifies an offer against LoanCore and the fee splitter", async () => {
    const offer = createOffer();
    const client = createTestClient(
      createFakeChain({
        reads: {
          isFillableSigned: () => true,
          lenderAttributionPartner: () => [PARTNER_ID, 2_000],
        },
      })
    );

    const verification = await client.offers.verifyOffer({
      offerHash: hashLenderOffer(CHAIN_ID, LOAN_CORE, offer),
      offer,
      offerSignature: OFFER_SIGNATURE,
      lenderPartnerId: PARTNER_ID,
      lenderAttributionSignature: PARTNER_SIGNATURE,
    });

    expect(verification).toEqual({
      fillable: true,
      lenderPartner: { partnerId: PARTNER_ID, shareBps: 2_000 },
    });
  });
});
