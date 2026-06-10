import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";
import {
  DEFAULT_API_BASE_URL,
  DEFAULT_ENVIRONMENT,
  DEFAULT_TIMEOUT_MS,
  resolveCanisterIds,
} from "./core/config";
import type { ApiClient } from "./core/transports/api-client";
import { createApiClient } from "./core/transports/api-client";
import type { CanisterContext } from "./core/transports/canister-context";
import { createCanisterContext } from "./core/transports/canister-context";
import type { EvmReadClient, LiquidiumClientConfig } from "./core/types";
import { AccountsModule } from "./modules/accounts";
import { ActivitiesModule } from "./modules/activities";
import { HistoryModule } from "./modules/history";
import { InstantLoansModule } from "./modules/instant-loans";
import { LendingModule } from "./modules/lending";
import { MarketModule } from "./modules/market";
import { PositionsModule } from "./modules/positions";
import { QuoteModule } from "./modules/quote";

/**
 * Root client for Liquidium protocol integration (canister + optional HTTP API).
 *
 * Construct with `new LiquidiumClient(config)`.
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
  /** Receipt-oriented activity status and activity lists. */
  readonly activities: ActivitiesModule;
  /** Pool and user history through the Liquidium SDK API. */
  readonly history: HistoryModule;
  /** Accountless instant loans backed by generated deposit/repay targets. */
  readonly instantLoans: InstantLoansModule;
  /** Pure quote helpers from market inputs. */
  readonly quote: QuoteModule;

  private readonly canisterContext: CanisterContext;
  private readonly apiClient: ApiClient | undefined;
  private readonly evmReadClient: EvmReadClient | undefined;

  /**
   * Creates a Liquidium SDK client.
   *
   * @param config - Runtime transport, canister, API, identity, and EVM read options.
   */
  constructor(config: LiquidiumClientConfig = {}) {
    const environment = config.environment ?? DEFAULT_ENVIRONMENT;
    const canisterIds = resolveCanisterIds(environment, config.canisterIds);
    const timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS;

    this.canisterContext = createCanisterContext({
      icHost: config.icHost,
      identity: config.identity,
      canisterIds,
    });

    this.apiClient = createApiClient({
      baseUrl: config.apiBaseUrl ?? DEFAULT_API_BASE_URL,
      headers: config.headers,
      fetchFn: config.fetch,
      timeoutMs,
    });

    this.evmReadClient = resolveEvmReadClient(config);

    this.accounts = new AccountsModule(this.canisterContext);
    this.lending = new LendingModule(
      this.canisterContext,
      this.apiClient,
      this.evmReadClient
    );
    this.market = new MarketModule(this.canisterContext, this.apiClient);
    this.positions = new PositionsModule(this.canisterContext, this.market);
    this.activities = new ActivitiesModule(
      this.apiClient,
      this.canisterContext
    );
    this.history = new HistoryModule(this.apiClient);
    this.instantLoans = new InstantLoansModule(
      this.canisterContext,
      this.apiClient,
      this.lending,
      this.positions
    );
    this.quote = new QuoteModule();
  }
}

function resolveEvmReadClient(
  config: LiquidiumClientConfig
): EvmReadClient | undefined {
  if (config.evmPublicClient) {
    return config.evmPublicClient;
  }

  if (!config.evmRpcUrl) {
    return undefined;
  }

  return createPublicClient({
    chain: mainnet,
    transport: http(config.evmRpcUrl, {
      fetchOptions: config.evmRpcHeaders
        ? { headers: config.evmRpcHeaders }
        : undefined,
    }),
  });
}
