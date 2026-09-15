import { afterEach, describe, expect, test, vi } from "vitest";
import { DEFAULT_API_BASE_URL } from "../../../core/config";
import { LiquidiumClient } from "../../../index";

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("HistoryModule protocol activity", () => {
  test("fetches the protocol activity feed through the sdk api", async () => {
    // given
    const responsePayload = {
      items: [
        {
          id: "inflow:supply-1",
          operation: "deposit" as const,
          poolId: "pool-icp",
          asset: "ICP",
          decimals: 8,
          amount: "2014000000",
          timestamp: "2026-04-01T12:00:00.000Z",
          txids: ["3755.9187"],
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
    const client = new LiquidiumClient({});

    // when
    const result = await client.history.getProtocolActivity();

    // then
    expect(result).toEqual([
      {
        id: "inflow:supply-1",
        operation: "deposit",
        poolId: "pool-icp",
        asset: "ICP",
        decimals: 8,
        amount: 2014000000n,
        timestamp: "2026-04-01T12:00:00.000Z",
        txids: ["3755.9187"],
      },
    ]);
    expect(fetchSpy).toHaveBeenCalledWith(
      `${DEFAULT_API_BASE_URL}/v2/history/activities`,
      expect.objectContaining({ method: "GET" })
    );
  });

  test("passes feed filters to the sdk api", async () => {
    // given
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ items: [] }), {
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
    await client.history.getProtocolActivity({
      poolId: "pool-icp",
      operations: ["borrow", "withdrawal"],
      limit: 100,
    });

    // then
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://app.liquidium.fi/api/sdk/v2/history/activities?poolId=pool-icp&operations=borrow%2Cwithdrawal&limit=100",
      expect.objectContaining({ method: "GET" })
    );
  });

  test("rejects protocol activity limits above the API maximum", async () => {
    // given
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const client = new LiquidiumClient({});
    const LIMIT_ABOVE_MAXIMUM = 101;

    // when
    const result = client.history.getProtocolActivity({
      limit: LIMIT_ABOVE_MAXIMUM,
    });

    // then
    await expect(result).rejects.toThrow(
      "History limit must be an integer between 1 and 100"
    );
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
