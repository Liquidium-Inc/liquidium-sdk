import { Actor } from "@icp-sdk/core/agent";
import { Principal } from "@icp-sdk/core/principal";
import { afterEach, describe, expect, test, vi } from "vitest";
import { LiquidiumClient, LiquidiumErrorCode } from "../../../index";

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("PositionsModule", () => {
  const PROFILE_ID = "aaaaa-aa";
  const POOL_ID = "rrkah-fqaaa-aaaaa-aaaaq-cai";
  const BTC_DUST_THRESHOLD_SATS = 150n;

  function makePositionView(overrides: Record<string, unknown> = {}) {
    return {
      lending_index_now: 0n,
      interest_since_snapshot: 0n,
      asset: { BTC: null },
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
        toText: () => POOL_ID,
      },
      last_update: 0n,
      user_profile: {
        toText: () => PROFILE_ID,
      },
      ...overrides,
    };
  }

  function makePositionRecord(overrides: Record<string, unknown> = {}) {
    return {
      asset: { BTC: null },
      total_debt_interest: 0n,
      borrow_index_snapshot: 0n,
      lending_index_snapshot: 0n,
      debt_scaled: 0n,
      total_earned_interest: 0n,
      deposit_scaled: 0n,
      pool_id: {
        toText: () => POOL_ID,
      },
      unpaid_debt_interest: 0n,
      last_update: 0n,
      user_profile: {
        toText: () => PROFILE_ID,
      },
      ...overrides,
    };
  }

  function makePoolRecord(
    poolId = POOL_ID,
    dustThreshold = BTC_DUST_THRESHOLD_SATS
  ) {
    return {
      principal: { toText: () => poolId },
      same_asset_borrowing_dust_threshold: dustThreshold,
    };
  }

  test("returns a mapped position when the canister reports one", async () => {
    // given
    const getPosition = vi.fn().mockResolvedValue([
      makePositionView({
        deposited_native_now: 150_000n,
        debt_native_now: 25_000n,
        total_earned_interest: 100n,
        earned_since_snapshot: 5n,
        total_debt_interest: 20n,
        interest_since_snapshot: 1n,
        last_update: 1_234n,
      }),
    ]);
    vi.spyOn(Actor, "createActor").mockReturnValue({
      get_position: getPosition,
    } as never);
    const client = new LiquidiumClient({});

    // when
    const position = await client.positions.getPosition(PROFILE_ID, POOL_ID);

    // then
    expect(position).toEqual({
      poolId: POOL_ID,
      asset: "BTC",
      deposited: 150_000n,
      depositedDecimals: 8n,
      borrowed: 25_000n,
      borrowedDecimals: 8n,
      earnedInterest: 105n,
      debtInterest: 21n,
      lastUpdate: 1_234n,
    });
    expect(getPosition).toHaveBeenCalledWith(
      Principal.fromText(PROFILE_ID),
      Principal.fromText(POOL_ID)
    );
  });

  test("returns a mapped ICP position with 8 native decimals", async () => {
    // given
    const getPosition = vi.fn().mockResolvedValue([
      makePositionView({
        asset: { ICP: null },
        deposited_native_now: 200_000_000n,
        debt_native_now: 50_000_000n,
      }),
    ]);
    vi.spyOn(Actor, "createActor").mockReturnValue({
      get_position: getPosition,
    } as never);
    const client = new LiquidiumClient({});

    // when
    const position = await client.positions.getPosition(PROFILE_ID, POOL_ID);

    // then
    expect(position).toMatchObject({
      poolId: POOL_ID,
      asset: "ICP",
      deposited: 200_000_000n,
      depositedDecimals: 8n,
      borrowed: 50_000_000n,
      borrowedDecimals: 8n,
    });
  });

  test("returns null when the canister reports no position", async () => {
    // given
    vi.spyOn(Actor, "createActor").mockReturnValue({
      get_position: vi.fn().mockResolvedValue([]),
    } as never);
    const client = new LiquidiumClient({});

    // when
    const position = await client.positions.getPosition(PROFILE_ID, POOL_ID);

    // then
    expect(position).toBeNull();
  });

  test("lists positions by fetching per-pool views from get_profile_stats", async () => {
    // given
    const SECOND_POOL_ID = "ryjl3-tyaaa-aaaaa-aaaba-cai";
    const getProfileStats = vi.fn().mockResolvedValue({
      debt: 0n,
      collateral: 0n,
      acumulated_interest: 0n,
      borrowing_power: {
        max_borrowable_usd: 0n,
        weighted_max_ltv: 0n,
      },
      positions: [
        makePositionRecord({ pool_id: { toText: () => POOL_ID } }),
        makePositionRecord({
          asset: { USDT: null },
          pool_id: { toText: () => SECOND_POOL_ID },
        }),
      ],
      weighted_liquidation_threshold: 0n,
    });
    const getPosition = vi
      .fn()
      .mockResolvedValueOnce([
        makePositionView({
          deposited_native_now: BTC_DUST_THRESHOLD_SATS,
          pool_id: { toText: () => POOL_ID },
        }),
      ])
      .mockResolvedValueOnce([
        makePositionView({
          asset: { USDT: null },
          deposited_native_now: 5_000_000n,
          debt_native_now: 1_000_000n,
          pool_id: { toText: () => SECOND_POOL_ID },
        }),
      ]);
    vi.spyOn(Actor, "createActor").mockReturnValue({
      get_profile_stats: getProfileStats,
      get_position: getPosition,
      list_pools: vi
        .fn()
        .mockResolvedValue([
          makePoolRecord(),
          makePoolRecord(SECOND_POOL_ID, 10_000n),
        ]),
    } as never);
    const client = new LiquidiumClient({});

    // when
    const positions = await client.positions.listPositions(PROFILE_ID);

    // then
    expect(positions).toEqual([
      {
        poolId: POOL_ID,
        asset: "BTC",
        deposited: BTC_DUST_THRESHOLD_SATS,
        depositedDecimals: 8n,
        borrowed: 0n,
        borrowedDecimals: 8n,
        earnedInterest: 0n,
        debtInterest: 0n,
        lastUpdate: 0n,
      },
      {
        poolId: SECOND_POOL_ID,
        asset: "USDT",
        deposited: 5_000_000n,
        depositedDecimals: 6n,
        borrowed: 1_000_000n,
        borrowedDecimals: 6n,
        earnedInterest: 0n,
        debtInterest: 0n,
        lastUpdate: 0n,
      },
    ]);
    expect(getPosition).toHaveBeenCalledTimes(2);
  });

  test("filters a supplied-only position below its asset dust threshold", async () => {
    // given
    const getProfileStats = vi.fn().mockResolvedValue({
      debt: 0n,
      collateral: 0n,
      acumulated_interest: 0n,
      borrowing_power: { max_borrowable_usd: 0n, weighted_max_ltv: 0n },
      positions: [makePositionRecord()],
      weighted_liquidation_threshold: 0n,
    });
    const getPosition = vi.fn().mockResolvedValue([
      makePositionView({
        deposited_native_now: BTC_DUST_THRESHOLD_SATS - 1n,
      }),
    ]);
    vi.spyOn(Actor, "createActor").mockReturnValue({
      get_profile_stats: getProfileStats,
      get_position: getPosition,
      list_pools: vi.fn().mockResolvedValue([makePoolRecord()]),
    } as never);
    const client = new LiquidiumClient({});

    // when
    const positions = await client.positions.listPositions(PROFILE_ID);

    // then
    expect(positions).toEqual([]);
  });

  test("retains a debt position when its supplied balance is dust", async () => {
    // given
    const BORROWED_AMOUNT_SATS = 1n;
    const getProfileStats = vi.fn().mockResolvedValue({
      debt: BORROWED_AMOUNT_SATS,
      collateral: 0n,
      acumulated_interest: 0n,
      borrowing_power: { max_borrowable_usd: 0n, weighted_max_ltv: 0n },
      positions: [makePositionRecord()],
      weighted_liquidation_threshold: 0n,
    });
    const getPosition = vi.fn().mockResolvedValue([
      makePositionView({
        deposited_native_now: BTC_DUST_THRESHOLD_SATS - 1n,
        debt_native_now: BORROWED_AMOUNT_SATS,
      }),
    ]);
    vi.spyOn(Actor, "createActor").mockReturnValue({
      get_profile_stats: getProfileStats,
      get_position: getPosition,
      list_pools: vi.fn().mockResolvedValue([makePoolRecord()]),
    } as never);
    const client = new LiquidiumClient({});

    // when
    const positions = await client.positions.listPositions(PROFILE_ID);

    // then
    expect(positions).toHaveLength(1);
    expect(positions[0]?.borrowed).toBe(BORROWED_AMOUNT_SATS);
  });

  test("skips positions that the canister no longer returns in list", async () => {
    // given
    const getProfileStats = vi.fn().mockResolvedValue({
      debt: 0n,
      collateral: 0n,
      acumulated_interest: 0n,
      borrowing_power: { max_borrowable_usd: 0n, weighted_max_ltv: 0n },
      positions: [makePositionRecord()],
      weighted_liquidation_threshold: 0n,
    });
    vi.spyOn(Actor, "createActor").mockReturnValue({
      get_profile_stats: getProfileStats,
      get_position: vi.fn().mockResolvedValue([]),
      list_pools: vi.fn().mockResolvedValue([makePoolRecord()]),
    } as never);
    const client = new LiquidiumClient({});

    // when
    const positions = await client.positions.listPositions(PROFILE_ID);

    // then
    expect(positions).toEqual([]);
  });

  test("returns health factor and mapped user stats", async () => {
    // given
    const getHealthFactor = vi.fn().mockResolvedValue([
      1_500n,
      {
        debt: 10n,
        collateral: 100n,
        acumulated_interest: 0n,
        borrowing_power: {
          max_borrowable_usd: 80n,
          weighted_max_ltv: 8_000n,
        },
        positions: [],
        weighted_liquidation_threshold: 7_500n,
      },
    ]);
    vi.spyOn(Actor, "createActor").mockReturnValue({
      get_health_factor: getHealthFactor,
    } as never);
    const client = new LiquidiumClient({});

    // when
    const health = await client.positions.getHealthFactor(PROFILE_ID);

    // then
    expect(health).toEqual({
      healthFactor: 1_500n,
      userStats: {
        debt: 10n,
        debtDecimals: 27n,
        collateral: 100n,
        collateralDecimals: 27n,
        weightedLiquidationThreshold: 7_500n,
        borrowingPower: {
          weightedMaxLtv: 8_000n,
          maxBorrowableUsd: 80n,
          maxBorrowableUsdDecimals: 27n,
        },
      },
    });
    expect(getHealthFactor).toHaveBeenCalledWith(
      Principal.fromText(PROFILE_ID)
    );
  });

  test("wraps unexpected canister failures with CANISTER_REJECTED", async () => {
    // given
    vi.spyOn(Actor, "createActor").mockReturnValue({
      get_position: vi.fn().mockRejectedValue(new Error("boom")),
    } as never);
    const client = new LiquidiumClient({});

    // when

    // then
    await expect(
      client.positions.getPosition(PROFILE_ID, POOL_ID)
    ).rejects.toMatchObject({
      code: LiquidiumErrorCode.CANISTER_REJECTED,
      message: "Canister call failed: get_position",
    });
  });

  test("returns a user position summary with derived fields", async () => {
    // given
    const COLLATERAL_USD = 100n;
    const DEBT_USD = 40n;
    const MAX_BORROWABLE_USD = 80n;
    const WEIGHTED_MAX_LTV_BPS = 8_000n;
    const LIQUIDATION_THRESHOLD_BPS = 7_500n;
    const HEALTH_FACTOR = 1_500_000_000_000_000_000n;
    vi.spyOn(Actor, "createActor").mockReturnValue({
      get_health_factor: vi.fn().mockResolvedValue([
        HEALTH_FACTOR,
        {
          debt: DEBT_USD,
          collateral: COLLATERAL_USD,
          acumulated_interest: 0n,
          borrowing_power: {
            max_borrowable_usd: MAX_BORROWABLE_USD,
            weighted_max_ltv: WEIGHTED_MAX_LTV_BPS,
          },
          positions: [],
          weighted_liquidation_threshold: LIQUIDATION_THRESHOLD_BPS,
        },
      ]),
    } as never);
    const client = new LiquidiumClient({});

    // when
    const summary = await client.positions.getUserPositionSummary(PROFILE_ID);

    // then
    const EXPECTED_AVAILABLE_BORROWS_USD = MAX_BORROWABLE_USD - DEBT_USD;
    const EXPECTED_NET_WORTH_USD = COLLATERAL_USD - DEBT_USD;
    const EXPECTED_CURRENT_LTV_BPS = 4_000n;
    expect(summary).toEqual({
      totalCollateralUsd: COLLATERAL_USD,
      totalDebtUsd: DEBT_USD,
      availableBorrowsUsd: EXPECTED_AVAILABLE_BORROWS_USD,
      netWorthUsd: EXPECTED_NET_WORTH_USD,
      usdDecimals: 27n,
      currentLtvBps: EXPECTED_CURRENT_LTV_BPS,
      weightedMaxLtvBps: WEIGHTED_MAX_LTV_BPS,
      weightedLiquidationThresholdBps: LIQUIDATION_THRESHOLD_BPS,
      healthFactor: HEALTH_FACTOR,
    });
  });

  test("zeroes derived summary fields when the profile has no collateral", async () => {
    // given
    vi.spyOn(Actor, "createActor").mockReturnValue({
      get_health_factor: vi.fn().mockResolvedValue([
        0n,
        {
          debt: 0n,
          collateral: 0n,
          acumulated_interest: 0n,
          borrowing_power: {
            max_borrowable_usd: 0n,
            weighted_max_ltv: 0n,
          },
          positions: [],
          weighted_liquidation_threshold: 0n,
        },
      ]),
    } as never);
    const client = new LiquidiumClient({});

    // when
    const summary = await client.positions.getUserPositionSummary(PROFILE_ID);

    // then
    expect(summary.currentLtvBps).toBe(0n);
    expect(summary.availableBorrowsUsd).toBe(0n);
    expect(summary.netWorthUsd).toBe(0n);
  });

  test("reports negative net worth and clamps available borrows when underwater", async () => {
    // given
    const COLLATERAL_USD = 50n;
    const DEBT_USD = 80n;
    const MAX_BORROWABLE_USD = 40n;
    vi.spyOn(Actor, "createActor").mockReturnValue({
      get_health_factor: vi.fn().mockResolvedValue([
        900_000_000_000_000_000n,
        {
          debt: DEBT_USD,
          collateral: COLLATERAL_USD,
          acumulated_interest: 0n,
          borrowing_power: {
            max_borrowable_usd: MAX_BORROWABLE_USD,
            weighted_max_ltv: 8_000n,
          },
          positions: [],
          weighted_liquidation_threshold: 7_500n,
        },
      ]),
    } as never);
    const client = new LiquidiumClient({});

    // when
    const summary = await client.positions.getUserPositionSummary(PROFILE_ID);

    // then
    expect(summary.availableBorrowsUsd).toBe(0n);
    expect(summary.netWorthUsd).toBe(-30n);
    expect(summary.currentLtvBps).toBe(16_000n);
  });

  test("joins positions with pools and prices into per-reserve USD breakdowns", async () => {
    // given
    const BTC_POOL_ID = "pool-btc";
    const USDT_POOL_ID = "pool-usdt";
    const BTC_DEPOSITED_NATIVE_NOW = 200_000_000n;
    const BTC_TOTAL_EARNED_INTEREST = 10_000_000n;
    const BTC_EARNED_SINCE_SNAPSHOT = 1_000_000n;
    vi.spyOn(Actor, "createActor").mockReturnValue({
      get_profile_stats: vi.fn().mockResolvedValue({
        debt: 0n,
        collateral: 0n,
        acumulated_interest: 0n,
        borrowing_power: { max_borrowable_usd: 0n, weighted_max_ltv: 0n },
        positions: [
          makePositionRecord({ pool_id: { toText: () => BTC_POOL_ID } }),
          makePositionRecord({
            asset: { USDT: null },
            pool_id: { toText: () => USDT_POOL_ID },
          }),
        ],
        weighted_liquidation_threshold: 0n,
      }),
      get_position: vi
        .fn()
        .mockResolvedValueOnce([
          makePositionView({
            deposited_native_now: BTC_DEPOSITED_NATIVE_NOW,
            total_earned_interest: BTC_TOTAL_EARNED_INTEREST,
            earned_since_snapshot: BTC_EARNED_SINCE_SNAPSHOT,
            debt_native_now: 0n,
            pool_id: { toText: () => BTC_POOL_ID },
          }),
        ])
        .mockResolvedValueOnce([
          makePositionView({
            asset: { USDT: null },
            deposited_native_now: 0n,
            debt_native_now: 1_000_000n,
            pool_id: { toText: () => USDT_POOL_ID },
          }),
        ]),
      list_pools: vi.fn().mockResolvedValue([
        {
          optimal_utilization_rate: 80n,
          principal: {
            toString: () => BTC_POOL_ID,
            toText: () => BTC_POOL_ID,
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
          total_supply_at_last_sync: 0n,
        },
        {
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
          total_supply_at_last_sync: 0n,
        },
      ]),
      get_pool_rate: vi.fn().mockResolvedValue([]),
      get_prices: vi.fn().mockResolvedValue([
        ["BTC_USDT", 50_000_000_000n, 6],
        ["USDT_USDT", 1_000_000n, 6],
      ]),
    } as never);
    const client = new LiquidiumClient({});

    // when
    const reserves = await client.positions.getUserReserves(PROFILE_ID);

    // then
    const USD_SCALE = 10n ** 27n;
    const EXPECTED_BTC_SUPPLIED_USD = 100_000n * USD_SCALE;
    const EXPECTED_USDT_BORROWED_USD = 1n * USD_SCALE;
    expect(reserves).toHaveLength(2);
    const btcReserve = reserves.find((r) => r.pool.asset === "BTC");
    const usdtReserve = reserves.find((r) => r.pool.asset === "USDT");
    expect(btcReserve?.suppliedUsd).toBe(EXPECTED_BTC_SUPPLIED_USD);
    expect(btcReserve?.borrowedUsd).toBe(0n);
    expect(btcReserve?.priceUsd).toBe(50000);
    expect(usdtReserve?.suppliedUsd).toBe(0n);
    expect(usdtReserve?.borrowedUsd).toBe(EXPECTED_USDT_BORROWED_USD);
    expect(usdtReserve?.priceUsd).toBe(1);
  });

  test("returns zero full withdraw amount when no position exists", async () => {
    // given
    vi.spyOn(Actor, "createActor").mockReturnValue({
      get_position: vi.fn().mockResolvedValue([]),
    } as never);
    const client = new LiquidiumClient({});

    // when
    const withdraw = await client.positions.getFullWithdrawAmount(
      PROFILE_ID,
      POOL_ID
    );

    // then
    expect(withdraw).toEqual({ amount: 0n, decimals: 0n });
  });

  test("returns current deposited amount as full withdraw amount", async () => {
    // given
    const DEPOSITED_NATIVE_NOW = 1_100_000n;
    const TOTAL_EARNED_INTEREST = 100_000n;
    const EARNED_SINCE_SNAPSHOT = 10_000n;
    vi.spyOn(Actor, "createActor").mockReturnValue({
      get_position: vi.fn().mockResolvedValue([
        makePositionView({
          asset: { USDT: null },
          deposited_native_now: DEPOSITED_NATIVE_NOW,
          total_earned_interest: TOTAL_EARNED_INTEREST,
          earned_since_snapshot: EARNED_SINCE_SNAPSHOT,
        }),
      ]),
    } as never);
    const client = new LiquidiumClient({});

    // when
    const withdraw = await client.positions.getFullWithdrawAmount(
      PROFILE_ID,
      POOL_ID
    );

    // then
    const EXPECTED_DECIMALS = 6n;
    expect(withdraw).toEqual({
      amount: DEPOSITED_NATIVE_NOW,
      decimals: EXPECTED_DECIMALS,
    });
  });

  test("returns zero max repay amount when no position exists", async () => {
    // given
    vi.spyOn(Actor, "createActor").mockReturnValue({
      get_position: vi.fn().mockResolvedValue([]),
    } as never);
    const client = new LiquidiumClient({});

    // when
    const repay = await client.positions.getMaxRepayAmount(PROFILE_ID, POOL_ID);

    // then
    expect(repay).toEqual({ amount: 0n, decimals: 0n });
  });

  test("returns zero max repay amount when position has no debt", async () => {
    // given
    vi.spyOn(Actor, "createActor").mockReturnValue({
      get_position: vi
        .fn()
        .mockResolvedValue([
          makePositionView({ deposited_native_now: 100n, debt_native_now: 0n }),
        ]),
    } as never);
    const client = new LiquidiumClient({});

    // when
    const repay = await client.positions.getMaxRepayAmount(PROFILE_ID, POOL_ID);

    // then
    expect(repay).toEqual({ amount: 0n, decimals: 8n });
  });

  test("applies the default 0.1 percent accrual buffer to the repay amount", async () => {
    // given
    const DEBT_NATIVE = 1_000_000n;
    const DEBT_INTEREST_NATIVE = 0n;
    vi.spyOn(Actor, "createActor").mockReturnValue({
      get_position: vi.fn().mockResolvedValue([
        makePositionView({
          asset: { USDT: null },
          debt_native_now: DEBT_NATIVE,
          total_debt_interest: DEBT_INTEREST_NATIVE,
        }),
      ]),
    } as never);
    const client = new LiquidiumClient({});

    // when
    const repay = await client.positions.getMaxRepayAmount(PROFILE_ID, POOL_ID);

    // then
    const EXPECTED_AMOUNT = 1_001_000n;
    const EXPECTED_DECIMALS = 6n;
    expect(repay).toEqual({
      amount: EXPECTED_AMOUNT,
      decimals: EXPECTED_DECIMALS,
    });
  });

  test("applies a custom accrual buffer when provided", async () => {
    // given
    const DEBT_NATIVE = 1_000_000n;
    const CUSTOM_BUFFER_BPS = 500n;
    vi.spyOn(Actor, "createActor").mockReturnValue({
      get_position: vi.fn().mockResolvedValue([
        makePositionView({
          asset: { USDT: null },
          debt_native_now: DEBT_NATIVE,
        }),
      ]),
    } as never);
    const client = new LiquidiumClient({});

    // when
    const repay = await client.positions.getMaxRepayAmount(
      PROFILE_ID,
      POOL_ID,
      CUSTOM_BUFFER_BPS
    );

    // then
    const EXPECTED_AMOUNT = 1_050_000n;
    expect(repay.amount).toBe(EXPECTED_AMOUNT);
  });

  test("filters out positions with unknown assets in listPositions", async () => {
    // given
    const UNKNOWN_ASSET_POOL_ID = "unknown-asset-pool";
    const getProfileStats = vi.fn().mockResolvedValue({
      debt: 0n,
      collateral: 0n,
      acumulated_interest: 0n,
      borrowing_power: { max_borrowable_usd: 0n, weighted_max_ltv: 0n },
      positions: [
        makePositionRecord({ pool_id: { toText: () => POOL_ID } }),
        makePositionRecord({
          asset: { DOGE: null },
          pool_id: { toText: () => UNKNOWN_ASSET_POOL_ID },
        }),
      ],
      weighted_liquidation_threshold: 0n,
    });
    const getPosition = vi.fn().mockResolvedValue([
      makePositionView({
        deposited_native_now: BTC_DUST_THRESHOLD_SATS,
      }),
    ]);
    vi.spyOn(Actor, "createActor").mockReturnValue({
      get_profile_stats: getProfileStats,
      get_position: getPosition,
      list_pools: vi.fn().mockResolvedValue([makePoolRecord()]),
    } as never);
    const client = new LiquidiumClient({});

    // when
    const positions = await client.positions.listPositions(PROFILE_ID);

    // then
    expect(positions).toHaveLength(1);
    expect(positions[0]?.poolId).toBe(POOL_ID);
    expect(getPosition).toHaveBeenCalledTimes(1);
  });

  test("returns null from getPosition when the canister reports an unknown asset", async () => {
    // given
    vi.spyOn(Actor, "createActor").mockReturnValue({
      get_position: vi
        .fn()
        .mockResolvedValue([makePositionView({ asset: { DOGE: null } })]),
    } as never);
    const client = new LiquidiumClient({});

    // when
    const position = await client.positions.getPosition(PROFILE_ID, POOL_ID);

    // then
    expect(position).toBeNull();
  });

  test("keeps aggregate stats and filters unknown positions in getHealthFactor", async () => {
    // given
    const COLLATERAL_USD = 1_000n;
    const DEBT_USD = 100n;
    vi.spyOn(Actor, "createActor").mockReturnValue({
      get_health_factor: vi.fn().mockResolvedValue([
        1_500n,
        {
          debt: DEBT_USD,
          collateral: COLLATERAL_USD,
          acumulated_interest: 0n,
          borrowing_power: {
            max_borrowable_usd: 500n,
            weighted_max_ltv: 7_000n,
          },
          positions: [
            makePositionRecord({ asset: { BTC: null } }),
            makePositionRecord({ asset: { DOGE: null } }),
          ],
          weighted_liquidation_threshold: 7_500n,
        },
      ]),
    } as never);
    const client = new LiquidiumClient({});

    // when
    const health = await client.positions.getHealthFactor(PROFILE_ID);

    // then
    expect(health.healthFactor).toBe(1_500n);
    expect(health.userStats.collateral).toBe(COLLATERAL_USD);
    expect(health.userStats.debt).toBe(DEBT_USD);
  });
});
