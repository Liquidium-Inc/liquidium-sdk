import { getAddress } from "viem";
import { LiquidiumError, LiquidiumErrorCode } from "./errors";
import { buildEthereumAddressBytecodePath } from "./sdk-api-paths";
import type { ApiClient } from "./transports/api-client";
import { Chain, type EvmReadClient } from "./types";

const EMPTY_EVM_BYTECODE = "0x";
const LAST_ETHEREUM_MAINNET_PRECOMPILE_ADDRESS = 0x11n;
const CONTRACT_DESTINATION_UNSUPPORTED_MESSAGE =
  "Contract addresses are not supported for Ethereum withdrawals or borrowing";
const RESERVED_DESTINATION_MESSAGE =
  "Ethereum outflow destination must not be the zero address or a precompile";

interface GuardEthereumOutflowDestinationParams {
  address: string;
  apiClient: ApiClient | undefined;
  chain: Chain;
  evmReadClient: EvmReadClient | undefined;
}

interface EthereumAddressBytecodeResponseWire {
  hasDeployedBytecode?: unknown;
}

export async function guardEthereumOutflowDestination({
  address,
  apiClient,
  chain,
  evmReadClient,
}: GuardEthereumOutflowDestinationParams): Promise<void> {
  if (chain !== Chain.ETH) {
    return;
  }

  const normalizedAddress = getAddress(address);
  if (BigInt(normalizedAddress) <= LAST_ETHEREUM_MAINNET_PRECOMPILE_ADDRESS) {
    throw new LiquidiumError(
      LiquidiumErrorCode.INVALID_ADDRESS,
      RESERVED_DESTINATION_MESSAGE
    );
  }

  if (evmReadClient?.getCode) {
    const bytecode = await evmReadClient.getCode({
      address: normalizedAddress,
    });
    if (bytecode !== undefined && bytecode !== EMPTY_EVM_BYTECODE) {
      throw new LiquidiumError(
        LiquidiumErrorCode.CONTRACT_DESTINATION_UNSUPPORTED,
        CONTRACT_DESTINATION_UNSUPPORTED_MESSAGE
      );
    }

    return;
  }

  if (!apiClient) {
    throw new LiquidiumError(
      LiquidiumErrorCode.VALIDATION_ERROR,
      "Ethereum outflow validation requires an API client"
    );
  }

  const response = await apiClient.get<EthereumAddressBytecodeResponseWire>(
    buildEthereumAddressBytecodePath({ address: normalizedAddress })
  );
  if (typeof response.hasDeployedBytecode !== "boolean") {
    throw new LiquidiumError(
      LiquidiumErrorCode.INTERNAL,
      "Ethereum outflow validation returned an invalid response"
    );
  }

  if (response.hasDeployedBytecode) {
    throw new LiquidiumError(
      LiquidiumErrorCode.CONTRACT_DESTINATION_UNSUPPORTED,
      CONTRACT_DESTINATION_UNSUPPORTED_MESSAGE
    );
  }
}
