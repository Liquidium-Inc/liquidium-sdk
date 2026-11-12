import { decodeAbiParameters, recoverTypedDataAddress } from "viem";
import { describe, expect, it } from "vitest";
import {
  BORROWER,
  CHAIN_ID,
  createFakeChain,
  createOffer,
  createTestClient,
  FEE_SPLITTER,
  LOAN_CORE,
  PARTNER_ID,
  partnerSigner,
} from "../../_internal/test-fixtures";
import { P2pEvmErrorCode } from "../../core/errors";
import {
  getBorrowerAttributionTypedData,
  getLenderAttributionTypedData,
  hashLenderOffer,
} from "../../core/typed-data";

const SECONDS_PER_MILLISECOND = 1 / 1_000;

describe("AttributionModule", () => {
  it("signs a lender attribution over the offer hash for the live fee splitter", async () => {
    const client = createTestClient();
    const offer = createOffer();

    const signature = await client.attribution.signLenderAttribution({
      signer: partnerSigner,
      offer,
    });

    const recovered = await recoverTypedDataAddress({
      ...getLenderAttributionTypedData(CHAIN_ID, FEE_SPLITTER, {
        partnerId: PARTNER_ID,
        offerHash: hashLenderOffer(CHAIN_ID, LOAN_CORE, offer),
      }),
      signature,
    });
    expect(recovered).toBe(partnerSigner.address);
  });

  it("refuses to sign for an offer whose salt names another partner", async () => {
    const client = createTestClient();

    await expect(
      client.attribution.signLenderAttribution({
        signer: partnerSigner,
        offer: createOffer(PARTNER_ID + 1),
      })
    ).rejects.toMatchObject({ code: P2pEvmErrorCode.PARTNER_MISMATCH });
  });

  it("refuses to sign when LoanCore's fee recipient is not a splitter", async () => {
    const chain = createFakeChain();
    delete chain.reads.loanCore;
    const client = createTestClient(chain);

    await expect(
      client.attribution.signLenderAttribution({
        signer: partnerSigner,
        offer: createOffer(),
      })
    ).rejects.toMatchObject({
      code: P2pEvmErrorCode.FEE_SPLITTER_NOT_CONFIGURED,
    });
  });

  it("refuses a splitter that serves a different LoanCore", async () => {
    const client = createTestClient(
      createFakeChain({ reads: { loanCore: () => FEE_SPLITTER } })
    );

    await expect(
      client.attribution.signLenderAttribution({
        signer: partnerSigner,
        offer: createOffer(),
      })
    ).rejects.toMatchObject({
      code: P2pEvmErrorCode.FEE_SPLITTER_NOT_CONFIGURED,
    });
  });

  it("signs a borrower attribution that expires after ten minutes by default", async () => {
    const client = createTestClient();
    const offerHash = hashLenderOffer(CHAIN_ID, LOAN_CORE, createOffer());
    const before = Math.floor(Date.now() * SECONDS_PER_MILLISECOND);

    const attribution = await client.attribution.signBorrowerAttribution({
      signer: partnerSigner,
      offerHash,
      borrower: BORROWER,
    });

    expect(attribution.partnerId).toBe(PARTNER_ID);
    expect(Number(attribution.deadline)).toBeGreaterThanOrEqual(before + 600);
    expect(Number(attribution.deadline)).toBeLessThanOrEqual(before + 601);
    const recovered = await recoverTypedDataAddress({
      ...getBorrowerAttributionTypedData(CHAIN_ID, FEE_SPLITTER, {
        partnerId: PARTNER_ID,
        offerHash,
        borrower: BORROWER,
        deadline: attribution.deadline,
      }),
      signature: attribution.signature,
    });
    expect(recovered).toBe(partnerSigner.address);
  });

  it("encodes nothing when neither side has a partner", () => {
    const client = createTestClient();

    expect(
      client.attribution.encode({ offer: createOffer(0) })
    ).toBeUndefined();
  });

  it("encodes an empty borrower half when only the lender has a partner", () => {
    const client = createTestClient();

    const encoded = client.attribution.encode({
      offer: createOffer(),
      lenderAttributionSignature: `0x${"11".repeat(65)}`,
    });

    expect(encoded).toBeDefined();
    const [borrower, lender] = decodeAbiParameters(
      [{ type: "bytes" }, { type: "bytes" }],
      encoded ?? "0x"
    );
    expect(borrower).toBe("0x");
    expect(lender).not.toBe("0x");
  });

  it("reports nobody when the splitter would not credit a lender attribution", async () => {
    const client = createTestClient(
      createFakeChain({ reads: { lenderAttributionPartner: () => [0, 0] } })
    );

    await expect(
      client.attribution.verifyLenderAttribution(
        createOffer(),
        `0x${"11".repeat(65)}`
      )
    ).resolves.toBeNull();
  });

  it("maps a rejected borrower attribution to INVALID_ATTRIBUTION", async () => {
    const client = createTestClient();

    await expect(
      client.attribution.verifyBorrowerAttribution({
        offerHash: hashLenderOffer(CHAIN_ID, LOAN_CORE, createOffer()),
        borrower: BORROWER,
        attribution: {
          partnerId: PARTNER_ID,
          deadline: 1n,
          signature: `0x${"11".repeat(65)}`,
        },
      })
    ).rejects.toMatchObject({ code: P2pEvmErrorCode.INVALID_ATTRIBUTION });
  });
});
