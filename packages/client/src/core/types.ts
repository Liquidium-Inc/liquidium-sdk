import type { Identity } from "@dfinity/agent";
import type { PublicClient } from "viem";

export type EvmReadClient = Pick<PublicClient, "readContract">;

/**
 * Runtime options for `LiquidiumClient.create`.
 *
 * Canister-backed reads and writes work with `{}` defaults. Set `apiBaseUrl`
 * when using HTTP features: user/pool history, activities, and inflow
 * reporting.
 */
export interface LiquidiumClientConfig {
  /** Preset canister IDs. Only `mainnet` is bundled. */
  environment?: Environment;
  /** ICP replica host override (defaults follow `@dfinity/agent`). */
  icHost?: string;
  /** Agent identity for signed canister calls. */
  identity?: Identity;
  /**
   * Base URL for the Liquidium SDK HTTP API (e.g. `https://app.example.com/api/sdk`).
   * Required for history, activities, inflow endpoints, and automated inflow reporting.
   */
  apiBaseUrl?: string;
  /** Extra headers sent with every SDK API request. */
  headers?: Record<string, string>;
  /** Override individual canister principals for custom deployments. */
  canisterIds?: Partial<CanisterIds>;
  /** Custom `fetch` implementation for SDK API requests. */
  fetch?: typeof fetch;
  /** Per-request timeout for SDK API calls in milliseconds. */
  timeoutMs?: number;
  /** Ethereum RPC URL used for public ERC-20 reads in EVM supply flows. */
  evmRpcUrl?: string;
  /** Optional headers for RPC providers that authenticate via HTTP headers. */
  evmRpcHeaders?: Record<string, string>;
  /** Existing viem public client or compatible read client for EVM reads. */
  evmPublicClient?: EvmReadClient;
}

export interface CanisterIds {
  lending: string;
  btcPool: string;
  ercPool: string;
  ethDeposit: string;
  instantLoans: string;
}

export const Environment = {
  mainnet: "mainnet",
} as const;
export type Environment = (typeof Environment)[keyof typeof Environment];

export const Asset = {
  BTC: "BTC",
  SOL: "SOL",
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
export type OutflowType = (typeof OutflowType)[keyof typeof OutflowType];

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
