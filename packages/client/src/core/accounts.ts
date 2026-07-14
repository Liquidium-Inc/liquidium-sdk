import { AccountIdentifier, SubAccount } from "@icp-sdk/canisters/ledger/icp";
import {
  decodeIcrcAccount as decodeIcrcAccountText,
  encodeIcrcAccount,
} from "@icp-sdk/canisters/ledger/icrc";
import { Principal } from "@icp-sdk/core/principal";

/** Account type hint for Liquidium account inputs and normalized account responses. */
export const LiquidiumAccountType = {
  ChainAddress: "ChainAddress",
  IcPrincipal: "IcPrincipal",
  IcpAccountIdentifier: "IcpAccountIdentifier",
  IcrcAccount: "IcrcAccount",
} as const;
/** Account type hint for Liquidium account inputs and normalized account responses. */
export type LiquidiumAccountType =
  (typeof LiquidiumAccountType)[keyof typeof LiquidiumAccountType];

/** Chain-native destination account, such as a BTC or EVM address. */
export interface ChainAddressAccount {
  /** Account type. */
  type: "ChainAddress";
  /** Chain-native address. */
  address: string;
}

/** IC principal account. */
export interface IcPrincipalAccount {
  /** Account type. */
  type: "IcPrincipal";
  /** Principal text. */
  address: string;
}

/** Legacy ICP ledger account identifier. */
export interface IcpAccountIdentifierAccount {
  /** Account type. */
  type: "IcpAccountIdentifier";
  /** ICP ledger account identifier text. */
  address: string;
}

/** ICRC account display shape shared by lending and Simple Loans responses. */
export interface IcrcAccount {
  /** Account type. */
  type: "IcrcAccount";
  /** ICRC account owner principal text. */
  owner: string;
  /** Optional ICRC subaccount bytes. */
  subaccount?: Uint8Array;
  /** Text-encoded ICRC account for display. */
  address: string;
}

/** Normalized Liquidium account returned by SDK flows. */
export type LiquidiumAccount =
  | ChainAddressAccount
  | IcPrincipalAccount
  | IcpAccountIdentifierAccount
  | IcrcAccount;

/** Address input with an optional account type hint. */
export interface LiquidiumAccountReference {
  /** Address, principal, ICRC account, or ICP account identifier. */
  address: string;
  /** Account type hint. Use string shorthand when the SDK should auto-detect. */
  type: LiquidiumAccountType;
}

/** Account input accepted by SDK flows that can auto-detect string addresses. */
export type LiquidiumAccountInput = string | LiquidiumAccountReference;

export interface CanisterNativeAccount {
  Native: Principal;
}

export interface CanisterExternalAccount {
  External: string;
}

export interface CanisterAccountIdentifierAccount {
  AccountIdentifier: string;
}

export interface CanisterIcrcAccount {
  Icrc: {
    owner: Principal;
    subaccount: [] | [Uint8Array | number[]];
  };
}

export type CanisterLiquidiumAccount =
  | CanisterNativeAccount
  | CanisterExternalAccount
  | CanisterAccountIdentifierAccount
  | CanisterIcrcAccount;

export interface DecodedIcrcAccount {
  owner: Principal;
  subaccount?: Uint8Array;
  account: IcrcAccount;
}

export function createIcrcAccount(params: {
  owner: Principal;
  subaccount?: Uint8Array;
}): IcrcAccount {
  return {
    type: "IcrcAccount",
    owner: params.owner.toText(),
    subaccount: params.subaccount,
    address: encodeIcrcAccount({
      owner: params.owner,
      subaccount: params.subaccount,
    }),
  };
}

export function mapCanisterAccountToLiquidiumAccount(
  account: CanisterLiquidiumAccount
): LiquidiumAccount {
  if ("Native" in account) {
    return { type: "IcPrincipal", address: account.Native.toText() };
  }

  if ("AccountIdentifier" in account) {
    return {
      type: "IcpAccountIdentifier",
      address: account.AccountIdentifier,
    };
  }

  if ("Icrc" in account) {
    const subaccount = normalizeOptionalSubaccount(account.Icrc.subaccount[0]);

    return {
      type: "IcrcAccount",
      owner: account.Icrc.owner.toText(),
      subaccount,
      address: encodeIcrcAccount({
        owner: account.Icrc.owner,
        subaccount,
      }),
    };
  }

  return { type: "ChainAddress", address: account.External };
}

export function decodeIcrcAccountAddress(address: string): DecodedIcrcAccount {
  const decoded = decodeIcrcAccountText(address);
  const owner = Principal.fromText(decoded.owner.toText());
  const subaccount = decoded.subaccount
    ? Uint8Array.from(decoded.subaccount)
    : undefined;

  return {
    owner,
    subaccount,
    account: createIcrcAccount({ owner, subaccount }),
  };
}

export function encodeIcpAccountIdentifier(params: {
  owner: Principal;
  subaccount?: Uint8Array;
}): string {
  return AccountIdentifier.fromPrincipal({
    principal: params.owner,
    subAccount: params.subaccount
      ? SubAccount.fromBytes(params.subaccount)
      : undefined,
  }).toHex();
}

export function normalizeIcpAccountIdentifier(address: string): string {
  return AccountIdentifier.fromHex(address).toHex();
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
