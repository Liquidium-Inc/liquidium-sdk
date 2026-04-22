import {
  DEFAULT_ENVIRONMENT,
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

/**
 * Root client for Liquidium protocol integration (canister + optional HTTP API).
 *
 * Construct with {@link LiquidiumClient.create}.
 */
export class LiquidiumClient {
  /** Profile lifecycle: create, resolve, linked wallets. */
  readonly accounts: AccountsModule;
  /** Borrow, withdraw, supply, inflow reporting and tracking. */
  readonly lending: LendingModule;
  /** Per-pool positions, health, aggregate stats. */
  readonly positions: PositionsModule;
  /** Pool list, prices, pool rate lookups. */
  readonly market: MarketModule;
  /** Pending inflows/outflows (requires `apiBaseUrl` when implemented). */
  readonly pending: PendingModule;
  /** Pool and user history (requires `apiBaseUrl`). */
  readonly history: HistoryModule;
  /** Pure quote helpers from market inputs. */
  readonly quote: QuoteModule;

  private readonly canisterContext: CanisterContext;
  private readonly apiClient: ApiClient | undefined;

  private constructor(config: LiquidiumClientConfig) {
    const environment = config.environment ?? DEFAULT_ENVIRONMENT;
    const canisterIds = resolveCanisterIds(environment, config.canisterIds);
    const timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS;

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
    this.lending = new LendingModule(this.canisterContext, this.apiClient);
    this.market = new MarketModule(this.canisterContext, this.apiClient);
    this.positions = new PositionsModule(this.canisterContext, this.market);
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
