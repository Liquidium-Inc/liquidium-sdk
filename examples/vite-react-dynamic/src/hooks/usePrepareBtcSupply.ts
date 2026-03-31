import { useCallback, useState } from "react";
import {
  DEFAULT_SUPPLY_ACTION,
  formatLiquidiumError,
  prepareBtcSupplyFlow,
  type SupplyAction,
  type SupplyFlow,
  type SupplyInstruction,
} from "../liquidium-client-sdk";

export function usePrepareBtcSupply(args: {
  onStatus: (message: string) => void;
  onError: (message: string | null) => void;
}) {
  const { onError, onStatus } = args;
  const [isLoading, setIsLoading] = useState(false);
  const [supplyAction, setSupplyAction] =
    useState<SupplyAction>(DEFAULT_SUPPLY_ACTION);
  const [supplyFlow, setSupplyFlow] = useState<SupplyFlow | null>(null);
  const [supplyInstruction, setSupplyInstruction] =
    useState<SupplyInstruction | null>(null);

  const run = useCallback(
    async (params: { profileId: string | null; selectedPoolId: string }) => {
      if (!params.profileId) {
        onError("Create or resolve a Liquidium profile first.");
        return;
      }

      if (!params.selectedPoolId) {
        onError("Load pools and choose a pool first.");
        return;
      }

      setIsLoading(true);
      onError(null);

      try {
        const nextSupplyFlow = await prepareBtcSupplyFlow({
          profileId: params.profileId,
          poolId: params.selectedPoolId,
          action: supplyAction,
        });

        setSupplyFlow(nextSupplyFlow);
        setSupplyInstruction(nextSupplyFlow.instruction);
        onStatus(
          `Prepared BTC ${supplyAction} flow for ${params.selectedPoolId}.`
        );
      } catch (error) {
        onError(formatLiquidiumError(error));
      } finally {
        setIsLoading(false);
      }
    },
    [onError, onStatus, supplyAction]
  );

  return {
    isLoading,
    run,
    setSupplyAction,
    supplyAction,
    supplyFlow,
    supplyInstruction,
  };
}
