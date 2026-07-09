import type { LiquidiumOperation, LiquidiumStatus } from "../../core/status";
import type { Chain } from "../../core/types";

/** Activity list lifecycle filter. */
export const ActivityFilter = {
  active: "active",
  completed: "completed",
  all: "all",
} as const;
/** Activity list lifecycle filter. */
export type ActivityFilter =
  (typeof ActivityFilter)[keyof typeof ActivityFilter];

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

/** Operation emitted by deposit or repayment inflows. */
export type InflowActivityOperation = Extract<
  LiquidiumOperation,
  "deposit" | "repayment"
>;
/** Operation emitted by borrow or withdrawal outflows. */
export type OutflowActivityOperation = Extract<
  LiquidiumOperation,
  "borrow" | "withdrawal"
>;

export type InflowActivityStatus = LiquidiumStatus & {
  operation: InflowActivityOperation;
};
export type OutflowActivityStatus = LiquidiumStatus & {
  operation: OutflowActivityOperation;
};

interface BaseActivity {
  id: string;
  poolId: string;
  asset: string | null;
  chain: Chain | null;
  amount: bigint;
  timestampMs: number;
  /** Chain transaction ids associated with the activity when available. */
  txids?: string[];
}

/** Deposit or repayment activity returned by the activity API. */
export interface InflowActivity extends BaseActivity {
  /** Shared consumer-facing lifecycle status. */
  status: InflowActivityStatus;
  /** Fee top-up state when the inflow is below the current processing fee. */
  topUp?: ActivityTopUp;
}

/** Borrow or withdrawal activity returned by the activity API. */
export interface OutflowActivity extends BaseActivity {
  /** Shared consumer-facing lifecycle status. */
  status: OutflowActivityStatus;
  /** Outflows never carry top-up state. */
  topUp?: never;
}

/** Any activity returned by `activities.list` or `activities.getStatus`. */
export type Activity = InflowActivity | OutflowActivity;

/** Shared request fields for listing activities. */
export interface BaseListActivitiesRequest {
  /** Optional lifecycle filter; defaults to `active`. */
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
