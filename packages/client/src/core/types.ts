import type { Identity } from "@icp-sdk/core/agent";
import type { PublicClient } from "viem";

/** Minimal viem-compatible client shape required for SDK EVM read calls. */
export type EvmReadClient = Pick<PublicClient, "readContract">;

/**
 * Runtime options for `new LiquidiumClient(config)`.
 *
 * Canister-backed reads and SDK HTTP features work with `{}` defaults. Set
 * `apiBaseUrl` only when overriding the Liquidium production API root.
 */
export interface LiquidiumClientConfig {
  /** Preset canister IDs. Only `mainnet` is bundled. */
  environment?: Environment;
  /** ICP replica host override (defaults follow `@icp-sdk/core/agent`). */
  icHost?: string;
  /** Agent identity for signed canister calls. */
  identity?: Identity;
  /**
   * Base URL for the Liquidium SDK HTTP API root (e.g. `https://app.example.com/api/sdk`).
   * Defaults to the Liquidium production API root. Endpoint versions are owned
   * by this SDK package version.
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

/** Principal text values for canisters used by the client. */
export interface CanisterIds {
  /** Liquidium lending canister principal. */
  lending: string;
  /** BTC pool canister principal. */
  btcPool: string;
  /** ERC-20 pool canister principal. */
  ercPool: string;
  /** ckETH minter deposit helper canister principal. */
  ethDeposit: string;
  /** Accountless instant-loans canister principal. */
  instantLoans: string;
}

/** Supported deployment environments with bundled canister ids. */
export const Environment = {
  mainnet: "mainnet",
} as const;
/** Supported deployment environment name. */
export type Environment = (typeof Environment)[keyof typeof Environment];

/** Canonical asset symbols supported by state-mutating protocol flows. */
export const Asset = {
  BTC: "BTC",
  SOL: "SOL",
  USDC: "USDC",
  USDT: "USDT",
} as const;
/** Canonical asset symbol supported by state-mutating protocol flows. */
export type Asset = (typeof Asset)[keyof typeof Asset];

/** Canonical chain identifiers used by wallet and protocol actions. */
export const Chain = {
  BTC: "BTC",
  ETH: "ETH",
} as const;
/** Canonical chain identifier used by wallet and protocol actions. */
export type Chain = (typeof Chain)[keyof typeof Chain];

/** Asset symbol as returned by market-data APIs, including future assets. */
export type MarketAsset = string;
/** Chain name as returned by market-data APIs, including future chains. */
export type MarketChain = string;

/** Inflow operation performed by a supply target. */
export const SupplyAction = {
  deposit: "deposit",
  repayment: "repayment",
} as const;
/** Inflow operation performed by a supply target. */
export type SupplyAction = (typeof SupplyAction)[keyof typeof SupplyAction];

/** Outflow operation reported by the lending canister. */
export const OutflowType = {
  borrow: "borrow",
  feeClaim: "feeClaim",
  withdraw: "withdraw",
} as const;
/** Outflow operation reported by the lending canister. */
export type OutflowType = (typeof OutflowType)[keyof typeof OutflowType];

/** Inflow submit type expected by the SDK API. */
export const InflowSubmitType = {
  DEPOSIT: "DEPOSIT",
  REPAY: "REPAY",
} as const;
/** Inflow submit type expected by the SDK API. */
export type InflowSubmitType =
  (typeof InflowSubmitType)[keyof typeof InflowSubmitType];

/** Wallet address and chain pair linked to a Liquidium profile. */
export interface Wallet {
  /** Chain where the wallet address is valid. */
  chain: Chain;
  /** Wallet address as stored by the protocol. */
  address: string;
}
