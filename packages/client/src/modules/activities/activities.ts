import {
  createInstantLoansActor,
  type InstantLoansCanisterError,
} from "../../core/canisters/instant-loans/actor";
import { LiquidiumError, LiquidiumErrorCode } from "../../core/errors";
import {
  buildActivitiesPath,
  buildActivityStatusPath,
} from "../../core/sdk-api-paths";
import type { ApiClient } from "../../core/transports/api-client";
import type { CanisterContext } from "../../core/transports/canister-context";
import { Chain } from "../../core/types";
import { parseBigInt } from "../../core/utils/bigint";
import { intFromPublicId } from "../instant-loans/ref-code";
import type {
  Activity,
  ActivityTopUp,
  GetActivityStatusRequest,
  GetActivityStatusResponse,
  ListActivitiesRequest,
} from "./types";
import { ActivityDirection, ActivityStage, ActivityState } from "./types";

const PRE_TERMINAL_ETH_ACTIVITY_ID_PREFIX = "pre_terminal_eth_";

type ActivityTopUpWire = Omit<
  ActivityTopUp,
  "depositedAmount" | "feeAmount" | "shortfallAmount"
> & {
  depositedAmount: string;
  feeAmount: string;
  shortfallAmount: string;
};

type ActivityWire = Omit<Activity, "amount" | "topUp"> & {
  amount: string;
  topUp?: ActivityTopUpWire;
};

type ListActivitiesResponseWire = {
  success: true;
  activities: ActivityWire[];
};

type ActivityStatusResponseWire =
  | {
      success: true;
      found: true;
      activity: ActivityWire;
    }
  | {
      success: true;
      found: false;
      id: string;
    };

export class ActivitiesModule {
  constructor(
    readonly apiClient: ApiClient | undefined,
    readonly canisterContext: CanisterContext
  ) {}

  /**
   * Lists profile activities. Defaults to all activities.
   *
   * Requires `apiBaseUrl` on the client.
   */
  async list(request: ListActivitiesRequest): Promise<Activity[]> {
    const apiClient = this.requireApi();
    const response = await apiClient.get<ListActivitiesResponseWire>(
      buildActivitiesPath({
        ...request,
        state: request.state ?? ActivityState.all,
      })
    );

    return response.activities.map(mapActivity);
  }

  /**
   * Fetches the latest status for a single receipt/activity id.
   *
   * Requires `apiBaseUrl` on the client.
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
        "Activities require an API base URL in client config"
      );
    }

    return this.apiClient;
  }

  private async resolveProfileId(
    request: GetActivityStatusRequest
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
      const result = await createInstantLoansActor(
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
  const { amount, topUp: topUpWire, ...activity } = wire;
  const stage = wire.stage ?? deriveActivityStage(wire);
  const topUp = topUpWire ? mapActivityTopUp(topUpWire) : undefined;

  return {
    ...activity,
    ...(stage ? { stage } : {}),
    ...(topUp ? { topUp } : {}),
    amount: parseBigInt(amount, "activity amount"),
  };
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

function deriveActivityStage(wire: ActivityWire): Activity["stage"] {
  if (
    wire.id.startsWith(PRE_TERMINAL_ETH_ACTIVITY_ID_PREFIX) &&
    wire.direction === ActivityDirection.inflow &&
    wire.chain === Chain.ETH
  ) {
    return ActivityStage.deposited;
  }

  return undefined;
}
