import type { Address, Hex, PublicClient } from "viem";

/** The read-only viem client surface the SDK uses to verify things onchain. */
export type P2pEvmPublicClient = Pick<
  PublicClient,
  "getChainId" | "getLogs" | "readContract"
>;

/** Runtime options for {@link P2pEvmClient}. */
export interface P2pEvmClientConfig {
  /** Chain the LoanCore deployment lives on. */
  chainId: number;
  /** viem public client for `chainId`. Every onchain check goes through it. */
  publicClient: P2pEvmPublicClient;
  /**
   * LoanCore proxy address. Optional on chains the SDK knows; required elsewhere. The fee
   * splitter is always read from this contract, never configured.
   */
  loanCoreAddress?: Address;
  /** Your partner id in the fee splitter. Required to create attributed offers and borrows. */
  partnerId?: number;
  /**
   * Partner API key for the Liquidium SDK API. Server-side only: never ship it to a browser.
   * Optional, because everything that only touches the chain works without it.
   */
  apiKey?: string;
  /** Override the SDK API base URL. */
  apiBaseUrl?: string;
  /** Extra headers sent with every SDK API request. */
  headers?: Record<string, string>;
  /** Custom fetch implementation. */
  fetch?: typeof fetch;
  /** SDK API request timeout in milliseconds. */
  timeoutMs?: number;
}

/**
 * A lender's signed commitment, exactly as LoanCore hashes it. The first four bytes of `salt`
 * name the lender's revenue-share partner (zero for none).
 */
export interface LenderOffer {
  lender: Address;
  collection: Address;
  asset: Address;
  maxPrincipal: bigint;
  maxLtvBps: number;
  aprBps: number;
  /** Loan duration in seconds. */
  duration: number;
  /** Unix timestamp after which the offer cannot be filled. */
  expiry: bigint;
  nonce: bigint;
  collectionNonce: bigint;
  assetNonce: bigint;
  salt: Hex;
}

/**
 * A contract call the SDK has built but not sent. Pass it to viem's `simulateContract` and
 * `writeContract` with the account that must send it. The SDK never holds keys or submits.
 */
export interface PreparedCall<
  TAbi extends readonly unknown[],
  TFunctionName extends string,
  TArgs extends readonly unknown[],
> {
  address: Address;
  abi: TAbi;
  functionName: TFunctionName;
  args: TArgs;
}
