import type { Identity } from "@dfinity/agent";

export interface LiquidiumClientConfig {
  host?: string;
  identity?: Identity;
  apiBaseUrl?: string;
  canisterIds?: Partial<CanisterIds>;
  timeoutMs?: number;
}

export interface CanisterIds {
  lending: string;
  btcPool: string;
  ercPool: string;
}

export type Asset = "BTC" | "USDT" | "USDC";
export type Chain = "BTC" | "ETH";
export type MarketAsset = string;
export type MarketChain = string;
export type SupplyAction = "deposit" | "repayment";
export type Outflowtype = "Withdraw" | "Borrow" | "FeeClaim";

export interface Wallet {
  chain: Chain;
  address: string;
}
