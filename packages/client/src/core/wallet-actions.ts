import type { IcrcAccount } from "./accounts";
import type { Asset, SigningChain } from "./types";

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
  chain: SigningChain;
  /** Plaintext message to sign. */
  message: string;
  /** Optional account override for the signing wallet. */
  account?: string;
  /** SDK action type that produced this request. */
  actionType: string;
}

/** ETH transaction-sending request passed to wallet adapters. */
export interface SendEthTransactionRequest {
  /** ETH chain discriminator. */
  chain: "ETH";
  /** Transaction payload to send. */
  transaction: EthTransactionRequest;
  /** Optional account override for the sending wallet. */
  account?: string;
  /** SDK action type that produced this request. */
  actionType: string;
}

/** BTC transaction-sending request passed to wallet adapters. */
export interface SendBtcTransactionRequest {
  /** BTC chain discriminator. */
  chain: "BTC";
  /** Recipient BTC address. */
  toAddress: string;
  /** Amount in satoshis when the SDK knows the transfer amount. */
  amountSats?: bigint;
  /** Optional account override for the sending wallet. */
  account?: string;
  /** SDK action type that produced this request. */
  actionType: string;
}

/** ICRC ledger transfer payload passed to wallet adapters. */
export interface IcrcTransferDetails {
  /** Ledger canister principal that should receive the transfer call. */
  ledgerCanisterId: string;
  /** Recipient ICRC account. */
  to: IcrcAccount;
  /** Transfer amount in ledger base units. */
  amount: bigint;
  /** Optional ledger fee in base units. */
  fee?: bigint;
  /** Optional ledger memo bytes. */
  memo?: Uint8Array;
}

/** ICRC transaction-sending request passed to wallet adapters. */
export interface SendIcrcTransferRequest {
  /** ICRC transfers are submitted on the Internet Computer. */
  chain: "ICP";
  /** Asset represented by the target ledger transfer. */
  asset: Asset;
  /** Transfer details for the ledger call. */
  transfer: IcrcTransferDetails;
  /** Optional account override for the sending wallet. */
  account?: string;
  /** SDK action type that produced this request. */
  actionType: string;
}

/**
 * Optional wallet capabilities. Implement only what your flow uses:
 *
 * - `signMessage` - account creation, borrow, withdraw
 * - `sendBtcTransaction` / `sendEthTransaction` - automated native-asset transfer supply
 * - `sendIcrcTransfer` - automated ck-ledger and ICP ledger transfer supply
 * - `sendEthTransaction` - contract-interaction supply and ETH native-asset sends
 */
export interface WalletAdapter {
  /** Signs an SDK plaintext message and returns the wallet signature. BTC adapters may return base64 BIP-322 or hex-encoded signature bytes. */
  signMessage?: (request: SignMessageRequest) => Promise<string>;
  /** Sends an EVM transaction and returns its transaction hash. */
  sendEthTransaction?: (request: SendEthTransactionRequest) => Promise<string>;
  /** Sends a BTC transaction and returns its transaction id. */
  sendBtcTransaction?: (request: SendBtcTransactionRequest) => Promise<string>;
  /** Sends an ICRC ledger transfer and returns the ledger transaction reference. */
  sendIcrcTransfer?: (request: SendIcrcTransferRequest) => Promise<string>;
}

/** Signature payload submitted to a sign-message action. */
export interface SignatureInfo {
  /** Wallet signature over the action message. BTC signatures may be base64 BIP-322 or hex-encoded bytes. */
  signature: string;
  /** Chain used to produce the signature. */
  chain: SigningChain;
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
