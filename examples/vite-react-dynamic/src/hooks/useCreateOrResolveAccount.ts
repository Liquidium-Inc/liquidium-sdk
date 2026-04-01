import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useCallback, useState } from "react";
import {
  createOrResolveProfileId,
  formatLiquidiumError,
} from "../liquidium-client-sdk";
import {
  getWalletSignatureChain,
  signWalletMessage,
} from "../wallet-signing";

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
