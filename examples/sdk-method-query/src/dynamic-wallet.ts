import { isEthereumWallet } from "@dynamic-labs/ethereum";
import type { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { isSolanaWallet } from "@dynamic-labs/solana";
import type { WalletAdapter } from "@liquidium/client";
import { createDynamicWalletAdapter } from "../../contract-interaction-flow/src/dynamic-wallet";
import { createSolanaWalletAdapter } from "./solana-wallet";

type PrimaryWallet = ReturnType<typeof useDynamicContext>["primaryWallet"];

export function createConnectedWalletAdapter(
  primaryWallet: PrimaryWallet
): WalletAdapter {
  if (!primaryWallet) {
    throw new Error("Connect an ETH or SOL wallet first.");
  }

  if (isSolanaWallet(primaryWallet)) {
    return createSolanaWalletAdapter(primaryWallet);
  }

  if (!isEthereumWallet(primaryWallet)) {
    throw new Error("Connected wallet mode supports ETH and SOL wallets.");
  }

  const adapter = createDynamicWalletAdapter(primaryWallet);
  const { signMessage, sendEthTransaction } = adapter;

  if (!signMessage || !sendEthTransaction) {
    throw new Error("Ethereum adapter is missing signing or sending support.");
  }

  return {
    signMessage: async (request) => {
      if (request.chain !== "ETH") {
        throw new Error(
          "The connected Ethereum wallet only signs ETH requests."
        );
      }

      if (
        request.account &&
        request.account.toLowerCase() !== primaryWallet.address.toLowerCase()
      ) {
        throw new Error(
          "The request account does not match the connected wallet."
        );
      }

      return signMessage(request);
    },
    sendEthTransaction: async (request) => {
      if (
        request.account &&
        request.account.toLowerCase() !== primaryWallet.address.toLowerCase()
      ) {
        throw new Error(
          "The request account does not match the connected wallet."
        );
      }

      return sendEthTransaction(request);
    },
  };
}
