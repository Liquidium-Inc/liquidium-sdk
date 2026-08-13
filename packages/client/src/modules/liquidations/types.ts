import type { Asset } from "../../core/types";

/** Fields used to scan for liquidation candidates. */
export interface ScanLiquidationsRequest {
  /** Resume after this borrower profile principal. Omit for the first page. */
  cursor?: string;
  /** Maximum number of borrower accounts to examine. Must fit a positive nat64. */
  scanLimit: bigint;
  /** Maximum number of liquidatable borrowers to return. Must fit a positive nat64. */
  maxResults: bigint;
}

/** Asset symbol returned for a liquidation candidate position. */
export type LiquidationCandidateAsset = Asset | "SOL";

/** One pool position returned for a liquidatable borrower. */
export interface LiquidationCandidatePosition {
  /** Pool principal text. */
  poolId: string;
  /** Pool asset symbol. SOL can appear in legacy canister data. */
  asset: LiquidationCandidateAsset;
  /** Chain-key ledger route or unknown asset type. */
  assetType: LiquidationAsset;
  /** Current collateral in pool-asset base units. */
  collateralAmount: bigint;
  /** Current debt in pool-asset base units. */
  debtAmount: bigint;
  /** Liquidation bonus in basis points. */
  liquidationBonusBps: bigint;
  /** Liquidation threshold in basis points. */
  liquidationThresholdBps: bigint;
  /** Protocol fee on the liquidation bonus in basis points. */
  protocolFeeBps: bigint;
}

/** Borrower whose health factor is below the liquidation threshold. */
export interface LiquidationCandidate {
  /** Borrower profile principal used by `liquidate(...)`. */
  borrowerProfileId: string;
  /** Health factor scaled to three decimals. `1000n` means `1.0`. */
  healthFactor: bigint;
  /** Total debt USD value scaled to 27 decimals. */
  totalDebtUsd: bigint;
  /** Weighted liquidation threshold in basis points. */
  weightedLiquidationThresholdBps: bigint;
  /** Pool positions that can supply debt or collateral for liquidation. */
  positions: LiquidationCandidatePosition[];
}

/** One cursor page of liquidation candidates. */
export interface LiquidationScanResult {
  /** Liquidatable borrowers found in this scan. */
  candidates: LiquidationCandidate[];
  /** Borrower accounts examined in this scan. */
  scanned: bigint;
  /** Cursor for the next scan page, or undefined at the end. */
  nextCursor?: string;
}

/** Fields required to execute a slippage-protected liquidation. */
export interface ExecuteLiquidationRequest {
  /** Liquidium profile principal that owns the position. */
  borrowerProfileId: string;
  /** Principal of the pool that contains the debt. */
  debtPoolId: string;
  /** Principal of the pool that contains the collateral. */
  collateralPoolId: string;
  /** Debt offered for repayment in debt-asset base units. */
  debtAmount: bigint;
  /** Principal that receives seized collateral. */
  receiverPrincipal: string;
  /** Minimum gross collateral before transfer fees. Zero disables this guard. */
  minCollateralAmount: bigint;
  /** Whether the liquidator accepts bad debt. Defaults to `false`. */
  buyBadDebt?: boolean;
}

/** Debt and collateral amounts returned for a liquidation. */
export interface LiquidationAmounts {
  /** Debt repaid in debt-asset base units. */
  debtRepaid: bigint;
  /** Net collateral after the collateral transfer fee, in base units. */
  collateralReceived: bigint;
}

/** Chain-key ledger asset route used by a liquidation. */
export interface CkLiquidationAsset {
  type: "ck_asset";
  /** Chain-key ledger canister principal. */
  ledgerCanisterId: string;
}

/** Asset route the canister cannot identify. */
export interface UnknownLiquidationAsset {
  type: "unknown";
}

/** Asset route used by a liquidation. */
export type LiquidationAsset = CkLiquidationAsset | UnknownLiquidationAsset;

/** Liquidation lifecycle state before final success. */
export interface LiquidationProgressStatus {
  state: "pending" | "inflow_processed" | "core_executed";
  error?: never;
}

/** Successful liquidation lifecycle state. */
export interface LiquidationSuccessStatus {
  state: "success";
  error?: never;
}

/** Failed liquidation lifecycle state with its protocol error. */
export interface LiquidationFailedStatus {
  state:
    | "failed_liquidation"
    | "collateral_transfer_failed"
    | "change_transfer_failed";
  error: string;
}

/** Liquidation lifecycle state returned by the lending canister. */
export type LiquidationStatus =
  | LiquidationProgressStatus
  | LiquidationSuccessStatus
  | LiquidationFailedStatus;

/** Pending collateral or change transfer. */
export interface LiquidationPendingTransfer {
  state: "pending";
  /** Chain transaction id when assigned. */
  txid?: string;
  error?: never;
}

/** Successful collateral or change transfer. */
export interface LiquidationSuccessTransfer {
  state: "success";
  /** Chain transaction id when assigned. */
  txid?: string;
  error?: never;
}

/** Failed collateral or change transfer with its error. */
export interface LiquidationFailedTransfer {
  state: "failed";
  /** Chain transaction id when assigned. */
  txid?: string;
  /** Transfer error message. */
  error: string;
}

/** Collateral or change transfer state for a liquidation. */
export type LiquidationTransfer =
  | LiquidationPendingTransfer
  | LiquidationSuccessTransfer
  | LiquidationFailedTransfer;

/** Result returned by liquidation execution and status lookup. */
export interface LiquidationResult {
  /** Canister-assigned liquidation id. */
  id: bigint;
  /** Unix timestamp in seconds. */
  timestamp: bigint;
  /** Debt repaid and net collateral received. */
  amounts: LiquidationAmounts;
  /** Debt asset spent by the liquidator. */
  debtAsset: LiquidationAsset;
  /** Collateral asset sent to the receiver. */
  collateralAsset: LiquidationAsset;
  /** Liquidation lifecycle state. */
  status: LiquidationStatus;
  /** Change or refund transfer to the calling principal. */
  changeTx: LiquidationTransfer;
  /** Seized collateral transfer to `receiverPrincipal`. */
  collateralTx: LiquidationTransfer;
}
