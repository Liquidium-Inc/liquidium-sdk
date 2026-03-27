import type { Chain } from "../../core/types";

export interface SignatureInfo {
  signature: string;
  chain: Chain;
  account: string;
}

export interface CreateAccountData {
  expiryTimestamp: bigint;
}

export interface SignableAction<TData, TResult> {
  kind: string;
  account: string;
  message: string;
  data: TData;
  submit(signatureInfo: SignatureInfo): Promise<TResult>;
}

export interface CreateAccountAction
  extends SignableAction<CreateAccountData, string> {
  kind: "create-account";
}

export interface CreateAccountRequest {
  data: CreateAccountData;
  signatureInfo: SignatureInfo;
}
