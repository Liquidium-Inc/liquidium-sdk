import type { LiquidiumClientConfig } from "@liquidium/client";

const DEFAULT_LIQUIDIUM_BASE_URL = "http://localhost:3000";
const SDK_API_PATH = "/api/sdk";

export function resolveLiquidiumClientConfig(): LiquidiumClientConfig {
  const configuredBaseUrl = normalizeOptionalValue(
    import.meta.env.VITE_LIQUIDIUM_BASE_URL
  );
  const configuredApiBaseUrl = normalizeOptionalValue(
    import.meta.env.VITE_LIQUIDIUM_API_BASE_URL
  );

  return {
    apiBaseUrl:
      configuredApiBaseUrl ??
      `${configuredBaseUrl ?? DEFAULT_LIQUIDIUM_BASE_URL}${SDK_API_PATH}`,
  };
}

function normalizeOptionalValue(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return undefined;
  }

  return trimmedValue;
}
