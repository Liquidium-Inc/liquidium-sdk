import type { ActorMethod } from "@dfinity/agent";
import { Actor } from "@dfinity/agent";
import type { IDL } from "@dfinity/candid";
import type { Principal } from "@dfinity/principal";
import { LiquidiumError, LiquidiumErrorCode } from "../../errors";
import type { CanisterContext } from "../../transports/canister-context";

export type InstantLoanAccountType =
  | { Native: Principal }
  | { External: string };
export type InstantLoanAsset =
  | { BTC: null }
  | { SOL: null }
  | { USDC: null }
  | { USDT: null };
export type InstantLoanLeg = { Lend: null } | { Borrow: null };

export interface CreateInstantLoanCanisterRequest {
  borrow_destination: InstantLoanAccountType;
  lend_asset: InstantLoanAsset;
  borrow_amount: bigint;
  lend_pool_id: Principal;
  min_deposit_hint: bigint;
  refund_destination: InstantLoanAccountType;
  ltv_max_bps: bigint;
  borrow_pool_id: Principal;
  borrow_asset: InstantLoanAsset;
  ltv_timer_s: bigint;
}

export interface CreateInstantLoanCanisterResponse {
  loan_id: bigint;
  lending_profile: Principal;
}

export interface InstantLoanCanisterRecord {
  id: bigint;
  borrow_destination: InstantLoanAccountType;
  started: boolean;
  lend_asset: InstantLoanAsset;
  borrow_amount: bigint;
  lend_pool_id: Principal;
  min_deposit_hint: bigint;
  refund_destination: InstantLoanAccountType;
  ltv_max_bps: bigint;
  ltv_timer_s: bigint;
  lending_profile: Principal;
  borrow_pool_id: Principal;
  borrow_asset: InstantLoanAsset;
  deposit_detected_ts: [] | [bigint];
}

export type InstantLoansCanisterError =
  | { BorrowAmountRequired: null }
  | { NoCollateralPosition: { loan_id: bigint } }
  | { LtvMaxExceeded: { actual_bps: bigint; max_bps: bigint } }
  | { MemoryLockFailed: { reason: string } }
  | { UnauthorizedAccessListCaller: { caller: Principal } }
  | { LtvMaxOutOfRange: { max: bigint } }
  | { AccountRequired: { label: string } }
  | { DepositTimerExceeded: { loan_id: bigint } }
  | { LendingCallFailed: { method: string; reason: string } }
  | { LoanNotFound: { loan_id: bigint } }
  | { LendingProtocolError: { error: unknown; operation: string } }
  | { AuthorizationFailed: { reason: string } }
  | { DepositAlreadyProcessed: { loan_id: bigint } }
  | { MissingPrice: { symbol: string } }
  | { LendingDecodeFailed: { method: string; reason: string } }
  | { InvalidLtvTimerS: null }
  | { DebtNotFullyRepaid: { loan_id: bigint } }
  | { EmptyCollateralPosition: null }
  | { SigningFailed: { reason: string } };

type Result<T> = { Ok: T } | { Err: InstantLoansCanisterError };

export interface InstantLoansActor {
  create_loan: ActorMethod<
    [CreateInstantLoanCanisterRequest],
    Result<CreateInstantLoanCanisterResponse>
  >;
  get_loan: ActorMethod<[bigint], Result<InstantLoanCanisterRecord>>;
}

const idlFactory: IDL.InterfaceFactory = ({ IDL }) => {
  const AccountType = IDL.Variant({
    Native: IDL.Principal,
    External: IDL.Text,
  });
  const Assets = IDL.Variant({
    BTC: IDL.Null,
    SOL: IDL.Null,
    USDC: IDL.Null,
    USDT: IDL.Null,
  });
  const SignatureVerificationError = IDL.Variant({
    InvalidEthSignature: IDL.Null,
    UnsupportedChain: IDL.Null,
    InvalidSolSignature: IDL.Null,
    InvalidEthAddress: IDL.Null,
    CouldNotDecode: IDL.Text,
    ProfileNotFound: IDL.Null,
    InvalidBtcSignature: IDL.Null,
  });
  const ProtocolError = IDL.Variant({
    PositionNotFound: IDL.Null,
    Internal: IDL.Text,
    InvalidAddress: IDL.Text,
    InvalidTargetPrincipal: IDL.Null,
    SignatureError: SignatureVerificationError,
    SupplyCapExceeded: IDL.Null,
    AccountNotFound: IDL.Null,
    NotAllowed: IDL.Text,
    PoolNotFound: IDL.Text,
    FeeClaimReceiverNotConfigured: IDL.Null,
    InsufficientCollateral: IDL.Null,
    ProfileNotFound: IDL.Null,
    SignatureExpiryTooFarInFuture: IDL.Null,
    MaxLtvExceeded: IDL.Null,
    ProfileAlreadyExists: IDL.Null,
    LiquidationNotFound: IDL.Text,
    HealthFactorTooLow: IDL.Null,
    NoLiquidity: IDL.Null,
    SignatureExpired: IDL.Null,
    BorrowingDisabled: IDL.Null,
    BorrowCapExceeded: IDL.Null,
    PoolFrozen: IDL.Null,
    TransferFailed: IDL.Text,
    AccountAlreadyLinked: IDL.Null,
    CannotRemoveSoleAccount: IDL.Null,
    InsufficientFunds: IDL.Null,
  });
  const InstantLoansError = IDL.Variant({
    BorrowAmountRequired: IDL.Null,
    NoCollateralPosition: IDL.Record({ loan_id: IDL.Nat }),
    LtvMaxExceeded: IDL.Record({
      actual_bps: IDL.Nat64,
      max_bps: IDL.Nat64,
    }),
    MemoryLockFailed: IDL.Record({ reason: IDL.Text }),
    UnauthorizedAccessListCaller: IDL.Record({ caller: IDL.Principal }),
    LtvMaxOutOfRange: IDL.Record({ max: IDL.Nat64 }),
    AccountRequired: IDL.Record({ label: IDL.Text }),
    DepositTimerExceeded: IDL.Record({ loan_id: IDL.Nat }),
    LendingCallFailed: IDL.Record({ method: IDL.Text, reason: IDL.Text }),
    LoanNotFound: IDL.Record({ loan_id: IDL.Nat }),
    LendingProtocolError: IDL.Record({
      error: ProtocolError,
      operation: IDL.Text,
    }),
    AuthorizationFailed: IDL.Record({ reason: IDL.Text }),
    DepositAlreadyProcessed: IDL.Record({ loan_id: IDL.Nat }),
    MissingPrice: IDL.Record({ symbol: IDL.Text }),
    LendingDecodeFailed: IDL.Record({ method: IDL.Text, reason: IDL.Text }),
    InvalidLtvTimerS: IDL.Null,
    DebtNotFullyRepaid: IDL.Record({ loan_id: IDL.Nat }),
    EmptyCollateralPosition: IDL.Null,
    SigningFailed: IDL.Record({ reason: IDL.Text }),
  });
  const CreateLoanRequest = IDL.Record({
    borrow_destination: AccountType,
    lend_asset: Assets,
    borrow_amount: IDL.Nat,
    lend_pool_id: IDL.Principal,
    min_deposit_hint: IDL.Nat,
    refund_destination: AccountType,
    ltv_max_bps: IDL.Nat64,
    borrow_pool_id: IDL.Principal,
    borrow_asset: Assets,
    ltv_timer_s: IDL.Nat64,
  });
  const CreateLoanResponse = IDL.Record({
    loan_id: IDL.Nat,
    lending_profile: IDL.Principal,
  });
  const CreateLoanResult = IDL.Variant({
    Ok: CreateLoanResponse,
    Err: InstantLoansError,
  });
  const AuthorisationType = IDL.Variant({
    EthSignature: IDL.Record({
      derivation_index: IDL.Vec(IDL.Nat8),
      pubkey: IDL.Vec(IDL.Nat8),
      address: IDL.Text,
    }),
  });
  const Loan = IDL.Record({
    id: IDL.Nat,
    authorisation: AuthorisationType,
    borrow_destination: AccountType,
    started: IDL.Bool,
    lend_asset: Assets,
    borrow_amount: IDL.Nat,
    lend_pool_id: IDL.Principal,
    min_deposit_hint: IDL.Nat,
    refund_destination: AccountType,
    ltv_max_bps: IDL.Nat64,
    ltv_timer_s: IDL.Nat64,
    lending_profile: IDL.Principal,
    borrow_pool_id: IDL.Principal,
    borrow_asset: Assets,
    deposit_detected_ts: IDL.Opt(IDL.Nat64),
  });
  const LoanResult = IDL.Variant({ Ok: Loan, Err: InstantLoansError });

  return IDL.Service({
    create_loan: IDL.Func([CreateLoanRequest], [CreateLoanResult], []),
    get_loan: IDL.Func([IDL.Nat], [LoanResult], ["query"]),
  });
};

export function createInstantLoansActor(
  canisterContext: CanisterContext
): InstantLoansActor {
  const canisterId = canisterContext.canisterIds.instantLoans;

  if (!canisterId) {
    throw new LiquidiumError(
      LiquidiumErrorCode.SERVICE_UNAVAILABLE,
      "Instant loans canister ID is not configured"
    );
  }

  return Actor.createActor<InstantLoansActor>(idlFactory, {
    agent: canisterContext.agent,
    canisterId,
  });
}
