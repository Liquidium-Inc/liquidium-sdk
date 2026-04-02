import { Actor } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import { afterEach, describe, expect, test, vi } from "vitest";
import { LiquidiumClient, LiquidiumError, LiquidiumErrorCode } from "../index";

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

async function collectWatchUpdates<T>(
  iterator: AsyncGenerator<T, void, void>,
  expectedCount: number,
  pollIntervalMs = 5_000
): Promise<T[]> {
  const updates: T[] = [];

  while (updates.length < expectedCount) {
    const nextResultPromise = iterator.next();
    await vi.runAllTicks();
    if (updates.length > 0) {
      await vi.advanceTimersByTimeAsync(pollIntervalMs);
    }

    const nextResult = await nextResultPromise;
    if (nextResult.done) {
      break;
    }

    updates.push(nextResult.value);
  }

  return updates;
}

describe("AccountsModule", () => {
  test("prepares and submits an account creation request manually", async () => {
    // given
    const registerProfile = vi.fn().mockResolvedValue({
      Ok: {
        toText: () => "ccccc-cc",
      },
    });
    const getNonce = vi.fn().mockResolvedValue(11n);
    vi.spyOn(Actor, "createActor").mockReturnValue({
      get_nonce: getNonce,
      get_wallet_profile: vi.fn().mockResolvedValue([]),
      register_profile: registerProfile,
    } as never);
    const client = LiquidiumClient.create({});

    // when
    const createAction = await client.accounts.create({ account: "0xabc" });
    const profileId = await createAction.submit({
      signature: "0xsigned",
      chain: "ETH",
      account: "0xabc",
    });

    // then
    expect(getNonce).toHaveBeenCalledWith("0xabc");
    expect(createAction.kind).toBe("create-account");
    expect(createAction.account).toBe("0xabc");
    expect(createAction.message).toContain("Liquidium: Initialize Account");
    expect(profileId).toBe("ccccc-cc");
    expect(registerProfile).toHaveBeenCalledTimes(1);
  });

  test("maps protocol errors when account creation fails", async () => {
    // given
    vi.spyOn(Actor, "createActor").mockReturnValue({
      get_wallet_profile: vi.fn().mockResolvedValue([]),
      get_nonce: vi.fn().mockResolvedValue(7n),
      register_profile: vi.fn().mockResolvedValue({
        Err: { ProfileAlreadyExists: null },
      }),
    } as never);
    const client = LiquidiumClient.create({});

    // when / then
    await expect(
      client.accounts.create({ account: "0x123" }).then((createAction) =>
        createAction.submit({
          signature: "0xabc",
          chain: "ETH",
          account: "0x123",
        })
      )
    ).rejects.toMatchObject({
      code: LiquidiumErrorCode.PROFILE_ALREADY_EXISTS,
    });
  });

  test("blocks create action when wallet already has a profile", async () => {
    // given
    vi.spyOn(Actor, "createActor").mockReturnValue({
      get_wallet_profile: vi
        .fn()
        .mockResolvedValue([{ toText: () => "aaaaa-aa" }]),
      get_nonce: vi.fn(),
      register_profile: vi.fn(),
    } as never);
    const client = LiquidiumClient.create({});

    // when / then
    await expect(
      client.accounts.create({ account: "0xabc" })
    ).rejects.toMatchObject({
      code: LiquidiumErrorCode.PROFILE_ALREADY_EXISTS,
      message: "Wallet address is already linked to profile aaaaa-aa",
    });
  });

  test("blocks action submission when wallet already has a profile", async () => {
    // given
    const registerProfile = vi.fn();
    vi.spyOn(Actor, "createActor").mockReturnValue({
      get_wallet_profile: vi
        .fn()
        .mockResolvedValue([{ toText: () => "bbbbb-bb" }]),
      get_nonce: vi.fn(),
      register_profile: registerProfile,
    } as never);
    const client = LiquidiumClient.create({});

    // when / then
    await expect(
      client.accounts.create({ account: "0xabc" }).then((createAction) =>
        createAction.submit({
          signature: "0xsigned",
          chain: "ETH",
          account: "0xabc",
        })
      )
    ).rejects.toMatchObject({
      code: LiquidiumErrorCode.PROFILE_ALREADY_EXISTS,
      message: "Wallet address is already linked to profile bbbbb-bb",
    });
    expect(registerProfile).not.toHaveBeenCalled();
  });
});

describe("HistoryModule", () => {
  test("throws SERVICE_UNAVAILABLE when no apiBaseUrl configured", async () => {
    // given
    const client = LiquidiumClient.create({});

    // when / then
    await expect(client.history.getUser("profile-1")).rejects.toThrow(
      LiquidiumError
    );
    await expect(client.history.getUser("profile-1")).rejects.toMatchObject({
      code: LiquidiumErrorCode.SERVICE_UNAVAILABLE,
    });
  });

  test("fetches user history through the sdk api", async () => {
    // given
    const responsePayload = {
      success: true as const,
      items: [
        {
          id: "history-1",
          type: "supply" as const,
          amount: "100000",
          poolId: "pool-1",
          timestamp: "2026-04-01T00:00:00.000Z",
          status: "CONFIRMED" as const,
          txid: "tx-1",
          txids: ["tx-1"],
        },
      ],
      nextCursor: "2026-04-01T00:00:00.000Z::history-1",
    };
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(responsePayload), {
        status: 200,
        headers: {
          "content-type": "application/json",
        },
      })
    );
    const client = LiquidiumClient.create({
      apiBaseUrl: "https://app.liquidium.fi/api/sdk",
    });

    // when
    const result = await client.history.getUser(
      "profile-1",
      "2026-03-31T00:00:00.000Z::history-0"
    );

    // then
    expect(result).toEqual({
      items: [
        {
          id: "history-1",
          type: "supply",
          amount: 100000n,
          poolId: "pool-1",
          timestamp: "2026-04-01T00:00:00.000Z",
          status: "CONFIRMED",
          txid: "tx-1",
          txids: ["tx-1"],
        },
      ],
      nextCursor: "2026-04-01T00:00:00.000Z::history-1",
    });
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://app.liquidium.fi/api/sdk/v1/history/user/profile-1?cursor=2026-03-31T00%3A00%3A00.000Z%3A%3Ahistory-0",
      {
        method: "GET",
        headers: undefined,
        body: undefined,
        signal: expect.any(AbortSignal),
      }
    );
  });

  test("fetches pool history through the sdk api", async () => {
    // given
    const responsePayload = {
      success: true as const,
      items: [
        {
          id: "snapshot-1",
          type: "snapshot" as const,
          poolId: "pool-1",
          asset: "BTC",
          chain: "BTC",
          timestamp: "2026-04-01T00:00:00.000Z",
          totalSupply: "1000",
          totalDebt: "100",
          supplyCap: "5000",
          borrowCap: "2000",
          maxLtv: "7000",
          liquidationThreshold: "7500",
          liquidationBonus: "200",
          protocolLiquidationFee: "50",
          reserveFactor: "100",
          baseRate: "5",
          optimalUtilizationRate: "8000",
          rateSlopeBefore: "1",
          rateSlopeAfter: "2",
          lendingIndex: "300",
          borrowIndex: "400",
          sameAssetBorrowing: true,
          frozen: false,
          lastUpdated: "123",
        },
      ],
    };
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(responsePayload), {
        status: 200,
        headers: {
          "content-type": "application/json",
        },
      })
    );
    const client = LiquidiumClient.create({
      apiBaseUrl: "https://app.liquidium.fi/api/sdk",
    });

    // when
    const result = await client.history.getPool("pool-1");

    // then
    expect(result).toEqual({
      items: [
        {
          id: "snapshot-1",
          type: "snapshot",
          poolId: "pool-1",
          asset: "BTC",
          chain: "BTC",
          timestamp: "2026-04-01T00:00:00.000Z",
          totalSupply: 1000n,
          totalDebt: 100n,
          supplyCap: 5000n,
          borrowCap: 2000n,
          maxLtv: 7000n,
          liquidationThreshold: 7500n,
          liquidationBonus: 200n,
          protocolLiquidationFee: 50n,
          reserveFactor: 100n,
          baseRate: 5n,
          optimalUtilizationRate: 8000n,
          rateSlopeBefore: 1n,
          rateSlopeAfter: 2n,
          lendingIndex: 300n,
          borrowIndex: 400n,
          sameAssetBorrowing: true,
          frozen: false,
          lastUpdated: 123n,
        },
      ],
      nextCursor: undefined,
    });
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://app.liquidium.fi/api/sdk/v1/history/pool/pool-1",
      {
        method: "GET",
        headers: undefined,
        body: undefined,
        signal: expect.any(AbortSignal),
      }
    );
  });
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
    const client = LiquidiumClient.create({});

    // when
    const pools = await client.market.getPools();

    // then
    expect(pools).toEqual([
      {
        id: "pool-1",
        asset: "BTC",
        chain: "BTC",
        frozen: false,
        totalSupply: 50_000n,
        totalDebt: 25_000n,
        supplyCap: 1_000_000n,
        borrowCap: 500_000n,
        maxLtv: 7_000n,
        liquidationThreshold: 7_500n,
        liquidationBonus: 200n,
        protocolLiquidationFee: 50n,
        reserveFactor: 100n,
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
    const client = LiquidiumClient.create({});

    // when
    const pools = await client.market.getPools();

    // then
    expect(pools[0]).toMatchObject({
      asset: "USDT",
      chain: "ETH",
      borrowingRate: 0n,
      lendingRate: 0n,
      utilizationRate: 0n,
      maxLtv: 7_500n,
      sameAssetBorrowing: false,
    });
  });

  test("returns dynamic asset and chain values from the canister", async () => {
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
    const client = LiquidiumClient.create({});

    // when
    const pools = await client.market.getPools();

    // then
    expect(pools[0]).toMatchObject({
      asset: "SOL",
      chain: "SOL",
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
    const client = LiquidiumClient.create({});

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
          principal: { toString: () => "pool-btc-1", toText: () => "pool-btc-1" },
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
          principal: { toString: () => "pool-btc-2", toText: () => "pool-btc-2" },
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
    const client = LiquidiumClient.create({});

    // when / then
    await expect(
      client.market.findPool({ asset: "BTC", chain: "BTC" })
    ).rejects.toMatchObject({
      code: LiquidiumErrorCode.VALIDATION_ERROR,
      message:
        "Multiple pools found for asset BTC on chain BTC. Select a specific pool id.",
    });
  });

  test("gets asset prices from the lending canister", async () => {
    // given
    vi.spyOn(Actor, "createActor").mockReturnValue({
      get_prices: vi.fn().mockResolvedValue([
        ["BTC_USDT", 68_500_000_000n, 6],
        ["USDT_USDT", 1_000_000n, 6],
        ["SOL_USDT", 150_000_000n, 6],
      ]),
    } as never);
    const client = LiquidiumClient.create({});

    // when
    const prices = await client.market.getAssetPrices();

    // then
    expect(prices).toEqual({
      BTC: 68500,
      SOL: 150,
      USDT: 1,
    });
  });

  test("throws when the quote anchor price pair is missing", async () => {
    // given
    vi.spyOn(Actor, "createActor").mockReturnValue({
      get_prices: vi.fn().mockResolvedValue([["BTC_USDT", 68_500_000_000n, 6]]),
    } as never);
    const client = LiquidiumClient.create({});

    // when / then
    await expect(client.market.getAssetPrices()).rejects.toMatchObject({
      code: LiquidiumErrorCode.INTERNAL,
      message: "Missing price pair returned by canister: USDT_USDT",
    });
  });

  test("gets a pool rate from the lending canister", async () => {
    // given
    vi.spyOn(Actor, "createActor").mockReturnValue({
      get_pool_rate: vi.fn().mockResolvedValue([[10n, 20n, 30n]]),
    } as never);
    const client = LiquidiumClient.create({});

    // when
    const rate = await client.market.getPoolRate("aaaaa-aa");

    // then
    expect(rate).toEqual({
      borrowRate: 10n,
      lendRate: 20n,
      utilizationRate: 30n,
    });
  });

  test("throws POOL_NOT_FOUND when a pool rate is missing", async () => {
    // given
    vi.spyOn(Actor, "createActor").mockReturnValue({
      get_pool_rate: vi.fn().mockResolvedValue([]),
    } as never);
    const client = LiquidiumClient.create({});

    // when / then
    await expect(client.market.getPoolRate("aaaaa-aa")).rejects.toMatchObject({
      code: LiquidiumErrorCode.POOL_NOT_FOUND,
    });
  });
});

describe("LendingModule", () => {
  const BTC_POOL_ID = "hkmli-faaaa-aaaar-qb4ba-cai";
  const USDT_POOL_ID = "hnnn4-iyaaa-aaaar-qb4bq-cai";

  test("returns a native supply target for the btc pool", async () => {
    // given
    vi.spyOn(Actor, "createActor")
      .mockReturnValueOnce({
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
            total_supply_at_last_sync: 50_000n,
          },
        ]),
      } as never)
      .mockReturnValueOnce({
        get_btc_address: vi.fn().mockResolvedValue("bc1qexampledepositaddress"),
      } as never);
    const client = LiquidiumClient.create({});

    // when
    const supplyInstruction = await client.lending.supply({
      profileId: "aaaaa-aa",
      poolId: BTC_POOL_ID,
      action: "deposit",
      destination: "nativeAddress",
    });

    // then
    expect(supplyInstruction).toMatchObject({
      poolId: BTC_POOL_ID,
      asset: "BTC",
      chain: "BTC",
      action: "deposit",
      target: {
        type: "nativeAddress",
        poolId: BTC_POOL_ID,
        asset: "BTC",
        chain: "BTC",
        action: "deposit",
        address: "bc1qexampledepositaddress",
      },
    });
  });

  test("returns an icrc supply target for the usdt pool", async () => {
    // given
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
    } as never);
    const client = LiquidiumClient.create({});

    // when
    const supplyInstruction = await client.lending.supply({
      profileId: "aaaaa-aa",
      poolId: USDT_POOL_ID,
      action: "repayment",
      destination: "icrcAccount",
    });

    // then
    expect(supplyInstruction).toMatchObject({
      poolId: USDT_POOL_ID,
      asset: "USDT",
      chain: "ETH",
      action: "repayment",
      target: {
        type: "icrcAccount",
        poolId: USDT_POOL_ID,
        asset: "USDT",
        chain: "ETH",
        action: "repayment",
        owner: USDT_POOL_ID,
      },
    });
    if (supplyInstruction.target.type !== "icrcAccount") {
      throw new Error("Expected ICRC account inflow target");
    }
    expect(supplyInstruction.target.subaccount).toBeInstanceOf(Uint8Array);
    expect(supplyInstruction.target.subaccount).toHaveLength(32);
    expect(supplyInstruction.target.account.length).toBeGreaterThan(0);
  });

  test("rejects native supply targets for unsupported pools", async () => {
    // given
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
    } as never);
    const client = LiquidiumClient.create({});

    // when / then
    await expect(
      client.lending.supply({
        profileId: "aaaaa-aa",
        poolId: USDT_POOL_ID,
        action: "deposit",
        destination: "nativeAddress",
      })
    ).rejects.toMatchObject({
      code: LiquidiumErrorCode.VALIDATION_ERROR,
      message:
        "Native address inflow targets are not supported for USDT on ETH",
    });
  });

  test("rejects native btc supply when pool id is not configured btc pool", async () => {
    // given
    const NON_CONFIGURED_BTC_POOL_ID = "ryjl3-tyaaa-aaaaa-aaaba-cai";
    vi.spyOn(Actor, "createActor").mockReturnValue({
      list_pools: vi.fn().mockResolvedValue([
        {
          optimal_utilization_rate: 80n,
          principal: {
            toString: () => NON_CONFIGURED_BTC_POOL_ID,
            toText: () => NON_CONFIGURED_BTC_POOL_ID,
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
    } as never);
    const client = LiquidiumClient.create({});

    // when / then
    await expect(
      client.lending.supply({
        profileId: "aaaaa-aa",
        poolId: NON_CONFIGURED_BTC_POOL_ID,
        action: "deposit",
        destination: "nativeAddress",
      })
    ).rejects.toMatchObject({
      code: LiquidiumErrorCode.VALIDATION_ERROR,
      message:
        "Native BTC inflow targets require the configured BTC pool hkmli-faaaa-aaaar-qb4ba-cai, received ryjl3-tyaaa-aaaaa-aaaba-cai",
    });
  });

  test("submits an inflow transaction id through the sdk api", async () => {
    // given
    const txid = "7f4f3c2b1a";
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: true, txid }), {
        status: 200,
        headers: {
          "content-type": "application/json",
        },
      })
    );
    const client = LiquidiumClient.create({
      apiBaseUrl: "https://app.liquidium.fi/api/sdk",
    });

    // when
    const result = await client.lending.submitInflow({ txid });

    // then
    expect(result).toEqual({ success: true, txid });
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://app.liquidium.fi/api/sdk/v1/inflow",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ txid }),
        signal: expect.any(AbortSignal),
      }
    );
  });

  test("fetches inflow status entries through the sdk api", async () => {
    // given
    const profileId = "h35kd-uaaaa-aaaaa-aaaaa-aaaaa-aaaaa-abai";
    const responsePayload = {
      success: true as const,
      inflows: [
        {
          inflowId: "inflow-1",
          txid: "tx-1",
          type: "deposit" as const,
          stage: "CONFIRMED" as const,
          poolId: "hkmli-faaaa-aaaar-qb4ba-cai",
          amountSats: "100000",
          timestampMs: 1_746_400_000_000,
          confirmations: 3,
          requiredConfirmations: 4,
        },
      ],
    };
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(responsePayload), {
        status: 200,
        headers: {
          "content-type": "application/json",
        },
      })
    );
    const client = LiquidiumClient.create({
      apiBaseUrl: "https://app.liquidium.fi/api/sdk",
    });

    // when
    const result = await client.lending.getInflowStatus({ profileId });

    // then
    expect(result).toEqual(responsePayload);
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://app.liquidium.fi/api/sdk/v1/inflow-status?profileId=h35kd-uaaaa-aaaaa-aaaaa-aaaaa-aaaaa-abai",
      {
        method: "GET",
        headers: undefined,
        body: undefined,
        signal: expect.any(AbortSignal),
      }
    );
  });

  test("creates a supply flow that reuses the supply instruction and tracks txid status", async () => {
    // given
    const txid = "session-txid-1";
    vi.spyOn(Actor, "createActor")
      .mockReturnValueOnce({
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
            total_supply_at_last_sync: 50_000n,
          },
        ]),
      } as never)
      .mockReturnValueOnce({
        get_btc_address: vi.fn().mockResolvedValue("bc1qexampledepositaddress"),
      } as never);
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ success: true, txid }), {
        status: 200,
        headers: {
          "content-type": "application/json",
        },
      })
    );
    fetchSpy.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          success: true,
          inflows: [
            {
              inflowId: "inflow-1",
              txid,
              type: "deposit",
              stage: "PENDING",
              poolId: BTC_POOL_ID,
              amountSats: "100000",
              timestampMs: 1_746_400_000_000,
              confirmations: 1,
              requiredConfirmations: 4,
            },
          ],
        }),
        {
          status: 200,
          headers: {
            "content-type": "application/json",
          },
        }
      )
    );
    const client = LiquidiumClient.create({
      apiBaseUrl: "https://app.liquidium.fi/api/sdk",
    });

    // when
    const flow = await client.lending.createSupply({
      profileId: "aaaaa-aa",
      poolId: BTC_POOL_ID,
      action: "deposit",
      destination: "nativeAddress",
    });
    await flow.submit({ txid });
    const status = await flow.getStatus();

    // then
    expect(flow.instruction.target).toMatchObject({
      type: "nativeAddress",
      address: "bc1qexampledepositaddress",
    });
    expect(status).toMatchObject({
      txid,
      poolId: BTC_POOL_ID,
      remainingConfirmations: 3,
      isAvailable: false,
    });
    expect(fetchSpy).toHaveBeenNthCalledWith(
      1,
      "https://app.liquidium.fi/api/sdk/v1/inflow",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ txid }),
      })
    );
    expect(fetchSpy).toHaveBeenNthCalledWith(
      2,
      `https://app.liquidium.fi/api/sdk/v1/inflow-status?profileId=aaaaa-aa&txid=${txid}`,
      expect.objectContaining({
        method: "GET",
      })
    );
  });

  test("watches supply status every 5 seconds until available", async () => {
    // given
    vi.useFakeTimers();
    const txid = "session-watch-txid";
    vi.spyOn(Actor, "createActor")
      .mockReturnValueOnce({
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
            total_supply_at_last_sync: 50_000n,
          },
        ]),
      } as never)
      .mockReturnValueOnce({
        get_btc_address: vi.fn().mockResolvedValue("bc1qexampledepositaddress"),
      } as never);
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    fetchSpy.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          success: true,
          inflows: [
            {
              inflowId: "inflow-1",
              txid,
              type: "deposit",
              stage: "PENDING",
              poolId: BTC_POOL_ID,
              amountSats: "100000",
              timestampMs: 1_746_400_000_000,
              confirmations: 1,
              requiredConfirmations: 4,
            },
          ],
        }),
        {
          status: 200,
          headers: {
            "content-type": "application/json",
          },
        }
      )
    );
    fetchSpy.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          success: true,
          inflows: [
            {
              inflowId: "inflow-1",
              txid,
              type: "deposit",
              stage: "CONFIRMED",
              poolId: BTC_POOL_ID,
              amountSats: "100000",
              timestampMs: 1_746_400_000_000,
              confirmations: 4,
              requiredConfirmations: 4,
            },
          ],
        }),
        {
          status: 200,
          headers: {
            "content-type": "application/json",
          },
        }
      )
    );
    const client = LiquidiumClient.create({
      apiBaseUrl: "https://app.liquidium.fi/api/sdk",
    });
    const flow = await client.lending.createSupply({
      profileId: "aaaaa-aa",
      poolId: BTC_POOL_ID,
      action: "deposit",
      destination: "nativeAddress",
    });

    // when
    const statusUpdates = await collectWatchUpdates(flow.watchStatus({ txid }), 2);

    // then
    expect(statusUpdates).toHaveLength(2);
    expect(statusUpdates[0]).toMatchObject({
      txid,
      stage: "PENDING",
      isAvailable: false,
    });
    expect(statusUpdates[1]).toMatchObject({
      txid,
      stage: "CONFIRMED",
      isAvailable: true,
    });
    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(vi.getTimerCount()).toBe(0);
    vi.useRealTimers();
  });

  test("uses the client-configured default supply status poll interval", async () => {
    // given
    vi.useFakeTimers();
    const txid = "configured-poll-txid";
    const CUSTOM_POLL_INTERVAL_MS = 12_000;
    vi.spyOn(Actor, "createActor")
      .mockReturnValueOnce({
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
            total_supply_at_last_sync: 50_000n,
          },
        ]),
      } as never)
      .mockReturnValueOnce({
        get_btc_address: vi.fn().mockResolvedValue("bc1qexampledepositaddress"),
      } as never);
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    fetchSpy.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          success: true,
          inflows: [
            {
              inflowId: "inflow-1",
              txid,
              type: "deposit",
              stage: "PENDING",
              poolId: BTC_POOL_ID,
              amountSats: "100000",
              timestampMs: 1_746_400_000_000,
              confirmations: 1,
              requiredConfirmations: 4,
            },
          ],
        }),
        {
          status: 200,
          headers: {
            "content-type": "application/json",
          },
        }
      )
    );
    fetchSpy.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          success: true,
          inflows: [
            {
              inflowId: "inflow-1",
              txid,
              type: "deposit",
              stage: "CONFIRMED",
              poolId: BTC_POOL_ID,
              amountSats: "100000",
              timestampMs: 1_746_400_000_000,
              confirmations: 4,
              requiredConfirmations: 4,
            },
          ],
        }),
        {
          status: 200,
          headers: {
            "content-type": "application/json",
          },
        }
      )
    );
    const client = LiquidiumClient.create({
      apiBaseUrl: "https://app.liquidium.fi/api/sdk",
      supplyStatusPollIntervalMs: CUSTOM_POLL_INTERVAL_MS,
    });
    const flow = await client.lending.createSupply({
      profileId: "aaaaa-aa",
      poolId: BTC_POOL_ID,
      action: "deposit",
      destination: "nativeAddress",
    });

    // when
    const statusUpdates = await collectWatchUpdates(
      flow.watchStatus({ txid }),
      2,
      CUSTOM_POLL_INTERVAL_MS
    );

    // then
    expect(statusUpdates).toHaveLength(2);
    expect(statusUpdates[0]).toMatchObject({
      txid,
      stage: "PENDING",
      isAvailable: false,
    });
    expect(statusUpdates[1]).toMatchObject({
      txid,
      stage: "CONFIRMED",
      isAvailable: true,
    });
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  test("throws SERVICE_UNAVAILABLE for inflow submission without apiBaseUrl", async () => {
    // given
    const client = LiquidiumClient.create({});

    // when / then
    await expect(
      client.lending.submitInflow({ txid: "abc" })
    ).rejects.toMatchObject({
      code: LiquidiumErrorCode.SERVICE_UNAVAILABLE,
      message: "Lending API actions require an API base URL in client config",
    });
  });

  test("creates and submits a borrow action with a custom outflow account", async () => {
    // given
    vi.setSystemTime(new Date("2026-04-01T00:00:00.000Z"));
    const getNonce = vi.fn().mockResolvedValue(17n);
    const borrowAssets = vi.fn().mockResolvedValue({
      Ok: {
        id: "outflow-1",
        txid: ["txid-1"],
        outflow_type: { Borrow: null },
        outflow_ref: ["ref-1"],
        amount: 50_000n,
        receiver: { External: "bc1qcustomoutflow" },
      },
    });
    vi.spyOn(Actor, "createActor").mockReturnValue({
      get_nonce: getNonce,
      borrow_assets: borrowAssets,
    } as never);
    const client = LiquidiumClient.create({});
    const profileId = "aaaaa-aa";
    const poolId = "rrkah-fqaaa-aaaaa-aaaaq-cai";

    // when
    const borrowAction = await client.lending.createBorrow({
      profileId,
      poolId,
      amount: 50_000n,
      account: "bc1qcustomoutflow",
      signerAccount: "0xsigner",
    });
    const outflow = await borrowAction.submit({
      signature: "0xsigned",
      chain: "ETH",
    });

    // then
    expect(getNonce).toHaveBeenCalledWith("0xsigner");
    expect(borrowAction.kind).toBe("create-borrow");
    expect(borrowAction.account).toBe("0xsigner");
    expect(borrowAction.data).toMatchObject({
      profileId,
      poolId,
      amount: 50_000n,
      account: "bc1qcustomoutflow",
      signerAccount: "0xsigner",
    });
    expect(borrowAction.message).toBe(`Liquidium: Borrow Assets

Action: Borrow from pool
Pool ID: rrkah-fqaaa-aaaaa-aaaaq-cai
Amount: 50000
Address:bc1qcustomoutflow
Expires: 1775001900
Nonce: 17`);
    expect(borrowAssets).toHaveBeenCalledTimes(1);
    expect(borrowAssets.mock.calls[0]?.[0]).toEqual(Principal.fromText(profileId));
    expect(borrowAssets.mock.calls[0]?.[1]).toMatchObject({
      data: {
        expiry_timestamp: 1775001900n,
        account: { External: "bc1qcustomoutflow" },
        pool_id: Principal.fromText(poolId),
        amount: 50_000n,
      },
      signature_info: {
        Wallet: {
          signature: "0xsigned",
          chain: { ETH: null },
          account: "0xsigner",
        },
      },
    });
    expect(outflow).toEqual({
      id: "outflow-1",
      outflowType: "Borrow",
      outflowRef: "ref-1",
      txid: "txid-1",
      amount: 50_000n,
      receiver: {
        type: "External",
        account: "bc1qcustomoutflow",
      },
    });
  });

  test("maps protocol errors for createBorrow submission", async () => {
    // given
    vi.spyOn(Actor, "createActor").mockReturnValue({
      get_nonce: vi.fn().mockResolvedValue(19n),
      borrow_assets: vi.fn().mockResolvedValue({
        Err: { BorrowingDisabled: null },
      }),
    } as never);
    const client = LiquidiumClient.create({});

    // when / then
    await expect(
      client.lending
        .createBorrow({
          profileId: "aaaaa-aa",
          poolId: "rrkah-fqaaa-aaaaa-aaaaq-cai",
          amount: 50_000n,
          account: "bc1qcustomoutflow",
          signerAccount: "bc1qsigner",
        })
        .then((borrowAction) =>
          borrowAction.submit({
            signature: "signed",
            chain: "BTC",
          })
        )
    ).rejects.toMatchObject({
      code: LiquidiumErrorCode.BORROWING_DISABLED,
    });
  });

  test("validates createBorrow inputs", async () => {
    // given
    const client = LiquidiumClient.create({});

    // when / then
    await expect(
      client.lending.createBorrow({
        profileId: "p1",
        poolId: "aaaaa-aa",
        amount: 50_000n,
        account: "   ",
        signerAccount: "0xsigner",
      })
    ).rejects.toMatchObject({
      code: LiquidiumErrorCode.VALIDATION_ERROR,
      message: "Borrow requires a custom outflow account",
    });
    await expect(
      client.lending.createBorrow({
        profileId: "p1",
        poolId: "aaaaa-aa",
        amount: 50_000n,
        account: "bc1qcustomoutflow",
        signerAccount: "  ",
      })
    ).rejects.toMatchObject({
      code: LiquidiumErrorCode.VALIDATION_ERROR,
      message: "Borrow requires a signer account",
    });
  });

  test("creates and submits a withdraw action with a custom outflow account", async () => {
    // given
    vi.setSystemTime(new Date("2026-04-01T00:00:00.000Z"));
    const getNonce = vi.fn().mockResolvedValue(23n);
    const withdraw = vi.fn().mockResolvedValue({
      Ok: {
        id: "outflow-2",
        txid: ["txid-2"],
        outflow_type: { Withdraw: null },
        outflow_ref: ["ref-2"],
        amount: 10_000n,
        receiver: { External: "bc1qwithdraw" },
      },
    });
    vi.spyOn(Actor, "createActor").mockReturnValue({
      get_nonce: getNonce,
      withdraw,
    } as never);
    const client = LiquidiumClient.create({});

    // when
    const withdrawAction = await client.lending.createWithdraw({
      profileId: "aaaaa-aa",
      poolId: "rrkah-fqaaa-aaaaa-aaaaq-cai",
      amount: 10_000n,
      account: "bc1qwithdraw",
      signerAccount: "0xsigner",
    });
    const outflow = await withdrawAction.submit({
      signature: "0xsigned",
      chain: "ETH",
    });

    // then
    expect(getNonce).toHaveBeenCalledWith("0xsigner");
    expect(withdrawAction.kind).toBe("create-withdraw");
    expect(withdrawAction.account).toBe("0xsigner");
    expect(withdrawAction.data).toMatchObject({
      profileId: "aaaaa-aa",
      poolId: "rrkah-fqaaa-aaaaa-aaaaq-cai",
      amount: 10_000n,
      account: "bc1qwithdraw",
      signerAccount: "0xsigner",
    });
    expect(withdrawAction.message).toBe(`Liquidium: Withdraw Assets

Action: Withdraw from pool
Pool ID: rrkah-fqaaa-aaaaa-aaaaq-cai
Amount: 10000
Address:bc1qwithdraw
Expires: 1775001900
Nonce: 23`);
    expect(withdraw).toHaveBeenCalledTimes(1);
    expect(withdraw.mock.calls[0]?.[0]).toEqual(Principal.fromText("aaaaa-aa"));
    expect(withdraw.mock.calls[0]?.[1]).toMatchObject({
      data: {
        expiry_timestamp: 1775001900n,
        account: { External: "bc1qwithdraw" },
        pool_id: Principal.fromText("rrkah-fqaaa-aaaaa-aaaaq-cai"),
        amount: 10_000n,
      },
      signature_info: {
        Wallet: {
          signature: "0xsigned",
          chain: { ETH: null },
          account: "0xsigner",
        },
      },
    });
    expect(outflow).toEqual({
      id: "outflow-2",
      outflowType: "Withdraw",
      outflowRef: "ref-2",
      txid: "txid-2",
      amount: 10_000n,
      receiver: {
        type: "External",
        account: "bc1qwithdraw",
      },
    });
  });

  test("maps protocol errors for withdraw submission", async () => {
    // given
    vi.spyOn(Actor, "createActor").mockReturnValue({
      get_nonce: vi.fn().mockResolvedValue(29n),
      withdraw: vi.fn().mockResolvedValue({
        Err: { InsufficientFunds: null },
      }),
    } as never);
    const client = LiquidiumClient.create({});

    // when / then
    await expect(
      client.lending
        .createWithdraw({
          profileId: "aaaaa-aa",
          poolId: "rrkah-fqaaa-aaaaa-aaaaq-cai",
          amount: 10_000n,
          account: "bc1qwithdraw",
          signerAccount: "bc1qsigner",
        })
        .then((withdrawAction) =>
          withdrawAction.submit({
            signature: "signed",
            chain: "BTC",
          })
        )
    ).rejects.toMatchObject({
      code: LiquidiumErrorCode.INSUFFICIENT_FUNDS,
    });
  });

  test("validates withdraw inputs", async () => {
    // given
    const client = LiquidiumClient.create({});

    // when / then
    await expect(
      client.lending.createWithdraw({
        profileId: "p1",
        poolId: "aaaaa-aa",
        amount: 10_000n,
        account: "   ",
        signerAccount: "0xsigner",
      })
    ).rejects.toMatchObject({
      code: LiquidiumErrorCode.VALIDATION_ERROR,
      message: "Withdraw requires a custom outflow account",
    });
    await expect(
      client.lending.createWithdraw({
        profileId: "p1",
        poolId: "aaaaa-aa",
        amount: 10_000n,
        account: "bc1qwithdraw",
        signerAccount: "  ",
      })
    ).rejects.toMatchObject({
      code: LiquidiumErrorCode.VALIDATION_ERROR,
      message: "Withdraw requires a signer account",
    });
  });
});
