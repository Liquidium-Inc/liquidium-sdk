import { Principal } from "@icp-sdk/core/principal";
import { createLendingActor } from "../../core/canisters/lending/actor";
import {
  mapCanisterCallErrorToLiquidiumError,
  mapLendingProtocolErrorToLiquidiumError,
} from "../../core/canisters/lending/error-mappers";
import { LiquidiumError, LiquidiumErrorCode } from "../../core/errors";
import type { CanisterContext } from "../../core/transports/canister-context";
import {
  mapCanisterLiquidationResult,
  mapCanisterLiquidationScanResult,
} from "./mappers";
import type {
  ExecuteLiquidationRequest,
  LiquidationResult,
  LiquidationScanResult,
  ScanLiquidationsRequest,
} from "./types";

/** Liquidation candidate scanning, slippage-protected execution, and status lookup. */
export class LiquidationsModule {
  constructor(private readonly canisterContext: CanisterContext) {}

  /**
   * Scans borrower accounts for positions below the liquidation threshold.
   *
   * @param request - Optional cursor, accounts to scan, and candidates to return.
   * @returns Liquidation candidates and the cursor for the next scan page.
   */
  async scan(request: ScanLiquidationsRequest): Promise<LiquidationScanResult> {
    if (request.scanLimit <= 0n) {
      throw new LiquidiumError(
        LiquidiumErrorCode.VALIDATION_ERROR,
        "Liquidation scan limit must be greater than 0"
      );
    }
    if (request.maxResults <= 0n) {
      throw new LiquidiumError(
        LiquidiumErrorCode.VALIDATION_ERROR,
        "Liquidation maximum results must be greater than 0"
      );
    }

    const cursor: [] | [Principal] =
      request.cursor === undefined
        ? []
        : [parsePrincipal(request.cursor, "cursor")];

    try {
      const result = await createLendingActor(
        this.canisterContext
      ).scan_at_risk_positions(cursor, request.scanLimit, request.maxResults);

      return mapCanisterLiquidationScanResult(result);
    } catch (error) {
      if (error instanceof LiquidiumError) {
        throw error;
      }

      throw mapCanisterCallErrorToLiquidiumError(
        "scan_at_risk_positions",
        error
      );
    }
  }

  /**
   * Executes a liquidation with minimum gross collateral slippage protection.
   *
   * The configured IC identity or agent is the liquidator. The caller must
   * pre-approve the lending canister to spend the debt asset.
   *
   * @param request - Borrower, pools, debt amount, collateral receiver, and minimum collateral.
   * @returns The current liquidation result. Failed lifecycle states remain results.
   */
  async liquidate(
    request: ExecuteLiquidationRequest
  ): Promise<LiquidationResult> {
    if (request.debtAmount <= 0n) {
      throw new LiquidiumError(
        LiquidiumErrorCode.VALIDATION_ERROR,
        "Liquidation debt amount must be greater than 0"
      );
    }
    if (request.minCollateralAmount < 0n) {
      throw new LiquidiumError(
        LiquidiumErrorCode.VALIDATION_ERROR,
        "Liquidation minimum collateral amount must be at least 0"
      );
    }

    const borrower = parsePrincipal(
      request.borrowerProfileId,
      "borrowerProfileId"
    );
    const debtPoolId = parsePrincipal(request.debtPoolId, "debtPoolId");
    const collateralPoolId = parsePrincipal(
      request.collateralPoolId,
      "collateralPoolId"
    );
    const receiverAddress = parsePrincipal(
      request.receiverPrincipal,
      "receiverPrincipal"
    );

    try {
      const result = await createLendingActor(
        this.canisterContext
      ).liquidate_with_slippage(
        {
          borrower,
          debt_pool_id: debtPoolId,
          collateral_pool_id: collateralPoolId,
          debt_amount: request.debtAmount,
          receiver_address: receiverAddress,
          buy_bad_debt: request.buyBadDebt ?? false,
        },
        request.minCollateralAmount
      );

      if ("Err" in result) {
        throw mapLendingProtocolErrorToLiquidiumError(result.Err);
      }

      return mapCanisterLiquidationResult(result.Ok);
    } catch (error) {
      if (error instanceof LiquidiumError) {
        throw error;
      }

      throw mapCanisterCallErrorToLiquidiumError(
        "liquidate_with_slippage",
        error
      );
    }
  }

  /**
   * Gets the current status of a liquidation by its canister id.
   *
   * @param liquidationId - Non-negative canister-assigned liquidation id.
   * @returns The current liquidation result, including pending refund transfers.
   */
  async getLiquidation(liquidationId: bigint): Promise<LiquidationResult> {
    if (liquidationId < 0n) {
      throw new LiquidiumError(
        LiquidiumErrorCode.VALIDATION_ERROR,
        "Liquidation id must be at least 0"
      );
    }

    try {
      const result = await createLendingActor(
        this.canisterContext
      ).get_liquidation(liquidationId);

      if ("Err" in result) {
        throw mapLendingProtocolErrorToLiquidiumError(result.Err);
      }

      return mapCanisterLiquidationResult(result.Ok);
    } catch (error) {
      if (error instanceof LiquidiumError) {
        throw error;
      }

      throw mapCanisterCallErrorToLiquidiumError("get_liquidation", error);
    }
  }
}

function parsePrincipal(value: string, field: string): Principal {
  try {
    return Principal.fromText(value);
  } catch (error) {
    throw new LiquidiumError(
      LiquidiumErrorCode.VALIDATION_ERROR,
      `${field} must be a valid principal`,
      error
    );
  }
}
