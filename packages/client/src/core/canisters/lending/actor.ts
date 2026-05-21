import { Actor } from "@dfinity/agent";
import type {
  _SERVICE,
  AccountType,
  Assets,
  BorrowAssetRequest,
  BorrowingPower,
  Chains,
  ProtocolError as GeneratedProtocolError,
  SignatureVerificationError as GeneratedSignatureVerificationError,
  OutflowDetails,
  OutflowType,
  Pool,
  Result_1,
  Result_5,
  SignatureInfo,
  SignedRequest_1,
  SignedRequest_2,
  SignedRequest_4,
  UserStats,
  Wallet,
  WalletType,
  WithdrawRequest,
} from "../../../generated/canisters/lending/lending.did";
import { idlFactory } from "../../../generated/canisters/lending/lending.did.js";
import { LiquidiumError, LiquidiumErrorCode } from "../../errors";
import type { CanisterContext } from "../../transports/canister-context";

export type AssetVariant = Assets;
export type ChainVariant = Chains;
export type WalletChainVariant = WalletType;
export type WalletRecord = Wallet;
export type SignatureInfoVariant = SignatureInfo;
export type AccountTypeVariant = AccountType;
export type OutflowTypeVariant = OutflowType;
export type BorrowAssetsRequest = BorrowAssetRequest;
export type WithdrawAssetsRequest = WithdrawRequest;
export type SignedBorrowAssetsRequest = SignedRequest_1;
export type SignedWithdrawAssetsRequest = SignedRequest_4;
export type OutflowDetailsRecord = OutflowDetails;
export type BorrowAssetsResult = Result_1;
export type WithdrawAssetsResult = Result_1;
export type BorrowingPowerRecord = BorrowingPower;
export type UserStatsRecord = UserStats;
export type RegisterProfileRequest = SignedRequest_2;
export type RegisterProfileResult = Result_5;
export type LendingPoolRecord = Pool;
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
