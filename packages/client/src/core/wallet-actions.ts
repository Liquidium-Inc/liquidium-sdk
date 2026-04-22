import { Chain } from "./types";

export const TransferMode = {
  ck: "ck",
  native: "native",
} as const;
export type TransferMode = (typeof TransferMode)[keyof typeof TransferMode];

export const WalletExecutionKind = {
  sendEthTransaction: "send-eth-transaction",
  signMessage: "sign-message",
  signPsbt: "sign-psbt",
} as const;
export type WalletExecutionKind =
  (typeof WalletExecutionKind)[keyof typeof WalletExecutionKind];

export const WalletActionKind = {
  createAccount: "create-account",
  createBorrow: "create-borrow",
  createWithdraw: "create-withdraw",
} as const;
export type WalletActionKind =
  (typeof WalletActionKind)[keyof typeof WalletActionKind];

export interface EthTransactionRequest {
  to: string;
  data?: string;
  value?: string;
  chainId?: number;
}

export interface SignMessageRequest {
  chain: Chain;
  message: string;
  account?: string;
  actionType: string;
  transferMode: TransferMode;
}

export interface SignPsbtRequest {
  chain: typeof Chain.BTC;
  psbtBase64: string;
  account?: string;
  actionType: string;
  transferMode: TransferMode;
}

export interface SendEthTransactionRequest {
  chain: typeof Chain.ETH;
  transaction: EthTransactionRequest;
  account?: string;
  actionType: string;
  transferMode: TransferMode;
}

export interface SendBtcTransactionRequest {
  chain: "BTC";
  toAddress: string;
  amountSats?: bigint;
  account?: string;
  actionType: string;
  transferMode: TransferMode;
}

/**
 * Optional wallet capabilities. Implement only what your flow uses:
 *
 * - `signMessage` — account creation, borrow, withdraw
 * - `sendBtcTransaction` / `sendEthTransaction` — automated transfer-path supply
 * - `sendEthTransaction` — contract-interaction supply and ETH native sends
 * - `signPsbt` — reserved for PSBT-based actions when exposed
 */
export interface WalletAdapter {
  signMessage?: (request: SignMessageRequest) => Promise<string>;
  signPsbt?: (request: SignPsbtRequest) => Promise<string>;
  sendEthTransaction?: (request: SendEthTransactionRequest) => Promise<string>;
  sendBtcTransaction?: (request: SendBtcTransactionRequest) => Promise<string>;
}

export interface SignatureInfo {
  signature: string;
  chain: Chain;
  account?: string;
}

export interface SignMessageWalletAction<TData, TResult> {
  kind: string;
  executionKind: "sign-message";
  actionType: string;
  transferMode: TransferMode;
  account: string;
  message: string;
  data: TData;
  submit(signatureInfo: SignatureInfo): Promise<TResult>;
}

export interface SignPsbtWalletAction<TResult> {
  kind: string;
  executionKind: "sign-psbt";
  actionType: string;
  transferMode: TransferMode;
  account?: string;
  psbtBase64: string;
  submit(request: { signedPsbtBase64: string }): Promise<TResult>;
}

export interface SendEthTransactionWalletAction<TResult> {
  kind: string;
  executionKind: "send-eth-transaction";
  actionType: string;
  transferMode: TransferMode;
  account?: string;
  transaction: EthTransactionRequest;
  submit(request: { txHash: string }): Promise<TResult>;
}

export type WalletAction<TResult> =
  | SignMessageWalletAction<unknown, TResult>
  | SignPsbtWalletAction<TResult>
  | SendEthTransactionWalletAction<TResult>;

// Future extension point:
// native ICP and native Solana wallet capabilities will be added in a later
// version once those chains are supported by the SDK.
// Wallet actions currently default to native asset flows. ck-asset execution
// paths will be added in a later version for borrow, withdraw, and supply.
