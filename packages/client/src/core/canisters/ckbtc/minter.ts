import { Actor } from "@dfinity/agent";
import type { IDL } from "@dfinity/candid";
import { CK_CANISTER_IDS } from "../../config";
import { LiquidiumError, LiquidiumErrorCode } from "../../errors";
import type { CanisterContext } from "../../transports/canister-context";

export interface CkBtcMinterActor {
  get_btc_address(request: {
    owner: [] | [unknown];
    subaccount: [] | [Uint8Array];
  }): Promise<string>;
  get_deposit_fee(): Promise<bigint>;
}

const ckBtcMinterIdlFactory: IDL.InterfaceFactory = ({ IDL }) => {
  const account = IDL.Record({
    owner: IDL.Opt(IDL.Principal),
    subaccount: IDL.Opt(IDL.Vec(IDL.Nat8)),
  });

  return IDL.Service({
    get_btc_address: IDL.Func([account], [IDL.Text], []),
    get_deposit_fee: IDL.Func([], [IDL.Nat64], []),
  });
};

export function createCkBtcMinterActor(
  canisterContext: CanisterContext
): CkBtcMinterActor {
  const canisterId = CK_CANISTER_IDS.btcMinter;

  if (!canisterId) {
    throw new LiquidiumError(
      LiquidiumErrorCode.SERVICE_UNAVAILABLE,
      "ckBTC minter canister ID is not configured"
    );
  }

  return Actor.createActor<CkBtcMinterActor>(ckBtcMinterIdlFactory, {
    agent: canisterContext.agent,
    canisterId,
  });
}
