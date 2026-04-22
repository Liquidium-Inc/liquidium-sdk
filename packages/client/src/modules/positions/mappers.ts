import type {
  BorrowingPowerRecord,
  UserStatsRecord,
} from "../../core/canisters/lending/actor";
import { getVariantKey } from "../../core/utils/variant";
import type { PositionView } from "../../generated/canisters/lending/lending.did";
import type { BorrowingPower, Position, UserStats } from "./types";

export const USD_VALUE_SCALE_DECIMALS = 27n;

const ASSET_NATIVE_DECIMALS: Record<string, bigint> = {
  BTC: 8n,
  USDC: 6n,
  USDT: 6n,
  SOL: 9n,
};

const FALLBACK_NATIVE_DECIMALS = 8n;

export function mapPositionViewToPosition(view: PositionView): Position {
  const asset = getVariantKey(view.asset);
  const nativeDecimals =
    ASSET_NATIVE_DECIMALS[asset] ?? FALLBACK_NATIVE_DECIMALS;

  return {
    poolId: view.pool_id.toText(),
    asset,
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
  return {
    debt: record.debt,
    debtDecimals: USD_VALUE_SCALE_DECIMALS,
    collateral: record.collateral,
    collateralDecimals: USD_VALUE_SCALE_DECIMALS,
    weightedLiquidationThreshold: record.weighted_liquidation_threshold,
    borrowingPower: mapBorrowingPowerRecordToBorrowingPower(
      record.borrowing_power
    ),
  };
}
