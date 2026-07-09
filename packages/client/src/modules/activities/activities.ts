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
import { Chain, type Chain as ChainName } from "../../core/types";
import { parseBigInt } from "../../core/utils/bigint";
import { intFromPublicId } from "../instant-loans/ref-code";
import type {
  Activity,
  ActivityTopUp,
  GetActivityStatusRequest,
  GetActivityStatusResponse,
  InflowActivity,
  InflowActivityStatus,
  ListActivitiesRequest,
  OutflowActivity,
  OutflowActivityStatus,
} from "./types";
import { ActivityFilter } from "./types";

type ActivityAssetKindWire = "native_asset" | "ck_asset";

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
  poolId: string;
  asset: string | null;
  chain: ChainName | null;
  assetKind: ActivityAssetKindWire;
  amount: string;
  timestampMs: number;
  txids?: string[];
  status: LiquidiumStatus;
  topUp?: ActivityTopUpWire;
}

interface ListActivitiesResponseWire {
  activities: ActivityWire[];
}

interface ActivityStatusFoundResponseWire {
  found: true;
  activity: ActivityWire;
}

interface ActivityStatusNotFoundResponseWire {
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
   * Lists profile activities. Defaults to active activities.
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
        filter: request.filter ?? ActivityFilter.active,
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
  const amount = parseBigInt(wire.amount, "activity amount");
  const chain = wire.assetKind === "ck_asset" ? Chain.ICP : wire.chain;

  if (isInflowOperation(wire.status.operation)) {
    const activity: InflowActivity = {
      id: wire.id,
      poolId: wire.poolId,
      asset: wire.asset,
      chain,
      amount,
      timestampMs: wire.timestampMs,
      status: wire.status as InflowActivityStatus,
    };

    if (wire.txids) {
      activity.txids = wire.txids;
    }

    if (wire.topUp) {
      activity.topUp = mapActivityTopUp(wire.topUp);
    }

    return activity;
  }

  if (isOutflowOperation(wire.status.operation)) {
    const activity: OutflowActivity = {
      id: wire.id,
      poolId: wire.poolId,
      asset: wire.asset,
      chain,
      amount,
      timestampMs: wire.timestampMs,
      status: wire.status as OutflowActivityStatus,
    };

    if (wire.txids) {
      activity.txids = wire.txids;
    }

    return activity;
  }

  throw new LiquidiumError(
    LiquidiumErrorCode.INTERNAL,
    `Invalid activity operation: ${wire.status.operation}`
  );
}

function isInflowOperation(operation: LiquidiumStatus["operation"]): boolean {
  return operation === "deposit" || operation === "repayment";
}

function isOutflowOperation(operation: LiquidiumStatus["operation"]): boolean {
  return operation === "borrow" || operation === "withdrawal";
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
