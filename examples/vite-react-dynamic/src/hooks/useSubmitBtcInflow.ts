import { useCallback, useState } from "react";
import {
  formatLiquidiumError,
  submitInflowTxid,
  type SupplyFlow,
} from "../liquidium-client-sdk";

export function useSubmitBtcInflow(args: {
  onStatus: (message: string) => void;
  onError: (message: string | null) => void;
}) {
  const { onError, onStatus } = args;
  const [isLoading, setIsLoading] = useState(false);
  const [btcInflowTxid, setBtcInflowTxid] = useState("");

  const run = useCallback(
    async (params?: { supplyFlow?: SupplyFlow | null }) => {
      if (!btcInflowTxid) {
        onError("Enter a BTC transaction id first.");
        return;
      }

      setIsLoading(true);
      onError(null);

      try {
        const response = params?.supplyFlow
          ? await params.supplyFlow.submit({ txid: btcInflowTxid })
          : await submitInflowTxid(btcInflowTxid);
        onStatus(`Submitted BTC inflow txid ${response.txid}.`);
      } catch (error) {
        onError(formatLiquidiumError(error));
      } finally {
        setIsLoading(false);
      }
    },
    [btcInflowTxid, onError, onStatus]
  );

  return {
    btcInflowTxid,
    isLoading,
    run,
    setBtcInflowTxid,
  };
}
