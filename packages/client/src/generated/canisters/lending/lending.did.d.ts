import type { Principal } from '@icp-sdk/core/principal';
import type { ActorMethod } from '@icp-sdk/core/agent';
import type { IDL } from '@icp-sdk/core/candid';

export type AccountType = { 'Icrc' : IcrcAccount } |
  { 'Native' : Principal } |
  { 'AccountIdentifier' : string } |
  { 'External' : string };
export interface AddAccountRequest {
  'target_principal' : Principal,
  'chain' : WalletType,
  'wallet_signature' : SignatureScheme,
  'expiry_timestamp' : bigint,
}
export type AssetType = { 'CkAsset' : Principal } |
  { 'Unknown' : null };
export type Assets = { 'BTC' : null } |
  { 'ICP' : null } |
  { 'SOL' : null } |
  { 'USDC' : null } |
  { 'USDT' : null };
export interface BorrowAssetRequest {
  'expiry_timestamp' : bigint,
  'account' : AccountType,
  'pool_id' : Principal,
  'amount' : bigint,
}
export interface BorrowingPower {
  'max_borrowable_usd' : bigint,
  'weighted_max_ltv' : bigint,
}
export type Chains = { 'BTC' : null } |
  { 'ETH' : null } |
  { 'ICP' : null } |
  { 'SOL' : null };
export interface ClaimFeeRequest { 'pool_id' : Principal }
export interface IcrcAccount {
  'owner' : Principal,
  'subaccount' : [] | [Uint8Array | number[]],
}
export interface InflowDetails {
  'id' : string,
  'inflow_type' : InflowType,
  'txid' : string,
  'timestamp' : bigint,
  'amount' : bigint,
  'receiver' : Principal,
}
export type InflowType = { 'Repayment' : null } |
  { 'Deposit' : null };
export interface InitializeAccountRequest { 'expiry_timestamp' : bigint }
export type LiqTxTarget = { 'Collateral' : null } |
  { 'Change' : null };
export interface LiquidatablePosition {
  'collateral_amount' : bigint,
  'asset_type' : AssetType,
  'debt_amount' : bigint,
  'asset' : Assets,
  'account' : Principal,
  'pool_id' : Principal,
  'protocol_fee' : bigint,
  'liquidation_bonus' : bigint,
  'liquidation_threshold' : bigint,
}
export interface LiquidatableUser {
  'health_factor' : bigint,
  'total_debt' : bigint,
  'account' : Principal,
  'positions' : Array<LiquidatablePosition>,
  'weighted_liquidation_threshold' : bigint,
}
export interface LiquidationAmounts {
  'debt_repaid' : bigint,
  'collateral_received' : bigint,
}
export interface LiquidationRequest {
  'debt_amount' : bigint,
  'receiver_address' : Principal,
  'collateral_pool_id' : Principal,
  'borrower' : Principal,
  'debt_pool_id' : Principal,
  'buy_bad_debt' : boolean,
}
export interface LiquidationResult {
  'id' : bigint,
  'status' : LiquidationStatus,
  'change_tx' : TxStatus,
  'debt_asset' : AssetType,
  'amounts' : LiquidationAmounts,
  'collateral_asset' : AssetType,
  'timestamp' : bigint,
  'collateral_tx' : TxStatus,
}
export type LiquidationStatus = { 'CollateralTransferFailed' : string } |
  { 'FailedLiquidation' : string } |
  { 'InflowProcessed' : null } |
  { 'Success' : null } |
  { 'CoreExecuted' : null } |
  { 'ChangeTransferFailed' : string } |
  { 'Pending' : null };
export interface ListPositionsResponse {
  'total' : bigint,
  'next_cursor' : [] | [[Principal, Principal]],
  'positions' : Array<PositionView>,
}
export interface ListProfilesResponse {
  'total' : bigint,
  'next_cursor' : [] | [Principal],
  'profiles' : Array<[Principal, [bigint, UserStats]]>,
}
export interface OutflowDetails {
  'id' : string,
  'txid' : [] | [string],
  'outflow_type' : OutflowType,
  'outflow_ref' : [] | [string],
  'amount' : bigint,
  'receiver' : AccountType,
}
export type OutflowType = { 'Withdraw' : null } |
  { 'FeeClaim' : null } |
  { 'Borrow' : null };
export interface Pool {
  'optimal_utilization_rate' : bigint,
  'principal' : Principal,
  'total_generated_interest_snapshot' : bigint,
  'asset_type' : AssetType,
  'supply_cap' : [] | [bigint],
  'same_asset_borrowing' : [] | [boolean],
  'asset' : Assets,
  'rate_slope_before' : bigint,
  'borrow_cap' : [] | [bigint],
  'total_debt_at_last_sync' : bigint,
  'supply_at_last_sync' : bigint,
  'chain' : Chains,
  'rate_slope_after' : bigint,
  'reserve_factor' : bigint,
  'last_updated' : [] | [bigint],
  'lending_index' : bigint,
  'protocol_liquidation_fee' : bigint,
  'treasury_supply_scaled' : bigint,
  'same_asset_borrowing_dust_threshold' : bigint,
  'borrow_index' : bigint,
  'base_rate' : bigint,
  'frozen' : boolean,
  'liquidation_bonus' : bigint,
  'liquidation_threshold' : bigint,
  'max_ltv' : bigint,
  'repay_grace_period' : [] | [bigint],
  'pending_service_fees' : bigint,
  'total_supply_at_last_sync' : bigint,
}
export type PoolEvents = { 'DepositConfirmed' : InflowDetails } |
  { 'RepaymentConfirmed' : RepaymentDetails };
export interface Position {
  'asset' : Assets,
  'total_debt_interest' : bigint,
  'borrow_index_snapshot' : bigint,
  'lending_index_snapshot' : bigint,
  'debt_scaled' : bigint,
  'total_earned_interest' : bigint,
  'deposit_scaled' : bigint,
  'pool_id' : Principal,
  'unpaid_debt_interest' : bigint,
  'last_update' : bigint,
  'user_profile' : Principal,
}
export interface PositionView {
  'lending_index_now' : bigint,
  'interest_since_snapshot' : bigint,
  'asset' : Assets,
  'total_debt_interest' : bigint,
  'borrow_index_snapshot' : bigint,
  'debt_native_now' : bigint,
  'borrow_index_now' : bigint,
  'lending_index_snapshot' : bigint,
  'debt_scaled' : bigint,
  'total_earned_interest' : bigint,
  'deposit_scaled' : bigint,
  'earned_since_snapshot' : bigint,
  'deposited_native_now' : bigint,
  'pool_id' : Principal,
  'last_update' : bigint,
  'user_profile' : Principal,
}
export interface ProfileCreatedEvent {
  'wallet' : Wallet,
  'profile' : Principal,
}
export type ProtocolError = { 'PositionNotFound' : null } |
  { 'Internal' : string } |
  { 'InvalidAddress' : string } |
  { 'InvalidTargetPrincipal' : null } |
  { 'SignatureError' : SignatureVerificationError } |
  { 'SupplyCapExceeded' : null } |
  { 'AccountNotFound' : null } |
  { 'NotAllowed' : string } |
  { 'PoolNotFound' : string } |
  { 'FeeClaimReceiverNotConfigured' : null } |
  { 'InsufficientCollateral' : null } |
  { 'ProfileNotFound' : null } |
  { 'SignatureExpiryTooFarInFuture' : null } |
  { 'MaxLtvExceeded' : null } |
  { 'ProfileAlreadyExists' : null } |
  { 'LiquidationNotFound' : string } |
  { 'HealthFactorTooLow' : null } |
  { 'NoLiquidity' : null } |
  { 'SignatureExpired' : null } |
  { 'BorrowingDisabled' : null } |
  { 'BorrowCapExceeded' : null } |
  { 'PoolFrozen' : null } |
  { 'TransferFailed' : string } |
  { 'AccountAlreadyLinked' : null } |
  { 'CannotRemoveSoleAccount' : null } |
  { 'InsufficientFunds' : null };
export interface ProtocolEvent {
  'id' : bigint,
  'user' : Principal,
  'timestamp' : bigint,
  'event_type' : ProtocolEventType,
}
export type ProtocolEventType = {
    'RepaymentRejected' : {
      'pool' : Principal,
      'error' : ProtocolError,
      'details' : RepaymentDetails,
    }
  } |
  { 'AccountCreated' : ProfileCreatedEvent } |
  { 'DepositConfirmed' : { 'pool' : Principal, 'details' : InflowDetails } } |
  {
    'DepositRejected' : {
      'pool' : Principal,
      'error' : ProtocolError,
      'details' : InflowDetails,
    }
  } |
  { 'AccountAdded' : Wallet } |
  { 'BorrowStateUpdated' : boolean } |
  {
    'LiquidationUnderlyingWithdrawal' : {
      'txid' : string,
      'target' : LiqTxTarget,
      'liquidation_id' : bigint,
      'account' : string,
      'pool_id' : string,
      'amount' : bigint,
    }
  } |
  { 'PoolUpdated' : Pool } |
  {
    'RepaymentConfirmed' : { 'pool' : Principal, 'details' : RepaymentDetails }
  } |
  {
    'LiquidationExecuted' : {
      'result' : LiquidationResult,
      'request' : LiquidationRequest,
    }
  } |
  {
    'WithdrawalConfirmed' : { 'pool' : Principal, 'details' : OutflowDetails }
  } |
  { 'BorrowConfirmed' : { 'pool' : Principal, 'details' : OutflowDetails } } |
  { 'PoolRegistered' : Pool } |
  { 'AccountRemoved' : Wallet } |
  { 'PoolRemoved' : Principal };
export interface RemoveAccountRequest {
  'wallet_address' : string,
  'expiry_timestamp' : bigint,
}
export interface RepaymentDetails {
  'id' : string,
  'txid' : string,
  'account' : Principal,
  'timestamp' : bigint,
  'amount' : bigint,
}
export type Result = { 'Ok' : null } |
  { 'Err' : ProtocolError };
export type Result_1 = { 'Ok' : OutflowDetails } |
  { 'Err' : ProtocolError };
export type Result_2 = { 'Ok' : LiquidationResult } |
  { 'Err' : ProtocolError };
export type Result_3 = { 'Ok' : [bigint, number] } |
  { 'Err' : string };
export type Result_4 = { 'Ok' : [] | [bigint] } |
  { 'Err' : ProtocolError };
export type Result_5 = { 'Ok' : Principal } |
  { 'Err' : ProtocolError };
export type Result_6 = { 'Ok' : null } |
  { 'Err' : string };
export type Result_7 = { 'Ok' : null } |
  { 'Err' : string };
export type Result_8 = { 'Ok' : bigint } |
  { 'Err' : ProtocolError };
export interface ScanResult {
  'scanned' : bigint,
  'users' : Array<LiquidatableUser>,
  'next_cursor' : [] | [Principal],
}
export interface SignatureInfo {
  'signature' : string,
  'chain' : Chains,
  'account' : string,
}
export type SignatureScheme = { 'Wallet' : SignatureInfo };
export type SignatureVerificationError = { 'InvalidEthSignature' : null } |
  { 'UnsupportedChain' : null } |
  { 'InvalidSolSignature' : null } |
  { 'InvalidEthAddress' : null } |
  { 'CouldNotDecode' : string } |
  { 'ProfileNotFound' : null } |
  { 'InvalidBtcSignature' : null };
export interface SignedRequest {
  'data' : AddAccountRequest,
  'signature_info' : SignatureScheme,
}
export interface SignedRequest_1 {
  'data' : BorrowAssetRequest,
  'signature_info' : SignatureScheme,
}
export interface SignedRequest_2 {
  'data' : InitializeAccountRequest,
  'signature_info' : SignatureScheme,
}
export interface SignedRequest_3 {
  'data' : RemoveAccountRequest,
  'signature_info' : SignatureScheme,
}
export interface SignedRequest_4 {
  'data' : WithdrawRequest,
  'signature_info' : SignatureScheme,
}
export type TransferStatus = { 'Failed' : string } |
  { 'Success' : null } |
  { 'Pending' : null };
export interface TxStatus { 'status' : TransferStatus, 'tx_id' : [] | [string] }
export interface UserStats {
  'debt' : bigint,
  'collateral' : bigint,
  'acumulated_interest' : bigint,
  'borrowing_power' : BorrowingPower,
  'positions' : Array<Position>,
  'weighted_liquidation_threshold' : bigint,
}
export interface Wallet { 'chain' : WalletType, 'address' : string }
export type WalletType = { 'Wallet' : Chains };
export interface WithdrawRequest {
  'expiry_timestamp' : bigint,
  'account' : AccountType,
  'pool_id' : Principal,
  'amount' : bigint,
}
export interface _SERVICE {
  'add_admin' : ActorMethod<[Principal], undefined>,
  'add_liquidator' : ActorMethod<[Principal], undefined>,
  /**
   * Add a wallet to an existing profile
   */
  'add_wallet' : ActorMethod<[Principal, SignedRequest], Result>,
  /**
   * Borrow assets from a pool against collateral
   */
  'borrow_assets' : ActorMethod<[Principal, SignedRequest_1], Result_1>,
  'claim_fee' : ActorMethod<[ClaimFeeRequest], Result_1>,
  'disable_borrowing' : ActorMethod<[], undefined>,
  'disable_same_asset_borrowing' : ActorMethod<[Principal], undefined>,
  'enable_borrowing' : ActorMethod<[], undefined>,
  'enable_same_asset_borrowing' : ActorMethod<[Principal], undefined>,
  'freeze_pool' : ActorMethod<[Principal], undefined>,
  'get_admins' : ActorMethod<[], Array<Principal>>,
  /**
   * Get positions eligible for liquidation with offset-based pagination
   */
  'get_at_risk_positions' : ActorMethod<
    [bigint, bigint],
    Array<LiquidatableUser>
  >,
  /**
   * Check if borrowing is globally disabled
   */
  'get_borrowing_disabled' : ActorMethod<[], boolean>,
  /**
   * Fetch a specific canister event by ID
   */
  'get_event' : ActorMethod<[bigint], [] | [ProtocolEvent]>,
  /**
   * Get the health factor and stats for a profile
   */
  'get_health_factor' : ActorMethod<[Principal], [bigint, UserStats]>,
  /**
   * Get details of a completed liquidation by ID
   */
  'get_liquidation' : ActorMethod<[bigint], Result_2>,
  'get_liquidators' : ActorMethod<[], Array<Principal>>,
  /**
   * Get the current signature nonce for a wallet address
   */
  'get_nonce' : ActorMethod<[string], bigint>,
  /**
   * Get a specific pool by its principal with current rates
   */
  'get_pool' : ActorMethod<[Principal], [] | [Pool]>,
  /**
   * Get current rates for a pool (borrow, lending, utilization)
   */
  'get_pool_rate' : ActorMethod<[Principal], [] | [[bigint, bigint, bigint]]>,
  /**
   * Get a profile's position in a specific pool
   */
  'get_position' : ActorMethod<[Principal, Principal], [] | [PositionView]>,
  /**
   * Price functionality
   */
  'get_price' : ActorMethod<[string, string], Result_3>,
  'get_prices' : ActorMethod<[], Array<[string, bigint, number]>>,
  /**
   * Get aggregate stats for a profile across all positions
   */
  'get_profile_stats' : ActorMethod<[Principal], UserStats>,
  /**
   * Get all wallets linked to a profile
   */
  'get_profile_wallets' : ActorMethod<[Principal], Array<Wallet>>,
  'get_protocol_fee_claim_receiver' : ActorMethod<[], [] | [Principal]>,
  /**
   * Get the profile principal that owns a wallet address
   */
  'get_wallet_profile' : ActorMethod<[string], [] | [Principal]>,
  /**
   * Execute a liquidation of an undercollateralized position
   */
  'liquidate' : ActorMethod<[LiquidationRequest], Result_2>,
  /**
   * Fetch all canister events with offset-based pagination
   */
  'list_events' : ActorMethod<[bigint, bigint], Array<[bigint, ProtocolEvent]>>,
  /**
   * Pool related functionality
   * Get all registered pools
   */
  'list_pools' : ActorMethod<[], Array<Pool>>,
  /**
   * List all positions across all profiles with cursor-based pagination
   */
  'list_positions' : ActorMethod<
    [[] | [[Principal, Principal]], bigint],
    ListPositionsResponse
  >,
  /**
   * List all profiles with cursor-based pagination
   */
  'list_profiles' : ActorMethod<
    [[] | [Principal], bigint],
    ListProfilesResponse
  >,
  /**
   *
   * * Called by pool contracts to notify that a fee claim failed
   *
   */
  'notify_fee_claim_rollback' : ActorMethod<[bigint], undefined>,
  /**
   *
   * * Called by pool contracts to notify events
   *
   */
  'notify_pool_events' : ActorMethod<[Array<PoolEvents>], Array<Result>>,
  'refresh_pool_transfer_fee' : ActorMethod<[Principal], Result_4>,
  'refund_stuck_liquidation' : ActorMethod<[bigint], Result_2>,
  'register_pool' : ActorMethod<[Pool], undefined>,
  /**
   * Create a new profile from a signed wallet address
   */
  'register_profile' : ActorMethod<[SignedRequest_2], Result_5>,
  'remove_admin' : ActorMethod<[Principal], undefined>,
  'remove_liquidator' : ActorMethod<[Principal], undefined>,
  'remove_pool' : ActorMethod<[Principal], Result_6>,
  /**
   * Remove a wallet from a profile (requires at least one remaining wallet)
   */
  'remove_wallet' : ActorMethod<[Principal, SignedRequest_3], Result>,
  /**
   * Scan for at-risk positions with cursor-based pagination
   */
  'scan_at_risk_positions' : ActorMethod<
    [[] | [Principal], bigint, bigint],
    ScanResult
  >,
  'set_base_rate' : ActorMethod<[Principal, bigint], undefined>,
  'set_optimal_utilization_rate' : ActorMethod<[Principal, bigint], undefined>,
  'set_pool_borrow_cap' : ActorMethod<[Principal, [] | [bigint]], undefined>,
  'set_pool_liquidation_bonus' : ActorMethod<[Principal, bigint], undefined>,
  'set_pool_liquidation_threshold' : ActorMethod<
    [Principal, bigint],
    undefined
  >,
  'set_pool_max_ltv' : ActorMethod<[Principal, bigint], undefined>,
  'set_pool_protocol_liquidation_fee' : ActorMethod<
    [Principal, bigint],
    undefined
  >,
  'set_pool_reserve_factor' : ActorMethod<[Principal, bigint], undefined>,
  'set_pool_supply_cap' : ActorMethod<[Principal, [] | [bigint]], undefined>,
  'set_protocol_fee_claim_receiver' : ActorMethod<[Principal], Result_7>,
  'set_rate_slope_after' : ActorMethod<[Principal, bigint], undefined>,
  'set_rate_slope_before' : ActorMethod<[Principal, bigint], undefined>,
  'set_same_asset_borrow_dust_threshold' : ActorMethod<
    [Principal, bigint],
    undefined
  >,
  'unfreeze_pool' : ActorMethod<[Principal], undefined>,
  /**
   * Withdraw supplied assets from a pool
   */
  'withdraw' : ActorMethod<[Principal, SignedRequest_4], Result_1>,
  /**
   * Withdraw funds stuck in pool subaccounts
   */
  'withdraw_stuck_pool_funds' : ActorMethod<
    [Principal, SignedRequest_4],
    Result_8
  >,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
