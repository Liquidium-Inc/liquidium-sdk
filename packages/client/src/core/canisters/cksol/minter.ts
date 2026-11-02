import { Actor } from "@icp-sdk/core/agent";
import type { IDL } from "@icp-sdk/core/candid";
import type { Principal } from "@icp-sdk/core/principal";
import { CK_CANISTER_IDS } from "../../config";
import type { CanisterContext } from "../../transports/canister-context";

interface SolDepositAccount {
  owner: [] | [Principal];
  subaccount: [] | [Uint8Array];
}

interface SolMinterInfo {
  minimum_withdrawal_amount: bigint;
  withdrawal_fee: bigint;
}

export interface CkSolMinterActor {
  get_deposit_address(account: SolDepositAccount): Promise<string>;
  get_minter_info(): Promise<SolMinterInfo>;
}

const idlFactory: IDL.InterfaceFactory = ({ IDL }) =>
  IDL.Service({
    get_deposit_address: IDL.Func(
      [
        IDL.Record({
          owner: IDL.Opt(IDL.Principal),
          subaccount: IDL.Opt(IDL.Vec(IDL.Nat8)),
        }),
      ],
      [IDL.Text],
      []
    ),
    get_minter_info: IDL.Func(
      [],
      [
        IDL.Record({
          minimum_withdrawal_amount: IDL.Nat64,
          withdrawal_fee: IDL.Nat64,
        }),
      ],
      ["query"]
    ),
  });

export function createCkSolMinterActor(
  context: CanisterContext
): CkSolMinterActor {
  return Actor.createActor<CkSolMinterActor>(idlFactory, {
    agent: context.agent,
    canisterId: CK_CANISTER_IDS.SOL.minter,
  });
}
