import { P2pEvmError, P2pEvmErrorCode } from "../errors";

const DOM_EXCEPTION_ABORT_ERROR_NAME = "AbortError";
const HTTP_HEADER_AUTHORIZATION = "authorization";
const HTTP_HEADER_CONTENT_TYPE = "content-type";
const HTTP_HEADER_REQUEST_ID = "x-request-id";
const HTTP_METHOD_GET = "GET";
const HTTP_METHOD_POST = "POST";
const MIME_TYPE_APPLICATION_JSON = "application/json";
const HTTP_STATUS_UNAUTHORIZED = 401;
const HTTP_STATUS_NOT_FOUND = 404;
const HTTP_STATUS_TOO_MANY_REQUESTS = 429;
const HTTP_STATUS_SERVER_ERROR_MIN = 500;

export interface ApiClient {
  get<T>(path: string): Promise<T>;
  post<TResponse, TBody>(path: string, body: TBody): Promise<TResponse>;
}

interface CreateApiClientOptions {
  baseUrl: string;
  /** Partner API key. It belongs on a server: never ship it to a browser. */
  apiKey: string;
  headers?: Record<string, string>;
  timeoutMs: number;
  fetchFn?: typeof fetch;
}

interface ApiRequest {
  path: string;
  method: typeof HTTP_METHOD_GET | typeof HTTP_METHOD_POST;
  body?: unknown;
}

interface JsonErrorPayload {
  message?: unknown;
  requestId?: unknown;
}

export function createApiClient(opts: CreateApiClientOptions): ApiClient {
  const normalizedOpts = {
    ...opts,
    baseUrl: opts.baseUrl.replace(/\/+$/, ""),
  };

  return {
    async get<T>(path: string): Promise<T> {
      return await sendRequest<T>(normalizedOpts, {
        path,
        method: HTTP_METHOD_GET,
      });
    },
    async post<TResponse, TBody>(
      path: string,
      body: TBody
    ): Promise<TResponse> {
      return await sendRequest<TResponse>(normalizedOpts, {
        path,
        method: HTTP_METHOD_POST,
        body,
      });
    },
  };
}

async function sendRequest<TResponse>(
  opts: CreateApiClientOptions,
  request: ApiRequest
): Promise<TResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), opts.timeoutMs);
  const fetchFn = opts.fetchFn ?? fetch;
  const headers: Record<string, string> = {
    ...opts.headers,
    [HTTP_HEADER_AUTHORIZATION]: `Bearer ${opts.apiKey}`,
  };
  if (request.method === HTTP_METHOD_POST) {
    headers[HTTP_HEADER_CONTENT_TYPE] = MIME_TYPE_APPLICATION_JSON;
  }

  try {
    const response = await fetchFn(`${opts.baseUrl}${request.path}`, {
      method: request.method,
      headers,
      body:
        request.method === HTTP_METHOD_POST
          ? JSON.stringify(request.body)
          : undefined,
      signal: controller.signal,
    });

    if (!response.ok) {
      const payload = await tryParseJson(response);
      const requestId =
        response.headers.get(HTTP_HEADER_REQUEST_ID) ??
        getStringField(payload, "requestId");
      const message =
        getStringField(payload, "message") ??
        `API request failed: ${response.status} ${response.statusText}`;

      throw new P2pEvmError(
        errorCodeForStatus(response.status),
        requestId ? `${message} (requestId=${requestId})` : message,
        undefined,
        { requestId }
      );
    }

    return (await response.json()) as TResponse;
  } catch (error) {
    if (error instanceof P2pEvmError) {
      throw error;
    }

    if (
      error instanceof DOMException &&
      error.name === DOM_EXCEPTION_ABORT_ERROR_NAME
    ) {
      throw new P2pEvmError(
        P2pEvmErrorCode.REQUEST_TIMEOUT,
        `Request to ${request.path} timed out after ${opts.timeoutMs}ms`
      );
    }

    // The request carries the API key in a header. Keep the underlying error as `cause` for
    // the caller, but never fold it into the message, which is what tends to get logged.
    throw new P2pEvmError(
      P2pEvmErrorCode.NETWORK_ERROR,
      `Failed to reach the Liquidium API at ${request.path}`,
      error
    );
  } finally {
    clearTimeout(timeout);
  }
}

function errorCodeForStatus(status: number): P2pEvmErrorCode {
  if (status === HTTP_STATUS_UNAUTHORIZED) {
    return P2pEvmErrorCode.UNAUTHORIZED;
  }
  if (status === HTTP_STATUS_NOT_FOUND) {
    return P2pEvmErrorCode.NOT_FOUND;
  }
  if (status === HTTP_STATUS_TOO_MANY_REQUESTS) {
    return P2pEvmErrorCode.RATE_LIMITED;
  }
  if (status >= HTTP_STATUS_SERVER_ERROR_MIN) {
    return P2pEvmErrorCode.SERVICE_UNAVAILABLE;
  }
  return P2pEvmErrorCode.REQUEST_REJECTED;
}

async function tryParseJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function getStringField(
  payload: unknown,
  field: keyof JsonErrorPayload
): string | undefined {
  if (!payload || typeof payload !== "object") {
    return undefined;
  }

  const value = (payload as JsonErrorPayload)[field];
  return typeof value === "string" && value.length > 0 ? value : undefined;
}
