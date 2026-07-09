import { LiquidiumError, LiquidiumErrorCode } from "./errors";
import {
  type CanisterIdOverrides,
  type CanisterIds,
  Environment,
} from "./types";

const MAINNET_HOST = "https://icp-api.io";
export const DEFAULT_API_BASE_URL = "https://app.liquidium.fi/api/sdk";
export const DEFAULT_ENVIRONMENT: Environment = Environment.mainnet;

const MAINNET_CANISTER_IDS: CanisterIds = {
  lending: "hyk4r-jqaaa-aaaar-qb4ca-cai",
  pools: {
    btc: "hkmli-faaaa-aaaar-qb4ba-cai",
    usdt: "hnnn4-iyaaa-aaaar-qb4bq-cai",
    usdc: "6sna2-oiaaa-aaaar-qb66q-cai",
    icp: "r2pk3-4yaaa-aaaar-qb7zq-cai",
  },
  ethDeposit: "z5jz7-nyaaa-aaaar-qb6pq-cai",
  instantLoans: "u5rm3-niaaa-aaaar-qb7eq-cai",
};

const CANISTER_IDS_BY_ENVIRONMENT: Record<Environment, CanisterIds> = {
  mainnet: MAINNET_CANISTER_IDS,
};

const SUPPORTED_CANISTER_ID_OVERRIDE_KEYS = new Set([
  "lending",
  "pools",
  "ethDeposit",
  "instantLoans",
]);
const SUPPORTED_POOL_CANISTER_ID_OVERRIDE_KEYS = new Set([
  "btc",
  "usdt",
  "usdc",
  "icp",
]);

export function resolveHost(override?: string): string {
  return override ?? MAINNET_HOST;
}

/** Resolves environment canister ids with optional per-canister overrides. */
export function resolveCanisterIds(
  environment: Environment = DEFAULT_ENVIRONMENT,
  overrides?: CanisterIdOverrides
): CanisterIds {
  const defaults = CANISTER_IDS_BY_ENVIRONMENT[environment];
  validateCanisterIdOverrides(overrides);

  const pools = {
    ...defaults.pools,
    ...overrides?.pools,
  };

  return {
    lending: overrides?.lending ?? defaults.lending,
    pools,
    ethDeposit: overrides?.ethDeposit ?? defaults.ethDeposit,
    instantLoans: overrides?.instantLoans ?? defaults.instantLoans,
  };
}

function validateCanisterIdOverrides(overrides?: CanisterIdOverrides): void {
  if (!overrides) {
    return;
  }

  for (const key of Object.keys(overrides)) {
    if (!SUPPORTED_CANISTER_ID_OVERRIDE_KEYS.has(key)) {
      throw new LiquidiumError(
        LiquidiumErrorCode.VALIDATION_ERROR,
        `Unsupported canisterIds override: ${key}`
      );
    }
  }

  if (!overrides.pools) {
    return;
  }

  for (const key of Object.keys(overrides.pools)) {
    if (!SUPPORTED_POOL_CANISTER_ID_OVERRIDE_KEYS.has(key)) {
      throw new LiquidiumError(
        LiquidiumErrorCode.VALIDATION_ERROR,
        `Unsupported canisterIds.pools override: ${key}`
      );
    }
  }
}

export const DEFAULT_TIMEOUT_MS = 30_000;

/** Mainnet chain-key asset and ICP helper canister principals. */
export const CK_CANISTER_IDS = {
  BTC: {
    minter: "mqygn-kiaaa-aaaar-qaadq-cai",
    ledger: "mxzaz-hqaaa-aaaar-qaada-cai",
    index: "n5wcd-faaaa-aaaar-qaaea-cai",
    archive: "nbsys-saaaa-aaaar-qaaga-cai",
  },
  USDT: {
    ledger: "cngnf-vqaaa-aaaar-qag4q-cai",
    index: "cefgz-dyaaa-aaaar-qag5a-cai",
  },
  USDC: {
    ledger: "xevnm-gaaaa-aaaar-qafnq-cai",
    index: "xrs4b-hiaaa-aaaar-qafoa-cai",
  },
  ICP: {
    ledger: "ryjl3-tyaaa-aaaaa-aaaba-cai",
    index: "qhbym-qaaaa-aaaaa-aaafq-cai",
  },
} as const;
