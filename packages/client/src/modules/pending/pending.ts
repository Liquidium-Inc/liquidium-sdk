import { LiquidiumError, LiquidiumErrorCode } from "../../core/errors";
import type { ApiClient } from "../../core/transports/api-client";
import type { CanisterContext } from "../../core/transports/canister-context";
import type { Chain } from "../../core/types";
import { parseBigInt } from "../../core/utils/bigint";
import type {
  PendingInflowKind,
  PendingInflowMovement,
  PendingInflowStage,
  PendingMovement,
  PendingOutflowKind,
  PendingOutflowMovement,
  PendingOutflowStatus,
} from "./types";

type PendingMovementBaseWire = {
  id: string;
  poolId: string;
  asset: string;
  chain: Chain;
  amount: string;
  timestampMs: number;
  txid: string | null;
  requiredConfirmations: number;
  confirmations: number | null;
};

type PendingInflowMovementWire = PendingMovementBaseWire & {
  direction: "inflow";
  kind: "deposit" | "repayment";
  stage: "LOGGED" | "CONFIRMED" | "PENDING" | "FINALISING";
  feeRateSatsPerVByte: number | null;
};

type PendingOutflowMovementWire = PendingMovementBaseWire & {
  direction: "outflow";
  kind: "borrow" | "withdraw";
  status: "PENDING" | "SENT";
};

type PendingMovementWire =
  | PendingInflowMovementWire
  | PendingOutflowMovementWire;

type PendingMovementsResponse = {
  success: true;
  movements: PendingMovementWire[];
};

export class PendingModule {
  constructor(
    readonly canisterContext: CanisterContext,
    readonly apiClient: ApiClient | undefined
  ) {}

  /**
   * Lists all pending inflows (supplies, repayments) and outflows
   * (borrows, withdrawals) for a profile, enriched with live
   * BTC/ETH confirmation counts and BTC fee rates.
   *
   * Outflows already confirmed on chain are suppressed.
   *
   * Each movement is discriminated by `direction: "inflow" | "outflow"`.
   *
   * @param profileId - The Liquidium profile principal text.
   * @returns Unified list of pending movements.
   */
  async list(profileId: string): Promise<PendingMovement[]> {
    const apiClient = this.requireApi();
    const requestPath = `/v1/pending?profileId=${encodeURIComponent(profileId)}`;
    const response = await apiClient.get<PendingMovementsResponse>(requestPath);

    return response.movements.map(mapPendingMovement);
  }

  private requireApi(): ApiClient {
    if (!this.apiClient) {
      throw new LiquidiumError(
        LiquidiumErrorCode.SERVICE_UNAVAILABLE,
        "Pending movements require an API base URL in client config"
      );
    }

    return this.apiClient;
  }
}

function mapPendingMovement(wire: PendingMovementWire): PendingMovement {
  if (wire.direction === "inflow") {
    return mapInflowMovement(wire);
  }

  return mapOutflowMovement(wire);
}

function mapInflowMovement(
  wire: PendingInflowMovementWire
): PendingInflowMovement {
  return {
    ...mapBase(wire),
    direction: "inflow",
    kind: mapInflowKind(wire.kind),
    stage: mapInflowStage(wire.stage),
    feeRateSatsPerVByte: wire.feeRateSatsPerVByte,
  };
}

function mapOutflowMovement(
  wire: PendingOutflowMovementWire
): PendingOutflowMovement {
  return {
    ...mapBase(wire),
    direction: "outflow",
    kind: mapOutflowKind(wire.kind),
    status: mapOutflowStatus(wire.status),
  };
}

function mapBase(wire: PendingMovementBaseWire) {
  return {
    id: wire.id,
    poolId: wire.poolId,
    asset: wire.asset,
    chain: wire.chain,
    amount: parseBigInt(wire.amount, "pending movement amount"),
    timestampMs: wire.timestampMs,
    txid: wire.txid,
    requiredConfirmations: wire.requiredConfirmations,
    confirmations: wire.confirmations,
  };
}

function mapInflowKind(
  kind: PendingInflowMovementWire["kind"]
): PendingInflowKind {
  switch (kind) {
    case "deposit":
      return "Deposit";
    case "repayment":
      return "Repayment";
  }
}

function mapOutflowKind(
  kind: PendingOutflowMovementWire["kind"]
): PendingOutflowKind {
  switch (kind) {
    case "borrow":
      return "Borrow";
    case "withdraw":
      return "Withdraw";
  }
}

function mapInflowStage(
  stage: PendingInflowMovementWire["stage"]
): PendingInflowStage {
  switch (stage) {
    case "LOGGED":
      return "Logged";
    case "CONFIRMED":
      return "Confirmed";
    case "PENDING":
      return "Pending";
    case "FINALISING":
      return "Finalising";
  }
}

function mapOutflowStatus(
  status: PendingOutflowMovementWire["status"]
): PendingOutflowStatus {
  switch (status) {
    case "PENDING":
      return "Pending";
    case "SENT":
      return "Sent";
  }
}
