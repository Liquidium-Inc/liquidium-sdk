import type {
  SignatureInfo,
  SignMessageWalletAction,
  WalletActionKind,
  WalletExecutionKind,
} from "../../core/wallet-actions";

export type { SignatureInfo } from "../../core/wallet-actions";

/** Data embedded in a prepared profile-creation action. */
export interface CreateAccountData {
  /** Expiry timestamp, in protocol nanoseconds, included in the signed message. */
  expiryTimestamp: bigint;
}

/** Sign-message action that can be submitted after wallet signing. */
export interface SignableAction<TData, TResult>
  extends SignMessageWalletAction<TData, TResult> {}

/** Prepared action for creating a Liquidium profile. */
export interface CreateAccountAction
  extends SignableAction<CreateAccountData, string> {
  /** Protocol action kind. */
  kind: typeof WalletActionKind.createAccount;
  /** Required wallet capability. */
  executionKind: typeof WalletExecutionKind.signMessage;
  /** Adapter-facing action type. */
  actionType: typeof WalletActionKind.createAccount;
}

/** Signed canister request used to register a new profile. */
export interface CreateAccountRequest {
  /** Profile-creation data that was signed. */
  data: CreateAccountData;
  /** Wallet signature and signer metadata. */
  signatureInfo: SignatureInfo;
}
