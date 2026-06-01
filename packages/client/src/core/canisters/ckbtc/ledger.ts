import { Actor, type ActorMethod } from "@icp-sdk/core/agent";
import type { IDL } from "@icp-sdk/core/candid";
import { CK_CANISTER_IDS } from "../../config";
import { LiquidiumError, LiquidiumErrorCode } from "../../errors";
import type { CanisterContext } from "../../transports/canister-context";

export interface CkBtcLedgerActor {
  icrc1_fee: ActorMethod<[], bigint>;
}

const idlFactory: IDL.InterfaceFactory = ({ IDL }) =>
  IDL.Service({
    icrc1_fee: IDL.Func([], [IDL.Nat], ["query"]),
  });

export function createCkBtcLedgerActor(
  canisterContext: CanisterContext
): CkBtcLedgerActor {
  const canisterId = CK_CANISTER_IDS.btcLedger;

  if (!canisterId) {
    throw new LiquidiumError(
      LiquidiumErrorCode.SERVICE_UNAVAILABLE,
      "ckBTC ledger canister ID is not configured"
    );
  }

  return Actor.createActor<CkBtcLedgerActor>(idlFactory, {
    agent: canisterContext.agent,
    canisterId,
  });
}
