import type { ActorMethod } from "@icp-sdk/core/agent";
import { Actor } from "@icp-sdk/core/agent";
import type { IDL } from "@icp-sdk/core/candid";
import type { Principal } from "@icp-sdk/core/principal";
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
export type InstantLoanAuthorisation = {
  EthSignature: {
    derivation_index: Uint8Array;
    pubkey: Uint8Array;
    address: string;
  };
};

export interface CreateInstantLoanCanisterRequest {
  borrow_destination: InstantLoanAccountType;
  lend_asset: InstantLoanAsset;
  borrow_amount: bigint;
  lend_pool_id: Principal;
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

export interface HeadlessLoansConfig {
  lending_canister: Principal;
}

export type HeadlessLoanEventType =
  | {
      LoanCreated: {
        loan_id: bigint;
        borrow_destination: InstantLoanAccountType;
        lend_asset: InstantLoanAsset;
        borrow_amount: bigint;
        lend_pool_id: Principal;
        refund_destination: InstantLoanAccountType;
        ltv_max_bps: bigint;
        ltv_timer_s: bigint;
        lending_profile: Principal;
        borrow_pool_id: Principal;
        borrow_asset: InstantLoanAsset;
      };
    }
  | {
      FullLendWithdrawalRequested: {
        loan_id: bigint;
        account: InstantLoanAccountType;
        pool_id: Principal;
      };
    }
  | {
      BorrowRequested: {
        loan_id: bigint;
        account: InstantLoanAccountType;
        pool_id: Principal;
        amount: bigint;
      };
    }
  | { DepositTimerExceeded: { loan_id: bigint } }
  | {
      StuckFundsWithdrawalRequested: {
        leg: InstantLoanLeg;
        loan_id: bigint;
        account: InstantLoanAccountType;
        pool_id: Principal;
        amount: bigint;
      };
    }
  | {
      ProfileWarmed: {
        derivation_index: Uint8Array;
        warmed_profile_id: bigint;
        eth_address: string;
        lending_profile: Principal;
      };
    }
  | { RepayComplete: CreateInstantLoanCanisterResponse }
  | { DepositTimerStarted: { loan_id: bigint; timestamp: bigint } };

export interface HeadlessLoanEvent {
  id: bigint;
  schema_version: number;
  timestamp: bigint;
  event_type: HeadlessLoanEventType;
}

export interface InstantLoanCanisterRecord {
  id: bigint;
  authorisation: InstantLoanAuthorisation;
  borrow_destination: InstantLoanAccountType;
  started: boolean;
  lend_asset: InstantLoanAsset;
  created_at: bigint;
  schema_version: number;
  borrow_amount: bigint;
  lend_pool_id: Principal;
  refund_destination: InstantLoanAccountType;
  ltv_max_bps: bigint;
  ltv_timer_s: bigint;
  lending_profile: Principal;
  borrow_pool_id: Principal;
  borrow_asset: InstantLoanAsset;
  expires_at: [] | [bigint];
  deposit_detected_ts: [] | [bigint];
}

export interface WarmedProfile {
  id: bigint;
  authorisation: InstantLoanAuthorisation;
  created_at: bigint;
  lending_profile: Principal;
}

type LendingClientError =
  | { CallFailed: { method: string; reason: string } }
  | { CallRejected: { method: string; reason: string } }
  | { DecodeFailed: { method: string; reason: string } };

export type InstantLoansCanisterError =
  | { BorrowAmountRequired: null }
  | { NoCollateralPosition: { loan_id: bigint } }
  | { LtvTimerOutOfRange: { max: bigint } }
  | { LtvMaxExceeded: { actual_bps: bigint; max_bps: bigint } }
  | { MemoryLockFailed: { reason: string } }
  | { UnauthorizedAccessListCaller: { caller: Principal } }
  | { LendingClient: LendingClientError }
  | { LtvMaxOutOfRange: { max: bigint } }
  | { AccountRequired: { label: string } }
  | { DepositTimerExceeded: { loan_id: bigint } }
  | { LoanNotFound: { loan_id: bigint } }
  | { LendingProtocolError: { error: unknown; operation: string } }
  | { AuthorizationFailed: { reason: string } }
  | { DepositAlreadyProcessed: { loan_id: bigint } }
  | { MissingPrice: { symbol: string } }
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
  count_warmed_profiles: ActorMethod<[], bigint>;
  get_config: ActorMethod<[], HeadlessLoansConfig>;
  get_event: ActorMethod<[bigint], [] | [HeadlessLoanEvent]>;
  get_loan: ActorMethod<[bigint], Result<InstantLoanCanisterRecord>>;
  list_access_list: ActorMethod<[], Principal[]>;
  list_events: ActorMethod<
    [bigint, bigint],
    Array<[bigint, HeadlessLoanEvent]>
  >;
  list_warmed_profiles: ActorMethod<[], WarmedProfile[]>;
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
    LtvTimerOutOfRange: IDL.Record({ max: IDL.Nat64 }),
    LtvMaxExceeded: IDL.Record({
      actual_bps: IDL.Nat64,
      max_bps: IDL.Nat64,
    }),
    MemoryLockFailed: IDL.Record({ reason: IDL.Text }),
    UnauthorizedAccessListCaller: IDL.Record({ caller: IDL.Principal }),
    LendingClient: IDL.Variant({
      CallFailed: IDL.Record({ method: IDL.Text, reason: IDL.Text }),
      CallRejected: IDL.Record({ method: IDL.Text, reason: IDL.Text }),
      DecodeFailed: IDL.Record({ method: IDL.Text, reason: IDL.Text }),
    }),
    LtvMaxOutOfRange: IDL.Record({ max: IDL.Nat64 }),
    AccountRequired: IDL.Record({ label: IDL.Text }),
    DepositTimerExceeded: IDL.Record({ loan_id: IDL.Nat }),
    LoanNotFound: IDL.Record({ loan_id: IDL.Nat }),
    LendingProtocolError: IDL.Record({
      error: ProtocolError,
      operation: IDL.Text,
    }),
    AuthorizationFailed: IDL.Record({ reason: IDL.Text }),
    DepositAlreadyProcessed: IDL.Record({ loan_id: IDL.Nat }),
    MissingPrice: IDL.Record({ symbol: IDL.Text }),
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
  const LoanLeg = IDL.Variant({ Lend: IDL.Null, Borrow: IDL.Null });
  const HeadlessLoanEventType = IDL.Variant({
    LoanCreated: IDL.Record({
      loan_id: IDL.Nat,
      borrow_destination: AccountType,
      lend_asset: Assets,
      borrow_amount: IDL.Nat,
      lend_pool_id: IDL.Principal,
      refund_destination: AccountType,
      ltv_max_bps: IDL.Nat64,
      ltv_timer_s: IDL.Nat64,
      lending_profile: IDL.Principal,
      borrow_pool_id: IDL.Principal,
      borrow_asset: Assets,
    }),
    FullLendWithdrawalRequested: IDL.Record({
      loan_id: IDL.Nat,
      account: AccountType,
      pool_id: IDL.Principal,
    }),
    BorrowRequested: IDL.Record({
      loan_id: IDL.Nat,
      account: AccountType,
      pool_id: IDL.Principal,
      amount: IDL.Nat,
    }),
    DepositTimerExceeded: IDL.Record({ loan_id: IDL.Nat }),
    StuckFundsWithdrawalRequested: IDL.Record({
      leg: LoanLeg,
      loan_id: IDL.Nat,
      account: AccountType,
      pool_id: IDL.Principal,
      amount: IDL.Nat,
    }),
    ProfileWarmed: IDL.Record({
      derivation_index: IDL.Vec(IDL.Nat8),
      warmed_profile_id: IDL.Nat,
      eth_address: IDL.Text,
      lending_profile: IDL.Principal,
    }),
    RepayComplete: CreateLoanResponse,
    DepositTimerStarted: IDL.Record({
      loan_id: IDL.Nat,
      timestamp: IDL.Nat64,
    }),
  });
  const HeadlessLoanEvent = IDL.Record({
    id: IDL.Nat,
    schema_version: IDL.Nat16,
    timestamp: IDL.Nat64,
    event_type: HeadlessLoanEventType,
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
    created_at: IDL.Nat64,
    schema_version: IDL.Nat16,
    borrow_amount: IDL.Nat,
    lend_pool_id: IDL.Principal,
    refund_destination: AccountType,
    ltv_max_bps: IDL.Nat64,
    ltv_timer_s: IDL.Nat64,
    lending_profile: IDL.Principal,
    expires_at: IDL.Opt(IDL.Nat64),
    borrow_pool_id: IDL.Principal,
    borrow_asset: Assets,
    deposit_detected_ts: IDL.Opt(IDL.Nat64),
  });
  const LoanResult = IDL.Variant({ Ok: Loan, Err: InstantLoansError });
  const HeadlessLoansConfig = IDL.Record({
    lending_canister: IDL.Principal,
  });
  const WarmedProfile = IDL.Record({
    id: IDL.Nat,
    authorisation: AuthorisationType,
    created_at: IDL.Nat64,
    lending_profile: IDL.Principal,
  });

  return IDL.Service({
    count_warmed_profiles: IDL.Func([], [IDL.Nat64], ["query"]),
    create_loan: IDL.Func([CreateLoanRequest], [CreateLoanResult], []),
    get_config: IDL.Func([], [HeadlessLoansConfig], ["query"]),
    get_event: IDL.Func([IDL.Nat], [IDL.Opt(HeadlessLoanEvent)], ["query"]),
    get_loan: IDL.Func([IDL.Nat], [LoanResult], ["query"]),
    list_access_list: IDL.Func([], [IDL.Vec(IDL.Principal)], ["query"]),
    list_events: IDL.Func(
      [IDL.Nat, IDL.Nat64],
      [IDL.Vec(IDL.Tuple(IDL.Nat, HeadlessLoanEvent))],
      ["query"]
    ),
    list_warmed_profiles: IDL.Func([], [IDL.Vec(WarmedProfile)], ["query"]),
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
