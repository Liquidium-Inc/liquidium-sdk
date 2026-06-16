import { isBitcoinWallet } from "@dynamic-labs/bitcoin";
import type { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import type { WalletAdapter } from "@liquidium/client";

type PrimaryWallet = ReturnType<typeof useDynamicContext>["primaryWallet"];

const BITCOIN_PAYMENT_ADDRESS_TYPE = "payment";

interface DynamicBitcoinAddress {
  address?: string;
  type?: string;
  addressType?: string;
}

interface DynamicBitcoinWalletWithAdditionalAddresses {
  address?: string;
  additionalAddresses?: DynamicBitcoinAddress[];
}

interface DynamicBitcoinWalletWithAddressTypeSigning {
  signMessage(
    message: string,
    options?: { addressType: typeof BITCOIN_PAYMENT_ADDRESS_TYPE }
  ): Promise<string | undefined>;
}

export function getOptionalConnectedBitcoinAddress(
  primaryWallet: PrimaryWallet
): string {
  if (!primaryWallet || !isBitcoinWallet(primaryWallet)) {
    return "";
  }

  return getPaymentBitcoinAddress(primaryWallet) ?? "";
}

export function getConnectedBitcoinAddress(
  primaryWallet: PrimaryWallet
): string {
  const wallet = getBitcoinWallet(primaryWallet);
  const address = getPaymentBitcoinAddress(wallet);

  if (!address) {
    throw new Error("Connected Bitcoin wallet has no address.");
  }

  return address;
}

export function createDynamicBitcoinWalletAdapter(
  primaryWallet: PrimaryWallet
): WalletAdapter {
  const wallet = getBitcoinWallet(primaryWallet);

  return {
    signMessage: async (request) => {
      const signature = await (
        wallet as DynamicBitcoinWalletWithAddressTypeSigning
      ).signMessage(request.message, {
        addressType: BITCOIN_PAYMENT_ADDRESS_TYPE,
      });

      if (!signature) {
        throw new Error("Bitcoin wallet did not return a signature.");
      }

      return signature;
    },
    sendBtcTransaction: async ({ toAddress, amountSats }) => {
      if (!amountSats || amountSats <= 0n) {
        throw new Error("BTC transaction requires a positive satoshi amount.");
      }

      const txid = await wallet.sendBitcoin({
        amount: amountSats,
        recipientAddress: toAddress,
      });

      if (!txid) {
        throw new Error("Bitcoin wallet did not return a transaction id.");
      }

      return txid;
    },
  };
}

function getBitcoinWallet(primaryWallet: PrimaryWallet) {
  if (!primaryWallet || !isBitcoinWallet(primaryWallet)) {
    throw new Error("Connect a Bitcoin wallet first.");
  }

  return primaryWallet;
}

function getPaymentBitcoinAddress(
  wallet: DynamicBitcoinWalletWithAdditionalAddresses
): string | null {
  const paymentAddress = wallet.additionalAddresses
    ?.find(isPaymentAddress)
    ?.address?.trim();

  return paymentAddress || wallet.address?.trim() || null;
}

function isPaymentAddress(address: DynamicBitcoinAddress): boolean {
  return (
    address.type === BITCOIN_PAYMENT_ADDRESS_TYPE ||
    address.addressType === BITCOIN_PAYMENT_ADDRESS_TYPE
  );
}
