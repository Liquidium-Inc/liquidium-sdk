import type { Asset, Chain } from "../../core/types";

export interface PendingInflow {
  type: "Deposit" | "Repayment";
  amount: bigint;
  chain: Chain;
  asset: Asset;
  poolId: string;
}

export interface PendingOutflow {
  amount: bigint;
  account: string;
  chain: Chain;
  asset: Asset;
  txid?: string;
  poolId: string;
}

export interface PendingMovements {
  inflows: PendingInflow[];
  outflows: PendingOutflow[];
}
