import { Actor } from "@icp-sdk/core/agent";
import type { _SERVICE } from "../../../generated/canisters/ck-eth-minter/declaration";
import { idlFactory } from "../../../generated/canisters/ck-eth-minter/declaration.js";
import { CK_CANISTER_IDS } from "../../config";
import { LiquidiumError, LiquidiumErrorCode } from "../../errors";
import type { CanisterContext } from "../../transports/canister-context";

export type CkEthMinterActor = _SERVICE;

export function createCkEthMinterActor(
  canisterContext: CanisterContext
): CkEthMinterActor {
  const canisterId = CK_CANISTER_IDS.ETH.minter;

  if (!canisterId) {
    throw new LiquidiumError(
      LiquidiumErrorCode.SERVICE_UNAVAILABLE,
      "ckETH minter canister ID is not configured"
    );
  }

  return Actor.createActor<CkEthMinterActor>(idlFactory, {
    agent: canisterContext.agent,
    canisterId,
  });
}
