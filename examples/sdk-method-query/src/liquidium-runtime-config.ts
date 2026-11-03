import type { LiquidiumClientConfig } from "@liquidium/client";

const INFURA_MAINNET_RPC_BASE_URL = "https://mainnet.infura.io/v3";

export function resolveLiquidiumClientConfig(): LiquidiumClientConfig {
  const configuredEvmRpcUrl = normalizeOptionalValue(
    import.meta.env.VITE_EVM_RPC_URL
  );
  const infuraApiKey = normalizeOptionalValue(
    import.meta.env.VITE_INFURA_API_KEY
  );
  const evmRpcUrl = resolveEvmRpcUrl(configuredEvmRpcUrl, infuraApiKey);
  const configuredApiBaseUrl = normalizeOptionalValue(
    import.meta.env.VITE_LIQUIDIUM_API_BASE_URL
  );
  const apiBaseUrl = configuredApiBaseUrl
    ? resolveValidOptionalUrl(configuredApiBaseUrl)
    : undefined;
  // SOL flows need the active pool and an SDK API deployment that serves it.
  const solPoolId = normalizeOptionalValue(
    import.meta.env.VITE_LIQUIDIUM_SOL_POOL_ID
  );

  return {
    ...(evmRpcUrl ? { evmRpcUrl } : {}),
    ...(apiBaseUrl ? { apiBaseUrl } : {}),
    ...(solPoolId ? { canisterIds: { pools: { sol: solPoolId } } } : {}),
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
