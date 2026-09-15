import { getAddress } from "viem";
import { mainnet } from "viem/chains";
import { LiquidiumError, LiquidiumErrorCode } from "./errors";
import { buildEthereumAddressBytecodePath } from "./sdk-api-paths";
import type { ApiClient } from "./transports/api-client";
import { Asset, Chain, type EvmReadClient } from "./types";

const EMPTY_EVM_BYTECODE = "0x";
const LAST_ETHEREUM_MAINNET_PRECOMPILE_ADDRESS = 0x11n;
const CONTRACT_DESTINATION_UNSUPPORTED_MESSAGE =
  "Contract addresses are not supported for native ETH withdrawals or borrowing";
const RESERVED_DESTINATION_MESSAGE =
  "Ethereum outflow destination must not be the zero address or a precompile";

interface GuardEthereumOutflowDestinationParams {
  address: string;
  apiClient: ApiClient | undefined;
  asset: Asset;
  chain: Chain;
  evmReadClient: EvmReadClient | undefined;
}

interface EthereumAddressBytecodeResponseWire {
  hasDeployedBytecode?: unknown;
}

/**
 * Best-effort guard against native ETH outflows to deployed contracts.
 *
 * The ckETH minter fixes native ETH withdrawal transactions at 21,000 gas and
 * warns that smart-contract destinations will likely fail. Confirmed deployed
 * bytecode is therefore rejected before signing and submission. Infrastructure
 * and malformed-response failures intentionally fail open because this check is
 * a UX safeguard, not a protocol security boundary.
 *
 * This does not apply to ckERC20 withdrawals, which use a separate token-transfer
 * path and a 65,000 gas limit.
 *
 * @see https://github.com/dfinity/ic/blob/0f3c60f6a7ba51e3306c2305072a2959b00718ef/rs/ethereum/cketh/minter/cketh_minter.did#L751-L762
 */
export async function guardEthereumOutflowDestination({
  address,
  apiClient,
  asset,
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

  if (asset !== Asset.ETH) {
    return;
  }

  if (evmReadClient?.chain?.id === mainnet.id && evmReadClient.getCode) {
    let bytecode: unknown;
    try {
      bytecode = await evmReadClient.getCode({
        address: normalizedAddress,
      });
    } catch {
      return;
    }

    if (bytecode === undefined || bytecode === EMPTY_EVM_BYTECODE) {
      return;
    }

    if (
      typeof bytecode !== "string" ||
      !/^0x(?:[0-9a-fA-F]{2})*$/.test(bytecode)
    ) {
      return;
    }

    throw new LiquidiumError(
      LiquidiumErrorCode.CONTRACT_DESTINATION_UNSUPPORTED,
      CONTRACT_DESTINATION_UNSUPPORTED_MESSAGE
    );
  }

  if (!apiClient) {
    return;
  }

  let response: unknown;
  try {
    response = await apiClient.get<EthereumAddressBytecodeResponseWire>(
      buildEthereumAddressBytecodePath({ address: normalizedAddress })
    );
  } catch {
    return;
  }

  if (
    !response ||
    typeof response !== "object" ||
    !("hasDeployedBytecode" in response) ||
    typeof response.hasDeployedBytecode !== "boolean"
  ) {
    return;
  }

  if (response.hasDeployedBytecode) {
    throw new LiquidiumError(
      LiquidiumErrorCode.CONTRACT_DESTINATION_UNSUPPORTED,
      CONTRACT_DESTINATION_UNSUPPORTED_MESSAGE
    );
  }
}
