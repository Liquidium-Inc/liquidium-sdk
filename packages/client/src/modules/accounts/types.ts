import type {
  SignatureInfo,
  SignMessageWalletAction,
  WalletActionKind,
  WalletExecutionKind,
} from "../../core/wallet-actions";

export type { SignatureInfo } from "../../core/wallet-actions";

export interface CreateAccountData {
  expiryTimestamp: bigint;
}

export interface SignableAction<TData, TResult>
  extends SignMessageWalletAction<TData, TResult> {}

export interface CreateAccountAction
  extends SignableAction<CreateAccountData, string> {
  kind: typeof WalletActionKind.createAccount;
  executionKind: typeof WalletExecutionKind.signMessage;
  actionType: typeof WalletActionKind.createAccount;
}

export interface CreateAccountRequest {
  data: CreateAccountData;
  signatureInfo: SignatureInfo;
}
