import { Actor } from "@icp-sdk/core/agent";
import { Principal } from "@icp-sdk/core/principal";
import { afterEach, describe, expect, test, vi } from "vitest";
import { DEFAULT_API_BASE_URL } from "../../../core/config";
import { LiquidiumClient, publicIdFromInt } from "../../../index";
import {
  BTC_POOL_ID,
  createBtcBorrowSimpleLoan,
  createBtcPoolRecord,
  createEthPoolRecord,
  createSimpleLoan,
  createSimpleLoanPosition,
  createUsdtPoolRecord,
  ETH_POOL_ID,
  encodeIcrcAccount,
  ICRC_SUBACCOUNT,
  LOAN_ID,
  mockSimpleLoanCollateralHintFetch,
  PROFILE_ID,
  USDT_POOL_ID,
} from "./test-fixtures";

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("SimpleLoansModule get", () => {
  test("gets canonical loan state by ref and derives flow targets", async () => {
    // given
    const DEPOSIT_DETECTED_TIMESTAMP_SECONDS = 1_775_232_000n;
    const EXPIRY_TIMESTAMP_SECONDS = 1_775_235_600n;
    const getLoan = vi.fn().mockResolvedValue({
      Ok: createSimpleLoan({
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
    const fetchSpy = mockSimpleLoanCollateralHintFetch({
      collateralAmountHint: "10000000",
    });
    const getCollateralPosition = vi.fn().mockResolvedValue([
      createSimpleLoanPosition(
        BTC_POOL_ID,
        { BTC: null },
        {
          deposited_native_now: 10_000_000n,
        }
      ),
    ]);
    const getBorrowPosition = vi.fn().mockResolvedValue([
      createSimpleLoanPosition(
        USDT_POOL_ID,
        { USDT: null },
        {
          debt_native_now: 2_000_000n,
          total_debt_interest: 1_000n,
        }
      ),
    ]);

    mockSimpleLoanHydrationActors({
      getLoan,
      getPoolRate,
      getBtcAddress,
      getDepositAddress,
      estimateDepositFee,
      getDepositFee,
      icrc1Fee,
      positionsByPoolId: {
        [BTC_POOL_ID]: await getCollateralPosition(),
        [USDT_POOL_ID]: await getBorrowPosition(),
      },
    });
    const client = new LiquidiumClient({
      apiBaseUrl: "https://app.liquidium.fi/api/sdk",
      canisterIds: { simpleLoans: "kzrva-ziaaa-aaaar-qamyq-cai" },
    });

    // when
    const loan = await client.simpleLoans.get({
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
      decimals: 8n,
      amount: 10_000_000n,
    });
    expect(loan.collateral).not.toHaveProperty("chain");
    expect(loan.borrow).toMatchObject({
      chain: "ICP",
      amount: 2_000_000n,
      decimals: 6n,
      destination: {
        type: "IcPrincipal",
        address: PROFILE_ID,
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
      decimals: 8n,
      collateralAmount: 10_000_000n,
      asset: "BTC",
      detectedTimestamp: DEPOSIT_DETECTED_TIMESTAMP_SECONDS,
      expiryTimestamp: EXPIRY_TIMESTAMP_SECONDS,
      targets: {
        BTC: {
          amount: 10_002_500n,
          inflowFeeAmount: 2_500n,
          target: expect.objectContaining({
            address: "bc1qinstantdeposit",
          }),
        },
        ICP: {
          amount: 10_000_010n,
          inflowFeeAmount: 10n,
        },
      },
    });
    expect(loan.repayment).toMatchObject({
      decimals: 6n,
      debtAmount: 2_001_000n,
      interestBufferAmount: 54n,
      interestBufferSeconds: 86_400n,
      asset: "USDT",
      targets: {
        ETH: {
          amount: 3_501_054n,
          inflowFeeAmount: 1_500_000n,
          inflowFeeEstimateAvailable: true,
          target: expect.objectContaining({
            asset: "USDT",
            chain: "ETH",
            address: "0x1111111111111111111111111111111111111111",
          }),
        },
        ICP: {
          amount: 2_001_064n,
          inflowFeeAmount: 10n,
          inflowFeeEstimateAvailable: true,
        },
      },
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
      Ok: createSimpleLoan({
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
    mockSimpleLoanCollateralHintFetch({
      collateralAmountHint: "10000000",
    });

    mockSimpleLoanHydrationActors({
      getLoan,
      getPoolRate,
      getBtcAddress,
      getDepositAddress,
      getDepositFee,
      icrc1Fee,
    });
    const client = new LiquidiumClient({
      apiBaseUrl: "https://app.liquidium.fi/api/sdk",
      canisterIds: { simpleLoans: "kzrva-ziaaa-aaaar-qamyq-cai" },
    });

    // when
    const loan = await client.simpleLoans.get({
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

  test("includes btc inflow fee in the simple loan repayment quote", async () => {
    // given
    const getLoan = vi.fn().mockResolvedValue({
      Ok: createBtcBorrowSimpleLoan(),
    });
    const getDepositAddress = vi.fn().mockResolvedValue({
      Ok: "0x1111111111111111111111111111111111111111",
    });
    const getBtcAddress = vi.fn().mockResolvedValue("bc1qrepaybtc");
    const getPoolRate = vi
      .fn()
      .mockResolvedValue([[10_000_000_000_000_000_000_000_000n, 0n, 0n]]);
    const getCollateralPosition = vi.fn().mockResolvedValue([
      createSimpleLoanPosition(
        USDT_POOL_ID,
        { USDT: null },
        {
          deposited_native_now: 5_000_000n,
        }
      ),
    ]);
    const getBorrowPosition = vi.fn().mockResolvedValue([
      createSimpleLoanPosition(
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
    mockSimpleLoanCollateralHintFetch({
      borrowAsset: "BTC",
      borrowPoolId: BTC_POOL_ID,
      collateralAmountHint: "5000000",
      collateralAsset: "USDT",
      collateralPoolId: USDT_POOL_ID,
    });

    mockSimpleLoanHydrationActors({
      getLoan,
      getPoolRate,
      getBtcAddress,
      getDepositAddress,
      estimateDepositFee,
      getDepositFee,
      icrc1Fee,
      positionsByPoolId: {
        [USDT_POOL_ID]: await getCollateralPosition(),
        [BTC_POOL_ID]: await getBorrowPosition(),
      },
    });
    const client = new LiquidiumClient({
      apiBaseUrl: "https://app.liquidium.fi/api/sdk",
      canisterIds: { simpleLoans: "kzrva-ziaaa-aaaar-qamyq-cai" },
    });

    // when
    const loan = await client.simpleLoans.get({
      ref: publicIdFromInt(LOAN_ID),
    });

    // then
    expect(loan.repayment).toMatchObject({
      decimals: 8n,
      debtAmount: 1_000_500n,
      interestBufferAmount: 27n,
      asset: "BTC",
      targets: {
        BTC: {
          amount: 1_003_027n,
          inflowFeeAmount: 2_500n,
          inflowFeeEstimateAvailable: true,
        },
        ICP: {
          amount: 1_000_537n,
          inflowFeeAmount: 10n,
          inflowFeeEstimateAvailable: true,
        },
      },
    });
    expect(loan.initialDeposit).toMatchObject({
      decimals: 6n,
      collateralAmount: 5_000_000n,
      asset: "USDT",
      targets: {
        ETH: {
          amount: 6_500_000n,
          inflowFeeAmount: 1_500_000n,
        },
        ICP: {
          amount: 5_000_010n,
          inflowFeeAmount: 10n,
        },
      },
    });
    expect(getDepositFee).toHaveBeenCalledWith();
    expect(icrc1Fee).toHaveBeenCalledWith();
  });
  test("hydrates native ETH delivery with ETH and ckETH repayment targets and fee fallback", async () => {
    // given
    const DEBT_ETH_WEI = 5_000_000_000_000_000n;
    const CKETH_LEDGER_FEE_WEI = 2_000_000_000_000n;
    const NATIVE_ETH_FEE_FALLBACK_WEI = 250_000_000_000_000n;
    const getDepositAddress = vi.fn().mockResolvedValue({
      Ok: "0x1111111111111111111111111111111111111111",
    });
    const estimateDepositFee = vi
      .fn()
      .mockRejectedValue(new Error("fee estimate unavailable"));
    const getBorrowPosition = vi
      .fn()
      .mockResolvedValue([
        createSimpleLoanPosition(
          ETH_POOL_ID,
          { ETH: null },
          { debt_native_now: DEBT_ETH_WEI }
        ),
      ]);
    mockSimpleLoanCollateralHintFetch({ collateralAmountHint: "10000000" });
    mockSimpleLoanHydrationActors({
      getLoan: vi.fn().mockResolvedValue({
        Ok: createSimpleLoan({
          borrow_amount: DEBT_ETH_WEI,
          borrow_pool_id: Principal.fromText(ETH_POOL_ID),
          borrow_asset: { ETH: null },
        }),
      }),
      getPoolRate: vi.fn().mockResolvedValue([[0n, 0n, 0n]]),
      getBtcAddress: vi.fn().mockResolvedValue("bc1qinstantdeposit"),
      getDepositAddress,
      estimateDepositFee,
      getDepositFee: vi.fn().mockResolvedValue(2_000n),
      icrc1Fee: vi.fn().mockResolvedValue(CKETH_LEDGER_FEE_WEI),
      positionsByPoolId: {
        [ETH_POOL_ID]: await getBorrowPosition(),
      },
    });
    const client = new LiquidiumClient({
      apiBaseUrl: "https://app.liquidium.fi/api/sdk",
      canisterIds: { simpleLoans: "kzrva-ziaaa-aaaar-qamyq-cai" },
    });

    // when
    const loan = await client.simpleLoans.get({ loanId: LOAN_ID });

    // then
    expect(loan.borrow).toMatchObject({
      asset: "ETH",
      chain: "ETH",
      decimals: 18n,
    });
    expect(loan.repayment.targets.ETH).toMatchObject({
      amount: DEBT_ETH_WEI + NATIVE_ETH_FEE_FALLBACK_WEI,
      inflowFeeAmount: NATIVE_ETH_FEE_FALLBACK_WEI,
      inflowFeeEstimateAvailable: false,
      target: {
        asset: "ETH",
        chain: "ETH",
        address: "0x1111111111111111111111111111111111111111",
      },
    });
    expect(loan.repayment.targets.ICP).toMatchObject({
      amount: DEBT_ETH_WEI + CKETH_LEDGER_FEE_WEI,
      inflowFeeAmount: CKETH_LEDGER_FEE_WEI,
      inflowFeeEstimateAvailable: true,
      target: { asset: "ETH", chain: "ICP" },
    });
    expect(getDepositAddress.mock.calls[0]?.[1]).toEqual([]);
  });

  test("hydrates ETH collateral with the native fee fallback when estimation fails", async () => {
    // given
    const COLLATERAL_ETH_WEI = 10_000_000_000_000_000n;
    const CKETH_LEDGER_FEE_WEI = 2_000_000_000_000n;
    const NATIVE_ETH_FEE_FALLBACK_WEI = 250_000_000_000_000n;
    const getDepositAddress = vi.fn().mockResolvedValue({
      Ok: "0x1111111111111111111111111111111111111111",
    });
    mockSimpleLoanCollateralHintFetch({
      collateralAmountHint: COLLATERAL_ETH_WEI.toString(),
    });
    mockSimpleLoanHydrationActors({
      getLoan: vi.fn().mockResolvedValue({
        Ok: createSimpleLoan({
          lend_asset: { ETH: null },
          lend_pool_id: Principal.fromText(ETH_POOL_ID),
          refund_destination: {
            External: "0x2222222222222222222222222222222222222222",
          },
        }),
      }),
      getPoolRate: vi.fn().mockResolvedValue([[0n, 0n, 0n]]),
      getBtcAddress: vi.fn().mockResolvedValue("bc1qinstantdeposit"),
      getDepositAddress,
      estimateDepositFee: vi
        .fn()
        .mockRejectedValue(new Error("fee estimate unavailable")),
      getDepositFee: vi.fn().mockResolvedValue(2_000n),
      icrc1Fee: vi.fn().mockResolvedValue(CKETH_LEDGER_FEE_WEI),
    });
    const client = new LiquidiumClient({
      apiBaseUrl: "https://app.liquidium.fi/api/sdk",
      canisterIds: { simpleLoans: "kzrva-ziaaa-aaaar-qamyq-cai" },
    });

    // when
    const loan = await client.simpleLoans.get({ loanId: LOAN_ID });

    // then
    expect(loan.initialDeposit).toMatchObject({
      asset: "ETH",
      decimals: 18n,
      collateralAmount: COLLATERAL_ETH_WEI,
      targets: {
        ETH: {
          amount: COLLATERAL_ETH_WEI + NATIVE_ETH_FEE_FALLBACK_WEI,
          inflowFeeAmount: NATIVE_ETH_FEE_FALLBACK_WEI,
        },
        ICP: {
          amount: COLLATERAL_ETH_WEI + CKETH_LEDGER_FEE_WEI,
          inflowFeeAmount: CKETH_LEDGER_FEE_WEI,
        },
      },
    });
  });

  test("returns zero repayment quote when the loan has no debt", async () => {
    // given
    const getLoan = vi.fn().mockResolvedValue({ Ok: createSimpleLoan() });
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
    mockSimpleLoanCollateralHintFetch({
      collateralAmountHint: "10000000",
    });

    mockSimpleLoanHydrationActors({
      getLoan,
      getPoolRate,
      getBtcAddress,
      getDepositAddress,
      getDepositFee,
      icrc1Fee,
    });
    const client = new LiquidiumClient({
      apiBaseUrl: "https://app.liquidium.fi/api/sdk",
      canisterIds: { simpleLoans: "kzrva-ziaaa-aaaar-qamyq-cai" },
    });

    // when
    const loan = await client.simpleLoans.get({
      ref: publicIdFromInt(LOAN_ID),
    });

    // then
    expect(loan.repayment).toMatchObject({
      debtAmount: 0n,
      interestBufferAmount: 0n,
      asset: "USDT",
      targets: {
        ETH: {
          amount: 0n,
          inflowFeeAmount: 0n,
          inflowFeeEstimateAvailable: false,
        },
      },
    });
    expect(loan.initialDeposit.targets.BTC?.amount).toBe(10_002_500n);
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
    const getLoan = vi.fn().mockResolvedValue({ Ok: createSimpleLoan() });
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
    mockSimpleLoanCollateralHintFetch({
      collateralAmountHint: "10000000",
    });

    mockSimpleLoanHydrationActors({
      getLoan,
      getPoolRate,
      getBtcAddress,
      getDepositAddress,
      getDepositFee,
      icrc1Fee,
    });
    const client = new LiquidiumClient({
      apiBaseUrl: "https://app.liquidium.fi/api/sdk",
      canisterIds: { simpleLoans: "kzrva-ziaaa-aaaar-qamyq-cai" },
    });

    // when
    const loan = await client.simpleLoans.get({
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
      debtAmount: 0n,
      interestBufferAmount: 0n,
      asset: "USDT",
      targets: {
        ETH: {
          amount: 0n,
          inflowFeeAmount: 0n,
          inflowFeeEstimateAvailable: false,
        },
      },
    });
    expect(estimateDepositFee).not.toHaveBeenCalled();
  });
});

function mockSimpleLoanHydrationActors(params: {
  getLoan: ReturnType<typeof vi.fn>;
  getPoolRate: ReturnType<typeof vi.fn>;
  getBtcAddress: ReturnType<typeof vi.fn>;
  getDepositAddress: ReturnType<typeof vi.fn>;
  estimateDepositFee?: ReturnType<typeof vi.fn>;
  getDepositFee: ReturnType<typeof vi.fn>;
  icrc1Fee: ReturnType<typeof vi.fn>;
  positionsByPoolId?: Record<string, unknown[]>;
}): void {
  const getPosition = vi.fn().mockImplementation((_, poolId: Principal) => {
    return params.positionsByPoolId?.[poolId.toText()] ?? [];
  });

  vi.spyOn(Actor, "createActor").mockReturnValue({
    get_loan: params.getLoan,
    list_pools: vi
      .fn()
      .mockResolvedValue([
        createBtcPoolRecord(),
        createEthPoolRecord(),
        createUsdtPoolRecord(),
      ]),
    get_position: getPosition,
    get_pool_rate: params.getPoolRate,
    get_btc_address: params.getBtcAddress,
    get_deposit_address: params.getDepositAddress,
    estimate_deposit_fee:
      params.estimateDepositFee ??
      vi.fn().mockResolvedValue({ Ok: 1_500_000n }),
    get_deposit_fee: params.getDepositFee,
    icrc1_fee: params.icrc1Fee,
  } as never);
}
