import type { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useCallback, useState } from "react";
import {
  createWithdrawOutflow,
  formatLiquidiumError,
  type OutflowDetails,
} from "../liquidium-client-sdk";
import {
  getWalletSignatureChain,
  signWalletMessage,
} from "../wallet-signing";

type DynamicPrimaryWallet = NonNullable<
  ReturnType<typeof useDynamicContext>["primaryWallet"]
>;

const DEFAULT_WITHDRAW_AMOUNT = "50000";

export function useCreateWithdraw(args: {
  onStatus: (message: string) => void;
  onError: (message: string | null) => void;
}) {
  const { onError, onStatus } = args;
  const [isLoading, setIsLoading] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState(DEFAULT_WITHDRAW_AMOUNT);
  const [outflowAddress, setOutflowAddress] = useState("");
  const [withdrawResult, setWithdrawResult] = useState<OutflowDetails | null>(
    null
  );

  const run = useCallback(
    async (params: {
      primaryWallet: DynamicPrimaryWallet | null | undefined;
      profileId: string | null;
      selectedPoolId: string;
      liquidiumAccountAddress: string;
    }) => {
      if (!params.primaryWallet || !params.liquidiumAccountAddress) {
        onError("Connect an Ethereum or Bitcoin wallet first.");
        return;
      }

      if (!params.profileId) {
        onError("Create or resolve a Liquidium profile first.");
        return;
      }

      if (!params.selectedPoolId) {
        onError("Load pools and choose a pool first.");
        return;
      }

      const primaryWallet = params.primaryWallet;

      const trimmedOutflowAddress = outflowAddress.trim();
      if (!trimmedOutflowAddress) {
        onError("Enter a custom outflow address first.");
        return;
      }

      if (!/^\d+$/.test(withdrawAmount)) {
        onError("Withdraw amount must be a non-negative integer string.");
        return;
      }

      setIsLoading(true);
      onError(null);

      try {
        const nextWithdrawResult = await createWithdrawOutflow({
          profileId: params.profileId,
          poolId: params.selectedPoolId,
          amount: BigInt(withdrawAmount),
          account: trimmedOutflowAddress,
          signerAccount: params.liquidiumAccountAddress,
          chain: getWalletSignatureChain(primaryWallet),
          signMessage: (message) =>
            signWalletMessage(
              primaryWallet,
              message,
              params.liquidiumAccountAddress
            ),
          onStep: onStatus,
        });

        setWithdrawResult(nextWithdrawResult);
        onStatus(`Created withdraw outflow ${nextWithdrawResult.id}.`);
      } catch (error) {
        onError(formatLiquidiumError(error));
      } finally {
        setIsLoading(false);
      }
    },
    [onError, onStatus, outflowAddress, withdrawAmount]
  );

  return {
    isLoading,
    outflowAddress,
    run,
    setOutflowAddress,
    setWithdrawAmount,
    withdrawAmount,
    withdrawResult,
  };
}
