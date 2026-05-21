export const idlFactory = ({ IDL }) => {
  const DepositAccountErrors = IDL.Variant({
    'Busy' : IDL.Null,
    'NotFound' : IDL.Null,
    'Other' : IDL.Text,
    'Cooldown' : IDL.Record({ 'retry_after_secs' : IDL.Nat64 }),
    'AddressDerivationFailed' : IDL.Null,
    'InvalidEvmAddress' : IDL.Null,
  });
  const Result = IDL.Variant({ 'Ok' : IDL.Nat, 'Err' : DepositAccountErrors });
  const DepositStatus = IDL.Variant({
    'Failed' : IDL.Text,
    'Success' : IDL.Null,
    'Pending' : IDL.Null,
  });
  const DepositAssetType = IDL.Variant({
    'Native' : IDL.Null,
    'ERC20' : IDL.Text,
  });
  const Account = IDL.Record({
    'owner' : IDL.Principal,
    'subaccount' : IDL.Opt(IDL.Vec(IDL.Nat8)),
  });
  const Deposit = IDL.Record({
    'status' : DepositStatus,
    'asset_type' : DepositAssetType,
    'account' : Account,
    'timestamp' : IDL.Nat64,
    'amount' : IDL.Nat,
  });
  const Result_1 = IDL.Variant({
    'Ok' : IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text, Deposit)),
    'Err' : DepositAccountErrors,
  });
  const Result_2 = IDL.Variant({
    'Ok' : IDL.Text,
    'Err' : DepositAccountErrors,
  });
  const QueueJobStatus = IDL.Variant({
    'Queued' : IDL.Null,
    'Failed' : IDL.Null,
    'NoOp' : IDL.Null,
    'Ready' : IDL.Null,
    'RetryScheduled' : IDL.Null,
    'Succeeded' : IDL.Null,
    'Cancelled' : IDL.Null,
    'Processing' : IDL.Null,
    'Broadcasted' : IDL.Null,
  });
  const QueueRecoveryContext = IDL.Variant({
    'FundingPending' : IDL.Record({
      'funding_tx_hash' : IDL.Text,
      'native_amount_wei' : IDL.Opt(IDL.Nat),
    }),
    'ReadyNativeAmount' : IDL.Record({ 'native_amount_wei' : IDL.Nat }),
  });
  const QueueJob = IDL.Record({
    'id' : IDL.Nat64,
    'last_error' : IDL.Opt(IDL.Text),
    'status' : QueueJobStatus,
    'updated_at' : IDL.Nat64,
    'asset_type' : DepositAssetType,
    'next_attempt_at' : IDL.Nat64,
    'token_address' : IDL.Opt(IDL.Text),
    'attempts' : IDL.Nat32,
    'created_at' : IDL.Nat64,
    'address' : IDL.Text,
    'account' : Account,
    'tx_hash' : IDL.Opt(IDL.Text),
    'recovery_context' : IDL.Opt(QueueRecoveryContext),
  });
  const BroadcastSuccessEvent = IDL.Record({
    'broadcast_key' : IDL.Text,
    'asset_type' : DepositAssetType,
    'address' : IDL.Text,
    'account' : Account,
    'timestamp' : IDL.Nat64,
    'queue_job_id' : IDL.Nat64,
    'tx_hash' : IDL.Text,
    'amount' : IDL.Nat,
  });
  const BroadcastConfirmedEvent = IDL.Record({
    'broadcast_key' : IDL.Text,
    'timestamp' : IDL.Nat64,
    'queue_job_id' : IDL.Opt(IDL.Nat64),
    'tx_hash' : IDL.Text,
  });
  const DustCleanupScheduledEvent = IDL.Record({
    'address' : IDL.Text,
    'timestamp' : IDL.Nat64,
    'queue_job_id' : IDL.Nat64,
  });
  const DustCleanupFailedEvent = IDL.Record({
    'attempts' : IDL.Nat8,
    'address' : IDL.Text,
    'timestamp' : IDL.Nat64,
    'reason' : IDL.Text,
  });
  const BroadcastRejectedEvent = IDL.Record({
    'broadcast_key' : IDL.Text,
    'timestamp' : IDL.Nat64,
    'queue_job_id' : IDL.Opt(IDL.Nat64),
    'tx_hash' : IDL.Text,
    'reason' : IDL.Text,
  });
  const BalanceDetectedEvent = IDL.Record({
    'asset_type' : DepositAssetType,
    'address' : IDL.Text,
    'account' : Account,
    'timestamp' : IDL.Nat64,
    'queue_job_id' : IDL.Nat64,
    'amount' : IDL.Nat,
  });
  const AssetRegisteredEvent = IDL.Record({
    'decimals' : IDL.Nat32,
    'asset_address' : IDL.Text,
    'updated_existing' : IDL.Bool,
    'timestamp' : IDL.Nat64,
    'caller' : IDL.Principal,
    'symbol' : IDL.Text,
  });
  const QueueJobFailedEvent = IDL.Record({
    'asset_type' : DepositAssetType,
    'attempts' : IDL.Nat32,
    'address' : IDL.Text,
    'account' : Account,
    'timestamp' : IDL.Nat64,
    'queue_job_id' : IDL.Nat64,
    'reason' : IDL.Text,
  });
  const DepositAccountEvent = IDL.Variant({
    'BroadcastSuccess' : BroadcastSuccessEvent,
    'BroadcastConfirmed' : BroadcastConfirmedEvent,
    'DustCleanupScheduled' : DustCleanupScheduledEvent,
    'DustCleanupFailed' : DustCleanupFailedEvent,
    'BroadcastRejected' : BroadcastRejectedEvent,
    'BalanceDetected' : BalanceDetectedEvent,
    'AssetRegistered' : AssetRegisteredEvent,
    'QueueJobFailed' : QueueJobFailedEvent,
  });
  const AddressBinding = IDL.Record({
    'token_address' : IDL.Opt(IDL.Text),
    'account' : Account,
  });
  const Result_3 = IDL.Variant({
    'Ok' : AddressBinding,
    'Err' : DepositAccountErrors,
  });
  const Result_4 = IDL.Variant({
    'Ok' : IDL.Null,
    'Err' : DepositAccountErrors,
  });
  const Result_5 = IDL.Variant({
    'Ok' : IDL.Nat64,
    'Err' : DepositAccountErrors,
  });
  const Result_6 = IDL.Variant({
    'Ok' : IDL.Nat,
    'Err' : DepositAccountErrors,
  });
  return IDL.Service({
    'estimate_deposit_fee' : IDL.Func([IDL.Opt(IDL.Text)], [Result], ['query']),
    'get_broadcasted_txs' : IDL.Func([], [Result_1], ['query']),
    'get_deposit_address' : IDL.Func(
        [Account, IDL.Opt(IDL.Text)],
        [Result_2],
        ['query'],
      ),
    'get_funding_wallet_address' : IDL.Func([], [Result_2], ['query']),
    'get_or_create_deposit_address' : IDL.Func(
        [Account, IDL.Opt(IDL.Text)],
        [Result_2],
        [],
      ),
    'get_queue_job' : IDL.Func([IDL.Nat64], [IDL.Opt(QueueJob)], ['query']),
    'get_queued_event' : IDL.Func(
        [IDL.Nat],
        [IDL.Opt(DepositAccountEvent)],
        ['query'],
      ),
    'get_queued_events' : IDL.Func(
        [IDL.Nat64, IDL.Nat64],
        [IDL.Vec(IDL.Tuple(IDL.Nat, DepositAccountEvent))],
        ['query'],
      ),
    'get_supported_assets' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text, IDL.Nat32))],
        ['query'],
      ),
    'get_user_by_address' : IDL.Func([IDL.Text], [Result_3], ['query']),
    'list_queue_jobs' : IDL.Func(
        [IDL.Nat64, IDL.Nat32],
        [IDL.Vec(QueueJob)],
        ['query'],
      ),
    'register_asset' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Nat32],
        [Result_4],
        [],
      ),
    'set_proxy_contract_address_override' : IDL.Func(
        [IDL.Text],
        [Result_4],
        [],
      ),
    'sync_address_nonce' : IDL.Func([IDL.Text], [Result_5], []),
    'update_address' : IDL.Func([IDL.Text], [Result_6], []),
  });
};
export const init = ({ IDL }) => { return []; };
