import type { Principal } from "@icp-sdk/core/principal";
import type {
  CanisterAccountIdentifierAccount,
  CanisterExternalAccount,
  CanisterIcrcAccount,
  CanisterLiquidiumAccount,
  CanisterNativeAccount,
} from "../../accounts";

export type InstantLoanIcrcAccount = CanisterIcrcAccount["Icrc"];
export type InstantLoanIcrcAccountType = CanisterIcrcAccount;
export type InstantLoanNativeAccountType = CanisterNativeAccount;
export type InstantLoanAccountIdentifierAccountType =
  CanisterAccountIdentifierAccount;
export type InstantLoanExternalAccountType = CanisterExternalAccount;
export type InstantLoanAccountType = CanisterLiquidiumAccount;

export interface InstantLoanBtcAsset {
  BTC: null;
}

export interface InstantLoanIcpAsset {
  ICP: null;
}

export interface InstantLoanSolAsset {
  SOL: null;
}

export interface InstantLoanUsdcAsset {
  USDC: null;
}

export interface InstantLoanUsdtAsset {
  USDT: null;
}

export type InstantLoanAsset =
  | InstantLoanBtcAsset
  | InstantLoanIcpAsset
  | InstantLoanSolAsset
  | InstantLoanUsdcAsset
  | InstantLoanUsdtAsset;

export interface InstantLoanLendLeg {
  Lend: null;
}

export interface InstantLoanBorrowLeg {
  Borrow: null;
}

export type InstantLoanLeg = InstantLoanLendLeg | InstantLoanBorrowLeg;

export interface InstantLoanEthSignatureAuthorisation {
  derivation_index: Uint8Array;
  pubkey: Uint8Array;
  address: string;
}

export interface InstantLoanAuthorisation {
  EthSignature: InstantLoanEthSignatureAuthorisation;
}

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

export interface HeadlessLoanCreatedEventPayload {
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
}

export interface HeadlessLoanCreatedEventType {
  LoanCreated: HeadlessLoanCreatedEventPayload;
}

export interface HeadlessLoanFullLendWithdrawalRequestedEventPayload {
  loan_id: bigint;
  account: InstantLoanAccountType;
  pool_id: Principal;
}

export interface HeadlessLoanFullLendWithdrawalRequestedEventType {
  FullLendWithdrawalRequested: HeadlessLoanFullLendWithdrawalRequestedEventPayload;
}

export interface HeadlessLoanBorrowRequestedEventPayload {
  loan_id: bigint;
  account: InstantLoanAccountType;
  pool_id: Principal;
  amount: bigint;
}

export interface HeadlessLoanBorrowRequestedEventType {
  BorrowRequested: HeadlessLoanBorrowRequestedEventPayload;
}

export interface HeadlessLoanDepositTimerExceededEventPayload {
  loan_id: bigint;
}

export interface HeadlessLoanDepositTimerExceededEventType {
  DepositTimerExceeded: HeadlessLoanDepositTimerExceededEventPayload;
}

export interface HeadlessLoanStuckFundsWithdrawalRequestedEventPayload {
  leg: InstantLoanLeg;
  loan_id: bigint;
  account: InstantLoanAccountType;
  pool_id: Principal;
  amount: bigint;
}

export interface HeadlessLoanStuckFundsWithdrawalRequestedEventType {
  StuckFundsWithdrawalRequested: HeadlessLoanStuckFundsWithdrawalRequestedEventPayload;
}

export interface HeadlessLoanProfileWarmedEventPayload {
  derivation_index: Uint8Array;
  warmed_profile_id: bigint;
  eth_address: string;
  lending_profile: Principal;
}

export interface HeadlessLoanProfileWarmedEventType {
  ProfileWarmed: HeadlessLoanProfileWarmedEventPayload;
}

export interface HeadlessLoanRepayCompleteEventType {
  RepayComplete: CreateInstantLoanCanisterResponse;
}

export interface HeadlessLoanDepositTimerStartedEventPayload {
  loan_id: bigint;
  timestamp: bigint;
}

export interface HeadlessLoanDepositTimerStartedEventType {
  DepositTimerStarted: HeadlessLoanDepositTimerStartedEventPayload;
}

export type HeadlessLoanEventType =
  | HeadlessLoanCreatedEventType
  | HeadlessLoanFullLendWithdrawalRequestedEventType
  | HeadlessLoanBorrowRequestedEventType
  | HeadlessLoanDepositTimerExceededEventType
  | HeadlessLoanStuckFundsWithdrawalRequestedEventType
  | HeadlessLoanProfileWarmedEventType
  | HeadlessLoanRepayCompleteEventType
  | HeadlessLoanDepositTimerStartedEventType;

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

export interface LendingClientCallErrorPayload {
  method: string;
  reason: string;
}

interface LendingClientCallFailedError {
  CallFailed: LendingClientCallErrorPayload;
}

interface LendingClientCallRejectedError {
  CallRejected: LendingClientCallErrorPayload;
}

interface LendingClientDecodeFailedError {
  DecodeFailed: LendingClientCallErrorPayload;
}

type LendingClientError =
  | LendingClientCallFailedError
  | LendingClientCallRejectedError
  | LendingClientDecodeFailedError;

export type InstantLoansCanisterError =
  | BorrowAmountRequiredError
  | NoCollateralPositionError
  | LtvTimerOutOfRangeError
  | LtvMaxExceededError
  | MemoryLockFailedError
  | UnauthorizedAccessListCallerError
  | LendingClientCanisterError
  | LtvMaxOutOfRangeError
  | AccountRequiredError
  | DepositTimerExceededError
  | LoanNotFoundError
  | LendingProtocolError
  | AuthorizationFailedError
  | DepositAlreadyProcessedError
  | MissingPriceError
  | InvalidLtvTimerSError
  | DebtNotFullyRepaidError
  | EmptyCollateralPositionError
  | SigningFailedError;

interface BorrowAmountRequiredError {
  BorrowAmountRequired: null;
}

interface LoanIdErrorPayload {
  loan_id: bigint;
}

interface NoCollateralPositionError {
  NoCollateralPosition: LoanIdErrorPayload;
}

interface MaxValueErrorPayload {
  max: bigint;
}

interface LtvTimerOutOfRangeError {
  LtvTimerOutOfRange: MaxValueErrorPayload;
}

interface LtvMaxExceededPayload {
  actual_bps: bigint;
  max_bps: bigint;
}

interface LtvMaxExceededError {
  LtvMaxExceeded: LtvMaxExceededPayload;
}

interface ReasonErrorPayload {
  reason: string;
}

interface MemoryLockFailedError {
  MemoryLockFailed: ReasonErrorPayload;
}

interface UnauthorizedAccessListCallerPayload {
  caller: Principal;
}

interface UnauthorizedAccessListCallerError {
  UnauthorizedAccessListCaller: UnauthorizedAccessListCallerPayload;
}

interface LendingClientCanisterError {
  LendingClient: LendingClientError;
}

interface LtvMaxOutOfRangeError {
  LtvMaxOutOfRange: MaxValueErrorPayload;
}

interface AccountRequiredPayload {
  label: string;
}

interface AccountRequiredError {
  AccountRequired: AccountRequiredPayload;
}

interface DepositTimerExceededError {
  DepositTimerExceeded: LoanIdErrorPayload;
}

interface LoanNotFoundError {
  LoanNotFound: LoanIdErrorPayload;
}

interface LendingProtocolErrorPayload {
  error: unknown;
  operation: string;
}

interface LendingProtocolError {
  LendingProtocolError: LendingProtocolErrorPayload;
}

interface AuthorizationFailedError {
  AuthorizationFailed: ReasonErrorPayload;
}

interface DepositAlreadyProcessedError {
  DepositAlreadyProcessed: LoanIdErrorPayload;
}

interface MissingPricePayload {
  symbol: string;
}

interface MissingPriceError {
  MissingPrice: MissingPricePayload;
}

interface InvalidLtvTimerSError {
  InvalidLtvTimerS: null;
}

interface DebtNotFullyRepaidError {
  DebtNotFullyRepaid: LoanIdErrorPayload;
}

interface EmptyCollateralPositionError {
  EmptyCollateralPosition: null;
}

interface SigningFailedError {
  SigningFailed: ReasonErrorPayload;
}
