import { LiquidiumError, LiquidiumErrorCode } from "../../core/errors";
import { getVariantKey } from "../../core/utils/variant";
import type {
  AssetType as CanisterLiquidationAsset,
  LiquidatableUser as CanisterLiquidationCandidate,
  Assets as CanisterLiquidationCandidateAsset,
  LiquidatablePosition as CanisterLiquidationCandidatePosition,
  LiquidationResult as CanisterLiquidationResult,
  ScanResult as CanisterLiquidationScanResult,
  LiquidationStatus as CanisterLiquidationStatus,
  TxStatus as CanisterLiquidationTransfer,
} from "../../generated/canisters/lending/lending.did";
import type {
  LiquidationAsset,
  LiquidationCandidate,
  LiquidationCandidateAsset,
  LiquidationCandidatePosition,
  LiquidationResult,
  LiquidationScanResult,
  LiquidationStatus,
  LiquidationTransfer,
} from "./types";

export function mapCanisterLiquidationScanResult(
  result: CanisterLiquidationScanResult
): LiquidationScanResult {
  return {
    candidates: result.users.map(mapCanisterLiquidationCandidate),
    scanned: result.scanned,
    nextCursor: result.next_cursor[0]?.toText(),
  };
}

function mapCanisterLiquidationCandidate(
  candidate: CanisterLiquidationCandidate
): LiquidationCandidate {
  return {
    borrowerProfileId: candidate.account.toText(),
    healthFactor: candidate.health_factor,
    totalDebtUsd: candidate.total_debt,
    weightedLiquidationThresholdBps: candidate.weighted_liquidation_threshold,
    positions: candidate.positions.map(mapCanisterLiquidationCandidatePosition),
  };
}

function mapCanisterLiquidationCandidatePosition(
  position: CanisterLiquidationCandidatePosition
): LiquidationCandidatePosition {
  return {
    poolId: position.pool_id.toText(),
    asset: mapCanisterLiquidationCandidateAsset(position.asset),
    assetType: mapCanisterLiquidationAsset(position.asset_type),
    collateralAmount: position.collateral_amount,
    debtAmount: position.debt_amount,
    liquidationBonusBps: position.liquidation_bonus,
    liquidationThresholdBps: position.liquidation_threshold,
    protocolFeeBps: position.protocol_fee,
  };
}

function mapCanisterLiquidationCandidateAsset(
  asset: CanisterLiquidationCandidateAsset
): LiquidationCandidateAsset {
  return getVariantKey(asset) as LiquidationCandidateAsset;
}

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
  if ("Pending" in status) {
    return { state: "pending" };
  }

  throw new LiquidiumError(
    LiquidiumErrorCode.INTERNAL,
    `Unexpected liquidation status: ${getVariantKey(status)}`
  );
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
