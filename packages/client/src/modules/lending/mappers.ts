import { encodeIcrcAccount } from "@icp-sdk/canisters/ledger/icrc";
import type { Principal } from "@icp-sdk/core/principal";
import { LiquidiumError, LiquidiumErrorCode } from "../../core/errors";
import { Chain, OutflowType } from "../../core/types";
import { getVariantKey } from "../../core/utils/variant";
import type { OutflowDetails } from "./types";

export type WalletChain = Chain;

export interface LendingBtcChainVariant {
  BTC: null;
}

export interface LendingEthChainVariant {
  ETH: null;
}

export type LendingChainVariant =
  | LendingBtcChainVariant
  | LendingEthChainVariant;

export interface CanisterNativeOutflowReceiver {
  Native: Principal;
}

export interface CanisterExternalOutflowReceiver {
  External: string;
}

export interface CanisterAccountIdentifierOutflowReceiver {
  AccountIdentifier: string;
}

export interface CanisterIcrcOutflowReceiver {
  Icrc: {
    owner: Principal;
    subaccount: [] | [Uint8Array | number[]];
  };
}

export type CanisterOutflowReceiver =
  | CanisterNativeOutflowReceiver
  | CanisterExternalOutflowReceiver
  | CanisterAccountIdentifierOutflowReceiver
  | CanisterIcrcOutflowReceiver;

export interface CanisterOutflowRecord {
  id: string;
  txid: [] | [string];
  outflow_type: Record<string, null>;
  outflow_ref: [] | [string];
  amount: bigint;
  receiver: CanisterOutflowReceiver;
}

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
  if ("AccountIdentifier" in receiver) {
    return {
      type: "AccountIdentifier",
      account: receiver.AccountIdentifier,
    };
  }
  if ("Icrc" in receiver) {
    const subaccount = normalizeOptionalSubaccount(receiver.Icrc.subaccount[0]);

    return {
      type: "Icrc",
      owner: receiver.Icrc.owner.toText(),
      subaccount,
      account: encodeIcrcAccount({
        owner: receiver.Icrc.owner,
        subaccount,
      }),
    };
  }

  return {
    type: "External",
    account: receiver.External,
  };
}

function normalizeOptionalSubaccount(
  subaccount: Uint8Array | number[] | undefined
): Uint8Array | undefined {
  if (!subaccount) {
    return undefined;
  }

  return subaccount instanceof Uint8Array
    ? subaccount
    : Uint8Array.from(subaccount);
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
