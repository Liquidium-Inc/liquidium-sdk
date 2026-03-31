import { useCallback, useEffect, useRef, useState } from "react";
import {
  formatLiquidiumError,
  getInflowStatus,
  type SupplyFlow,
  type SupplyTrackingStatus,
} from "../liquidium-client-sdk";

type BtcInflowStatusResult = SupplyTrackingStatus | null;

export function useGetBtcInflowStatus(args: {
  onStatus: (message: string) => void;
  onError: (message: string | null) => void;
}) {
  const { onError, onStatus } = args;
  const [isLoading, setIsLoading] = useState(false);
  const [isWatching, setIsWatching] = useState(false);
  const [result, setResult] = useState<BtcInflowStatusResult>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const stopWatching = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setIsWatching(false);
  }, []);

  useEffect(() => stopWatching, [stopWatching]);

  const run = useCallback(
    async (params: {
      profileId: string | null;
      txid?: string;
      supplyFlow?: SupplyFlow | null;
    }) => {
      if (!params.profileId) {
        onError("Create or resolve a Liquidium profile first.");
        return;
      }

      setIsLoading(true);
      onError(null);

      try {
        if (params.supplyFlow) {
          const response = await params.supplyFlow.getStatus({
            txid: params.txid,
          });

          setResult(response);
          onStatus(
            response
              ? `Fetched BTC inflow status for ${response.txid}.`
              : "No BTC inflow status found yet."
          );
        } else {
          const response = await getInflowStatus({
            profileId: params.profileId,
            txid: params.txid,
          });
          const nextStatus = response.inflows[0]
            ? {
                ...response.inflows[0],
                remainingConfirmations:
                  response.inflows[0].confirmations === null
                    ? response.inflows[0].requiredConfirmations
                    : Math.max(
                        response.inflows[0].requiredConfirmations -
                          response.inflows[0].confirmations,
                        0
                      ),
                isDetected: response.inflows[0].stage !== "LOGGED",
                isAvailable: response.inflows[0].stage === "CONFIRMED",
                estimatedMsUntilAvailable:
                  (response.inflows[0].confirmations === null
                    ? response.inflows[0].requiredConfirmations
                    : Math.max(
                        response.inflows[0].requiredConfirmations -
                          response.inflows[0].confirmations,
                        0
                       )) *
                  10 *
                  60 *
                  1000,
                expectedAvailableAtMs: null,
              }
            : null;

          setResult(nextStatus);
          onStatus(`Fetched ${response.inflows.length} BTC inflow status entries.`);
        }
      } catch (error) {
        onError(formatLiquidiumError(error));
      } finally {
        setIsLoading(false);
      }
    },
    [onError, onStatus]
  );

  const watch = useCallback(
    async (params: {
      profileId: string | null;
      txid?: string;
      supplyFlow?: SupplyFlow | null;
    }) => {
      if (!params.profileId) {
        onError("Create or resolve a Liquidium profile first.");
        return;
      }

      if (!params.supplyFlow) {
        onError("Prepare a BTC supply flow before starting polling.");
        return;
      }

      stopWatching();
      const nextAbortController = new AbortController();
      abortControllerRef.current = nextAbortController;
      setIsWatching(true);
      setIsLoading(true);
      onError(null);
      onStatus("Watching BTC inflow status every 5 seconds...");

      try {
        for await (const update of params.supplyFlow.watchStatus({
          txid: params.txid,
          signal: nextAbortController.signal,
        })) {
          setResult(update);
          onStatus(
            update.isAvailable
              ? `BTC inflow ${update.txid} is now available.`
              : `BTC inflow ${update.txid} is ${update.stage.toLowerCase()} with ${update.remainingConfirmations ?? 0} confirmations remaining.`
          );
        }
      } catch (error) {
        if (nextAbortController.signal.aborted) {
          onStatus("Stopped BTC inflow polling.");
          return;
        }

        onError(formatLiquidiumError(error));
      } finally {
        if (abortControllerRef.current === nextAbortController) {
          abortControllerRef.current = null;
        }

        setIsWatching(false);
        setIsLoading(false);
      }
    },
    [onError, onStatus, stopWatching]
  );

  return {
    isLoading,
    isWatching,
    result,
    run,
    stopWatching,
    watch,
  };
}
