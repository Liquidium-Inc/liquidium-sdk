import { encodeIcrcAccount } from "@icp-sdk/canisters/ledger/icrc";
import { Principal } from "@icp-sdk/core/principal";
import { vi } from "vitest";
import type { FlexibleSimpleLoanCanisterRecord } from "../../../core/canisters/simple-loans/flexible-actor";

interface TestBtcAssetVariant {
  BTC: null;
}

interface TestUsdtAssetVariant {
  USDT: null;
}

interface TestIcpAssetVariant {
  ICP: null;
}

type TestSimpleLoanPositionAsset =
  | TestBtcAssetVariant
  | TestIcpAssetVariant
  | TestUsdtAssetVariant;

export const PROFILE_ID = "aaaaa-aa";
export const BTC_POOL_ID = "hkmli-faaaa-aaaar-qb4ba-cai";
export const ICP_POOL_ID = "r2pk3-4yaaa-aaaar-qb7zq-cai";
export const USDT_POOL_ID = "hnnn4-iyaaa-aaaar-qb4bq-cai";
export const LOAN_ID = 42n;
export const VALID_BTC_REFUND_ADDRESS = "1BoatSLRHtKNngkdXEeobR76b53LETtpyT";
export const ACCOUNT_IDENTIFIER =
  "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
export const ICRC_SUBACCOUNT = new Uint8Array(32).fill(7);
export const LOWERCASE_EVM_BORROW_ADDRESS =
  "0x52908400098527886e0f7030069857d2e4169ee7";
export const CHECKSUM_EVM_BORROW_ADDRESS =
  "0x52908400098527886E0F7030069857D2E4169EE7";
export const CANISTER_EVM_BORROW_ADDRESS =
  "0x2222222222222222222222222222222222222222";

export function createSimpleLoan(
  overrides: Partial<FlexibleSimpleLoanCanisterRecord> = {}
): FlexibleSimpleLoanCanisterRecord {
  return {
    id: LOAN_ID,
    authorisation: {
      EthSignature: {
        derivation_index: new Uint8Array(),
        pubkey: new Uint8Array(),
        address: "0x1111111111111111111111111111111111111111",
      },
    },
    borrow_destination: {
      External: CANISTER_EVM_BORROW_ADDRESS,
    },
    started: false,
    borrow_amount: 2_000_000n,
    lend_asset: { BTC: null },
    created_at: 0n,
    schema_version: 1,
    ltv_max_bps: 6_800n,
    lend_pool_id: Principal.fromText(BTC_POOL_ID),
    refund_destination: { External: VALID_BTC_REFUND_ADDRESS },
    ltv_timer_s: 3_600n,
    lending_profile: Principal.fromText(PROFILE_ID),
    borrow_pool_id: Principal.fromText(USDT_POOL_ID),
    borrow_asset: { USDT: null },
    expires_at: [],
    deposit_detected_ts: [],
    ...overrides,
  };
}

export function mockSimpleLoanCollateralHintFetch(
  overrides: Partial<{
    borrowAsset: string;
    borrowPoolId: string;
    collateralAmountHint: string;
    collateralAsset: string;
    collateralPoolId: string;
  }> = {}
) {
  return vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
    const url = input.toString();
    if (url.includes("/activities?")) {
      return new Response(JSON.stringify({ activities: [] }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        collateralAmountHint: overrides.collateralAmountHint ?? "10000000",
      }),
      { status: 200, headers: { "content-type": "application/json" } }
    );
  });
}

export function createBtcBorrowSimpleLoan() {
  return {
    ...createSimpleLoan(),
    borrow_destination: { External: VALID_BTC_REFUND_ADDRESS },
    borrow_amount: 1_000_000n,
    lend_asset: { USDT: null },
    lend_pool_id: Principal.fromText(USDT_POOL_ID),
    refund_destination: { External: CHECKSUM_EVM_BORROW_ADDRESS },
    borrow_pool_id: Principal.fromText(BTC_POOL_ID),
    borrow_asset: { BTC: null },
  };
}

export function createLoanCreatedEvent() {
  return {
    id: 1n,
    schema_version: 1,
    timestamp: 123n,
    event_type: {
      LoanCreated: {
        loan_id: LOAN_ID,
        borrow_destination: {
          External: "0x2222222222222222222222222222222222222222",
        },
        lend_asset: { BTC: null },
        borrow_amount: 5_726_000_000n,
        lend_pool_id: Principal.fromText(BTC_POOL_ID),
        refund_destination: { External: VALID_BTC_REFUND_ADDRESS },
        ltv_max_bps: 6_800n,
        ltv_timer_s: 3_600n,
        lending_profile: Principal.fromText(PROFILE_ID),
        borrow_pool_id: Principal.fromText(USDT_POOL_ID),
        borrow_asset: { USDT: null },
      },
    },
  };
}

export function createSimpleLoanPosition(
  poolId: string,
  asset: TestSimpleLoanPositionAsset,
  overrides: Record<string, unknown> = {}
) {
  return {
    lending_index_now: 0n,
    interest_since_snapshot: 0n,
    asset,
    total_debt_interest: 0n,
    borrow_index_snapshot: 0n,
    debt_native_now: 0n,
    borrow_index_now: 0n,
    lending_index_snapshot: 0n,
    debt_scaled: 0n,
    total_earned_interest: 0n,
    deposit_scaled: 0n,
    earned_since_snapshot: 0n,
    deposited_native_now: 0n,
    pool_id: {
      toText: () => poolId,
    },
    last_update: 0n,
    user_profile: {
      toText: () => PROFILE_ID,
    },
    ...overrides,
  };
}

export function prices() {
  return [
    ["BTC_USDT", 10_000_000n, 2],
    ["ICP_USDT", 500n, 2],
    ["USDT_USDT", 100n, 2],
  ];
}

export function createBtcPoolRecord(overrides = {}) {
  return {
    optimal_utilization_rate: 80n,
    principal: {
      toString: () => BTC_POOL_ID,
      toText: () => BTC_POOL_ID,
    },
    total_generated_interest_snapshot: 0n,
    supply_cap: [],
    same_asset_borrowing: [],
    same_asset_borrowing_dust_threshold: 0n,
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
    ...overrides,
  };
}

export function createUsdtPoolRecord(overrides = {}) {
  return {
    optimal_utilization_rate: 80n,
    principal: {
      toString: () => USDT_POOL_ID,
      toText: () => USDT_POOL_ID,
    },
    total_generated_interest_snapshot: 0n,
    supply_cap: [],
    same_asset_borrowing: [],
    same_asset_borrowing_dust_threshold: 0n,
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
    ...overrides,
  };
}

export function createIcpPoolRecord(overrides = {}) {
  return {
    optimal_utilization_rate: 80n,
    principal: {
      toString: () => ICP_POOL_ID,
      toText: () => ICP_POOL_ID,
    },
    total_generated_interest_snapshot: 0n,
    supply_cap: [],
    same_asset_borrowing: [],
    same_asset_borrowing_dust_threshold: 0n,
    asset: { ICP: null },
    rate_slope_before: 1n,
    borrow_cap: [],
    total_debt_at_last_sync: 0n,
    chain: { ICP: null },
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
    ...overrides,
  };
}

export { encodeIcrcAccount };
