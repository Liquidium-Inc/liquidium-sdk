import { Actor } from "@icp-sdk/core/agent";
import type { Principal } from "@icp-sdk/core/principal";
import { vi } from "vitest";

export const LONG_RETRY_TEST_TIMEOUT_MS = 15_000;
export const BTC_POOL_ID = "hkmli-faaaa-aaaar-qb4ba-cai";
export const USDT_POOL_ID = "hnnn4-iyaaa-aaaar-qb4bq-cai";
export const USDC_POOL_ID = "ryjl3-tyaaa-aaaaa-aaaba-cai";
export const VALID_BTC_OUTFLOW_ADDRESS = "1BoatSLRHtKNngkdXEeobR76b53LETtpyT";
export const LOWERCASE_EVM_OUTFLOW_ADDRESS =
  "0x52908400098527886e0f7030069857d2e4169ee7";
export const CHECKSUM_EVM_OUTFLOW_ADDRESS =
  "0x52908400098527886E0F7030069857D2E4169EE7";

export function encodeBytes32Hex(bytes: Uint8Array): `0x${string}` {
  return `0x${Array.from(bytes, (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("")}`;
}

export function encodePrincipalToBytes32(principal: Principal): `0x${string}` {
  const principalBytes = principal.toUint8Array();
  const fixedBytes = new Uint8Array(32);
  fixedBytes[0] = principalBytes.length;
  fixedBytes.set(principalBytes, 1);

  return encodeBytes32Hex(fixedBytes);
}

export function mockUsdtPoolList(): void {
  vi.spyOn(Actor, "createActor").mockReturnValueOnce({
    list_pools: vi.fn().mockResolvedValue([createUsdtPoolRecord()]),
  } as never);
}

export function createUsdtPoolRecord() {
  return {
    optimal_utilization_rate: 80n,
    principal: {
      toString: () => USDT_POOL_ID,
      toText: () => USDT_POOL_ID,
    },
    total_generated_interest_snapshot: 0n,
    supply_cap: [],
    same_asset_borrowing: [],
    asset: { USDT: null },
    rate_slope_before: 1n,
    borrow_cap: [],
    total_debt_at_last_sync: 0n,
    chain: { ETH: null },
    rate_slope_after: 2n,
    reserve_factor: 100n,
    last_updated: [],
    lending_index: 300n,
    protocol_liquidation_fee: 50n,
    borrow_index: 400n,
    base_rate: 5n,
    frozen: false,
    liquidation_bonus: 200n,
    liquidation_threshold: 7_500n,
    max_ltv: 7_000n,
    total_supply_at_last_sync: 50_000n,
  };
}

export function createBtcPoolRecord(poolId = BTC_POOL_ID) {
  return {
    optimal_utilization_rate: 80n,
    principal: {
      toString: () => poolId,
      toText: () => poolId,
    },
    total_generated_interest_snapshot: 0n,
    supply_cap: [],
    same_asset_borrowing: [],
    asset: { BTC: null },
    rate_slope_before: 1n,
    borrow_cap: [],
    total_debt_at_last_sync: 0n,
    chain: { BTC: null },
    rate_slope_after: 2n,
    reserve_factor: 100n,
    last_updated: [],
    lending_index: 300n,
    protocol_liquidation_fee: 50n,
    borrow_index: 400n,
    base_rate: 5n,
    frozen: false,
    liquidation_bonus: 200n,
    liquidation_threshold: 7_500n,
    max_ltv: 7_000n,
    total_supply_at_last_sync: 50_000n,
  };
}
