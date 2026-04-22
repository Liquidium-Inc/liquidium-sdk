import { Actor } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import { afterEach, describe, expect, test, vi } from "vitest";
import {
  executeWith,
  LiquidiumClient,
  LiquidiumError,
  LiquidiumErrorCode,
} from "../index";

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
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
    const createAction = await client.accounts.prepareCreateProfile({
      account: "0xabc",
    });
    const profileId = await createAction.submit({
      signature: "0xsigned",
      chain: "ETH",
      account: "0xabc",
    });

    // then
    expect(getNonce).toHaveBeenCalledWith("0xabc");
    expect(createAction.kind).toBe("create-account");
    expect(createAction.executionKind).toBe("sign-message");
    expect(createAction.actionType).toBe("create-account");
    expect(createAction.transferMode).toBe("native");
    expect(createAction.account).toBe("0xabc");
    expect(createAction.message).toContain("Liquidium: Initialize Account");
    expect(profileId).toBe("ccccc-cc");
    expect(registerProfile).toHaveBeenCalledTimes(1);
  });

  test("executes an account creation action with a wallet adapter", async () => {
    // given
    const registerProfile = vi.fn().mockResolvedValue({
      Ok: {
        toText: () => "ccccc-cc",
      },
    });
    vi.spyOn(Actor, "createActor").mockReturnValue({
      get_nonce: vi.fn().mockResolvedValue(11n),
      get_wallet_profile: vi.fn().mockResolvedValue([]),
      register_profile: registerProfile,
    } as never);
    const signMessage = vi.fn().mockResolvedValue("0xsigned");
    const client = LiquidiumClient.create({});

    // when
    const profileId = await client.accounts
      .prepareCreateProfile({ account: "0xabc" })
      .then(
        executeWith({
          walletAdapter: { signMessage },
          chain: "ETH",
          account: "0xabc",
        })
      );

    // then
    expect(profileId).toBe("ccccc-cc");
    expect(signMessage).toHaveBeenCalledWith({
      actionType: "create-account",
      transferMode: "native",
      chain: "ETH",
      message: expect.stringContaining("Liquidium: Initialize Account"),
      account: "0xabc",
    });
    expect(registerProfile).toHaveBeenCalledTimes(1);
  });

  test("creates and executes an account creation request directly", async () => {
    // given
    vi.spyOn(Actor, "createActor").mockReturnValue({
      get_nonce: vi.fn().mockResolvedValue(13n),
      get_wallet_profile: vi.fn().mockResolvedValue([]),
      register_profile: vi.fn().mockResolvedValue({
        Ok: {
          toText: () => "ddddd-dd",
        },
      }),
    } as never);
    const signMessage = vi.fn().mockResolvedValue("0xsigned");
    const client = LiquidiumClient.create({});

    // when
    const profileId = await client.accounts.createProfile({
      account: "0xabc",
      chain: "ETH",
      walletAdapter: { signMessage },
    });

    // then
    expect(profileId).toBe("ddddd-dd");
    expect(signMessage).toHaveBeenCalledTimes(1);
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
      client.accounts.prepareCreateProfile({ account: "0x123" }).then((createAction) =>
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
      client.accounts.prepareCreateProfile({ account: "0xabc" })
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
      client.accounts.prepareCreateProfile({ account: "0xabc" }).then((createAction) =>
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

  test("returns wallets linked to a profile", async () => {
    // given
    vi.spyOn(Actor, "createActor").mockReturnValue({
      get_profile_wallets: vi.fn().mockResolvedValue([
        {
          address: "bc1qexample",
          chain: { Wallet: { BTC: null } },
        },
        {
          address: "0xabc",
          chain: { Wallet: { ETH: null } },
        },
      ]),
    } as never);
    const client = LiquidiumClient.create({});

    // when
    const wallets = await client.accounts.listLinkedWallets("aaaaa-aa");

    // then
    expect(wallets).toEqual([
      {
        address: "bc1qexample",
        chain: "BTC",
      },
      {
        address: "0xabc",
        chain: "ETH",
      },
    ]);
  });

  test("throws when a profile contains an unsupported wallet chain", async () => {
    // given
    vi.spyOn(Actor, "createActor").mockReturnValue({
      get_profile_wallets: vi.fn().mockResolvedValue([
        {
          address: "So11111111111111111111111111111111111111112",
          chain: { Wallet: { SOL: null } },
        },
      ]),
    } as never);
    const client = LiquidiumClient.create({});

    // when / then
    await expect(client.accounts.listLinkedWallets("aaaaa-aa")).rejects.toMatchObject({
      code: LiquidiumErrorCode.INTERNAL,
      message: "Unsupported wallet chain returned for profile wallet: SOL",
    });
  });
});

describe("HistoryModule", () => {
  test("throws SERVICE_UNAVAILABLE when no apiBaseUrl configured", async () => {
    // given
    const client = LiquidiumClient.create({});

    // when / then
    await expect(
      client.history.getUserTransactionHistory("profile-1")
    ).rejects.toThrow(LiquidiumError);
    await expect(
      client.history.getUserTransactionHistory("profile-1")
    ).rejects.toMatchObject({
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
    const result = await client.history.getUserTransactionHistory(
      "profile-1",
      undefined,
      { cursor: "2026-03-31T00:00:00.000Z::history-0" }
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
      "https://app.liquidium.fi/api/sdk/v1/history/users/profile-1/transactions?cursor=2026-03-31T00%3A00%3A00.000Z%3A%3Ahistory-0",
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
    const result = await client.history.getPoolHistory("pool-1");

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

  test("passes activities filters to the sdk api", async () => {
    // given
    const responsePayload = {
      success: true as const,
      items: [
        {
          id: "history-1",
          type: "borrow" as const,
          amount: "50000",
          poolId: "pool-btc",
          timestamp: "2026-04-02T00:00:00.000Z",
          status: "CONFIRMED" as const,
          txid: "tx-1",
        },
      ],
      nextCursor: "2026-04-02T00:00:00.000Z::history-1",
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
    const result = await client.history.getUserTransactionHistory(
      "profile-1",
      "pool-btc",
      {
        cursor: "2026-03-31T00:00:00.000Z::history-0",
        from: "2026-04-01T00:00:00.000Z",
        to: "2026-04-03T00:00:00.000Z",
        limit: 1,
      }
    );

    // then
    expect(result).toEqual({
      items: [
        {
          id: "history-1",
          type: "borrow",
          amount: 50000n,
          poolId: "pool-btc",
          timestamp: "2026-04-02T00:00:00.000Z",
          status: "CONFIRMED",
          txid: "tx-1",
          txids: undefined,
        },
      ],
      nextCursor: "2026-04-02T00:00:00.000Z::history-1",
    });
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://app.liquidium.fi/api/sdk/v1/history/users/profile-1/transactions?cursor=2026-03-31T00%3A00%3A00.000Z%3A%3Ahistory-0&market=pool-btc&from=2026-04-01T00%3A00%3A00.000Z&to=2026-04-03T00%3A00%3A00.000Z&limit=1",
      {
        method: "GET",
        headers: undefined,
        body: undefined,
        signal: expect.any(AbortSignal),
      }
    );
  });

  test("requests liquidation activities with liquidation type", async () => {
    // given
    const responsePayload = {
      success: true as const,
      items: [
        {
          id: "history-9",
          type: "liquidation" as const,
          amount: "12345",
          poolId: "pool-btc",
          timestamp: "2026-04-04T00:00:00.000Z",
          status: "CONFIRMED" as const,
        },
      ],
      nextCursor: "2026-04-04T00:00:00.000Z::history-9",
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
    const result = await client.history.getLiquidationHistory(
      "profile-1",
      "pool-btc"
    );

    // then
    expect(result.items[0]).toMatchObject({
      type: "liquidation",
      amount: 12345n,
      poolId: "pool-btc",
    });
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://app.liquidium.fi/api/sdk/v1/history/users/profile-1/liquidations?market=pool-btc",
      {
        method: "GET",
        headers: undefined,
        body: undefined,
        signal: expect.any(AbortSignal),
      }
    );
  });

  test("maps pool snapshots to borrow apy history samples", async () => {
    // given
    const responsePayload = {
      success: true as const,
      items: [
        {
          date: "2026-04-02T00:00:00.000Z",
          avgRate: "15",
        },
        {
          date: "2026-04-01T00:00:00.000Z",
          avgRate: "10",
        },
      ],
      nextCursor: "2026-04-01T00:00:00.000Z::snapshot-1",
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
    const result = await client.history.getBorrowRateHistory("pool-1", {
      from: "2026-04-02T00:00:00.000Z",
      limit: 1,
    });

    // then
    expect(result).toEqual({
      items: [
        {
          date: "2026-04-02T00:00:00.000Z",
          avgRate: 15n,
        },
        {
          date: "2026-04-01T00:00:00.000Z",
          avgRate: 10n,
        },
      ],
      nextCursor: "2026-04-01T00:00:00.000Z::snapshot-1",
    });
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://app.liquidium.fi/api/sdk/v1/history/rates/pool-1?from=2026-04-02T00%3A00%3A00.000Z&limit=1",
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
    const pools = await client.market.listPools();

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
    const pools = await client.market.listPools();

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
    const pools = await client.market.listPools();

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

  test("gets asset prices from USD-quoted pairs", async () => {
    // given
    vi.spyOn(Actor, "createActor").mockReturnValue({
      get_prices: vi.fn().mockResolvedValue([
        ["BTC_USD", 72_000_000_000_000_000_000_000_000_000_000n, 27],
        ["USDC_USD", 999_910_065_000_000_000_000_000_000n, 27],
        ["USDT_USD", 1_000_018_620_000_000_000_000_000_000n, 27],
      ]),
    } as never);
    const client = LiquidiumClient.create({});

    // when
    const prices = await client.market.getAssetPrices();

    // then
    expect(prices.BTC).toBe(72000);
    expect(prices.USDT).toBe(1.00001862);
    expect(prices.USDC).toBeCloseTo(0.999910065, 12);
  });

  test("ignores pairs that are not USD-quoted", async () => {
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
    const client = LiquidiumClient.create({});

    // when
    const prices = await client.market.getAssetPrices();

    // then
    expect(prices).toEqual({
      BTC: 68500,
    });
  });

  test("returns an empty price map when USD-quoted pairs are missing", async () => {
    // given
    vi.spyOn(Actor, "createActor").mockReturnValue({
      get_prices: vi.fn().mockResolvedValue([["BTC_USDT", 68_500_000_000n, 6]]),
    } as never);
    const client = LiquidiumClient.create({});

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
    const supplyInstruction = await client.lending.prepareSupply({
      profileId: "aaaaa-aa",
      poolId: BTC_POOL_ID,
      action: "deposit",
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
    const supplyInstruction = await client.lending.prepareSupply({
      profileId: "aaaaa-aa",
      poolId: USDT_POOL_ID,
      action: "repayment",
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

  test("rejects prepareSupply when no supply mechanism is configured", async () => {
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
          asset: { ICP: null },
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
      client.lending.prepareSupply({
        profileId: "aaaaa-aa",
        poolId: USDT_POOL_ID,
        action: "deposit",
      })
    ).rejects.toMatchObject({
      code: LiquidiumErrorCode.VALIDATION_ERROR,
      message: "No supply mechanism is configured for ICP on ETH",
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
      client.lending.prepareSupply({
        profileId: "aaaaa-aa",
        poolId: NON_CONFIGURED_BTC_POOL_ID,
        action: "deposit",
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

  test("fetches evm supply context through the sdk api", async () => {
    // given
    const responsePayload = {
      success: true as const,
      profileId: "aaaaa-aa",
      poolId: USDT_POOL_ID,
      walletAddress: "0x1234567890123456789012345678901234567890",
      action: "deposit" as const,
      asset: "USDT" as const,
      chain: "ETH" as const,
      amount: "1000000",
      tokenAddress: "0xdac17f958d2ee523a2206206994597c13d831ec7",
      spenderAddress: "0x18901044688D3756C35Ed2b36D93e6a5B8e00E68",
      depositContractAddress: "0x18901044688D3756C35Ed2b36D93e6a5B8e00E68",
      balance: "2000000",
      allowance: "0",
      requiresApproval: true,
      approvalStrategy: "approve-max" as const,
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
    const result = await client.lending.getEvmSupplyContext({
      profileId: "aaaaa-aa",
      poolId: USDT_POOL_ID,
      walletAddress: "0x1234567890123456789012345678901234567890",
      amount: 1_000_000n,
      action: "deposit",
    });

    // then
    expect(result).toEqual(responsePayload);
    expect(fetchSpy).toHaveBeenCalledWith(
      `https://app.liquidium.fi/api/sdk/v1/evm/supply-context?profileId=aaaaa-aa&poolId=${USDT_POOL_ID}&walletAddress=0x1234567890123456789012345678901234567890&amount=1000000&action=deposit`,
      {
        method: "GET",
        headers: undefined,
        body: undefined,
        signal: expect.any(AbortSignal),
      }
    );
  });

  test("auto-executes eth usdt supply with approval and inflow submission", async () => {
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
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    fetchSpy
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            success: true,
            profileId: "aaaaa-aa",
            poolId: USDT_POOL_ID,
            walletAddress: "0x1234567890123456789012345678901234567890",
            action: "deposit",
            asset: "USDT",
            chain: "ETH",
            amount: "1000000",
            tokenAddress: "0xdac17f958d2ee523a2206206994597c13d831ec7",
            spenderAddress: "0x18901044688D3756C35Ed2b36D93e6a5B8e00E68",
            depositContractAddress:
              "0x18901044688D3756C35Ed2b36D93e6a5B8e00E68",
            balance: "2000000",
            allowance: "0",
            requiresApproval: true,
            approvalStrategy: "approve-max",
          }),
          {
            status: 200,
            headers: {
              "content-type": "application/json",
            },
          }
        )
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            success: true,
            profileId: "aaaaa-aa",
            poolId: USDT_POOL_ID,
            walletAddress: "0x1234567890123456789012345678901234567890",
            action: "deposit",
            asset: "USDT",
            chain: "ETH",
            amount: "1000000",
            tokenAddress: "0xdac17f958d2ee523a2206206994597c13d831ec7",
            spenderAddress: "0x18901044688D3756C35Ed2b36D93e6a5B8e00E68",
            depositContractAddress:
              "0x18901044688D3756C35Ed2b36D93e6a5B8e00E68",
            balance: "2000000",
            allowance: "1000000",
            requiresApproval: false,
            approvalStrategy: "none",
          }),
          {
            status: 200,
            headers: {
              "content-type": "application/json",
            },
          }
        )
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ success: true, txid: "0xdeposit" }), {
          status: 200,
          headers: {
            "content-type": "application/json",
          },
        })
      );
    const sendEthTransaction = vi
      .fn()
      .mockResolvedValueOnce("0xapprove")
      .mockResolvedValueOnce("0xdeposit");
    const client = LiquidiumClient.create({
      apiBaseUrl: "https://app.liquidium.fi/api/sdk",
    });

    // when
    const flow = await client.lending.supply({
      profileId: "aaaaa-aa",
      poolId: USDT_POOL_ID,
      action: "deposit",
      account: "0x1234567890123456789012345678901234567890",
      amount: 1_000_000n,
      walletAdapter: {
        sendEthTransaction,
      },
    });

    // then
    expect(flow.type).toBe("contractInteraction");
    expect(flow.target).toMatchObject({
      type: "icrcAccount",
      asset: "USDT",
      chain: "ETH",
    });
    expect(sendEthTransaction).toHaveBeenCalledTimes(2);
    expect(sendEthTransaction).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        chain: "ETH",
        actionType: "supply-deposit-approve-max",
      })
    );
    expect(sendEthTransaction).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        chain: "ETH",
        actionType: "supply-deposit-deposit-erc20",
      })
    );
    expect(fetchSpy).toHaveBeenNthCalledWith(
      3,
      "https://app.liquidium.fi/api/sdk/v1/inflow",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          txid: "0xdeposit",
          chain: "ETH",
          type: "DEPOSIT",
        }),
      })
    );
  });

  test("creates a supply flow that exposes the instruction and submits a broadcast txid", async () => {
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
    const client = LiquidiumClient.create({
      apiBaseUrl: "https://app.liquidium.fi/api/sdk",
    });

    // when
    const flow = await client.lending.supply({
      profileId: "aaaaa-aa",
      poolId: BTC_POOL_ID,
      action: "deposit",
    });
    await flow.submit({ txid });

    // then
    expect(flow.type).toBe("transfer");
    expect(flow.instruction.target).toMatchObject({
      type: "nativeAddress",
      address: "bc1qexampledepositaddress",
    });
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://app.liquidium.fi/api/sdk/v1/inflow",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ txid }),
      })
    );
  });

  test("auto-submits BTC inflow when supply receives a wallet adapter", async () => {
    // given
    const txid = "auto-submit-txid";
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
    const sendBtcTransaction = vi.fn().mockResolvedValue(txid);
    const client = LiquidiumClient.create({
      apiBaseUrl: "https://app.liquidium.fi/api/sdk",
    });

    // when
    const flow = await client.lending.supply({
      profileId: "aaaaa-aa",
      poolId: BTC_POOL_ID,
      action: "deposit",
      amount: 100_000n,
      walletAdapter: {
        sendBtcTransaction,
      },
      account: "bc1qsender",
    });

    // then
    expect(flow.type).toBe("transfer");
    expect(flow.txid).toBe(txid);
    expect(sendBtcTransaction).toHaveBeenCalledWith({
      chain: "BTC",
      toAddress: "bc1qexampledepositaddress",
      amountSats: 100_000n,
      account: "bc1qsender",
      actionType: "supply-deposit",
      transferMode: "native",
    });
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://app.liquidium.fi/api/sdk/v1/inflow",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ txid }),
      })
    );
  });

  test("retries BTC inflow submission when txid is not indexed yet", async () => {
    // given
    const txid = "retry-submit-txid";
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
      new Response(JSON.stringify({ message: "not found" }), {
        status: 500,
        headers: {
          "content-type": "application/json",
        },
      })
    );
    fetchSpy.mockResolvedValueOnce(
      new Response(JSON.stringify({ success: true, txid }), {
        status: 200,
        headers: {
          "content-type": "application/json",
        },
      })
    );
    const sendBtcTransaction = vi.fn().mockResolvedValue(txid);
    const client = LiquidiumClient.create({
      apiBaseUrl: "https://app.liquidium.fi/api/sdk",
    });

    // when
    const flow = await client.lending.supply({
      profileId: "aaaaa-aa",
      poolId: BTC_POOL_ID,
      action: "deposit",
      amount: 100_000n,
      walletAdapter: {
        sendBtcTransaction,
      },
      account: "bc1qsender",
    });

    // then
    expect(flow.type).toBe("transfer");
    expect(flow.txid).toBe(txid);
    expect(sendBtcTransaction).toHaveBeenCalledTimes(1);
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  test("throws when wallet-executed supply adapter cannot send BTC", async () => {
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
    const client = LiquidiumClient.create({
      apiBaseUrl: "https://app.liquidium.fi/api/sdk",
    });

    // when / then
    await expect(
      client.lending.supply({
        profileId: "aaaaa-aa",
        poolId: BTC_POOL_ID,
        action: "deposit",
        amount: 100_000n,
        account: "bc1qsender",
        walletAdapter: {},
      })
    ).rejects.toMatchObject({
      code: LiquidiumErrorCode.VALIDATION_ERROR,
      message: "BTC wallet adapter does not support transaction sending",
    });
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
    const borrowAction = await client.lending.prepareBorrow({
      profileId,
      poolId,
      amount: 50_000n,
      receiverAddress: "bc1qcustomoutflow",
      signerWalletAddress: "0xsigner",
    });
    const outflow = await borrowAction.submit({
      signature: "0xsigned",
      chain: "ETH",
    });

    // then
    expect(getNonce).toHaveBeenCalledWith("0xsigner");
    expect(borrowAction.kind).toBe("create-borrow");
    expect(borrowAction.executionKind).toBe("sign-message");
    expect(borrowAction.actionType).toBe("create-borrow");
    expect(borrowAction.transferMode).toBe("native");
    expect(borrowAction.account).toBe("0xsigner");
    expect(borrowAction.data).toMatchObject({
      profileId,
      poolId,
      amount: 50_000n,
      receiverAddress: "bc1qcustomoutflow",
      signerWalletAddress: "0xsigner",
    });
    expect(borrowAction.message).toBe(`Liquidium: Borrow Assets

Action: Borrow from pool
Pool ID: rrkah-fqaaa-aaaaa-aaaaq-cai
Amount: 50000
Address:bc1qcustomoutflow
Expires: 1775001900
Nonce: 17`);
    expect(borrowAssets).toHaveBeenCalledTimes(1);
    expect(borrowAssets.mock.calls[0]?.[0]).toEqual(
      Principal.fromText(profileId)
    );
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
      outflowType: "borrow",
      outflowRef: "ref-1",
      txid: "txid-1",
      amount: 50_000n,
      receiver: {
        type: "External",
        account: "bc1qcustomoutflow",
      },
    });
  });

  test("creates and executes a borrow request directly", async () => {
    // given
    vi.spyOn(Actor, "createActor").mockReturnValue({
      get_nonce: vi.fn().mockResolvedValue(31n),
      borrow_assets: vi.fn().mockResolvedValue({
        Ok: {
          id: "outflow-3",
          txid: [],
          outflow_type: { Borrow: null },
          outflow_ref: [],
          amount: 12_000n,
          receiver: { External: "bc1qborrow" },
        },
      }),
    } as never);
    const signMessage = vi.fn().mockResolvedValue("0xsigned");
    const client = LiquidiumClient.create({});

    // when
    const outflow = await client.lending.borrow({
      profileId: "aaaaa-aa",
      poolId: "rrkah-fqaaa-aaaaa-aaaaq-cai",
      amount: 12_000n,
      receiverAddress: "bc1qborrow",
      signerWalletAddress: "0xsigner",
      signerChain: "ETH",
      signerWalletAdapter: { signMessage },
    });

    // then
    expect(outflow.outflowType).toBe("borrow");
    expect(signMessage).toHaveBeenCalledWith({
      actionType: "create-borrow",
      transferMode: "native",
      chain: "ETH",
      message: expect.stringContaining("Liquidium: Borrow Assets"),
      account: "0xsigner",
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
        .prepareBorrow({
          profileId: "aaaaa-aa",
          poolId: "rrkah-fqaaa-aaaaa-aaaaq-cai",
          amount: 50_000n,
          receiverAddress: "bc1qcustomoutflow",
          signerWalletAddress: "bc1qsigner",
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
      client.lending.prepareBorrow({
        profileId: "p1",
        poolId: "aaaaa-aa",
        amount: 50_000n,
        receiverAddress: "   ",
        signerWalletAddress: "0xsigner",
      })
    ).rejects.toMatchObject({
      code: LiquidiumErrorCode.VALIDATION_ERROR,
      message: "Borrow requires a custom outflow account",
    });
    await expect(
      client.lending.prepareBorrow({
        profileId: "p1",
        poolId: "aaaaa-aa",
        amount: 50_000n,
        receiverAddress: "bc1qcustomoutflow",
        signerWalletAddress: "  ",
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
    const withdrawAction = await client.lending.prepareWithdraw({
      profileId: "aaaaa-aa",
      poolId: "rrkah-fqaaa-aaaaa-aaaaq-cai",
      amount: 10_000n,
      receiverAddress: "bc1qwithdraw",
      signerWalletAddress: "0xsigner",
    });
    const outflow = await withdrawAction.submit({
      signature: "0xsigned",
      chain: "ETH",
    });

    // then
    expect(getNonce).toHaveBeenCalledWith("0xsigner");
    expect(withdrawAction.kind).toBe("create-withdraw");
    expect(withdrawAction.executionKind).toBe("sign-message");
    expect(withdrawAction.actionType).toBe("create-withdraw");
    expect(withdrawAction.transferMode).toBe("native");
    expect(withdrawAction.account).toBe("0xsigner");
    expect(withdrawAction.data).toMatchObject({
      profileId: "aaaaa-aa",
      poolId: "rrkah-fqaaa-aaaaa-aaaaq-cai",
      amount: 10_000n,
      receiverAddress: "bc1qwithdraw",
      signerWalletAddress: "0xsigner",
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
      outflowType: "withdraw",
      outflowRef: "ref-2",
      txid: "txid-2",
      amount: 10_000n,
      receiver: {
        type: "External",
        account: "bc1qwithdraw",
      },
    });
  });

  test("creates and executes a withdraw request directly", async () => {
    // given
    vi.spyOn(Actor, "createActor").mockReturnValue({
      get_nonce: vi.fn().mockResolvedValue(37n),
      withdraw: vi.fn().mockResolvedValue({
        Ok: {
          id: "outflow-4",
          txid: [],
          outflow_type: { Withdraw: null },
          outflow_ref: [],
          amount: 8_000n,
          receiver: { External: "bc1qwithdraw" },
        },
      }),
    } as never);
    const signMessage = vi.fn().mockResolvedValue("0xsigned");
    const client = LiquidiumClient.create({});

    // when
    const outflow = await client.lending.withdraw({
      profileId: "aaaaa-aa",
      poolId: "rrkah-fqaaa-aaaaa-aaaaq-cai",
      amount: 8_000n,
      receiverAddress: "bc1qwithdraw",
      signerWalletAddress: "0xsigner",
      signerChain: "ETH",
      signerWalletAdapter: { signMessage },
    });

    // then
    expect(outflow.outflowType).toBe("withdraw");
    expect(signMessage).toHaveBeenCalledWith({
      actionType: "create-withdraw",
      transferMode: "native",
      chain: "ETH",
      message: expect.stringContaining("Liquidium: Withdraw Assets"),
      account: "0xsigner",
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
        .prepareWithdraw({
          profileId: "aaaaa-aa",
          poolId: "rrkah-fqaaa-aaaaa-aaaaq-cai",
          amount: 10_000n,
          receiverAddress: "bc1qwithdraw",
          signerWalletAddress: "bc1qsigner",
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
      client.lending.prepareWithdraw({
        profileId: "p1",
        poolId: "aaaaa-aa",
        amount: 10_000n,
        receiverAddress: "   ",
        signerWalletAddress: "0xsigner",
      })
    ).rejects.toMatchObject({
      code: LiquidiumErrorCode.VALIDATION_ERROR,
      message: "Withdraw requires a custom outflow account",
    });
    await expect(
      client.lending.prepareWithdraw({
        profileId: "p1",
        poolId: "aaaaa-aa",
        amount: 10_000n,
        receiverAddress: "bc1qwithdraw",
        signerWalletAddress: "  ",
      })
    ).rejects.toMatchObject({
      code: LiquidiumErrorCode.VALIDATION_ERROR,
      message: "Withdraw requires a signer account",
    });
  });
});
