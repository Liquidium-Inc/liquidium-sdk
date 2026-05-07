import type { LiquidiumClientConfig } from "@liquidium/client";

const DEFAULT_LIQUIDIUM_BASE_URL =
  "https://pools-internal-mvp.vercel.app/api/sdk";
const INFURA_MAINNET_RPC_BASE_URL = "https://mainnet.infura.io/v3";

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
  const configuredEvmRpcUrl = normalizeOptionalValue(
    import.meta.env.VITE_EVM_RPC_URL
  );
  const infuraApiKey = normalizeOptionalValue(
    import.meta.env.VITE_INFURA_API_KEY
  );
  const apiBaseUrl = resolveValidBaseUrl(configuredBaseUrl);
  const evmRpcUrl = resolveEvmRpcUrl(configuredEvmRpcUrl, infuraApiKey);

  return {
    apiBaseUrl,
    canisterIds: STAGING_CANISTER_IDS,
    ...(evmRpcUrl ? { evmRpcUrl } : {}),
  };
}

function resolveEvmRpcUrl(
  configuredEvmRpcUrl: string | undefined,
  infuraApiKey: string | undefined
): string | undefined {
  if (configuredEvmRpcUrl) {
    return resolveValidOptionalUrl(configuredEvmRpcUrl);
  }

  if (!infuraApiKey) {
    return undefined;
  }

  return `${INFURA_MAINNET_RPC_BASE_URL}/${infuraApiKey}`;
}

function resolveValidBaseUrl(value: string | undefined): string {
  if (!value) {
    return DEFAULT_LIQUIDIUM_BASE_URL;
  }

  try {
    return new URL(value).toString().replace(/\/$/, "");
  } catch {
    return DEFAULT_LIQUIDIUM_BASE_URL;
  }
}

function resolveValidOptionalUrl(value: string): string | undefined {
  try {
    return new URL(value).toString();
  } catch {
    return undefined;
  }
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
