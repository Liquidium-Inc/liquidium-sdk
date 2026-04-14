import { isBitcoinWallet } from "@dynamic-labs/bitcoin";
import { isEthereumWallet } from "@dynamic-labs/ethereum";
import type { useDynamicContext } from "@dynamic-labs/sdk-react-core";

type DynamicPrimaryWallet = NonNullable<
  ReturnType<typeof useDynamicContext>["primaryWallet"]
>;

type SendBitcoinTransactionRequest = {
  toAddress: string;
  amountSats: bigint;
};

export type SignatureChain = "ETH" | "BTC";

export function getWalletSignatureChain(
  primaryWallet: DynamicPrimaryWallet
): SignatureChain {
  if (isEthereumWallet(primaryWallet)) {
    return "ETH";
  }

  if (isBitcoinWallet(primaryWallet)) {
    return "BTC";
  }

  throw new Error("Connected wallet is not supported by this example.");
}

export async function signWalletMessage(
  primaryWallet: DynamicPrimaryWallet,
  message: string,
  liquidiumAccountAddress: string
): Promise<string> {
  if (isEthereumWallet(primaryWallet)) {
    const rawSignature = await primaryWallet.signMessage(message);

    if (!rawSignature) {
      throw new Error("Ethereum wallet did not return a signature.");
    }

    return strip0xPrefix(rawSignature);
  }

  if (isBitcoinWallet(primaryWallet)) {
    const paymentAddress = getBitcoinPaymentAddress(primaryWallet);
    const isUsingPaymentAddress =
      Boolean(paymentAddress) && paymentAddress === liquidiumAccountAddress;
    const addressType = isUsingPaymentAddress ? "payment" : "ordinals";

    console.debug("[liquidium] BTC signMessage request", {
      walletAddress: primaryWallet.address,
      paymentAddress,
      liquidiumAccountAddress,
      addressType,
      protocol: "ecdsa",
      message,
    });

    const rawSignature = await primaryWallet.signMessage(message, {
      addressType,
      protocol: "ecdsa",
    });

    if (!rawSignature) {
      throw new Error("Bitcoin wallet did not return a signature.");
    }

    console.debug("[liquidium] BTC signMessage response", {
      walletAddress: primaryWallet.address,
      paymentAddress,
      liquidiumAccountAddress,
      addressType,
      rawSignature,
    });

    return normalizeBitcoinSignature(rawSignature);
  }

  throw new Error("Connected wallet is not supported by this example.");
}

export function getBitcoinPaymentAddress(
  primaryWallet: DynamicPrimaryWallet
): string | null {
  const paymentAddress = primaryWallet.additionalAddresses?.find(
    (additionalAddress) => additionalAddress.type === "payment"
  )?.address;

  return paymentAddress ?? null;
}

export async function sendBitcoinTransaction(
  primaryWallet: DynamicPrimaryWallet,
  request: SendBitcoinTransactionRequest
): Promise<string> {
  if (!isBitcoinWallet(primaryWallet)) {
    throw new Error("Connected wallet does not support BTC transactions.");
  }

  const txid = await primaryWallet.sendBitcoin({
    recipientAddress: request.toAddress,
    amount: request.amountSats,
  });

  if (!txid) {
    throw new Error("Bitcoin wallet did not return a transaction id.");
  }

  return txid;
}

function normalizeBitcoinSignature(signature: string): string {
  if (isHexSignature(signature)) {
    return strip0xPrefix(signature);
  }

  try {
    const binary = atob(signature);
    let hexSignature = "";

    for (let index = 0; index < binary.length; index += 1) {
      const byteAsHex = binary.charCodeAt(index).toString(16).padStart(2, "0");
      hexSignature += byteAsHex;
    }

    return hexSignature;
  } catch {
    return strip0xPrefix(signature);
  }
}

function strip0xPrefix(signature: string): string {
  return signature.startsWith("0x") ? signature.slice(2) : signature;
}

function isHexSignature(signature: string): boolean {
  const normalizedSignature = signature.startsWith("0x")
    ? signature.slice(2)
    : signature;

  return /^[0-9a-fA-F]+$/.test(normalizedSignature);
}
