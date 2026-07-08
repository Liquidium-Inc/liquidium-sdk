import { Asset, Chain } from "../../../core/types";
import { ceilDivBigint } from "../../../core/utils/bigint";
import type { EstimateInflowFeeRequest } from "../types";
import { isEthStablecoin } from "./supply-targets";

const ETH_STABLECOIN_INFLOW_FEE_ROUND_UP_TO_NEAREST_10_CENTS = 100_000n;
const BTC_INFLOW_FEE_ROUND_UP_TO_NEAREST_SATS = 500n;

/**
 * Rounds an inflow fee estimate up to the configured unit for its asset.
 *
 * ETH stablecoin fees use 6 decimals, so 100_000 base units is $0.10.
 * BTC fees use sats, so the fee is rounded up to the nearest 500 sats.
 */
export function roundInflowFeeEstimate(
  request: EstimateInflowFeeRequest,
  totalFee: bigint
): bigint {
  if (totalFee <= 0n) {
    return 0n;
  }

  if (isEthStablecoin(request.asset, request.chain)) {
    return roundUpToNearest(
      totalFee,
      ETH_STABLECOIN_INFLOW_FEE_ROUND_UP_TO_NEAREST_10_CENTS
    );
  }

  if (request.asset === Asset.BTC && request.chain === Chain.BTC) {
    return roundUpToNearest(totalFee, BTC_INFLOW_FEE_ROUND_UP_TO_NEAREST_SATS);
  }

  return totalFee;
}

/** Rounds a positive bigint up to the nearest multiple of the rounding unit. */
function roundUpToNearest(amount: bigint, roundingUnit: bigint): bigint {
  return ceilDivBigint(amount, roundingUnit) * roundingUnit;
}
