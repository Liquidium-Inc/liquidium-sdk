import { Actor } from "@icp-sdk/core/agent";
import type {
  _SERVICE,
  DepositAccountErrors as GeneratedDepositAccountErrors,
} from "../../../generated/canisters/deposit-accounts/deposit_accounts.did";
import { idlFactory } from "../../../generated/canisters/deposit-accounts/deposit_accounts.did.js";
import { LiquidiumError, LiquidiumErrorCode } from "../../errors";
import type { CanisterContext } from "../../transports/canister-context";

export type DepositAccountsActor = _SERVICE;
export type DepositAccountErrors = GeneratedDepositAccountErrors;

export function createDepositAccountsActor(
  canisterContext: CanisterContext
): DepositAccountsActor {
  const canisterId = canisterContext.canisterIds.ethDeposit;

  if (!canisterId) {
    throw new LiquidiumError(
      LiquidiumErrorCode.SERVICE_UNAVAILABLE,
      "ETH deposit canister ID is not configured"
    );
  }

  return Actor.createActor<DepositAccountsActor>(idlFactory, {
    agent: canisterContext.agent,
    canisterId,
  });
}
