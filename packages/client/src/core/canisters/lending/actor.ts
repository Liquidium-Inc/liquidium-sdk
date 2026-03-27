import { Actor } from "@dfinity/agent";
import type { IDL } from "@dfinity/candid";
import { LiquidiumError, LiquidiumErrorCode } from "../../errors";
import type { CanisterContext } from "../../transports/canister-context";

export type AssetVariant =
  | { BTC: null }
  | { USDT: null }
  | { USDC: null }
  | { SOL: null };

export type ChainVariant = { BTC: null } | { ETH: null } | { SOL: null };

export type SignatureInfoVariant = {
  signature: string;
  chain: { BTC: null } | { ETH: null };
  account: string;
};

export type SignatureVerificationError =
  | { InvalidEthSignature: null }
  | { UnsupportedChain: null }
  | { InvalidEthAddress: null }
  | { CouldNotDecode: string }
  | { ProfileNotFound: null }
  | { InvalidBtcSignature: null };

export type ProtocolError =
  | { PositionNotFound: null }
  | { Internal: string }
  | { InvalidAddress: string }
  | { InvalidTargetPrincipal: null }
  | { SignatureError: SignatureVerificationError }
  | { SupplyCapExceeded: null }
  | { AccountNotFound: null }
  | { NotAllowed: string }
  | { PoolNotFound: string }
  | { FeeClaimReceiverNotConfigured: null }
  | { InsufficientCollateral: null }
  | { ProfileNotFound: null }
  | { SignatureExpiryTooFarInFuture: null }
  | { MaxLtvExceeded: null }
  | { ProfileAlreadyExists: null }
  | { LiquidationNotFound: string }
  | { HealthFactorTooLow: null }
  | { NoLiquidity: null }
  | { SignatureExpired: null }
  | { BorrowingDisabled: null }
  | { BorrowCapExceeded: null }
  | { PoolFrozen: null }
  | { TransferFailed: string }
  | { AccountAlreadyLinked: null }
  | { CannotRemoveSoleAccount: null }
  | { InsufficientFunds: null };

export interface RegisterProfileRequest {
  data: {
    expiry_timestamp: bigint;
  };
  signature_info: {
    Wallet: SignatureInfoVariant;
  };
}

export type RegisterProfileResult =
  | { Ok: { toText(): string } }
  | { Err: ProtocolError };

export type LendingPoolRecord = {
  optimal_utilization_rate: bigint;
  principal: { toText(): string; toString(): string };
  total_generated_interest_snapshot: bigint;
  supply_cap: [] | [bigint];
  same_asset_borrowing: [] | [boolean];
  asset: AssetVariant;
  rate_slope_before: bigint;
  borrow_cap: [] | [bigint];
  total_debt_at_last_sync: bigint;
  chain: ChainVariant;
  rate_slope_after: bigint;
  reserve_factor: bigint;
  last_updated: [] | [bigint];
  lending_index: bigint;
  protocol_liquidation_fee: bigint;
  borrow_index: bigint;
  base_rate: bigint;
  frozen: boolean;
  liquidation_bonus: bigint;
  liquidation_threshold: bigint;
  max_ltv: bigint;
  total_supply_at_last_sync: bigint;
};

export type PoolRateTuple = [bigint, bigint, bigint];
export type PriceRecord = [string, bigint, number];

export interface LendingActor {
  get_nonce(walletAddress: string): Promise<bigint>;
  get_wallet_profile(
    walletAddress: string
  ): Promise<[] | [{ toText(): string }]>;
  register_profile(
    request: RegisterProfileRequest
  ): Promise<RegisterProfileResult>;
  list_pools(): Promise<LendingPoolRecord[]>;
  get_pool_rate(
    principal: LendingPoolRecord["principal"]
  ): Promise<[] | [PoolRateTuple]>;
  get_prices(): Promise<PriceRecord[]>;
}

const lendingIdlFactory: IDL.InterfaceFactory = ({ IDL }) => {
  const AccountChains = IDL.Variant({ BTC: IDL.Null, ETH: IDL.Null });
  const SignatureInfo = IDL.Record({
    signature: IDL.Text,
    chain: AccountChains,
    account: IDL.Text,
  });
  const SignatureScheme = IDL.Variant({ Wallet: SignatureInfo });
  const InitializeAccountRequest = IDL.Record({ expiry_timestamp: IDL.Nat64 });
  const SignedInitializeAccountRequest = IDL.Record({
    data: InitializeAccountRequest,
    signature_info: SignatureScheme,
  });
  const SignatureVerificationError = IDL.Variant({
    InvalidEthSignature: IDL.Null,
    UnsupportedChain: IDL.Null,
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
  const RegisterProfileResult = IDL.Variant({
    Ok: IDL.Principal,
    Err: ProtocolError,
  });
  const Assets = IDL.Variant({
    BTC: IDL.Null,
    SOL: IDL.Null,
    USDC: IDL.Null,
    USDT: IDL.Null,
  });
  const Chains = IDL.Variant({
    BTC: IDL.Null,
    ETH: IDL.Null,
    SOL: IDL.Null,
  });
  const Pool = IDL.Record({
    optimal_utilization_rate: IDL.Nat,
    principal: IDL.Principal,
    total_generated_interest_snapshot: IDL.Nat,
    asset_type: IDL.Variant({ CkAsset: IDL.Principal, Unknown: IDL.Null }),
    supply_cap: IDL.Opt(IDL.Nat),
    same_asset_borrowing: IDL.Opt(IDL.Bool),
    asset: Assets,
    rate_slope_before: IDL.Nat,
    borrow_cap: IDL.Opt(IDL.Nat),
    total_debt_at_last_sync: IDL.Nat,
    supply_at_last_sync: IDL.Nat,
    chain: Chains,
    rate_slope_after: IDL.Nat,
    reserve_factor: IDL.Nat64,
    last_updated: IDL.Opt(IDL.Nat64),
    lending_index: IDL.Nat,
    protocol_liquidation_fee: IDL.Nat64,
    treasury_supply_scaled: IDL.Nat,
    same_asset_borrowing_dust_threshold: IDL.Nat,
    borrow_index: IDL.Nat,
    base_rate: IDL.Nat,
    frozen: IDL.Bool,
    liquidation_bonus: IDL.Nat64,
    liquidation_threshold: IDL.Nat64,
    max_ltv: IDL.Nat64,
    repay_grace_period: IDL.Opt(IDL.Nat64),
    pending_service_fees: IDL.Nat,
    total_supply_at_last_sync: IDL.Nat,
  });

  return IDL.Service({
    get_nonce: IDL.Func([IDL.Text], [IDL.Nat], ["query"]),
    get_wallet_profile: IDL.Func(
      [IDL.Text],
      [IDL.Opt(IDL.Principal)],
      ["query"]
    ),
    register_profile: IDL.Func(
      [SignedInitializeAccountRequest],
      [RegisterProfileResult],
      []
    ),
    list_pools: IDL.Func([], [IDL.Vec(Pool)], ["query"]),
    get_pool_rate: IDL.Func(
      [IDL.Principal],
      [IDL.Opt(IDL.Tuple(IDL.Nat, IDL.Nat, IDL.Nat))],
      ["query"]
    ),
    get_prices: IDL.Func(
      [],
      [IDL.Vec(IDL.Tuple(IDL.Text, IDL.Nat, IDL.Nat32))],
      ["query"]
    ),
  });
};

export function createLendingActor(canisterContext: CanisterContext): LendingActor {
  const canisterId = canisterContext.canisterIds.lending;

  if (!canisterId) {
    throw new LiquidiumError(
      LiquidiumErrorCode.SERVICE_UNAVAILABLE,
      "Lending canister ID is not configured"
    );
  }

  return Actor.createActor<LendingActor>(lendingIdlFactory, {
    agent: canisterContext.agent,
    canisterId,
  });
}
