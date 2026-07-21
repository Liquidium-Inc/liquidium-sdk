/** Lifecycle operation represented by a Liquidium status. */
export type LiquidiumOperation =
  | "deposit"
  | "borrow"
  | "repayment"
  | "withdrawal"
  | "liquidation";

/** Lifecycle state represented by a Liquidium status. */
export type LiquidiumState =
  | "action_required"
  | "confirming"
  | "processing"
  | "active"
  | "completed"
  | "failed"
  | "expired";

/** Shared lifecycle status returned by SDK methods that expose flow state. */
export interface LiquidiumStatus {
  /** Operation currently represented by the status. */
  operation: LiquidiumOperation;
  /** Current lifecycle state for the operation. */
  state: LiquidiumState;
  /** Confirmation progress while confirming, capped at the required count. */
  confirmations: number | null;
  /** Required confirmations while confirming, otherwise null. */
  requiredConfirmations: number | null;
}

interface CreateLiquidiumStatusParams {
  operation: LiquidiumOperation;
  state: LiquidiumState;
  confirmations?: number | null;
  requiredConfirmations?: number | null;
}

export function createLiquidiumStatus(
  params: CreateLiquidiumStatusParams
): LiquidiumStatus {
  return {
    operation: params.operation,
    state: params.state,
    confirmations: params.confirmations ?? null,
    requiredConfirmations: params.requiredConfirmations ?? null,
  };
}
