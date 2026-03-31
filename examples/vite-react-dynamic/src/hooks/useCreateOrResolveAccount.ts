import { isBitcoinWallet } from "@dynamic-labs/bitcoin";
import { isEthereumWallet } from "@dynamic-labs/ethereum";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useCallback, useState } from "react";
import {
  createOrResolveProfileId,
  formatLiquidiumError,
} from "../liquidium-client-sdk";

type DynamicPrimaryWallet = NonNullable<
  ReturnType<typeof useDynamicContext>["primaryWallet"]
>;

export function useCreateOrResolveAccount(args: {
  onStatus: (message: string) => void;
  onError: (message: string | null) => void;
}) {
  const { onError, onStatus } = args;
  const [isLoading, setIsLoading] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);

  const run = useCallback(
    async (
      primaryWallet: DynamicPrimaryWallet | null | undefined,
      liquidiumAccountAddress: string
    ) => {
      if (!primaryWallet || !liquidiumAccountAddress) {
        onError("Connect an Ethereum or Bitcoin wallet first.");
        return;
      }

      setIsLoading(true);
      onError(null);

      try {
        const signatureChain = getWalletSignatureChain(primaryWallet);

        const profileResult = await createOrResolveProfileId({
          walletAddress: liquidiumAccountAddress,
          chain: signatureChain,
          signMessage: (message) =>
            signWalletMessage(primaryWallet, message, liquidiumAccountAddress),
          onStep: onStatus,
        });

        setProfileId(profileResult.profileId);
        onStatus(
          profileResult.wasCreated
            ? `Created Liquidium profile ${profileResult.profileId}.`
            : `Wallet already has Liquidium profile ${profileResult.profileId}.`
        );
      } catch (error) {
        onError(formatLiquidiumError(error));
      } finally {
        setIsLoading(false);
      }
    },
    [onError, onStatus]
  );

  return {
    isLoading,
    profileId,
    run,
  };
}

async function signWalletMessage(
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

    const rawSignature = await primaryWallet.signMessage(message, {
      addressType: isUsingPaymentAddress ? "payment" : "ordinals",
      protocol: "ecdsa",
    });

    if (!rawSignature) {
      throw new Error("Bitcoin wallet did not return a signature.");
    }

    return normalizeBitcoinSignature(rawSignature);
  }

  throw new Error("Connected wallet is not supported by this example.");
}

function getWalletSignatureChain(
  primaryWallet: DynamicPrimaryWallet
): "ETH" | "BTC" {
  if (isEthereumWallet(primaryWallet)) {
    return "ETH";
  }

  if (isBitcoinWallet(primaryWallet)) {
    return "BTC";
  }

  throw new Error("Connected wallet is not supported by this example.");
}

function getBitcoinPaymentAddress(
  primaryWallet: DynamicPrimaryWallet
): string | null {
  const paymentAddress = primaryWallet.additionalAddresses?.find(
    (additionalAddress) => additionalAddress.type === "payment"
  )?.address;

  return paymentAddress ?? null;
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
