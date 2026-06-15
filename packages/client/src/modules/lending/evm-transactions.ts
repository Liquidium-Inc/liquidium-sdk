import { encodeIcrcAccount } from "@icp-sdk/canisters/ledger/icrc";
import { Principal } from "@icp-sdk/core/principal";
import { encodeFunctionData } from "viem";
import { LiquidiumError, LiquidiumErrorCode } from "../../core/errors";
import { CK_DEPOSIT_ABI, ERC20_ABI } from "../../core/evm";
import type { SupplyAction } from "../../core/types";
import { encodeInflowSubaccount } from "../../core/utils/inflow-subaccount";
import type {
  CreateTransferErc20TransactionParams,
  EvmContractTransaction,
} from "./types";

/** Parameters for an ERC-20 approve transaction. */
export interface CreateApproveTransactionParams {
  /** ERC-20 token contract address. */
  tokenAddress: string;
  /** Contract address approved to spend tokens. */
  spenderAddress: string;
  /** Approval amount in token base units. */
  amount: bigint;
}

/** Parameters for an ERC-20 deposit-helper transaction. */
export interface CreateDepositErc20TransactionParams {
  /** Deposit helper contract address. */
  depositContractAddress: string;
  /** ERC-20 token contract address. */
  tokenAddress: string;
  /** Deposit amount in token base units. */
  amount: bigint;
  /** Pool principal text receiving the inflow. */
  poolId: string;
  /** Liquidium profile principal text. */
  profileId: string;
  /** Expected ICRC destination account text. */
  destinationAccount: string;
  /** Deposit or repayment action for the inflow. */
  action: SupplyAction;
}

/** Builds calldata for an ERC-20 `approve(spender, amount)` transaction. */
export function createApproveTransaction(
  params: CreateApproveTransactionParams
): EvmContractTransaction {
  return {
    to: params.tokenAddress,
    data: encodeFunctionData({
      abi: ERC20_ABI,
      functionName: "approve",
      args: [params.spenderAddress as `0x${string}`, params.amount],
    }),
  };
}

/** Builds calldata for an ERC-20 `transfer(recipient, amount)` transaction. */
export function createTransferErc20Transaction(
  params: CreateTransferErc20TransactionParams
): EvmContractTransaction {
  return {
    to: params.tokenAddress,
    data: encodeFunctionData({
      abi: ERC20_ABI,
      functionName: "transfer",
      args: [params.recipientAddress as `0x${string}`, params.amount],
    }),
  };
}

/** Builds calldata for depositing ERC-20 funds into the ckETH deposit helper. */
export function createDepositErc20Transaction(
  params: CreateDepositErc20TransactionParams
): EvmContractTransaction {
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
    to: params.depositContractAddress,
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
