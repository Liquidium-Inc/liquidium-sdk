import { IcrcLedgerCanister } from "@icp-sdk/canisters/ledger/icrc";
import { Principal } from "@icp-sdk/core/principal";
import { createFlexibleLendingActor } from "../../../core/canisters/lending/flexible-actor";
import { LiquidiumError, LiquidiumErrorCode } from "../../../core/errors";
import type { CanisterContext } from "../../../core/transports/canister-context";

const NANOSECONDS_PER_MILLISECOND = 1_000_000n;
const APPROVAL_DURATION_5_MINUTES_NS = 5n * 60n * 1_000_000_000n;

interface EnsureLiquidationAllowanceParams {
  canisterContext: CanisterContext;
  debtPoolId: Principal;
  debtAmount: bigint;
}

export async function ensureLiquidationAllowance({
  canisterContext,
  debtPoolId,
  debtAmount,
}: EnsureLiquidationAllowanceParams): Promise<void> {
  const owner = await canisterContext.agent.getPrincipal();
  if (owner.isAnonymous()) {
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

  const lending = createFlexibleLendingActor(canisterContext);
  const [pool] = await lending.get_pool(debtPoolId);
  if (!pool) {
    throw new LiquidiumError(
      LiquidiumErrorCode.POOL_NOT_FOUND,
      "Liquidation debt pool was not found"
    );
  }
  if (!("CkAsset" in pool.asset_type)) {
    throw new LiquidiumError(
      LiquidiumErrorCode.NOT_ALLOWED,
      "Liquidation debt pool has no supported ICRC ledger"
    );
  }

  const ledger = IcrcLedgerCanister.create({
    agent: canisterContext.agent,
    canisterId: pool.asset_type.CkAsset,
  });
  const spender = {
    owner: Principal.fromText(lendingCanisterId),
    subaccount: [] as [],
  };
  const [fee, allowance, balance] = await Promise.all([
    ledger.transactionFee({}),
    ledger.allowance({ account: { owner, subaccount: [] }, spender }),
    ledger.balance({ owner }),
  ]);
  const nowNanoseconds = BigInt(Date.now()) * NANOSECONDS_PER_MILLISECOND;
  const expiresAtNanoseconds = allowance.expires_at[0];
  const currentAllowance =
    expiresAtNanoseconds !== undefined && expiresAtNanoseconds <= nowNanoseconds
      ? 0n
      : allowance.allowance;
  const requiredAllowance = debtAmount + fee;
  const needsApproval = currentAllowance < requiredAllowance;
  const requiredBalance = requiredAllowance + (needsApproval ? fee : 0n);
  if (balance < requiredBalance) {
    throw new LiquidiumError(
      LiquidiumErrorCode.INSUFFICIENT_FUNDS,
      "Debt ledger balance cannot cover repayment and required ledger fees"
    );
  }
  if (!needsApproval) return;

  try {
    await ledger.approve({
      spender,
      amount: requiredAllowance,
      fee,
      expected_allowance: currentAllowance,
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
