import { DEFAULT_TIMEOUT_MS, resolveCanisterIds } from "./config";
import type { ApiClient } from "./internal/api-client";
import { createApiClient } from "./internal/api-client";
import type { InternalProvider } from "./internal/provider";
import { createProvider } from "./internal/provider";
import { AccountsModule } from "./modules/accounts";
import { HistoryModule } from "./modules/history";
import { LendingModule } from "./modules/lending";
import { MarketModule } from "./modules/market";
import { PendingModule } from "./modules/pending";
import { PositionsModule } from "./modules/positions";
import type { LiquidiumClientConfig } from "./types";

export class LiquidiumClient {
  readonly accounts: AccountsModule;
  readonly lending: LendingModule;
  readonly positions: PositionsModule;
  readonly market: MarketModule;
  readonly pending: PendingModule;
  readonly history: HistoryModule;

  private readonly provider: InternalProvider;
  private readonly apiClient: ApiClient | undefined;

  private constructor(config: LiquidiumClientConfig) {
    const canisterIds = resolveCanisterIds(config.canisterIds);
    const timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS;

    this.provider = createProvider({
      host: config.host,
      identity: config.identity,
      canisterIds,
    });

    this.apiClient = config.apiBaseUrl
      ? createApiClient({ baseUrl: config.apiBaseUrl, timeoutMs })
      : undefined;

    this.accounts = new AccountsModule(this.provider);
    this.lending = new LendingModule(this.provider);
    this.positions = new PositionsModule(this.provider);
    this.market = new MarketModule(this.provider, this.apiClient);
    this.pending = new PendingModule(this.provider, this.apiClient);
    this.history = new HistoryModule(this.apiClient);
  }

  /**
   * Create a new Liquidium protocol client.
   *
   * @example
   * ```ts
   * // Read-only (anonymous)
   * const client = LiquidiumClient.create({});
   * const pools = await client.market.getPools();
   *
   * // Create a signable account action
   * const createAction = await client.accounts.create({ account: walletAddress });
   * const signature = await wallet.signMessage(createAction.message);
   * await createAction.submit({ signature, chain: "ETH", account: walletAddress });
   * ```
   */
  static create(config: LiquidiumClientConfig = {}): LiquidiumClient {
    return new LiquidiumClient(config);
  }
}
