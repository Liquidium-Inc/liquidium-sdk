import { LiquidiumClient, type LiquidiumClientConfig } from "@liquidium/client";

const INFURA_MAINNET_RPC_BASE_URL = "https://mainnet.infura.io/v3";
const DEFAULT_MAINNET_RPC_URL = "https://ethereum-rpc.publicnode.com";

export function createClient(): LiquidiumClient {
  return new LiquidiumClient(resolveClientConfig());
}

export function formatConfig(): string {
  return [
    "Using Liquidium SDK defaults.",
    "Canisters: bundled mainnet defaults",
    "Liquidium service: bundled production default",
    `EVM RPC: ${resolveEvmRpcUrl() ? "configured" : "not configured"}`,
  ].join("\n");
}

function resolveClientConfig(): LiquidiumClientConfig {
  const evmRpcUrl = resolveEvmRpcUrl();

  return {
    ...(evmRpcUrl ? { evmRpcUrl } : {}),
  };
}

function resolveEvmRpcUrl(): string | undefined {
  const configuredEvmRpcUrl = normalizeOptionalValue(
    import.meta.env.VITE_EVM_RPC_URL
  );
  const infuraApiKey = normalizeOptionalValue(import.meta.env.VITE_INFURA_API_KEY);

  if (configuredEvmRpcUrl) {
    return resolveValidOptionalUrl(configuredEvmRpcUrl);
  }

  if (!infuraApiKey) {
    return DEFAULT_MAINNET_RPC_URL;
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
