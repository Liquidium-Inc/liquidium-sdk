import { Actor } from "@icp-sdk/core/agent";
import type {
  _SERVICE,
  BorrowingPower,
  ProtocolError as GeneratedProtocolError,
  SignatureVerificationError as GeneratedSignatureVerificationError,
  SignedRequest_2,
  Wallet,
} from "../../../generated/canisters/lending/lending.did";
import { idlFactory } from "../../../generated/canisters/lending/lending.did.js";
import { LiquidiumError, LiquidiumErrorCode } from "../../errors";
import type { CanisterContext } from "../../transports/canister-context";

export type WalletRecord = Wallet;
export type BorrowingPowerRecord = BorrowingPower;
export type RegisterProfileRequest = SignedRequest_2;
export type PoolRateTuple = [bigint, bigint, bigint];
export type PriceRecord = [string, bigint, number];
export type ProtocolError = GeneratedProtocolError;
export type SignatureVerificationError = GeneratedSignatureVerificationError;
export type LendingActor = _SERVICE;

export function createLendingActor(
  canisterContext: CanisterContext
): LendingActor {
  const canisterId = canisterContext.canisterIds.lending;

  if (!canisterId) {
    throw new LiquidiumError(
      LiquidiumErrorCode.SERVICE_UNAVAILABLE,
      "Lending canister ID is not configured"
    );
  }

  return Actor.createActor<LendingActor>(idlFactory, {
    agent: canisterContext.agent,
    canisterId,
  });
}
