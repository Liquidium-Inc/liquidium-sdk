import type { Identity } from "@dfinity/agent";

/**
 * Runtime options for `LiquidiumClient.create`.
 *
 * Canister-backed reads and writes work with `{}` defaults. Set `apiBaseUrl`
 * when using HTTP features: user/pool history, pending movements, inflow
 * reporting, inflow status, and contract-interaction `supply` planning.
 */
export interface LiquidiumClientConfig {
  /** Preset canister IDs (`mainnet` or `staging`). */
  environment?: Environment;
  /** ICP replica host override (defaults follow `@dfinity/agent`). */
  icHost?: string;
  /** Agent identity for signed canister calls. */
  identity?: Identity;
  /**
   * Base URL for the Liquidium SDK HTTP API (e.g. `https://app.example.com/api/sdk`).
   * Required for history, pending, inflow endpoints, and ETH stablecoin supply context.
   */
  apiBaseUrl?: string;
  /** Extra headers sent with every SDK API request. */
  headers?: Record<string, string>;
  /** Override individual canister principals; merges with `environment` preset. */
  canisterIds?: Partial<CanisterIds>;
  /** Custom `fetch` implementation for SDK API requests. */
  fetch?: typeof fetch;
  /** Per-request timeout for SDK API calls in milliseconds. */
  timeoutMs?: number;
}

export interface CanisterIds {
  lending: string;
  btcPool: string;
  ercPool: string;
}

export const Environment = {
  mainnet: "mainnet",
  staging: "staging",
} as const;
export type Environment = (typeof Environment)[keyof typeof Environment];

export const Asset = {
  BTC: "BTC",
  USDC: "USDC",
  USDT: "USDT",
} as const;
export type Asset = (typeof Asset)[keyof typeof Asset];

export const Chain = {
  BTC: "BTC",
  ETH: "ETH",
} as const;
export type Chain = (typeof Chain)[keyof typeof Chain];

export type MarketAsset = string;
export type MarketChain = string;

export const SupplyAction = {
  deposit: "deposit",
  repayment: "repayment",
} as const;
export type SupplyAction = (typeof SupplyAction)[keyof typeof SupplyAction];

export const OutflowType = {
  borrow: "borrow",
  feeClaim: "feeClaim",
  withdraw: "withdraw",
} as const;
export type Outflowtype = (typeof OutflowType)[keyof typeof OutflowType];

export const InflowSubmitType = {
  DEPOSIT: "DEPOSIT",
  REPAY: "REPAY",
} as const;
export type InflowSubmitType =
  (typeof InflowSubmitType)[keyof typeof InflowSubmitType];

export interface Wallet {
  chain: Chain;
  address: string;
}
