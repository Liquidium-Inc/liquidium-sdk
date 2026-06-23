import { afterEach, describe, expect, test, vi } from "vitest";
import { DEFAULT_API_BASE_URL } from "../../../core/config";
import { LiquidiumClient } from "../../../index";

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("HistoryModule", () => {
  test("uses default prod API base URL when no apiBaseUrl configured", async () => {
    // given
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ items: [], nextCursor: undefined }), {
        status: 200,
      })
    );
    const client = new LiquidiumClient({});

    // when
    const result = await client.history.getUserTransactionHistory("profile-1");

    // then
    expect(result).toEqual({ items: [], nextCursor: undefined });
    expect(fetchSpy).toHaveBeenCalledWith(
      `${DEFAULT_API_BASE_URL}/v2/history/users/profile-1/transactions`,
      expect.objectContaining({ method: "GET" })
    );
  });

  test("fetches user history through the sdk api", async () => {
    // given
    const responsePayload = {
      items: [
        {
          id: "history-1",
          amount: "100000",
          poolId: "pool-1",
          timestamp: "2026-04-01T00:00:00.000Z",
          status: {
            operation: "deposit" as const,
            state: "completed" as const,
            confirmations: null,
            requiredConfirmations: null,
          },
          txids: ["tx-1"],
        },
      ],
      nextCursor: "2026-04-01T00:00:00.000Z::history-1",
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
    const result = await client.history.getUserTransactionHistory("profile-1", {
      cursor: "2026-03-31T00:00:00.000Z::history-0",
    });

    // then
    expect(result).toEqual({
      items: [
        {
          id: "history-1",
          amount: 100000n,
          poolId: "pool-1",
          timestamp: "2026-04-01T00:00:00.000Z",
          status: {
            operation: "deposit",
            state: "completed",
            confirmations: null,
            requiredConfirmations: null,
          },
          txids: ["tx-1"],
        },
      ],
      nextCursor: "2026-04-01T00:00:00.000Z::history-1",
    });
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://app.liquidium.fi/api/sdk/v2/history/users/profile-1/transactions?cursor=2026-03-31T00%3A00%3A00.000Z%3A%3Ahistory-0",
      {
        method: "GET",
        headers: undefined,
        body: undefined,
        signal: expect.any(AbortSignal),
      }
    );
  });

  test("passes transaction history filters to the sdk api", async () => {
    // given
    const responsePayload = {
      items: [
        {
          id: "history-1",
          amount: "50000",
          poolId: "pool-btc",
          timestamp: "2026-04-02T00:00:00.000Z",
          status: {
            operation: "borrow" as const,
            state: "completed" as const,
            confirmations: null,
            requiredConfirmations: null,
          },
          txids: ["tx-1"],
        },
      ],
      nextCursor: "2026-04-02T00:00:00.000Z::history-1",
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
    const result = await client.history.getUserTransactionHistory("profile-1", {
      cursor: "2026-03-31T00:00:00.000Z::history-0",
      market: "pool-btc",
      poolId: "pool-btc",
      operations: ["borrow"],
      states: ["completed"],
      from: "2026-04-01T00:00:00.000Z",
      to: "2026-04-03T00:00:00.000Z",
      limit: 1,
    });

    // then
    expect(result).toEqual({
      items: [
        {
          id: "history-1",
          amount: 50000n,
          poolId: "pool-btc",
          timestamp: "2026-04-02T00:00:00.000Z",
          status: {
            operation: "borrow",
            state: "completed",
            confirmations: null,
            requiredConfirmations: null,
          },
          txids: ["tx-1"],
        },
      ],
      nextCursor: "2026-04-02T00:00:00.000Z::history-1",
    });
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://app.liquidium.fi/api/sdk/v2/history/users/profile-1/transactions?cursor=2026-03-31T00%3A00%3A00.000Z%3A%3Ahistory-0&market=pool-btc&poolId=pool-btc&operations=borrow&states=completed&from=2026-04-01T00%3A00%3A00.000Z&to=2026-04-03T00%3A00%3A00.000Z&limit=1",
      {
        method: "GET",
        headers: undefined,
        body: undefined,
        signal: expect.any(AbortSignal),
      }
    );
  });

  test("passes liquidation operation to transaction history", async () => {
    // given
    const responsePayload = {
      items: [
        {
          id: "history-9",
          amount: "12345",
          poolId: "pool-btc",
          timestamp: "2026-04-04T00:00:00.000Z",
          status: {
            operation: "liquidation" as const,
            state: "completed" as const,
            confirmations: null,
            requiredConfirmations: null,
          },
          txids: ["tx-9"],
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
    const result = await client.history.getUserTransactionHistory("profile-1", {
      operations: ["liquidation"],
    });

    // then
    expect(result).toEqual({
      items: [
        {
          id: "history-9",
          amount: 12345n,
          poolId: "pool-btc",
          timestamp: "2026-04-04T00:00:00.000Z",
          status: {
            operation: "liquidation",
            state: "completed",
            confirmations: null,
            requiredConfirmations: null,
          },
          txids: ["tx-9"],
        },
      ],
      nextCursor: undefined,
    });
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://app.liquidium.fi/api/sdk/v2/history/users/profile-1/transactions?operations=liquidation",
      {
        method: "GET",
        headers: undefined,
        body: undefined,
        signal: expect.any(AbortSignal),
      }
    );
  });

  test("requests liquidation history with liquidation status operation", async () => {
    // given
    const responsePayload = {
      items: [
        {
          id: "history-9",
          amount: "12345",
          poolId: "pool-btc",
          timestamp: "2026-04-04T00:00:00.000Z",
          status: {
            operation: "liquidation" as const,
            state: "completed" as const,
            confirmations: null,
            requiredConfirmations: null,
          },
        },
      ],
      nextCursor: "2026-04-04T00:00:00.000Z::history-9",
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
    const result = await client.history.getLiquidationHistory("profile-1", {
      cursor: "2026-04-03T00:00:00.000Z::history-8",
      market: "pool-btc",
      from: "2026-04-01T00:00:00.000Z",
      to: "2026-04-05T00:00:00.000Z",
      limit: 1,
    });

    // then
    expect(result.items[0]).toMatchObject({
      amount: 12345n,
      poolId: "pool-btc",
      status: {
        operation: "liquidation",
      },
    });
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://app.liquidium.fi/api/sdk/v2/history/users/profile-1/liquidations?cursor=2026-04-03T00%3A00%3A00.000Z%3A%3Ahistory-8&market=pool-btc&from=2026-04-01T00%3A00%3A00.000Z&to=2026-04-05T00%3A00%3A00.000Z&limit=1",
      {
        method: "GET",
        headers: undefined,
        body: undefined,
        signal: expect.any(AbortSignal),
      }
    );
  });
});
