import type { Hex } from "viem";
import { describe, expect, it } from "vitest";
import {
  ASSET,
  CHAIN_ID,
  createFakeChain,
  createTestClient,
  FEE_SPLITTER,
  LOAN_CORE,
  PARTNER_ID,
  partnerSigner,
} from "../../_internal/test-fixtures";

const OWNER = "0x6000000000000000000000000000000000000006";
const PAYOUT = "0x7000000000000000000000000000000000000007";

function hash(byte: string): Hex {
  return `0x${byte.repeat(32)}`;
}

describe("RevenueModule", () => {
  it("reports the deployment as the chain describes it", async () => {
    const client = createTestClient(
      createFakeChain({ reads: { owner: () => OWNER } })
    );

    await expect(client.revenue.getDeployment()).resolves.toEqual({
      chainId: CHAIN_ID,
      loanCoreAddress: LOAN_CORE,
      feeSplitterAddress: FEE_SPLITTER,
      feeSplitterOwner: OWNER,
    });
  });

  it("reads the partner registration, signer and balances", async () => {
    const client = createTestClient(
      createFakeChain({
        reads: {
          partners: () => [PAYOUT, 2_000, true],
          partnerOfSigner: () => PARTNER_ID,
          claimable: () => 123n,
          loanShare: () => [PARTNER_ID, 45n],
        },
      })
    );

    await expect(client.revenue.getPartner()).resolves.toEqual({
      partnerId: PARTNER_ID,
      payout: PAYOUT,
      shareBps: 2_000,
      active: true,
    });
    await expect(
      client.revenue.isRegisteredSigner(partnerSigner.address)
    ).resolves.toBe(true);
    await expect(
      client.revenue.isRegisteredSigner(partnerSigner.address, PARTNER_ID + 1)
    ).resolves.toBe(false);
    await expect(client.revenue.getClaimable(ASSET)).resolves.toBe(123n);
    await expect(client.revenue.getLoanShare(9n)).resolves.toEqual({
      partnerId: PARTNER_ID,
      pendingInterestShare: 45n,
    });
  });

  it("builds settle and claim calls against the fee splitter", async () => {
    const client = createTestClient();

    const settle = await client.revenue.prepareSettleInterest([1n, 2n]);
    const claim = await client.revenue.prepareClaim(ASSET);

    expect(settle).toMatchObject({
      address: FEE_SPLITTER,
      functionName: "settleInterest",
      args: [[1n, 2n]],
    });
    expect(claim).toMatchObject({
      address: FEE_SPLITTER,
      functionName: "claim",
      args: [PARTNER_ID, ASSET],
    });
  });

  it("classifies each loan as credited, skipped or omitted", async () => {
    const origination = (loanId: bigint, byte: string) => ({
      args: { loanId, offerHash: hash(byte) },
      transactionHash: hash(byte),
      blockNumber: 100n + loanId,
    });
    const client = createTestClient(
      createFakeChain({
        logs: {
          LoanOriginated: [
            origination(1n, "a1"),
            origination(2n, "a2"),
            origination(3n, "a3"),
          ],
          InterestShareReserved: [
            {
              args: { loanId: 1n, pendingInterestShare: 77n },
              transactionHash: hash("a1"),
              blockNumber: 101n,
            },
          ],
          LenderAttributionSkipped: [
            {
              args: { loanId: 2n },
              transactionHash: hash("a2"),
              blockNumber: 102n,
            },
          ],
        },
      })
    );

    const audits = await client.revenue.auditLenderAttribution({
      offerHashes: [hash("a1"), hash("a2"), hash("a3")],
      fromBlock: 0n,
    });

    expect(audits).toEqual([
      {
        offerHash: hash("a1"),
        loanId: 1n,
        outcome: "credited",
        reservedInterestShare: 77n,
        transactionHash: hash("a1"),
        blockNumber: 101n,
      },
      {
        offerHash: hash("a2"),
        loanId: 2n,
        outcome: "skipped",
        reservedInterestShare: 0n,
        transactionHash: hash("a2"),
        blockNumber: 102n,
      },
      {
        offerHash: hash("a3"),
        loanId: 3n,
        outcome: "omitted",
        reservedInterestShare: 0n,
        transactionHash: hash("a3"),
        blockNumber: 103n,
      },
    ]);
  });

  it("returns nothing without offers to audit", async () => {
    const client = createTestClient();

    await expect(
      client.revenue.auditLenderAttribution({ offerHashes: [], fromBlock: 0n })
    ).resolves.toEqual([]);
  });
});
