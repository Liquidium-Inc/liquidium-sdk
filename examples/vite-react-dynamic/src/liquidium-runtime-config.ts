import type { LiquidiumClientConfig } from "@liquidium/client";

const DEFAULT_LIQUIDIUM_BASE_URL =
  "https://pools-internal-mvp.vercel.app/api/sdk";

const STAGING_CANISTER_IDS = {
  lending: "nja4y-2yaaa-aaaae-qddxa-cai",
  btcPool: "42svn-2yaaa-aaaae-qfcsq-cai",
  ercPool: "7dcux-qqaaa-aaaae-qfc3a-cai",
  ethDeposit: "jncw6-6yaaa-aaaae-qgccq-cai",
} satisfies LiquidiumClientConfig["canisterIds"];

export function resolveLiquidiumClientConfig(): LiquidiumClientConfig {
  const configuredBaseUrl = normalizeOptionalValue(
    import.meta.env.VITE_LIQUIDIUM_BASE_URL
  );

  return {
    apiBaseUrl: configuredBaseUrl ?? DEFAULT_LIQUIDIUM_BASE_URL,
    canisterIds: STAGING_CANISTER_IDS,
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
