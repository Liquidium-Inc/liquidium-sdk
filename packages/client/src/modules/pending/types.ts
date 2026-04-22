import type { Chain } from "../../core/types";

export const PendingMovementDirection = {
  inflow: "inflow",
  outflow: "outflow",
} as const;
export type PendingMovementDirection =
  (typeof PendingMovementDirection)[keyof typeof PendingMovementDirection];

export const PendingInflowKind = {
  deposit: "deposit",
  repayment: "repayment",
} as const;
export type PendingInflowKind =
  (typeof PendingInflowKind)[keyof typeof PendingInflowKind];

export const PendingOutflowKind = {
  borrow: "borrow",
  withdraw: "withdraw",
} as const;
export type PendingOutflowKind =
  (typeof PendingOutflowKind)[keyof typeof PendingOutflowKind];

export const PendingInflowStage = {
  logged: "logged",
  confirmed: "confirmed",
  pending: "pending",
  finalising: "finalising",
} as const;
export type PendingInflowStage =
  (typeof PendingInflowStage)[keyof typeof PendingInflowStage];

export const PendingOutflowStatus = {
  pending: "pending",
  sent: "sent",
} as const;
export type PendingOutflowStatus =
  (typeof PendingOutflowStatus)[keyof typeof PendingOutflowStatus];

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
  direction: typeof PendingMovementDirection.inflow;
  kind: PendingInflowKind;
  stage: PendingInflowStage;
  feeRateSatsPerVByte: number | null;
}

export interface PendingOutflowMovement extends PendingMovementBase {
  direction: typeof PendingMovementDirection.outflow;
  kind: PendingOutflowKind;
  status: PendingOutflowStatus;
}

export type PendingMovement = PendingInflowMovement | PendingOutflowMovement;
