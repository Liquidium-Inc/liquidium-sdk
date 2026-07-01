import { Actor } from "@icp-sdk/core/agent";
import type { _SERVICE } from "../../../generated/canisters/ck-btc-minter/declaration";
import { idlFactory } from "../../../generated/canisters/ck-btc-minter/declaration.js";
import { CK_CANISTER_IDS } from "../../config";
import { LiquidiumError, LiquidiumErrorCode } from "../../errors";
import type { CanisterContext } from "../../transports/canister-context";

export type CkBtcMinterActor = _SERVICE;

export function createCkBtcMinterActor(
  canisterContext: CanisterContext
): CkBtcMinterActor {
  const canisterId = CK_CANISTER_IDS.ckBTC.minter;

  if (!canisterId) {
    throw new LiquidiumError(
      LiquidiumErrorCode.SERVICE_UNAVAILABLE,
      "ckBTC minter canister ID is not configured"
    );
  }

  return Actor.createActor<CkBtcMinterActor>(idlFactory, {
    agent: canisterContext.agent,
    canisterId,
  });
}
