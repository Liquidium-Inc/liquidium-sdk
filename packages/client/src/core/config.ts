import { type CanisterIds, Environment } from "./types";

const MAINNET_HOST = "https://icp-api.io";
export const DEFAULT_ENVIRONMENT: Environment = Environment.mainnet;

const MAINNET_CANISTER_IDS: CanisterIds = {
  lending: "hyk4r-jqaaa-aaaar-qb4ca-cai",
  btcPool: "hkmli-faaaa-aaaar-qb4ba-cai",
  ercPool: "hnnn4-iyaaa-aaaar-qb4bq-cai",
};

const STAGING_CANISTER_IDS: CanisterIds = {
  lending: "<lending-canister-id>",
  btcPool: "<btc-pool-canister-id>",
  ercPool: "<erc-pool-canister-id>",
};

const CANISTER_IDS_BY_ENVIRONMENT: Record<Environment, CanisterIds> = {
  mainnet: MAINNET_CANISTER_IDS,
  staging: STAGING_CANISTER_IDS,
};

export function resolveHost(override?: string): string {
  return override ?? MAINNET_HOST;
}

export function resolveCanisterIds(
  environment: Environment = DEFAULT_ENVIRONMENT,
  overrides?: Partial<CanisterIds>
): CanisterIds {
  return { ...CANISTER_IDS_BY_ENVIRONMENT[environment], ...overrides };
}

export const DEFAULT_TIMEOUT_MS = 30_000;

export const CK_CANISTER_IDS = {
  btcMinter: "mqygn-kiaaa-aaaar-qaadq-cai",
  btcLedger: "mxzaz-hqaaa-aaaar-qaada-cai",
  btcIndex: "n5wcd-faaaa-aaaar-qaaea-cai",
  btcArchive: "nbsys-saaaa-aaaar-qaaga-cai",
  ethMinter: "sv3dd-oaaaa-aaaar-qacoa-cai",
  ethLedger: "ss2fx-dyaaa-aaaar-qacoq-cai",
  ethArchive: "yhujl-liaaa-aaaar-qaiha-cai",
  ethUsdtLedger: "cngnf-vqaaa-aaaar-qag4q-cai",
  ethUsdtIndex: "cefgz-dyaaa-aaaar-qag5a-cai",
} as const;
