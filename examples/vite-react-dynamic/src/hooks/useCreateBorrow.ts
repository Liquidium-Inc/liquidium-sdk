import type { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useCallback, useState } from "react";
import {
  createBorrowOutflow,
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

const DEFAULT_BORROW_AMOUNT = "50000";

export function useCreateBorrow(args: {
  onStatus: (message: string) => void;
  onError: (message: string | null) => void;
}) {
  const { onError, onStatus } = args;
  const [isLoading, setIsLoading] = useState(false);
  const [borrowAmount, setBorrowAmount] = useState(DEFAULT_BORROW_AMOUNT);
  const [outflowAddress, setOutflowAddress] = useState("");
  const [borrowResult, setBorrowResult] = useState<OutflowDetails | null>(null);

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

      if (!/^\d+$/.test(borrowAmount)) {
        onError("Borrow amount must be a non-negative integer string.");
        return;
      }

      setIsLoading(true);
      onError(null);

      try {
        const nextBorrowResult = await createBorrowOutflow({
          profileId: params.profileId,
          poolId: params.selectedPoolId,
          amount: BigInt(borrowAmount),
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

        setBorrowResult(nextBorrowResult);
        onStatus(`Created borrow outflow ${nextBorrowResult.id}.`);
      } catch (error) {
        onError(formatLiquidiumError(error));
      } finally {
        setIsLoading(false);
      }
    },
    [borrowAmount, onError, onStatus, outflowAddress]
  );

  return {
    borrowAmount,
    borrowResult,
    isLoading,
    outflowAddress,
    run,
    setBorrowAmount,
    setOutflowAddress,
  };
}
