import type { LiquidiumClientConfig } from "@liquidium/client";

const DEFAULT_LIQUIDIUM_BASE_URL = "https://app.liquidium.fi/api/sdk";

export function resolveLiquidiumClientConfig(): LiquidiumClientConfig {
  const configuredBaseUrl = normalizeOptionalValue(
    import.meta.env.VITE_LIQUIDIUM_BASE_URL
  );

  return {
    apiBaseUrl: configuredBaseUrl ?? DEFAULT_LIQUIDIUM_BASE_URL,
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
