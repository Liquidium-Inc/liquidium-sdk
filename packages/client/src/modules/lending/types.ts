import type { Inflowtype, Outflowtype } from "../../core/types";

export interface OutflowDetails {
  id: string;
  outflowType: Outflowtype;
  outflowRef?: string;
  amount: bigint;
}

export interface CkInflowAccount {
  account: string;
  owner: string;
  subaccount: Uint8Array;
}

export interface BtcDepositAddresses {
  deposit: string;
  repayment: string;
}

export type LendingInflowType = Inflowtype;
