import { LiquidiumError, LiquidiumErrorCode } from "../errors";

/**
 * Internal HTTP client for API-routed methods. Consumers never see this.
 */
export interface ApiClient {
  get<T>(path: string): Promise<T>;
}

export function createApiClient(opts: {
  baseUrl: string;
  timeoutMs: number;
}): ApiClient {
  return {
    async get<T>(path: string): Promise<T> {
      const url = `${opts.baseUrl}${path}`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), opts.timeoutMs);

      try {
        const response = await fetch(url, { signal: controller.signal });

        if (!response.ok) {
          throw new LiquidiumError(
            LiquidiumErrorCode.SERVICE_UNAVAILABLE,
            `API request failed: ${response.status} ${response.statusText}`
          );
        }

        return (await response.json()) as T;
      } catch (error) {
        if (error instanceof LiquidiumError) throw error;

        if (error instanceof DOMException && error.name === "AbortError") {
          throw new LiquidiumError(
            LiquidiumErrorCode.REQUEST_TIMEOUT,
            `Request to ${path} timed out after ${opts.timeoutMs}ms`
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
    },
  };
}
