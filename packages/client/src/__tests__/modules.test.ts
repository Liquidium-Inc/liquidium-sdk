import { Actor } from "@dfinity/agent";
import { afterEach, describe, expect, test, vi } from "vitest";
import {
  InflowDestinationType,
  LiquidiumClient,
  LiquidiumError,
  LiquidiumErrorCode,
} from "../index";

afterEach(() => {
  vi.restoreAllMocks();
});

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
      inflowType: "Deposit",
      destinationType: InflowDestinationType.NATIVE_ADDRESS,
    });

    // then
    expect(supplyInstruction).toMatchObject({
      poolId: BTC_POOL_ID,
      asset: "BTC",
      chain: "BTC",
      inflowType: "Deposit",
      target: {
        type: InflowDestinationType.NATIVE_ADDRESS,
        poolId: BTC_POOL_ID,
        asset: "BTC",
        chain: "BTC",
        inflowType: "Deposit",
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
      inflowType: "Repayment",
      destinationType: InflowDestinationType.ICRC_ACCOUNT,
    });

    // then
    expect(supplyInstruction).toMatchObject({
      poolId: USDT_POOL_ID,
      asset: "USDT",
      chain: "ETH",
      inflowType: "Repayment",
      target: {
        type: InflowDestinationType.ICRC_ACCOUNT,
        poolId: USDT_POOL_ID,
        asset: "USDT",
        chain: "ETH",
        inflowType: "Repayment",
        owner: USDT_POOL_ID,
      },
    });
    if (supplyInstruction.target.type !== InflowDestinationType.ICRC_ACCOUNT) {
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
        inflowType: "Deposit",
        destinationType: InflowDestinationType.NATIVE_ADDRESS,
      })
    ).rejects.toMatchObject({
      code: LiquidiumErrorCode.VALIDATION_ERROR,
      message:
        "Native address inflow targets are not supported for USDT on ETH",
    });
  });

  test("throws INTERNAL for borrow until implemented", async () => {
    // given
    const client = LiquidiumClient.create({});

    // when / then
    await expect(
      client.lending.borrow({
        profileId: "p1",
        poolId: "pool1",
        amount: 50_000n,
        account: "bc1q...",
      })
    ).rejects.toMatchObject({
      code: LiquidiumErrorCode.INTERNAL,
    });
  });

  test("throws INTERNAL for withdraw until implemented", async () => {
    // given
    const client = LiquidiumClient.create({});

    // when / then
    await expect(
      client.lending.withdraw({
        profileId: "p1",
        poolId: "pool1",
        amount: 10_000n,
        account: "bc1q...",
      })
    ).rejects.toMatchObject({
      code: LiquidiumErrorCode.INTERNAL,
    });
  });
});
