import type {
  BorrowingPowerRecord,
  UserStatsRecord,
} from "../../core/canisters/lending/actor";
import type {
  DecodedPositionView,
  DecodedUserStats,
} from "../../core/canisters/lending/flexible-actor";
import { getAssetNativeDecimals } from "../../core/utils/asset-decimals";
import { getVariantKey } from "../../core/utils/variant";
import type { PositionView } from "../../generated/canisters/lending/lending.did";
import type { BorrowingPower, Position, UserStats } from "./types";

export const USD_VALUE_SCALE_DECIMALS = 27n;

interface UserStatsLike {
  debt: bigint;
  collateral: bigint;
  weighted_liquidation_threshold: bigint;
  borrowing_power: BorrowingPowerRecord;
}

export function mapPositionViewToPosition(view: PositionView): Position {
  return mapDecodedPositionViewToPosition({
    ...view,
    asset: getVariantKey(view.asset),
  });
}

export function mapDecodedPositionViewToPosition(
  view: DecodedPositionView
): Position {
  const nativeDecimals = getAssetNativeDecimals(view.asset);

  return {
    poolId: view.pool_id.toText(),
    asset: view.asset,
    deposited: view.deposited_native_now,
    depositedDecimals: nativeDecimals,
    borrowed: view.debt_native_now,
    borrowedDecimals: nativeDecimals,
    earnedInterest: view.total_earned_interest + view.earned_since_snapshot,
    debtInterest: view.total_debt_interest + view.interest_since_snapshot,
    lastUpdate: view.last_update,
  };
}

export function mapBorrowingPowerRecordToBorrowingPower(
  record: BorrowingPowerRecord
): BorrowingPower {
  return {
    weightedMaxLtv: record.weighted_max_ltv,
    maxBorrowableUsd: record.max_borrowable_usd,
    maxBorrowableUsdDecimals: USD_VALUE_SCALE_DECIMALS,
  };
}

export function mapUserStatsRecordToUserStats(
  record: UserStatsRecord
): UserStats {
  return mapUserStatsLikeToUserStats(record);
}

export function mapDecodedUserStatsToUserStats(
  stats: DecodedUserStats
): UserStats {
  return mapUserStatsLikeToUserStats(stats);
}

function mapUserStatsLikeToUserStats(stats: UserStatsLike): UserStats {
  return {
    debt: stats.debt,
    debtDecimals: USD_VALUE_SCALE_DECIMALS,
    collateral: stats.collateral,
    collateralDecimals: USD_VALUE_SCALE_DECIMALS,
    weightedLiquidationThreshold: stats.weighted_liquidation_threshold,
    borrowingPower: mapBorrowingPowerRecordToBorrowingPower(
      stats.borrowing_power
    ),
  };
}
