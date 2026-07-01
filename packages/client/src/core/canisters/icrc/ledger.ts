import { Actor, type ActorMethod } from "@icp-sdk/core/agent";
import type { IDL } from "@icp-sdk/core/candid";
import { LiquidiumError, LiquidiumErrorCode } from "../../errors";
import type { CanisterContext } from "../../transports/canister-context";

export interface IcrcLedgerActor {
  icrc1_fee: ActorMethod<[], bigint>;
}

const idlFactory: IDL.InterfaceFactory = ({ IDL }) =>
  IDL.Service({
    icrc1_fee: IDL.Func([], [IDL.Nat], ["query"]),
  });

export function createIcrcLedgerActor(params: {
  canisterContext: CanisterContext;
  canisterId: string | undefined;
  ledgerName: string;
}): IcrcLedgerActor {
  if (!params.canisterId) {
    throw new LiquidiumError(
      LiquidiumErrorCode.SERVICE_UNAVAILABLE,
      `${params.ledgerName} ledger canister ID is not configured`
    );
  }

  return Actor.createActor<IcrcLedgerActor>(idlFactory, {
    agent: params.canisterContext.agent,
    canisterId: params.canisterId,
  });
}
