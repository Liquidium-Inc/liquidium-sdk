import { describe, expect, test, vi } from "vitest";
import { LiquidiumClient, LiquidiumError, LiquidiumErrorCode } from "../index";

describe("LiquidiumClient", () => {
  test("creates a client with default mainnet config", () => {
    // given
    const config = {};

    // when
    const client = new LiquidiumClient(config);

    // then
    expect(client).toBeDefined();
    expect(client.accounts).toBeDefined();
    expect(client.lending).toBeDefined();
    expect(client.positions).toBeDefined();
    expect(client.market).toBeDefined();
    expect(client.activities).toBeDefined();
    expect(client.history).toBeDefined();
  });

  test("creates a client with API base URL", () => {
    // given
    const config = {
      apiBaseUrl: "https://app.liquidium.fi/api",
    };

    // when
    const client = new LiquidiumClient(config);

    // then
    expect(client).toBeDefined();
  });

  test("uses the configured API base URL for SDK API modules", async () => {
    // given
    const API_BASE_URL = "https://api.example.com/sdk";
    const QUERY = "loan-ref";
    const customFetch = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ success: true, candidates: [] }), {
        status: 200,
        headers: { "content-type": "application/json" },
      })
    );
    const client = new LiquidiumClient({
      apiBaseUrl: API_BASE_URL,
      fetch: customFetch,
    });

    // when
    const results = await client.instantLoans.find(QUERY);

    // then
    expect(results).toEqual([]);
    expect(customFetch).toHaveBeenCalledWith(
      `${API_BASE_URL}/v1/instant-loans/find?query=${QUERY}`,
      expect.objectContaining({ method: "GET" })
    );
  });
});

describe("LiquidiumError", () => {
  test("constructs with code and message", () => {
    // given
    const code = LiquidiumErrorCode.POOL_NOT_FOUND;
    const message = "Pool xyz not found";

    // when
    const error = new LiquidiumError(code, message);

    // then
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("LiquidiumError");
    expect(error.code).toBe("POOL_NOT_FOUND");
    expect(error.message).toBe(message);
  });

  test("defaults message to error code", () => {
    // given
    const code = LiquidiumErrorCode.INTERNAL;

    // when
    const error = new LiquidiumError(code);

    // then
    expect(error.message).toBe("INTERNAL");
  });

  test("preserves cause", () => {
    // given
    const original = new Error("network failure");

    // when
    const error = new LiquidiumError(
      LiquidiumErrorCode.NETWORK_ERROR,
      "Failed to connect",
      original
    );

    // then
    expect(error.cause).toBe(original);
  });
});
