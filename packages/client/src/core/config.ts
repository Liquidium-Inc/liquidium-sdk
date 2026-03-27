import type { CanisterIds } from "./types";

const MAINNET_HOST = "https://icp-api.io";

const MAINNET_CANISTER_IDS: CanisterIds = {
  lending: "hyk4r-jqaaa-aaaar-qb4ca-cai",
  btcPool: "hkmli-faaaa-aaaar-qb4ba-cai",
  ercPool: "hnnn4-iyaaa-aaaar-qb4bq-cai",
};

export function resolveHost(override?: string): string {
  return override ?? MAINNET_HOST;
}

export function resolveCanisterIds(
  overrides?: Partial<CanisterIds>
): CanisterIds {
  return { ...MAINNET_CANISTER_IDS, ...overrides };
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
