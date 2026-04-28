import { LiquidiumError, LiquidiumErrorCode } from "../../core/errors";
import {
  buildActivitiesPath,
  buildActivityStatusPath,
} from "../../core/sdk-api-paths";
import type { ApiClient } from "../../core/transports/api-client";
import { parseBigInt } from "../../core/utils/bigint";
import type {
  Activity,
  GetActivityStatusRequest,
  GetActivityStatusResponse,
  ListActivitiesRequest,
} from "./types";

type ActivityWire = Omit<Activity, "amount"> & {
  amount: string;
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
  constructor(readonly apiClient: ApiClient | undefined) {}

  /**
   * Lists profile activities. Defaults to currently active activities.
   *
   * Requires `apiBaseUrl` on the client.
   */
  async list(request: ListActivitiesRequest): Promise<Activity[]> {
    const apiClient = this.requireApi();
    const response = await apiClient.get<ListActivitiesResponseWire>(
      buildActivitiesPath(request)
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
    const response = await apiClient.get<ActivityStatusResponseWire>(
      buildActivityStatusPath(request)
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
        LiquidiumErrorCode.SERVICE_UNAVAILABLE,
        "Activities require an API base URL in client config"
      );
    }

    return this.apiClient;
  }
}

function mapActivity(wire: ActivityWire): Activity {
  return {
    ...wire,
    amount: parseBigInt(wire.amount, "activity amount"),
  };
}
