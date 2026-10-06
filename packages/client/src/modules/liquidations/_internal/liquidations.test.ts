import {
  IcrcLedgerCanister,
  IcrcTransferError,
} from "@icp-sdk/canisters/ledger/icrc";
import { Actor, type ActorSubclass, HttpAgent } from "@icp-sdk/core/agent";
import { Principal } from "@icp-sdk/core/principal";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { mockDeep } from "vitest-mock-extended";
import type {
  FlexibleLendingActor,
  PoolLedgerRoute,
} from "../../../core/canisters/lending/flexible-actor";
import type {
  LiquidationResult as CanisterLiquidationResult,
  ScanResult as CanisterLiquidationScanResult,
  _SERVICE as LendingService,
} from "../../../generated/canisters/lending/lending.did";
import {
  type ExecuteLiquidationRequest,
  LiquidiumClient,
  LiquidiumErrorCode,
} from "../../../index";
import {
  BTC_POOL_ID,
  ICP_POOL_ID,
  USDT_POOL_ID,
  VALID_IC_PRINCIPAL,
} from "../../lending/_internal/test-fixtures";

type LiquidationActorMethods = Pick<
  LendingService,
  "scan_at_risk_positions" | "liquidate_with_slippage" | "get_liquidation"
> &
  Pick<FlexibleLendingActor, "get_pool">;

type LiquidationActorCalls = {
  [Method in keyof LiquidationActorMethods]: (
    ...args: Parameters<LiquidationActorMethods[Method]>
  ) => ReturnType<LiquidationActorMethods[Method]>;
};

const LIQUIDATION_ID = 42n;

const DEBT_AMOUNT = 1_000_000n;

const MIN_COLLATERAL_AMOUNT = 0n;

const MAX_NAT64_VALUE = 2n ** 64n - 1n;

const DEBT_LEDGER_ID = "cngnf-vqaaa-aaaar-qag4q-cai";

const CUSTOM_LENDING_ID = "nja4y-2yaaa-aaaae-qddxa-cai";

const LEDGER_FEE = 10_000n;

const REQUIRED_ALLOWANCE = DEBT_AMOUNT + LEDGER_FEE;

const FUNDED_BALANCE = REQUIRED_ALLOWANCE + LEDGER_FEE;

const APPROVAL_BLOCK_INDEX = 123n;

const NOW_MILLISECONDS = 1_790_000_000_000;

const NOW_NANOSECONDS = BigInt(NOW_MILLISECONDS) * 1_000_000n;

const SCAN_LIMIT = 100n;

const MAX_RESULTS = 20n;

const SCANNED_ACCOUNTS = 25n;

const LIQUIDATION_TIMESTAMP_SECONDS = 1_786_028_400n;

const REPAID_DEBT_AMOUNT_BASE_UNITS = 900_000n;

const RECEIVED_COLLATERAL_AMOUNT_BASE_UNITS = 75_000n;

const COLLATERAL_AMOUNT_BASE_UNITS = 2_000_000n;

const HEALTH_FACTOR = 900n;

const TOTAL_DEBT_USD_RAY = 10n ** 27n;

const LIQUIDATION_THRESHOLD_BPS = 7_500n;

const LIQUIDATION_BONUS_BPS = 500n;

const PROTOCOL_FEE_BPS = 100n;

const APPROVAL_DURATION_5_MINUTES_NS = 300_000_000_000n;

const BASE_REQUEST: ExecuteLiquidationRequest = {
  borrowerProfileId: VALID_IC_PRINCIPAL,
  debtPoolId: USDT_POOL_ID,
  collateralPoolId: BTC_POOL_ID,
  debtAmount: DEBT_AMOUNT,
  receiverPrincipal: ICP_POOL_ID,
  minCollateralAmount: MIN_COLLATERAL_AMOUNT,
};

let debtLedger: ReturnType<typeof createMockDebtLedger>;

beforeEach(() => {
  debtLedger = createMockDebtLedger();
  vi.spyOn(IcrcLedgerCanister, "create").mockReturnValue(debtLedger);
  vi.spyOn(HttpAgent.prototype, "getPrincipal").mockResolvedValue(
    Principal.fromText(VALID_IC_PRINCIPAL)
  );
  vi.spyOn(Date, "now").mockReturnValue(NOW_MILLISECONDS);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("LiquidationsModule", () => {
  test("scans and maps liquidation candidates", async () => {
    // given
    const scanAtRiskPositions = vi
      .fn()
      .mockResolvedValue(createCanisterLiquidationScanResult());

    mockLendingActor({
      scan_at_risk_positions: scanAtRiskPositions,
    });
    const client = new LiquidiumClient({});

    // when
    const result = await client.liquidations.scan({
      cursor: ICP_POOL_ID,
      scanLimit: SCAN_LIMIT,
      maxResults: MAX_RESULTS,
    });

    // then
    expect(scanAtRiskPositions).toHaveBeenCalledWith(
      [Principal.fromText(ICP_POOL_ID)],
      SCAN_LIMIT,
      MAX_RESULTS
    );
    expect(result).toEqual({
      candidates: [
        {
          borrowerProfileId: VALID_IC_PRINCIPAL,
          healthFactor: HEALTH_FACTOR,
          totalDebtUsd: TOTAL_DEBT_USD_RAY,
          weightedLiquidationThresholdBps: LIQUIDATION_THRESHOLD_BPS,
          positions: [
            {
              poolId: USDT_POOL_ID,
              asset: "USDT",
              assetType: {
                type: "ck_asset",
                ledgerCanisterId: USDT_POOL_ID,
              },
              collateralAmount: COLLATERAL_AMOUNT_BASE_UNITS,
              debtAmount: DEBT_AMOUNT,
              liquidationBonusBps: LIQUIDATION_BONUS_BPS,
              liquidationThresholdBps: LIQUIDATION_THRESHOLD_BPS,
              protocolFeeBps: PROTOCOL_FEE_BPS,
            },
          ],
        },
      ],
      scanned: SCANNED_ACCOUNTS,
      nextCursor: BTC_POOL_ID,
    });
  });

  test.each([
    [
      "zero scan limit",
      { scanLimit: 0n },
      "Liquidation scan limit must be greater than 0",
    ],
    [
      "zero maximum results",
      { maxResults: 0n },
      "Liquidation maximum results must be greater than 0",
    ],
    [
      "scan limit above nat64",
      { scanLimit: MAX_NAT64_VALUE + 1n },
      `Liquidation scan limit must not exceed ${MAX_NAT64_VALUE}`,
    ],
    [
      "maximum results above nat64",
      { maxResults: MAX_NAT64_VALUE + 1n },
      `Liquidation maximum results must not exceed ${MAX_NAT64_VALUE}`,
    ],
    ["invalid cursor", { cursor: "not-a-principal" }, undefined],
  ] as const)(
    "rejects %s before the canister call",
    async (_, change, message) => {
      // given
      const createActor = vi.spyOn(Actor, "createActor");
      const client = new LiquidiumClient({});

      // when
      const result = client.liquidations.scan({
        scanLimit: SCAN_LIMIT,
        maxResults: MAX_RESULTS,
        ...change,
      });

      // then
      await expect(result).rejects.toMatchObject({
        code: LiquidiumErrorCode.VALIDATION_ERROR,
      });

      if (message !== undefined) {
        await expect(result).rejects.toMatchObject({ message });
      }

      expect(createActor).not.toHaveBeenCalled();
    }
  );

  test("accepts maximum nat64 scan values", async () => {
    // given
    const scanAtRiskPositions = vi
      .fn()
      .mockResolvedValue(createCanisterLiquidationScanResult());

    mockLendingActor({
      scan_at_risk_positions: scanAtRiskPositions,
    });
    const client = new LiquidiumClient({});

    // when
    await client.liquidations.scan({
      scanLimit: MAX_NAT64_VALUE,
      maxResults: MAX_NAT64_VALUE,
    });

    // then
    expect(scanAtRiskPositions).toHaveBeenCalledWith(
      [],
      MAX_NAT64_VALUE,
      MAX_NAT64_VALUE
    );
  });

  test("maps scan transport errors", async () => {
    // given
    const cause = new Error("replica unavailable");
    mockLendingActor({
      scan_at_risk_positions: vi.fn().mockRejectedValue(cause),
    });
    const client = new LiquidiumClient({});

    // when
    const result = client.liquidations.scan({
      scanLimit: SCAN_LIMIT,
      maxResults: MAX_RESULTS,
    });

    // then
    await expect(result).rejects.toMatchObject({
      code: LiquidiumErrorCode.CANISTER_REJECTED,
      message: "Canister call failed: scan_at_risk_positions",
      cause,
    });
  });

  test("calls the slippage method, defaults buyBadDebt, and maps the result", async () => {
    // given
    const liquidateWithSlippage = vi.fn().mockResolvedValue({
      Ok: createCanisterLiquidationResult(),
    });

    mockLendingActor({
      get_pool: createDebtPoolQuery(),
      liquidate_with_slippage: liquidateWithSlippage,
    });
    const client = new LiquidiumClient({});

    // when
    const result = await client.liquidations.liquidate(BASE_REQUEST);

    // then
    expect(liquidateWithSlippage).toHaveBeenCalledWith(
      {
        borrower: Principal.fromText(VALID_IC_PRINCIPAL),
        debt_pool_id: Principal.fromText(USDT_POOL_ID),
        collateral_pool_id: Principal.fromText(BTC_POOL_ID),
        debt_amount: DEBT_AMOUNT,
        receiver_address: Principal.fromText(ICP_POOL_ID),
        buy_bad_debt: false,
      },
      MIN_COLLATERAL_AMOUNT
    );
    expect(result).toEqual({
      id: LIQUIDATION_ID,
      timestamp: LIQUIDATION_TIMESTAMP_SECONDS,
      amounts: {
        debtRepaid: REPAID_DEBT_AMOUNT_BASE_UNITS,
        collateralReceived: RECEIVED_COLLATERAL_AMOUNT_BASE_UNITS,
      },
      debtAsset: {
        type: "ck_asset",
        ledgerCanisterId: USDT_POOL_ID,
      },
      collateralAsset: { type: "unknown" },
      status: { state: "success" },
      changeTx: { state: "success", txid: "change-txid" },
      collateralTx: { state: "pending", txid: undefined },
    });
  });

  test("returns failed liquidation and transfer states with their messages", async () => {
    // given
    mockLendingActor({
      get_pool: createDebtPoolQuery(),
      liquidate_with_slippage: vi.fn().mockResolvedValue({
        Ok: createCanisterLiquidationResult({
          status: { FailedLiquidation: "core execution failed" },
          change_tx: {
            status: { Failed: "refund failed" },
            tx_id: ["refund-txid"],
          },
          collateral_tx: {
            status: { Failed: "collateral transfer failed" },
            tx_id: ["collateral-txid"],
          },
        }),
      }),
    });
    const client = new LiquidiumClient({});

    // when
    const result = await client.liquidations.liquidate({
      ...BASE_REQUEST,
      buyBadDebt: true,
    });

    // then
    expect(result.status).toEqual({
      state: "failed_liquidation",
      error: "core execution failed",
    });
    expect(result.changeTx).toEqual({
      state: "failed",
      txid: "refund-txid",
      error: "refund failed",
    });
    expect(result.collateralTx).toEqual({
      state: "failed",
      txid: "collateral-txid",
      error: "collateral transfer failed",
    });
  });

  test("gets the current liquidation status", async () => {
    // given
    const getLiquidation = vi.fn().mockResolvedValue({
      Ok: createCanisterLiquidationResult({
        status: { Pending: null },
      }),
    });

    mockLendingActor({
      get_liquidation: getLiquidation,
    });
    const client = new LiquidiumClient({});

    // when
    const result = await client.liquidations.getLiquidation(LIQUIDATION_ID);

    // then
    expect(getLiquidation).toHaveBeenCalledWith(LIQUIDATION_ID);
    expect(result.status).toEqual({ state: "pending" });
  });

  test("rejects an unrecognized liquidation status", async () => {
    // given
    const futureLiquidationResult = {
      ...createCanisterLiquidationResult(),
      status: { FutureStatus: null },
    };

    mockLendingActor({
      get_liquidation: vi.fn().mockResolvedValue({
        Ok: futureLiquidationResult,
      }),
    });
    const client = new LiquidiumClient({});

    // when
    const result = client.liquidations.getLiquidation(LIQUIDATION_ID);

    // then
    await expect(result).rejects.toMatchObject({
      code: LiquidiumErrorCode.INTERNAL,
      message: "Unexpected liquidation status: FutureStatus",
    });
  });

  test.each([
    ["borrowerProfileId", { borrowerProfileId: "not-a-principal" }],
    ["debtPoolId", { debtPoolId: "not-a-principal" }],
    ["collateralPoolId", { collateralPoolId: "not-a-principal" }],
    ["receiverPrincipal", { receiverPrincipal: "not-a-principal" }],
  ] as const)(
    "rejects an invalid %s before the canister call",
    async (_, change) => {
      // given
      const createActor = vi.spyOn(Actor, "createActor");
      const client = new LiquidiumClient({});

      // when
      const result = client.liquidations.liquidate({
        ...BASE_REQUEST,
        ...change,
      });

      // then
      await expect(result).rejects.toMatchObject({
        code: LiquidiumErrorCode.VALIDATION_ERROR,
      });
      expect(createActor).not.toHaveBeenCalled();
    }
  );

  test.each([
    ["zero debt", { debtAmount: 0n }],
    ["negative debt", { debtAmount: -1n }],
    ["number debt", { debtAmount: 1 }],
    ["number minimum collateral", { minCollateralAmount: 0 }],
    ["invalid bad debt flag", { buyBadDebt: "false" }],
    ["negative minimum collateral", { minCollateralAmount: -1n }],
  ] as const)("rejects %s before the canister call", async (_, change) => {
    // given
    const createActor = vi.spyOn(Actor, "createActor");
    const client = new LiquidiumClient({});

    // when
    // SAFETY: these cases intentionally pass invalid runtime types to test input validation.
    const invalidRequest = {
      ...BASE_REQUEST,
      ...change,
    } as ExecuteLiquidationRequest;

    const result = client.liquidations.liquidate(invalidRequest);

    // then
    await expect(result).rejects.toMatchObject({
      code: LiquidiumErrorCode.VALIDATION_ERROR,
    });
    expect(createActor).not.toHaveBeenCalled();
  });

  test("rejects a negative liquidation id before the canister call", async () => {
    // given
    const createActor = vi.spyOn(Actor, "createActor");
    const client = new LiquidiumClient({});

    // when
    const result = client.liquidations.getLiquidation(-1n);

    // then
    await expect(result).rejects.toMatchObject({
      code: LiquidiumErrorCode.VALIDATION_ERROR,
      message: "Liquidation id must be at least 0",
    });
    expect(createActor).not.toHaveBeenCalled();
  });

  test("maps liquidation protocol errors", async () => {
    // given
    mockLendingActor({
      get_pool: createDebtPoolQuery(),
      liquidate_with_slippage: vi.fn().mockResolvedValue({
        Err: { InsufficientCollateral: null },
      }),
    });
    const client = new LiquidiumClient({});

    // when
    const result = client.liquidations.liquidate(BASE_REQUEST);

    // then
    await expect(result).rejects.toMatchObject({
      code: LiquidiumErrorCode.INSUFFICIENT_COLLATERAL,
      message: "Insufficient collateral",
    });
  });

  test("maps liquidation-not-found status errors", async () => {
    // given
    mockLendingActor({
      get_liquidation: vi.fn().mockResolvedValue({
        Err: { LiquidationNotFound: "liquidation 42 not found" },
      }),
    });
    const client = new LiquidiumClient({});

    // when
    const result = client.liquidations.getLiquidation(LIQUIDATION_ID);

    // then
    await expect(result).rejects.toMatchObject({
      code: LiquidiumErrorCode.LIQUIDATION_NOT_FOUND,
      message: "liquidation 42 not found",
    });
  });

  test.each([
    [
      "liquidate_with_slippage",
      (client: LiquidiumClient) => client.liquidations.liquidate(BASE_REQUEST),
    ],
    [
      "get_liquidation",
      (client: LiquidiumClient) =>
        client.liquidations.getLiquidation(LIQUIDATION_ID),
    ],
  ] as const)("maps %s transport errors", async (method, invoke) => {
    // given
    const cause = new Error("replica unavailable");
    mockLendingActor({
      get_pool: createDebtPoolQuery(),
      [method]: vi.fn().mockRejectedValue(cause),
    });
    const client = new LiquidiumClient({});

    // when
    const result = invoke(client);

    // then
    await expect(result).rejects.toMatchObject({
      code: LiquidiumErrorCode.CANISTER_REJECTED,
      message: `Canister call failed: ${method}`,
      cause,
    });
  });
});

describe("automatic liquidation allowance", () => {
  test("approves the registered ledger for the configured lender before submitting", async () => {
    // given
    const { client, getPool, liquidateWithSlippage } = mockExecution();

    // when
    await client.liquidations.liquidate(BASE_REQUEST);

    // then
    expect(getPool).toHaveBeenCalledWith(Principal.fromText(USDT_POOL_ID));
    expect(IcrcLedgerCanister.create).toHaveBeenCalledWith(
      expect.objectContaining({
        canisterId: Principal.fromText(DEBT_LEDGER_ID),
      })
    );
    expect(debtLedger.allowance).toHaveBeenCalledWith({
      account: {
        owner: Principal.fromText(VALID_IC_PRINCIPAL),
        subaccount: [],
      },
      spender: { owner: Principal.fromText(CUSTOM_LENDING_ID), subaccount: [] },
    });
    expect(debtLedger.approve).toHaveBeenCalledWith({
      spender: { owner: Principal.fromText(CUSTOM_LENDING_ID), subaccount: [] },
      amount: REQUIRED_ALLOWANCE,
      fee: LEDGER_FEE,
      expected_allowance: 0n,
      created_at_time: NOW_NANOSECONDS,
      expires_at: NOW_NANOSECONDS + APPROVAL_DURATION_5_MINUTES_NS,
    });
    expect(liquidateWithSlippage).toHaveBeenCalledTimes(1);
  });

  test.each([
    {
      label: "exact non-expiring allowance",
      allowance: REQUIRED_ALLOWANCE,
      expires_at: [] satisfies [],
    },
    {
      label: "larger unexpired allowance",
      allowance: REQUIRED_ALLOWANCE * 2n,
      expires_at: [NOW_NANOSECONDS + APPROVAL_DURATION_5_MINUTES_NS] satisfies [
        bigint,
      ],
    },
  ])(
    "reuses $label without paying another approval fee",
    async ({ allowance, expires_at }) => {
      // given
      const { client, liquidateWithSlippage } = mockExecution();
      debtLedger.allowance.mockResolvedValue({ allowance, expires_at });
      debtLedger.balance.mockResolvedValue(REQUIRED_ALLOWANCE);

      // when
      await client.liquidations.liquidate(BASE_REQUEST);

      // then
      expect(debtLedger.approve).not.toHaveBeenCalled();
      expect(liquidateWithSlippage).toHaveBeenCalledTimes(1);
    }
  );

  test.each([
    {
      label: "one unit below requirement",
      allowance: REQUIRED_ALLOWANCE - 1n,
      expires_at: [] satisfies [],
      expectedAllowance: REQUIRED_ALLOWANCE - 1n,
    },
    {
      label: "expired allowance",
      allowance: REQUIRED_ALLOWANCE,
      expires_at: [NOW_NANOSECONDS - 1n] satisfies [bigint],
      expectedAllowance: 0n,
    },
    {
      label: "expiry boundary",
      allowance: REQUIRED_ALLOWANCE,
      expires_at: [NOW_NANOSECONDS] satisfies [bigint],
      expectedAllowance: 0n,
    },
  ])(
    "replaces $label before execution",
    async ({ allowance, expires_at, expectedAllowance }) => {
      // given
      const { client, liquidateWithSlippage } = mockExecution();
      debtLedger.allowance.mockResolvedValue({ allowance, expires_at });

      // when
      await client.liquidations.liquidate(BASE_REQUEST);

      // then
      expect(debtLedger.approve).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: REQUIRED_ALLOWANCE,
          expected_allowance: expectedAllowance,
        })
      );
      expect(liquidateWithSlippage).toHaveBeenCalledTimes(1);
    }
  );

  test.each([
    {
      label: "approval fee missing",
      allowance: 0n,
      balance: FUNDED_BALANCE - 1n,
    },
    {
      label: "collection fee missing",
      allowance: REQUIRED_ALLOWANCE,
      balance: REQUIRED_ALLOWANCE - 1n,
    },
    { label: "empty account", allowance: 0n, balance: 0n },
  ])(
    "rejects $label without approving or liquidating",
    async ({ allowance, balance }) => {
      // given
      const { client, liquidateWithSlippage } = mockExecution();
      debtLedger.allowance.mockResolvedValue({ allowance, expires_at: [] });
      debtLedger.balance.mockResolvedValue(balance);

      // when
      const result = client.liquidations.liquidate(BASE_REQUEST);

      // then
      await expect(result).rejects.toMatchObject({
        code: LiquidiumErrorCode.INSUFFICIENT_FUNDS,
      });
      expect(debtLedger.approve).not.toHaveBeenCalled();
      expect(liquidateWithSlippage).not.toHaveBeenCalled();
    }
  );

  test.each([
    new IcrcTransferError({
      errorType: {
        AllowanceChanged: { current_allowance: REQUIRED_ALLOWANCE },
      },
    }),
    new IcrcTransferError({
      errorType: { BadFee: { expected_fee: LEDGER_FEE + 1n } },
    }),
    new IcrcTransferError({
      errorType: { InsufficientFunds: { balance: 0n } },
    }),
    new Error("approval response lost"),
  ])(
    "stops on approval failure without retrying or submitting",
    async (cause) => {
      // given
      const { client, liquidateWithSlippage } = mockExecution();
      debtLedger.approve.mockRejectedValue(cause);

      // when
      const result = client.liquidations.liquidate(BASE_REQUEST);

      // then
      await expect(result).rejects.toMatchObject({
        code: LiquidiumErrorCode.LIQUIDATION_APPROVAL_FAILED,
        cause,
      });
      expect(debtLedger.approve).toHaveBeenCalledTimes(1);
      expect(liquidateWithSlippage).not.toHaveBeenCalled();
    }
  );

  test("does not execute while approval is still pending", async () => {
    // given
    const { client, liquidateWithSlippage } = mockExecution();
    let completeApproval!: (blockIndex: bigint) => void;

    const approval = new Promise<bigint>((resolve) => {
      completeApproval = resolve;
    });

    let approvalStarted!: () => void;

    const started = new Promise<void>((resolve) => {
      approvalStarted = resolve;
    });

    debtLedger.approve.mockImplementation(() => {
      approvalStarted();

      return approval;
    });

    // when
    const result = client.liquidations.liquidate(BASE_REQUEST);
    await started;

    // then
    expect(liquidateWithSlippage).not.toHaveBeenCalled();
    completeApproval(APPROVAL_BLOCK_INDEX);
    await result;
    expect(liquidateWithSlippage).toHaveBeenCalledTimes(1);
  });

  test("keeps large debt amounts exact when adding ledger fees", async () => {
    // given
    const { client } = mockExecution();
    const largeDebtAmountBaseUnits = BigInt(Number.MAX_SAFE_INTEGER) + 1n;
    debtLedger.balance.mockResolvedValue(
      largeDebtAmountBaseUnits + LEDGER_FEE * 2n
    );

    // when
    await client.liquidations.liquidate({
      ...BASE_REQUEST,
      debtAmount: largeDebtAmountBaseUnits,
    });

    // then
    const EXPECTED_ALLOWANCE = largeDebtAmountBaseUnits + LEDGER_FEE;
    expect(debtLedger.approve).toHaveBeenCalledWith(
      expect.objectContaining({ amount: EXPECTED_ALLOWANCE })
    );
  });

  test("supports a one-unit debt amount on a zero-fee ledger", async () => {
    // given
    const { client, liquidateWithSlippage } = mockExecution();
    const minimumDebtAmountBaseUnits = 1n;
    const zeroFeeBaseUnits = 0n;
    debtLedger.transactionFee.mockResolvedValue(zeroFeeBaseUnits);
    debtLedger.balance.mockResolvedValue(minimumDebtAmountBaseUnits);

    // when
    await client.liquidations.liquidate({
      ...BASE_REQUEST,
      debtAmount: minimumDebtAmountBaseUnits,
    });

    // then
    expect(debtLedger.approve).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: minimumDebtAmountBaseUnits,
        fee: zeroFeeBaseUnits,
      })
    );
    expect(liquidateWithSlippage).toHaveBeenCalledTimes(1);
  });

  test("does not change the submitted amount if the request is edited during approval", async () => {
    // given
    const { client, liquidateWithSlippage } = mockExecution();
    const request = { ...BASE_REQUEST };
    const changedDebtAmount = DEBT_AMOUNT * 2n;

    // when
    const result = client.liquidations.liquidate(request);
    request.debtAmount = changedDebtAmount;
    await result;

    // then
    expect(debtLedger.approve).toHaveBeenCalledWith(
      expect.objectContaining({ amount: REQUIRED_ALLOWANCE })
    );
    expect(liquidateWithSlippage).toHaveBeenCalledWith(
      expect.objectContaining({ debt_amount: DEBT_AMOUNT }),
      MIN_COLLATERAL_AMOUNT
    );
  });

  test("rejects anonymous callers before reading or approving a ledger", async () => {
    // given
    const { client, getPool, liquidateWithSlippage } = mockExecution();
    vi.mocked(HttpAgent.prototype.getPrincipal).mockResolvedValue(
      Principal.anonymous()
    );

    // when
    const result = client.liquidations.liquidate(BASE_REQUEST);

    // then
    await expect(result).rejects.toMatchObject({
      code: LiquidiumErrorCode.NOT_ALLOWED,
    });
    expect(getPool).not.toHaveBeenCalled();
    expect(debtLedger.approve).not.toHaveBeenCalled();
    expect(liquidateWithSlippage).not.toHaveBeenCalled();
  });

  test.each([
    {
      label: "missing pool",
      pools: [] satisfies [],
      code: LiquidiumErrorCode.POOL_NOT_FOUND,
    },
    {
      label: "unsupported ledger",
      pools: [{ asset_type: { Unknown: null } }] satisfies [PoolLedgerRoute],
      code: LiquidiumErrorCode.NOT_ALLOWED,
    },
  ])("rejects $label before approval", async ({ pools, code }) => {
    // given
    const { client, getPool, liquidateWithSlippage } = mockExecution();
    getPool.mockResolvedValue(pools);

    // when
    const result = client.liquidations.liquidate(BASE_REQUEST);

    // then
    await expect(result).rejects.toMatchObject({ code });
    expect(debtLedger.approve).not.toHaveBeenCalled();
    expect(liquidateWithSlippage).not.toHaveBeenCalled();
  });

  test.each(["transactionFee", "balance", "allowance"] as const)(
    "stops on a failed %s read before any update",
    async (method) => {
      // given
      const { client, liquidateWithSlippage } = mockExecution();
      const cause = new Error("ledger unavailable");
      debtLedger[method].mockRejectedValue(cause);

      // when
      const result = client.liquidations.liquidate(BASE_REQUEST);

      // then
      await expect(result).rejects.toMatchObject({
        code: LiquidiumErrorCode.CANISTER_REJECTED,
        cause,
      });
      expect(debtLedger.approve).not.toHaveBeenCalled();
      expect(liquidateWithSlippage).not.toHaveBeenCalled();
    }
  );
});

function createMockDebtLedger() {
  const debtLedger = mockDeep<IcrcLedgerCanister>();
  debtLedger.transactionFee.mockResolvedValue(LEDGER_FEE);
  debtLedger.balance.mockResolvedValue(FUNDED_BALANCE);
  debtLedger.allowance.mockResolvedValue({ allowance: 0n, expires_at: [] });
  debtLedger.approve.mockResolvedValue(APPROVAL_BLOCK_INDEX);

  return debtLedger;
}

function createDebtPoolQuery() {
  return vi
    .fn<FlexibleLendingActor["get_pool"]>()
    .mockResolvedValue([
      { asset_type: { CkAsset: Principal.fromText(DEBT_LEDGER_ID) } },
    ]);
}

function mockExecution() {
  const getPool = createDebtPoolQuery();

  const liquidateWithSlippage = vi
    .fn()
    .mockResolvedValue({ Ok: createCanisterLiquidationResult() });

  mockLendingActor({
    get_pool: getPool,
    liquidate_with_slippage: liquidateWithSlippage,
  });

  const client = new LiquidiumClient({
    canisterIds: { lending: CUSTOM_LENDING_ID },
  });

  return { client, getPool, liquidateWithSlippage };
}

function mockLendingActor(methods: Partial<LiquidationActorCalls>) {
  const actor = mockDeep<ActorSubclass<LiquidationActorCalls>>(methods);
  vi.spyOn(Actor, "createActor").mockReturnValue(actor);

  return actor;
}

function createCanisterLiquidationScanResult(): CanisterLiquidationScanResult {
  return {
    users: [
      {
        account: Principal.fromText(VALID_IC_PRINCIPAL),
        health_factor: HEALTH_FACTOR,
        total_debt: TOTAL_DEBT_USD_RAY,
        weighted_liquidation_threshold: LIQUIDATION_THRESHOLD_BPS,
        positions: [
          {
            pool_id: Principal.fromText(USDT_POOL_ID),
            asset: { USDT: null },
            asset_type: { CkAsset: Principal.fromText(USDT_POOL_ID) },
            account: Principal.fromText(VALID_IC_PRINCIPAL),
            collateral_amount: COLLATERAL_AMOUNT_BASE_UNITS,
            debt_amount: DEBT_AMOUNT,
            liquidation_bonus: LIQUIDATION_BONUS_BPS,
            liquidation_threshold: LIQUIDATION_THRESHOLD_BPS,
            protocol_fee: PROTOCOL_FEE_BPS,
          },
        ],
      },
    ],
    scanned: SCANNED_ACCOUNTS,
    next_cursor: [Principal.fromText(BTC_POOL_ID)],
  };
}

function createCanisterLiquidationResult(
  overrides: Partial<CanisterLiquidationResult> = {}
): CanisterLiquidationResult {
  return {
    id: LIQUIDATION_ID,
    timestamp: LIQUIDATION_TIMESTAMP_SECONDS,
    amounts: {
      debt_repaid: REPAID_DEBT_AMOUNT_BASE_UNITS,
      collateral_received: RECEIVED_COLLATERAL_AMOUNT_BASE_UNITS,
    },
    debt_asset: { CkAsset: Principal.fromText(USDT_POOL_ID) },
    collateral_asset: { Unknown: null },
    status: { Success: null },
    change_tx: { status: { Success: null }, tx_id: ["change-txid"] },
    collateral_tx: { status: { Pending: null }, tx_id: [] },
    ...overrides,
  };
}
