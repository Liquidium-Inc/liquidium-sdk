import { Actor } from "@icp-sdk/core/agent";
import { Principal } from "@icp-sdk/core/principal";
import { afterEach, describe, expect, test, vi } from "vitest";
import type {
  LiquidationResult as CanisterLiquidationResult,
  ScanResult as CanisterLiquidationScanResult,
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

const LIQUIDATION_ID = 42n;
const DEBT_AMOUNT = 1_000_000n;
const MIN_COLLATERAL_AMOUNT = 0n;
const BASE_REQUEST: ExecuteLiquidationRequest = {
  borrowerProfileId: VALID_IC_PRINCIPAL,
  debtPoolId: USDT_POOL_ID,
  collateralPoolId: BTC_POOL_ID,
  debtAmount: DEBT_AMOUNT,
  receiverPrincipal: ICP_POOL_ID,
  minCollateralAmount: MIN_COLLATERAL_AMOUNT,
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("LiquidationsModule", () => {
  test("scans and maps liquidation candidates", async () => {
    // given
    const scanAtRiskPositions = vi
      .fn()
      .mockResolvedValue(createCanisterLiquidationScanResult());
    vi.spyOn(Actor, "createActor").mockReturnValue({
      scan_at_risk_positions: scanAtRiskPositions,
    } as never);
    const client = new LiquidiumClient({});

    // when
    const result = await client.liquidations.scan({
      cursor: ICP_POOL_ID,
      scanLimit: 100n,
      maxResults: 20n,
    });

    // then
    expect(scanAtRiskPositions).toHaveBeenCalledWith(
      [Principal.fromText(ICP_POOL_ID)],
      100n,
      20n
    );
    expect(result).toEqual({
      candidates: [
        {
          borrowerProfileId: VALID_IC_PRINCIPAL,
          healthFactor: 900n,
          totalDebtUsd: 10n ** 27n,
          weightedLiquidationThresholdBps: 7_500n,
          positions: [
            {
              poolId: USDT_POOL_ID,
              asset: "USDT",
              assetType: {
                type: "ck_asset",
                ledgerCanisterId: USDT_POOL_ID,
              },
              collateralAmount: 2_000_000n,
              debtAmount: 1_000_000n,
              liquidationBonusBps: 500n,
              liquidationThresholdBps: 7_500n,
              protocolFeeBps: 100n,
            },
          ],
        },
      ],
      scanned: 25n,
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
    ["invalid cursor", { cursor: "not-a-principal" }, undefined],
  ] as const)(
    "rejects %s before the canister call",
    async (_, change, message) => {
      // given
      const createActor = vi.spyOn(Actor, "createActor");
      const client = new LiquidiumClient({});

      // when
      const result = client.liquidations.scan({
        scanLimit: 100n,
        maxResults: 20n,
        ...change,
      });

      // then
      await expect(result).rejects.toMatchObject({
        code: LiquidiumErrorCode.VALIDATION_ERROR,
        ...(message ? { message } : {}),
      });
      expect(createActor).not.toHaveBeenCalled();
    }
  );

  test("maps scan transport errors", async () => {
    // given
    const cause = new Error("replica unavailable");
    vi.spyOn(Actor, "createActor").mockReturnValue({
      scan_at_risk_positions: vi.fn().mockRejectedValue(cause),
    } as never);
    const client = new LiquidiumClient({});

    // when
    const result = client.liquidations.scan({
      scanLimit: 100n,
      maxResults: 20n,
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
    vi.spyOn(Actor, "createActor").mockReturnValue({
      liquidate_with_slippage: liquidateWithSlippage,
    } as never);
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
      timestamp: 1_786_028_400n,
      amounts: {
        debtRepaid: 900_000n,
        collateralReceived: 75_000n,
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
    vi.spyOn(Actor, "createActor").mockReturnValue({
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
    } as never);
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
        status: { CoreExecuted: null },
      }),
    });
    vi.spyOn(Actor, "createActor").mockReturnValue({
      get_liquidation: getLiquidation,
    } as never);
    const client = new LiquidiumClient({});

    // when
    const result = await client.liquidations.getLiquidation(LIQUIDATION_ID);

    // then
    expect(getLiquidation).toHaveBeenCalledWith(LIQUIDATION_ID);
    expect(result.status).toEqual({ state: "core_executed" });
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
    ["negative minimum collateral", { minCollateralAmount: -1n }],
  ] as const)("rejects %s before the canister call", async (_, change) => {
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
    vi.spyOn(Actor, "createActor").mockReturnValue({
      liquidate_with_slippage: vi.fn().mockResolvedValue({
        Err: { InsufficientCollateral: null },
      }),
    } as never);
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
    vi.spyOn(Actor, "createActor").mockReturnValue({
      get_liquidation: vi.fn().mockResolvedValue({
        Err: { LiquidationNotFound: "liquidation 42 not found" },
      }),
    } as never);
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
    ["liquidate_with_slippage", "liquidate", [BASE_REQUEST]],
    ["get_liquidation", "getLiquidation", [LIQUIDATION_ID]],
  ] as const)("maps %s transport errors", async (method, sdkMethod, args) => {
    // given
    const cause = new Error("replica unavailable");
    vi.spyOn(Actor, "createActor").mockReturnValue({
      [method]: vi.fn().mockRejectedValue(cause),
    } as never);
    const client = new LiquidiumClient({});

    // when
    const result =
      sdkMethod === "liquidate"
        ? client.liquidations.liquidate(args[0] as ExecuteLiquidationRequest)
        : client.liquidations.getLiquidation(args[0] as bigint);

    // then
    await expect(result).rejects.toMatchObject({
      code: LiquidiumErrorCode.CANISTER_REJECTED,
      message: `Canister call failed: ${method}`,
      cause,
    });
  });
});

function createCanisterLiquidationScanResult(): CanisterLiquidationScanResult {
  return {
    users: [
      {
        account: Principal.fromText(VALID_IC_PRINCIPAL),
        health_factor: 900n,
        total_debt: 10n ** 27n,
        weighted_liquidation_threshold: 7_500n,
        positions: [
          {
            pool_id: Principal.fromText(USDT_POOL_ID),
            asset: { USDT: null },
            asset_type: { CkAsset: Principal.fromText(USDT_POOL_ID) },
            account: Principal.fromText(VALID_IC_PRINCIPAL),
            collateral_amount: 2_000_000n,
            debt_amount: 1_000_000n,
            liquidation_bonus: 500n,
            liquidation_threshold: 7_500n,
            protocol_fee: 100n,
          },
        ],
      },
    ],
    scanned: 25n,
    next_cursor: [Principal.fromText(BTC_POOL_ID)],
  };
}

function createCanisterLiquidationResult(
  overrides: Partial<CanisterLiquidationResult> = {}
): CanisterLiquidationResult {
  return {
    id: LIQUIDATION_ID,
    timestamp: 1_786_028_400n,
    amounts: {
      debt_repaid: 900_000n,
      collateral_received: 75_000n,
    },
    debt_asset: { CkAsset: Principal.fromText(USDT_POOL_ID) },
    collateral_asset: { Unknown: null },
    status: { Success: null },
    change_tx: { status: { Success: null }, tx_id: ["change-txid"] },
    collateral_tx: { status: { Pending: null }, tx_id: [] },
    ...overrides,
  };
}
