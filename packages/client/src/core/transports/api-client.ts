import { LiquidiumError, LiquidiumErrorCode } from "../errors";

const DOM_EXCEPTION_ABORT_ERROR_NAME = "AbortError";
const HTTP_HEADER_CONTENT_TYPE = "content-type";
const HTTP_HEADER_REQUEST_ID = "x-request-id";
const HTTP_HEADER_TRACE_ID = "x-trace-id";
const HTTP_METHOD_GET = "GET";
const HTTP_METHOD_POST = "POST";
const MIME_TYPE_APPLICATION_JSON = "application/json";

export interface ApiClient {
  get<T>(path: string): Promise<T>;
  post<TResponse, TBody>(path: string, body: TBody): Promise<TResponse>;
}

export interface CreateApiClientOptions {
  baseUrl: string;
  headers?: Record<string, string>;
  timeoutMs: number;
  fetchFn?: typeof fetch;
}

interface SendRequestOptions {
  baseUrl: string;
  fetchFn?: typeof fetch;
  headers?: Record<string, string>;
  timeoutMs: number;
}

interface ApiRequest {
  path: string;
  method: typeof HTTP_METHOD_GET | typeof HTTP_METHOD_POST;
  body?: unknown;
}

interface ResponseErrorContext {
  traceId?: string;
  requestId?: string;
}

interface JsonErrorPayload {
  message?: unknown;
}

export function createApiClient(opts: CreateApiClientOptions): ApiClient {
  const normalizedOpts = {
    ...opts,
    baseUrl: normalizeBaseUrl(opts.baseUrl),
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

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/+$/, "");
}

async function sendRequest<TResponse>(
  opts: SendRequestOptions,
  request: ApiRequest
): Promise<TResponse> {
  const url = `${opts.baseUrl}${request.path}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), opts.timeoutMs);
  const fetchFn = opts.fetchFn ?? fetch;
  const requestHeaders = {
    ...opts.headers,
    ...(request.method === HTTP_METHOD_POST
      ? {
          [HTTP_HEADER_CONTENT_TYPE]: MIME_TYPE_APPLICATION_JSON,
        }
      : {}),
  };

  try {
    const response = await fetchFn(url, {
      method: request.method,
      headers:
        Object.keys(requestHeaders).length > 0 ? requestHeaders : undefined,
      body:
        request.method === HTTP_METHOD_POST
          ? JSON.stringify(request.body)
          : undefined,
      signal: controller.signal,
    });

    if (!response.ok) {
      const payload = await tryParseJson(response);
      const errorContext = getResponseErrorContext(response);
      const message =
        getErrorMessage(payload) ??
        `API request failed: ${response.status} ${response.statusText}`;

      throw new LiquidiumError(
        LiquidiumErrorCode.SERVICE_UNAVAILABLE,
        appendErrorContext(message, errorContext),
        undefined,
        errorContext
      );
    }

    return (await response.json()) as TResponse;
  } catch (error) {
    if (error instanceof LiquidiumError) {
      throw error;
    }

    if (
      error instanceof DOMException &&
      error.name === DOM_EXCEPTION_ABORT_ERROR_NAME
    ) {
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

  const message = (payload as JsonErrorPayload).message;
  return typeof message === "string" && message.length > 0 ? message : null;
}

function getResponseErrorContext(response: Response): ResponseErrorContext {
  return {
    traceId: response.headers.get(HTTP_HEADER_TRACE_ID) ?? undefined,
    requestId: response.headers.get(HTTP_HEADER_REQUEST_ID) ?? undefined,
  };
}

function appendErrorContext(
  message: string,
  context: ResponseErrorContext
): string {
  if (!context.traceId && !context.requestId) {
    return message;
  }

  const details = [
    context.traceId ? `traceId=${context.traceId}` : undefined,
    context.requestId ? `requestId=${context.requestId}` : undefined,
  ].filter((value): value is string => Boolean(value));

  return `${message} (${details.join(", ")})`;
}
