import type { Chain } from "../../core/types";

export const ActivityState = {
  active: "active",
  completed: "completed",
  all: "all",
} as const;
export type ActivityState = (typeof ActivityState)[keyof typeof ActivityState];

export const ActivityDirection = {
  inflow: "inflow",
  outflow: "outflow",
} as const;
export type ActivityDirection =
  (typeof ActivityDirection)[keyof typeof ActivityDirection];

export const ActivityKind = {
  deposit: "deposit",
  repayment: "repayment",
  borrow: "borrow",
  withdraw: "withdraw",
} as const;
export type ActivityKind = (typeof ActivityKind)[keyof typeof ActivityKind];

export const ActivityStatus = {
  requested: "requested",
  pending: "pending",
  sent: "sent",
  confirmed: "confirmed",
  failed: "failed",
} as const;
export type ActivityStatus =
  (typeof ActivityStatus)[keyof typeof ActivityStatus];

export interface Activity {
  id: string;
  direction: ActivityDirection;
  kind: ActivityKind;
  status: ActivityStatus;
  poolId: string;
  asset: string | null;
  chain: Chain | null;
  amount: bigint;
  timestampMs: number;
  txid: string | null;
  txids?: string[];
  confirmations: number | null;
  requiredConfirmations: number | null;
}

export interface ListActivitiesRequest {
  profileId: string;
  state?: ActivityState;
}

export interface GetActivityStatusRequest {
  profileId: string;
  id: string;
}

export type GetActivityStatusResponse =
  | {
      found: true;
      activity: Activity;
    }
  | {
      found: false;
      id: string;
    };
