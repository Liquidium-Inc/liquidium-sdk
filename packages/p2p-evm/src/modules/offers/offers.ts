import type { Hex } from "viem";
import { P2pEvmError, P2pEvmErrorCode } from "../../core/errors";
import type { ProtocolContext } from "../../core/protocol-context";
import { buildOffersPath, SdkApiPath } from "../../core/sdk-api-paths";
import type { ApiClient } from "../../core/transports/api-client";
import {
  generateLenderOfferSalt,
  getLenderOfferTypedData,
  getLenderPartnerId,
  hashLenderOffer,
  NO_PARTNER_ID,
} from "../../core/typed-data";
import type { LenderOffer } from "../../core/types";
import { loanCoreAbi } from "../../generated/loan-core";
import type { AttributionModule } from "../attribution";
import {
  type LenderOfferApiItem,
  type PublishedOfferApiItem,
  toLenderOfferApiItem,
  toPublishedOffer,
} from "./mappers";
import type {
  ListOffersFilters,
  OfferBook,
  OfferVerification,
  PreparedOffer,
  PrepareOfferRequest,
  PublishedOffer,
  PublishOfferRequest,
} from "./types";

interface PublishOfferApiBody {
  chainId: number;
  offer: LenderOfferApiItem;
  offerSignature: Hex;
  lenderAttributionSignature?: Hex;
}

interface PublishOfferApiResponse {
  offer: PublishedOfferApiItem;
}

interface ListOffersApiResponse {
  complete: boolean;
  offers: PublishedOfferApiItem[];
}

/** Lender offers: build, publish to Liquidium's shared order book, list and verify. */
export class OffersModule {
  constructor(
    private readonly context: ProtocolContext,
    private readonly apiClient: ApiClient | undefined,
    private readonly attribution: AttributionModule
  ) {}

  private requireApi(): ApiClient {
    if (!this.apiClient) {
      throw new P2pEvmError(
        P2pEvmErrorCode.VALIDATION_ERROR,
        "The order book requires an `apiKey` on the client"
      );
    }

    return this.apiClient;
  }

  /**
   * Builds an offer for a lender to sign. The nonces are read from LoanCore, and the salt
   * names your partner id, so the lender's signature commits to it.
   *
   * @returns The offer, its typed data for the lender's wallet, and its hash.
   */
  async prepareOffer(request: PrepareOfferRequest): Promise<PreparedOffer> {
    const partnerId = this.context.requirePartnerId(request.partnerId);
    await this.context.assertChain();
    const { publicClient, loanCoreAddress, chainId } = this.context;

    // These are revocation epochs. Read them together, immediately before signing, so a
    // cancellation in between cannot revive stale terms.
    const [nonce, collectionNonce, assetNonce] = await Promise.all([
      publicClient.readContract({
        address: loanCoreAddress,
        abi: loanCoreAbi,
        functionName: "lenderNonce",
        args: [request.lender],
      }),
      publicClient.readContract({
        address: loanCoreAddress,
        abi: loanCoreAbi,
        functionName: "collectionNonce",
        args: [request.terms.collection],
      }),
      publicClient.readContract({
        address: loanCoreAddress,
        abi: loanCoreAbi,
        functionName: "assetNonce",
        args: [request.terms.asset],
      }),
    ]);

    const offer: LenderOffer = {
      lender: request.lender,
      collection: request.terms.collection,
      asset: request.terms.asset,
      maxPrincipal: request.terms.maxPrincipal,
      maxLtvBps: request.terms.maxLtvBps,
      aprBps: request.terms.aprBps,
      duration: request.terms.duration,
      expiry: request.terms.expiry,
      nonce,
      collectionNonce,
      assetNonce,
      salt: generateLenderOfferSalt(partnerId),
    };

    return {
      offer,
      typedData: getLenderOfferTypedData(chainId, loanCoreAddress, offer),
      offerHash: hashLenderOffer(chainId, loanCoreAddress, offer),
    };
  }

  /** The offer hash LoanCore computes, derived locally. */
  hashOffer(offer: LenderOffer): Hex {
    return hashLenderOffer(
      this.context.chainId,
      this.context.loanCoreAddress,
      offer
    );
  }

  /**
   * Publishes a signed offer to Liquidium's order book, the same book Liquidium's own app
   * reads and fills from. Liquidium rejects a partner signature the fee splitter would not
   * credit, so a successful publish means the attribution is good.
   */
  async publishOffer(request: PublishOfferRequest): Promise<PublishedOffer> {
    const apiClient = this.requireApi();
    if (
      request.lenderAttributionSignature &&
      getLenderPartnerId(request.offer.salt) === NO_PARTNER_ID
    ) {
      throw new P2pEvmError(
        P2pEvmErrorCode.PARTNER_MISMATCH,
        "Offer salt names no partner, so a partner signature cannot be credited. Build the offer with offers.prepareOffer"
      );
    }

    const response = await apiClient.post<
      PublishOfferApiResponse,
      PublishOfferApiBody
    >(SdkApiPath.offers, {
      chainId: this.context.chainId,
      offer: toLenderOfferApiItem(request.offer),
      offerSignature: request.offerSignature,
      lenderAttributionSignature: request.lenderAttributionSignature,
    });
    const published = this.toVerifiedOffer(response.offer);

    // A published offer is immutable, so this is the one moment to catch a dropped or
    // altered partner signature.
    if (
      published.lenderAttributionSignature?.toLowerCase() !==
      request.lenderAttributionSignature?.toLowerCase()
    ) {
      throw new P2pEvmError(
        P2pEvmErrorCode.INVALID_ATTRIBUTION,
        `Offer ${published.offerHash} was stored without the partner signature it was published with`
      );
    }
    return published;
  }

  /**
   * Lists fillable offers from every source together: Liquidium's app and all partners. Each
   * offer's hash is recomputed locally. The book is discovery, not a reservation: call
   * {@link OffersModule.verifyOffer} or simulate the borrow before filling.
   */
  async listOffers(filters: ListOffersFilters = {}): Promise<OfferBook> {
    const response = await this.requireApi().get<ListOffersApiResponse>(
      buildOffersPath({
        chainId: this.context.chainId,
        collection: filters.collection,
        asset: filters.asset,
      })
    );

    return {
      complete: response.complete,
      offers: response.offers.map((item) => this.toVerifiedOffer(item)),
    };
  }

  /**
   * Checks an offer against the chain: whether LoanCore would fill it now, and which partner
   * the fee splitter would credit for the lender side.
   */
  async verifyOffer(offer: PublishedOffer): Promise<OfferVerification> {
    const fillable = await this.context.publicClient.readContract({
      address: this.context.loanCoreAddress,
      abi: loanCoreAbi,
      functionName: "isFillableSigned",
      args: [offer.offer, offer.offerSignature],
    });
    const lenderPartner = offer.lenderAttributionSignature
      ? await this.attribution.verifyLenderAttribution(
          offer.offer,
          offer.lenderAttributionSignature
        )
      : null;

    return { fillable, lenderPartner };
  }

  private toVerifiedOffer(item: PublishedOfferApiItem): PublishedOffer {
    return toPublishedOffer(
      item,
      this.context.chainId,
      this.context.loanCoreAddress
    );
  }
}
