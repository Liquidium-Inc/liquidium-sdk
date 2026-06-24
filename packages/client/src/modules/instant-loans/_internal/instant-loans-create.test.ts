import { Actor } from "@icp-sdk/core/agent";
import { afterEach, describe, expect, test, vi } from "vitest";
import { DEFAULT_API_BASE_URL } from "../../../core/config";
import { LiquidiumClient, LiquidiumErrorCode } from "../../../index";
import {
  BTC_POOL_ID,
  CHECKSUM_EVM_BORROW_ADDRESS,
  createBtcPoolRecord,
  createInstantLoan,
  createUsdtPoolRecord,
  LOAN_ID,
  LOWERCASE_EVM_BORROW_ADDRESS,
  prices,
  USDT_POOL_ID,
  VALID_BTC_REFUND_ADDRESS,
} from "./test-fixtures";

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("InstantLoansModule create", () => {
  test("creates a loan through the default SDK API and hydrates canonical canister state", async () => {
    // given
    const BTC_MINTER_DEPOSIT_FEE_SATS = 2_000n;
    const CKBTC_LEDGER_FEE_SATS = 10n;
    const EXPIRY_TIMESTAMP_SECONDS = 1_775_235_600n;
    const getLoan = vi.fn().mockResolvedValue({
      Ok: createInstantLoan({ expires_at: [EXPIRY_TIMESTAMP_SECONDS] }),
    });
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(async (input, init) => {
        const url = input.toString();
        if (init?.method === "POST") {
          return new Response(
            JSON.stringify({
              success: true,
              loan: {
                loanId: LOAN_ID.toString(),
                collateral: {
                  amountHint: "10000000",
                },
              },
            }),
            { status: 200, headers: { "content-type": "application/json" } }
          );
        }
        if (url.includes("/activities?")) {
          return new Response(JSON.stringify({ activities: [] }), {
            status: 200,
            headers: { "content-type": "application/json" },
          });
        }

        return new Response(JSON.stringify({ error: "not found" }), {
          status: 404,
          headers: { "content-type": "application/json" },
        });
      });

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
      } as never)
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
    const EXPECTED_INITIAL_DEPOSIT_AMOUNT_SATS = 10_000_000n + 2_500n;

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
    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(getLoan).toHaveBeenCalledWith(LOAN_ID);
    expect(loan.loanId).toBe(LOAN_ID);
    expect(loan.status).toEqual({
      operation: "deposit",
      state: "action_required",
      confirmations: null,
      requiredConfirmations: null,
    });
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
      inflowFeeAmount: 2_500n,
      asset: "BTC",
      chain: "BTC",
      detectedTimestamp: null,
      expiryTimestamp: EXPIRY_TIMESTAMP_SECONDS,
      target: expect.objectContaining({
        address: "bc1qinstantdeposit",
      }),
    });
  });

  test("rejects an instant loan with a borrow amount below the asset minimum", async () => {
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
    const client = new LiquidiumClient({});

    // when
    const result = client.instantLoans.create({
      collateralPoolId: BTC_POOL_ID,
      borrowPoolId: USDT_POOL_ID,
      collateralAsset: "BTC",
      borrowAsset: "USDT",
      collateralAmount: 10_000_000n,
      borrowAmount: 999_999n,
      ltvMaxBps: 6_000n,
      depositWindowSeconds: 3_600n,
      borrowDestination: CHECKSUM_EVM_BORROW_ADDRESS,
      refundDestination: VALID_BTC_REFUND_ADDRESS,
    });

    // then
    await expect(result).rejects.toMatchObject({
      code: LiquidiumErrorCode.VALIDATION_ERROR,
      message: "Borrow amount must be at least 1000000 base units for USDT",
    });
    expect(fetchSpy).not.toHaveBeenCalled();
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
});
