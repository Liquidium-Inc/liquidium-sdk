import type { Hex } from "viem";
import { P2pEvmError, P2pEvmErrorCode } from "../../core/errors";
import type { ProtocolContext } from "../../core/protocol-context";
import {
  getBorrowerAttributionTypedData,
  getLenderAttributionTypedData,
  getLenderPartnerId,
  hashLenderOffer,
  NO_PARTNER_ID,
} from "../../core/typed-data";
import type { LenderOffer } from "../../core/types";
import { feeSplitterAbi } from "../../generated/fee-splitter";
import {
  encodeAttributionParts,
  encodeBorrowerAttribution,
  encodeLenderAttribution,
} from "./encoding";
import type {
  AttributedPartner,
  EncodeAttributionRequest,
  SignBorrowerAttributionRequest,
  SignedBorrowerAttribution,
  SignLenderAttributionRequest,
  VerifyBorrowerAttributionRequest,
} from "./types";

const MILLISECONDS_PER_SECOND = 1_000;
const DEFAULT_BORROWER_ATTRIBUTION_SECONDS = 600;

/**
 * Partner attribution: the signatures that tell the fee splitter which partner brought each
 * side of a loan. Signing belongs on the partner's backend, next to its signer key.
 */
export class AttributionModule {
  constructor(private readonly context: ProtocolContext) {}

  /**
   * Signs that `offer` was created through your integration. Publish the signature with the
   * offer; it earns your share of Liquidium's interest fee on every loan the offer funds.
   *
   * Sign only for offers your own app created: the signature is your claim to the revenue.
   *
   * @returns The 65-byte signature to publish alongside the offer.
   */
  async signLenderAttribution(
    request: SignLenderAttributionRequest
  ): Promise<Hex> {
    const partnerId = this.context.requirePartnerId(request.partnerId);
    const namedPartnerId = getLenderPartnerId(request.offer.salt);
    if (namedPartnerId !== partnerId) {
      throw new P2pEvmError(
        P2pEvmErrorCode.PARTNER_MISMATCH,
        `Offer salt names partner ${namedPartnerId}, not ${partnerId}. Build the offer with offers.prepareOffer so the lender signs your partner id`
      );
    }

    const feeSplitterAddress = await this.context.getFeeSplitterAddress();
    return await request.signer.signTypedData(
      getLenderAttributionTypedData(this.context.chainId, feeSplitterAddress, {
        partnerId,
        offerHash: hashLenderOffer(
          this.context.chainId,
          this.context.loanCoreAddress,
          request.offer
        ),
      })
    );
  }

  /**
   * Signs that `borrower` is filling an offer through your integration. It earns your share
   * of the activation fee on that one loan. The signature is bound to the offer, the borrower
   * and a deadline, so it cannot be reused.
   *
   * Sign only for borrowers in your own app's session.
   */
  async signBorrowerAttribution(
    request: SignBorrowerAttributionRequest
  ): Promise<SignedBorrowerAttribution> {
    const partnerId = this.context.requirePartnerId(request.partnerId);
    const validForSeconds =
      request.validForSeconds ?? DEFAULT_BORROWER_ATTRIBUTION_SECONDS;
    if (!Number.isInteger(validForSeconds) || validForSeconds <= 0) {
      throw new P2pEvmError(
        P2pEvmErrorCode.VALIDATION_ERROR,
        "validForSeconds must be a positive integer"
      );
    }
    const deadline = BigInt(
      Math.floor(Date.now() / MILLISECONDS_PER_SECOND) + validForSeconds
    );

    const feeSplitterAddress = await this.context.getFeeSplitterAddress();
    const signature = await request.signer.signTypedData(
      getBorrowerAttributionTypedData(
        this.context.chainId,
        feeSplitterAddress,
        {
          partnerId,
          offerHash: request.offerHash,
          borrower: request.borrower,
          deadline,
        }
      )
    );

    return { partnerId, deadline, signature };
  }

  /**
   * Builds the attribution a borrow transaction carries.
   *
   * @returns The encoded attribution, or `undefined` when neither side has a partner.
   */
  encode(request: EncodeAttributionRequest): Hex | undefined {
    return encodeAttributionParts(
      request.borrowerAttribution
        ? encodeBorrowerAttribution(request.borrowerAttribution)
        : undefined,
      request.lenderAttributionSignature
        ? encodeLenderAttribution(
            request.offer,
            request.lenderAttributionSignature
          )
        : undefined
    );
  }

  /**
   * Asks the fee splitter which partner it would credit for the lender side of an offer.
   *
   * @returns The credited partner, or `null` when the splitter would credit nobody: wrong or
   * unregistered signer, inactive partner, or a salt that names no partner.
   */
  async verifyLenderAttribution(
    offer: LenderOffer,
    signature: Hex
  ): Promise<AttributedPartner | null> {
    const feeSplitterAddress = await this.context.getFeeSplitterAddress();
    const [partnerId, shareBps] = await this.context.publicClient.readContract({
      address: feeSplitterAddress,
      abi: feeSplitterAbi,
      functionName: "lenderAttributionPartner",
      args: [
        hashLenderOffer(
          this.context.chainId,
          this.context.loanCoreAddress,
          offer
        ),
        encodeLenderAttribution(offer, signature),
      ],
    });

    if (partnerId === NO_PARTNER_ID) {
      return null;
    }
    return { partnerId, shareBps };
  }

  /**
   * Asks the fee splitter whether it would accept a borrower attribution right now. A borrow
   * carrying one it rejects reverts, so check before asking the borrower to sign.
   *
   * @throws {@link P2pEvmError} with `INVALID_ATTRIBUTION` when the splitter rejects it.
   */
  async verifyBorrowerAttribution(
    request: VerifyBorrowerAttributionRequest
  ): Promise<AttributedPartner> {
    const feeSplitterAddress = await this.context.getFeeSplitterAddress();
    try {
      const [partnerId, shareBps] =
        await this.context.publicClient.readContract({
          address: feeSplitterAddress,
          abi: feeSplitterAbi,
          functionName: "validateBorrowerAttribution",
          args: [
            request.offerHash,
            request.borrower,
            encodeBorrowerAttribution(request.attribution),
          ],
        });
      return { partnerId, shareBps };
    } catch (error) {
      throw new P2pEvmError(
        P2pEvmErrorCode.INVALID_ATTRIBUTION,
        "The fee splitter rejects this borrower attribution: it is expired, signed by an unregistered key, or names an inactive partner",
        error
      );
    }
  }
}
