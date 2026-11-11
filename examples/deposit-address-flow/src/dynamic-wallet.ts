import { isEthereumWallet } from "@dynamic-labs/ethereum";
import type { EthereumWalletConnector } from "@dynamic-labs/ethereum";
import type { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import type { WalletAdapter } from "@liquidium/client";

const ETH_MAINNET_CHAIN_ID_STRING = "1";

type PrimaryWallet = ReturnType<typeof useDynamicContext>["primaryWallet"];

type DynamicWalletClient = Pick<
  NonNullable<ReturnType<EthereumWalletConnector["getWalletClient"]>>,
  "signMessage"
>;

type DynamicEvmConnector = {
  getWalletClient?(
    chainId?: string
  ): DynamicWalletClient | Promise<DynamicWalletClient | undefined> | undefined;
  signMessage?: EthereumWalletConnector["signMessage"];
};

export function getConnectedWalletAddress(
  primaryWallet: PrimaryWallet
): string {
  if (!primaryWallet || !isEthereumWallet(primaryWallet)) {
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
  const account = getConnectedWalletAddress(primaryWallet);

  if (!primaryWallet || !isEthereumWallet(primaryWallet)) {
    throw new Error("Connect an Ethereum wallet first.");
  }

  // SAFETY: The EVM guard establishes the connector contract omitted by its base
  // type. Both EVM methods remain optional and are checked before use below.
  const connector = primaryWallet.connector as DynamicEvmConnector | undefined;

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
        // SAFETY: Dynamic supplies an EVM address after the Ethereum wallet guard.
        return await walletClient.signMessage({
          account: account as `0x${string}`,
          message: request.message,
        });
      }

      throw new Error("Connected wallet does not support message signing.");
    },
  };
}
