import { isBitcoinWallet } from "@dynamic-labs/bitcoin";
import { isEthereumWallet } from "@dynamic-labs/ethereum";
import type { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { getBitcoinPaymentAddress } from "./wallet-signing";

export type DynamicPrimaryWallet = NonNullable<
  ReturnType<typeof useDynamicContext>["primaryWallet"]
>;

export function getWalletChainLabel(
  primaryWallet: DynamicPrimaryWallet | null | undefined
): string | null {
  if (!primaryWallet) {
    return null;
  }

  if (isEthereumWallet(primaryWallet)) {
    return "Ethereum";
  }

  if (isBitcoinWallet(primaryWallet)) {
    return "Bitcoin";
  }

  return null;
}

export function getLiquidiumAccountAddress(
  primaryWallet: DynamicPrimaryWallet | null | undefined
): string | null {
  if (!primaryWallet) {
    return null;
  }

  if (isBitcoinWallet(primaryWallet)) {
    return getBitcoinPaymentAddress(primaryWallet) ?? primaryWallet.address;
  }

  return primaryWallet.address;
}
