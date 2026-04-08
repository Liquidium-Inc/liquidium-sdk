import type {
  SignMessageWalletAction,
  SignatureInfo,
} from "../../core/wallet-actions";

export type { SignatureInfo } from "../../core/wallet-actions";

export interface CreateAccountData {
  expiryTimestamp: bigint;
}

export interface SignableAction<TData, TResult>
  extends SignMessageWalletAction<TData, TResult> {}

export interface CreateAccountAction
  extends SignableAction<CreateAccountData, string> {
  kind: "create-account";
  executionKind: "sign-message";
  actionType: "create-account";
}

export interface CreateAccountRequest {
  data: CreateAccountData;
  signatureInfo: SignatureInfo;
}
