import { base58 } from "@scure/base";
import {
  Network as BitcoinAddressNetwork,
  validate as validateBitcoinAddress,
} from "bitcoin-address-validation";
import { getAddress, isAddress } from "viem";
import { LiquidiumError, LiquidiumErrorCode } from "./errors";
import { Asset, Chain } from "./types";

export type EvmAddress = `0x${string}`;

interface NormalizeExternalAddressParams {
  address: string;
  asset: string;
  chain: string;
}

const BTC_MAINNET_ADDRESS_ERROR = "Address must be a valid mainnet BTC address";
const EVM_ADDRESS_ERROR = "Address must be a valid EVM address";
const ADDRESS_CHAIN_MISMATCH_ERROR = "Address chain must match asset";
const SOL_ADDRESS_BYTES = 32;
const SOL_ADDRESS_MAX_LENGTH = 44;
export const MAX_SOL_AMOUNT_LAMPORTS = (1n << 64n) - 1n;

export function normalizeExternalAddress(
  params: NormalizeExternalAddressParams
): string {
  if (params.asset === Asset.SOL) {
    if (params.chain !== Chain.SOL) {
      throw new LiquidiumError(
        LiquidiumErrorCode.INVALID_ADDRESS,
        ADDRESS_CHAIN_MISMATCH_ERROR
      );
    }
    return validateSolAddress(params.address);
  }
  if (params.asset === Asset.BTC) {
    if (params.chain !== Chain.BTC) {
      throw new LiquidiumError(
        LiquidiumErrorCode.INVALID_ADDRESS,
        ADDRESS_CHAIN_MISMATCH_ERROR
      );
    }

    if (
      !validateBitcoinAddress(params.address, BitcoinAddressNetwork.mainnet)
    ) {
      throw new LiquidiumError(
        LiquidiumErrorCode.INVALID_ADDRESS,
        BTC_MAINNET_ADDRESS_ERROR
      );
    }

    return params.address;
  }

  if (isEvmAsset(params.asset)) {
    if (params.chain !== Chain.ETH) {
      throw new LiquidiumError(
        LiquidiumErrorCode.INVALID_ADDRESS,
        ADDRESS_CHAIN_MISMATCH_ERROR
      );
    }

    if (!isAddress(params.address)) {
      throw new LiquidiumError(
        LiquidiumErrorCode.INVALID_ADDRESS,
        EVM_ADDRESS_ERROR
      );
    }

    return getAddress(params.address);
  }

  return params.address;
}

export function normalizeAndValidateEvmAddress(
  address: string,
  errorMessage: string
): EvmAddress {
  if (!isAddress(address)) {
    throw new LiquidiumError(LiquidiumErrorCode.INVALID_ADDRESS, errorMessage);
  }

  return getAddress(address) as EvmAddress;
}

export function validateSolAddress(address: string): string {
  try {
    if (
      address.length > SOL_ADDRESS_MAX_LENGTH ||
      base58.decode(address).length !== SOL_ADDRESS_BYTES
    ) {
      throw new Error("Invalid SOL address size");
    }
    return address;
  } catch (cause) {
    throw new LiquidiumError(
      LiquidiumErrorCode.INVALID_ADDRESS,
      "Address must be a base58-encoded 32-byte Solana address",
      cause
    );
  }
}

export function validateSolAmount(amount: bigint): void {
  if (amount <= 0n || amount > MAX_SOL_AMOUNT_LAMPORTS) {
    throw new LiquidiumError(
      LiquidiumErrorCode.VALIDATION_ERROR,
      "SOL amount must be positive and fit in uint64 lamports"
    );
  }
}

function isEvmAsset(asset: string): boolean {
  return asset === Asset.ETH || asset === Asset.USDC || asset === Asset.USDT;
}
