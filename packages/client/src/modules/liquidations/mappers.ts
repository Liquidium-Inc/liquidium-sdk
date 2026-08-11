import type {
  AssetType as CanisterLiquidationAsset,
  LiquidationResult as CanisterLiquidationResult,
  LiquidationStatus as CanisterLiquidationStatus,
  TxStatus as CanisterLiquidationTransfer,
} from "../../generated/canisters/lending/lending.did";
import type {
  LiquidationAsset,
  LiquidationResult,
  LiquidationStatus,
  LiquidationTransfer,
} from "./types";

export function mapCanisterLiquidationResult(
  liquidation: CanisterLiquidationResult
): LiquidationResult {
  return {
    id: liquidation.id,
    timestamp: liquidation.timestamp,
    amounts: {
      debtRepaid: liquidation.amounts.debt_repaid,
      collateralReceived: liquidation.amounts.collateral_received,
    },
    debtAsset: mapCanisterLiquidationAsset(liquidation.debt_asset),
    collateralAsset: mapCanisterLiquidationAsset(liquidation.collateral_asset),
    status: mapCanisterLiquidationStatus(liquidation.status),
    changeTx: mapCanisterLiquidationTransfer(liquidation.change_tx),
    collateralTx: mapCanisterLiquidationTransfer(liquidation.collateral_tx),
  };
}

function mapCanisterLiquidationAsset(
  asset: CanisterLiquidationAsset
): LiquidationAsset {
  if ("CkAsset" in asset) {
    return {
      type: "ck_asset",
      ledgerCanisterId: asset.CkAsset.toText(),
    };
  }

  return { type: "unknown" };
}

function mapCanisterLiquidationStatus(
  status: CanisterLiquidationStatus
): LiquidationStatus {
  if ("FailedLiquidation" in status) {
    return { state: "failed_liquidation", error: status.FailedLiquidation };
  }
  if ("CollateralTransferFailed" in status) {
    return {
      state: "collateral_transfer_failed",
      error: status.CollateralTransferFailed,
    };
  }
  if ("ChangeTransferFailed" in status) {
    return {
      state: "change_transfer_failed",
      error: status.ChangeTransferFailed,
    };
  }
  if ("InflowProcessed" in status) {
    return { state: "inflow_processed" };
  }
  if ("CoreExecuted" in status) {
    return { state: "core_executed" };
  }
  if ("Success" in status) {
    return { state: "success" };
  }

  return { state: "pending" };
}

function mapCanisterLiquidationTransfer(
  transfer: CanisterLiquidationTransfer
): LiquidationTransfer {
  const txid = transfer.tx_id[0];

  if ("Failed" in transfer.status) {
    return {
      state: "failed",
      txid,
      error: transfer.status.Failed,
    };
  }

  return {
    state: "Success" in transfer.status ? "success" : "pending",
    txid,
  };
}
