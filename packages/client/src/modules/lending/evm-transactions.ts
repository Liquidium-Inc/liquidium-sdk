import { encodeIcrcAccount } from "@dfinity/ledger-icrc";
import { Principal } from "@dfinity/principal";
import { encodeFunctionData } from "viem";
import { LiquidiumError, LiquidiumErrorCode } from "../../core/errors";
import {
  CK_DEPOSIT_ABI,
  CK_DEPOSIT_CONTRACT_ADDRESS,
  ERC20_ABI,
} from "../../core/evm";
import type { SupplyAction } from "../../core/types";
import { encodeInflowSubaccount } from "../../core/utils/inflow-subaccount";

export function createApproveTransaction(params: {
  tokenAddress: string;
  spenderAddress: string;
  amount: bigint;
}): { to: string; data: string } {
  return {
    to: params.tokenAddress,
    data: encodeFunctionData({
      abi: ERC20_ABI,
      functionName: "approve",
      args: [params.spenderAddress as `0x${string}`, params.amount],
    }),
  };
}

export function createTransferErc20Transaction(params: {
  tokenAddress: string;
  recipientAddress: string;
  amount: bigint;
}): { to: string; data: string } {
  return {
    to: params.tokenAddress,
    data: encodeFunctionData({
      abi: ERC20_ABI,
      functionName: "transfer",
      args: [params.recipientAddress as `0x${string}`, params.amount],
    }),
  };
}

export function createDepositErc20Transaction(params: {
  tokenAddress: string;
  amount: bigint;
  poolId: string;
  profileId: string;
  destinationAccount: string;
  action: SupplyAction;
}): { to: string; data: string } {
  const expectedDestinationAccount = encodeIcrcAccount({
    owner: Principal.fromText(params.poolId),
    subaccount: encodeInflowSubaccount({
      action: params.action,
      principal: Principal.fromText(params.profileId),
    }),
  });

  if (params.destinationAccount !== expectedDestinationAccount) {
    throw new LiquidiumError(
      LiquidiumErrorCode.VALIDATION_ERROR,
      "ETH supply destination account does not match the expected inflow account"
    );
  }

  const principalBytes32 = encodePrincipalToBytes32(
    Principal.fromText(params.poolId)
  );
  const subaccountHex = encodeBytes32Hex(
    encodeInflowSubaccount({
      action: params.action,
      principal: Principal.fromText(params.profileId),
    })
  );

  return {
    to: CK_DEPOSIT_CONTRACT_ADDRESS,
    data: encodeFunctionData({
      abi: CK_DEPOSIT_ABI,
      functionName: "depositErc20",
      args: [
        params.tokenAddress as `0x${string}`,
        params.amount,
        principalBytes32,
        subaccountHex,
      ],
    }),
  };
}

function encodePrincipalToBytes32(principal: Principal): `0x${string}` {
  const principalBytes = principal.toUint8Array();
  if (principalBytes.length > 29) {
    throw new LiquidiumError(
      LiquidiumErrorCode.VALIDATION_ERROR,
      "Principal length exceeds Ethereum bytes32 capacity"
    );
  }

  const fixedBytes = new Uint8Array(32);
  fixedBytes[0] = principalBytes.length;
  fixedBytes.set(principalBytes, 1);

  return encodeBytes32Hex(fixedBytes);
}

function encodeBytes32Hex(bytes: Uint8Array): `0x${string}` {
  return `0x${Array.from(bytes, (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("")}`;
}
