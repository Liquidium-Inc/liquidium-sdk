import { describe, expect, test, vi } from "vitest";
import { mockDeep } from "vitest-mock-extended";
import { LiquidiumError, LiquidiumErrorCode } from "./errors";
import { guardEthereumOutflowDestination } from "./evm-outflow-validation";
import type { ApiClient } from "./transports/api-client";
import { Chain, type EvmReadClient } from "./types";

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
      chain: Chain.ETH,
      evmReadClient: undefined,
    });

    // then
    await expect(result).rejects.toMatchObject({
      code: LiquidiumErrorCode.CONTRACT_DESTINATION_UNSUPPORTED,
      message:
        "Contract addresses are not supported for Ethereum withdrawals or borrowing",
    });
  });

  test("should reject a contract reported by the configured EVM client", async () => {
    // given
    const DEPLOYED_BYTECODE = "0x1234";
    const apiClient = mockDeep<ApiClient>();
    const evmReadClient = {
      getCode: vi.fn().mockResolvedValue(DEPLOYED_BYTECODE),
      readContract: vi.fn(),
    } as EvmReadClient;

    // when
    const result = guardEthereumOutflowDestination({
      address: EVM_ADDRESS,
      apiClient,
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
    const evmReadClient = {
      getCode: vi.fn().mockResolvedValue(undefined),
      readContract: vi.fn(),
    } as EvmReadClient;

    // when
    const result = guardEthereumOutflowDestination({
      address: EVM_ADDRESS,
      apiClient,
      chain: Chain.ETH,
      evmReadClient,
    });

    // then
    await expect(result).resolves.toBeUndefined();
    expect(apiClient.get).not.toHaveBeenCalled();
  });

  test("should propagate EVM client failures without using the SDK API", async () => {
    // given
    const RPC_ERROR = new Error("RPC unavailable");
    const apiClient = mockDeep<ApiClient>();
    const evmReadClient = {
      getCode: vi.fn().mockRejectedValue(RPC_ERROR),
      readContract: vi.fn(),
    } as EvmReadClient;

    // when
    const result = guardEthereumOutflowDestination({
      address: EVM_ADDRESS,
      apiClient,
      chain: Chain.ETH,
      evmReadClient,
    });

    // then
    await expect(result).rejects.toBe(RPC_ERROR);
    expect(apiClient.get).not.toHaveBeenCalled();
  });

  test("should support a readContract-only EVM adapter", async () => {
    // given
    const apiClient = mockDeep<ApiClient>();
    apiClient.get.mockResolvedValue({ hasDeployedBytecode: false });
    const evmReadClient = {
      readContract: vi.fn(),
    } as EvmReadClient;

    // when
    const result = guardEthereumOutflowDestination({
      address: EVM_ADDRESS,
      apiClient,
      chain: Chain.ETH,
      evmReadClient,
    });

    // then
    await expect(result).resolves.toBeUndefined();
    expect(apiClient.get).toHaveBeenCalledWith(EXPECTED_API_PATH);
  });

  test("should fail closed for a malformed SDK API response", async () => {
    // given
    const apiClient = mockDeep<ApiClient>();
    apiClient.get.mockResolvedValue({ hasDeployedBytecode: "false" });

    // when
    const result = guardEthereumOutflowDestination({
      address: EVM_ADDRESS,
      apiClient,
      chain: Chain.ETH,
      evmReadClient: undefined,
    });

    // then
    await expect(result).rejects.toMatchObject({
      code: LiquidiumErrorCode.INTERNAL,
      message: "Ethereum outflow validation returned an invalid response",
    });
  });

  test("should propagate SDK API failures", async () => {
    // given
    const API_ERROR = new LiquidiumError(
      LiquidiumErrorCode.SERVICE_UNAVAILABLE,
      "Address validation unavailable"
    );
    const apiClient = mockDeep<ApiClient>();
    apiClient.get.mockRejectedValue(API_ERROR);

    // when
    const result = guardEthereumOutflowDestination({
      address: EVM_ADDRESS,
      apiClient,
      chain: Chain.ETH,
      evmReadClient: undefined,
    });

    // then
    await expect(result).rejects.toBe(API_ERROR);
  });

  test.each([
    ["zero address", "0x0000000000000000000000000000000000000000"],
    ["precompile address", "0x0000000000000000000000000000000000000011"],
  ])("should reject the Ethereum %s", async (_name, address) => {
    // given
    const apiClient = mockDeep<ApiClient>();
    const getCode = vi.fn();
    const evmReadClient = {
      getCode,
      readContract: vi.fn(),
    } as EvmReadClient;

    // when
    const result = guardEthereumOutflowDestination({
      address,
      apiClient,
      chain: Chain.ETH,
      evmReadClient,
    });

    // then
    await expect(result).rejects.toMatchObject({
      code: LiquidiumErrorCode.INVALID_ADDRESS,
      message:
        "Ethereum outflow destination must not be the zero address or a precompile",
    });
    expect(getCode).not.toHaveBeenCalled();
    expect(apiClient.get).not.toHaveBeenCalled();
  });

  test("should not require validation dependencies for a non-Ethereum destination", async () => {
    // given

    // when
    const result = guardEthereumOutflowDestination({
      address: "1BoatSLRHtKNngkdXEeobR76b53LETtpyT",
      apiClient: undefined,
      chain: Chain.BTC,
      evmReadClient: undefined,
    });

    // then
    await expect(result).resolves.toBeUndefined();
  });
});
