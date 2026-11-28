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
import { LendingModule } from "./modules/lending";
import { LiquidationsModule } from "./modules/liquidations";
import { MarketModule } from "./modules/market";
import { PositionsModule } from "./modules/positions";
import { QuoteModule } from "./modules/quote";
import { SimpleLoansModule } from "./modules/simple-loans";

const PARTNER_HEADER_NAME = "x-liquidium-partner";

interface ResolvedApiHeaders {
  headers: Record<string, string> | undefined;
  hasPartnerAttribution: boolean;
}

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
  /** Liquidation candidate scanning, execution, and status lookup. */
  readonly liquidations: LiquidationsModule;
  /** Per-pool positions, health, aggregate stats. */
  readonly positions: PositionsModule;
  /** Pool list, prices, pool rate lookups. */
  readonly market: MarketModule;
  /** Receipt-oriented activity status and activity lists. */
  readonly activities: ActivitiesModule;
  /** Pool and user history through the Liquidium SDK API. */
  readonly history: HistoryModule;
  /** Accountless Simple Loans backed by generated deposit/repay targets. */
  readonly simpleLoans: SimpleLoansModule;
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
      agent: config.agent,
      icHost: config.icHost,
      identity: config.identity,
      canisterIds,
    });

    const { headers: apiHeaders, hasPartnerAttribution } = resolveApiHeaders(
      config.headers,
      config.partner
    );

    this.apiClient = createApiClient({
      baseUrl: config.apiBaseUrl ?? DEFAULT_API_BASE_URL,
      headers: apiHeaders,
      fetchFn: config.fetch,
      timeoutMs,
    });

    this.evmReadClient = resolveEvmReadClient(config);

    this.accounts = new AccountsModule(this.canisterContext);
    this.lending = new LendingModule(
      this.canisterContext,
      this.apiClient,
      this.evmReadClient,
      hasPartnerAttribution
    );
    this.liquidations = new LiquidationsModule(this.canisterContext);
    this.market = new MarketModule(this.canisterContext);
    this.positions = new PositionsModule(this.canisterContext, this.market);
    this.activities = new ActivitiesModule(
      this.apiClient,
      this.canisterContext
    );
    this.history = new HistoryModule(this.apiClient);
    this.simpleLoans = new SimpleLoansModule(
      this.canisterContext,
      this.apiClient,
      this.activities,
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

function resolveApiHeaders(
  headers: Record<string, string> | undefined,
  partner: string | undefined
): ResolvedApiHeaders {
  const nextHeaders: Record<string, string> = {};
  let hasExplicitPartnerHeader = false;
  let explicitPartnerValue: string | undefined;

  if (headers) {
    for (const [key, value] of Object.entries(headers)) {
      if (key.toLowerCase() === PARTNER_HEADER_NAME) {
        hasExplicitPartnerHeader = true;
        const trimmed = value.trim();
        explicitPartnerValue = trimmed.length > 0 ? trimmed : undefined;
      } else {
        nextHeaders[key] = value;
      }
    }
  }

  const resolvedPartner = hasExplicitPartnerHeader
    ? explicitPartnerValue
    : partner?.trim() || undefined;

  if (!resolvedPartner) {
    if (!hasExplicitPartnerHeader) {
      return {
        headers,
        hasPartnerAttribution: false,
      };
    }

    return {
      headers: Object.keys(nextHeaders).length > 0 ? nextHeaders : undefined,
      hasPartnerAttribution: false,
    };
  }

  nextHeaders[PARTNER_HEADER_NAME] = resolvedPartner;

  return {
    headers: nextHeaders,
    hasPartnerAttribution: true,
  };
}
