import type { Chain } from "../../core/types";

/** Activity list state filter. */
export const ActivityFilter = {
  active: "active",
  completed: "completed",
  all: "all",
} as const;
/** Activity list state filter. */
export type ActivityFilter =
  (typeof ActivityFilter)[keyof typeof ActivityFilter];

/** Direction of value movement for an activity. */
export const ActivityDirection = {
  inflow: "inflow",
  outflow: "outflow",
} as const;
/** Direction of value movement for an activity. */
export type ActivityDirection =
  (typeof ActivityDirection)[keyof typeof ActivityDirection];

/** Consumer-facing activity kind. */
export const ActivityKind = {
  deposit: "deposit",
  repayment: "repayment",
  borrow: "borrow",
  withdraw: "withdraw",
} as const;
/** Consumer-facing activity kind. */
export type ActivityKind = (typeof ActivityKind)[keyof typeof ActivityKind];

/** Consumer-facing activity lifecycle status. */
export const ActivityStatus = {
  requested: "requested",
  pending: "pending",
  detected: "detected",
  processing: "processing",
  sent: "sent",
  confirmed: "confirmed",
  failed: "failed",
} as const;
/** Consumer-facing activity lifecycle status. */
export type ActivityStatus =
  (typeof ActivityStatus)[keyof typeof ActivityStatus];

/** Fee top-up state for an inflow activity. */
export interface ActivityTopUp {
  /** Whether another transfer is needed before processing can continue. */
  required: boolean;
  /** Total same-token deposited amount counted toward the current fee. */
  depositedAmount: bigint;
  /** Current deposit-address processing fee. */
  feeAmount: bigint;
  /** Additional amount needed before processing can start. */
  shortfallAmount: bigint;
}

/** Activity kind emitted by deposit or repayment inflows. */
export type InflowActivityKind =
  | typeof ActivityKind.deposit
  | typeof ActivityKind.repayment;
/** Activity kind emitted by borrow or withdraw outflows. */
export type OutflowActivityKind =
  | typeof ActivityKind.borrow
  | typeof ActivityKind.withdraw;

/** Lifecycle status that can appear on an inflow activity. */
export type InflowActivityStatus =
  | typeof ActivityStatus.requested
  | typeof ActivityStatus.pending
  | typeof ActivityStatus.detected
  | typeof ActivityStatus.processing
  | typeof ActivityStatus.confirmed
  | typeof ActivityStatus.failed;
/** Lifecycle status that can appear on an outflow activity. */
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

/** Deposit or repayment activity returned by the activity API. */
export interface InflowActivity extends BaseActivity {
  /** Direction discriminator. */
  direction: typeof ActivityDirection.inflow;
  /** Deposit or repayment kind. */
  kind: InflowActivityKind;
  /** Single consumer-facing lifecycle status. */
  status: InflowActivityStatus;
  /** Fee top-up state when the inflow is below the current processing fee. */
  topUp?: ActivityTopUp;
}

/** Borrow or withdraw activity returned by the activity API. */
export interface OutflowActivity extends BaseActivity {
  /** Direction discriminator. */
  direction: typeof ActivityDirection.outflow;
  /** Borrow or withdraw kind. */
  kind: OutflowActivityKind;
  /** Single consumer-facing lifecycle status. */
  status: OutflowActivityStatus;
  /** Outflows never carry top-up state. */
  topUp?: never;
}

/** Any activity returned by `activities.list` or `activities.getStatus`. */
export type Activity = InflowActivity | OutflowActivity;

/** Request for listing activities by profile id or instant-loan short reference. */
export type ListActivitiesRequest = {
  /** Optional state filter; defaults to `all`. */
  filter?: ActivityFilter;
} & ({ profileId: string } | { shortRef: string });

/** Request for fetching one activity by id and owner identifier. */
export type GetActivityStatusRequest = {
  /** Activity or receipt id to look up. */
  id: string;
} & ({ profileId: string } | { shortRef: string });

/** Result of an activity status lookup. */
export type GetActivityStatusResponse =
  | {
      found: true;
      activity: Activity;
    }
  | {
      found: false;
      id: string;
    };
