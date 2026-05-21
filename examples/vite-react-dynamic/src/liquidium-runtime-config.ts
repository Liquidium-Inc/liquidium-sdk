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

  return {
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
