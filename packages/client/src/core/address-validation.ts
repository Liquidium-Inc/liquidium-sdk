import {
  Network as BitcoinAddressNetwork,
  validate as validateBitcoinAddress,
} from "bitcoin-address-validation";
import { getAddress, isAddress } from "viem";
import { LiquidiumError, LiquidiumErrorCode } from "./errors";
import { Asset, Chain } from "./types";

export type EvmAddress = `0x${string}`;
export type ExternalAddressValidationError =
  | "invalid_mainnet_btc_address"
  | "invalid_evm_address";

export type ExternalAddressValidationResult =
  | { success: true; address: string }
  | { success: false; error: ExternalAddressValidationError };

export function normalizeExternalAddress(params: {
  address: string;
  asset: string;
  chain?: string;
}): ExternalAddressValidationResult {
  if (isBtcMainnetAddressTarget(params)) {
    if (
      !validateBitcoinAddress(params.address, BitcoinAddressNetwork.mainnet)
    ) {
      return { success: false, error: "invalid_mainnet_btc_address" };
    }

    return { success: true, address: params.address };
  }

  if (isEvmAddressTarget(params)) {
    if (!isAddress(params.address)) {
      return { success: false, error: "invalid_evm_address" };
    }

    return { success: true, address: getAddress(params.address) };
  }

  return { success: true, address: params.address };
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

function isBtcMainnetAddressTarget(params: {
  asset: string;
  chain?: string;
}): boolean {
  return (
    params.asset === Asset.BTC && (!params.chain || params.chain === Chain.BTC)
  );
}

function isEvmAddressTarget(params: {
  asset: string;
  chain?: string;
}): boolean {
  if (params.chain && params.chain !== Chain.ETH) {
    return false;
  }

  return params.asset === Asset.USDC || params.asset === Asset.USDT;
}
