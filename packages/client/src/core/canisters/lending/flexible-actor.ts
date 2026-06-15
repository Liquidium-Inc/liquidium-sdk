import { Actor } from "@icp-sdk/core/agent";
import type { IDL } from "@icp-sdk/core/candid";
import { idlLabelToId } from "@icp-sdk/core/candid";
import type { Principal } from "@icp-sdk/core/principal";
import { LiquidiumError, LiquidiumErrorCode } from "../../errors";
import type { CanisterContext } from "../../transports/canister-context";

// Asset and chain tags supported by this SDK version. Unknown tags returned by
// the canister are ignored rather than causing the whole call to fail.
const KNOWN_ASSET_TAGS = ["BTC", "SOL", "USDC", "USDT"] as const;
const KNOWN_CHAIN_TAGS = ["BTC", "ETH", "SOL"] as const;

const flexibleLendingIdlFactory: IDL.InterfaceFactory = ({ IDL }) => {
  const PoolRecord = IDL.Record({
    principal: IDL.Principal,
    asset: IDL.Unknown,
    chain: IDL.Unknown,
    total_supply_at_last_sync: IDL.Nat,
    total_debt_at_last_sync: IDL.Nat,
    supply_cap: IDL.Opt(IDL.Nat),
    borrow_cap: IDL.Opt(IDL.Nat),
    max_ltv: IDL.Nat64,
    liquidation_threshold: IDL.Nat64,
    liquidation_bonus: IDL.Nat64,
    protocol_liquidation_fee: IDL.Nat64,
    reserve_factor: IDL.Nat64,
    base_rate: IDL.Nat,
    optimal_utilization_rate: IDL.Nat,
    rate_slope_before: IDL.Nat,
    rate_slope_after: IDL.Nat,
    lending_index: IDL.Nat,
    borrow_index: IDL.Nat,
    same_asset_borrowing: IDL.Opt(IDL.Bool),
    frozen: IDL.Bool,
    last_updated: IDL.Opt(IDL.Nat64),
  });

  const BorrowingPowerRecord = IDL.Record({
    max_borrowable_usd: IDL.Nat,
    weighted_max_ltv: IDL.Nat,
  });

  const PositionRecord = IDL.Record({
    asset: IDL.Unknown,
    total_debt_interest: IDL.Nat,
    borrow_index_snapshot: IDL.Nat,
    lending_index_snapshot: IDL.Nat,
    debt_scaled: IDL.Nat,
    total_earned_interest: IDL.Nat,
    deposit_scaled: IDL.Nat,
    pool_id: IDL.Principal,
    unpaid_debt_interest: IDL.Nat,
    last_update: IDL.Nat64,
    user_profile: IDL.Principal,
  });

  const UserStatsRecord = IDL.Record({
    debt: IDL.Nat,
    collateral: IDL.Nat,
    acumulated_interest: IDL.Nat,
    borrowing_power: BorrowingPowerRecord,
    positions: IDL.Vec(PositionRecord),
    weighted_liquidation_threshold: IDL.Nat,
  });

  const PositionViewRecord = IDL.Record({
    lending_index_now: IDL.Nat,
    interest_since_snapshot: IDL.Nat,
    asset: IDL.Unknown,
    total_debt_interest: IDL.Nat,
    borrow_index_snapshot: IDL.Nat,
    debt_native_now: IDL.Nat,
    borrow_index_now: IDL.Nat,
    lending_index_snapshot: IDL.Nat,
    debt_scaled: IDL.Nat,
    total_earned_interest: IDL.Nat,
    deposit_scaled: IDL.Nat,
    earned_since_snapshot: IDL.Nat,
    deposited_native_now: IDL.Nat,
    pool_id: IDL.Principal,
    last_update: IDL.Nat64,
    user_profile: IDL.Principal,
  });

  return IDL.Service({
    list_pools: IDL.Func([], [IDL.Vec(PoolRecord)], ["query"]),
    get_pool_rate: IDL.Func(
      [IDL.Principal],
      [IDL.Opt(IDL.Tuple(IDL.Nat, IDL.Nat, IDL.Nat))],
      ["query"]
    ),
    get_health_factor: IDL.Func(
      [IDL.Principal],
      [IDL.Nat, UserStatsRecord],
      ["query"]
    ),
    get_profile_stats: IDL.Func([IDL.Principal], [UserStatsRecord], ["query"]),
    get_position: IDL.Func(
      [IDL.Principal, IDL.Principal],
      [IDL.Opt(PositionViewRecord)],
      ["query"]
    ),
  });
};

export type FlexiblePool = {
  principal: Principal;
  asset: object;
  chain: object;
  total_supply_at_last_sync: bigint;
  total_debt_at_last_sync: bigint;
  supply_cap: [bigint] | [];
  borrow_cap: [bigint] | [];
  max_ltv: bigint;
  liquidation_threshold: bigint;
  liquidation_bonus: bigint;
  protocol_liquidation_fee: bigint;
  reserve_factor: bigint;
  base_rate: bigint;
  optimal_utilization_rate: bigint;
  rate_slope_before: bigint;
  rate_slope_after: bigint;
  lending_index: bigint;
  borrow_index: bigint;
  same_asset_borrowing: [boolean] | [];
  frozen: boolean;
  last_updated: [bigint] | [];
};

export type FlexibleBorrowingPower = {
  max_borrowable_usd: bigint;
  weighted_max_ltv: bigint;
};

export type FlexiblePosition = {
  asset: object;
  total_debt_interest: bigint;
  borrow_index_snapshot: bigint;
  lending_index_snapshot: bigint;
  debt_scaled: bigint;
  total_earned_interest: bigint;
  deposit_scaled: bigint;
  pool_id: Principal;
  unpaid_debt_interest: bigint;
  last_update: bigint;
  user_profile: Principal;
};

export type FlexibleUserStats = {
  debt: bigint;
  collateral: bigint;
  acumulated_interest: bigint;
  borrowing_power: FlexibleBorrowingPower;
  positions: FlexiblePosition[];
  weighted_liquidation_threshold: bigint;
};

export type FlexiblePositionView = {
  lending_index_now: bigint;
  interest_since_snapshot: bigint;
  asset: object;
  total_debt_interest: bigint;
  borrow_index_snapshot: bigint;
  debt_native_now: bigint;
  borrow_index_now: bigint;
  lending_index_snapshot: bigint;
  debt_scaled: bigint;
  total_earned_interest: bigint;
  deposit_scaled: bigint;
  earned_since_snapshot: bigint;
  deposited_native_now: bigint;
  pool_id: Principal;
  last_update: bigint;
  user_profile: Principal;
};

export interface FlexibleLendingActor {
  list_pools: () => Promise<FlexiblePool[]>;
  get_pool_rate: (
    poolId: Principal
  ) => Promise<[] | [[bigint, bigint, bigint]]>;
  get_health_factor: (
    profileId: Principal
  ) => Promise<[bigint, FlexibleUserStats]>;
  get_profile_stats: (profileId: Principal) => Promise<FlexibleUserStats>;
  get_position: (
    profileId: Principal,
    poolId: Principal
  ) => Promise<[] | [FlexiblePositionView]>;
}

export interface DecodedPool {
  principal: Principal;
  asset: string;
  chain: string;
  total_supply_at_last_sync: bigint;
  total_debt_at_last_sync: bigint;
  supply_cap: [bigint] | [];
  borrow_cap: [bigint] | [];
  max_ltv: bigint;
  liquidation_threshold: bigint;
  liquidation_bonus: bigint;
  protocol_liquidation_fee: bigint;
  reserve_factor: bigint;
  base_rate: bigint;
  optimal_utilization_rate: bigint;
  rate_slope_before: bigint;
  rate_slope_after: bigint;
  lending_index: bigint;
  borrow_index: bigint;
  same_asset_borrowing: [boolean] | [];
  frozen: boolean;
  last_updated: [bigint] | [];
}

export interface DecodedPosition {
  asset: string;
  total_debt_interest: bigint;
  borrow_index_snapshot: bigint;
  lending_index_snapshot: bigint;
  debt_scaled: bigint;
  total_earned_interest: bigint;
  deposit_scaled: bigint;
  pool_id: Principal;
  unpaid_debt_interest: bigint;
  last_update: bigint;
  user_profile: Principal;
}

export interface DecodedUserStats {
  debt: bigint;
  collateral: bigint;
  acumulated_interest: bigint;
  borrowing_power: FlexibleBorrowingPower;
  positions: DecodedPosition[];
  weighted_liquidation_threshold: bigint;
}

export interface DecodedPositionView {
  lending_index_now: bigint;
  interest_since_snapshot: bigint;
  asset: string;
  total_debt_interest: bigint;
  borrow_index_snapshot: bigint;
  debt_native_now: bigint;
  borrow_index_now: bigint;
  lending_index_snapshot: bigint;
  debt_scaled: bigint;
  total_earned_interest: bigint;
  deposit_scaled: bigint;
  earned_since_snapshot: bigint;
  deposited_native_now: bigint;
  pool_id: Principal;
  last_update: bigint;
  user_profile: Principal;
}

export function createFlexibleLendingActor(
  canisterContext: CanisterContext
): FlexibleLendingActor {
  const canisterId = canisterContext.canisterIds.lending;

  if (!canisterId) {
    throw new LiquidiumError(
      LiquidiumErrorCode.SERVICE_UNAVAILABLE,
      "Lending canister ID is not configured"
    );
  }

  return Actor.createActor(flexibleLendingIdlFactory, {
    agent: canisterContext.agent,
    canisterId,
  }) as FlexibleLendingActor;
}

export function decodeFlexiblePool(pool: FlexiblePool): DecodedPool | null {
  const asset = extractVariantTag(pool.asset, KNOWN_ASSET_TAGS);
  const chain = extractVariantTag(pool.chain, KNOWN_CHAIN_TAGS);

  if (!asset || !chain) {
    return null;
  }

  return {
    principal: pool.principal,
    asset,
    chain,
    total_supply_at_last_sync: pool.total_supply_at_last_sync,
    total_debt_at_last_sync: pool.total_debt_at_last_sync,
    supply_cap: pool.supply_cap,
    borrow_cap: pool.borrow_cap,
    max_ltv: pool.max_ltv,
    liquidation_threshold: pool.liquidation_threshold,
    liquidation_bonus: pool.liquidation_bonus,
    protocol_liquidation_fee: pool.protocol_liquidation_fee,
    reserve_factor: pool.reserve_factor,
    base_rate: pool.base_rate,
    optimal_utilization_rate: pool.optimal_utilization_rate,
    rate_slope_before: pool.rate_slope_before,
    rate_slope_after: pool.rate_slope_after,
    lending_index: pool.lending_index,
    borrow_index: pool.borrow_index,
    same_asset_borrowing: pool.same_asset_borrowing,
    frozen: pool.frozen,
    last_updated: pool.last_updated,
  };
}

export function decodeFlexiblePosition(
  position: FlexiblePosition
): DecodedPosition | null {
  const asset = extractVariantTag(position.asset, KNOWN_ASSET_TAGS);

  if (!asset) {
    return null;
  }

  return {
    asset,
    total_debt_interest: position.total_debt_interest,
    borrow_index_snapshot: position.borrow_index_snapshot,
    lending_index_snapshot: position.lending_index_snapshot,
    debt_scaled: position.debt_scaled,
    total_earned_interest: position.total_earned_interest,
    deposit_scaled: position.deposit_scaled,
    pool_id: position.pool_id,
    unpaid_debt_interest: position.unpaid_debt_interest,
    last_update: position.last_update,
    user_profile: position.user_profile,
  };
}

export function decodeFlexiblePositionView(
  view: FlexiblePositionView
): DecodedPositionView | null {
  const asset = extractVariantTag(view.asset, KNOWN_ASSET_TAGS);

  if (!asset) {
    return null;
  }

  return {
    lending_index_now: view.lending_index_now,
    interest_since_snapshot: view.interest_since_snapshot,
    asset,
    total_debt_interest: view.total_debt_interest,
    borrow_index_snapshot: view.borrow_index_snapshot,
    debt_native_now: view.debt_native_now,
    borrow_index_now: view.borrow_index_now,
    lending_index_snapshot: view.lending_index_snapshot,
    debt_scaled: view.debt_scaled,
    total_earned_interest: view.total_earned_interest,
    deposit_scaled: view.deposit_scaled,
    earned_since_snapshot: view.earned_since_snapshot,
    deposited_native_now: view.deposited_native_now,
    pool_id: view.pool_id,
    last_update: view.last_update,
    user_profile: view.user_profile,
  };
}

export function decodeFlexibleUserStats(
  stats: FlexibleUserStats
): DecodedUserStats {
  return {
    debt: stats.debt,
    collateral: stats.collateral,
    acumulated_interest: stats.acumulated_interest,
    borrowing_power: stats.borrowing_power,
    positions: stats.positions
      .map(decodeFlexiblePosition)
      .filter((position): position is DecodedPosition => position !== null),
    weighted_liquidation_threshold: stats.weighted_liquidation_threshold,
  };
}

function extractVariantTag(
  variant: object,
  knownTags: readonly string[]
): string | null {
  const [key] = Object.keys(variant);

  if (!key) {
    return null;
  }

  // Known variants decoded by a matching IDL already use the tag name.
  if (knownTags.includes(key)) {
    return key;
  }

  // IDL.Unknown returns variants with hashed field names: _${hash}_
  const hashMatch = /^_(\d+)_$/.exec(key);
  if (!hashMatch) {
    return null;
  }

  const hash = Number(hashMatch[1]);

  for (const tag of knownTags) {
    if (idlLabelToId(tag) === hash) {
      return tag;
    }
  }

  return null;
}
