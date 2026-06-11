import type { Chain } from "../../core/types";
import type { LiquidiumStatus } from "../../core/status";

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
  /** Shared consumer-facing lifecycle status. */
  status: LiquidiumStatus;
  /** Fee top-up state when the inflow is below the current processing fee. */
  topUp?: ActivityTopUp;
}

/** Borrow or withdraw activity returned by the activity API. */
export interface OutflowActivity extends BaseActivity {
  /** Direction discriminator. */
  direction: typeof ActivityDirection.outflow;
  /** Borrow or withdraw kind. */
  kind: OutflowActivityKind;
  /** Shared consumer-facing lifecycle status. */
  status: LiquidiumStatus;
  /** Outflows never carry top-up state. */
  topUp?: never;
}

/** Any activity returned by `activities.list` or `activities.getStatus`. */
export type Activity = InflowActivity | OutflowActivity;

/** Shared request fields for listing activities. */
export interface BaseListActivitiesRequest {
  /** Optional state filter; defaults to `all`. */
  filter?: ActivityFilter;
}

/** Activity list request scoped to a Liquidium profile. */
export interface ListActivitiesByProfileRequest
  extends BaseListActivitiesRequest {
  /** Profile principal text to list activities for. */
  profileId: string;
}

/** Activity list request scoped to an instant-loan short reference. */
export interface ListActivitiesByShortRefRequest
  extends BaseListActivitiesRequest {
  /** Instant-loan short reference to list activities for. */
  shortRef: string;
}

/** Request for listing activities by profile id or instant-loan short reference. */
export type ListActivitiesRequest =
  | ListActivitiesByProfileRequest
  | ListActivitiesByShortRefRequest;

/** Shared request fields for an activity status lookup. */
export interface BaseGetActivityStatusRequest {
  /** Activity or receipt id to look up. */
  id: string;
}

/** Activity status lookup scoped to a Liquidium profile. */
export interface GetActivityStatusByProfileRequest
  extends BaseGetActivityStatusRequest {
  /** Profile principal text that owns the activity. */
  profileId: string;
}

/** Activity status lookup scoped to an instant-loan short reference. */
export interface GetActivityStatusByShortRefRequest
  extends BaseGetActivityStatusRequest {
  /** Instant-loan short reference that owns the activity. */
  shortRef: string;
}

/** Request for fetching one activity by id and owner identifier. */
export type GetActivityStatusRequest =
  | GetActivityStatusByProfileRequest
  | GetActivityStatusByShortRefRequest;

/** Successful activity status lookup result. */
export interface ActivityStatusFoundResponse {
  /** Indicates the activity was found. */
  found: true;
  /** Matched activity. */
  activity: Activity;
}

/** Missing activity status lookup result. */
export interface ActivityStatusNotFoundResponse {
  /** Indicates the activity was not found. */
  found: false;
  /** Requested activity or receipt id. */
  id: string;
}

/** Result of an activity status lookup. */
export type GetActivityStatusResponse =
  | ActivityStatusFoundResponse
  | ActivityStatusNotFoundResponse;
