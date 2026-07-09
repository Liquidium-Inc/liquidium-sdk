import type { SigningChain } from "../../core/types";
import type {
  SignatureInfo,
  SignMessageWalletAction,
  WalletActionKind,
  WalletAdapter,
  WalletExecutionKind,
} from "../../core/wallet-actions";

/** Options for preparing a profile-creation action. */
export interface PrepareCreateProfileOptions {
  /** Wallet address that will own the new profile. */
  account: string;
}

/** Parameters for creating a profile through a wallet adapter. */
export interface CreateProfileParams {
  /** Wallet address that will own the new profile. */
  account: string;
  /** Chain used to sign the profile-creation message. */
  chain: SigningChain;
  /** Wallet adapter used to sign the profile-creation message. */
  walletAdapter: WalletAdapter;
}

/** Data embedded in a prepared profile-creation action. */
export interface CreateAccountData {
  /** Unix expiry timestamp in seconds, included in the signed message. */
  expiryTimestamp: bigint;
}

/** Prepared action for creating a Liquidium profile. */
export interface CreateAccountAction
  extends SignMessageWalletAction<CreateAccountData, string> {
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
