import { Actor } from "@icp-sdk/core/agent";
import { afterEach, describe, expect, test, vi } from "vitest";
import {
  LiquidiumClient,
  LiquidiumErrorCode,
  RATE_DECIMALS,
} from "../../../index";

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("MarketModule", () => {
  test("gets pools from the lending canister", async () => {
    // given
    vi.spyOn(Actor, "createActor").mockReturnValue({
      list_pools: vi.fn().mockResolvedValue([
        {
          optimal_utilization_rate: 80n,
          principal: { toString: () => "pool-1", toText: () => "pool-1" },
          total_generated_interest_snapshot: 0n,
          supply_cap: [1_000_000n],
          same_asset_borrowing: [true],
          asset: { BTC: null },
          rate_slope_before: 1n,
          borrow_cap: [500_000n],
          total_debt_at_last_sync: 25_000n,
          chain: { BTC: null },
          rate_slope_after: 2n,
          reserve_factor: 100n,
          last_updated: [123n],
          lending_index: 300n,
          protocol_liquidation_fee: 50n,
          borrow_index: 400n,
          base_rate: 5n,
          frozen: false,
          liquidation_bonus: 200n,
          liquidation_threshold: 7_500n,
          max_ltv: 7_000n,
          total_supply_at_last_sync: 50_000n,
        },
      ]),
      get_pool_rate: vi.fn().mockResolvedValue([[10n, 20n, 30n]]),
    } as never);
    const client = new LiquidiumClient({});

    // when
    const pools = await client.market.listPools();

    // then
    expect(pools).toEqual([
      {
        id: "pool-1",
        asset: "BTC",
        chain: "BTC",
        decimals: 8n,
        frozen: false,
        totalSupply: 50_000n,
        totalDebt: 25_000n,
        availableLiquidity: 25_000n,
        supplyCap: 1_000_000n,
        borrowCap: 500_000n,
        maxLtv: 7_000n,
        liquidationThreshold: 7_500n,
        liquidationBonus: 200n,
        protocolLiquidationFee: 50n,
        reserveFactor: 100n,
        rateDecimals: RATE_DECIMALS,
        lendingRate: 20n,
        borrowingRate: 10n,
        utilizationRate: 30n,
        baseRate: 5n,
        optimalUtilizationRate: 80n,
        rateSlopeBefore: 1n,
        rateSlopeAfter: 2n,
        lendingIndex: 300n,
        borrowIndex: 400n,
        sameAssetBorrowing: true,
        lastUpdated: 123n,
      },
    ]);
  });

  test("maps ICP pools with 8 native decimals", async () => {
    // given
    vi.spyOn(Actor, "createActor").mockReturnValue({
      list_pools: vi.fn().mockResolvedValue([
        {
          optimal_utilization_rate: 80n,
          principal: { toString: () => "pool-icp", toText: () => "pool-icp" },
          total_generated_interest_snapshot: 0n,
          supply_cap: [],
          same_asset_borrowing: [],
          asset: { ICP: null },
          rate_slope_before: 1n,
          borrow_cap: [],
          total_debt_at_last_sync: 25_000n,
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
          max_ltv: 0n,
          total_supply_at_last_sync: 50_000n,
        },
      ]),
      get_pool_rate: vi.fn().mockResolvedValue([]),
    } as never);
    const client = new LiquidiumClient({});

    // when
    const pools = await client.market.listPools();

    // then
    expect(pools[0]).toMatchObject({
      id: "pool-icp",
      asset: "ICP",
      chain: "ICP",
      decimals: 8n,
    });
  });

  test("defaults pool rates to zero when get_pool_rate returns none", async () => {
    // given
    vi.spyOn(Actor, "createActor").mockReturnValue({
      list_pools: vi.fn().mockResolvedValue([
        {
          optimal_utilization_rate: 80n,
          principal: { toString: () => "pool-1", toText: () => "pool-1" },
          total_generated_interest_snapshot: 0n,
          supply_cap: [],
          same_asset_borrowing: [],
          asset: { USDT: null },
          rate_slope_before: 1n,
          borrow_cap: [],
          total_debt_at_last_sync: 25_000n,
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
          max_ltv: 0n,
          total_supply_at_last_sync: 50_000n,
        },
      ]),
      get_pool_rate: vi.fn().mockResolvedValue([]),
    } as never);
    const client = new LiquidiumClient({});

    // when
    const pools = await client.market.listPools();

    // then
    expect(pools[0]).toMatchObject({
      asset: "USDT",
      chain: "ETH",
      rateDecimals: RATE_DECIMALS,
      borrowingRate: 0n,
      lendingRate: 0n,
      utilizationRate: 0n,
      maxLtv: 0n,
      sameAssetBorrowing: false,
    });
  });

  test("excludes unsupported SOL pools returned by the canister", async () => {
    // given
    vi.spyOn(Actor, "createActor").mockReturnValue({
      list_pools: vi.fn().mockResolvedValue([
        {
          optimal_utilization_rate: 80n,
          principal: { toString: () => "pool-sol", toText: () => "pool-sol" },
          total_generated_interest_snapshot: 0n,
          supply_cap: [],
          same_asset_borrowing: [],
          asset: { SOL: null },
          rate_slope_before: 1n,
          borrow_cap: [],
          total_debt_at_last_sync: 0n,
          chain: { SOL: null },
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
        },
      ]),
      get_pool_rate: vi.fn().mockResolvedValue([[10n, 20n, 30n]]),
    } as never);
    const client = new LiquidiumClient({});

    // when
    const pools = await client.market.listPools();

    // then
    expect(pools).toHaveLength(0);
  });

  test("ignores pools with unsupported assets instead of failing", async () => {
    // given
    vi.spyOn(Actor, "createActor").mockReturnValue({
      list_pools: vi.fn().mockResolvedValue([
        {
          optimal_utilization_rate: 80n,
          principal: { toString: () => "pool-btc", toText: () => "pool-btc" },
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
        },
        {
          optimal_utilization_rate: 80n,
          principal: {
            toString: () => "pool-unknown",
            toText: () => "pool-unknown",
          },
          total_generated_interest_snapshot: 0n,
          supply_cap: [],
          same_asset_borrowing: [],
          asset: { NEWCOIN: null },
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
        },
      ]),
      get_pool_rate: vi.fn().mockResolvedValue([[10n, 20n, 30n]]),
    } as never);
    const client = new LiquidiumClient({});

    // when
    const pools = await client.market.listPools();

    // then
    expect(pools).toHaveLength(1);
    expect(pools[0]).toMatchObject({
      id: "pool-btc",
      asset: "BTC",
      chain: "BTC",
    });
  });

  test("finds a single pool by asset and chain", async () => {
    // given
    const btcPoolPrincipal = "pool-btc";
    const usdtPoolPrincipal = "pool-usdt";
    vi.spyOn(Actor, "createActor").mockReturnValue({
      list_pools: vi.fn().mockResolvedValue([
        {
          optimal_utilization_rate: 80n,
          principal: {
            toString: () => btcPoolPrincipal,
            toText: () => btcPoolPrincipal,
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
        },
        {
          optimal_utilization_rate: 80n,
          principal: {
            toString: () => usdtPoolPrincipal,
            toText: () => usdtPoolPrincipal,
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
        },
      ]),
      get_pool_rate: vi.fn().mockResolvedValue([]),
    } as never);
    const client = new LiquidiumClient({});

    // when
    const pool = await client.market.findPool({ asset: "BTC", chain: "BTC" });

    // then
    expect(pool.id).toBe(btcPoolPrincipal);
    expect(pool.asset).toBe("BTC");
    expect(pool.chain).toBe("BTC");
  });

  test("throws VALIDATION_ERROR when multiple pools match the query", async () => {
    // given
    vi.spyOn(Actor, "createActor").mockReturnValue({
      list_pools: vi.fn().mockResolvedValue([
        {
          optimal_utilization_rate: 80n,
          principal: {
            toString: () => "pool-btc-1",
            toText: () => "pool-btc-1",
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
        },
        {
          optimal_utilization_rate: 80n,
          principal: {
            toString: () => "pool-btc-2",
            toText: () => "pool-btc-2",
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
        },
      ]),
      get_pool_rate: vi.fn().mockResolvedValue([]),
    } as never);
    const client = new LiquidiumClient({});

    // when

    // then
    await expect(
      client.market.findPool({ asset: "BTC", chain: "BTC" })
    ).rejects.toMatchObject({
      code: LiquidiumErrorCode.VALIDATION_ERROR,
      message:
        "Multiple pools found for asset BTC on chain BTC. Select a specific pool id.",
    });
  });

  test("gets asset prices from USDT-quoted pairs", async () => {
    // given
    vi.spyOn(Actor, "createActor").mockReturnValue({
      get_prices: vi.fn().mockResolvedValue([
        ["BTC_USDT", 72_000_000_000_000_000_000_000_000_000_000n, 27],
        ["USDC_USDT", 999_910_065_000_000_000_000_000_000n, 27],
        ["USDT_USDT", 1_000_018_620_000_000_000_000_000_000n, 27],
      ]),
    } as never);
    const client = new LiquidiumClient({});

    // when
    const prices = await client.market.getAssetPrices();

    // then
    expect(prices.BTC).toBe(72000);
    expect(prices.USDT).toBe(1.00001862);
    expect(prices.USDC).toBeCloseTo(0.999910065, 12);
  });

  test("ignores pairs that are not USDT-quoted", async () => {
    // given
    vi.spyOn(Actor, "createActor").mockReturnValue({
      get_prices: vi.fn().mockResolvedValue([
        ["BTC_USD", 68_500_000_000n, 6],
        ["BTC_USDT", 68_500_000_000n, 6],
        ["USDT_USDT", 1_000_000n, 6],
        ["SOL_USDT", 150_000_000n, 6],
        ["ETH_BTC", 50_000n, 6],
      ]),
    } as never);
    const client = new LiquidiumClient({});

    // when
    const prices = await client.market.getAssetPrices();

    // then
    expect(prices).toEqual({
      BTC: 68500,
      SOL: 150,
      USDT: 1,
    });
  });

  test("returns an empty price map when USDT-quoted pairs are missing", async () => {
    // given
    vi.spyOn(Actor, "createActor").mockReturnValue({
      get_prices: vi.fn().mockResolvedValue([["BTC_USD", 68_500_000_000n, 6]]),
    } as never);
    const client = new LiquidiumClient({});

    // when
    const prices = await client.market.getAssetPrices();

    // then
    expect(prices).toEqual({});
  });

  test("gets a pool rate from the lending canister", async () => {
    // given
    vi.spyOn(Actor, "createActor").mockReturnValue({
      get_pool_rate: vi.fn().mockResolvedValue([[10n, 20n, 30n]]),
    } as never);
    const client = new LiquidiumClient({});

    // when
    const rate = await client.market.getPoolRate("aaaaa-aa");

    // then
    expect(rate).toEqual({
      rateDecimals: RATE_DECIMALS,
      borrowRate: 10n,
      lendRate: 20n,
      utilizationRate: 30n,
    });
  });

  test("getReserveData returns the enriched pool for an asset/chain pair", async () => {
    // given
    const USDT_POOL_ID = "pool-usdt";
    vi.spyOn(Actor, "createActor").mockReturnValue({
      list_pools: vi.fn().mockResolvedValue([
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
          total_debt_at_last_sync: 10_000n,
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
          total_supply_at_last_sync: 100_000n,
        },
      ]),
      get_pool_rate: vi.fn().mockResolvedValue([[10n, 20n, 30n]]),
    } as never);
    const client = new LiquidiumClient({});

    // when
    const reserve = await client.market.getReserveData({
      asset: "USDT",
      chain: "ETH",
    });

    // then
    expect(reserve).toMatchObject({
      id: "pool-usdt",
      asset: "USDT",
      chain: "ETH",
      decimals: 6n,
      totalSupply: 100_000n,
      totalDebt: 10_000n,
      availableLiquidity: 90_000n,
      rateDecimals: RATE_DECIMALS,
      borrowingRate: 10n,
      lendingRate: 20n,
      utilizationRate: 30n,
    });
  });

  test("throws POOL_NOT_FOUND when a pool rate is missing", async () => {
    // given
    vi.spyOn(Actor, "createActor").mockReturnValue({
      get_pool_rate: vi.fn().mockResolvedValue([]),
    } as never);
    const client = new LiquidiumClient({});

    // when

    // then
    await expect(client.market.getPoolRate("aaaaa-aa")).rejects.toMatchObject({
      code: LiquidiumErrorCode.POOL_NOT_FOUND,
    });
  });
});
