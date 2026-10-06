import { Principal } from "@icp-sdk/core/principal";
import { createLendingActor } from "../../core/canisters/lending/actor";
import {
  mapCanisterCallErrorToLiquidiumError,
  mapLendingProtocolErrorToLiquidiumError,
} from "../../core/canisters/lending/error-mappers";
import { LiquidiumError, LiquidiumErrorCode } from "../../core/errors";
import type { CanisterContext } from "../../core/transports/canister-context";
import { ensureLiquidationAllowance } from "./_internal/allowance";
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

const MAX_NAT64_VALUE = 2n ** 64n - 1n;

/** Liquidation candidate scanning, execution, and status lookup. */
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

    if (request.scanLimit > MAX_NAT64_VALUE) {
      throw new LiquidiumError(
        LiquidiumErrorCode.VALIDATION_ERROR,
        `Liquidation scan limit must not exceed ${MAX_NAT64_VALUE}`
      );
    }

    if (request.maxResults <= 0n) {
      throw new LiquidiumError(
        LiquidiumErrorCode.VALIDATION_ERROR,
        "Liquidation maximum results must be greater than 0"
      );
    }

    if (request.maxResults > MAX_NAT64_VALUE) {
      throw new LiquidiumError(
        LiquidiumErrorCode.VALIDATION_ERROR,
        `Liquidation maximum results must not exceed ${MAX_NAT64_VALUE}`
      );
    }

    const cursor: [] | [Principal] =
      request.cursor === undefined
        ? []
        : [parsePrincipal(request.cursor, "cursor")];

    return callLendingCanister("scan_at_risk_positions", async () => {
      const result = await createLendingActor(
        this.canisterContext
      ).scan_at_risk_positions(cursor, request.scanLimit, request.maxResults);

      return mapCanisterLiquidationScanResult(result);
    });
  }

  /**
   * Executes a liquidation with automatic debt-ledger allowance handling.
   *
   * The canister enforces `minCollateralAmount` only on bad-debt and hybrid
   * paths. Normal collateral-backed liquidations ignore it and allow partial
   * fills. Setting `buyBadDebt: true` permits, but does not force, a bad-debt path.
   *
   * The configured signing IC identity or agent is the liquidator.
   * Liquidator registration is not required. A sufficient allowance with no
   * expiry or more than one minute remaining is reused; otherwise the SDK
   * approves the debt amount plus the transfer fee
   * for five minutes before submission. Approval incurs a separate ledger fee.
   *
   * @param request - Borrower, pools, debt amount, collateral receiver, and minimum collateral.
   * @returns The current liquidation result. Failed lifecycle states remain results.
   */
  async liquidate(
    request: ExecuteLiquidationRequest
  ): Promise<LiquidationResult> {
    const { debtAmount, minCollateralAmount, buyBadDebt = false } = request;

    if (typeof debtAmount !== "bigint" || debtAmount <= 0n) {
      throw new LiquidiumError(
        LiquidiumErrorCode.VALIDATION_ERROR,
        "Liquidation debt amount must be greater than 0"
      );
    }

    if (typeof minCollateralAmount !== "bigint" || minCollateralAmount < 0n) {
      throw new LiquidiumError(
        LiquidiumErrorCode.VALIDATION_ERROR,
        "Liquidation minimum collateral amount must be at least 0"
      );
    }

    if (typeof buyBadDebt !== "boolean") {
      throw new LiquidiumError(
        LiquidiumErrorCode.VALIDATION_ERROR,
        "buyBadDebt must be a boolean"
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
      await ensureLiquidationAllowance({
        canisterContext: this.canisterContext,
        debtPoolId,
        debtAmount,
      });
    } catch (cause) {
      if (cause instanceof LiquidiumError) {
        throw cause;
      }

      throw new LiquidiumError(
        LiquidiumErrorCode.CANISTER_REJECTED,
        "Could not prepare liquidation allowance; liquidation was not submitted",
        cause
      );
    }

    return callLendingCanister("liquidate_with_slippage", async () => {
      const result = await createLendingActor(
        this.canisterContext
      ).liquidate_with_slippage(
        {
          borrower,
          debt_pool_id: debtPoolId,
          collateral_pool_id: collateralPoolId,
          debt_amount: debtAmount,
          receiver_address: receiverAddress,
          buy_bad_debt: buyBadDebt,
        },
        minCollateralAmount
      );

      if ("Err" in result) {
        throw mapLendingProtocolErrorToLiquidiumError(result.Err);
      }

      return mapCanisterLiquidationResult(result.Ok);
    });
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

    return callLendingCanister("get_liquidation", async () => {
      const result = await createLendingActor(
        this.canisterContext
      ).get_liquidation(liquidationId);

      if ("Err" in result) {
        throw mapLendingProtocolErrorToLiquidiumError(result.Err);
      }

      return mapCanisterLiquidationResult(result.Ok);
    });
  }
}

async function callLendingCanister<T>(
  canisterMethodName: string,
  call: () => Promise<T>
): Promise<T> {
  try {
    return await call();
  } catch (error) {
    if (error instanceof LiquidiumError) {
      throw error;
    }

    throw mapCanisterCallErrorToLiquidiumError(canisterMethodName, error);
  }
}

function parsePrincipal(principalText: string, fieldName: string): Principal {
  try {
    return Principal.fromText(principalText);
  } catch (error) {
    throw new LiquidiumError(
      LiquidiumErrorCode.VALIDATION_ERROR,
      `${fieldName} must be a valid principal`,
      error
    );
  }
}
