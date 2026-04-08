import {
  DEFAULT_ENVIRONMENT,
  DEFAULT_SUPPLY_STATUS_POLL_INTERVAL_MS,
  DEFAULT_TIMEOUT_MS,
  resolveCanisterIds,
} from "./core/config";
import type { ApiClient } from "./core/transports/api-client";
import { createApiClient } from "./core/transports/api-client";
import type { CanisterContext } from "./core/transports/canister-context";
import { createCanisterContext } from "./core/transports/canister-context";
import type { LiquidiumClientConfig } from "./core/types";
import { AccountsModule } from "./modules/accounts";
import { HistoryModule } from "./modules/history";
import { LendingModule } from "./modules/lending";
import { MarketModule } from "./modules/market";
import { PendingModule } from "./modules/pending";
import { PositionsModule } from "./modules/positions";
import { QuoteModule } from "./modules/quote";

export class LiquidiumClient {
  readonly accounts: AccountsModule;
  readonly lending: LendingModule;
  readonly positions: PositionsModule;
  readonly market: MarketModule;
  readonly pending: PendingModule;
  readonly history: HistoryModule;
  readonly quote: QuoteModule;

  private readonly canisterContext: CanisterContext;
  private readonly apiClient: ApiClient | undefined;

  private constructor(config: LiquidiumClientConfig) {
    const environment = config.environment ?? DEFAULT_ENVIRONMENT;
    const canisterIds = resolveCanisterIds(environment, config.canisterIds);
    const timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    const supplyStatusPollIntervalMs =
      config.supplyStatusPollIntervalMs ??
      DEFAULT_SUPPLY_STATUS_POLL_INTERVAL_MS;

    this.canisterContext = createCanisterContext({
      icHost: config.icHost,
      identity: config.identity,
      canisterIds,
    });

    this.apiClient = config.apiBaseUrl
      ? createApiClient({
          baseUrl: config.apiBaseUrl,
          headers: config.headers,
          fetchFn: config.fetch,
          timeoutMs,
        })
      : undefined;

    this.accounts = new AccountsModule(this.canisterContext);
    this.lending = new LendingModule(this.canisterContext, this.apiClient, {
      supplyStatusPollIntervalMs,
    });
    this.positions = new PositionsModule(this.canisterContext);
    this.market = new MarketModule(this.canisterContext, this.apiClient);
    this.pending = new PendingModule(this.canisterContext, this.apiClient);
    this.history = new HistoryModule(this.apiClient);
    this.quote = new QuoteModule();
  }

  /**
   * Creates a client instance with the provided runtime configuration.
   *
   * @param config - Optional client configuration such as environment, canister ids, and API settings.
   * @returns A configured `LiquidiumClient` instance.
   */
  static create(config: LiquidiumClientConfig = {}): LiquidiumClient {
    return new LiquidiumClient(config);
  }
}
