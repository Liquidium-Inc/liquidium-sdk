import { describe, expect, test } from "vitest";
import { Asset, Chain } from "../../../core/types";
import { roundInflowFeeEstimate } from "./inflow-fee-rounding";

describe("roundInflowFeeEstimate", () => {
  test("should round eth usdt inflow fees up to the nearest ten cents", () => {
    // given
    const ETH_USDT_FEE_ESTIMATE = 1_198_098n;
    const EXPECTED_ROUNDED_FEE = 1_200_000n;

    // when
    const result = roundInflowFeeEstimate(
      { asset: Asset.USDT, chain: Chain.ETH },
      ETH_USDT_FEE_ESTIMATE
    );

    // then
    expect(result).toBe(EXPECTED_ROUNDED_FEE);
  });

  test("should round eth usdc inflow fees below ten cents up to ten cents", () => {
    // given
    const ETH_USDC_FEE_ESTIMATE = 40_000n;
    const EXPECTED_ROUNDED_FEE = 100_000n;

    // when
    const result = roundInflowFeeEstimate(
      { asset: Asset.USDC, chain: Chain.ETH },
      ETH_USDC_FEE_ESTIMATE
    );

    // then
    expect(result).toBe(EXPECTED_ROUNDED_FEE);
  });

  test("should leave eth stablecoin inflow fees already on a ten-cent boundary unchanged", () => {
    // given
    const ETH_STABLECOIN_FEE_ESTIMATE = 1_200_000n;

    // when
    const result = roundInflowFeeEstimate(
      { asset: Asset.USDT, chain: Chain.ETH },
      ETH_STABLECOIN_FEE_ESTIMATE
    );

    // then
    expect(result).toBe(ETH_STABLECOIN_FEE_ESTIMATE);
  });

  test("should round btc inflow fees up to the nearest five hundred sats", () => {
    // given
    const BTC_FEE_ESTIMATE_SATS = 2_010n;
    const EXPECTED_ROUNDED_FEE_SATS = 2_500n;

    // when
    const result = roundInflowFeeEstimate(
      { asset: Asset.BTC, chain: Chain.BTC },
      BTC_FEE_ESTIMATE_SATS
    );

    // then
    expect(result).toBe(EXPECTED_ROUNDED_FEE_SATS);
  });

  test("should leave btc inflow fees already on a five-hundred-sat boundary unchanged", () => {
    // given
    const BTC_FEE_ESTIMATE_SATS = 2_500n;

    // when
    const result = roundInflowFeeEstimate(
      { asset: Asset.BTC, chain: Chain.BTC },
      BTC_FEE_ESTIMATE_SATS
    );

    // then
    expect(result).toBe(BTC_FEE_ESTIMATE_SATS);
  });

  test("should not round ckBTC ledger fees", () => {
    // given
    const CKBTC_LEDGER_FEE_SATS = 10n;

    // when
    const result = roundInflowFeeEstimate(
      {
        asset: Asset.BTC,
        chain: Chain.ICP,
      },
      CKBTC_LEDGER_FEE_SATS
    );

    // then
    expect(result).toBe(CKBTC_LEDGER_FEE_SATS);
  });

  test("should not round ckUSDC ledger fees", () => {
    // given
    const CKUSDC_LEDGER_FEE = 10_000n;

    // when
    const result = roundInflowFeeEstimate(
      {
        asset: Asset.USDC,
        chain: Chain.ICP,
      },
      CKUSDC_LEDGER_FEE
    );

    // then
    expect(result).toBe(CKUSDC_LEDGER_FEE);
  });

  test("should return zero for zero or negative inflow fee estimates", () => {
    // given
    const ZERO_FEE_ESTIMATE = 0n;
    const NEGATIVE_FEE_ESTIMATE = -1n;
    const EXPECTED_FEE = 0n;

    // when
    const zeroResult = roundInflowFeeEstimate(
      { asset: Asset.USDT, chain: Chain.ETH },
      ZERO_FEE_ESTIMATE
    );
    const negativeResult = roundInflowFeeEstimate(
      { asset: Asset.BTC, chain: Chain.BTC },
      NEGATIVE_FEE_ESTIMATE
    );

    // then
    expect(zeroResult).toBe(EXPECTED_FEE);
    expect(negativeResult).toBe(EXPECTED_FEE);
  });
});
