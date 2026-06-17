export const idlFactory = ({ IDL }) => {
  const Chains = IDL.Variant({
    'BTC' : IDL.Null,
    'ETH' : IDL.Null,
    'ICP' : IDL.Null,
    'SOL' : IDL.Null,
  });
  const WalletType = IDL.Variant({ 'Wallet' : Chains });
  const SignatureInfo = IDL.Record({
    'signature' : IDL.Text,
    'chain' : Chains,
    'account' : IDL.Text,
  });
  const SignatureScheme = IDL.Variant({ 'Wallet' : SignatureInfo });
  const AddAccountRequest = IDL.Record({
    'target_principal' : IDL.Principal,
    'chain' : WalletType,
    'wallet_signature' : SignatureScheme,
    'expiry_timestamp' : IDL.Nat64,
  });
  const SignedRequest = IDL.Record({
    'data' : AddAccountRequest,
    'signature_info' : SignatureScheme,
  });
  const SignatureVerificationError = IDL.Variant({
    'InvalidEthSignature' : IDL.Null,
    'UnsupportedChain' : IDL.Null,
    'InvalidSolSignature' : IDL.Null,
    'InvalidEthAddress' : IDL.Null,
    'CouldNotDecode' : IDL.Text,
    'ProfileNotFound' : IDL.Null,
    'InvalidBtcSignature' : IDL.Null,
  });
  const ProtocolError = IDL.Variant({
    'PositionNotFound' : IDL.Null,
    'Internal' : IDL.Text,
    'InvalidAddress' : IDL.Text,
    'InvalidTargetPrincipal' : IDL.Null,
    'SignatureError' : SignatureVerificationError,
    'SupplyCapExceeded' : IDL.Null,
    'AccountNotFound' : IDL.Null,
    'NotAllowed' : IDL.Text,
    'PoolNotFound' : IDL.Text,
    'FeeClaimReceiverNotConfigured' : IDL.Null,
    'InsufficientCollateral' : IDL.Null,
    'ProfileNotFound' : IDL.Null,
    'SignatureExpiryTooFarInFuture' : IDL.Null,
    'MaxLtvExceeded' : IDL.Null,
    'ProfileAlreadyExists' : IDL.Null,
    'LiquidationNotFound' : IDL.Text,
    'HealthFactorTooLow' : IDL.Null,
    'NoLiquidity' : IDL.Null,
    'SignatureExpired' : IDL.Null,
    'BorrowingDisabled' : IDL.Null,
    'BorrowCapExceeded' : IDL.Null,
    'PoolFrozen' : IDL.Null,
    'TransferFailed' : IDL.Text,
    'AccountAlreadyLinked' : IDL.Null,
    'CannotRemoveSoleAccount' : IDL.Null,
    'InsufficientFunds' : IDL.Null,
  });
  const Result = IDL.Variant({ 'Ok' : IDL.Null, 'Err' : ProtocolError });
  const IcrcAccount = IDL.Record({
    'owner' : IDL.Principal,
    'subaccount' : IDL.Opt(IDL.Vec(IDL.Nat8)),
  });
  const AccountType = IDL.Variant({
    'Icrc' : IcrcAccount,
    'Native' : IDL.Principal,
    'AccountIdentifier' : IDL.Text,
    'External' : IDL.Text,
  });
  const BorrowAssetRequest = IDL.Record({
    'expiry_timestamp' : IDL.Nat64,
    'account' : AccountType,
    'pool_id' : IDL.Principal,
    'amount' : IDL.Nat,
  });
  const SignedRequest_1 = IDL.Record({
    'data' : BorrowAssetRequest,
    'signature_info' : SignatureScheme,
  });
  const OutflowType = IDL.Variant({
    'Withdraw' : IDL.Null,
    'FeeClaim' : IDL.Null,
    'Borrow' : IDL.Null,
  });
  const OutflowDetails = IDL.Record({
    'id' : IDL.Text,
    'txid' : IDL.Opt(IDL.Text),
    'outflow_type' : OutflowType,
    'outflow_ref' : IDL.Opt(IDL.Text),
    'amount' : IDL.Nat,
    'receiver' : AccountType,
  });
  const Result_1 = IDL.Variant({
    'Ok' : OutflowDetails,
    'Err' : ProtocolError,
  });
  const ClaimFeeRequest = IDL.Record({ 'pool_id' : IDL.Principal });
  const AssetType = IDL.Variant({
    'CkAsset' : IDL.Principal,
    'Unknown' : IDL.Null,
  });
  const Assets = IDL.Variant({
    'BTC' : IDL.Null,
    'ICP' : IDL.Null,
    'SOL' : IDL.Null,
    'USDC' : IDL.Null,
    'USDT' : IDL.Null,
  });
  const LiquidatablePosition = IDL.Record({
    'collateral_amount' : IDL.Nat,
    'asset_type' : AssetType,
    'debt_amount' : IDL.Nat,
    'asset' : Assets,
    'account' : IDL.Principal,
    'pool_id' : IDL.Principal,
    'protocol_fee' : IDL.Nat64,
    'liquidation_bonus' : IDL.Nat64,
    'liquidation_threshold' : IDL.Nat64,
  });
  const LiquidatableUser = IDL.Record({
    'health_factor' : IDL.Nat,
    'total_debt' : IDL.Nat,
    'account' : IDL.Principal,
    'positions' : IDL.Vec(LiquidatablePosition),
    'weighted_liquidation_threshold' : IDL.Nat,
  });
  const RepaymentDetails = IDL.Record({
    'id' : IDL.Text,
    'txid' : IDL.Text,
    'account' : IDL.Principal,
    'timestamp' : IDL.Nat64,
    'amount' : IDL.Nat,
  });
  const Wallet = IDL.Record({ 'chain' : WalletType, 'address' : IDL.Text });
  const ProfileCreatedEvent = IDL.Record({
    'wallet' : Wallet,
    'profile' : IDL.Principal,
  });
  const InflowType = IDL.Variant({
    'Repayment' : IDL.Null,
    'Deposit' : IDL.Null,
  });
  const InflowDetails = IDL.Record({
    'id' : IDL.Text,
    'inflow_type' : InflowType,
    'txid' : IDL.Text,
    'timestamp' : IDL.Nat64,
    'amount' : IDL.Nat,
    'receiver' : IDL.Principal,
  });
  const LiqTxTarget = IDL.Variant({
    'Collateral' : IDL.Null,
    'Change' : IDL.Null,
  });
  const Pool = IDL.Record({
    'optimal_utilization_rate' : IDL.Nat,
    'principal' : IDL.Principal,
    'total_generated_interest_snapshot' : IDL.Nat,
    'asset_type' : AssetType,
    'supply_cap' : IDL.Opt(IDL.Nat),
    'same_asset_borrowing' : IDL.Opt(IDL.Bool),
    'asset' : Assets,
    'rate_slope_before' : IDL.Nat,
    'borrow_cap' : IDL.Opt(IDL.Nat),
    'total_debt_at_last_sync' : IDL.Nat,
    'supply_at_last_sync' : IDL.Nat,
    'chain' : Chains,
    'rate_slope_after' : IDL.Nat,
    'reserve_factor' : IDL.Nat64,
    'last_updated' : IDL.Opt(IDL.Nat64),
    'lending_index' : IDL.Nat,
    'protocol_liquidation_fee' : IDL.Nat64,
    'treasury_supply_scaled' : IDL.Nat,
    'same_asset_borrowing_dust_threshold' : IDL.Nat,
    'borrow_index' : IDL.Nat,
    'base_rate' : IDL.Nat,
    'frozen' : IDL.Bool,
    'liquidation_bonus' : IDL.Nat64,
    'liquidation_threshold' : IDL.Nat64,
    'max_ltv' : IDL.Nat64,
    'repay_grace_period' : IDL.Opt(IDL.Nat64),
    'pending_service_fees' : IDL.Nat,
    'total_supply_at_last_sync' : IDL.Nat,
  });
  const LiquidationStatus = IDL.Variant({
    'CollateralTransferFailed' : IDL.Text,
    'FailedLiquidation' : IDL.Text,
    'InflowProcessed' : IDL.Null,
    'Success' : IDL.Null,
    'CoreExecuted' : IDL.Null,
    'ChangeTransferFailed' : IDL.Text,
    'Pending' : IDL.Null,
  });
  const TransferStatus = IDL.Variant({
    'Failed' : IDL.Text,
    'Success' : IDL.Null,
    'Pending' : IDL.Null,
  });
  const TxStatus = IDL.Record({
    'status' : TransferStatus,
    'tx_id' : IDL.Opt(IDL.Text),
  });
  const LiquidationAmounts = IDL.Record({
    'debt_repaid' : IDL.Nat,
    'collateral_received' : IDL.Nat,
  });
  const LiquidationResult = IDL.Record({
    'id' : IDL.Nat,
    'status' : LiquidationStatus,
    'change_tx' : TxStatus,
    'debt_asset' : AssetType,
    'amounts' : LiquidationAmounts,
    'collateral_asset' : AssetType,
    'timestamp' : IDL.Nat64,
    'collateral_tx' : TxStatus,
  });
  const LiquidationRequest = IDL.Record({
    'debt_amount' : IDL.Nat,
    'receiver_address' : IDL.Principal,
    'collateral_pool_id' : IDL.Principal,
    'borrower' : IDL.Principal,
    'debt_pool_id' : IDL.Principal,
    'buy_bad_debt' : IDL.Bool,
  });
  const ProtocolEventType = IDL.Variant({
    'RepaymentRejected' : IDL.Record({
      'pool' : IDL.Principal,
      'error' : ProtocolError,
      'details' : RepaymentDetails,
    }),
    'AccountCreated' : ProfileCreatedEvent,
    'DepositConfirmed' : IDL.Record({
      'pool' : IDL.Principal,
      'details' : InflowDetails,
    }),
    'DepositRejected' : IDL.Record({
      'pool' : IDL.Principal,
      'error' : ProtocolError,
      'details' : InflowDetails,
    }),
    'AccountAdded' : Wallet,
    'BorrowStateUpdated' : IDL.Bool,
    'LiquidationUnderlyingWithdrawal' : IDL.Record({
      'txid' : IDL.Text,
      'target' : LiqTxTarget,
      'liquidation_id' : IDL.Nat,
      'account' : IDL.Text,
      'pool_id' : IDL.Text,
      'amount' : IDL.Nat,
    }),
    'PoolUpdated' : Pool,
    'RepaymentConfirmed' : IDL.Record({
      'pool' : IDL.Principal,
      'details' : RepaymentDetails,
    }),
    'LiquidationExecuted' : IDL.Record({
      'result' : LiquidationResult,
      'request' : LiquidationRequest,
    }),
    'WithdrawalConfirmed' : IDL.Record({
      'pool' : IDL.Principal,
      'details' : OutflowDetails,
    }),
    'BorrowConfirmed' : IDL.Record({
      'pool' : IDL.Principal,
      'details' : OutflowDetails,
    }),
    'PoolRegistered' : Pool,
    'AccountRemoved' : Wallet,
    'PoolRemoved' : IDL.Principal,
  });
  const ProtocolEvent = IDL.Record({
    'id' : IDL.Nat,
    'user' : IDL.Principal,
    'timestamp' : IDL.Nat64,
    'event_type' : ProtocolEventType,
  });
  const BorrowingPower = IDL.Record({
    'max_borrowable_usd' : IDL.Nat,
    'weighted_max_ltv' : IDL.Nat,
  });
  const Position = IDL.Record({
    'asset' : Assets,
    'total_debt_interest' : IDL.Nat,
    'borrow_index_snapshot' : IDL.Nat,
    'lending_index_snapshot' : IDL.Nat,
    'debt_scaled' : IDL.Nat,
    'total_earned_interest' : IDL.Nat,
    'deposit_scaled' : IDL.Nat,
    'pool_id' : IDL.Principal,
    'unpaid_debt_interest' : IDL.Nat,
    'last_update' : IDL.Nat64,
    'user_profile' : IDL.Principal,
  });
  const UserStats = IDL.Record({
    'debt' : IDL.Nat,
    'collateral' : IDL.Nat,
    'acumulated_interest' : IDL.Nat,
    'borrowing_power' : BorrowingPower,
    'positions' : IDL.Vec(Position),
    'weighted_liquidation_threshold' : IDL.Nat,
  });
  const Result_2 = IDL.Variant({
    'Ok' : LiquidationResult,
    'Err' : ProtocolError,
  });
  const PositionView = IDL.Record({
    'lending_index_now' : IDL.Nat,
    'interest_since_snapshot' : IDL.Nat,
    'asset' : Assets,
    'total_debt_interest' : IDL.Nat,
    'borrow_index_snapshot' : IDL.Nat,
    'debt_native_now' : IDL.Nat,
    'borrow_index_now' : IDL.Nat,
    'lending_index_snapshot' : IDL.Nat,
    'debt_scaled' : IDL.Nat,
    'total_earned_interest' : IDL.Nat,
    'deposit_scaled' : IDL.Nat,
    'earned_since_snapshot' : IDL.Nat,
    'deposited_native_now' : IDL.Nat,
    'pool_id' : IDL.Principal,
    'last_update' : IDL.Nat64,
    'user_profile' : IDL.Principal,
  });
  const Result_3 = IDL.Variant({
    'Ok' : IDL.Tuple(IDL.Nat, IDL.Nat32),
    'Err' : IDL.Text,
  });
  const ListPositionsResponse = IDL.Record({
    'total' : IDL.Nat64,
    'next_cursor' : IDL.Opt(IDL.Tuple(IDL.Principal, IDL.Principal)),
    'positions' : IDL.Vec(PositionView),
  });
  const ListProfilesResponse = IDL.Record({
    'total' : IDL.Nat64,
    'next_cursor' : IDL.Opt(IDL.Principal),
    'profiles' : IDL.Vec(
      IDL.Tuple(IDL.Principal, IDL.Tuple(IDL.Nat, UserStats))
    ),
  });
  const PoolEvents = IDL.Variant({
    'DepositConfirmed' : InflowDetails,
    'RepaymentConfirmed' : RepaymentDetails,
  });
  const Result_4 = IDL.Variant({
    'Ok' : IDL.Opt(IDL.Nat),
    'Err' : ProtocolError,
  });
  const InitializeAccountRequest = IDL.Record({
    'expiry_timestamp' : IDL.Nat64,
  });
  const SignedRequest_2 = IDL.Record({
    'data' : InitializeAccountRequest,
    'signature_info' : SignatureScheme,
  });
  const Result_5 = IDL.Variant({ 'Ok' : IDL.Principal, 'Err' : ProtocolError });
  const Result_6 = IDL.Variant({ 'Ok' : IDL.Null, 'Err' : IDL.Text });
  const RemoveAccountRequest = IDL.Record({
    'wallet_address' : IDL.Text,
    'expiry_timestamp' : IDL.Nat64,
  });
  const SignedRequest_3 = IDL.Record({
    'data' : RemoveAccountRequest,
    'signature_info' : SignatureScheme,
  });
  const ScanResult = IDL.Record({
    'scanned' : IDL.Nat64,
    'users' : IDL.Vec(LiquidatableUser),
    'next_cursor' : IDL.Opt(IDL.Principal),
  });
  const Result_7 = IDL.Variant({ 'Ok' : IDL.Null, 'Err' : IDL.Text });
  const WithdrawRequest = IDL.Record({
    'expiry_timestamp' : IDL.Nat64,
    'account' : AccountType,
    'pool_id' : IDL.Principal,
    'amount' : IDL.Nat,
  });
  const SignedRequest_4 = IDL.Record({
    'data' : WithdrawRequest,
    'signature_info' : SignatureScheme,
  });
  const Result_8 = IDL.Variant({ 'Ok' : IDL.Nat, 'Err' : ProtocolError });
  return IDL.Service({
    'add_admin' : IDL.Func([IDL.Principal], [], []),
    'add_liquidator' : IDL.Func([IDL.Principal], [], []),
    'add_wallet' : IDL.Func([IDL.Principal, SignedRequest], [Result], []),
    'borrow_assets' : IDL.Func(
        [IDL.Principal, SignedRequest_1],
        [Result_1],
        [],
      ),
    'claim_fee' : IDL.Func([ClaimFeeRequest], [Result_1], []),
    'disable_borrowing' : IDL.Func([], [], []),
    'disable_same_asset_borrowing' : IDL.Func([IDL.Principal], [], []),
    'enable_borrowing' : IDL.Func([], [], []),
    'enable_same_asset_borrowing' : IDL.Func([IDL.Principal], [], []),
    'freeze_pool' : IDL.Func([IDL.Principal], [], []),
    'get_admins' : IDL.Func([], [IDL.Vec(IDL.Principal)], ['query']),
    'get_at_risk_positions' : IDL.Func(
        [IDL.Nat64, IDL.Nat64],
        [IDL.Vec(LiquidatableUser)],
        ['query'],
      ),
    'get_borrowing_disabled' : IDL.Func([], [IDL.Bool], ['query']),
    'get_event' : IDL.Func([IDL.Nat], [IDL.Opt(ProtocolEvent)], ['query']),
    'get_health_factor' : IDL.Func(
        [IDL.Principal],
        [IDL.Nat, UserStats],
        ['query'],
      ),
    'get_liquidation' : IDL.Func([IDL.Nat], [Result_2], ['query']),
    'get_liquidators' : IDL.Func([], [IDL.Vec(IDL.Principal)], ['query']),
    'get_nonce' : IDL.Func([IDL.Text], [IDL.Nat], ['query']),
    'get_pool' : IDL.Func([IDL.Principal], [IDL.Opt(Pool)], ['query']),
    'get_pool_rate' : IDL.Func(
        [IDL.Principal],
        [IDL.Opt(IDL.Tuple(IDL.Nat, IDL.Nat, IDL.Nat))],
        ['query'],
      ),
    'get_position' : IDL.Func(
        [IDL.Principal, IDL.Principal],
        [IDL.Opt(PositionView)],
        ['query'],
      ),
    'get_price' : IDL.Func([IDL.Text, IDL.Text], [Result_3], ['query']),
    'get_prices' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Text, IDL.Nat, IDL.Nat32))],
        ['query'],
      ),
    'get_profile_stats' : IDL.Func([IDL.Principal], [UserStats], ['query']),
    'get_profile_wallets' : IDL.Func(
        [IDL.Principal],
        [IDL.Vec(Wallet)],
        ['query'],
      ),
    'get_protocol_fee_claim_receiver' : IDL.Func(
        [],
        [IDL.Opt(IDL.Principal)],
        ['query'],
      ),
    'get_wallet_profile' : IDL.Func(
        [IDL.Text],
        [IDL.Opt(IDL.Principal)],
        ['query'],
      ),
    'liquidate' : IDL.Func([LiquidationRequest], [Result_2], []),
    'list_events' : IDL.Func(
        [IDL.Nat, IDL.Nat64],
        [IDL.Vec(IDL.Tuple(IDL.Nat, ProtocolEvent))],
        ['query'],
      ),
    'list_pools' : IDL.Func([], [IDL.Vec(Pool)], ['query']),
    'list_positions' : IDL.Func(
        [IDL.Opt(IDL.Tuple(IDL.Principal, IDL.Principal)), IDL.Nat64],
        [ListPositionsResponse],
        ['query'],
      ),
    'list_profiles' : IDL.Func(
        [IDL.Opt(IDL.Principal), IDL.Nat64],
        [ListProfilesResponse],
        ['query'],
      ),
    'notify_fee_claim_rollback' : IDL.Func([IDL.Nat], [], []),
    'notify_pool_events' : IDL.Func(
        [IDL.Vec(PoolEvents)],
        [IDL.Vec(Result)],
        [],
      ),
    'refresh_pool_transfer_fee' : IDL.Func([IDL.Principal], [Result_4], []),
    'refund_stuck_liquidation' : IDL.Func([IDL.Nat], [Result_2], []),
    'register_pool' : IDL.Func([Pool], [], []),
    'register_profile' : IDL.Func([SignedRequest_2], [Result_5], []),
    'remove_admin' : IDL.Func([IDL.Principal], [], []),
    'remove_liquidator' : IDL.Func([IDL.Principal], [], []),
    'remove_pool' : IDL.Func([IDL.Principal], [Result_6], []),
    'remove_wallet' : IDL.Func([IDL.Principal, SignedRequest_3], [Result], []),
    'scan_at_risk_positions' : IDL.Func(
        [IDL.Opt(IDL.Principal), IDL.Nat64, IDL.Nat64],
        [ScanResult],
        ['query'],
      ),
    'set_base_rate' : IDL.Func([IDL.Principal, IDL.Nat], [], []),
    'set_optimal_utilization_rate' : IDL.Func([IDL.Principal, IDL.Nat], [], []),
    'set_pool_borrow_cap' : IDL.Func([IDL.Principal, IDL.Opt(IDL.Nat)], [], []),
    'set_pool_liquidation_bonus' : IDL.Func([IDL.Principal, IDL.Nat64], [], []),
    'set_pool_liquidation_threshold' : IDL.Func(
        [IDL.Principal, IDL.Nat64],
        [],
        [],
      ),
    'set_pool_max_ltv' : IDL.Func([IDL.Principal, IDL.Nat64], [], []),
    'set_pool_protocol_liquidation_fee' : IDL.Func(
        [IDL.Principal, IDL.Nat64],
        [],
        [],
      ),
    'set_pool_reserve_factor' : IDL.Func([IDL.Principal, IDL.Nat64], [], []),
    'set_pool_supply_cap' : IDL.Func([IDL.Principal, IDL.Opt(IDL.Nat)], [], []),
    'set_protocol_fee_claim_receiver' : IDL.Func(
        [IDL.Principal],
        [Result_7],
        [],
      ),
    'set_rate_slope_after' : IDL.Func([IDL.Principal, IDL.Nat], [], []),
    'set_rate_slope_before' : IDL.Func([IDL.Principal, IDL.Nat], [], []),
    'set_same_asset_borrow_dust_threshold' : IDL.Func(
        [IDL.Principal, IDL.Nat],
        [],
        [],
      ),
    'unfreeze_pool' : IDL.Func([IDL.Principal], [], []),
    'withdraw' : IDL.Func([IDL.Principal, SignedRequest_4], [Result_1], []),
    'withdraw_stuck_pool_funds' : IDL.Func(
        [IDL.Principal, SignedRequest_4],
        [Result_8],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return [IDL.Opt(IDL.Text)]; };
