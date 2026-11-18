import { expect, test, vi } from "vite-plus/test";
import { mockDeep } from "vitest-mock-extended";
import { createDynamicWalletAdapter as createContractWalletAdapter } from "../../../contract-interaction-flow/src/dynamic-wallet";
import { createDynamicWalletAdapter as createDepositWalletAdapter } from "../../../deposit-address-flow/src/dynamic-wallet";

type PrimaryWallet = NonNullable<
  Parameters<typeof createContractWalletAdapter>[0]
>;

interface WalletMessageRequest {
  account: string;
  message: string;
}

const WALLET_ADDRESS = "0x1111111111111111111111111111111111111111";
const SIGNATURE = "0x1234";
const MESSAGE = "Authorize Liquidium";
const ETHEREUM_MAINNET_CHAIN_ID = "1";

const ADAPTER_FACTORIES = [
  { name: "contract interaction", createAdapter: createContractWalletAdapter },
  { name: "deposit address", createAdapter: createDepositWalletAdapter },
];

for (const { name, createAdapter } of ADAPTER_FACTORIES) {
  test(`${name} signs through a connector without SDK class identity`, async () => {
    // given
    const signMessage = vi.fn<(message: string) => Promise<string>>();
    signMessage.mockResolvedValue(
      SIGNATURE satisfies Awaited<ReturnType<typeof signMessage>>
    );

    const wallet = mockDeep<PrimaryWallet>({
      chain: "EVM",
      address: WALLET_ADDRESS,
      connector: Object.assign(mockDeep<PrimaryWallet["connector"]>(), {
        signMessage,
      }),
    });

    // when
    const adapter = createAdapter(wallet);

    const signature = await adapter.signMessage?.({
      chain: "ETH",
      message: MESSAGE,
      actionType: "create-account",
    });

    // then
    expect(signature).toBe(SIGNATURE);
    expect(signMessage).toHaveBeenCalledWith(MESSAGE);
  });

  test(`${name} keeps the asynchronous connector wallet-client fallback`, async () => {
    // given
    const signMessage =
      vi.fn<(request: WalletMessageRequest) => Promise<`0x${string}`>>();

    signMessage.mockResolvedValue(
      SIGNATURE satisfies Awaited<ReturnType<typeof signMessage>>
    );
    const walletClient = { signMessage };
    const getWalletClient = vi.fn(async (_chainId?: string) => walletClient);

    const wallet = mockDeep<PrimaryWallet>({
      chain: "EVM",
      address: WALLET_ADDRESS,
      connector: Object.assign(mockDeep<PrimaryWallet["connector"]>(), {
        signMessage: undefined,
        getWalletClient,
      }),
    });

    // when
    const adapter = createAdapter(wallet);

    const signature = await adapter.signMessage?.({
      chain: "ETH",
      message: MESSAGE,
      actionType: "create-account",
    });

    // then
    expect(signature).toBe(SIGNATURE);
    expect(getWalletClient).toHaveBeenCalledWith(ETHEREUM_MAINNET_CHAIN_ID);
    expect(signMessage).toHaveBeenCalledWith({
      account: WALLET_ADDRESS,
      message: MESSAGE,
    });
  });
}
