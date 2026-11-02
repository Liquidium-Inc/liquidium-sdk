import { createCkSolMinterActor } from "./canisters/cksol/minter";
import { createIcrcLedgerActor } from "./canisters/icrc/ledger";
import { CK_CANISTER_IDS } from "./config";
import { LiquidiumError, LiquidiumErrorCode } from "./errors";
import type { CanisterContext } from "./transports/canister-context";
import { Asset, Chain } from "./types";

// The pool stages the debit and approves the minter, paying one ledger fee each.
const SOL_NATIVE_OUTFLOW_LEDGER_FEE_COUNT = 2n;

export interface SolOutflowMinimumParams {
  asset: string;
  destinationChain: string;
  amount: bigint;
}

/** Rejects native SOL outflows the ckSOL minter would refuse after lending debits them. */
export async function guardSolNativeOutflowMinimum(
  canisterContext: CanisterContext,
  params: SolOutflowMinimumParams
): Promise<void> {
  if (params.asset !== Asset.SOL || params.destinationChain !== Chain.SOL) {
    return;
  }

  const [info, ledgerFee] = await Promise.all([
    createCkSolMinterActor(canisterContext).get_minter_info(),
    createIcrcLedgerActor({
      canisterContext,
      canisterId: CK_CANISTER_IDS.SOL.ledger,
      ledgerName: "ckSOL",
    }).icrc1_fee(),
  ]);
  const minimum =
    info.minimum_withdrawal_amount +
    ledgerFee * SOL_NATIVE_OUTFLOW_LEDGER_FEE_COUNT;

  if (params.amount < minimum) {
    throw new LiquidiumError(
      LiquidiumErrorCode.VALIDATION_ERROR,
      `Native SOL outflows must be at least ${minimum} lamports`
    );
  }
}
