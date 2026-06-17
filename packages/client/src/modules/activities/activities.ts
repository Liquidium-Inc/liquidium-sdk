import type { InstantLoansCanisterError } from "../../core/canisters/instant-loans/actor";
import { createFlexibleInstantLoansActor } from "../../core/canisters/instant-loans/flexible-actor";
import { LiquidiumError, LiquidiumErrorCode } from "../../core/errors";
import {
  buildActivitiesPath,
  buildActivityStatusPath,
} from "../../core/sdk-api-paths";
import type { LiquidiumStatus } from "../../core/status";
import type { ApiClient } from "../../core/transports/api-client";
import type { CanisterContext } from "../../core/transports/canister-context";
import type { Chain } from "../../core/types";
import { parseBigInt } from "../../core/utils/bigint";
import { intFromPublicId } from "../instant-loans/ref-code";
import type {
  Activity,
  ActivityTopUp,
  GetActivityStatusRequest,
  GetActivityStatusResponse,
  InflowActivityKind,
  ListActivitiesRequest,
  OutflowActivityKind,
} from "./types";
import { ActivityDirection, ActivityFilter } from "./types";

interface ActivityTopUpWire
  extends Omit<
    ActivityTopUp,
    "depositedAmount" | "feeAmount" | "shortfallAmount"
  > {
  depositedAmount: string;
  feeAmount: string;
  shortfallAmount: string;
}

interface ActivityWire {
  id: string;
  direction: Activity["direction"];
  kind: Activity["kind"];
  poolId: string;
  asset: string | null;
  chain: Chain | null;
  amount: string;
  timestampMs: number;
  txid: string | null;
  txids?: string[];
  status: LiquidiumStatus;
  topUp?: ActivityTopUpWire;
}

interface ListActivitiesResponseWire {
  success: true;
  activities: ActivityWire[];
}

interface ActivityStatusFoundResponseWire {
  success: true;
  found: true;
  activity: ActivityWire;
}

interface ActivityStatusNotFoundResponseWire {
  success: true;
  found: false;
  id: string;
}

type ActivityStatusResponseWire =
  | ActivityStatusFoundResponseWire
  | ActivityStatusNotFoundResponseWire;

/** Receipt-oriented activity list and status helpers. */
export class ActivitiesModule {
  constructor(
    private readonly apiClient: ApiClient | undefined,
    private readonly canisterContext: CanisterContext
  ) {}

  /**
   * Lists profile activities. Defaults to all activities.
   *
   * Uses the Liquidium SDK API.
   *
   * @param request - Profile id or instant-loan short reference plus optional lifecycle filter.
   * @returns Activities owned by the resolved profile.
   */
  async list(request: ListActivitiesRequest): Promise<Activity[]> {
    const apiClient = this.requireApi();
    const profileId = await this.resolveProfileId(request);
    const response = await apiClient.get<ListActivitiesResponseWire>(
      buildActivitiesPath({
        profileId,
        filter: request.filter ?? ActivityFilter.all,
      })
    );

    return response.activities.map(mapActivity);
  }

  /**
   * Fetches the latest status for a single receipt/activity id.
   *
   * Uses the Liquidium SDK API.
   *
   * @param request - Activity id plus profile id or instant-loan short reference.
   * @returns The activity when found, otherwise `{ found: false }` with the requested id.
   */
  async getStatus(
    request: GetActivityStatusRequest
  ): Promise<GetActivityStatusResponse> {
    const apiClient = this.requireApi();
    const profileId = await this.resolveProfileId(request);
    const response = await apiClient.get<ActivityStatusResponseWire>(
      buildActivityStatusPath({ id: request.id, profileId })
    );

    if (!response.found) {
      return { found: false, id: response.id };
    }

    return {
      found: true,
      activity: mapActivity(response.activity),
    };
  }

  private requireApi(): ApiClient {
    if (!this.apiClient) {
      throw new LiquidiumError(
        LiquidiumErrorCode.VALIDATION_ERROR,
        "Activities require an API client"
      );
    }

    return this.apiClient;
  }

  private async resolveProfileId(
    request: GetActivityStatusRequest | ListActivitiesRequest
  ): Promise<string> {
    if ("profileId" in request) {
      return request.profileId;
    }

    let loanId: bigint;
    try {
      loanId = intFromPublicId(request.shortRef.trim());
    } catch (error) {
      throw new LiquidiumError(
        LiquidiumErrorCode.VALIDATION_ERROR,
        "Invalid instant loan reference",
        error
      );
    }

    try {
      const result = await createFlexibleInstantLoansActor(
        this.canisterContext
      ).get_loan(loanId);

      if ("Err" in result) {
        throw mapInstantLoanLookupError(result.Err);
      }

      return result.Ok.lending_profile.toText();
    } catch (error) {
      if (error instanceof LiquidiumError) {
        throw error;
      }

      throw new LiquidiumError(
        LiquidiumErrorCode.CANISTER_REJECTED,
        "Unable to resolve instant loan reference",
        error
      );
    }
  }
}

function mapInstantLoanLookupError(
  error: InstantLoansCanisterError
): LiquidiumError {
  const [key] = Object.entries(error)[0] ?? ["Unknown"];

  if (key === "LoanNotFound") {
    return new LiquidiumError(
      LiquidiumErrorCode.POSITION_NOT_FOUND,
      "Instant loan not found"
    );
  }

  return new LiquidiumError(LiquidiumErrorCode.INTERNAL, key);
}

function mapActivity(wire: ActivityWire): Activity {
  const { amount, status, topUp: topUpWire, ...activity } = wire;
  const topUp =
    activity.direction === ActivityDirection.inflow && topUpWire
      ? mapActivityTopUp(topUpWire)
      : undefined;

  if (activity.direction === ActivityDirection.inflow) {
    const kind = mapInflowActivityKind(activity.kind);

    return {
      ...activity,
      direction: ActivityDirection.inflow,
      kind,
      status,
      ...(topUp ? { topUp } : {}),
      amount: parseBigInt(amount, "activity amount"),
    };
  }

  const kind = mapOutflowActivityKind(activity.kind);

  return {
    ...activity,
    direction: ActivityDirection.outflow,
    kind,
    status,
    amount: parseBigInt(amount, "activity amount"),
  };
}

function mapInflowActivityKind(kind: Activity["kind"]): InflowActivityKind {
  if (kind === "deposit" || kind === "repayment") {
    return kind;
  }

  throw new LiquidiumError(
    LiquidiumErrorCode.INTERNAL,
    `Invalid inflow activity kind: ${kind}`
  );
}

function mapOutflowActivityKind(kind: Activity["kind"]): OutflowActivityKind {
  if (kind === "borrow" || kind === "withdraw") {
    return kind;
  }

  throw new LiquidiumError(
    LiquidiumErrorCode.INTERNAL,
    `Invalid outflow activity kind: ${kind}`
  );
}

function mapActivityTopUp(wire: ActivityTopUpWire): ActivityTopUp {
  return {
    required: wire.required,
    depositedAmount: parseBigInt(
      wire.depositedAmount,
      "activity top-up deposited amount"
    ),
    feeAmount: parseBigInt(wire.feeAmount, "activity top-up fee amount"),
    shortfallAmount: parseBigInt(
      wire.shortfallAmount,
      "activity top-up shortfall amount"
    ),
  };
}
