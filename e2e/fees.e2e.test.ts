import { expect, test } from "vitest";
import { Asset, Chain, LiquidiumClient } from "../packages/client/src";
import { describeLive } from "./_internal/live";
import { selectBorrowPool } from "./_internal/pools";

describeLive("live fee estimation e2e", () => {
  test("should estimate L1 inflow fees for BTC and ETH stablecoins", async () => {
    // given
    const client = new LiquidiumClient();
    const pools = await client.market.listPools();
    const stablecoinPool = selectBorrowPool(pools);

    // when
    const btcFeeEstimate = await client.lending.estimateInflowFee({
      asset: Asset.BTC,
      chain: Chain.BTC,
    });
    const stablecoinFeeEstimate = await client.lending.estimateInflowFee({
      asset: stablecoinPool.asset as typeof Asset.USDC | typeof Asset.USDT,
      chain: Chain.ETH,
    });

    // then
    expect(btcFeeEstimate.totalFee).toBeGreaterThan(0n);
    expect(stablecoinFeeEstimate.totalFee).toBeGreaterThan(0n);
  });

  test("should estimate ck asset and ICP ledger inflow fees", async () => {
    // given
    const client = new LiquidiumClient();
    const pools = await client.market.listPools();
    const stablecoinPool = selectBorrowPool(pools);

    // when
    const ckBtcFeeEstimate = await client.lending.estimateInflowFee({
      asset: Asset.BTC,
      chain: Chain.ICP,
    });
    const ckStablecoinFeeEstimate = await client.lending.estimateInflowFee({
      asset: stablecoinPool.asset as typeof Asset.USDC | typeof Asset.USDT,
      chain: Chain.ICP,
    });
    const icpFeeEstimate = await client.lending.estimateInflowFee({
      asset: Asset.ICP,
      chain: Chain.ICP,
    });

    // then
    expect(ckBtcFeeEstimate.totalFee).toBeGreaterThan(0n);
    expect(ckStablecoinFeeEstimate.totalFee).toBeGreaterThan(0n);
    expect(icpFeeEstimate.totalFee).toBeGreaterThan(0n);
  });

  test("should estimate BTC L1 inflow fee at least as high as ckBTC ledger fee", async () => {
    // given
    const client = new LiquidiumClient();

    // when
    const btcL1FeeEstimate = await client.lending.estimateInflowFee({
      asset: Asset.BTC,
      chain: Chain.BTC,
    });
    const ckBtcFeeEstimate = await client.lending.estimateInflowFee({
      asset: Asset.BTC,
      chain: Chain.ICP,
    });

    // then
    expect(btcL1FeeEstimate.totalFee).toBeGreaterThanOrEqual(
      ckBtcFeeEstimate.totalFee
    );
  });
});
