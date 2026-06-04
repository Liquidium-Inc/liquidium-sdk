import {
  Network as BitcoinAddressNetwork,
  validate as validateBitcoinAddress,
} from "bitcoin-address-validation";
import { getAddress, isAddress } from "viem";
import { LiquidiumError, LiquidiumErrorCode } from "./errors";
import { Asset, Chain } from "./types";

export type EvmAddress = `0x${string}`;

export interface NormalizeExternalAddressParams {
  address: string;
  asset: string;
  chain: string;
}

const BTC_MAINNET_ADDRESS_ERROR = "Address must be a valid mainnet BTC address";
const EVM_ADDRESS_ERROR = "Address must be a valid EVM address";
const ADDRESS_CHAIN_MISMATCH_ERROR = "Address chain must match asset";

export function normalizeExternalAddress(
  params: NormalizeExternalAddressParams
): string {
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

  if (isEthStablecoin(params.asset)) {
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

function isEthStablecoin(asset: string): boolean {
  return asset === Asset.USDC || asset === Asset.USDT;
}
