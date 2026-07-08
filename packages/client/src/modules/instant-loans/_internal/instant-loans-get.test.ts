import { Actor } from "@icp-sdk/core/agent";
import { Principal } from "@icp-sdk/core/principal";
import { afterEach, describe, expect, test, vi } from "vitest";
import { DEFAULT_API_BASE_URL } from "../../../core/config";
import { LiquidiumClient, publicIdFromInt } from "../../../index";
import {
  BTC_POOL_ID,
  createBtcBorrowInstantLoan,
  createBtcPoolRecord,
  createInstantLoan,
  createInstantLoanPosition,
  createUsdtPoolRecord,
  encodeIcrcAccount,
  ICRC_SUBACCOUNT,
  LOAN_ID,
  mockInstantLoanCollateralHintFetch,
  PROFILE_ID,
  USDT_POOL_ID,
} from "./test-fixtures";

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("InstantLoansModule get", () => {
  test("gets canonical loan state by ref and derives flow targets", async () => {
    // given
    const DEPOSIT_DETECTED_TIMESTAMP_SECONDS = 1_775_232_000n;
    const EXPIRY_TIMESTAMP_SECONDS = 1_775_235_600n;
    const getLoan = vi.fn().mockResolvedValue({
      Ok: createInstantLoan({
        borrow_destination: { Native: Principal.fromText(PROFILE_ID) },
        refund_destination: {
          Icrc: {
            owner: Principal.fromText(PROFILE_ID),
            subaccount: [ICRC_SUBACCOUNT],
          },
        },
        deposit_detected_ts: [DEPOSIT_DETECTED_TIMESTAMP_SECONDS],
        expires_at: [EXPIRY_TIMESTAMP_SECONDS],
      }),
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
    const fetchSpy = mockInstantLoanCollateralHintFetch({
      collateralAmountHint: "10000000",
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
      `${DEFAULT_API_BASE_URL}/v1/instant-loans/${LOAN_ID.toString()}/collateral-hint`,
      expect.objectContaining({ method: "GET" })
    );
    expect(loan.loanId).toBe(LOAN_ID);
    expect(loan.ref).toBe(publicIdFromInt(LOAN_ID));
    expect(loan.status).toEqual({
      operation: "repayment",
      state: "active",
      confirmations: null,
      requiredConfirmations: null,
    });
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
      destination: {
        type: "IcPrincipal",
        principal: PROFILE_ID,
      },
    });
    expect(loan.refundDestination).toEqual({
      type: "IcrcAccount",
      owner: PROFILE_ID,
      subaccount: ICRC_SUBACCOUNT,
      address: encodeIcrcAccount({
        owner: Principal.fromText(PROFILE_ID),
        subaccount: ICRC_SUBACCOUNT,
      }),
    });
    expect(loan).not.toHaveProperty("depositTarget");
    expect(loan).not.toHaveProperty("repayTarget");
    expect(loan.initialDeposit).toMatchObject({
      amount: 10_002_500n,
      decimals: 8n,
      collateralAmount: 10_000_000n,
      inflowFeeAmount: 2_500n,
      asset: "BTC",
      chain: "BTC",
      detectedTimestamp: DEPOSIT_DETECTED_TIMESTAMP_SECONDS,
      expiryTimestamp: EXPIRY_TIMESTAMP_SECONDS,
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
        type: "ChainAddress",
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
  test("should derive initial deposit expiry from detection timestamp when canister expiry is absent", async () => {
    // given
    const DEPOSIT_DETECTED_TIMESTAMP_SECONDS = 1_780_920_469n;
    const DEPOSIT_WINDOW_SECONDS = 3_600n;
    const EXPECTED_EXPIRY_TIMESTAMP_SECONDS =
      DEPOSIT_DETECTED_TIMESTAMP_SECONDS + DEPOSIT_WINDOW_SECONDS;
    const getLoan = vi.fn().mockResolvedValue({
      Ok: createInstantLoan({
        ltv_timer_s: DEPOSIT_WINDOW_SECONDS,
        deposit_detected_ts: [DEPOSIT_DETECTED_TIMESTAMP_SECONDS],
        expires_at: [],
      }),
    });
    const getBtcAddress = vi.fn().mockResolvedValue("bc1qinstantdeposit");
    const getDepositAddress = vi.fn().mockResolvedValue({
      Ok: "0x1111111111111111111111111111111111111111",
    });
    const getPoolRate = vi
      .fn()
      .mockResolvedValue([[10_000_000_000_000_000_000_000_000n, 0n, 0n]]);
    const getDepositFee = vi.fn().mockResolvedValue(2_000n);
    const icrc1Fee = vi.fn().mockResolvedValue(10n);
    mockInstantLoanCollateralHintFetch({
      collateralAmountHint: "10000000",
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
    expect(loan.initialDeposit.detectedTimestamp).toBe(
      DEPOSIT_DETECTED_TIMESTAMP_SECONDS
    );
    expect(loan.initialDeposit.expiryTimestamp).toBe(
      EXPECTED_EXPIRY_TIMESTAMP_SECONDS
    );
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
    mockInstantLoanCollateralHintFetch({
      borrowAsset: "BTC",
      borrowPoolId: BTC_POOL_ID,
      collateralAmountHint: "5000000",
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
      amount: 1_003_027n,
      decimals: 8n,
      debtAmount: 1_000_500n,
      interestBufferAmount: 27n,
      inflowFeeAmount: 2_500n,
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
    mockInstantLoanCollateralHintFetch({
      collateralAmountHint: "10000000",
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
    expect(loan.initialDeposit.amount).toBe(10_002_500n);
    expect(loan.status).toEqual({
      operation: "deposit",
      state: "action_required",
      confirmations: null,
      requiredConfirmations: null,
    });
    expect(estimateDepositFee).not.toHaveBeenCalled();
  });

  test("returns awaiting deposit status when collateral has not arrived", async () => {
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
    mockInstantLoanCollateralHintFetch({
      collateralAmountHint: "10000000",
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
    expect(loan.status).toEqual({
      operation: "deposit",
      state: "action_required",
      confirmations: null,
      requiredConfirmations: null,
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
    expect(estimateDepositFee).not.toHaveBeenCalled();
  });
});
