import { AccountIdentifier, SubAccount } from "@icp-sdk/canisters/ledger/icp";
import {
  decodeIcrcAccount as decodeIcrcAccountText,
  encodeIcrcAccount,
} from "@icp-sdk/canisters/ledger/icrc";
import { Principal } from "@icp-sdk/core/principal";

/** ICRC account display shape shared by lending and instant-loan responses. */
export interface IcrcAccount {
  /** Account kind discriminator. */
  type: "Icrc";
  /** ICRC account owner principal text. */
  owner: string;
  /** Optional ICRC subaccount bytes. */
  subaccount?: Uint8Array;
  /** Text-encoded ICRC account for display. */
  address: string;
}

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
    type: "Icrc",
    owner: params.owner.toText(),
    subaccount: params.subaccount,
    address: encodeIcrcAccount({
      owner: params.owner,
      subaccount: params.subaccount,
    }),
  };
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
