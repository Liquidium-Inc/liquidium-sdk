import { DEFAULT_TIMEOUT_MS, resolveCanisterIds } from "./core/config";
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

export class LiquidiumClient {
  readonly accounts: AccountsModule;
  readonly lending: LendingModule;
  readonly positions: PositionsModule;
  readonly market: MarketModule;
  readonly pending: PendingModule;
  readonly history: HistoryModule;

  private readonly canisterContext: CanisterContext;
  private readonly apiClient: ApiClient | undefined;

  private constructor(config: LiquidiumClientConfig) {
    const canisterIds = resolveCanisterIds(config.canisterIds);
    const timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS;

    this.canisterContext = createCanisterContext({
      host: config.host,
      identity: config.identity,
      canisterIds,
    });

    this.apiClient = config.apiBaseUrl
      ? createApiClient({ baseUrl: config.apiBaseUrl, timeoutMs })
      : undefined;

    this.accounts = new AccountsModule(this.canisterContext);
    this.lending = new LendingModule(this.canisterContext);
    this.positions = new PositionsModule(this.canisterContext);
    this.market = new MarketModule(this.canisterContext, this.apiClient);
    this.pending = new PendingModule(this.canisterContext, this.apiClient);
    this.history = new HistoryModule(this.apiClient);
  }

  static create(config: LiquidiumClientConfig = {}): LiquidiumClient {
    return new LiquidiumClient(config);
  }
}
