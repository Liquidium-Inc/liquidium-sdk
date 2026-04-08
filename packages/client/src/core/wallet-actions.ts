import type { Chain } from "./types";

export type TransferMode = "native" | "ck";

export type WalletExecutionKind =
  | "sign-message"
  | "sign-psbt"
  | "send-eth-transaction";

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
  chain: "BTC";
  psbtBase64: string;
  account?: string;
  actionType: string;
  transferMode: TransferMode;
}

export interface SendEthTransactionRequest {
  chain: "ETH";
  transaction: EthTransactionRequest;
  account?: string;
  actionType: string;
  transferMode: TransferMode;
}

export interface WalletAdapter {
  signMessage?: (request: SignMessageRequest) => Promise<string>;
  signPsbt?: (request: SignPsbtRequest) => Promise<string>;
  sendEthTransaction?: (request: SendEthTransactionRequest) => Promise<string>;
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
