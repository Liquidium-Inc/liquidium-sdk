import { Actor } from "@icp-sdk/core/agent";
import { afterEach, describe, expect, test, vi } from "vitest";
import {
  LiquidiumClient,
  LiquidiumErrorCode,
  RATE_DECIMALS,
  RATE_SCALE,
} from "../../../index";

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("MarketModule", () => {
  test("applies pool indexes to current supply and debt totals", async () => {
    // given
    const totalSupplyShares = 50_000n;
    const totalDebtShares = 25_000n;
    const lendingIndex = 2n * RATE_SCALE;
    const borrowIndex = 3n * RATE_SCALE;
    vi.spyOn(Actor, "createActor").mockReturnValue({
      list_pools: vi.fn().mockResolvedValue([
        {
          optimal_utilization_rate: 80n,
          principal: { toString: () => "pool-1", toText: () => "pool-1" },
          total_generated_interest_snapshot: 0n,
          supply_cap: [1_000_000n],
          same_asset_borrowing: [true],
          same_asset_borrowing_dust_threshold: 100n,
          asset: { BTC: null },
          rate_slope_before: 1n,
          borrow_cap: [500_000n],
          total_debt_at_last_sync: totalDebtShares,
          chain: { BTC: null },
          rate_slope_after: 2n,
          reserve_factor: 100n,
          last_updated: [123n],
          lending_index: lendingIndex,
          protocol_liquidation_fee: 50n,
          borrow_index: borrowIndex,
          base_rate: 5n,
          frozen: false,
          liquidation_bonus: 200n,
          liquidation_threshold: 7_500n,
          max_ltv: 7_000n,
          total_supply_at_last_sync: totalSupplyShares,
        },
      ]),
      get_pool_rate: vi.fn().mockResolvedValue([[10n, 20n, 30n]]),
    } as never);
    const client = new LiquidiumClient({});

    // when
    const pools = await client.market.listPools();

    // then
    const EXPECTED_TOTAL_SUPPLY = 100_000n;
    const EXPECTED_TOTAL_DEBT = 75_000n;
    const EXPECTED_AVAILABLE_LIQUIDITY = 25_000n;
    expect(pools).toEqual([
      {
        id: "pool-1",
        asset: "BTC",
        displayName: "Bitcoin",
        iconUrl: "https://app.liquidium.fi/img/logos/crypto/btc.svg",
        chain: "BTC",
        decimals: 8n,
        frozen: false,
        totalSupply: EXPECTED_TOTAL_SUPPLY,
        totalDebt: EXPECTED_TOTAL_DEBT,
        availableLiquidity: EXPECTED_AVAILABLE_LIQUIDITY,
        supplyCap: 1_000_000n,
        borrowCap: 500_000n,
        maxLtv: 7_000n,
        liquidationThreshold: 7_500n,
        liquidationBonus: 200n,
        protocolLiquidationFee: 50n,
        reserveFactor: 100n,
        rateDecimals: RATE_DECIMALS,
        lendingRate: 20n,
        estimatedLendingApy: 0n,
        borrowingRate: 10n,
        estimatedBorrowingApy: 0n,
        utilizationRate: 30n,
        baseRate: 5n,
        optimalUtilizationRate: 80n,
        rateSlopeBefore: 1n,
        rateSlopeAfter: 2n,
        lendingIndex,
        borrowIndex,
        sameAssetBorrowing: true,
        sameAssetBorrowingDustThreshold: 100n,
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

  test("maps native ETH reserves with 18 decimals", async () => {
    // given
    const ETH_POOL_ID = "pool-eth";
    vi.spyOn(Actor, "createActor").mockReturnValue({
      list_pools: vi.fn().mockResolvedValue([
        {
          optimal_utilization_rate: 80n,
          principal: { toString: () => ETH_POOL_ID, toText: () => ETH_POOL_ID },
          total_generated_interest_snapshot: 0n,
          supply_cap: [],
          same_asset_borrowing: [],
          asset: { ETH: null },
          rate_slope_before: 1n,
          borrow_cap: [],
          total_debt_at_last_sync: 1_000_000_000_000_000_000n,
          chain: { ETH: null },
          rate_slope_after: 2n,
          reserve_factor: 100n,
          last_updated: [],
          lending_index: RATE_SCALE,
          protocol_liquidation_fee: 50n,
          borrow_index: RATE_SCALE,
          base_rate: 5n,
          frozen: false,
          liquidation_bonus: 200n,
          liquidation_threshold: 7_500n,
          max_ltv: 7_000n,
          total_supply_at_last_sync: 3_000_000_000_000_000_000n,
        },
      ]),
      get_pool_rate: vi.fn().mockResolvedValue([[10n, 20n, 30n]]),
    } as never);
    const client = new LiquidiumClient({});

    // when
    const reserve = await client.market.getReserveData({
      asset: "ETH",
      chain: "ETH",
    });

    // then
    expect(reserve).toMatchObject({
      id: ETH_POOL_ID,
      asset: "ETH",
      chain: "ETH",
      decimals: 18n,
      availableLiquidity: 2_000_000_000_000_000_000n,
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
      estimatedBorrowingApy: 0n,
      lendingRate: 0n,
      estimatedLendingApy: 0n,
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

  test("resolves native and chain-key identifiers to their backing pool", async () => {
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
    const nativePool = await client.market.findPool({
      asset: "BTC",
      chain: "BTC",
    });
    const chainKeyPool = await client.market.findPool({
      asset: "USDT",
      chain: "ICP",
    });

    // then
    expect(nativePool).toMatchObject({
      id: btcPoolPrincipal,
      asset: "BTC",
      chain: "BTC",
    });
    expect(chainKeyPool).toMatchObject({
      id: usdtPoolPrincipal,
      asset: "USDT",
      chain: "ETH",
    });
  });

  test("resolves native and chain-key ETH identifiers to the ETH backing pool", async () => {
    // given
    const ethPoolPrincipal = "pool-eth";
    const client = new LiquidiumClient({});
    vi.spyOn(client.market, "listPools").mockResolvedValue([
      {
        id: ethPoolPrincipal,
        asset: "ETH",
        chain: "ETH",
      } as never,
    ]);

    // when
    const nativePool = await client.market.findPool({
      asset: "ETH",
      chain: "ETH",
    });
    const chainKeyPool = await client.market.findPool({
      asset: "ETH",
      chain: "ICP",
    });

    // then
    expect(nativePool).toMatchObject({
      id: ethPoolPrincipal,
      asset: "ETH",
      chain: "ETH",
    });
    expect(chainKeyPool).toBe(nativePool);
  });

  test("rejects an unsupported asset and chain pair", async () => {
    const client = new LiquidiumClient({});

    await expect(
      client.market.findPool({ asset: "BTC", chain: "ETH" } as never)
    ).rejects.toMatchObject({
      code: LiquidiumErrorCode.VALIDATION_ERROR,
      message: "Unsupported asset identifier: ETH/BTC",
    });
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

  test("returns prices with the SDK fetch timestamp", async () => {
    // given
    const FETCHED_AT_SECONDS = 1_750_000_000n;
    vi.useFakeTimers();
    vi.setSystemTime(Number(FETCHED_AT_SECONDS * 1_000n));
    vi.spyOn(Actor, "createActor").mockReturnValue({
      get_prices: vi.fn().mockResolvedValue([["BTC_USDT", 68_500_000_000n, 6]]),
    } as never);
    const client = new LiquidiumClient({});

    // when
    const snapshot = await client.market.getAssetPriceSnapshot();

    // then
    expect(snapshot).toEqual({
      prices: { BTC: 68_500 },
      fetchedAt: FETCHED_AT_SECONDS,
    });
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
      estimatedBorrowApy: 0n,
      lendRate: 20n,
      estimatedLendApy: 0n,
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
          lending_index: RATE_SCALE,
          protocol_liquidation_fee: 50n,
          borrow_index: RATE_SCALE,
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
