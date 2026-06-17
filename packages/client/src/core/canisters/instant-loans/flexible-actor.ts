import type { ActorMethod } from "@icp-sdk/core/agent";
import { Actor } from "@icp-sdk/core/agent";
import type { IDL } from "@icp-sdk/core/candid";
import type { Principal } from "@icp-sdk/core/principal";
import { LiquidiumError, LiquidiumErrorCode } from "../../errors";
import type { CanisterContext } from "../../transports/canister-context";
import { extractVariantTag, KNOWN_ASSET_TAGS } from "../../utils/variant-tags";
import type {
  CreateInstantLoanCanisterRequest,
  HeadlessLoanCreatedEventPayload,
  HeadlessLoanEventType,
  HeadlessLoansConfig,
  InstantLoanAccountType,
  InstantLoanAuthorisation,
  InstantLoansCanisterError,
  WarmedProfile,
} from "./actor";

interface FlexibleInstantLoanAccountIdentifierAccountType {
  AccountIdentifier: string;
}

interface FlexibleInstantLoanIcrcAccount {
  owner: Principal;
  subaccount: [] | [Uint8Array];
}

interface FlexibleInstantLoanIcrcAccountType {
  Icrc: FlexibleInstantLoanIcrcAccount;
}

type FlexibleInstantLoanAccountType =
  | InstantLoanAccountType
  | FlexibleInstantLoanAccountIdentifierAccountType
  | FlexibleInstantLoanIcrcAccountType;

export interface FlexibleCreateInstantLoanCanisterResponse {
  loan_id: bigint;
  lending_profile: Principal;
}

export interface FlexibleHeadlessLoanCreatedEventPayload {
  loan_id: bigint;
  borrow_destination: FlexibleInstantLoanAccountType;
  lend_asset: object;
  borrow_amount: bigint;
  lend_pool_id: Principal;
  refund_destination: FlexibleInstantLoanAccountType;
  ltv_max_bps: bigint;
  ltv_timer_s: bigint;
  lending_profile: Principal;
  borrow_pool_id: Principal;
  borrow_asset: object;
}

export interface FlexibleHeadlessLoanCreatedEventType {
  LoanCreated: FlexibleHeadlessLoanCreatedEventPayload;
}

export type FlexibleHeadlessLoanEventType =
  | FlexibleHeadlessLoanCreatedEventType
  | HeadlessLoanEventTypeWithoutAssets;

type HeadlessLoanEventTypeWithoutAssets = Exclude<
  HeadlessLoanEventType,
  { LoanCreated: HeadlessLoanCreatedEventPayload }
>;

export interface FlexibleHeadlessLoanEvent {
  id: bigint;
  schema_version: number;
  timestamp: bigint;
  event_type: FlexibleHeadlessLoanEventType;
}

export interface FlexibleInstantLoanCanisterRecord {
  id: bigint;
  authorisation: InstantLoanAuthorisation;
  borrow_destination: FlexibleInstantLoanAccountType;
  started: boolean;
  lend_asset: object;
  created_at: bigint;
  schema_version: number;
  borrow_amount: bigint;
  lend_pool_id: Principal;
  refund_destination: FlexibleInstantLoanAccountType;
  ltv_max_bps: bigint;
  ltv_timer_s: bigint;
  lending_profile: Principal;
  borrow_pool_id: Principal;
  borrow_asset: object;
  expires_at: [] | [bigint];
  deposit_detected_ts: [] | [bigint];
}

export interface DecodedHeadlessLoanCreatedEventPayload {
  loan_id: bigint;
  borrow_destination: FlexibleInstantLoanAccountType;
  lend_asset: string;
  borrow_amount: bigint;
  lend_pool_id: Principal;
  refund_destination: FlexibleInstantLoanAccountType;
  ltv_max_bps: bigint;
  ltv_timer_s: bigint;
  lending_profile: Principal;
  borrow_pool_id: Principal;
  borrow_asset: string;
}

export type DecodedHeadlessLoanEventType =
  | { LoanCreated: DecodedHeadlessLoanCreatedEventPayload }
  | HeadlessLoanEventTypeWithoutAssets;

export interface DecodedHeadlessLoanEvent {
  id: bigint;
  schema_version: number;
  timestamp: bigint;
  event_type: DecodedHeadlessLoanEventType;
}

export interface DecodedInstantLoanCanisterRecord {
  id: bigint;
  authorisation: InstantLoanAuthorisation;
  borrow_destination: FlexibleInstantLoanAccountType;
  started: boolean;
  lend_asset: string;
  created_at: bigint;
  schema_version: number;
  borrow_amount: bigint;
  lend_pool_id: Principal;
  refund_destination: FlexibleInstantLoanAccountType;
  ltv_max_bps: bigint;
  ltv_timer_s: bigint;
  lending_profile: Principal;
  borrow_pool_id: Principal;
  borrow_asset: string;
  expires_at: [] | [bigint];
  deposit_detected_ts: [] | [bigint];
}

type FlexibleResult<T> = { Ok: T } | { Err: InstantLoansCanisterError };

export interface FlexibleInstantLoansActor {
  create_loan: ActorMethod<
    [CreateInstantLoanCanisterRequest],
    FlexibleResult<FlexibleCreateInstantLoanCanisterResponse>
  >;
  count_warmed_profiles: ActorMethod<[], bigint>;
  get_config: ActorMethod<[], HeadlessLoansConfig>;
  get_event: ActorMethod<[bigint], [] | [FlexibleHeadlessLoanEvent]>;
  get_loan: ActorMethod<
    [bigint],
    FlexibleResult<FlexibleInstantLoanCanisterRecord>
  >;
  list_access_list: ActorMethod<[], Principal[]>;
  list_events: ActorMethod<
    [bigint, bigint],
    Array<[bigint, FlexibleHeadlessLoanEvent]>
  >;
  list_warmed_profiles: ActorMethod<[], WarmedProfile[]>;
}

const flexibleInstantLoansIdlFactory: IDL.InterfaceFactory = ({ IDL }) => {
  const IcrcAccount = IDL.Record({
    owner: IDL.Principal,
    subaccount: IDL.Opt(IDL.Vec(IDL.Nat8)),
  });
  const AccountType = IDL.Variant({
    Icrc: IcrcAccount,
    Native: IDL.Principal,
    AccountIdentifier: IDL.Text,
    External: IDL.Text,
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
    lend_asset: IDL.Unknown,
    borrow_amount: IDL.Nat,
    lend_pool_id: IDL.Principal,
    refund_destination: AccountType,
    ltv_max_bps: IDL.Nat64,
    borrow_pool_id: IDL.Principal,
    borrow_asset: IDL.Unknown,
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
      lend_asset: IDL.Unknown,
      borrow_amount: IDL.Nat,
      lend_pool_id: IDL.Principal,
      refund_destination: AccountType,
      ltv_max_bps: IDL.Nat64,
      ltv_timer_s: IDL.Nat64,
      lending_profile: IDL.Principal,
      borrow_pool_id: IDL.Principal,
      borrow_asset: IDL.Unknown,
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
    lend_asset: IDL.Unknown,
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
    borrow_asset: IDL.Unknown,
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

export function createFlexibleInstantLoansActor(
  canisterContext: CanisterContext
): FlexibleInstantLoansActor {
  const canisterId = canisterContext.canisterIds.instantLoans;

  if (!canisterId) {
    throw new LiquidiumError(
      LiquidiumErrorCode.SERVICE_UNAVAILABLE,
      "Instant loans canister ID is not configured"
    );
  }

  return Actor.createActor<FlexibleInstantLoansActor>(
    flexibleInstantLoansIdlFactory,
    {
      agent: canisterContext.agent,
      canisterId,
    }
  );
}

export function decodeFlexibleInstantLoanRecord(
  record: FlexibleInstantLoanCanisterRecord
): DecodedInstantLoanCanisterRecord | null {
  const lend_asset = extractVariantTag(record.lend_asset, KNOWN_ASSET_TAGS);
  const borrow_asset = extractVariantTag(record.borrow_asset, KNOWN_ASSET_TAGS);

  if (!lend_asset || !borrow_asset) {
    return null;
  }

  return {
    id: record.id,
    authorisation: record.authorisation,
    borrow_destination: record.borrow_destination,
    started: record.started,
    lend_asset,
    created_at: record.created_at,
    schema_version: record.schema_version,
    borrow_amount: record.borrow_amount,
    lend_pool_id: record.lend_pool_id,
    refund_destination: record.refund_destination,
    ltv_max_bps: record.ltv_max_bps,
    ltv_timer_s: record.ltv_timer_s,
    lending_profile: record.lending_profile,
    borrow_pool_id: record.borrow_pool_id,
    borrow_asset,
    expires_at: record.expires_at,
    deposit_detected_ts: record.deposit_detected_ts,
  };
}

export function decodeFlexibleHeadlessLoanEvent(
  event: FlexibleHeadlessLoanEvent
): DecodedHeadlessLoanEvent | null {
  if ("LoanCreated" in event.event_type) {
    const decoded = decodeLoanCreatedEvent(event.event_type.LoanCreated);

    if (!decoded) {
      return null;
    }

    return {
      id: event.id,
      schema_version: event.schema_version,
      timestamp: event.timestamp,
      event_type: decoded,
    };
  }

  return {
    id: event.id,
    schema_version: event.schema_version,
    timestamp: event.timestamp,
    event_type: event.event_type as DecodedHeadlessLoanEventType,
  };
}

function decodeLoanCreatedEvent(
  payload: FlexibleHeadlessLoanCreatedEventPayload
): DecodedHeadlessLoanEventType | null {
  const lend_asset = extractVariantTag(payload.lend_asset, KNOWN_ASSET_TAGS);
  const borrow_asset = extractVariantTag(
    payload.borrow_asset,
    KNOWN_ASSET_TAGS
  );

  if (!lend_asset || !borrow_asset) {
    return null;
  }

  return {
    LoanCreated: {
      loan_id: payload.loan_id,
      borrow_destination: payload.borrow_destination,
      lend_asset,
      borrow_amount: payload.borrow_amount,
      lend_pool_id: payload.lend_pool_id,
      refund_destination: payload.refund_destination,
      ltv_max_bps: payload.ltv_max_bps,
      ltv_timer_s: payload.ltv_timer_s,
      lending_profile: payload.lending_profile,
      borrow_pool_id: payload.borrow_pool_id,
      borrow_asset,
    },
  };
}
