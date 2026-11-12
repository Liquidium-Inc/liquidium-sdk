import { type Address, getAbiItem } from "viem";
import type { ProtocolContext } from "../../core/protocol-context";
import { feeSplitterAbi } from "../../generated/fee-splitter";
import { loanCoreAbi } from "../../generated/loan-core";
import type {
  AuditLenderAttributionRequest,
  ClaimCall,
  LenderAttributionAudit,
  LenderAttributionOutcome,
  LoanShare,
  Partner,
  RevenueDeployment,
  SettleInterestCall,
} from "./types";

/**
 * Partner revenue, read straight from the fee splitter. Nothing here goes through
 * Liquidium's API: it is the partner's independent view of what it is owed.
 */
export class RevenueModule {
  constructor(private readonly context: ProtocolContext) {}

  /**
   * Resolves and cross-checks the contracts behind this client. Run it once when setting up
   * an integration, and compare the addresses with the ones Liquidium gave you.
   */
  async getDeployment(): Promise<RevenueDeployment> {
    await this.context.assertChain();
    const feeSplitterAddress = await this.context.getFeeSplitterAddress();
    const feeSplitterOwner = await this.context.publicClient.readContract({
      address: feeSplitterAddress,
      abi: feeSplitterAbi,
      functionName: "owner",
    });

    return {
      chainId: this.context.chainId,
      loanCoreAddress: this.context.loanCoreAddress,
      feeSplitterAddress,
      feeSplitterOwner,
    };
  }

  /**
   * Reads a partner's registration.
   *
   * @param partnerId - Defaults to the client's `partnerId`.
   */
  async getPartner(partnerId?: number): Promise<Partner> {
    const id = this.context.requirePartnerId(partnerId);
    const feeSplitterAddress = await this.context.getFeeSplitterAddress();
    const [payout, shareBps, active] =
      await this.context.publicClient.readContract({
        address: feeSplitterAddress,
        abi: feeSplitterAbi,
        functionName: "partners",
        args: [id],
      });

    return { partnerId: id, payout, shareBps, active };
  }

  /**
   * Whether `signer` is registered to sign attributions for the partner. Check this after
   * Liquidium registers your signer, before going live.
   *
   * @param partnerId - Defaults to the client's `partnerId`.
   */
  async isRegisteredSigner(
    signer: Address,
    partnerId?: number
  ): Promise<boolean> {
    const id = this.context.requirePartnerId(partnerId);
    const feeSplitterAddress = await this.context.getFeeSplitterAddress();
    const registeredPartnerId = await this.context.publicClient.readContract({
      address: feeSplitterAddress,
      abi: feeSplitterAbi,
      functionName: "partnerOfSigner",
      args: [signer],
    });

    return registeredPartnerId === id;
  }

  /**
   * The partner's claimable balance of one asset.
   *
   * @param partnerId - Defaults to the client's `partnerId`.
   */
  async getClaimable(asset: Address, partnerId?: number): Promise<bigint> {
    const id = this.context.requirePartnerId(partnerId);
    const feeSplitterAddress = await this.context.getFeeSplitterAddress();
    return await this.context.publicClient.readContract({
      address: feeSplitterAddress,
      abi: feeSplitterAbi,
      functionName: "claimable",
      args: [id, asset],
    });
  }

  /** The interest-fee share reserved on one loan, and for which partner. */
  async getLoanShare(loanId: bigint): Promise<LoanShare> {
    const feeSplitterAddress = await this.context.getFeeSplitterAddress();
    const [partnerId, pendingInterestShare] =
      await this.context.publicClient.readContract({
        address: feeSplitterAddress,
        abi: feeSplitterAbi,
        functionName: "loanShare",
        args: [loanId],
      });

    return { partnerId, pendingInterestShare };
  }

  /**
   * Builds the call that settles reserved interest shares into claimable balances. A repaid
   * loan credits its partner; a loan that matured unpaid releases its reservation. Loans that
   * are still running are left alone. Anyone may send it.
   */
  async prepareSettleInterest(
    loanIds: readonly bigint[]
  ): Promise<SettleInterestCall> {
    return {
      address: await this.context.getFeeSplitterAddress(),
      abi: feeSplitterAbi,
      functionName: "settleInterest",
      args: [loanIds],
    };
  }

  /**
   * Builds the call that pays a partner's whole claimable balance of one asset to its payout
   * address. Anyone may send it.
   *
   * @param partnerId - Defaults to the client's `partnerId`.
   */
  async prepareClaim(asset: Address, partnerId?: number): Promise<ClaimCall> {
    return {
      address: await this.context.getFeeSplitterAddress(),
      abi: feeSplitterAbi,
      functionName: "claim",
      args: [this.context.requirePartnerId(partnerId), asset],
    };
  }

  /**
   * Checks, from chain events alone, that every loan funded by your lenders' offers reserved
   * your interest-fee share. Whoever fills an offer has to forward your signature; this is how
   * you detect a fill that left it out. Run it on a schedule over recent blocks.
   *
   * It reads the fee splitter LoanCore pays today. Loans originated while LoanCore paid a
   * different splitter report as `omitted`.
   *
   * @returns One entry per loan originated from the given offers, oldest first.
   */
  async auditLenderAttribution(
    request: AuditLenderAttributionRequest
  ): Promise<LenderAttributionAudit[]> {
    if (request.offerHashes.length === 0) {
      return [];
    }
    const { publicClient, loanCoreAddress } = this.context;
    const feeSplitterAddress = await this.context.getFeeSplitterAddress();
    const toBlock: bigint | "latest" = request.toBlock ?? "latest";
    const range = { fromBlock: request.fromBlock, toBlock };

    const originations = await publicClient.getLogs({
      address: loanCoreAddress,
      event: loanOriginatedEvent,
      args: { offerHash: [...request.offerHashes] },
      strict: true,
      ...range,
    });
    if (originations.length === 0) {
      return [];
    }

    const loanIds = originations.map((log) => log.args.loanId);
    const [reserved, skipped] = await Promise.all([
      publicClient.getLogs({
        address: feeSplitterAddress,
        event: interestShareReservedEvent,
        args: { loanId: loanIds },
        strict: true,
        ...range,
      }),
      publicClient.getLogs({
        address: feeSplitterAddress,
        event: lenderAttributionSkippedEvent,
        args: { loanId: loanIds },
        strict: true,
        ...range,
      }),
    ]);
    const reservedByLoanId = new Map(
      reserved.map((log) => [log.args.loanId, log.args.pendingInterestShare])
    );
    const skippedLoanIds = new Set(skipped.map((log) => log.args.loanId));

    const audits: LenderAttributionAudit[] = [];
    for (const log of originations) {
      // Only mined logs are requested, so these are always set; the check narrows viem's type.
      if (log.transactionHash === null || log.blockNumber === null) {
        continue;
      }
      const reservedInterestShare = reservedByLoanId.get(log.args.loanId);
      let outcome: LenderAttributionOutcome = "omitted";
      if (reservedInterestShare !== undefined) {
        outcome = "credited";
      } else if (skippedLoanIds.has(log.args.loanId)) {
        outcome = "skipped";
      }

      audits.push({
        offerHash: log.args.offerHash,
        loanId: log.args.loanId,
        outcome,
        reservedInterestShare: reservedInterestShare ?? 0n,
        transactionHash: log.transactionHash,
        blockNumber: log.blockNumber,
      });
    }

    return audits;
  }
}

const loanOriginatedEvent = getAbiItem({
  abi: loanCoreAbi,
  name: "LoanOriginated",
});
const interestShareReservedEvent = getAbiItem({
  abi: feeSplitterAbi,
  name: "InterestShareReserved",
});
const lenderAttributionSkippedEvent = getAbiItem({
  abi: feeSplitterAbi,
  name: "LenderAttributionSkipped",
});
