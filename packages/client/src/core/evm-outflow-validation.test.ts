import { mainnet, sepolia } from "viem/chains";
import { describe, expect, test } from "vitest";
import { mockDeep } from "vitest-mock-extended";
import { LiquidiumErrorCode } from "./errors";
import { guardEthereumOutflowDestination } from "./evm-outflow-validation";
import type { ApiClient } from "./transports/api-client";
import { Asset, Chain, type EvmReadClient } from "./types";

const EVM_ADDRESS = "0x52908400098527886E0F7030069857D2E4169EE7";
const EXPECTED_API_PATH =
  "/v2/ethereum/addresses/0x52908400098527886E0F7030069857D2E4169EE7/bytecode";

describe("guardEthereumOutflowDestination", () => {
  test("should allow an address without deployed bytecode using only the SDK API", async () => {
    // given
    const apiClient = mockDeep<ApiClient>();
    apiClient.get.mockResolvedValue({ hasDeployedBytecode: false });

    // when
    const result = guardEthereumOutflowDestination({
      address: EVM_ADDRESS,
      apiClient,
      asset: Asset.ETH,
      chain: Chain.ETH,
      evmReadClient: undefined,
    });

    // then
    await expect(result).resolves.toBeUndefined();
    expect(apiClient.get).toHaveBeenCalledWith(EXPECTED_API_PATH);
  });

  test("should reject a contract reported by the SDK API", async () => {
    // given
    const apiClient = mockDeep<ApiClient>();
    apiClient.get.mockResolvedValue({ hasDeployedBytecode: true });

    // when
    const result = guardEthereumOutflowDestination({
      address: EVM_ADDRESS,
      apiClient,
      asset: Asset.ETH,
      chain: Chain.ETH,
      evmReadClient: undefined,
    });

    // then
    await expect(result).rejects.toMatchObject({
      code: LiquidiumErrorCode.CONTRACT_DESTINATION_UNSUPPORTED,
      message:
        "Contract addresses are not supported for native ETH withdrawals or borrowing",
    });
  });

  test("should reject a contract reported by the configured EVM client", async () => {
    // given
    const DEPLOYED_BYTECODE = "0x1234";
    const apiClient = mockDeep<ApiClient>();
    const evmReadClient = mockDeep<Required<EvmReadClient>>();
    evmReadClient.chain.id = mainnet.id;
    evmReadClient.getCode.mockResolvedValue(DEPLOYED_BYTECODE);

    // when
    const result = guardEthereumOutflowDestination({
      address: EVM_ADDRESS,
      apiClient,
      asset: Asset.ETH,
      chain: Chain.ETH,
      evmReadClient,
    });

    // then
    await expect(result).rejects.toMatchObject({
      code: LiquidiumErrorCode.CONTRACT_DESTINATION_UNSUPPORTED,
    });
    expect(apiClient.get).not.toHaveBeenCalled();
  });

  test("should not use the SDK API after a clear EVM client check", async () => {
    // given
    const apiClient = mockDeep<ApiClient>();
    apiClient.get.mockResolvedValue({ hasDeployedBytecode: false });
    const evmReadClient = mockDeep<Required<EvmReadClient>>();
    evmReadClient.chain.id = mainnet.id;
    evmReadClient.getCode.mockResolvedValue(undefined);

    // when
    const result = guardEthereumOutflowDestination({
      address: EVM_ADDRESS,
      apiClient,
      asset: Asset.ETH,
      chain: Chain.ETH,
      evmReadClient,
    });

    // then
    await expect(result).resolves.toBeUndefined();
    expect(apiClient.get).not.toHaveBeenCalled();
  });

  test("should fail open after an EVM client failure", async () => {
    // given
    const RPC_ERROR = new Error("RPC unavailable");
    const apiClient = mockDeep<ApiClient>();
    const evmReadClient = mockDeep<Required<EvmReadClient>>();
    evmReadClient.chain.id = mainnet.id;
    evmReadClient.getCode.mockRejectedValue(RPC_ERROR);

    // when
    const result = guardEthereumOutflowDestination({
      address: EVM_ADDRESS,
      apiClient,
      asset: Asset.ETH,
      chain: Chain.ETH,
      evmReadClient,
    });

    // then
    await expect(result).resolves.toBeUndefined();
    expect(apiClient.get).not.toHaveBeenCalled();
  });

  test("should use the SDK API when the EVM client is not on Ethereum mainnet", async () => {
    // given
    const apiClient = mockDeep<ApiClient>();
    apiClient.get.mockResolvedValue({ hasDeployedBytecode: true });
    const evmReadClient = mockDeep<Required<EvmReadClient>>();
    evmReadClient.chain.id = sepolia.id;
    evmReadClient.getCode.mockResolvedValue(undefined);

    // when
    const result = guardEthereumOutflowDestination({
      address: EVM_ADDRESS,
      apiClient,
      asset: Asset.ETH,
      chain: Chain.ETH,
      evmReadClient,
    });

    // then
    await expect(result).rejects.toMatchObject({
      code: LiquidiumErrorCode.CONTRACT_DESTINATION_UNSUPPORTED,
    });
    expect(evmReadClient.getCode).not.toHaveBeenCalled();
    expect(apiClient.get).toHaveBeenCalledWith(EXPECTED_API_PATH);
  });

  test("should support a readContract-only EVM adapter", async () => {
    // given
    const apiClient = mockDeep<ApiClient>();
    apiClient.get.mockResolvedValue({ hasDeployedBytecode: false });
    const mockedEvmReadClient = mockDeep<Required<EvmReadClient>>();
    const evmReadClient: Pick<EvmReadClient, "readContract"> = {
      readContract: mockedEvmReadClient.readContract,
    };

    // when
    const result = guardEthereumOutflowDestination({
      address: EVM_ADDRESS,
      apiClient,
      asset: Asset.ETH,
      chain: Chain.ETH,
      evmReadClient,
    });

    // then
    await expect(result).resolves.toBeUndefined();
    expect(apiClient.get).toHaveBeenCalledWith(EXPECTED_API_PATH);
  });

  test("should fail open for a malformed SDK API response", async () => {
    // given
    const apiClient = mockDeep<ApiClient>();
    apiClient.get.mockResolvedValue({ hasDeployedBytecode: "false" });

    // when
    const result = guardEthereumOutflowDestination({
      address: EVM_ADDRESS,
      apiClient,
      asset: Asset.ETH,
      chain: Chain.ETH,
      evmReadClient: undefined,
    });

    // then
    await expect(result).resolves.toBeUndefined();
  });

  test("should fail open for a null SDK API response", async () => {
    // given
    const apiClient = mockDeep<ApiClient>();
    apiClient.get.mockResolvedValue(null);

    // when
    const result = guardEthereumOutflowDestination({
      address: EVM_ADDRESS,
      apiClient,
      asset: Asset.ETH,
      chain: Chain.ETH,
      evmReadClient: undefined,
    });

    // then
    await expect(result).resolves.toBeUndefined();
  });

  test("should fail open for malformed bytecode from an EVM client", async () => {
    // given
    const apiClient = mockDeep<ApiClient>();
    const evmReadClient = mockDeep<Required<EvmReadClient>>();
    evmReadClient.chain.id = mainnet.id;
    evmReadClient.getCode.mockResolvedValue("not-bytecode" as never);

    // when
    const result = guardEthereumOutflowDestination({
      address: EVM_ADDRESS,
      apiClient,
      asset: Asset.ETH,
      chain: Chain.ETH,
      evmReadClient,
    });

    // then
    await expect(result).resolves.toBeUndefined();
    expect(apiClient.get).not.toHaveBeenCalled();
  });

  test("should fail open for SDK API failures", async () => {
    // given
    const API_ERROR = new Error("Address validation unavailable");
    const apiClient = mockDeep<ApiClient>();
    apiClient.get.mockRejectedValue(API_ERROR);

    // when
    const result = guardEthereumOutflowDestination({
      address: EVM_ADDRESS,
      apiClient,
      asset: Asset.ETH,
      chain: Chain.ETH,
      evmReadClient: undefined,
    });

    // then
    await expect(result).resolves.toBeUndefined();
  });

  test("should fail open without an SDK API client", async () => {
    // given
    const apiClient = undefined;
    const evmReadClient = undefined;

    // when
    const result = guardEthereumOutflowDestination({
      address: EVM_ADDRESS,
      apiClient,
      asset: Asset.ETH,
      chain: Chain.ETH,
      evmReadClient,
    });

    // then
    await expect(result).resolves.toBeUndefined();
  });

  test.each([
    ["zero address", "0x0000000000000000000000000000000000000000"],
    ["precompile address", "0x0000000000000000000000000000000000000011"],
  ])("should reject the Ethereum %s", async (_name, address) => {
    // given
    const apiClient = mockDeep<ApiClient>();
    const evmReadClient = mockDeep<Required<EvmReadClient>>();

    // when
    const result = guardEthereumOutflowDestination({
      address,
      apiClient,
      asset: Asset.ETH,
      chain: Chain.ETH,
      evmReadClient,
    });

    // then
    await expect(result).rejects.toMatchObject({
      code: LiquidiumErrorCode.INVALID_ADDRESS,
      message:
        "Ethereum outflow destination must not be the zero address or a precompile",
    });
    expect(evmReadClient.getCode).not.toHaveBeenCalled();
    expect(apiClient.get).not.toHaveBeenCalled();
  });

  test("should not require validation dependencies for a non-Ethereum destination", async () => {
    // given

    // when
    const result = guardEthereumOutflowDestination({
      address: "1BoatSLRHtKNngkdXEeobR76b53LETtpyT",
      apiClient: undefined,
      asset: Asset.BTC,
      chain: Chain.BTC,
      evmReadClient: undefined,
    });

    // then
    await expect(result).resolves.toBeUndefined();
  });

  test.each([Asset.USDC, Asset.USDT])(
    "should skip contract validation for an %s outflow on Ethereum",
    async (asset) => {
      // given
      const apiClient = mockDeep<ApiClient>();
      const evmReadClient = mockDeep<Required<EvmReadClient>>();

      // when
      const result = guardEthereumOutflowDestination({
        address: EVM_ADDRESS,
        apiClient,
        asset,
        chain: Chain.ETH,
        evmReadClient,
      });

      // then
      await expect(result).resolves.toBeUndefined();
      expect(evmReadClient.getCode).not.toHaveBeenCalled();
      expect(apiClient.get).not.toHaveBeenCalled();
    }
  );
});
