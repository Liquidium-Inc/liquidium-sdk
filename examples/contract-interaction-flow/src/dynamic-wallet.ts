import { isEthereumWallet } from "@dynamic-labs/ethereum";
import type { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import type { WalletAdapter } from "@liquidium/client";

const ETH_MAINNET_CHAIN_ID = 1;
const ETH_MAINNET_CHAIN_ID_STRING = ETH_MAINNET_CHAIN_ID.toString();
const ETH_MAINNET_NETWORK_NAME = "Ethereum";

type PrimaryWallet = ReturnType<typeof useDynamicContext>["primaryWallet"];

type DynamicWalletClient = {
  signMessage?(request: {
    account: `0x${string}`;
    message: string;
  }): Promise<`0x${string}`>;
  sendTransaction(request: {
    account: `0x${string}`;
    to: `0x${string}`;
    data?: `0x${string}`;
    value?: bigint;
  }): Promise<`0x${string}`>;
};

type DynamicEvmConnector = {
  getWalletClient?(
    chainId?: string
  ): DynamicWalletClient | Promise<DynamicWalletClient | undefined> | undefined;
  signMessage?(messageToSign: string): Promise<string | undefined>;
  getNetwork?(): Promise<number | undefined>;
  supportsNetworkSwitching?(): boolean;
  switchNetwork?(request: {
    networkChainId: number;
    networkName?: string;
  }): Promise<void>;
};

type DynamicEthereumWallet = {
  connector?: DynamicEvmConnector;
  getWalletClient?: DynamicEvmConnector["getWalletClient"];
};

export function getConnectedWalletAddress(
  primaryWallet: PrimaryWallet
): string {
  if (!primaryWallet) {
    throw new Error("Connect an Ethereum wallet first.");
  }

  if (!isEthereumWallet(primaryWallet)) {
    throw new Error("Connect an Ethereum wallet first.");
  }

  if (!primaryWallet.address) {
    throw new Error("Connected wallet has no address.");
  }

  return primaryWallet.address;
}

export function createDynamicWalletAdapter(
  primaryWallet: PrimaryWallet
): WalletAdapter {
  const account = getConnectedWalletAddress(primaryWallet) as `0x${string}`;
  const connector = primaryWallet?.connector as DynamicEvmConnector | undefined;

  return {
    signMessage: async (request) => {
      if (connector?.signMessage) {
        const signature = await connector.signMessage(request.message);

        if (!signature) {
          throw new Error("Wallet did not return a signature.");
        }

        return signature;
      }

      const walletClient = await connector?.getWalletClient?.(
        ETH_MAINNET_CHAIN_ID_STRING
      );

      if (walletClient?.signMessage) {
        return await walletClient.signMessage({
          account,
          message: request.message,
        });
      }

      throw new Error("Connected wallet does not support message signing.");
    },
    sendEthTransaction: async ({ transaction }) => {
      await ensureEthereumMainnet(primaryWallet);

      const walletClient = await getDynamicWalletClient(primaryWallet);

      return await walletClient.sendTransaction({
        account,
        to: transaction.to as `0x${string}`,
        ...(transaction.data
          ? { data: transaction.data as `0x${string}` }
          : {}),
        ...(transaction.value ? { value: BigInt(transaction.value) } : {}),
      });
    },
  };
}

async function ensureEthereumMainnet(
  primaryWallet: PrimaryWallet
): Promise<void> {
  const connector = getDynamicEthereumWallet(primaryWallet).connector;

  if (!connector?.getNetwork) {
    return;
  }

  const currentChainId = await connector.getNetwork();

  if (!currentChainId || currentChainId === ETH_MAINNET_CHAIN_ID) {
    return;
  }

  if (
    connector.supportsNetworkSwitching?.() === false ||
    !connector.switchNetwork
  ) {
    throw new Error(
      "Switch connected wallet to Ethereum mainnet before submitting."
    );
  }

  await connector.switchNetwork({
    networkChainId: ETH_MAINNET_CHAIN_ID,
    networkName: ETH_MAINNET_NETWORK_NAME,
  });
}

async function getDynamicWalletClient(
  primaryWallet: PrimaryWallet
): Promise<DynamicWalletClient> {
  const dynamicWallet = getDynamicEthereumWallet(primaryWallet);
  const walletClient = dynamicWallet.getWalletClient
    ? await dynamicWallet.getWalletClient(ETH_MAINNET_CHAIN_ID_STRING)
    : await dynamicWallet.connector?.getWalletClient?.(
        ETH_MAINNET_CHAIN_ID_STRING
      );

  if (!walletClient) {
    throw new Error(
      "Connected wallet does not expose an Ethereum wallet client."
    );
  }

  return walletClient;
}

function getDynamicEthereumWallet(
  primaryWallet: PrimaryWallet
): DynamicEthereumWallet {
  return primaryWallet as DynamicEthereumWallet;
}
