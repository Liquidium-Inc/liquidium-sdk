import type { Chain } from "../../core/types";

export type PendingInflowKind = "Deposit" | "Repayment";
export type PendingOutflowKind = "Borrow" | "Withdraw";

export type PendingInflowStage =
  | "Logged"
  | "Confirmed"
  | "Pending"
  | "Finalising";

export type PendingOutflowStatus = "Pending" | "Sent";

interface PendingMovementBase {
  id: string;
  poolId: string;
  asset: string;
  chain: Chain;
  amount: bigint;
  timestampMs: number;
  txid: string | null;
  requiredConfirmations: number;
  confirmations: number | null;
}

export interface PendingInflowMovement extends PendingMovementBase {
  direction: "inflow";
  kind: PendingInflowKind;
  stage: PendingInflowStage;
  feeRateSatsPerVByte: number | null;
}

export interface PendingOutflowMovement extends PendingMovementBase {
  direction: "outflow";
  kind: PendingOutflowKind;
  status: PendingOutflowStatus;
}

export type PendingMovement = PendingInflowMovement | PendingOutflowMovement;
