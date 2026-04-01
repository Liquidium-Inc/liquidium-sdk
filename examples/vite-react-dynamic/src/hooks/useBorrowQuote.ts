import { useCallback, useState } from "react";
import {
  formatLiquidiumError,
  getBorrowQuote,
  type BorrowQuote,
} from "../liquidium-client-sdk";

export function useBorrowQuote(args: {
  onStatus: (message: string) => void;
  onError: (message: string | null) => void;
}) {
  const { onError, onStatus } = args;
  const [isLoading, setIsLoading] = useState(false);
  const [quote, setQuote] = useState<BorrowQuote | null>(null);

  const run = useCallback(
    async (params: {
      profileId: string | null;
      selectedPoolId: string;
      borrowAmount: string;
    }) => {
      if (!params.profileId) {
        onError("Create or resolve a Liquidium profile first.");
        return;
      }

      if (!params.selectedPoolId) {
        onError("Load pools and choose a pool first.");
        return;
      }

      if (!/^\d+$/.test(params.borrowAmount)) {
        onError("Borrow amount must be a non-negative integer string.");
        return;
      }

      setIsLoading(true);
      onError(null);

      try {
        const nextQuote = await getBorrowQuote({
          profileId: params.profileId,
          poolId: params.selectedPoolId,
          amount: BigInt(params.borrowAmount),
        });

        setQuote(nextQuote);
        onStatus(`Loaded borrow quote for ${nextQuote.asset} on ${nextQuote.chain}.`);
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
    quote,
    run,
    setQuote,
  };
}
