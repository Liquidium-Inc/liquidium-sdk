import { encodeIcrcAccount } from "@icp-sdk/canisters/ledger/icrc";
import { Principal } from "@icp-sdk/core/principal";
import {
  decodeIcrcAccountAddress,
  normalizeIcpAccountIdentifier,
} from "../../core/accounts";
import { normalizeExternalAddress } from "../../core/address-validation";
import { LiquidiumError, LiquidiumErrorCode } from "../../core/errors";
import { Chain, OutflowType } from "../../core/types";
import { getVariantKey } from "../../core/utils/variant";
import { TransferMode } from "../../core/wallet-actions";
import type {
  OutflowAccountType,
  OutflowDestination,
  OutflowDetails,
} from "./types";

type MessageAccountType = "AccountIdentifier" | "External" | "Icrc" | "Native";

export type WalletChain = Chain;

export interface LendingBtcChainVariant {
  BTC: null;
}

export interface LendingEthChainVariant {
  ETH: null;
}

export interface LendingIcpChainVariant {
  ICP: null;
}

export type LendingChainVariant =
  | LendingBtcChainVariant
  | LendingEthChainVariant
  | LendingIcpChainVariant;

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

export interface ParsedOutflowDestination {
  address: string;
  accountType: OutflowAccountType;
  canisterAccount: CanisterOutflowReceiver;
  messageAccount: {
    type: MessageAccountType;
    data: string;
  };
  transferMode: TransferMode;
}

export interface ParseOutflowDestinationParams {
  destination: OutflowDestination;
  asset: string;
  chain: string;
}

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
      type: "IcPrincipal",
      principal: receiver.Native.toText(),
    };
  }
  if ("AccountIdentifier" in receiver) {
    return {
      type: "IcpAccountIdentifier",
      accountIdentifier: receiver.AccountIdentifier,
    };
  }
  if ("Icrc" in receiver) {
    const subaccount = normalizeOptionalSubaccount(receiver.Icrc.subaccount[0]);

    return {
      type: "IcrcAccount",
      owner: receiver.Icrc.owner.toText(),
      subaccount,
      address: encodeIcrcAccount({
        owner: receiver.Icrc.owner,
        subaccount,
      }),
    };
  }

  return {
    type: "ChainAddress",
    address: receiver.External,
  };
}

export function parseOutflowDestination(
  params: ParseOutflowDestinationParams
): ParsedOutflowDestination {
  const parsedAccount = params.destination.type
    ? parseOutflowDestinationWithHint(params.destination)
    : parseOutflowDestinationAutomatically(params.destination.address);

  assertDestinationTypeSupportedByChain({
    accountType: parsedAccount.accountType,
    chain: params.chain,
  });

  if (parsedAccount.accountType !== "ChainAddress") {
    return {
      ...parsedAccount,
      transferMode:
        params.chain === Chain.ICP ? TransferMode.native : TransferMode.ck,
    };
  }

  const externalAddress = normalizeExternalAddress({
    address: parsedAccount.address,
    asset: params.asset,
    chain: params.chain,
  });

  return {
    address: externalAddress,
    accountType: "ChainAddress",
    canisterAccount: { External: externalAddress },
    messageAccount: { type: "External", data: externalAddress },
    transferMode: TransferMode.native,
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
      return OutflowType.withdrawal;
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
    case Chain.ICP:
      return { ICP: null };
  }
}

function parseOutflowDestinationWithHint(
  destination: OutflowDestination
): Omit<ParsedOutflowDestination, "transferMode"> {
  try {
    switch (destination.type) {
      case "ChainAddress":
        return parseExternalDestination(destination.address);
      case "IcPrincipal":
        return parseIcPrincipalDestination(destination.address);
      case "IcrcAccount":
        return parseIcrcDestination(destination.address);
      case "IcpAccountIdentifier":
        return parseAccountIdentifierDestination(destination.address);
      default:
        throw new LiquidiumError(
          LiquidiumErrorCode.VALIDATION_ERROR,
          `Unsupported outflow account type: ${String(destination.type)}`
        );
    }
  } catch (error) {
    if (error instanceof LiquidiumError) {
      throw error;
    }

    throw new LiquidiumError(
      LiquidiumErrorCode.INVALID_ADDRESS,
      `Invalid ${destination.type} outflow destination`
    );
  }
}

function parseOutflowDestinationAutomatically(
  address: string
): Omit<ParsedOutflowDestination, "transferMode"> {
  const parsers = [
    parseAccountIdentifierDestination,
    parseIcPrincipalDestination,
    parseIcrcDestination,
  ];

  for (const parser of parsers) {
    try {
      return parser(address);
    } catch {}
  }

  return parseExternalDestination(address);
}

function parseExternalDestination(
  address: string
): Omit<ParsedOutflowDestination, "transferMode"> {
  return {
    address,
    accountType: "ChainAddress",
    canisterAccount: { External: address },
    messageAccount: { type: "External", data: address },
  };
}

function parseIcPrincipalDestination(
  address: string
): Omit<ParsedOutflowDestination, "transferMode"> {
  const principal = Principal.fromText(address);
  const principalText = principal.toText();

  return {
    address: principalText,
    accountType: "IcPrincipal",
    canisterAccount: { Native: principal },
    messageAccount: { type: "Native", data: principalText },
  };
}

function parseIcrcDestination(
  address: string
): Omit<ParsedOutflowDestination, "transferMode"> {
  const decoded = decodeIcrcAccountAddress(address);

  return {
    address: decoded.account.address,
    accountType: "IcrcAccount",
    canisterAccount: {
      Icrc: {
        owner: decoded.owner,
        subaccount: decoded.subaccount ? [decoded.subaccount] : [],
      },
    },
    messageAccount: { type: "Icrc", data: decoded.account.address },
  };
}

function parseAccountIdentifierDestination(
  address: string
): Omit<ParsedOutflowDestination, "transferMode"> {
  const accountIdentifier = normalizeIcpAccountIdentifier(address);

  return {
    address: accountIdentifier,
    accountType: "IcpAccountIdentifier",
    canisterAccount: { AccountIdentifier: accountIdentifier },
    messageAccount: { type: "AccountIdentifier", data: accountIdentifier },
  };
}

function assertDestinationTypeSupportedByChain(params: {
  accountType: OutflowAccountType;
  chain: string;
}): void {
  if (params.chain === Chain.BTC || params.chain === Chain.ETH) {
    if (
      params.accountType === "ChainAddress" ||
      params.accountType === "IcPrincipal"
    ) {
      return;
    }
  }

  if (params.chain === Chain.ICP) {
    if (
      params.accountType === "IcpAccountIdentifier" ||
      params.accountType === "IcrcAccount" ||
      params.accountType === "IcPrincipal"
    ) {
      return;
    }
  }

  throw new LiquidiumError(
    LiquidiumErrorCode.VALIDATION_ERROR,
    "Target pool does not support this address type"
  );
}
