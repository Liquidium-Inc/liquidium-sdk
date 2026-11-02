import {
  type ApproveParams,
  IcrcLedgerCanister,
} from "@icp-sdk/canisters/ledger/icrc";
import { Principal } from "@icp-sdk/core/principal";
import { createFlexibleLendingActor } from "../../../core/canisters/lending/flexible-actor";
import { LiquidiumError, LiquidiumErrorCode } from "../../../core/errors";
import type { CanisterContext } from "../../../core/transports/canister-context";

const NANOSECONDS_PER_MILLISECOND = 1_000_000n;

const APPROVAL_DURATION_5_MINUTES_NS = 5n * 60n * 1_000_000_000n;

const ALLOWANCE_RENEWAL_WINDOW_1_MINUTE_NS = 60n * 1_000_000_000n;

interface EnsureLiquidationAllowanceParams {
  canisterContext: CanisterContext;
  debtPoolId: Principal;
  debtAmount: bigint;
}

export async function ensureLiquidationAllowance({
  canisterContext,
  debtPoolId,
  debtAmount: debtAmountBaseUnits,
}: EnsureLiquidationAllowanceParams): Promise<void> {
  const liquidatorPrincipal = await canisterContext.agent.getPrincipal();

  if (liquidatorPrincipal.isAnonymous()) {
    throw new LiquidiumError(
      LiquidiumErrorCode.NOT_ALLOWED,
      "Liquidation requires a signing IC identity or agent"
    );
  }

  const lendingCanisterId = canisterContext.canisterIds.lending;

  if (!lendingCanisterId) {
    throw new LiquidiumError(
      LiquidiumErrorCode.SERVICE_UNAVAILABLE,
      "Lending canister ID is not configured"
    );
  }

  const lendingActor = createFlexibleLendingActor(canisterContext);
  const [debtPool] = await lendingActor.get_pool(debtPoolId);

  if (!debtPool) {
    throw new LiquidiumError(
      LiquidiumErrorCode.POOL_NOT_FOUND,
      "Liquidation debt pool was not found"
    );
  }

  if (!("CkAsset" in debtPool.asset_type)) {
    throw new LiquidiumError(
      LiquidiumErrorCode.NOT_ALLOWED,
      "Liquidation debt pool has no supported ICRC ledger"
    );
  }

  const debtLedger = IcrcLedgerCanister.create({
    agent: canisterContext.agent,
    canisterId: debtPool.asset_type.CkAsset,
  });

  const spender: ApproveParams["spender"] = {
    owner: Principal.fromText(lendingCanisterId),
    subaccount: [],
  };

  const [ledgerFeeBaseUnits, allowance, balanceBaseUnits] = await Promise.all([
    debtLedger.transactionFee({}),
    debtLedger.allowance({
      account: { owner: liquidatorPrincipal, subaccount: [] },
      spender,
    }),
    debtLedger.balance({ owner: liquidatorPrincipal }),
  ]);

  const nowNanoseconds = BigInt(Date.now()) * NANOSECONDS_PER_MILLISECOND;
  const expiresAtNanoseconds = allowance.expires_at[0];

  const currentAllowanceBaseUnits =
    expiresAtNanoseconds !== undefined && expiresAtNanoseconds <= nowNanoseconds
      ? 0n
      : allowance.allowance;

  const requiredAllowanceBaseUnits = debtAmountBaseUnits + ledgerFeeBaseUnits;

  const isAllowanceExpiringSoon =
    expiresAtNanoseconds !== undefined &&
    expiresAtNanoseconds <=
      nowNanoseconds + ALLOWANCE_RENEWAL_WINDOW_1_MINUTE_NS;

  const needsApproval =
    currentAllowanceBaseUnits < requiredAllowanceBaseUnits ||
    isAllowanceExpiringSoon;

  const requiredBalanceBaseUnits =
    requiredAllowanceBaseUnits + (needsApproval ? ledgerFeeBaseUnits : 0n);

  if (balanceBaseUnits < requiredBalanceBaseUnits) {
    throw new LiquidiumError(
      LiquidiumErrorCode.INSUFFICIENT_FUNDS,
      "Debt ledger balance cannot cover repayment and required ledger fees"
    );
  }

  if (!needsApproval) {
    return;
  }

  try {
    await debtLedger.approve({
      spender,
      amount: requiredAllowanceBaseUnits,
      fee: ledgerFeeBaseUnits,
      expected_allowance: currentAllowanceBaseUnits,
      created_at_time: nowNanoseconds,
      expires_at: nowNanoseconds + APPROVAL_DURATION_5_MINUTES_NS,
    });
  } catch (cause) {
    throw new LiquidiumError(
      LiquidiumErrorCode.LIQUIDATION_APPROVAL_FAILED,
      "Debt allowance approval failed. Liquidation was not submitted; check the ledger allowance before retrying if the approval outcome is uncertain.",
      cause
    );
  }
}
