import type { Chain } from "../../core/types";

export const ActivityFilter = {
  active: "active",
  completed: "completed",
  all: "all",
} as const;
export type ActivityFilter =
  (typeof ActivityFilter)[keyof typeof ActivityFilter];

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
  detected: "detected",
  processing: "processing",
  sent: "sent",
  confirmed: "confirmed",
  failed: "failed",
} as const;
export type ActivityStatus =
  (typeof ActivityStatus)[keyof typeof ActivityStatus];

export interface ActivityTopUp {
  required: boolean;
  /** Total same-token deposited amount counted toward the current fee. */
  depositedAmount: bigint;
  /** Current deposit-address processing fee. */
  feeAmount: bigint;
  /** Additional amount needed before processing can start. */
  shortfallAmount: bigint;
}

export type InflowActivityKind =
  | typeof ActivityKind.deposit
  | typeof ActivityKind.repayment;
export type OutflowActivityKind =
  | typeof ActivityKind.borrow
  | typeof ActivityKind.withdraw;

export type InflowActivityStatus =
  | typeof ActivityStatus.requested
  | typeof ActivityStatus.pending
  | typeof ActivityStatus.detected
  | typeof ActivityStatus.processing
  | typeof ActivityStatus.confirmed
  | typeof ActivityStatus.failed;
export type OutflowActivityStatus =
  | typeof ActivityStatus.requested
  | typeof ActivityStatus.pending
  | typeof ActivityStatus.sent
  | typeof ActivityStatus.confirmed
  | typeof ActivityStatus.failed;

interface BaseActivity {
  id: string;
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

export interface InflowActivity extends BaseActivity {
  direction: typeof ActivityDirection.inflow;
  kind: InflowActivityKind;
  /** Single consumer-facing lifecycle status. */
  status: InflowActivityStatus;
  topUp?: ActivityTopUp;
}

export interface OutflowActivity extends BaseActivity {
  direction: typeof ActivityDirection.outflow;
  kind: OutflowActivityKind;
  /** Single consumer-facing lifecycle status. */
  status: OutflowActivityStatus;
  topUp?: never;
}

export type Activity = InflowActivity | OutflowActivity;

export type ListActivitiesRequest = {
  filter?: ActivityFilter;
} & ({ profileId: string } | { shortRef: string });

export type GetActivityStatusRequest = {
  id: string;
} & ({ profileId: string } | { shortRef: string });

export type GetActivityStatusResponse =
  | {
      found: true;
      activity: Activity;
    }
  | {
      found: false;
      id: string;
    };
