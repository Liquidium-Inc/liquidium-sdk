import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { LiquidiumError, LiquidiumErrorCode } from "../../errors";
import { createApiClient } from "../api-client";

describe("ApiClient", () => {
  const MOCK_BASE_URL = "https://api.example.com";
  const TIMEOUT_MS = 5_000;

  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("returns parsed JSON on success", async () => {
    // given
    const expected = { pools: [{ id: "pool-1" }] };
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify(expected), { status: 200 })
    );
    const client = createApiClient({
      baseUrl: MOCK_BASE_URL,
      timeoutMs: TIMEOUT_MS,
    });

    // when
    const result = await client.get("/v1/markets/pools");

    // then
    expect(result).toEqual(expected);
    expect(fetch).toHaveBeenCalledWith(
      `${MOCK_BASE_URL}/v1/markets/pools`,
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    );
  });

  test("normalizes trailing slashes from the base URL", async () => {
    // given
    const expected = { success: true };
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify(expected), { status: 200 })
    );
    const client = createApiClient({
      baseUrl: `${MOCK_BASE_URL}/`,
      timeoutMs: TIMEOUT_MS,
    });

    // when
    const result = await client.get("/v1/markets/pools");

    // then
    expect(result).toEqual(expected);
    expect(fetch).toHaveBeenCalledWith(
      `${MOCK_BASE_URL}/v1/markets/pools`,
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    );
  });

  test("throws SERVICE_UNAVAILABLE on non-200 response", async () => {
    // given
    vi.mocked(fetch).mockResolvedValue(
      new Response("Not Found", { status: 404, statusText: "Not Found" })
    );
    const client = createApiClient({
      baseUrl: MOCK_BASE_URL,
      timeoutMs: TIMEOUT_MS,
    });

    // when

    // then
    await expect(client.get("/v1/missing")).rejects.toThrow(LiquidiumError);
    await expect(client.get("/v1/missing")).rejects.toMatchObject({
      code: LiquidiumErrorCode.SERVICE_UNAVAILABLE,
    });
  });

  test("includes trace identifiers on api errors", async () => {
    // given
    const TRACE_ID = "trace-1";
    const REQUEST_ID = "request-1";
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ message: "Invalid request" }), {
        status: 400,
        headers: {
          "x-request-id": REQUEST_ID,
          "x-trace-id": TRACE_ID,
        },
      })
    );
    const client = createApiClient({
      baseUrl: MOCK_BASE_URL,
      timeoutMs: TIMEOUT_MS,
    });

    // when

    // then
    await expect(client.get("/v1/test")).rejects.toMatchObject({
      code: LiquidiumErrorCode.SERVICE_UNAVAILABLE,
      message: `Invalid request (traceId=${TRACE_ID}, requestId=${REQUEST_ID})`,
      requestId: REQUEST_ID,
      traceId: TRACE_ID,
    });
  });

  test("throws NETWORK_ERROR on fetch failure", async () => {
    // given
    vi.mocked(fetch).mockRejectedValue(new TypeError("fetch failed"));
    const client = createApiClient({
      baseUrl: MOCK_BASE_URL,
      timeoutMs: TIMEOUT_MS,
    });

    // when

    // then
    await expect(client.get("/v1/test")).rejects.toThrow(LiquidiumError);
    await expect(client.get("/v1/test")).rejects.toMatchObject({
      code: LiquidiumErrorCode.NETWORK_ERROR,
    });
  });

  test("uses configured default headers", async () => {
    // given
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ success: true }), { status: 200 })
    );
    const client = createApiClient({
      baseUrl: MOCK_BASE_URL,
      headers: {
        authorization: "Bearer token",
      },
      timeoutMs: TIMEOUT_MS,
    });

    // when
    await client.post("/v1/test", { ok: true });

    // then
    expect(fetch).toHaveBeenCalledWith(
      `${MOCK_BASE_URL}/v1/test`,
      expect.objectContaining({
        headers: {
          authorization: "Bearer token",
          "content-type": "application/json",
        },
      })
    );
  });

  test("uses configured fetch implementation", async () => {
    // given
    const customFetch = vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        new Response(JSON.stringify({ ok: true }), { status: 200 })
      );
    const client = createApiClient({
      baseUrl: MOCK_BASE_URL,
      fetchFn: customFetch,
      timeoutMs: TIMEOUT_MS,
    });

    // when
    const result = await client.get("/v1/custom-fetch");

    // then
    expect(result).toEqual({ ok: true });
    expect(customFetch).toHaveBeenCalledWith(
      `${MOCK_BASE_URL}/v1/custom-fetch`,
      expect.objectContaining({ method: "GET" })
    );
  });
});
