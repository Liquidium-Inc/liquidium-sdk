import type { Principal } from "@dfinity/principal";
import { getVariantKey } from "../../core/utils/variant";
import type {
  GetInflowStatusResponse,
  OutflowDetails,
  SupplyTrackingStatus,
} from "./types";

const BITCOIN_BLOCK_TIME_MS = 10 * 60 * 1000;

export type WalletChain = "BTC" | "ETH";

export type LendingChainVariant = { BTC: null } | { ETH: null };

export type CanisterOutflowReceiver =
  | { Native: Principal }
  | { External: string };

export type CanisterOutflowRecord = {
  id: string;
  txid: [] | [string];
  outflow_type: Record<string, null>;
  outflow_ref: [] | [string];
  amount: bigint;
  receiver: CanisterOutflowReceiver;
};

export function mapCanisterOutflowDetails(
  outflow: CanisterOutflowRecord
): OutflowDetails {
  const rawOutflowType = getVariantKey(outflow.outflow_type);

  return {
    id: outflow.id,
    outflowType: normalizeOutflowType(rawOutflowType),
    outflowRef: outflow.outflow_ref[0],
    txid: outflow.txid[0],
    amount: outflow.amount,
    receiver: mapCanisterAccountType(outflow.receiver),
  };
}

export function mapCanisterAccountType(
  receiver: CanisterOutflowReceiver
): OutflowDetails["receiver"] {
  if ("Native" in receiver) {
    return {
      type: "Native",
      account: receiver.Native.toText(),
    };
  }

  return {
    type: "External",
    account: receiver.External,
  };
}

export function normalizeOutflowType(
  rawOutflowType: string
): OutflowDetails["outflowType"] {
  switch (rawOutflowType) {
    case "Withdraw":
      return "withdraw";
    case "Borrow":
      return "borrow";
    case "FeeClaim":
      return "feeClaim";
    default:
      throw new Error(`Unsupported outflow type: ${rawOutflowType}`);
  }
}

export function mapWalletChainToLendingChain(
  chain: WalletChain
): LendingChainVariant {
  switch (chain) {
    case "BTC":
      return { BTC: null };
    case "ETH":
      return { ETH: null };
  }
}

export function mapBtcInflowToSupplyTrackingStatus(
  inflow: GetInflowStatusResponse["inflows"][number]
): SupplyTrackingStatus {
  const remainingConfirmations =
    inflow.confirmations === null
      ? inflow.requiredConfirmations
      : Math.max(inflow.requiredConfirmations - inflow.confirmations, 0);
  const estimatedMsUntilAvailable =
    remainingConfirmations * BITCOIN_BLOCK_TIME_MS;

  return {
    txid: inflow.txid,
    inflowId: inflow.inflowId,
    poolId: inflow.poolId,
    type: inflow.type,
    stage: inflow.stage,
    amountSats: inflow.amountSats,
    timestampMs: inflow.timestampMs,
    confirmations: inflow.confirmations,
    requiredConfirmations: inflow.requiredConfirmations,
    remainingConfirmations,
    isDetected: inflow.stage !== "LOGGED",
    isAvailable: inflow.stage === "CONFIRMED",
    estimatedMsUntilAvailable,
    expectedAvailableAtMs: Date.now() + estimatedMsUntilAvailable,
  };
}
