import type { Identity } from "@dfinity/agent";

export interface LiquidiumClientConfig {
  environment?: Environment;
  icHost?: string;
  identity?: Identity;
  apiBaseUrl?: string;
  headers?: Record<string, string>;
  canisterIds?: Partial<CanisterIds>;
  fetch?: typeof fetch;
  timeoutMs?: number;
  supplyStatusPollIntervalMs?: number;
}

export interface CanisterIds {
  lending: string;
  btcPool: string;
  ercPool: string;
}

export type Environment = "mainnet" | "staging";

export type Asset = "BTC" | "USDT" | "USDC";
export type Chain = "BTC" | "ETH";
export type MarketAsset = string;
export type MarketChain = string;
export type SupplyAction = "deposit" | "repayment";
export type Outflowtype = "withdraw" | "borrow" | "feeClaim";

export interface Wallet {
  chain: Chain;
  address: string;
}
