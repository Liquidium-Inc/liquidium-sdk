import {
  encodeAbiParameters,
  erc721Abi,
  getAbiItem,
  type Hex,
  isAddressEqual,
  type Log,
  parseEventLogs,
  recoverTypedDataAddress,
  zeroAddress,
} from "viem";
import { P2pEvmError, P2pEvmErrorCode } from "../../core/errors";
import type { ProtocolContext } from "../../core/protocol-context";
import { SdkApiPath } from "../../core/sdk-api-paths";
import type { ApiClient } from "../../core/transports/api-client";
import { getValuationTypedData } from "../../core/typed-data";
import { loanCoreAbi } from "../../generated/loan-core";
import type { AttributionModule } from "../attribution";
import { toLoan } from "./mappers";
import type {
  GetValuationRequest,
  Loan,
  LoanOrigination,
  PrepareBorrowRequest,
  PreparedBorrow,
  PreparedRepay,
  SignedValuation,
} from "./types";

interface CreateValuationApiBody {
  chainId: number;
  collection: string;
  asset: string;
}

interface CreateValuationApiResponse {
  valuation: {
    collection: `0x${string}`;
    asset: `0x${string}`;
    value: string;
    epoch: string;
    validUntil: string;
  };
  signature: Hex;
}

const MILLISECONDS_PER_SECOND = 1_000;
const borrowInputs = getAbiItem({
  abi: loanCoreAbi,
  name: "borrowSigned",
}).inputs;
// The payload LoanCore decodes from the NFT transfer: offer, offer signature, valuation,
// valuation signature, and optionally the attribution as a fifth field.
const borrowPayloadInputs = [
  borrowInputs[0],
  borrowInputs[1],
  borrowInputs[3],
  borrowInputs[4],
] as const;

/** Loans: build the borrow and repay transactions, and read loans back from the chain. */
export class LoansModule {
  constructor(
    private readonly context: ProtocolContext,
    private readonly apiClient: ApiClient | undefined,
    private readonly attribution: AttributionModule
  ) {}

  /**
   * Fetches the oracle's signed valuation for a market and checks it: the signature must
   * recover to LoanCore's own oracle signer, for the market that was asked for.
   *
   * @throws {@link P2pEvmError} with `INVALID_VALUATION` when the check fails.
   */
  async getValuation(request: GetValuationRequest): Promise<SignedValuation> {
    if (!this.apiClient) {
      throw new P2pEvmError(
        P2pEvmErrorCode.VALIDATION_ERROR,
        "Valuations require an `apiKey` on the client"
      );
    }

    const response = await this.apiClient.post<
      CreateValuationApiResponse,
      CreateValuationApiBody
    >(SdkApiPath.valuations, {
      chainId: this.context.chainId,
      collection: request.collection,
      asset: request.asset,
    });
    const signed: SignedValuation = {
      valuation: {
        collection: response.valuation.collection,
        asset: response.valuation.asset,
        value: BigInt(response.valuation.value),
        epoch: BigInt(response.valuation.epoch),
        validUntil: BigInt(response.valuation.validUntil),
      },
      signature: response.signature,
    };
    await this.assertValuation(signed, request);
    return signed;
  }

  /**
   * Builds the transaction that fills an offer. It forwards the lender's partner signature
   * when the offer has one, so that partner is credited whoever the borrower came through,
   * and adds your borrower attribution when you pass one.
   *
   * The borrower sends an NFT transfer straight to LoanCore, which originates the loan in the
   * same transaction. Simulate the call before sending: an offer can be filled or cancelled
   * at any time, and a rejected borrower attribution reverts the borrow.
   */
  async prepareBorrow(request: PrepareBorrowRequest): Promise<PreparedBorrow> {
    await this.context.assertChain();
    const { offer, offerSignature, offerHash } = request.offer;
    const signedValuation =
      request.valuation ??
      (await this.getValuation({
        collection: offer.collection,
        asset: offer.asset,
      }));
    if (request.valuation) {
      await this.assertValuation(request.valuation, offer);
    }
    if (
      signedValuation.valuation.validUntil <=
      BigInt(Math.floor(Date.now() / MILLISECONDS_PER_SECOND))
    ) {
      throw new P2pEvmError(
        P2pEvmErrorCode.INVALID_VALUATION,
        "The valuation has expired. Fetch a new one"
      );
    }

    const attribution = this.attribution.encode({
      offer,
      lenderAttributionSignature: request.offer.lenderAttributionSignature,
      borrowerAttribution: request.borrowerAttribution,
    });
    const data = attribution
      ? encodeAbiParameters(
          [...borrowPayloadInputs, { type: "bytes" }],
          [
            offer,
            offerSignature,
            signedValuation.valuation,
            signedValuation.signature,
            attribution,
          ]
        )
      : encodeAbiParameters(borrowPayloadInputs, [
          offer,
          offerSignature,
          signedValuation.valuation,
          signedValuation.signature,
        ]);

    return {
      call: {
        address: offer.collection,
        abi: erc721Abi,
        functionName: "safeTransferFrom",
        args: [
          request.borrower,
          this.context.loanCoreAddress,
          request.tokenId,
          data,
        ],
      },
      offerHash,
      attribution,
      validUntil: signedValuation.valuation.validUntil,
    };
  }

  /**
   * Finds the loan a borrow transaction originated, from its receipt logs. Only an event from
   * this client's LoanCore counts.
   *
   * @returns The origination, or `null` when the logs contain none for `offerHash`.
   */
  findOrigination(logs: Log[], offerHash: Hex): LoanOrigination | null {
    const events = parseEventLogs({
      abi: loanCoreAbi,
      eventName: "LoanOriginated",
      logs: logs.filter((log) =>
        isAddressEqual(log.address, this.context.loanCoreAddress)
      ),
    });
    const event = events.find(
      ({ args }) => args.offerHash.toLowerCase() === offerHash.toLowerCase()
    )?.args;
    if (!event) {
      return null;
    }

    return {
      loanId: event.loanId,
      offerHash: event.offerHash,
      borrower: event.borrower,
      lender: event.lender,
      collection: event.collection,
      tokenId: event.tokenId,
      asset: event.asset,
      principal: event.principal,
      repayment: event.repayment,
      maturity: event.maturity,
      activationFee: event.activationFee,
    };
  }

  /**
   * Reads a loan from LoanCore.
   *
   * @throws {@link P2pEvmError} with `NOT_FOUND` when no such loan exists.
   */
  async getLoan(loanId: bigint): Promise<Loan> {
    const loan = await this.context.publicClient.readContract({
      address: this.context.loanCoreAddress,
      abi: loanCoreAbi,
      functionName: "getLoan",
      args: [loanId],
    });
    if (isAddressEqual(loan.borrower, zeroAddress)) {
      throw new P2pEvmError(
        P2pEvmErrorCode.NOT_FOUND,
        `Loan ${loanId} does not exist`
      );
    }
    return toLoan(loanId, loan);
  }

  /**
   * Builds the repayment transaction for a loan. Anyone may repay; the payer needs
   * `repaymentOwed` of the loan asset approved to LoanCore.
   */
  async prepareRepay(loanId: bigint): Promise<PreparedRepay> {
    const loan = await this.getLoan(loanId);
    if (loan.status !== "active") {
      throw new P2pEvmError(
        P2pEvmErrorCode.VALIDATION_ERROR,
        `Loan ${loanId} is ${loan.status} and cannot be repaid`
      );
    }
    const repaymentOwed = await this.context.publicClient.readContract({
      address: this.context.loanCoreAddress,
      abi: loanCoreAbi,
      functionName: "repaymentOwed",
      args: [loanId],
    });

    return {
      call: {
        address: this.context.loanCoreAddress,
        abi: loanCoreAbi,
        functionName: "repay",
        args: [loanId],
      },
      asset: loan.asset,
      repaymentOwed,
    };
  }

  private async assertValuation(
    signed: SignedValuation,
    market: GetValuationRequest
  ): Promise<void> {
    if (
      !isAddressEqual(signed.valuation.collection, market.collection) ||
      !isAddressEqual(signed.valuation.asset, market.asset)
    ) {
      throw new P2pEvmError(
        P2pEvmErrorCode.INVALID_VALUATION,
        "The valuation is for a different collection or asset"
      );
    }

    const [oracleSigner, recovered] = await Promise.all([
      this.context.publicClient.readContract({
        address: this.context.loanCoreAddress,
        abi: loanCoreAbi,
        functionName: "oracleSigner",
      }),
      recoverTypedDataAddress({
        ...getValuationTypedData(
          this.context.chainId,
          this.context.loanCoreAddress,
          signed.valuation
        ),
        signature: signed.signature,
      }).catch(() => zeroAddress),
    ]);
    if (!isAddressEqual(recovered, oracleSigner)) {
      throw new P2pEvmError(
        P2pEvmErrorCode.INVALID_VALUATION,
        "The valuation is not signed by LoanCore's oracle signer"
      );
    }
  }
}
