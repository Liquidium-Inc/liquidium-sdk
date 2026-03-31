import { useCallback, useMemo, useState } from "react";
import {
  findBtcPool,
  formatLiquidiumError,
  loadPoolsAndDefaultSelection,
  type Pool,
} from "../liquidium-client-sdk";

export function useLoadPools(args: {
  onStatus: (message: string) => void;
  onError: (message: string | null) => void;
}) {
  const { onError, onStatus } = args;
  const [isLoading, setIsLoading] = useState(false);
  const [pools, setPools] = useState<Pool[]>([]);
  const [selectedPoolId, setSelectedPoolId] = useState("");

  const run = useCallback(async () => {
    setIsLoading(true);
    onError(null);

    try {
      const { pools: nextPools, selectedPoolId: nextSelectedPoolId } =
        await loadPoolsAndDefaultSelection();

      setPools(nextPools);
      setSelectedPoolId(nextSelectedPoolId);
      onStatus(`Loaded ${nextPools.length} pools.`);
    } catch (error) {
      onError(formatLiquidiumError(error));
    } finally {
      setIsLoading(false);
    }
  }, [onError, onStatus]);

  const btcPool = useMemo(() => findBtcPool(pools), [pools]);

  return {
    btcPool,
    isLoading,
    pools,
    run,
    selectedPoolId,
    setSelectedPoolId,
  };
}
