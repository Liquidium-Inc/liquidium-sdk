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

/** Asset route used by a liquidation. */
export interface LiquidationAsset {
  /** Chain-key ledger asset or an asset type the canister cannot identify. */
  type: "ck_asset" | "unknown";
  /** Chain-key ledger canister principal when `type` is `ck_asset`. */
  ledgerCanisterId?: string;
}

/** Liquidation lifecycle state returned by the lending canister. */
export interface LiquidationStatus {
  /** Current liquidation lifecycle state. */
  state:
    | "pending"
    | "inflow_processed"
    | "core_executed"
    | "success"
    | "failed_liquidation"
    | "collateral_transfer_failed"
    | "change_transfer_failed";
  /** Protocol error message for a failed state. */
  error?: string;
}

/** Collateral or change transfer state for a liquidation. */
export interface LiquidationTransfer {
  /** Current transfer state. */
  state: "pending" | "success" | "failed";
  /** Chain transaction id when assigned. */
  txid?: string;
  /** Transfer error message when the transfer failed. */
  error?: string;
}

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
