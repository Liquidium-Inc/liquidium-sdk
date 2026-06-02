import { Actor } from "@icp-sdk/core/agent";
import { Principal } from "@icp-sdk/core/principal";
import { decodeFunctionData } from "viem";
import { afterEach, describe, expect, test, vi } from "vitest";
import { DEFAULT_API_BASE_URL } from "../core/config";
import { CK_DEPOSIT_ABI, ERC20_ABI } from "../core/evm";
import { encodeInflowSubaccount } from "../core/utils/inflow-subaccount";
import {
  executeWith,
  LiquidiumClient,
  LiquidiumErrorCode,
  publicIdFromInt,
  RATE_DECIMALS,
  RATE_SCALE,
} from "../index";

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("executeWith", () => {
  test("exports fixed-point rate scale metadata", () => {
    // given
    const expectedRateDecimals = 27n;
    const expectedRateScale = 10n ** expectedRateDecimals;

    // when

    // then
    expect(RATE_DECIMALS).toBe(expectedRateDecimals);
    expect(RATE_SCALE).toBe(expectedRateScale);
  });

  test("should throw a validation error for unsupported execution kinds", async () => {
    // given
    const action = { executionKind: "unsupported" } as never;
    const execute = executeWith({ walletAdapter: {} });

    // when
    const result = execute(action);

    // then
    await expect(result).rejects.toMatchObject({
      code: LiquidiumErrorCode.VALIDATION_ERROR,
    });
  });
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
    const client = new LiquidiumClient({});

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
    const client = new LiquidiumClient({});

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
    const registerProfile = vi.fn().mockResolvedValue({
      Ok: {
        toText: () => "ddddd-dd",
      },
    });
    vi.spyOn(Actor, "createActor").mockReturnValue({
      get_nonce: vi.fn().mockResolvedValue(13n),
      get_wallet_profile: vi.fn().mockResolvedValue([]),
      register_profile: registerProfile,
    } as never);
    const signMessage = vi.fn().mockResolvedValue("0xabcdef");
    const client = new LiquidiumClient({});

    // when
    const profileId = await client.accounts.createProfile({
      account: "0xabc",
      chain: "ETH",
      walletAdapter: { signMessage },
    });

    // then
    expect(profileId).toBe("ddddd-dd");
    expect(signMessage).toHaveBeenCalledTimes(1);
    expect(registerProfile).toHaveBeenCalledWith(
      expect.objectContaining({
        signature_info: expect.objectContaining({
          Wallet: expect.objectContaining({ signature: "abcdef" }),
        }),
      })
    );
  });

  test("should canonicalize Ethereum account casing before profile calls", async () => {
    // given
    const LOWERCASE_ETH_ADDRESS = "0x0fdc16c8ea36b2ebadcdc31a780759287120a5e5";
    const CHECKSUM_ETH_ADDRESS = "0x0fDC16C8EA36b2eBadCdC31A780759287120a5e5";
    const getWalletProfile = vi.fn().mockResolvedValue([]);
    const getNonce = vi.fn().mockResolvedValue(17n);
    const registerProfile = vi.fn().mockResolvedValue({
      Ok: {
        toText: () => "eeeee-ee",
      },
    });
    vi.spyOn(Actor, "createActor").mockReturnValue({
      get_nonce: getNonce,
      get_wallet_profile: getWalletProfile,
      register_profile: registerProfile,
    } as never);
    const signMessage = vi.fn().mockResolvedValue("0xsigned");
    const client = new LiquidiumClient({});

    // when
    const profileId = await client.accounts.createProfile({
      account: LOWERCASE_ETH_ADDRESS,
      chain: "ETH",
      walletAdapter: { signMessage },
    });

    // then
    expect(profileId).toBe("eeeee-ee");
    expect(getWalletProfile).toHaveBeenCalledWith(CHECKSUM_ETH_ADDRESS);
    expect(getNonce).toHaveBeenCalledWith(CHECKSUM_ETH_ADDRESS);
    expect(signMessage).toHaveBeenCalledWith(
      expect.objectContaining({ account: CHECKSUM_ETH_ADDRESS })
    );
    expect(registerProfile).toHaveBeenCalledWith(
      expect.objectContaining({
        signature_info: expect.objectContaining({
          Wallet: expect.objectContaining({ account: CHECKSUM_ETH_ADDRESS }),
        }),
      })
    );
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
    const client = new LiquidiumClient({});

    // when

    // then
    await expect(
      client.accounts
        .prepareCreateProfile({ account: "0x123" })
        .then((createAction) =>
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

  test("prepares create action without checking for an existing profile", async () => {
    // given
    const getWalletProfile = vi
      .fn()
      .mockResolvedValue([{ toText: () => "aaaaa-aa" }]);
    const getNonce = vi.fn().mockResolvedValue(23n);
    vi.spyOn(Actor, "createActor").mockReturnValue({
      get_wallet_profile: getWalletProfile,
      get_nonce: getNonce,
      register_profile: vi.fn(),
    } as never);
    const client = new LiquidiumClient({});

    // when
    const createAction = await client.accounts.prepareCreateProfile({
      account: "0xabc",
    });

    // then
    expect(createAction.message).toContain("Nonce: 23");
    expect(getNonce).toHaveBeenCalledWith("0xabc");
    expect(getWalletProfile).not.toHaveBeenCalled();
  });

  test("blocks action submission when wallet already has a profile", async () => {
    // given
    const registerProfile = vi.fn();
    vi.spyOn(Actor, "createActor").mockReturnValue({
      get_wallet_profile: vi
        .fn()
        .mockResolvedValue([{ toText: () => "bbbbb-bb" }]),
      get_nonce: vi.fn().mockResolvedValue(29n),
      register_profile: registerProfile,
    } as never);
    const client = new LiquidiumClient({});

    // when

    // then
    await expect(
      client.accounts
        .prepareCreateProfile({ account: "0xabc" })
        .then((createAction) =>
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
    const client = new LiquidiumClient({});

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
    const client = new LiquidiumClient({});

    // when

    // then
    await expect(
      client.accounts.listLinkedWallets("aaaaa-aa")
    ).rejects.toMatchObject({
      code: LiquidiumErrorCode.INTERNAL,
      message: "Unsupported wallet chain returned for profile wallet: SOL",
    });
  });
});

describe("HistoryModule", () => {
  test("uses default prod API base URL when no apiBaseUrl configured", async () => {
    // given
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        new Response(
          JSON.stringify({ success: true, items: [], nextCursor: undefined }),
          { status: 200 }
        )
      );
    const client = new LiquidiumClient({});

    // when
    const result = await client.history.getUserTransactionHistory("profile-1");

    // then
    expect(result).toEqual({ items: [], nextCursor: undefined });
    expect(fetchSpy).toHaveBeenCalledWith(
      `${DEFAULT_API_BASE_URL}/v1/history/users/profile-1/transactions`,
      expect.objectContaining({ method: "GET" })
    );
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
    const client = new LiquidiumClient({
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
          status: "confirmed",
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

  test("fetches pool rate history through the sdk api", async () => {
    // given
    const apiRateDecimals = Number(RATE_DECIMALS);
    const responsePayload = {
      success: true as const,
      items: [
        {
          date: "2026-04-01T00:00:00.000Z",
          rateDecimals: apiRateDecimals,
          avgBorrowRate: "1000",
          avgLendRate: "500",
          avgUtilizationRate: "8000",
        },
      ],
      nextCursor: "2026-04-01T00:00:00.000Z::1",
    };
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(responsePayload), {
        status: 200,
        headers: {
          "content-type": "application/json",
        },
      })
    );
    const client = new LiquidiumClient({
      apiBaseUrl: "https://app.liquidium.fi/api/sdk",
    });

    // when
    const result = await client.history.getPoolHistory("pool-1", {
      from: "2026-04-01T00:00:00.000Z",
      limit: 1,
    });

    // then
    expect(result).toEqual({
      items: [
        {
          date: "2026-04-01T00:00:00.000Z",
          rateDecimals: RATE_DECIMALS,
          avgBorrowRate: 1000n,
          avgLendRate: 500n,
          avgUtilizationRate: 8000n,
        },
      ],
      nextCursor: "2026-04-01T00:00:00.000Z::1",
    });
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://app.liquidium.fi/api/sdk/v1/history/pool/pool-1?from=2026-04-01T00%3A00%3A00.000Z&limit=1",
      {
        method: "GET",
        headers: undefined,
        body: undefined,
        signal: expect.any(AbortSignal),
      }
    );
  });

  test("fetches pool config history through the sdk api", async () => {
    // given
    const responsePayload = {
      success: true as const,
      items: [
        {
          type: "configuration_change" as const,
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
    const client = new LiquidiumClient({
      apiBaseUrl: "https://app.liquidium.fi/api/sdk",
    });

    // when
    const result = await client.history.getPoolConfigHistory("pool-1");

    // then
    expect(result).toEqual({
      items: [
        {
          type: "configuration_change",
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
        },
      ],
      nextCursor: undefined,
    });
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://app.liquidium.fi/api/sdk/v1/history/pool-config/pool-1",
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
          txids: ["tx-1"],
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
    const client = new LiquidiumClient({
      apiBaseUrl: "https://app.liquidium.fi/api/sdk",
    });

    // when
    const result = await client.history.getUserTransactionHistory("profile-1", {
      cursor: "2026-03-31T00:00:00.000Z::history-0",
      market: "pool-btc",
      poolId: "pool-btc",
      types: ["borrow"],
      statuses: ["confirmed"],
      from: "2026-04-01T00:00:00.000Z",
      to: "2026-04-03T00:00:00.000Z",
      limit: 1,
    });

    // then
    expect(result).toEqual({
      items: [
        {
          id: "history-1",
          type: "borrow",
          amount: 50000n,
          poolId: "pool-btc",
          timestamp: "2026-04-02T00:00:00.000Z",
          status: "confirmed",
          txids: ["tx-1"],
        },
      ],
      nextCursor: "2026-04-02T00:00:00.000Z::history-1",
    });
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://app.liquidium.fi/api/sdk/v1/history/users/profile-1/transactions?cursor=2026-03-31T00%3A00%3A00.000Z%3A%3Ahistory-0&market=pool-btc&poolId=pool-btc&types=borrow&statuses=CONFIRMED&from=2026-04-01T00%3A00%3A00.000Z&to=2026-04-03T00%3A00%3A00.000Z&limit=1",
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
    const client = new LiquidiumClient({
      apiBaseUrl: "https://app.liquidium.fi/api/sdk",
    });

    // when
    const result = await client.history.getLiquidationHistory("profile-1", {
      cursor: "2026-04-03T00:00:00.000Z::history-8",
      market: "pool-btc",
      from: "2026-04-01T00:00:00.000Z",
      to: "2026-04-05T00:00:00.000Z",
      limit: 1,
    });

    // then
    expect(result.items[0]).toMatchObject({
      type: "liquidation",
      amount: 12345n,
      poolId: "pool-btc",
    });
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://app.liquidium.fi/api/sdk/v1/history/users/profile-1/liquidations?cursor=2026-04-03T00%3A00%3A00.000Z%3A%3Ahistory-8&market=pool-btc&from=2026-04-01T00%3A00%3A00.000Z&to=2026-04-05T00%3A00%3A00.000Z&limit=1",
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
    const apiRateDecimals = Number(RATE_DECIMALS);
    const responsePayload = {
      success: true as const,
      items: [
        {
          date: "2026-04-02T00:00:00.000Z",
          rateDecimals: apiRateDecimals,
          avgRate: "15",
        },
        {
          date: "2026-04-01T00:00:00.000Z",
          rateDecimals: apiRateDecimals,
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
    const client = new LiquidiumClient({
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
          rateDecimals: RATE_DECIMALS,
          avgRate: 15n,
        },
        {
          date: "2026-04-01T00:00:00.000Z",
          rateDecimals: RATE_DECIMALS,
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

describe("ActivitiesModule", () => {
  test("uses default prod API base URL when no apiBaseUrl configured", async () => {
    // given
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: true, activities: [] }), {
        status: 200,
      })
    );
    const client = new LiquidiumClient({});

    // when
    const result = await client.activities.list({ profileId: "profile-1" });

    // then
    expect(result).toEqual([]);
    expect(fetchSpy).toHaveBeenCalledWith(
      `${DEFAULT_API_BASE_URL}/v1/activities?profileId=profile-1&state=all`,
      expect.objectContaining({ method: "GET" })
    );
  });

  test("lists all activities by default through the sdk api", async () => {
    // given
    const ACTIVITY_AMOUNT = "100000";
    const ACTIVITY_AMOUNT_BASE_UNITS = 100000n;
    const ACTIVITY_TIMESTAMP_MS = 1775001600000;
    const ACTIVITY_CONFIRMATIONS = 1;
    const ACTIVITY_REQUIRED_CONFIRMATIONS = 6;
    const responsePayload = {
      success: true as const,
      activities: [
        {
          id: "activity-1",
          direction: "inflow" as const,
          kind: "deposit" as const,
          status: "pending" as const,
          stage: "logged" as const,
          poolId: "pool-1",
          asset: "BTC",
          chain: "BTC" as const,
          amount: ACTIVITY_AMOUNT,
          timestampMs: ACTIVITY_TIMESTAMP_MS,
          txid: "tx-1",
          confirmations: ACTIVITY_CONFIRMATIONS,
          requiredConfirmations: ACTIVITY_REQUIRED_CONFIRMATIONS,
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
    const client = new LiquidiumClient({
      apiBaseUrl: "https://app.liquidium.fi/api/sdk",
    });

    // when
    const result = await client.activities.list({
      profileId: "profile-1",
    });

    // then
    expect(result).toEqual([
      {
        id: "activity-1",
        direction: "inflow",
        kind: "deposit",
        status: "pending",
        poolId: "pool-1",
        asset: "BTC",
        chain: "BTC",
        amount: ACTIVITY_AMOUNT_BASE_UNITS,
        timestampMs: ACTIVITY_TIMESTAMP_MS,
        txid: "tx-1",
        confirmations: ACTIVITY_CONFIRMATIONS,
        requiredConfirmations: ACTIVITY_REQUIRED_CONFIRMATIONS,
      },
    ]);
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://app.liquidium.fi/api/sdk/v1/activities?profileId=profile-1&state=all",
      {
        method: "GET",
        headers: undefined,
        body: undefined,
        signal: expect.any(AbortSignal),
      }
    );
  });

  test("lists activities by instant loan short ref", async () => {
    // given
    const LOAN_ID = 42n;
    const PROFILE_ID = "aaaaa-aa";
    const SHORT_REF = publicIdFromInt(LOAN_ID);
    const getLoan = vi.fn().mockResolvedValue({
      Ok: {
        lending_profile: Principal.fromText(PROFILE_ID),
      },
    });
    vi.spyOn(Actor, "createActor").mockReturnValue({
      get_loan: getLoan,
    } as never);
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          activities: [],
        }),
        {
          status: 200,
          headers: {
            "content-type": "application/json",
          },
        }
      )
    );
    const client = new LiquidiumClient({
      apiBaseUrl: "https://app.liquidium.fi/api/sdk",
      canisterIds: { instantLoans: "kzrva-ziaaa-aaaar-qamyq-cai" },
    });

    // when
    const result = await client.activities.list({
      shortRef: SHORT_REF,
      filter: "active",
    });

    // then
    expect(getLoan).toHaveBeenCalledWith(LOAN_ID);
    expect(result).toEqual([]);
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://app.liquidium.fi/api/sdk/v1/activities?profileId=aaaaa-aa&state=active",
      {
        method: "GET",
        headers: undefined,
        body: undefined,
        signal: expect.any(AbortSignal),
      }
    );
  });

  test("gets activity status by receipt id", async () => {
    // given
    const ACTIVITY_AMOUNT = "50000";
    const ACTIVITY_AMOUNT_BASE_UNITS = 50000n;
    const ACTIVITY_TIMESTAMP_MS = 1775001600000;
    const ACTIVITY_CONFIRMATIONS = 0;
    const ACTIVITY_REQUIRED_CONFIRMATIONS = 1;
    const responsePayload = {
      success: true as const,
      found: true as const,
      activity: {
        id: "activity-1",
        direction: "outflow" as const,
        kind: "borrow" as const,
        status: "sent" as const,
        poolId: "pool-1",
        asset: "BTC",
        chain: "BTC" as const,
        amount: ACTIVITY_AMOUNT,
        timestampMs: ACTIVITY_TIMESTAMP_MS,
        txid: "tx-1",
        confirmations: ACTIVITY_CONFIRMATIONS,
        requiredConfirmations: ACTIVITY_REQUIRED_CONFIRMATIONS,
        topUp: {
          required: true,
          depositedAmount: "1000",
          feeAmount: "2000",
          shortfallAmount: "1000",
        },
      },
    };
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(responsePayload), {
        status: 200,
        headers: {
          "content-type": "application/json",
        },
      })
    );
    const client = new LiquidiumClient({
      apiBaseUrl: "https://app.liquidium.fi/api/sdk",
    });

    // when
    const result = await client.activities.getStatus({
      profileId: "profile-1",
      id: "activity-1",
    });

    // then
    expect(result).toEqual({
      found: true,
      activity: {
        id: "activity-1",
        direction: "outflow",
        kind: "borrow",
        status: "sent",
        poolId: "pool-1",
        asset: "BTC",
        chain: "BTC",
        amount: ACTIVITY_AMOUNT_BASE_UNITS,
        timestampMs: ACTIVITY_TIMESTAMP_MS,
        txid: "tx-1",
        confirmations: ACTIVITY_CONFIRMATIONS,
        requiredConfirmations: ACTIVITY_REQUIRED_CONFIRMATIONS,
      },
    });
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://app.liquidium.fi/api/sdk/v1/activities/activity-1/status?profileId=profile-1",
      {
        method: "GET",
        headers: undefined,
        body: undefined,
        signal: expect.any(AbortSignal),
      }
    );
  });

  test("gets activity status by instant loan short ref", async () => {
    // given
    const LOAN_ID = 42n;
    const PROFILE_ID = "aaaaa-aa";
    const SHORT_REF = publicIdFromInt(LOAN_ID);
    const ACTIVITY_AMOUNT = "50000";
    const ACTIVITY_AMOUNT_BASE_UNITS = 50000n;
    const ACTIVITY_TIMESTAMP_MS = 1775001600000;
    const ACTIVITY_CONFIRMATIONS = 0;
    const ACTIVITY_REQUIRED_CONFIRMATIONS = 1;
    const getLoan = vi.fn().mockResolvedValue({
      Ok: {
        lending_profile: Principal.fromText(PROFILE_ID),
      },
    });
    const responsePayload = {
      success: true as const,
      found: true as const,
      activity: {
        id: "activity-1",
        direction: "outflow" as const,
        kind: "borrow" as const,
        status: "sent" as const,
        poolId: "pool-1",
        asset: "BTC",
        chain: "BTC" as const,
        amount: ACTIVITY_AMOUNT,
        timestampMs: ACTIVITY_TIMESTAMP_MS,
        txid: "tx-1",
        confirmations: ACTIVITY_CONFIRMATIONS,
        requiredConfirmations: ACTIVITY_REQUIRED_CONFIRMATIONS,
      },
    };
    vi.spyOn(Actor, "createActor").mockReturnValue({
      get_loan: getLoan,
    } as never);
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(responsePayload), {
        status: 200,
        headers: {
          "content-type": "application/json",
        },
      })
    );
    const client = new LiquidiumClient({
      apiBaseUrl: "https://app.liquidium.fi/api/sdk",
      canisterIds: { instantLoans: "kzrva-ziaaa-aaaar-qamyq-cai" },
    });

    // when
    const result = await client.activities.getStatus({
      shortRef: SHORT_REF,
      id: "activity-1",
    });

    // then
    expect(getLoan).toHaveBeenCalledWith(LOAN_ID);
    expect(result).toEqual({
      found: true,
      activity: {
        id: "activity-1",
        direction: "outflow",
        kind: "borrow",
        status: "sent",
        poolId: "pool-1",
        asset: "BTC",
        chain: "BTC",
        amount: ACTIVITY_AMOUNT_BASE_UNITS,
        timestampMs: ACTIVITY_TIMESTAMP_MS,
        txid: "tx-1",
        confirmations: ACTIVITY_CONFIRMATIONS,
        requiredConfirmations: ACTIVITY_REQUIRED_CONFIRMATIONS,
      },
    });
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://app.liquidium.fi/api/sdk/v1/activities/activity-1/status?profileId=aaaaa-aa",
      {
        method: "GET",
        headers: undefined,
        body: undefined,
        signal: expect.any(AbortSignal),
      }
    );
  });

  test("maps pre-terminal eth inflows to detected status", async () => {
    // given
    const ACTIVITY_AMOUNT = "4000000";
    const ACTIVITY_AMOUNT_BASE_UNITS = 4000000n;
    const ACTIVITY_TIMESTAMP_MS = 1777889521994;
    const ACTIVITY_CONFIRMATIONS = 0;
    const ACTIVITY_REQUIRED_CONFIRMATIONS = 64;
    const TOP_UP_FEE_AMOUNT = "5740000";
    const TOP_UP_FEE_AMOUNT_BASE_UNITS = 5740000n;
    const TOP_UP_SHORTFALL_AMOUNT = "1740000";
    const TOP_UP_SHORTFALL_AMOUNT_BASE_UNITS = 1740000n;
    const responsePayload = {
      success: true as const,
      found: true as const,
      activity: {
        id: "pre_terminal_eth_36",
        direction: "inflow" as const,
        kind: "deposit" as const,
        status: "pending" as const,
        poolId: "7dcux-qqaaa-aaaae-qfc3a-cai",
        asset: "USDT",
        chain: "ETH" as const,
        amount: ACTIVITY_AMOUNT,
        timestampMs: ACTIVITY_TIMESTAMP_MS,
        txid: "0x624f47a2d993c01b20d3fddcf8e5e8afe774d6e29d3702674f564fe825ae472c",
        confirmations: ACTIVITY_CONFIRMATIONS,
        requiredConfirmations: ACTIVITY_REQUIRED_CONFIRMATIONS,
        topUp: {
          required: true,
          depositedAmount: ACTIVITY_AMOUNT,
          feeAmount: TOP_UP_FEE_AMOUNT,
          shortfallAmount: TOP_UP_SHORTFALL_AMOUNT,
        },
      },
    };
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(responsePayload), {
        status: 200,
        headers: {
          "content-type": "application/json",
        },
      })
    );
    const client = new LiquidiumClient({
      apiBaseUrl: "https://app.liquidium.fi/api/sdk",
    });

    // when
    const result = await client.activities.getStatus({
      profileId: "profile-1",
      id: "0x624f47a2d993c01b20d3fddcf8e5e8afe774d6e29d3702674f564fe825ae472c",
    });

    // then
    expect(result).toEqual({
      found: true,
      activity: {
        id: "pre_terminal_eth_36",
        direction: "inflow",
        kind: "deposit",
        status: "detected",
        poolId: "7dcux-qqaaa-aaaae-qfc3a-cai",
        asset: "USDT",
        chain: "ETH",
        amount: ACTIVITY_AMOUNT_BASE_UNITS,
        timestampMs: ACTIVITY_TIMESTAMP_MS,
        txid: "0x624f47a2d993c01b20d3fddcf8e5e8afe774d6e29d3702674f564fe825ae472c",
        confirmations: ACTIVITY_CONFIRMATIONS,
        requiredConfirmations: ACTIVITY_REQUIRED_CONFIRMATIONS,
        topUp: {
          required: true,
          depositedAmount: ACTIVITY_AMOUNT_BASE_UNITS,
          feeAmount: TOP_UP_FEE_AMOUNT_BASE_UNITS,
          shortfallAmount: TOP_UP_SHORTFALL_AMOUNT_BASE_UNITS,
        },
      },
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
    const client = new LiquidiumClient({});

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

describe("PositionsModule", () => {
  const PROFILE_ID = "aaaaa-aa";
  const POOL_ID = "rrkah-fqaaa-aaaaa-aaaaq-cai";

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
        { pool_id: { toText: () => POOL_ID } },
        { pool_id: { toText: () => SECOND_POOL_ID } },
      ],
      weighted_liquidation_threshold: 0n,
    });
    const getPosition = vi
      .fn()
      .mockResolvedValueOnce([
        makePositionView({
          deposited_native_now: 100n,
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
    } as never);
    const client = new LiquidiumClient({});

    // when
    const positions = await client.positions.listPositions(PROFILE_ID);

    // then
    expect(positions).toEqual([
      {
        poolId: POOL_ID,
        asset: "BTC",
        deposited: 100n,
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

  test("skips positions that the canister no longer returns in list", async () => {
    // given
    const getProfileStats = vi.fn().mockResolvedValue({
      debt: 0n,
      collateral: 0n,
      acumulated_interest: 0n,
      borrowing_power: { max_borrowable_usd: 0n, weighted_max_ltv: 0n },
      positions: [{ pool_id: { toText: () => POOL_ID } }],
      weighted_liquidation_threshold: 0n,
    });
    vi.spyOn(Actor, "createActor").mockReturnValue({
      get_profile_stats: getProfileStats,
      get_position: vi.fn().mockResolvedValue([]),
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
    vi.spyOn(Actor, "createActor").mockReturnValue({
      get_profile_stats: vi.fn().mockResolvedValue({
        debt: 0n,
        collateral: 0n,
        acumulated_interest: 0n,
        borrowing_power: { max_borrowable_usd: 0n, weighted_max_ltv: 0n },
        positions: [
          { pool_id: { toText: () => BTC_POOL_ID } },
          { pool_id: { toText: () => USDT_POOL_ID } },
        ],
        weighted_liquidation_threshold: 0n,
      }),
      get_position: vi
        .fn()
        .mockResolvedValueOnce([
          makePositionView({
            deposited_native_now: 200_000_000n,
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
});

describe("LendingModule", () => {
  const BTC_POOL_ID = "hkmli-faaaa-aaaar-qb4ba-cai";
  const USDT_POOL_ID = "hnnn4-iyaaa-aaaar-qb4bq-cai";
  const USDC_POOL_ID = "ryjl3-tyaaa-aaaaa-aaaba-cai";
  const VALID_BTC_OUTFLOW_ADDRESS = "1BoatSLRHtKNngkdXEeobR76b53LETtpyT";
  const LOWERCASE_EVM_OUTFLOW_ADDRESS =
    "0x52908400098527886e0f7030069857d2e4169ee7";
  const CHECKSUM_EVM_OUTFLOW_ADDRESS =
    "0x52908400098527886E0F7030069857D2E4169EE7";

  function encodeBytes32Hex(bytes: Uint8Array): `0x${string}` {
    return `0x${Array.from(bytes, (byte) =>
      byte.toString(16).padStart(2, "0")
    ).join("")}`;
  }

  function encodePrincipalToBytes32(principal: Principal): `0x${string}` {
    const principalBytes = principal.toUint8Array();
    const fixedBytes = new Uint8Array(32);
    fixedBytes[0] = principalBytes.length;
    fixedBytes.set(principalBytes, 1);

    return encodeBytes32Hex(fixedBytes);
  }

  function mockUsdtPoolList(): void {
    vi.spyOn(Actor, "createActor").mockReturnValueOnce({
      list_pools: vi.fn().mockResolvedValue([createUsdtPoolRecord()]),
    } as never);
  }

  function createUsdtPoolRecord() {
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

  function createBtcPoolRecord(poolId = BTC_POOL_ID) {
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

  test("returns a native supply target for the btc pool", async () => {
    // given
    const profileId = "aaaaa-aa";
    const getBtcAddress = vi
      .fn()
      .mockResolvedValue("bc1qexampledepositaddress");
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
        get_btc_address: getBtcAddress,
      } as never);
    const client = new LiquidiumClient({});

    // when
    const supplyFlow = await client.lending.supply({
      profileId,
      poolId: BTC_POOL_ID,
      action: "deposit",
    });

    // then
    expect(supplyFlow).toMatchObject({
      type: "transfer",
      target: {
        type: "nativeAddress",
        poolId: BTC_POOL_ID,
        asset: "BTC",
        chain: "BTC",
        action: "deposit",
        address: "bc1qexampledepositaddress",
      },
    });
    expect(getBtcAddress).toHaveBeenCalledTimes(1);
    const getBtcAddressRequest = getBtcAddress.mock.calls[0]?.[0];
    expect(getBtcAddressRequest?.owner[0]?.toText()).toBe(BTC_POOL_ID);
    expect(Array.from(getBtcAddressRequest?.subaccount[0] ?? [])).toEqual(
      Array.from(
        encodeInflowSubaccount({
          action: "deposit",
          principal: Principal.fromText(profileId),
        })
      )
    );
  });

  test("returns a deposit address supply target for the usdt pool", async () => {
    // given
    const profileId = "aaaaa-aa";
    const getDepositAddress = vi.fn().mockResolvedValue({
      Ok: "0x1111111111111111111111111111111111111111",
    });
    vi.spyOn(Actor, "createActor")
      .mockReturnValueOnce({
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
      } as never)
      .mockReturnValueOnce({
        get_deposit_address: getDepositAddress,
      } as never);
    const client = new LiquidiumClient({});

    // when
    const supplyFlow = await client.lending.supply({
      profileId,
      poolId: USDT_POOL_ID,
      action: "repayment",
    });

    // then
    expect(supplyFlow).toMatchObject({
      type: "transfer",
      target: {
        type: "nativeAddress",
        poolId: USDT_POOL_ID,
        asset: "USDT",
        chain: "ETH",
        action: "repayment",
        address: "0x1111111111111111111111111111111111111111",
      },
    });
    expect(getDepositAddress).toHaveBeenCalledTimes(1);
    const depositAddressRequest = getDepositAddress.mock.calls[0]?.[0];
    expect(depositAddressRequest?.owner.toText()).toBe(USDT_POOL_ID);
    expect(Array.from(depositAddressRequest?.subaccount[0] ?? [])).toEqual(
      Array.from(
        encodeInflowSubaccount({
          action: "repayment",
          principal: Principal.fromText(profileId),
        })
      )
    );
    expect(getDepositAddress.mock.calls[0]?.[1]).toEqual([
      "0xdac17f958d2ee523a2206206994597c13d831ec7",
    ]);
  });

  test("returns a deposit address supply target for the usdc pool when transfer is requested", async () => {
    // given
    const profileId = "aaaaa-aa";
    const getDepositAddress = vi.fn().mockResolvedValue({
      Ok: "0x2222222222222222222222222222222222222222",
    });
    vi.spyOn(Actor, "createActor")
      .mockReturnValueOnce({
        list_pools: vi.fn().mockResolvedValue([
          {
            optimal_utilization_rate: 80n,
            principal: {
              toString: () => USDC_POOL_ID,
              toText: () => USDC_POOL_ID,
            },
            total_generated_interest_snapshot: 0n,
            supply_cap: [],
            same_asset_borrowing: [],
            asset: { USDC: null },
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
      } as never)
      .mockReturnValueOnce({
        get_deposit_address: getDepositAddress,
      } as never);
    const client = new LiquidiumClient({});

    // when
    const supplyFlow = await client.lending.supply({
      profileId,
      poolId: USDC_POOL_ID,
      action: "deposit",
      mechanism: "transfer",
    });

    // then
    expect(supplyFlow).toMatchObject({
      type: "transfer",
      target: {
        type: "nativeAddress",
        poolId: USDC_POOL_ID,
        asset: "USDC",
        chain: "ETH",
        action: "deposit",
        address: "0x2222222222222222222222222222222222222222",
      },
    });
    expect(getDepositAddress).toHaveBeenCalledTimes(1);
    const depositAddressRequest = getDepositAddress.mock.calls[0]?.[0];
    expect(depositAddressRequest?.owner.toText()).toBe(USDC_POOL_ID);
    expect(Array.from(depositAddressRequest?.subaccount[0] ?? [])).toEqual(
      Array.from(
        encodeInflowSubaccount({
          action: "deposit",
          principal: Principal.fromText(profileId),
        })
      )
    );
    expect(getDepositAddress.mock.calls[0]?.[1]).toEqual([
      "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    ]);
  });

  test("should not submit eth stablecoin transfer txids through the inflow endpoint", async () => {
    // given
    const profileId = "aaaaa-aa";
    const txid =
      "0x76ffa8bd3b89187c1a54b9f9c0adcd53da15623b38dc80304937fe962243b86e";
    vi.spyOn(Actor, "createActor")
      .mockReturnValueOnce({
        list_pools: vi.fn().mockResolvedValue([
          {
            optimal_utilization_rate: 80n,
            principal: {
              toString: () => USDC_POOL_ID,
              toText: () => USDC_POOL_ID,
            },
            total_generated_interest_snapshot: 0n,
            supply_cap: [],
            same_asset_borrowing: [],
            asset: { USDC: null },
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
      } as never)
      .mockReturnValueOnce({
        get_deposit_address: vi.fn().mockResolvedValue({
          Ok: "0x2222222222222222222222222222222222222222",
        }),
      } as never);
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const client = new LiquidiumClient({
      apiBaseUrl: "https://app.liquidium.fi/api/sdk",
    });

    // when
    const supplyFlow = await client.lending.supply({
      profileId,
      poolId: USDC_POOL_ID,
      action: "deposit",
      mechanism: "transfer",
    });
    const result = await supplyFlow.submit({ txid });

    // then
    expect(result).toEqual({ success: true, txid });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  test("rejects supply when no supply mechanism is configured", async () => {
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
    const client = new LiquidiumClient({});

    // when

    // then
    await expect(
      client.lending.supply({
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
    const client = new LiquidiumClient({});

    // when

    // then
    await expect(
      client.lending.supply({
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

  test("rejects contract-interaction supply for the btc pool", async () => {
    // given
    vi.spyOn(Actor, "createActor").mockReturnValueOnce({
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
    } as never);
    const client = new LiquidiumClient({});

    // when

    // then
    await expect(
      client.lending.supply({
        profileId: "aaaaa-aa",
        poolId: BTC_POOL_ID,
        action: "deposit",
        mechanism: "contractInteraction",
        walletAdapter: {
          sendEthTransaction: vi.fn(),
        },
        account: "0x1234567890123456789012345678901234567890",
        amount: 1_000_000n,
      })
    ).rejects.toMatchObject({
      code: LiquidiumErrorCode.VALIDATION_ERROR,
      message: "Contract-interaction supply is not supported for BTC on BTC",
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
    const client = new LiquidiumClient({
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

  test("computes evm supply context with the configured EVM read client", async () => {
    // given
    mockUsdtPoolList();
    const readContract = vi
      .fn()
      .mockResolvedValueOnce(0n)
      .mockResolvedValueOnce(2_000_000n);
    const client = new LiquidiumClient({
      evmPublicClient: { readContract } as never,
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
    expect(result).toMatchObject({
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
      depositContractAddress: "0x18901044688D3756C35Ed2b36D93e6a5B8e00E68",
      balance: "2000000",
      allowance: "0",
      requiresApproval: true,
      approvalStrategy: "approve-max",
    });
    expect(readContract).toHaveBeenCalledTimes(2);
    expect(readContract).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        functionName: "allowance",
        args: [
          "0x1234567890123456789012345678901234567890",
          "0x18901044688D3756C35Ed2b36D93e6a5B8e00E68",
        ],
      })
    );
    expect(readContract).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        functionName: "balanceOf",
        args: ["0x1234567890123456789012345678901234567890"],
      })
    );
  });

  test("should return reset approval strategy for partial EVM allowance", async () => {
    // given
    mockUsdtPoolList();
    const readContract = vi
      .fn()
      .mockResolvedValueOnce(500_000n)
      .mockResolvedValueOnce(2_000_000n);
    const client = new LiquidiumClient({
      evmPublicClient: { readContract } as never,
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
    expect(result.allowance).toBe("500000");
    expect(result.requiresApproval).toBe(true);
    expect(result.approvalStrategy).toBe("reset-then-approve-max");
  });

  test("estimates eth usdt inflow fee from the deposit canister", async () => {
    // given
    const estimateDepositFee = vi.fn().mockResolvedValue({ Ok: 12_345n });
    vi.spyOn(Actor, "createActor").mockReturnValue({
      estimate_deposit_fee: estimateDepositFee,
    } as never);
    const client = new LiquidiumClient({});

    // when
    const estimate = await client.lending.estimateInflowFee({
      asset: "USDT",
      chain: "ETH",
    });

    // then
    expect(estimate.totalFee).toBe(12_345n);
    expect(estimateDepositFee).toHaveBeenCalledWith([
      "0xdac17f958d2ee523a2206206994597c13d831ec7",
    ]);
  });

  test("auto-executes eth usdt supply with a deposit address transfer", async () => {
    // given
    vi.spyOn(Actor, "createActor")
      .mockReturnValueOnce({
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
      } as never)
      .mockReturnValueOnce({
        get_deposit_address: vi.fn().mockResolvedValue({
          Ok: "0x1111111111111111111111111111111111111111",
        }),
      } as never);
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const sendEthTransaction = vi.fn().mockResolvedValueOnce("0xdeposit");
    const client = new LiquidiumClient({});

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
    expect(flow.type).toBe("transfer");
    expect(flow.target).toMatchObject({
      type: "nativeAddress",
      asset: "USDT",
      chain: "ETH",
      address: "0x1111111111111111111111111111111111111111",
    });
    expect(flow.txid).toBe("0xdeposit");
    expect(sendEthTransaction).toHaveBeenCalledTimes(1);
    expect(sendEthTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        chain: "ETH",
        actionType: "supply-deposit",
        transaction: expect.objectContaining({
          to: "0xdac17f958d2ee523a2206206994597c13d831ec7",
          data: expect.stringMatching(/^0xa9059cbb/),
        }),
      })
    );
    const sentEthTransaction = sendEthTransaction.mock.calls[0]?.[0];
    const decodedTransfer = decodeFunctionData({
      abi: ERC20_ABI,
      data: sentEthTransaction?.transaction.data as `0x${string}`,
    });
    expect(decodedTransfer.functionName).toBe("transfer");
    expect(decodedTransfer.args).toEqual([
      "0x1111111111111111111111111111111111111111",
      1_000_000n,
    ]);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  test("auto-executes eth usdt supply with contract interaction when requested", async () => {
    // given
    const profileId = "aaaaa-aa";
    const depositTxid = "0xcontractdeposit";
    mockUsdtPoolList();
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    fetchSpy.mockResolvedValueOnce(
      new Response(JSON.stringify({ success: true, txid: depositTxid }), {
        status: 200,
        headers: {
          "content-type": "application/json",
        },
      })
    );
    const readContract = vi
      .fn()
      .mockResolvedValueOnce(1_000_000n)
      .mockResolvedValueOnce(2_000_000n);
    const sendEthTransaction = vi.fn().mockResolvedValueOnce(depositTxid);
    const client = new LiquidiumClient({
      apiBaseUrl: "https://app.liquidium.fi/api/sdk",
      evmPublicClient: { readContract } as never,
    });

    // when
    const flow = await client.lending.supply({
      profileId,
      poolId: USDT_POOL_ID,
      action: "deposit",
      account: "0x1234567890123456789012345678901234567890",
      amount: 1_000_000n,
      mechanism: "contractInteraction",
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
    expect(flow.txid).toBe(depositTxid);
    expect(sendEthTransaction).toHaveBeenCalledTimes(1);
    expect(sendEthTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        chain: "ETH",
        actionType: "supply-deposit-deposit-erc20",
        transaction: expect.objectContaining({
          to: "0x18901044688D3756C35Ed2b36D93e6a5B8e00E68",
          data: expect.stringMatching(/^0xdb9751af/),
        }),
      })
    );
    const sentEthTransaction = sendEthTransaction.mock.calls[0]?.[0];
    const decodedDeposit = decodeFunctionData({
      abi: CK_DEPOSIT_ABI,
      data: sentEthTransaction?.transaction.data as `0x${string}`,
    });
    expect(decodedDeposit.functionName).toBe("depositErc20");
    expect(decodedDeposit.args[0].toLowerCase()).toBe(
      "0xdac17f958d2ee523a2206206994597c13d831ec7"
    );
    expect(decodedDeposit.args[1]).toBe(1_000_000n);
    expect(decodedDeposit.args[2]).toBe(
      encodePrincipalToBytes32(Principal.fromText(USDT_POOL_ID))
    );
    expect(decodedDeposit.args[3]).toBe(
      encodeBytes32Hex(
        encodeInflowSubaccount({
          action: "deposit",
          principal: Principal.fromText(profileId),
        })
      )
    );
    expect(readContract).toHaveBeenCalledTimes(2);
    expect(fetchSpy).toHaveBeenNthCalledWith(
      1,
      "https://app.liquidium.fi/api/sdk/v1/inflow",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          txid: depositTxid,
          chain: "ETH",
          type: "DEPOSIT",
        }),
      })
    );
  });

  test("should return contract-interaction txid when inflow registration fails after broadcast", async () => {
    // given
    const profileId = "aaaaa-aa";
    const depositTxid = "0xcontractdeposit";
    const API_FAILURE = new Error("api unavailable");
    mockUsdtPoolList();
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockRejectedValueOnce(API_FAILURE);
    const readContract = vi
      .fn()
      .mockResolvedValueOnce(1_000_000n)
      .mockResolvedValueOnce(2_000_000n);
    const sendEthTransaction = vi.fn().mockResolvedValueOnce(depositTxid);
    const client = new LiquidiumClient({
      apiBaseUrl: "https://app.liquidium.fi/api/sdk",
      evmPublicClient: { readContract } as never,
    });

    // when
    const flow = await client.lending.supply({
      profileId,
      poolId: USDT_POOL_ID,
      action: "deposit",
      account: "0x1234567890123456789012345678901234567890",
      amount: 1_000_000n,
      mechanism: "contractInteraction",
      walletAdapter: {
        sendEthTransaction,
      },
    });

    // then
    expect(flow.type).toBe("contractInteraction");
    expect(flow.txid).toBe(depositTxid);
    expect(sendEthTransaction).toHaveBeenCalledTimes(1);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  test("should require an EVM read client for contract-interaction supply", async () => {
    // given
    mockUsdtPoolList();
    const sendEthTransaction = vi.fn();
    const client = new LiquidiumClient({
      apiBaseUrl: "https://app.liquidium.fi/api/sdk",
    });

    // when
    const result = client.lending.supply({
      profileId: "aaaaa-aa",
      poolId: USDT_POOL_ID,
      action: "deposit",
      account: "0x1234567890123456789012345678901234567890",
      amount: 1_000_000n,
      mechanism: "contractInteraction",
      walletAdapter: {
        sendEthTransaction,
      },
    });

    // then
    await expect(result).rejects.toMatchObject({
      code: LiquidiumErrorCode.VALIDATION_ERROR,
      message:
        "Contract-interaction supply requires an EVM RPC URL or public client",
    });
    expect(sendEthTransaction).not.toHaveBeenCalled();
  });

  test("creates a supply flow that exposes the target and submits a broadcast txid", async () => {
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
    const client = new LiquidiumClient({
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
    expect(flow.target).toMatchObject({
      type: "nativeAddress",
      address: "bc1qexampledepositaddress",
    });
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://app.liquidium.fi/api/sdk/v1/inflow",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          chain: "BTC",
          type: "DEPOSIT",
          txid,
        }),
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
    const client = new LiquidiumClient({
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
        body: JSON.stringify({
          txid,
          chain: "BTC",
          type: "DEPOSIT",
        }),
      })
    );
  });

  test("retries BTC inflow submission when the API temporarily fails", async () => {
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
      new Response(
        JSON.stringify({
          message: "An internal error occurred. Please contact support.",
        }),
        {
          status: 500,
          headers: {
            "content-type": "application/json",
          },
        }
      )
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
    const client = new LiquidiumClient({
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
    expect(fetchSpy).toHaveBeenNthCalledWith(
      1,
      "https://app.liquidium.fi/api/sdk/v1/inflow",
      expect.objectContaining({
        body: JSON.stringify({
          txid,
          chain: "BTC",
          type: "DEPOSIT",
        }),
      })
    );
  });

  test("auto-submits BTC repayment inflows with the REPAY submit type", async () => {
    // given
    const txid = "auto-repay-txid";
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
        get_btc_address: vi.fn().mockResolvedValue("bc1qexamplerepayaddress"),
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
    const client = new LiquidiumClient({
      apiBaseUrl: "https://app.liquidium.fi/api/sdk",
    });

    // when
    const flow = await client.lending.supply({
      profileId: "aaaaa-aa",
      poolId: BTC_POOL_ID,
      action: "repayment",
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
    expect(sendBtcTransaction).toHaveBeenCalledWith({
      chain: "BTC",
      toAddress: "bc1qexamplerepayaddress",
      amountSats: 100_000n,
      account: "bc1qsender",
      actionType: "supply-repayment",
      transferMode: "native",
    });
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://app.liquidium.fi/api/sdk/v1/inflow",
      expect.objectContaining({
        body: JSON.stringify({
          txid,
          chain: "BTC",
          type: "REPAY",
        }),
      })
    );
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
    const client = new LiquidiumClient({
      apiBaseUrl: "https://app.liquidium.fi/api/sdk",
    });

    // when

    // then
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

  test("uses default prod API base URL for inflow submission without apiBaseUrl", async () => {
    // given
    const TXID = "abc";
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: true, txid: TXID }), {
        status: 200,
      })
    );
    const client = new LiquidiumClient({});

    // when
    const result = await client.lending.submitInflow({ txid: TXID });

    // then
    expect(result).toEqual({ success: true, txid: TXID });
    expect(fetchSpy).toHaveBeenCalledWith(
      `${DEFAULT_API_BASE_URL}/v1/inflow`,
      expect.objectContaining({ method: "POST" })
    );
  });

  test("creates and submits a borrow action with a custom outflow account", async () => {
    // given
    vi.setSystemTime(new Date("2026-04-01T00:00:00.000Z"));
    const profileId = "aaaaa-aa";
    const poolId = "rrkah-fqaaa-aaaaa-aaaaq-cai";
    const getNonce = vi.fn().mockResolvedValue(17n);
    const borrowAssets = vi.fn().mockResolvedValue({
      Ok: {
        id: "outflow-1",
        txid: ["txid-1"],
        outflow_type: { Borrow: null },
        outflow_ref: ["ref-1"],
        amount: 50_000n,
        receiver: { External: VALID_BTC_OUTFLOW_ADDRESS },
      },
    });
    vi.spyOn(Actor, "createActor").mockReturnValue({
      list_pools: vi.fn().mockResolvedValue([createBtcPoolRecord(poolId)]),
      get_nonce: getNonce,
      borrow_assets: borrowAssets,
    } as never);
    const client = new LiquidiumClient({});

    // when
    const borrowAction = await client.lending.prepareBorrow({
      profileId,
      poolId,
      amount: 50_000n,
      receiverAddress: VALID_BTC_OUTFLOW_ADDRESS,
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
      receiverAddress: VALID_BTC_OUTFLOW_ADDRESS,
      signerWalletAddress: "0xsigner",
    });
    expect(borrowAction.message).toBe(`Liquidium: Borrow Assets

Action: Borrow from pool
Pool ID: rrkah-fqaaa-aaaaa-aaaaq-cai
Amount: 50000
Address:${VALID_BTC_OUTFLOW_ADDRESS}
Expires: 1775001900
Nonce: 17`);
    expect(borrowAssets).toHaveBeenCalledTimes(1);
    expect(borrowAssets.mock.calls[0]?.[0]).toEqual(
      Principal.fromText(profileId)
    );
    expect(borrowAssets.mock.calls[0]?.[1]).toMatchObject({
      data: {
        expiry_timestamp: 1775001900n,
        account: { External: VALID_BTC_OUTFLOW_ADDRESS },
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
        account: VALID_BTC_OUTFLOW_ADDRESS,
      },
    });
  });

  test("creates and executes a borrow request directly", async () => {
    // given
    vi.spyOn(Actor, "createActor").mockReturnValue({
      list_pools: vi.fn().mockResolvedValue([createBtcPoolRecord()]),
      get_nonce: vi.fn().mockResolvedValue(31n),
      borrow_assets: vi.fn().mockResolvedValue({
        Ok: {
          id: "outflow-3",
          txid: [],
          outflow_type: { Borrow: null },
          outflow_ref: [],
          amount: 12_000n,
          receiver: { External: VALID_BTC_OUTFLOW_ADDRESS },
        },
      }),
    } as never);
    const signMessage = vi.fn().mockResolvedValue("0xsigned");
    const client = new LiquidiumClient({});

    // when
    const outflow = await client.lending.borrow({
      profileId: "aaaaa-aa",
      poolId: BTC_POOL_ID,
      amount: 12_000n,
      receiverAddress: VALID_BTC_OUTFLOW_ADDRESS,
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

  test("should submit eth borrow with a checksummed signer address", async () => {
    // given
    const LOWERCASE_SIGNER_ADDRESS =
      "0xa5789280df0d6e3f5bc9a00358379768e391bea9";
    const EXPECTED_CHECKSUM_SIGNER_ADDRESS =
      "0xA5789280dF0D6E3F5BC9a00358379768e391BEA9";
    const borrowAssets = vi.fn().mockResolvedValue({
      Ok: {
        id: "outflow-4",
        txid: [],
        outflow_type: { Borrow: null },
        outflow_ref: [],
        amount: 12_000n,
        receiver: { External: VALID_BTC_OUTFLOW_ADDRESS },
      },
    });
    const getNonce = vi.fn().mockResolvedValue(31n);
    vi.spyOn(Actor, "createActor").mockReturnValue({
      list_pools: vi.fn().mockResolvedValue([createBtcPoolRecord()]),
      get_nonce: getNonce,
      borrow_assets: borrowAssets,
    } as never);
    const signMessage = vi.fn().mockResolvedValue("0xsigned");
    const client = new LiquidiumClient({});

    // when
    await client.lending.borrow({
      profileId: "aaaaa-aa",
      poolId: BTC_POOL_ID,
      amount: 12_000n,
      receiverAddress: VALID_BTC_OUTFLOW_ADDRESS,
      signerWalletAddress: LOWERCASE_SIGNER_ADDRESS,
      signerChain: "ETH",
      signerWalletAdapter: { signMessage },
    });

    // then
    expect(getNonce).toHaveBeenCalledWith(EXPECTED_CHECKSUM_SIGNER_ADDRESS);
    expect(signMessage).toHaveBeenCalledWith(
      expect.objectContaining({ account: EXPECTED_CHECKSUM_SIGNER_ADDRESS })
    );
    expect(borrowAssets.mock.calls[0]?.[1]).toMatchObject({
      signature_info: {
        Wallet: {
          account: EXPECTED_CHECKSUM_SIGNER_ADDRESS,
        },
      },
    });
  });

  test("should submit eth borrow signatures without the 0x prefix", async () => {
    // given
    const SIGNATURE_WITH_PREFIX =
      "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1b";
    const EXPECTED_SIGNATURE =
      "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1b";
    const borrowAssets = vi.fn().mockResolvedValue({
      Ok: {
        id: "outflow-4",
        txid: [],
        outflow_type: { Borrow: null },
        outflow_ref: [],
        amount: 12_000n,
        receiver: { External: VALID_BTC_OUTFLOW_ADDRESS },
      },
    });
    vi.spyOn(Actor, "createActor").mockReturnValue({
      list_pools: vi.fn().mockResolvedValue([createBtcPoolRecord()]),
      get_nonce: vi.fn().mockResolvedValue(31n),
      borrow_assets: borrowAssets,
    } as never);
    const signMessage = vi.fn().mockResolvedValue(SIGNATURE_WITH_PREFIX);
    const client = new LiquidiumClient({});

    // when
    await client.lending.borrow({
      profileId: "aaaaa-aa",
      poolId: BTC_POOL_ID,
      amount: 12_000n,
      receiverAddress: VALID_BTC_OUTFLOW_ADDRESS,
      signerWalletAddress: "0xsigner",
      signerChain: "ETH",
      signerWalletAdapter: { signMessage },
    });

    // then
    expect(borrowAssets.mock.calls[0]?.[1]).toMatchObject({
      signature_info: {
        Wallet: {
          signature: EXPECTED_SIGNATURE,
          chain: { ETH: null },
          account: "0xsigner",
        },
      },
    });
  });

  test("maps protocol errors for createBorrow submission", async () => {
    // given
    vi.spyOn(Actor, "createActor").mockReturnValue({
      list_pools: vi.fn().mockResolvedValue([createBtcPoolRecord()]),
      get_nonce: vi.fn().mockResolvedValue(19n),
      borrow_assets: vi.fn().mockResolvedValue({
        Err: { BorrowingDisabled: null },
      }),
    } as never);
    const client = new LiquidiumClient({});

    // when

    // then
    await expect(
      client.lending
        .prepareBorrow({
          profileId: "aaaaa-aa",
          poolId: BTC_POOL_ID,
          amount: 50_000n,
          receiverAddress: VALID_BTC_OUTFLOW_ADDRESS,
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
    const client = new LiquidiumClient({});

    // when

    // then
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
        receiverAddress: VALID_BTC_OUTFLOW_ADDRESS,
        signerWalletAddress: "  ",
      })
    ).rejects.toMatchObject({
      code: LiquidiumErrorCode.VALIDATION_ERROR,
      message: "Borrow requires a signer account",
    });
  });

  test("rejects a borrow with an invalid BTC receiver address", async () => {
    // given
    const getNonce = vi.fn().mockResolvedValue(17n);
    vi.spyOn(Actor, "createActor").mockReturnValue({
      list_pools: vi.fn().mockResolvedValue([createBtcPoolRecord()]),
      get_nonce: getNonce,
    } as never);
    const client = new LiquidiumClient({});

    // when
    const result = client.lending.prepareBorrow({
      profileId: "aaaaa-aa",
      poolId: BTC_POOL_ID,
      amount: 50_000n,
      receiverAddress: "not-a-btc-address",
      signerWalletAddress: "0xsigner",
    });

    // then
    await expect(result).rejects.toMatchObject({
      code: LiquidiumErrorCode.INVALID_ADDRESS,
      message: "Address must be a valid mainnet BTC address",
    });
    expect(getNonce).not.toHaveBeenCalled();
  });

  test("normalizes an EVM borrow receiver address", async () => {
    // given
    const getNonce = vi.fn().mockResolvedValue(17n);
    const borrowAssets = vi.fn().mockResolvedValue({
      Ok: {
        id: "outflow-evm",
        txid: [],
        outflow_type: { Borrow: null },
        outflow_ref: [],
        amount: 50_000n,
        receiver: { External: CHECKSUM_EVM_OUTFLOW_ADDRESS },
      },
    });
    vi.spyOn(Actor, "createActor").mockReturnValue({
      list_pools: vi.fn().mockResolvedValue([createUsdtPoolRecord()]),
      get_nonce: getNonce,
      borrow_assets: borrowAssets,
    } as never);
    const client = new LiquidiumClient({});

    // when
    const borrowAction = await client.lending.prepareBorrow({
      profileId: "aaaaa-aa",
      poolId: USDT_POOL_ID,
      amount: 50_000n,
      receiverAddress: LOWERCASE_EVM_OUTFLOW_ADDRESS,
      signerWalletAddress: "0xsigner",
    });
    await borrowAction.submit({ signature: "0xsigned", chain: "ETH" });

    // then
    expect(borrowAction.data.receiverAddress).toBe(
      CHECKSUM_EVM_OUTFLOW_ADDRESS
    );
    expect(borrowAction.message).toContain(
      `Address:${CHECKSUM_EVM_OUTFLOW_ADDRESS}`
    );
    expect(borrowAssets.mock.calls[0]?.[1]).toMatchObject({
      data: {
        account: { External: CHECKSUM_EVM_OUTFLOW_ADDRESS },
      },
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
        receiver: { External: VALID_BTC_OUTFLOW_ADDRESS },
      },
    });
    vi.spyOn(Actor, "createActor").mockReturnValue({
      list_pools: vi.fn().mockResolvedValue([createBtcPoolRecord()]),
      get_nonce: getNonce,
      withdraw,
    } as never);
    const client = new LiquidiumClient({});

    // when
    const withdrawAction = await client.lending.prepareWithdraw({
      profileId: "aaaaa-aa",
      poolId: BTC_POOL_ID,
      amount: 10_000n,
      receiverAddress: VALID_BTC_OUTFLOW_ADDRESS,
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
      poolId: BTC_POOL_ID,
      amount: 10_000n,
      receiverAddress: VALID_BTC_OUTFLOW_ADDRESS,
      signerWalletAddress: "0xsigner",
    });
    expect(withdrawAction.message).toBe(`Liquidium: Withdraw Assets

Action: Withdraw from pool
Pool ID: hkmli-faaaa-aaaar-qb4ba-cai
Amount: 10000
Address:${VALID_BTC_OUTFLOW_ADDRESS}
Expires: 1775001900
Nonce: 23`);
    expect(withdraw).toHaveBeenCalledTimes(1);
    expect(withdraw.mock.calls[0]?.[0]).toEqual(Principal.fromText("aaaaa-aa"));
    expect(withdraw.mock.calls[0]?.[1]).toMatchObject({
      data: {
        expiry_timestamp: 1775001900n,
        account: { External: VALID_BTC_OUTFLOW_ADDRESS },
        pool_id: Principal.fromText(BTC_POOL_ID),
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
        account: VALID_BTC_OUTFLOW_ADDRESS,
      },
    });
  });

  test("creates and executes a withdraw request directly", async () => {
    // given
    vi.spyOn(Actor, "createActor").mockReturnValue({
      list_pools: vi.fn().mockResolvedValue([createBtcPoolRecord()]),
      get_nonce: vi.fn().mockResolvedValue(37n),
      withdraw: vi.fn().mockResolvedValue({
        Ok: {
          id: "outflow-4",
          txid: [],
          outflow_type: { Withdraw: null },
          outflow_ref: [],
          amount: 8_000n,
          receiver: { External: VALID_BTC_OUTFLOW_ADDRESS },
        },
      }),
    } as never);
    const signMessage = vi.fn().mockResolvedValue("0xsigned");
    const client = new LiquidiumClient({});

    // when
    const outflow = await client.lending.withdraw({
      profileId: "aaaaa-aa",
      poolId: BTC_POOL_ID,
      amount: 8_000n,
      receiverAddress: VALID_BTC_OUTFLOW_ADDRESS,
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
      list_pools: vi.fn().mockResolvedValue([createBtcPoolRecord()]),
      get_nonce: vi.fn().mockResolvedValue(29n),
      withdraw: vi.fn().mockResolvedValue({
        Err: { InsufficientFunds: null },
      }),
    } as never);
    const client = new LiquidiumClient({});

    // when

    // then
    await expect(
      client.lending
        .prepareWithdraw({
          profileId: "aaaaa-aa",
          poolId: BTC_POOL_ID,
          amount: 10_000n,
          receiverAddress: VALID_BTC_OUTFLOW_ADDRESS,
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
    const client = new LiquidiumClient({});

    // when

    // then
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
        receiverAddress: VALID_BTC_OUTFLOW_ADDRESS,
        signerWalletAddress: "  ",
      })
    ).rejects.toMatchObject({
      code: LiquidiumErrorCode.VALIDATION_ERROR,
      message: "Withdraw requires a signer account",
    });
  });

  test("rejects a withdraw with an invalid EVM receiver address", async () => {
    // given
    const getNonce = vi.fn().mockResolvedValue(17n);
    vi.spyOn(Actor, "createActor").mockReturnValue({
      list_pools: vi.fn().mockResolvedValue([createUsdtPoolRecord()]),
      get_nonce: getNonce,
    } as never);
    const client = new LiquidiumClient({});

    // when
    const result = client.lending.prepareWithdraw({
      profileId: "aaaaa-aa",
      poolId: USDT_POOL_ID,
      amount: 10_000n,
      receiverAddress: "not-an-evm-address",
      signerWalletAddress: "0xsigner",
    });

    // then
    await expect(result).rejects.toMatchObject({
      code: LiquidiumErrorCode.INVALID_ADDRESS,
      message: "Address must be a valid EVM address",
    });
    expect(getNonce).not.toHaveBeenCalled();
  });
});

describe("InstantLoansModule", () => {
  const PROFILE_ID = "aaaaa-aa";
  const BTC_POOL_ID = "hkmli-faaaa-aaaar-qb4ba-cai";
  const USDT_POOL_ID = "hnnn4-iyaaa-aaaar-qb4bq-cai";
  const LOAN_ID = 42n;
  const VALID_BTC_REFUND_ADDRESS = "1BoatSLRHtKNngkdXEeobR76b53LETtpyT";
  const LOWERCASE_EVM_BORROW_ADDRESS =
    "0x52908400098527886e0f7030069857d2e4169ee7";
  const CHECKSUM_EVM_BORROW_ADDRESS =
    "0x52908400098527886E0F7030069857D2E4169EE7";

  test("gets canonical loan state by ref and derives flow targets", async () => {
    // given
    const getLoan = vi.fn().mockResolvedValue({ Ok: createInstantLoan() });
    const getBtcAddress = vi.fn().mockResolvedValue("bc1qinstantdeposit");
    const getDepositAddress = vi.fn().mockResolvedValue({
      Ok: "0x1111111111111111111111111111111111111111",
    });
    const getPoolRate = vi
      .fn()
      .mockResolvedValue([[10_000_000_000_000_000_000_000_000n, 0n, 0n]]);
    const estimateDepositFee = vi.fn().mockResolvedValue({ Ok: 1_500_000n });
    const getDepositFee = vi.fn().mockResolvedValue(2_000n);
    const icrc1Fee = vi.fn().mockResolvedValue(10n);
    const fetchSpy = mockInstantLoanLookupFetch({
      collateralAmount: "10000000",
    });
    const getCollateralPosition = vi.fn().mockResolvedValue([
      createInstantLoanPosition(
        BTC_POOL_ID,
        { BTC: null },
        {
          deposited_native_now: 10_000_000n,
        }
      ),
    ]);
    const getBorrowPosition = vi.fn().mockResolvedValue([
      createInstantLoanPosition(
        USDT_POOL_ID,
        { USDT: null },
        {
          debt_native_now: 2_000_000n,
          total_debt_interest: 1_000n,
        }
      ),
    ]);

    vi.spyOn(Actor, "createActor")
      .mockReturnValueOnce({ get_loan: getLoan } as never)
      .mockReturnValueOnce({
        list_pools: vi.fn().mockResolvedValue([createBtcPoolRecord()]),
      } as never)
      .mockReturnValueOnce({
        list_pools: vi.fn().mockResolvedValue([createUsdtPoolRecord()]),
      } as never)
      .mockReturnValueOnce({ get_position: getCollateralPosition } as never)
      .mockReturnValueOnce({ get_position: getBorrowPosition } as never)
      .mockReturnValueOnce({ get_pool_rate: getPoolRate } as never)
      .mockReturnValueOnce({ get_btc_address: getBtcAddress } as never)
      .mockReturnValueOnce({ get_deposit_address: getDepositAddress } as never)
      .mockReturnValueOnce({
        estimate_deposit_fee: estimateDepositFee,
      } as never)
      .mockReturnValueOnce({ get_deposit_fee: getDepositFee } as never)
      .mockReturnValueOnce({ icrc1_fee: icrc1Fee } as never);
    const client = new LiquidiumClient({
      apiBaseUrl: "https://app.liquidium.fi/api/sdk",
      canisterIds: { instantLoans: "kzrva-ziaaa-aaaar-qamyq-cai" },
    });

    // when
    const loan = await client.instantLoans.get({
      ref: publicIdFromInt(LOAN_ID),
    });

    // then
    expect(getLoan).toHaveBeenCalledWith(LOAN_ID);
    expect(fetchSpy).toHaveBeenCalledWith(
      `${DEFAULT_API_BASE_URL}/v1/instant-loans/${LOAN_ID.toString()}/collateral-amount`,
      expect.objectContaining({ method: "GET" })
    );
    expect(loan.loanId).toBe(LOAN_ID);
    expect(loan.ref).toBe(publicIdFromInt(LOAN_ID));
    expect(loan.status).toBe("active");
    expect(loan.profileId).toBe(PROFILE_ID);
    expect(loan).not.toHaveProperty("started");
    expect(loan).not.toHaveProperty("depositDetectedTimestamp");
    expect(loan.terms).toEqual({
      ltvMaxBps: 6_800n,
      depositWindowSeconds: 3_600n,
    });
    expect(loan.collateral).toMatchObject({
      poolId: BTC_POOL_ID,
      asset: "BTC",
      chain: "BTC",
      decimals: 8n,
      amount: 10_000_000n,
    });
    expect(loan.borrow).toMatchObject({
      amount: 2_000_000n,
      decimals: 6n,
    });
    expect(loan).not.toHaveProperty("depositTarget");
    expect(loan).not.toHaveProperty("repayTarget");
    expect(loan.initialDeposit).toMatchObject({
      amount: 10_002_010n,
      decimals: 8n,
      collateralAmount: 10_000_000n,
      inflowFeeAmount: 2_010n,
      asset: "BTC",
      chain: "BTC",
      target: expect.objectContaining({
        address: "bc1qinstantdeposit",
      }),
    });
    expect(loan.repayment).toMatchObject({
      amount: 3_501_054n,
      decimals: 6n,
      debtAmount: 2_001_000n,
      interestBufferAmount: 54n,
      interestBufferSeconds: 86_400n,
      inflowFeeAmount: 1_500_000n,
      inflowFeeEstimateAvailable: true,
      asset: "USDT",
      chain: "ETH",
      target: expect.objectContaining({
        type: "nativeAddress",
        asset: "USDT",
        chain: "ETH",
        address: "0x1111111111111111111111111111111111111111",
      }),
    });
    expect(loan.position).toMatchObject({
      collateralAmount: 10_000_000n,
      collateralDecimals: 8n,
      borrowedAmount: 2_000_000n,
      borrowedDecimals: 6n,
      debtInterestAmount: 1_000n,
      totalDebtAmount: 2_001_000n,
    });
  });

  test("includes btc inflow fee in the instant loan repayment quote", async () => {
    // given
    const getLoan = vi.fn().mockResolvedValue({
      Ok: createBtcBorrowInstantLoan(),
    });
    const getDepositAddress = vi.fn().mockResolvedValue({
      Ok: "0x1111111111111111111111111111111111111111",
    });
    const getBtcAddress = vi.fn().mockResolvedValue("bc1qrepaybtc");
    const getPoolRate = vi
      .fn()
      .mockResolvedValue([[10_000_000_000_000_000_000_000_000n, 0n, 0n]]);
    const getCollateralPosition = vi.fn().mockResolvedValue([
      createInstantLoanPosition(
        USDT_POOL_ID,
        { USDT: null },
        {
          deposited_native_now: 5_000_000n,
        }
      ),
    ]);
    const getBorrowPosition = vi.fn().mockResolvedValue([
      createInstantLoanPosition(
        BTC_POOL_ID,
        { BTC: null },
        {
          debt_native_now: 1_000_000n,
          total_debt_interest: 500n,
        }
      ),
    ]);
    const getDepositFee = vi.fn().mockResolvedValue(2_000n);
    const icrc1Fee = vi.fn().mockResolvedValue(10n);
    const estimateDepositFee = vi.fn().mockResolvedValue({ Ok: 1_500_000n });
    mockInstantLoanLookupFetch({
      borrowAsset: "BTC",
      borrowPoolId: BTC_POOL_ID,
      collateralAmount: "5000000",
      collateralAsset: "USDT",
      collateralPoolId: USDT_POOL_ID,
    });

    vi.spyOn(Actor, "createActor")
      .mockReturnValueOnce({ get_loan: getLoan } as never)
      .mockReturnValueOnce({
        list_pools: vi.fn().mockResolvedValue([createUsdtPoolRecord()]),
      } as never)
      .mockReturnValueOnce({
        list_pools: vi.fn().mockResolvedValue([createBtcPoolRecord()]),
      } as never)
      .mockReturnValueOnce({ get_position: getCollateralPosition } as never)
      .mockReturnValueOnce({ get_position: getBorrowPosition } as never)
      .mockReturnValueOnce({ get_pool_rate: getPoolRate } as never)
      .mockReturnValueOnce({ get_deposit_address: getDepositAddress } as never)
      .mockReturnValueOnce({ get_btc_address: getBtcAddress } as never)
      .mockReturnValueOnce({ get_deposit_fee: getDepositFee } as never)
      .mockReturnValueOnce({ icrc1_fee: icrc1Fee } as never)
      .mockReturnValueOnce({
        estimate_deposit_fee: estimateDepositFee,
      } as never);
    const client = new LiquidiumClient({
      apiBaseUrl: "https://app.liquidium.fi/api/sdk",
      canisterIds: { instantLoans: "kzrva-ziaaa-aaaar-qamyq-cai" },
    });

    // when
    const loan = await client.instantLoans.get({
      ref: publicIdFromInt(LOAN_ID),
    });

    // then
    expect(loan.repayment).toMatchObject({
      amount: 1_002_537n,
      decimals: 8n,
      debtAmount: 1_000_500n,
      interestBufferAmount: 27n,
      inflowFeeAmount: 2_010n,
      inflowFeeEstimateAvailable: true,
      asset: "BTC",
      chain: "BTC",
    });
    expect(loan.initialDeposit).toMatchObject({
      amount: 6_500_000n,
      decimals: 6n,
      collateralAmount: 5_000_000n,
      inflowFeeAmount: 1_500_000n,
      asset: "USDT",
      chain: "ETH",
    });
    expect(getDepositFee).toHaveBeenCalledWith();
    expect(icrc1Fee).toHaveBeenCalledWith();
  });

  test("calls public instant-loan query methods directly on the canister", async () => {
    // given
    const getConfig = vi.fn().mockResolvedValue({
      lending_canister: Principal.fromText("aaaaa-aa"),
    });
    const getEvent = vi.fn().mockResolvedValue([createLoanCreatedEvent()]);
    const listEvents = vi
      .fn()
      .mockResolvedValue([[1n, createLoanCreatedEvent()]]);
    const listAccessList = vi
      .fn()
      .mockResolvedValue([Principal.fromText("aaaaa-aa")]);
    const countWarmedProfiles = vi.fn().mockResolvedValue(2n);
    const listWarmedProfiles = vi.fn().mockResolvedValue([
      {
        id: 7n,
        authorisation: {
          EthSignature: {
            derivation_index: new Uint8Array([1]),
            pubkey: new Uint8Array([2]),
            address: "0x1111111111111111111111111111111111111111",
          },
        },
        created_at: 123n,
        lending_profile: Principal.fromText(PROFILE_ID),
      },
    ]);
    vi.spyOn(Actor, "createActor").mockReturnValue({
      count_warmed_profiles: countWarmedProfiles,
      get_config: getConfig,
      get_event: getEvent,
      list_access_list: listAccessList,
      list_events: listEvents,
      list_warmed_profiles: listWarmedProfiles,
    } as never);
    const client = new LiquidiumClient({
      canisterIds: { instantLoans: "kzrva-ziaaa-aaaar-qamyq-cai" },
    });

    // when
    const config = await client.instantLoans.getConfig();
    const event = await client.instantLoans.getEvent(1n);
    const events = await client.instantLoans.listEvents({
      start: 1n,
      limit: 10n,
    });
    const accessList = await client.instantLoans.listAccessList();
    const warmedProfileCount = await client.instantLoans.countWarmedProfiles();
    const warmedProfiles = await client.instantLoans.listWarmedProfiles();

    // then
    expect(getConfig).toHaveBeenCalledWith();
    expect(getEvent).toHaveBeenCalledWith(1n);
    expect(listEvents).toHaveBeenCalledWith(1n, 10n);
    expect(listAccessList).toHaveBeenCalledWith();
    expect(countWarmedProfiles).toHaveBeenCalledWith();
    expect(listWarmedProfiles).toHaveBeenCalledWith();
    expect(config).toEqual({ lendingCanisterId: "aaaaa-aa" });
    expect(event).toMatchObject({
      id: 1n,
      eventType: {
        type: "LoanCreated",
        loanId: LOAN_ID,
        collateralAsset: "BTC",
        borrowAsset: "USDT",
      },
    });
    expect(events).toHaveLength(1);
    expect(accessList).toEqual(["aaaaa-aa"]);
    expect(warmedProfileCount).toBe(2n);
    expect(warmedProfiles).toEqual([
      {
        id: 7n,
        authorization: {
          type: "EthSignature",
          derivationIndex: new Uint8Array([1]),
          publicKey: new Uint8Array([2]),
          address: "0x1111111111111111111111111111111111111111",
        },
        createdAt: 123n,
        profileId: PROFILE_ID,
      },
    ]);
  });

  test("returns zero repayment quote when the loan has no debt", async () => {
    // given
    const getLoan = vi.fn().mockResolvedValue({ Ok: createInstantLoan() });
    const getBtcAddress = vi.fn().mockResolvedValue("bc1qinstantdeposit");
    const getDepositAddress = vi.fn().mockResolvedValue({
      Ok: "0x1111111111111111111111111111111111111111",
    });
    const getPoolRate = vi
      .fn()
      .mockResolvedValue([[10_000_000_000_000_000_000_000_000n, 0n, 0n]]);
    const estimateDepositFee = vi.fn().mockResolvedValue({ Ok: 1_500_000n });
    const getDepositFee = vi.fn().mockResolvedValue(2_000n);
    const icrc1Fee = vi.fn().mockResolvedValue(10n);
    mockInstantLoanLookupFetch({
      collateralAmount: "10000000",
    });

    vi.spyOn(Actor, "createActor")
      .mockReturnValueOnce({ get_loan: getLoan } as never)
      .mockReturnValueOnce({
        list_pools: vi.fn().mockResolvedValue([createBtcPoolRecord()]),
      } as never)
      .mockReturnValueOnce({
        list_pools: vi.fn().mockResolvedValue([createUsdtPoolRecord()]),
      } as never)
      .mockReturnValueOnce({
        get_position: vi.fn().mockResolvedValue([]),
      } as never)
      .mockReturnValueOnce({
        get_position: vi.fn().mockResolvedValue([]),
      } as never)
      .mockReturnValueOnce({ get_pool_rate: getPoolRate } as never)
      .mockReturnValueOnce({ get_btc_address: getBtcAddress } as never)
      .mockReturnValueOnce({ get_deposit_address: getDepositAddress } as never)
      .mockReturnValueOnce({ get_deposit_fee: getDepositFee } as never)
      .mockReturnValueOnce({ icrc1_fee: icrc1Fee } as never);
    const client = new LiquidiumClient({
      apiBaseUrl: "https://app.liquidium.fi/api/sdk",
      canisterIds: { instantLoans: "kzrva-ziaaa-aaaar-qamyq-cai" },
    });

    // when
    const loan = await client.instantLoans.get({
      ref: publicIdFromInt(LOAN_ID),
    });

    // then
    expect(loan.repayment).toMatchObject({
      amount: 0n,
      debtAmount: 0n,
      interestBufferAmount: 0n,
      inflowFeeAmount: 0n,
      inflowFeeEstimateAvailable: false,
      asset: "USDT",
      chain: "ETH",
    });
    expect(loan.initialDeposit.amount).toBe(10_002_010n);
    expect(loan.status).toBe("awaiting_deposit");
    expect(estimateDepositFee).not.toHaveBeenCalled();
  });

  test("returns expired status when the deposit window passed before collateral arrived", async () => {
    // given
    const ONE_SECOND_MS = 1_000;
    const NANOSECONDS_PER_MILLISECOND = 1_000_000n;
    const EXPIRED_DEPOSIT_TIMESTAMP_NS =
      BigInt(Date.now() - ONE_SECOND_MS) * NANOSECONDS_PER_MILLISECOND;
    const getLoan = vi.fn().mockResolvedValue({
      Ok: {
        ...createInstantLoan(),
        expires_at: [EXPIRED_DEPOSIT_TIMESTAMP_NS],
      },
    });
    const getBtcAddress = vi.fn().mockResolvedValue("bc1qinstantdeposit");
    const getDepositAddress = vi.fn().mockResolvedValue({
      Ok: "0x1111111111111111111111111111111111111111",
    });
    const getPoolRate = vi
      .fn()
      .mockResolvedValue([[10_000_000_000_000_000_000_000_000n, 0n, 0n]]);
    const estimateDepositFee = vi.fn().mockResolvedValue({ Ok: 1_500_000n });
    const getDepositFee = vi.fn().mockResolvedValue(2_000n);
    const icrc1Fee = vi.fn().mockResolvedValue(10n);
    mockInstantLoanLookupFetch({
      collateralAmount: "10000000",
    });

    vi.spyOn(Actor, "createActor")
      .mockReturnValueOnce({ get_loan: getLoan } as never)
      .mockReturnValueOnce({
        list_pools: vi.fn().mockResolvedValue([createBtcPoolRecord()]),
      } as never)
      .mockReturnValueOnce({
        list_pools: vi.fn().mockResolvedValue([createUsdtPoolRecord()]),
      } as never)
      .mockReturnValueOnce({
        get_position: vi.fn().mockResolvedValue([]),
      } as never)
      .mockReturnValueOnce({
        get_position: vi.fn().mockResolvedValue([]),
      } as never)
      .mockReturnValueOnce({ get_pool_rate: getPoolRate } as never)
      .mockReturnValueOnce({ get_btc_address: getBtcAddress } as never)
      .mockReturnValueOnce({ get_deposit_address: getDepositAddress } as never)
      .mockReturnValueOnce({ get_deposit_fee: getDepositFee } as never)
      .mockReturnValueOnce({ icrc1_fee: icrc1Fee } as never);
    const client = new LiquidiumClient({
      apiBaseUrl: "https://app.liquidium.fi/api/sdk",
      canisterIds: { instantLoans: "kzrva-ziaaa-aaaar-qamyq-cai" },
    });

    // when
    const loan = await client.instantLoans.get({
      ref: publicIdFromInt(LOAN_ID),
    });

    // then
    expect(loan.status).toBe("expired");
    expect(loan.repayment).toMatchObject({
      amount: 0n,
      debtAmount: 0n,
      interestBufferAmount: 0n,
      inflowFeeAmount: 0n,
      inflowFeeEstimateAvailable: false,
      asset: "USDT",
      chain: "ETH",
    });
    expect(estimateDepositFee).not.toHaveBeenCalled();
  });

  test("creates a loan through the default SDK API without calling the instant-loans canister", async () => {
    // given
    const BTC_MINTER_DEPOSIT_FEE_SATS = 2_000n;
    const CKBTC_LEDGER_FEE_SATS = 10n;
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          loan: {
            loanId: LOAN_ID.toString(),
            ref: publicIdFromInt(LOAN_ID),
            profileId: PROFILE_ID,
            ltvMaxBps: "6800",
            depositWindowSeconds: "3600",
            collateral: {
              poolId: BTC_POOL_ID,
              asset: "BTC",
              amount: "10000000",
            },
            borrow: {
              poolId: USDT_POOL_ID,
              asset: "USDT",
              amount: "5726000000",
              destination: {
                External: "0x2222222222222222222222222222222222222222",
              },
            },
            refundDestination: { External: VALID_BTC_REFUND_ADDRESS },
          },
        }),
        { status: 200, headers: { "content-type": "application/json" } }
      )
    );

    const actorCreateSpy = vi
      .spyOn(Actor, "createActor")
      .mockReturnValueOnce({
        list_pools: vi
          .fn()
          .mockResolvedValue([
            createBtcPoolRecord({ max_ltv: 6_500n }),
            createUsdtPoolRecord(),
          ]),
        get_pool_rate: vi
          .fn()
          .mockResolvedValue([[10_000_000_000_000_000_000_000_000n, 0n, 0n]]),
      } as never)
      .mockReturnValueOnce({
        get_prices: vi.fn().mockResolvedValue(prices()),
      } as never)
      .mockReturnValueOnce({
        list_pools: vi.fn().mockResolvedValue([createBtcPoolRecord()]),
      } as never)
      .mockReturnValueOnce({
        list_pools: vi.fn().mockResolvedValue([createUsdtPoolRecord()]),
      } as never)
      .mockReturnValueOnce({
        get_position: vi.fn().mockResolvedValue([]),
      } as never)
      .mockReturnValueOnce({
        get_position: vi.fn().mockResolvedValue([]),
      } as never)
      .mockReturnValueOnce({
        get_pool_rate: vi
          .fn()
          .mockResolvedValue([[10_000_000_000_000_000_000_000_000n, 0n, 0n]]),
      } as never)
      .mockReturnValueOnce({
        get_btc_address: vi.fn().mockResolvedValue("bc1qinstantdeposit"),
      } as never)
      .mockReturnValueOnce({
        get_deposit_address: vi.fn().mockResolvedValue({
          Ok: "0x1111111111111111111111111111111111111111",
        }),
      } as never)
      .mockReturnValueOnce({
        get_deposit_fee: vi.fn().mockResolvedValue(BTC_MINTER_DEPOSIT_FEE_SATS),
      } as never)
      .mockReturnValueOnce({
        icrc1_fee: vi.fn().mockResolvedValue(CKBTC_LEDGER_FEE_SATS),
      } as never);
    const client = new LiquidiumClient({
      canisterIds: { instantLoans: "kzrva-ziaaa-aaaar-qamyq-cai" },
    });

    // when
    const loan = await client.instantLoans.create({
      collateralPoolId: BTC_POOL_ID,
      borrowPoolId: USDT_POOL_ID,
      collateralAsset: "BTC",
      borrowAsset: "USDT",
      collateralAmount: 10_000_000n,
      borrowAmount: 5_726_000_000n,
      ltvMaxBps: 6_000n,
      depositWindowSeconds: 3_600n,
      borrowDestination: {
        type: "External",
        address: LOWERCASE_EVM_BORROW_ADDRESS,
      },
      refundDestination: VALID_BTC_REFUND_ADDRESS,
    });

    // then
    const EXPECTED_INITIAL_DEPOSIT_AMOUNT_SATS =
      10_000_000n + BTC_MINTER_DEPOSIT_FEE_SATS + CKBTC_LEDGER_FEE_SATS;

    expect(fetchSpy).toHaveBeenCalledWith(
      `${DEFAULT_API_BASE_URL}/v1/instant-loans`,
      expect.objectContaining({
        body: JSON.stringify({
          collateralPoolId: BTC_POOL_ID,
          borrowPoolId: USDT_POOL_ID,
          collateralAsset: "BTC",
          borrowAsset: "USDT",
          collateralAmount: "10000000",
          borrowAmount: "5726000000",
          ltvMaxBps: "6000",
          depositWindowSeconds: "3600",
          borrowDestination: {
            External: CHECKSUM_EVM_BORROW_ADDRESS,
          },
          refundDestination: { External: VALID_BTC_REFUND_ADDRESS },
        }),
        method: "POST",
      })
    );
    expect(actorCreateSpy).not.toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ canisterId: "kzrva-ziaaa-aaaar-qamyq-cai" })
    );
    expect(loan.loanId).toBe(LOAN_ID);
    expect(loan.status).toBe("awaiting_deposit");
    expect(loan.collateral.amount).toBe(10_000_000n);
    expect(loan.terms).toEqual({
      ltvMaxBps: 6_800n,
      depositWindowSeconds: 3_600n,
    });
    expect(loan.repayment).toMatchObject({
      amount: 0n,
      debtAmount: 0n,
      interestBufferAmount: 0n,
      inflowFeeAmount: 0n,
      inflowFeeEstimateAvailable: false,
      asset: "USDT",
      chain: "ETH",
    });
    expect(loan.initialDeposit).toMatchObject({
      amount: EXPECTED_INITIAL_DEPOSIT_AMOUNT_SATS,
      decimals: 8n,
      collateralAmount: 10_000_000n,
      inflowFeeAmount: BTC_MINTER_DEPOSIT_FEE_SATS + CKBTC_LEDGER_FEE_SATS,
      asset: "BTC",
      chain: "BTC",
      target: expect.objectContaining({
        address: "bc1qinstantdeposit",
      }),
    });
  });

  test("rejects an instant loan with an invalid BTC refund destination", async () => {
    // given
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const actorCreateSpy = vi.spyOn(Actor, "createActor");
    const client = new LiquidiumClient({});

    // when
    const result = client.instantLoans.create({
      collateralPoolId: BTC_POOL_ID,
      borrowPoolId: USDT_POOL_ID,
      collateralAsset: "BTC",
      borrowAsset: "USDT",
      collateralAmount: 10_000_000n,
      borrowAmount: 5_726_000_000n,
      ltvMaxBps: 6_000n,
      depositWindowSeconds: 3_600n,
      borrowDestination: CHECKSUM_EVM_BORROW_ADDRESS,
      refundDestination: "bc1qrefunddestination",
    });

    // then
    await expect(result).rejects.toMatchObject({
      code: LiquidiumErrorCode.INVALID_ADDRESS,
      message: "Address must be a valid mainnet BTC address",
    });
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(actorCreateSpy).not.toHaveBeenCalled();
  });

  test("rejects an instant loan with an invalid EVM borrow destination", async () => {
    // given
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const actorCreateSpy = vi.spyOn(Actor, "createActor");
    const client = new LiquidiumClient({});

    // when
    const result = client.instantLoans.create({
      collateralPoolId: BTC_POOL_ID,
      borrowPoolId: USDT_POOL_ID,
      collateralAsset: "BTC",
      borrowAsset: "USDT",
      collateralAmount: 10_000_000n,
      borrowAmount: 5_726_000_000n,
      ltvMaxBps: 6_000n,
      depositWindowSeconds: 3_600n,
      borrowDestination: "not-an-evm-address",
      refundDestination: VALID_BTC_REFUND_ADDRESS,
    });

    // then
    await expect(result).rejects.toMatchObject({
      code: LiquidiumErrorCode.INVALID_ADDRESS,
      message: "Address must be a valid EVM address",
    });
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(actorCreateSpy).not.toHaveBeenCalled();
  });

  test("rejects an instant loan with an invalid BTC borrow destination", async () => {
    // given
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const actorCreateSpy = vi.spyOn(Actor, "createActor");
    const client = new LiquidiumClient({});

    // when
    const result = client.instantLoans.create({
      collateralPoolId: USDT_POOL_ID,
      borrowPoolId: BTC_POOL_ID,
      collateralAsset: "USDT",
      borrowAsset: "BTC",
      collateralAmount: 5_726_000_000n,
      borrowAmount: 10_000_000n,
      ltvMaxBps: 6_000n,
      depositWindowSeconds: 3_600n,
      borrowDestination: "tb1qnotmainnet",
      refundDestination: CHECKSUM_EVM_BORROW_ADDRESS,
    });

    // then
    await expect(result).rejects.toMatchObject({
      code: LiquidiumErrorCode.INVALID_ADDRESS,
      message: "Address must be a valid mainnet BTC address",
    });
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(actorCreateSpy).not.toHaveBeenCalled();
  });

  test("rejects an instant loan with an invalid EVM refund destination", async () => {
    // given
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const actorCreateSpy = vi.spyOn(Actor, "createActor");
    const client = new LiquidiumClient({});

    // when
    const result = client.instantLoans.create({
      collateralPoolId: USDT_POOL_ID,
      borrowPoolId: BTC_POOL_ID,
      collateralAsset: "USDT",
      borrowAsset: "BTC",
      collateralAmount: 5_726_000_000n,
      borrowAmount: 10_000_000n,
      ltvMaxBps: 6_000n,
      depositWindowSeconds: 3_600n,
      borrowDestination: VALID_BTC_REFUND_ADDRESS,
      refundDestination: "not-an-evm-address",
    });

    // then
    await expect(result).rejects.toMatchObject({
      code: LiquidiumErrorCode.INVALID_ADDRESS,
      message: "Address must be a valid EVM address",
    });
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(actorCreateSpy).not.toHaveBeenCalled();
  });

  test("rejects a loan when current LTV plus slippage exceeds the pool max", async () => {
    // given
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    vi.spyOn(Actor, "createActor")
      .mockReturnValueOnce({
        list_pools: vi
          .fn()
          .mockResolvedValue([
            createBtcPoolRecord({ max_ltv: 6_500n }),
            createUsdtPoolRecord(),
          ]),
        get_pool_rate: vi
          .fn()
          .mockResolvedValue([[10_000_000_000_000_000_000_000_000n, 0n, 0n]]),
      } as never)
      .mockReturnValueOnce({
        get_prices: vi.fn().mockResolvedValue(prices()),
      } as never);
    const client = new LiquidiumClient({
      apiBaseUrl: "https://app.liquidium.fi/api/sdk",
      canisterIds: { instantLoans: "kzrva-ziaaa-aaaar-qamyq-cai" },
    });

    // when
    const result = client.instantLoans.create({
      collateralPoolId: BTC_POOL_ID,
      borrowPoolId: USDT_POOL_ID,
      collateralAsset: "BTC",
      borrowAsset: "USDT",
      collateralAmount: 10_000_000n,
      borrowAmount: 6_500_000_000n,
      ltvMaxBps: 6_500n,
      depositWindowSeconds: 3_600n,
      borrowDestination: "0x2222222222222222222222222222222222222222",
      refundDestination: VALID_BTC_REFUND_ADDRESS,
    });

    // then
    await expect(result).rejects.toMatchObject({
      code: LiquidiumErrorCode.VALIDATION_ERROR,
      message:
        "Instant loan max LTV 65.00% is below minimum allowed 67.00% (current implied LTV 65.00% + 2.00% buffer)",
    });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  test("rejects a loan when max LTV is below the slippage minimum", async () => {
    // given
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    vi.spyOn(Actor, "createActor")
      .mockReturnValueOnce({
        list_pools: vi
          .fn()
          .mockResolvedValue([
            createBtcPoolRecord({ max_ltv: 6_500n }),
            createUsdtPoolRecord(),
          ]),
        get_pool_rate: vi
          .fn()
          .mockResolvedValue([[10_000_000_000_000_000_000_000_000n, 0n, 0n]]),
      } as never)
      .mockReturnValueOnce({
        get_prices: vi.fn().mockResolvedValue(prices()),
      } as never);
    const client = new LiquidiumClient({
      apiBaseUrl: "https://app.liquidium.fi/api/sdk",
      canisterIds: { instantLoans: "kzrva-ziaaa-aaaar-qamyq-cai" },
    });

    // when
    const result = client.instantLoans.create({
      collateralPoolId: BTC_POOL_ID,
      borrowPoolId: USDT_POOL_ID,
      collateralAsset: "BTC",
      borrowAsset: "USDT",
      collateralAmount: 10_000_000n,
      borrowAmount: 5_726_000_000n,
      ltvMaxBps: 5_925n,
      depositWindowSeconds: 3_600n,
      borrowDestination: "0x2222222222222222222222222222222222222222",
      refundDestination: VALID_BTC_REFUND_ADDRESS,
    });

    // then
    await expect(result).rejects.toMatchObject({
      code: LiquidiumErrorCode.VALIDATION_ERROR,
      message:
        "Instant loan max LTV 59.25% is below minimum allowed 59.26% (current implied LTV 57.26% + 2.00% buffer)",
    });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  test("rejects a loan when max LTV exceeds the collateral pool max", async () => {
    // given
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    vi.spyOn(Actor, "createActor")
      .mockReturnValueOnce({
        list_pools: vi
          .fn()
          .mockResolvedValue([createBtcPoolRecord(), createUsdtPoolRecord()]),
        get_pool_rate: vi
          .fn()
          .mockResolvedValue([[10_000_000_000_000_000_000_000_000n, 0n, 0n]]),
      } as never)
      .mockReturnValueOnce({
        get_prices: vi.fn().mockResolvedValue(prices()),
      } as never);
    const client = new LiquidiumClient({
      apiBaseUrl: "https://app.liquidium.fi/api/sdk",
      canisterIds: { instantLoans: "kzrva-ziaaa-aaaar-qamyq-cai" },
    });

    // when
    const result = client.instantLoans.create({
      collateralPoolId: BTC_POOL_ID,
      borrowPoolId: USDT_POOL_ID,
      collateralAsset: "BTC",
      borrowAsset: "USDT",
      collateralAmount: 10_000_000n,
      borrowAmount: 2_000_000n,
      ltvMaxBps: 7_001n,
      depositWindowSeconds: 3_600n,
      borrowDestination: "0x2222222222222222222222222222222222222222",
      refundDestination: VALID_BTC_REFUND_ADDRESS,
    });

    // then
    await expect(result).rejects.toMatchObject({
      code: LiquidiumErrorCode.MAX_LTV_EXCEEDED,
    });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  test("finds loan candidates by address through the SDK API", async () => {
    // given
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          candidates: [
            {
              loan_id: LOAN_ID.toString(),
              short_ref: publicIdFromInt(LOAN_ID),
              lending_profile: PROFILE_ID,
              lend_pool_ic_id: BTC_POOL_ID,
              borrow_pool_ic_id: USDT_POOL_ID,
              lend_asset: "BTC",
              borrow_asset: "USDT",
              collateralAmount: "10000000",
            },
          ],
        }),
        { status: 200, headers: { "content-type": "application/json" } }
      )
    );
    const client = new LiquidiumClient({
      apiBaseUrl: "https://app.liquidium.fi/api/sdk",
    });

    // when
    const candidates = await client.instantLoans.findByAddress("bc1qrecover");

    // then
    expect(candidates).toEqual([
      expect.objectContaining({
        loanId: LOAN_ID,
        ref: publicIdFromInt(LOAN_ID),
        profileId: PROFILE_ID,
        collateralAsset: "BTC",
        collateralAmount: 10_000_000n,
        borrowAsset: "USDT",
      }),
    ]);
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://app.liquidium.fi/api/sdk/v1/instant-loans/address?address=bc1qrecover",
      expect.objectContaining({ method: "GET" })
    );
  });

  function createInstantLoan() {
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
        External: "0x2222222222222222222222222222222222222222",
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
    };
  }

  function mockInstantLoanLookupFetch(
    overrides: Partial<{
      borrowAsset: string;
      borrowPoolId: string;
      collateralAmount: string;
      collateralAsset: string;
      collateralPoolId: string;
    }> = {}
  ) {
    return vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          collateralAmount: overrides.collateralAmount ?? "10000000",
        }),
        { status: 200, headers: { "content-type": "application/json" } }
      )
    );
  }

  function createBtcBorrowInstantLoan() {
    return {
      ...createInstantLoan(),
      borrow_destination: { External: VALID_BTC_REFUND_ADDRESS },
      borrow_amount: 1_000_000n,
      lend_asset: { USDT: null },
      lend_pool_id: Principal.fromText(USDT_POOL_ID),
      refund_destination: { External: CHECKSUM_EVM_BORROW_ADDRESS },
      borrow_pool_id: Principal.fromText(BTC_POOL_ID),
      borrow_asset: { BTC: null },
    };
  }

  function createLoanCreatedEvent() {
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

  function createInstantLoanPosition(
    poolId: string,
    asset: { BTC: null } | { USDT: null },
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

  function prices() {
    return [
      ["BTC_USDT", 10_000_000n, 2],
      ["USDT_USDT", 100n, 2],
    ];
  }

  function createBtcPoolRecord(overrides = {}) {
    return {
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
      ...overrides,
    };
  }

  function createUsdtPoolRecord() {
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
});
