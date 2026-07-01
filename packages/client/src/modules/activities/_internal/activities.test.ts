import { Actor } from "@icp-sdk/core/agent";
import { Principal } from "@icp-sdk/core/principal";
import { afterEach, describe, expect, test, vi } from "vitest";
import { DEFAULT_API_BASE_URL } from "../../../core/config";
import {
  LiquidiumClient,
  LiquidiumErrorCode,
  publicIdFromInt,
} from "../../../index";

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("ActivitiesModule", () => {
  test("uses default prod API base URL when no apiBaseUrl configured", async () => {
    // given
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ activities: [] }), {
        status: 200,
      })
    );
    const client = new LiquidiumClient({});

    // when
    const result = await client.activities.list({ profileId: "profile-1" });

    // then
    expect(result).toEqual([]);
    expect(fetchSpy).toHaveBeenCalledWith(
      `${DEFAULT_API_BASE_URL}/v2/activities?profileId=profile-1&filter=active`,
      expect.objectContaining({ method: "GET" })
    );
  });

  test("lists active activities by default through the sdk api", async () => {
    // given
    const ACTIVITY_AMOUNT = "100000";
    const ACTIVITY_AMOUNT_BASE_UNITS = 100000n;
    const ACTIVITY_TIMESTAMP_MS = 1775001600000;
    const ACTIVITY_CONFIRMATIONS = 1;
    const ACTIVITY_REQUIRED_CONFIRMATIONS = 6;
    const responsePayload = {
      activities: [
        {
          id: "activity-1",
          status: {
            operation: "deposit" as const,
            state: "confirming" as const,
            confirmations: ACTIVITY_CONFIRMATIONS,
            requiredConfirmations: ACTIVITY_REQUIRED_CONFIRMATIONS,
          },
          poolId: "pool-1",
          asset: "BTC",
          chain: "BTC" as const,
          amount: ACTIVITY_AMOUNT,
          timestampMs: ACTIVITY_TIMESTAMP_MS,
          txids: ["tx-1"],
        },
      ],
    };
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(responsePayload), {
        status: 200,
        headers: {
          "content-type": "application/json",
        },
      })
    );
    const client = new LiquidiumClient({
      apiBaseUrl: "https://app.liquidium.fi/api/sdk",
    });

    // when
    const result = await client.activities.list({
      profileId: "profile-1",
    });

    // then
    expect(result).toEqual([
      {
        id: "activity-1",
        status: {
          operation: "deposit",
          state: "confirming",
          confirmations: ACTIVITY_CONFIRMATIONS,
          requiredConfirmations: ACTIVITY_REQUIRED_CONFIRMATIONS,
        },
        poolId: "pool-1",
        asset: "BTC",
        chain: "BTC",
        amount: ACTIVITY_AMOUNT_BASE_UNITS,
        timestampMs: ACTIVITY_TIMESTAMP_MS,
        txids: ["tx-1"],
      },
    ]);
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://app.liquidium.fi/api/sdk/v2/activities?profileId=profile-1&filter=active",
      {
        method: "GET",
        headers: undefined,
        body: undefined,
        signal: expect.any(AbortSignal),
      }
    );
  });

  test("lists activities by instant loan short ref", async () => {
    // given
    const LOAN_ID = 42n;
    const PROFILE_ID = "aaaaa-aa";
    const SHORT_REF = publicIdFromInt(LOAN_ID);
    const getLoan = vi.fn().mockResolvedValue({
      Ok: {
        lending_profile: Principal.fromText(PROFILE_ID),
      },
    });
    vi.spyOn(Actor, "createActor").mockReturnValue({
      get_loan: getLoan,
    } as never);
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          activities: [],
        }),
        {
          status: 200,
          headers: {
            "content-type": "application/json",
          },
        }
      )
    );
    const client = new LiquidiumClient({
      apiBaseUrl: "https://app.liquidium.fi/api/sdk",
      canisterIds: { instantLoans: "kzrva-ziaaa-aaaar-qamyq-cai" },
    });

    // when
    const result = await client.activities.list({
      shortRef: SHORT_REF,
      filter: "active",
    });

    // then
    expect(getLoan).toHaveBeenCalledWith(LOAN_ID);
    expect(result).toEqual([]);
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://app.liquidium.fi/api/sdk/v2/activities?profileId=aaaaa-aa&filter=active",
      {
        method: "GET",
        headers: undefined,
        body: undefined,
        signal: expect.any(AbortSignal),
      }
    );
  });

  test("gets activity status by receipt id", async () => {
    // given
    const ACTIVITY_AMOUNT = "50000";
    const ACTIVITY_AMOUNT_BASE_UNITS = 50000n;
    const ACTIVITY_TIMESTAMP_MS = 1775001600000;
    const ACTIVITY_CONFIRMATIONS = 0;
    const ACTIVITY_REQUIRED_CONFIRMATIONS = 1;
    const responsePayload = {
      found: true as const,
      activity: {
        id: "activity-1",
        status: {
          operation: "borrow" as const,
          state: "confirming" as const,
          confirmations: ACTIVITY_CONFIRMATIONS,
          requiredConfirmations: ACTIVITY_REQUIRED_CONFIRMATIONS,
        },
        poolId: "pool-1",
        asset: "BTC",
        chain: "BTC" as const,
        amount: ACTIVITY_AMOUNT,
        timestampMs: ACTIVITY_TIMESTAMP_MS,
        txids: ["tx-1"],
      },
    };
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(responsePayload), {
        status: 200,
        headers: {
          "content-type": "application/json",
        },
      })
    );
    const client = new LiquidiumClient({
      apiBaseUrl: "https://app.liquidium.fi/api/sdk",
    });

    // when
    const result = await client.activities.getStatus({
      profileId: "profile-1",
      id: "activity-1",
    });

    // then
    expect(result).toEqual({
      found: true,
      activity: {
        id: "activity-1",
        status: {
          operation: "borrow",
          state: "confirming",
          confirmations: ACTIVITY_CONFIRMATIONS,
          requiredConfirmations: ACTIVITY_REQUIRED_CONFIRMATIONS,
        },
        poolId: "pool-1",
        asset: "BTC",
        chain: "BTC",
        amount: ACTIVITY_AMOUNT_BASE_UNITS,
        timestampMs: ACTIVITY_TIMESTAMP_MS,
        txids: ["tx-1"],
      },
    });
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://app.liquidium.fi/api/sdk/v2/activities/activity-1/status?profileId=profile-1",
      {
        method: "GET",
        headers: undefined,
        body: undefined,
        signal: expect.any(AbortSignal),
      }
    );
  });

  test("returns not found when the activity status API misses a receipt", async () => {
    // given
    const ACTIVITY_ID = "missing-activity";
    const responsePayload = {
      found: false as const,
      id: ACTIVITY_ID,
    };
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(responsePayload), {
        status: 200,
        headers: {
          "content-type": "application/json",
        },
      })
    );
    const client = new LiquidiumClient({
      apiBaseUrl: "https://app.liquidium.fi/api/sdk",
    });

    // when
    const result = await client.activities.getStatus({
      profileId: "profile-1",
      id: ACTIVITY_ID,
    });

    // then
    expect(result).toEqual({ found: false, id: ACTIVITY_ID });
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://app.liquidium.fi/api/sdk/v2/activities/missing-activity/status?profileId=profile-1",
      expect.objectContaining({ method: "GET" })
    );
  });

  test("rejects malformed instant loan references before resolving activities", async () => {
    // given
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const actorCreateSpy = vi.spyOn(Actor, "createActor");
    const client = new LiquidiumClient({
      apiBaseUrl: "https://app.liquidium.fi/api/sdk",
    });

    // when
    const result = client.activities.list({
      shortRef: "invalid-ref",
    });

    // then
    await expect(result).rejects.toMatchObject({
      code: LiquidiumErrorCode.VALIDATION_ERROR,
      message: "Invalid instant loan reference",
    });
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(actorCreateSpy).not.toHaveBeenCalled();
  });

  test("gets activity status by instant loan short ref", async () => {
    // given
    const LOAN_ID = 42n;
    const PROFILE_ID = "aaaaa-aa";
    const SHORT_REF = publicIdFromInt(LOAN_ID);
    const ACTIVITY_AMOUNT = "50000";
    const ACTIVITY_AMOUNT_BASE_UNITS = 50000n;
    const ACTIVITY_TIMESTAMP_MS = 1775001600000;
    const ACTIVITY_CONFIRMATIONS = 0;
    const ACTIVITY_REQUIRED_CONFIRMATIONS = 1;
    const getLoan = vi.fn().mockResolvedValue({
      Ok: {
        lending_profile: Principal.fromText(PROFILE_ID),
      },
    });
    const responsePayload = {
      found: true as const,
      activity: {
        id: "activity-1",
        status: {
          operation: "borrow" as const,
          state: "confirming" as const,
          confirmations: ACTIVITY_CONFIRMATIONS,
          requiredConfirmations: ACTIVITY_REQUIRED_CONFIRMATIONS,
        },
        poolId: "pool-1",
        asset: "BTC",
        chain: "BTC" as const,
        amount: ACTIVITY_AMOUNT,
        timestampMs: ACTIVITY_TIMESTAMP_MS,
        txids: ["tx-1"],
      },
    };
    vi.spyOn(Actor, "createActor").mockReturnValue({
      get_loan: getLoan,
    } as never);
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(responsePayload), {
        status: 200,
        headers: {
          "content-type": "application/json",
        },
      })
    );
    const client = new LiquidiumClient({
      apiBaseUrl: "https://app.liquidium.fi/api/sdk",
      canisterIds: { instantLoans: "kzrva-ziaaa-aaaar-qamyq-cai" },
    });

    // when
    const result = await client.activities.getStatus({
      shortRef: SHORT_REF,
      id: "activity-1",
    });

    // then
    expect(getLoan).toHaveBeenCalledWith(LOAN_ID);
    expect(result).toEqual({
      found: true,
      activity: {
        id: "activity-1",
        status: {
          operation: "borrow",
          state: "confirming",
          confirmations: ACTIVITY_CONFIRMATIONS,
          requiredConfirmations: ACTIVITY_REQUIRED_CONFIRMATIONS,
        },
        poolId: "pool-1",
        asset: "BTC",
        chain: "BTC",
        amount: ACTIVITY_AMOUNT_BASE_UNITS,
        timestampMs: ACTIVITY_TIMESTAMP_MS,
        txids: ["tx-1"],
      },
    });
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://app.liquidium.fi/api/sdk/v2/activities/activity-1/status?profileId=aaaaa-aa",
      {
        method: "GET",
        headers: undefined,
        body: undefined,
        signal: expect.any(AbortSignal),
      }
    );
  });

  test("maps pre-terminal eth inflows with required top-up to action required status", async () => {
    // given
    const ACTIVITY_AMOUNT = "4000000";
    const ACTIVITY_AMOUNT_BASE_UNITS = 4000000n;
    const ACTIVITY_TIMESTAMP_MS = 1777889521994;
    const ACTIVITY_CONFIRMATIONS = 0;
    const ACTIVITY_REQUIRED_CONFIRMATIONS = 64;
    const TOP_UP_FEE_AMOUNT = "5740000";
    const TOP_UP_FEE_AMOUNT_BASE_UNITS = 5740000n;
    const TOP_UP_SHORTFALL_AMOUNT = "1740000";
    const TOP_UP_SHORTFALL_AMOUNT_BASE_UNITS = 1740000n;
    const responsePayload = {
      found: true as const,
      activity: {
        id: "pre_terminal_eth_36",
        status: {
          operation: "deposit" as const,
          state: "action_required" as const,
          confirmations: ACTIVITY_CONFIRMATIONS,
          requiredConfirmations: ACTIVITY_REQUIRED_CONFIRMATIONS,
        },
        poolId: "7dcux-qqaaa-aaaae-qfc3a-cai",
        asset: "USDT",
        chain: "ETH" as const,
        amount: ACTIVITY_AMOUNT,
        timestampMs: ACTIVITY_TIMESTAMP_MS,
        txids: [
          "0x624f47a2d993c01b20d3fddcf8e5e8afe774d6e29d3702674f564fe825ae472c",
        ],
        topUp: {
          required: true,
          depositedAmount: ACTIVITY_AMOUNT,
          feeAmount: TOP_UP_FEE_AMOUNT,
          shortfallAmount: TOP_UP_SHORTFALL_AMOUNT,
        },
      },
    };
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(responsePayload), {
        status: 200,
        headers: {
          "content-type": "application/json",
        },
      })
    );
    const client = new LiquidiumClient({
      apiBaseUrl: "https://app.liquidium.fi/api/sdk",
    });

    // when
    const result = await client.activities.getStatus({
      profileId: "profile-1",
      id: "0x624f47a2d993c01b20d3fddcf8e5e8afe774d6e29d3702674f564fe825ae472c",
    });

    // then
    expect(result).toEqual({
      found: true,
      activity: {
        id: "pre_terminal_eth_36",
        status: {
          operation: "deposit",
          state: "action_required",
          confirmations: ACTIVITY_CONFIRMATIONS,
          requiredConfirmations: ACTIVITY_REQUIRED_CONFIRMATIONS,
        },
        poolId: "7dcux-qqaaa-aaaae-qfc3a-cai",
        asset: "USDT",
        chain: "ETH",
        amount: ACTIVITY_AMOUNT_BASE_UNITS,
        timestampMs: ACTIVITY_TIMESTAMP_MS,
        txids: [
          "0x624f47a2d993c01b20d3fddcf8e5e8afe774d6e29d3702674f564fe825ae472c",
        ],
        topUp: {
          required: true,
          depositedAmount: ACTIVITY_AMOUNT_BASE_UNITS,
          feeAmount: TOP_UP_FEE_AMOUNT_BASE_UNITS,
          shortfallAmount: TOP_UP_SHORTFALL_AMOUNT_BASE_UNITS,
        },
      },
    });
  });
});
