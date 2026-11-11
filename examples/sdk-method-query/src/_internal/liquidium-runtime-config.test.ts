import { afterEach, expect, test, vi } from "vite-plus/test";
import { resolveLiquidiumClientConfig } from "../liquidium-runtime-config";

afterEach(() => {
  vi.unstubAllEnvs();
});

test("should use SDK production defaults despite legacy staging env values", () => {
  // given
  const legacyApiBaseUrl = "https://staging.example.com/api/sdk";
  const legacySolPoolId = "efo3x-cyaaa-aaaae-qkpva-cai";
  vi.stubEnv("VITE_LIQUIDIUM_API_BASE_URL", legacyApiBaseUrl);
  vi.stubEnv("VITE_LIQUIDIUM_SOL_POOL_ID", legacySolPoolId);
  vi.stubEnv("VITE_EVM_RPC_URL", "");
  vi.stubEnv("VITE_INFURA_API_KEY", "");

  // when
  const config = resolveLiquidiumClientConfig();

  // then
  expect(config).toEqual({});
});
