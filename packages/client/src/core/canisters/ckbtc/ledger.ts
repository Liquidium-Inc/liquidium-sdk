import { CK_CANISTER_IDS } from "../../config";
import type { CanisterContext } from "../../transports/canister-context";
import { createIcrcLedgerActor, type IcrcLedgerActor } from "../icrc/ledger";

export type CkBtcLedgerActor = IcrcLedgerActor;

export function createCkBtcLedgerActor(
  canisterContext: CanisterContext
): CkBtcLedgerActor {
  return createIcrcLedgerActor({
    canisterContext,
    canisterId: CK_CANISTER_IDS.BTC.ledger,
    ledgerName: "ckBTC",
  });
}
