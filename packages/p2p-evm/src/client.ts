import {
  DEFAULT_API_BASE_URL,
  DEFAULT_TIMEOUT_MS,
  resolveLoanCoreAddress,
} from "./core/config";
import { P2pEvmError, P2pEvmErrorCode } from "./core/errors";
import { createProtocolContext } from "./core/protocol-context";
import { createApiClient } from "./core/transports/api-client";
import type { P2pEvmClientConfig } from "./core/types";
import { AttributionModule } from "./modules/attribution";
import { LoansModule } from "./modules/loans";
import { MarketModule } from "./modules/market";
import { OffersModule } from "./modules/offers";
import { RevenueModule } from "./modules/revenue";

/**
 * Root client for integrating Liquidium peer-to-peer NFT loans as a revenue-share partner.
 *
 * One client is bound to one LoanCore deployment on one chain. It builds transactions and
 * typed data but never holds keys or submits anything.
 *
 * Construct with `new P2pEvmClient(config)`.
 */
export class P2pEvmClient {
  /** Lender offers: build, publish, list, verify. */
  readonly offers: OffersModule;
  /** Borrow and repay transactions, and loan reads. */
  readonly loans: LoansModule;
  /** Partner signatures that attribute lenders and borrowers to you. */
  readonly attribution: AttributionModule;
  /** Your registration, balances, claims and attribution audit, read from the chain. */
  readonly revenue: RevenueModule;
  /** Listed markets and their terms. */
  readonly market: MarketModule;

  /**
   * Creates a P2P EVM SDK client.
   *
   * @param config - Chain, public client, partner id, and SDK API options.
   */
  constructor(config: P2pEvmClientConfig) {
    const loanCoreAddress = resolveLoanCoreAddress(
      config.chainId,
      config.loanCoreAddress
    );
    if (!loanCoreAddress) {
      throw new P2pEvmError(
        P2pEvmErrorCode.VALIDATION_ERROR,
        `No known LoanCore on chain ${config.chainId}: pass \`loanCoreAddress\``
      );
    }

    const context = createProtocolContext({
      chainId: config.chainId,
      loanCoreAddress,
      publicClient: config.publicClient,
      partnerId: config.partnerId,
    });
    const apiClient = config.apiKey
      ? createApiClient({
          baseUrl: config.apiBaseUrl ?? DEFAULT_API_BASE_URL,
          apiKey: config.apiKey,
          headers: config.headers,
          fetchFn: config.fetch,
          timeoutMs: config.timeoutMs ?? DEFAULT_TIMEOUT_MS,
        })
      : undefined;

    this.attribution = new AttributionModule(context);
    this.offers = new OffersModule(context, apiClient, this.attribution);
    this.loans = new LoansModule(context, apiClient, this.attribution);
    this.revenue = new RevenueModule(context);
    this.market = new MarketModule(context, apiClient);
  }
}
