import { idlLabelToId } from "@icp-sdk/core/candid";
import type { Principal } from "@icp-sdk/core/principal";
import { describe, expect, test } from "vitest";
import {
  decodeFlexiblePool,
  decodeFlexiblePosition,
  decodeFlexiblePositionView,
  decodeFlexibleUserStats,
  type FlexiblePool,
  type FlexiblePosition,
  type FlexiblePositionView,
  type FlexibleUserStats,
} from "./flexible-actor";

const POOL_PRINCIPAL = {
  toString: () => "pool-1",
} as unknown as Principal;

const PROFILE_PRINCIPAL = {
  toString: () => "profile-1",
} as unknown as Principal;

function createFlexiblePool(overrides?: Partial<FlexiblePool>): FlexiblePool {
  return {
    principal: POOL_PRINCIPAL,
    asset: { BTC: null },
    chain: { BTC: null },
    total_supply_at_last_sync: 50_000n,
    total_debt_at_last_sync: 25_000n,
    supply_cap: [1_000_000n],
    borrow_cap: [500_000n],
    max_ltv: 7_000n,
    liquidation_threshold: 7_500n,
    liquidation_bonus: 200n,
    protocol_liquidation_fee: 50n,
    reserve_factor: 100n,
    base_rate: 5n,
    optimal_utilization_rate: 80n,
    rate_slope_before: 1n,
    rate_slope_after: 2n,
    lending_index: 300n,
    borrow_index: 400n,
    same_asset_borrowing: [true],
    frozen: false,
    last_updated: [123n],
    ...overrides,
  };
}

function createFlexiblePosition(
  overrides?: Partial<FlexiblePosition>
): FlexiblePosition {
  return {
    asset: { BTC: null },
    total_debt_interest: 10n,
    borrow_index_snapshot: 100n,
    lending_index_snapshot: 200n,
    debt_scaled: 1_000n,
    total_earned_interest: 20n,
    deposit_scaled: 2_000n,
    pool_id: POOL_PRINCIPAL,
    unpaid_debt_interest: 5n,
    last_update: 1_234n,
    user_profile: PROFILE_PRINCIPAL,
    ...overrides,
  };
}

function createFlexiblePositionView(
  overrides?: Partial<FlexiblePositionView>
): FlexiblePositionView {
  return {
    lending_index_now: 300n,
    interest_since_snapshot: 2n,
    asset: { BTC: null },
    total_debt_interest: 10n,
    borrow_index_snapshot: 100n,
    debt_native_now: 25_000n,
    borrow_index_now: 110n,
    lending_index_snapshot: 200n,
    debt_scaled: 1_000n,
    total_earned_interest: 20n,
    deposit_scaled: 2_000n,
    earned_since_snapshot: 3n,
    deposited_native_now: 50_000n,
    pool_id: POOL_PRINCIPAL,
    last_update: 1_234n,
    user_profile: PROFILE_PRINCIPAL,
    ...overrides,
  };
}

function createFlexibleUserStats(
  overrides?: Partial<FlexibleUserStats>
): FlexibleUserStats {
  return {
    debt: 100n,
    collateral: 1_000n,
    acumulated_interest: 5n,
    borrowing_power: {
      max_borrowable_usd: 500n,
      weighted_max_ltv: 7_000n,
    },
    positions: [createFlexiblePosition()],
    weighted_liquidation_threshold: 7_500n,
    ...overrides,
  };
}

describe("decodeFlexiblePool", () => {
  test("should decode a pool with known asset and chain tags", () => {
    // given
    const pool = createFlexiblePool();

    // when
    const decoded = decodeFlexiblePool(pool);

    // then
    expect(decoded).not.toBeNull();
    expect(decoded?.asset).toBe("BTC");
    expect(decoded?.chain).toBe("BTC");
  });

  test("should return null for an unsupported ICP pool", () => {
    // given
    const pool = createFlexiblePool({
      asset: { ICP: null },
      chain: { ICP: null },
    });

    // when
    const decoded = decodeFlexiblePool(pool);

    // then
    expect(decoded).toBeNull();
  });

  test("should decode a pool with hashed variant keys from IDL.Unknown", () => {
    // given
    const assetHash = idlLabelToId("SOL");
    const chainHash = idlLabelToId("ETH");
    const pool = createFlexiblePool({
      asset: { [`_${assetHash}_`]: null },
      chain: { [`_${chainHash}_`]: null },
    });

    // when
    const decoded = decodeFlexiblePool(pool);

    // then
    expect(decoded).not.toBeNull();
    expect(decoded?.asset).toBe("SOL");
    expect(decoded?.chain).toBe("ETH");
  });

  test("should return null for an unknown asset tag", () => {
    // given
    const pool = createFlexiblePool({ asset: { DOGE: null } });

    // when
    const decoded = decodeFlexiblePool(pool);

    // then
    expect(decoded).toBeNull();
  });

  test("should return null for an unknown chain tag", () => {
    // given
    const pool = createFlexiblePool({ chain: { ADA: null } });

    // when
    const decoded = decodeFlexiblePool(pool);

    // then
    expect(decoded).toBeNull();
  });

  test("should return null when the asset variant is empty", () => {
    // given
    const pool = createFlexiblePool({ asset: {} });

    // when
    const decoded = decodeFlexiblePool(pool);

    // then
    expect(decoded).toBeNull();
  });
});

describe("decodeFlexiblePosition", () => {
  test("should decode a position with a known asset tag", () => {
    // given
    const position = createFlexiblePosition({ asset: { USDT: null } });

    // when
    const decoded = decodeFlexiblePosition(position);

    // then
    expect(decoded).not.toBeNull();
    expect(decoded?.asset).toBe("USDT");
    expect(decoded?.pool_id).toBe(POOL_PRINCIPAL);
  });

  test("should decode a position with a hashed variant key", () => {
    // given
    const assetHash = idlLabelToId("SOL");
    const position = createFlexiblePosition({
      asset: { [`_${assetHash}_`]: null },
    });

    // when
    const decoded = decodeFlexiblePosition(position);

    // then
    expect(decoded).not.toBeNull();
    expect(decoded?.asset).toBe("SOL");
  });

  test("should return null for an unsupported ICP position", () => {
    // given
    const position = createFlexiblePosition({ asset: { ICP: null } });

    // when
    const decoded = decodeFlexiblePosition(position);

    // then
    expect(decoded).toBeNull();
  });

  test("should return null for an unknown asset tag", () => {
    // given
    const position = createFlexiblePosition({ asset: { DOGE: null } });

    // when
    const decoded = decodeFlexiblePosition(position);

    // then
    expect(decoded).toBeNull();
  });
});

describe("decodeFlexiblePositionView", () => {
  test("should decode a position view with a known asset tag", () => {
    // given
    const view = createFlexiblePositionView();

    // when
    const decoded = decodeFlexiblePositionView(view);

    // then
    expect(decoded).not.toBeNull();
    expect(decoded?.asset).toBe("BTC");
    expect(decoded?.deposited_native_now).toBe(50_000n);
  });

  test("should return null for an unsupported ICP position view", () => {
    // given
    const view = createFlexiblePositionView({ asset: { ICP: null } });

    // when
    const decoded = decodeFlexiblePositionView(view);

    // then
    expect(decoded).toBeNull();
  });

  test("should return null for an unknown asset tag", () => {
    // given
    const view = createFlexiblePositionView({ asset: { DOGE: null } });

    // when
    const decoded = decodeFlexiblePositionView(view);

    // then
    expect(decoded).toBeNull();
  });
});

describe("decodeFlexibleUserStats", () => {
  test("should keep aggregate fields and decode known positions", () => {
    // given
    const stats = createFlexibleUserStats();

    // when
    const decoded = decodeFlexibleUserStats(stats);

    // then
    expect(decoded.debt).toBe(stats.debt);
    expect(decoded.collateral).toBe(stats.collateral);
    expect(decoded.borrowing_power).toBe(stats.borrowing_power);
    expect(decoded.weighted_liquidation_threshold).toBe(
      stats.weighted_liquidation_threshold
    );
    expect(decoded.positions).toHaveLength(1);
    expect(decoded.positions[0]?.asset).toBe("BTC");
  });

  test("should filter out unsupported ICP positions and unknown assets", () => {
    // given
    const stats = createFlexibleUserStats({
      positions: [
        createFlexiblePosition({ asset: { BTC: null } }),
        createFlexiblePosition({ asset: { ICP: null } }),
        createFlexiblePosition({ asset: { DOGE: null } }),
        createFlexiblePosition({ asset: { USDC: null } }),
      ],
    });

    // when
    const decoded = decodeFlexibleUserStats(stats);

    // then
    expect(decoded.positions).toHaveLength(2);
    expect(decoded.positions.map((position) => position.asset)).toEqual([
      "BTC",
      "USDC",
    ]);
  });

  test("should return an empty positions array when all assets are unknown", () => {
    // given
    const stats = createFlexibleUserStats({
      positions: [createFlexiblePosition({ asset: { DOGE: null } })],
    });

    // when
    const decoded = decodeFlexibleUserStats(stats);

    // then
    expect(decoded.positions).toHaveLength(0);
  });
});
