import type {
  LendingPoolRecord,
  PoolRateTuple,
  PriceRecord,
} from "../../core/canisters/lending/actor";
import { RATE_DECIMALS } from "../../core/rates";
import { getAssetNativeDecimals } from "../../core/utils/asset-decimals";
import { getVariantKey } from "../../core/utils/variant";
import type { AssetPrices, Pool } from "./types";

const DECIMAL_BASE = 10;
const PAIR_SEPARATOR = "_";
const USDT_SYMBOL = "USDT";

export function mapLendingPoolRecordToPool(
  pool: LendingPoolRecord,
  rate: PoolRateTuple
): Pool {
  const asset = getVariantKey(pool.asset);
  const totalSupply = pool.total_supply_at_last_sync;
  const totalDebt = pool.total_debt_at_last_sync;
  const availableLiquidity =
    totalSupply > totalDebt ? totalSupply - totalDebt : 0n;

  return {
    id: pool.principal.toString(),
    asset,
    chain: getVariantKey(pool.chain),
    decimals: getAssetNativeDecimals(asset),
    frozen: pool.frozen,
    totalSupply,
    totalDebt,
    availableLiquidity,
    supplyCap: pool.supply_cap[0],
    borrowCap: pool.borrow_cap[0],
    maxLtv: pool.max_ltv,
    liquidationThreshold: pool.liquidation_threshold,
    liquidationBonus: pool.liquidation_bonus,
    protocolLiquidationFee: pool.protocol_liquidation_fee,
    reserveFactor: pool.reserve_factor,
    rateDecimals: RATE_DECIMALS,
    lendingRate: rate[1],
    borrowingRate: rate[0],
    utilizationRate: rate[2],
    baseRate: pool.base_rate,
    optimalUtilizationRate: pool.optimal_utilization_rate,
    rateSlopeBefore: pool.rate_slope_before,
    rateSlopeAfter: pool.rate_slope_after,
    lendingIndex: pool.lending_index,
    borrowIndex: pool.borrow_index,
    sameAssetBorrowing: pool.same_asset_borrowing[0] ?? false,
    lastUpdated: pool.last_updated[0],
  };
}

export function mapGetPricesResponseToAssetPrices(
  prices: PriceRecord[]
): AssetPrices {
  const pairPricesByName = new Map(
    prices.map(([pair, price, decimals]) => [
      pair,
      formatPrice(price, decimals),
    ])
  );
  const assetPrices: AssetPrices = {};

  for (const [pairName, pairPrice] of pairPricesByName) {
    const [baseAsset, quoteAsset] = pairName.split(PAIR_SEPARATOR);

    if (!baseAsset || !quoteAsset || quoteAsset !== USDT_SYMBOL) {
      continue;
    }

    assetPrices[baseAsset] = pairPrice;
  }

  return assetPrices;
}

export function mapGetPoolRateResponseToPoolRate(rate: PoolRateTuple): {
  rateDecimals: bigint;
  borrowRate: bigint;
  lendRate: bigint;
  utilizationRate: bigint;
} {
  return {
    rateDecimals: RATE_DECIMALS,
    borrowRate: rate[0],
    lendRate: rate[1],
    utilizationRate: rate[2],
  };
}

function formatPrice(price: bigint, decimals: number): number {
  const decimalScale = DECIMAL_BASE ** decimals;

  return Number(price) / decimalScale;
}
