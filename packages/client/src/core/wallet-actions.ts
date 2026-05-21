import type { Chain } from "./types";

/** Asset transfer path used for wallet-executed actions. */
export const TransferMode = {
  ck: "ck",
  native: "native",
} as const;
/** Asset transfer path used for wallet-executed actions. */
export type TransferMode = (typeof TransferMode)[keyof typeof TransferMode];

/** Wallet capability required to execute a prepared SDK action. */
export const WalletExecutionKind = {
  sendEthTransaction: "send-eth-transaction",
  signMessage: "sign-message",
  signPsbt: "sign-psbt",
} as const;
/** Wallet capability required to execute a prepared SDK action. */
export type WalletExecutionKind =
  (typeof WalletExecutionKind)[keyof typeof WalletExecutionKind];

/** Protocol action represented by a prepared wallet action. */
export const WalletActionKind = {
  createAccount: "create-account",
  createBorrow: "create-borrow",
  createWithdraw: "create-withdraw",
} as const;
/** Protocol action represented by a prepared wallet action. */
export type WalletActionKind =
  (typeof WalletActionKind)[keyof typeof WalletActionKind];

/** EVM transaction request passed to wallet adapters. */
export interface EthTransactionRequest {
  /** Destination address or contract address. */
  to: string;
  /** Hex-encoded calldata for contract interactions. */
  data?: string;
  /** Native ETH value in wei, serialized as a decimal string. */
  value?: string;
  /** Optional EVM chain id for wallet implementations that require it. */
  chainId?: number;
}

/** Message-signing request passed to wallet adapters. */
export interface SignMessageRequest {
  /** Chain for the signing wallet. */
  chain: Chain;
  /** Plaintext message to sign. */
  message: string;
  /** Optional account override for the signing wallet. */
  account?: string;
  /** SDK action type that produced this request. */
  actionType: string;
  /** Transfer path associated with the action. */
  transferMode: TransferMode;
}

/** PSBT-signing request passed to BTC wallet adapters. */
export interface SignPsbtRequest {
  /** BTC chain discriminator. */
  chain: Extract<Chain, "BTC">;
  /** Base64-encoded unsigned PSBT. */
  psbtBase64: string;
  /** Optional BTC account override. */
  account?: string;
  /** SDK action type that produced this request. */
  actionType: string;
  /** Transfer path associated with the action. */
  transferMode: TransferMode;
}

/** ETH transaction-sending request passed to wallet adapters. */
export interface SendEthTransactionRequest {
  /** ETH chain discriminator. */
  chain: Extract<Chain, "ETH">;
  /** Transaction payload to send. */
  transaction: EthTransactionRequest;
  /** Optional account override for the sending wallet. */
  account?: string;
  /** SDK action type that produced this request. */
  actionType: string;
  /** Transfer path associated with the action. */
  transferMode: TransferMode;
}

/** BTC transaction-sending request passed to wallet adapters. */
export interface SendBtcTransactionRequest {
  /** BTC chain discriminator. */
  chain: Extract<Chain, "BTC">;
  /** Recipient BTC address. */
  toAddress: string;
  /** Amount in satoshis when the SDK knows the transfer amount. */
  amountSats?: bigint;
  /** Optional account override for the sending wallet. */
  account?: string;
  /** SDK action type that produced this request. */
  actionType: string;
  /** Transfer path associated with the action. */
  transferMode: TransferMode;
}

/**
 * Optional wallet capabilities. Implement only what your flow uses:
 *
 * - `signMessage` - account creation, borrow, withdraw
 * - `sendBtcTransaction` / `sendEthTransaction` - automated transfer-path supply
 * - `sendEthTransaction` - contract-interaction supply and ETH native sends
 * - `signPsbt` - reserved for PSBT-based actions when exposed
 */
export interface WalletAdapter {
  /** Signs an SDK plaintext message and returns the wallet signature. */
  signMessage?: (request: SignMessageRequest) => Promise<string>;
  /** Signs an SDK-provided BTC PSBT and returns the signed PSBT as base64. */
  signPsbt?: (request: SignPsbtRequest) => Promise<string>;
  /** Sends an EVM transaction and returns its transaction hash. */
  sendEthTransaction?: (request: SendEthTransactionRequest) => Promise<string>;
  /** Sends a BTC transaction and returns its transaction id. */
  sendBtcTransaction?: (request: SendBtcTransactionRequest) => Promise<string>;
}

/** Signature payload submitted to a sign-message action. */
export interface SignatureInfo {
  /** Wallet signature over the action message. */
  signature: string;
  /** Chain used to produce the signature. */
  chain: Chain;
  /** Account that produced the signature, when different from the action default. */
  account?: string;
}

/** Prepared action that requires message signing before submit. */
export interface SignMessageWalletAction<TData, TResult> {
  /** Protocol action kind. */
  kind: string;
  /** Wallet capability required to execute the action. */
  executionKind: typeof WalletExecutionKind.signMessage;
  /** Adapter-facing action type. */
  actionType: string;
  /** Transfer path associated with the action. */
  transferMode: TransferMode;
  /** Default account to pass to the wallet adapter. */
  account: string;
  /** Plaintext message that must be signed. */
  message: string;
  /** Original request data needed to submit the signed action. */
  data: TData;
  /** Submits the signature and resolves the protocol result. */
  submit(signatureInfo: SignatureInfo): Promise<TResult>;
}

/** Prepared action that requires BTC PSBT signing before submit. */
export interface SignPsbtWalletAction<TResult> {
  /** Protocol action kind. */
  kind: string;
  /** Wallet capability required to execute the action. */
  executionKind: typeof WalletExecutionKind.signPsbt;
  /** Adapter-facing action type. */
  actionType: string;
  /** Transfer path associated with the action. */
  transferMode: TransferMode;
  /** Optional default account to pass to the wallet adapter. */
  account?: string;
  /** Base64-encoded unsigned PSBT. */
  psbtBase64: string;
  /** Submits the signed PSBT and resolves the protocol result. */
  submit(request: { signedPsbtBase64: string }): Promise<TResult>;
}

/** Prepared action that requires sending an ETH transaction before submit. */
export interface SendEthTransactionWalletAction<TResult> {
  /** Protocol action kind. */
  kind: string;
  /** Wallet capability required to execute the action. */
  executionKind: typeof WalletExecutionKind.sendEthTransaction;
  /** Adapter-facing action type. */
  actionType: string;
  /** Transfer path associated with the action. */
  transferMode: TransferMode;
  /** Optional default account to pass to the wallet adapter. */
  account?: string;
  /** EVM transaction request to send. */
  transaction: EthTransactionRequest;
  /** Submits the transaction hash and resolves the protocol result. */
  submit(request: { txHash: string }): Promise<TResult>;
}

/** Any prepared action returned by SDK methods and executable by {@link executeWith}. */
export type WalletAction<TResult> =
  | SignMessageWalletAction<unknown, TResult>
  | SignPsbtWalletAction<TResult>
  | SendEthTransactionWalletAction<TResult>;

// Future extension point:
// native ICP and native Solana wallet capabilities will be added in a later
// version once those chains are supported by the SDK.
// Wallet actions currently default to native asset flows. ck-asset execution
// paths will be added in a later version for borrow, withdraw, and supply.
