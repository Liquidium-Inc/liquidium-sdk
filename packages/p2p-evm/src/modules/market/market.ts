import { isAddressEqual } from "viem";
import { P2pEvmError, P2pEvmErrorCode } from "../../core/errors";
import type { ProtocolContext } from "../../core/protocol-context";
import { buildMarketsPath } from "../../core/sdk-api-paths";
import type { ApiClient } from "../../core/transports/api-client";
import { type MarketApiItem, toMarket } from "./mappers";
import type { Market } from "./types";

interface ListMarketsApiResponse {
  loanCoreAddress: `0x${string}`;
  markets: MarketApiItem[];
}

/** The markets Liquidium lists, and the terms an offer may use in each. */
export class MarketModule {
  constructor(
    private readonly context: ProtocolContext,
    private readonly apiClient: ApiClient | undefined
  ) {}

  /**
   * Lists active markets. The terms are Liquidium's listing policy, kept offchain: LoanCore
   * accepts any term, but the order book only publishes offers on listed ones.
   */
  async listMarkets(): Promise<Market[]> {
    if (!this.apiClient) {
      throw new P2pEvmError(
        P2pEvmErrorCode.VALIDATION_ERROR,
        "Markets require an `apiKey` on the client"
      );
    }

    const response = await this.apiClient.get<ListMarketsApiResponse>(
      buildMarketsPath(this.context.chainId)
    );
    if (
      !isAddressEqual(response.loanCoreAddress, this.context.loanCoreAddress)
    ) {
      throw new P2pEvmError(
        P2pEvmErrorCode.CHAIN_MISMATCH,
        `The API serves LoanCore ${response.loanCoreAddress}, but this client is bound to ${this.context.loanCoreAddress}`
      );
    }
    return response.markets.map(toMarket);
  }
}
