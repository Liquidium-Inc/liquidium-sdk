import { LiquidiumError, LiquidiumErrorCode } from "../errors";

export interface ApiClient {
  get<T>(path: string): Promise<T>;
  post<TResponse, TBody>(path: string, body: TBody): Promise<TResponse>;
}

export function createApiClient(opts: {
  baseUrl: string;
  headers?: Record<string, string>;
  timeoutMs: number;
  fetchFn?: typeof fetch;
}): ApiClient {
  return {
    async get<T>(path: string): Promise<T> {
      return await sendRequest<T>(opts, {
        path,
        method: "GET",
      });
    },
    async post<TResponse, TBody>(
      path: string,
      body: TBody
    ): Promise<TResponse> {
      return await sendRequest<TResponse>(opts, {
        path,
        method: "POST",
        body,
      });
    },
  };
}

async function sendRequest<TResponse>(
  opts: {
    baseUrl: string;
    fetchFn?: typeof fetch;
    headers?: Record<string, string>;
    timeoutMs: number;
  },
  request: {
    path: string;
    method: "GET" | "POST";
    body?: unknown;
  }
): Promise<TResponse> {
  const url = `${opts.baseUrl}${request.path}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), opts.timeoutMs);
  const fetchFn = opts.fetchFn ?? fetch;
  const requestHeaders = {
    ...opts.headers,
    ...(request.method === "POST"
      ? {
          "content-type": "application/json",
        }
      : {}),
  };

  try {
    const response = await fetchFn(url, {
      method: request.method,
      headers:
        Object.keys(requestHeaders).length > 0 ? requestHeaders : undefined,
      body:
        request.method === "POST" ? JSON.stringify(request.body) : undefined,
      signal: controller.signal,
    });

    if (!response.ok) {
      const payload = await tryParseJson(response);
      const message =
        getErrorMessage(payload) ??
        `API request failed: ${response.status} ${response.statusText}`;

      throw new LiquidiumError(LiquidiumErrorCode.SERVICE_UNAVAILABLE, message);
    }

    return (await response.json()) as TResponse;
  } catch (error) {
    if (error instanceof LiquidiumError) {
      throw error;
    }

    if (error instanceof DOMException && error.name === "AbortError") {
      throw new LiquidiumError(
        LiquidiumErrorCode.REQUEST_TIMEOUT,
        `Request to ${request.path} timed out after ${opts.timeoutMs}ms`
      );
    }

    throw new LiquidiumError(
      LiquidiumErrorCode.NETWORK_ERROR,
      `Failed to reach API: ${String(error)}`,
      error
    );
  } finally {
    clearTimeout(timeout);
  }
}

async function tryParseJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function getErrorMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const message = (payload as { message?: unknown }).message;
  return typeof message === "string" && message.length > 0 ? message : null;
}
