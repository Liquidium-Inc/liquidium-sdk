import type { Chain } from "./types";

/** Asset transfer path used for wallet-executed actions. */
export const TransferMode = {
  native: "native",
} as const;
/** Asset transfer path used for wallet-executed actions. */
export type TransferMode = (typeof TransferMode)[keyof typeof TransferMode];

/** Wallet capability required to execute a prepared SDK action. */
export const WalletExecutionKind = {
  signMessage: "sign-message",
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
 */
export interface WalletAdapter {
  /** Signs an SDK plaintext message and returns the wallet signature. BTC adapters may return base64 BIP-322 or hex-encoded signature bytes. */
  signMessage?: (request: SignMessageRequest) => Promise<string>;
  /** Sends an EVM transaction and returns its transaction hash. */
  sendEthTransaction?: (request: SendEthTransactionRequest) => Promise<string>;
  /** Sends a BTC transaction and returns its transaction id. */
  sendBtcTransaction?: (request: SendBtcTransactionRequest) => Promise<string>;
}

/** Signature payload submitted to a sign-message action. */
export interface SignatureInfo {
  /** Wallet signature over the action message. BTC signatures may be base64 BIP-322 or hex-encoded bytes. */
  signature: string;
  /** Chain used to produce the signature. */
  chain: Chain;
  /** Account that produced the signature, when different from the action default. */
  account?: string;
}

/** Prepared action that requires message signing before submit. */
export interface SignMessageWalletAction<TData, TResult> {
  /** Protocol action kind. */
  kind: WalletActionKind;
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

/** Any prepared action returned by SDK methods and executable by {@link executeWith}. */
export type WalletAction<TResult> = SignMessageWalletAction<unknown, TResult>;

// Future extension point:
// native ICP and native Solana wallet capabilities will be added in a later
// version once those chains are supported by the SDK.
