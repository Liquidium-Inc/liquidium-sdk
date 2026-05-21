import type { Principal } from "@dfinity/principal";
import { LiquidiumError, LiquidiumErrorCode } from "../../core/errors";
import { Chain, OutflowType } from "../../core/types";
import { getVariantKey } from "../../core/utils/variant";
import type { OutflowDetails } from "./types";

export type WalletChain = Chain;

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
      return OutflowType.withdraw;
    case "Borrow":
      return OutflowType.borrow;
    case "FeeClaim":
      return OutflowType.feeClaim;
    default:
      throw new LiquidiumError(
        LiquidiumErrorCode.INTERNAL,
        `Unsupported outflow type: ${rawOutflowType}`
      );
  }
}

export function mapWalletChainToLendingChain(
  chain: WalletChain
): LendingChainVariant {
  switch (chain) {
    case Chain.BTC:
      return { BTC: null };
    case Chain.ETH:
      return { ETH: null };
  }
}
