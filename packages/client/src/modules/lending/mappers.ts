import { Principal } from "@icp-sdk/core/principal";
import {
  type CanisterLiquidiumAccount,
  decodeIcrcAccountAddress,
  type LiquidiumAccountInput,
  type LiquidiumAccountType,
  mapCanisterAccountToLiquidiumAccount,
  normalizeIcpAccountIdentifier,
} from "../../core/accounts";
import { normalizeExternalAddress } from "../../core/address-validation";
import { LiquidiumError, LiquidiumErrorCode } from "../../core/errors";
import { Chain, OutflowType, type SigningChain } from "../../core/types";
import { getVariantKey } from "../../core/utils/variant";
import type { OutflowDetails } from "./types";

type MessageAccountType = "AccountIdentifier" | "External" | "Icrc" | "Native";

export interface LendingBtcChainVariant {
  BTC: null;
}

export interface LendingEthChainVariant {
  ETH: null;
}

export type LendingChainVariant =
  | LendingBtcChainVariant
  | LendingEthChainVariant;

export interface ParsedOutflowDestination {
  address: string;
  accountType: LiquidiumAccountType;
  canisterAccount: CanisterLiquidiumAccount;
  messageAccount: {
    type: MessageAccountType;
    data: string;
  };
}

export interface ParseOutflowDestinationParams {
  destination: LiquidiumAccountInput;
  asset: string;
  poolChain: string;
  destinationChain: string;
}

interface NormalizedOutflowDestinationInput {
  address: string;
  type: LiquidiumAccountType | null;
}

export interface CanisterOutflowRecord {
  id: string;
  txid: [] | [string];
  outflow_type: Record<string, null>;
  outflow_ref: [] | [string];
  amount: bigint;
  receiver: CanisterLiquidiumAccount;
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
  receiver: CanisterLiquidiumAccount
): OutflowDetails["receiver"] {
  return mapCanisterAccountToLiquidiumAccount(receiver);
}

export function parseOutflowDestination(
  params: ParseOutflowDestinationParams
): ParsedOutflowDestination {
  const destination = normalizeOutflowDestinationInput(params.destination);
  const parsedAccount = destination.type
    ? parseOutflowDestinationWithHint(destination)
    : parseOutflowDestinationAutomatically(destination.address);

  assertDestinationTypeSupportedByChain({
    accountType: parsedAccount.accountType,
    poolChain: params.poolChain,
    destinationChain: params.destinationChain,
  });

  if (parsedAccount.accountType !== "ChainAddress") {
    return parsedAccount;
  }

  const externalAddress = normalizeExternalAddress({
    address: parsedAccount.address,
    asset: params.asset,
    chain: params.destinationChain,
  });

  return {
    address: externalAddress,
    accountType: "ChainAddress",
    canisterAccount: { External: externalAddress },
    messageAccount: { type: "External", data: externalAddress },
  };
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
  chain: SigningChain
): LendingChainVariant {
  switch (chain) {
    case Chain.BTC:
      return { BTC: null };
    case Chain.ETH:
      return { ETH: null };
  }

  throw new LiquidiumError(
    LiquidiumErrorCode.VALIDATION_ERROR,
    `Message signing is not supported for ${String(chain)}`
  );
}

function normalizeOutflowDestinationInput(
  destination: LiquidiumAccountInput
): NormalizedOutflowDestinationInput {
  if (typeof destination === "string") {
    return { address: destination, type: null };
  }

  return destination;
}

function parseOutflowDestinationWithHint(
  destination: NormalizedOutflowDestinationInput
): ParsedOutflowDestination {
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
): ParsedOutflowDestination {
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

function parseExternalDestination(address: string): ParsedOutflowDestination {
  return {
    address,
    accountType: "ChainAddress",
    canisterAccount: { External: address },
    messageAccount: { type: "External", data: address },
  };
}

function parseIcPrincipalDestination(
  address: string
): ParsedOutflowDestination {
  const principal = Principal.fromText(address);
  const principalText = principal.toText();

  return {
    address: principalText,
    accountType: "IcPrincipal",
    canisterAccount: { Native: principal },
    messageAccount: { type: "Native", data: principalText },
  };
}

function parseIcrcDestination(address: string): ParsedOutflowDestination {
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
): ParsedOutflowDestination {
  const accountIdentifier = normalizeIcpAccountIdentifier(address);

  return {
    address: accountIdentifier,
    accountType: "IcpAccountIdentifier",
    canisterAccount: { AccountIdentifier: accountIdentifier },
    messageAccount: { type: "AccountIdentifier", data: accountIdentifier },
  };
}

function assertDestinationTypeSupportedByChain(params: {
  accountType: LiquidiumAccountType;
  poolChain: string;
  destinationChain: string;
}): void {
  if (params.poolChain === Chain.BTC || params.poolChain === Chain.ETH) {
    if (
      params.destinationChain === params.poolChain &&
      params.accountType === "ChainAddress"
    ) {
      return;
    }

    if (
      params.destinationChain === Chain.ICP &&
      params.accountType === "IcPrincipal"
    ) {
      return;
    }
  }

  if (params.poolChain === Chain.ICP && params.destinationChain === Chain.ICP) {
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
