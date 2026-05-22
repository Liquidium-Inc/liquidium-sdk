import type { Principal } from '@icp-sdk/core/principal';
import type { ActorMethod } from '@icp-sdk/core/agent';
import type { IDL } from '@icp-sdk/core/candid';

export interface Account {
  'owner' : Principal,
  'subaccount' : [] | [Uint8Array | number[]],
}
export interface AddressBinding {
  'token_address' : [] | [string],
  'account' : Account,
}
export interface AssetRegisteredEvent {
  'decimals' : number,
  'asset_address' : string,
  'updated_existing' : boolean,
  'timestamp' : bigint,
  'caller' : Principal,
  'symbol' : string,
}
export interface BalanceDetectedEvent {
  'asset_type' : DepositAssetType,
  'address' : string,
  'account' : Account,
  'timestamp' : bigint,
  'queue_job_id' : bigint,
  'amount' : bigint,
}
export interface BroadcastConfirmedEvent {
  'broadcast_key' : string,
  'timestamp' : bigint,
  'queue_job_id' : [] | [bigint],
  'tx_hash' : string,
}
export interface BroadcastRejectedEvent {
  'broadcast_key' : string,
  'timestamp' : bigint,
  'queue_job_id' : [] | [bigint],
  'tx_hash' : string,
  'reason' : string,
}
export interface BroadcastSuccessEvent {
  'broadcast_key' : string,
  'asset_type' : DepositAssetType,
  'address' : string,
  'account' : Account,
  'timestamp' : bigint,
  'queue_job_id' : bigint,
  'tx_hash' : string,
  'amount' : bigint,
}
export interface Deposit {
  'status' : DepositStatus,
  'asset_type' : DepositAssetType,
  'account' : Account,
  'timestamp' : bigint,
  'amount' : bigint,
}
export type DepositAccountErrors = { 'Busy' : null } |
  { 'NotFound' : null } |
  { 'Other' : string } |
  { 'Cooldown' : { 'retry_after_secs' : bigint } } |
  { 'AddressDerivationFailed' : null } |
  { 'InvalidEvmAddress' : null };
export type DepositAccountEvent = {
    'BroadcastSuccess' : BroadcastSuccessEvent
  } |
  { 'BroadcastConfirmed' : BroadcastConfirmedEvent } |
  { 'DustCleanupScheduled' : DustCleanupScheduledEvent } |
  { 'DustCleanupFailed' : DustCleanupFailedEvent } |
  { 'BroadcastRejected' : BroadcastRejectedEvent } |
  { 'BalanceDetected' : BalanceDetectedEvent } |
  { 'AssetRegistered' : AssetRegisteredEvent } |
  { 'QueueJobFailed' : QueueJobFailedEvent };
export type DepositAssetType = { 'Native' : null } |
  { 'ERC20' : string };
export type DepositStatus = { 'Failed' : string } |
  { 'Success' : null } |
  { 'Pending' : null };
export interface DustCleanupFailedEvent {
  'attempts' : number,
  'address' : string,
  'timestamp' : bigint,
  'reason' : string,
}
export interface DustCleanupScheduledEvent {
  'address' : string,
  'timestamp' : bigint,
  'queue_job_id' : bigint,
}
export interface QueueJob {
  'id' : bigint,
  'last_error' : [] | [string],
  'status' : QueueJobStatus,
  'updated_at' : bigint,
  'asset_type' : DepositAssetType,
  'next_attempt_at' : bigint,
  'token_address' : [] | [string],
  'attempts' : number,
  'created_at' : bigint,
  'address' : string,
  'account' : Account,
  'tx_hash' : [] | [string],
  'recovery_context' : [] | [QueueRecoveryContext],
}
export interface QueueJobFailedEvent {
  'asset_type' : DepositAssetType,
  'attempts' : number,
  'address' : string,
  'account' : Account,
  'timestamp' : bigint,
  'queue_job_id' : bigint,
  'reason' : string,
}
export type QueueJobStatus = { 'Queued' : null } |
  { 'Failed' : null } |
  { 'NoOp' : null } |
  { 'Ready' : null } |
  { 'RetryScheduled' : null } |
  { 'Succeeded' : null } |
  { 'Cancelled' : null } |
  { 'Processing' : null } |
  { 'Broadcasted' : null };
export type QueueRecoveryContext = {
    'FundingPending' : {
      'funding_tx_hash' : string,
      'native_amount_wei' : [] | [bigint],
    }
  } |
  { 'ReadyNativeAmount' : { 'native_amount_wei' : bigint } };
export type Result = { 'Ok' : bigint } |
  { 'Err' : DepositAccountErrors };
export type Result_1 = { 'Ok' : Array<[string, string, Deposit]> } |
  { 'Err' : DepositAccountErrors };
export type Result_2 = { 'Ok' : string } |
  { 'Err' : DepositAccountErrors };
export type Result_3 = { 'Ok' : AddressBinding } |
  { 'Err' : DepositAccountErrors };
export type Result_4 = { 'Ok' : null } |
  { 'Err' : DepositAccountErrors };
export type Result_5 = { 'Ok' : bigint } |
  { 'Err' : DepositAccountErrors };
export type Result_6 = { 'Ok' : bigint } |
  { 'Err' : DepositAccountErrors };
export interface _SERVICE {
  'estimate_deposit_fee' : ActorMethod<[[] | [string]], Result>,
  'get_broadcasted_txs' : ActorMethod<[], Result_1>,
  'get_deposit_address' : ActorMethod<[Account, [] | [string]], Result_2>,
  'get_funding_wallet_address' : ActorMethod<[], Result_2>,
  'get_or_create_deposit_address' : ActorMethod<
    [Account, [] | [string]],
    Result_2
  >,
  'get_queue_job' : ActorMethod<[bigint], [] | [QueueJob]>,
  'get_queued_event' : ActorMethod<[bigint], [] | [DepositAccountEvent]>,
  'get_queued_events' : ActorMethod<
    [bigint, bigint],
    Array<[bigint, DepositAccountEvent]>
  >,
  'get_supported_assets' : ActorMethod<[], Array<[string, string, number]>>,
  'get_user_by_address' : ActorMethod<[string], Result_3>,
  'list_queue_jobs' : ActorMethod<[bigint, number], Array<QueueJob>>,
  'register_asset' : ActorMethod<[string, string, number], Result_4>,
  'set_proxy_contract_address_override' : ActorMethod<[string], Result_4>,
  'sync_address_nonce' : ActorMethod<[string], Result_5>,
  'update_address' : ActorMethod<[string], Result_6>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
