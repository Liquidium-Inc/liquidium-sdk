import type { Principal } from "@icp-sdk/core/principal";
import type {
  CanisterAccountIdentifierAccount,
  CanisterExternalAccount,
  CanisterIcrcAccount,
  CanisterLiquidiumAccount,
  CanisterNativeAccount,
} from "../../accounts";

export type SimpleLoanIcrcAccount = CanisterIcrcAccount["Icrc"];
export type SimpleLoanIcrcAccountType = CanisterIcrcAccount;
export type SimpleLoanNativeAccountType = CanisterNativeAccount;
export type SimpleLoanAccountIdentifierAccountType =
  CanisterAccountIdentifierAccount;
export type SimpleLoanExternalAccountType = CanisterExternalAccount;
export type SimpleLoanAccountType = CanisterLiquidiumAccount;

export interface SimpleLoanBtcAsset {
  BTC: null;
}

export interface SimpleLoanIcpAsset {
  ICP: null;
}

export interface SimpleLoanEthAsset {
  ETH: null;
}

export interface SimpleLoanSolAsset {
  SOL: null;
}

export interface SimpleLoanUsdcAsset {
  USDC: null;
}

export interface SimpleLoanUsdtAsset {
  USDT: null;
}

export type SimpleLoanAsset =
  | SimpleLoanBtcAsset
  | SimpleLoanEthAsset
  | SimpleLoanIcpAsset
  | SimpleLoanSolAsset
  | SimpleLoanUsdcAsset
  | SimpleLoanUsdtAsset;

export interface SimpleLoanLendLeg {
  Lend: null;
}

export interface SimpleLoanBorrowLeg {
  Borrow: null;
}

export type SimpleLoanLeg = SimpleLoanLendLeg | SimpleLoanBorrowLeg;

export interface SimpleLoanEthSignatureAuthorisation {
  derivation_index: Uint8Array;
  pubkey: Uint8Array;
  address: string;
}

export interface SimpleLoanAuthorisation {
  EthSignature: SimpleLoanEthSignatureAuthorisation;
}

export interface CreateSimpleLoanCanisterRequest {
  borrow_destination: SimpleLoanAccountType;
  lend_asset: SimpleLoanAsset;
  borrow_amount: bigint;
  lend_pool_id: Principal;
  refund_destination: SimpleLoanAccountType;
  ltv_max_bps: bigint;
  borrow_pool_id: Principal;
  borrow_asset: SimpleLoanAsset;
  ltv_timer_s: bigint;
}

export interface CreateSimpleLoanCanisterResponse {
  loan_id: bigint;
  lending_profile: Principal;
}

export interface HeadlessLoansConfig {
  lending_canister: Principal;
}

export interface HeadlessLoanCreatedEventPayload {
  loan_id: bigint;
  borrow_destination: SimpleLoanAccountType;
  lend_asset: SimpleLoanAsset;
  borrow_amount: bigint;
  lend_pool_id: Principal;
  refund_destination: SimpleLoanAccountType;
  ltv_max_bps: bigint;
  ltv_timer_s: bigint;
  lending_profile: Principal;
  borrow_pool_id: Principal;
  borrow_asset: SimpleLoanAsset;
}

export interface HeadlessLoanCreatedEventType {
  LoanCreated: HeadlessLoanCreatedEventPayload;
}

export interface HeadlessLoanFullLendWithdrawalRequestedEventPayload {
  loan_id: bigint;
  account: SimpleLoanAccountType;
  pool_id: Principal;
}

export interface HeadlessLoanFullLendWithdrawalRequestedEventType {
  FullLendWithdrawalRequested: HeadlessLoanFullLendWithdrawalRequestedEventPayload;
}

export interface HeadlessLoanBorrowRequestedEventPayload {
  loan_id: bigint;
  account: SimpleLoanAccountType;
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
  leg: SimpleLoanLeg;
  loan_id: bigint;
  account: SimpleLoanAccountType;
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
  RepayComplete: CreateSimpleLoanCanisterResponse;
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

export interface SimpleLoanCanisterRecord {
  id: bigint;
  authorisation: SimpleLoanAuthorisation;
  borrow_destination: SimpleLoanAccountType;
  started: boolean;
  lend_asset: SimpleLoanAsset;
  created_at: bigint;
  schema_version: number;
  borrow_amount: bigint;
  lend_pool_id: Principal;
  refund_destination: SimpleLoanAccountType;
  ltv_max_bps: bigint;
  ltv_timer_s: bigint;
  lending_profile: Principal;
  borrow_pool_id: Principal;
  borrow_asset: SimpleLoanAsset;
  expires_at: [] | [bigint];
  deposit_detected_ts: [] | [bigint];
}

export interface WarmedProfile {
  id: bigint;
  authorisation: SimpleLoanAuthorisation;
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

export type SimpleLoansCanisterError =
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
