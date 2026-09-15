import { expect, test } from "vitest";
import { Asset, Chain, LiquidiumClient } from "../packages/client/src";
import { describeLive } from "./_internal/live";

describeLive("live fee estimation e2e", () => {
  test("should estimate L1 inflow fees for BTC and ETH assets", async () => {
    // given
    const client = new LiquidiumClient();

    // when
    const btcFeeEstimate = await client.lending.estimateInflowFee({
      asset: Asset.BTC,
      chain: Chain.BTC,
    });
    const [ethFeeEstimate, usdcFeeEstimate, usdtFeeEstimate] =
      await Promise.all([
        client.lending.estimateInflowFee({
          asset: Asset.ETH,
          chain: Chain.ETH,
        }),
        client.lending.estimateInflowFee({
          asset: Asset.USDC,
          chain: Chain.ETH,
        }),
        client.lending.estimateInflowFee({
          asset: Asset.USDT,
          chain: Chain.ETH,
        }),
      ]);

    // then
    expect(btcFeeEstimate.totalFee).toBeGreaterThan(0n);
    expect(ethFeeEstimate.totalFee).toBeGreaterThan(0n);
    expect(usdcFeeEstimate.totalFee).toBeGreaterThan(0n);
    expect(usdtFeeEstimate.totalFee).toBeGreaterThan(0n);
  });

  test("should estimate ck asset and ICP ledger inflow fees", async () => {
    // given
    const client = new LiquidiumClient();

    // when
    const ckBtcFeeEstimate = await client.lending.estimateInflowFee({
      asset: Asset.BTC,
      chain: Chain.ICP,
    });
    const [ckEthFeeEstimate, ckUsdcFeeEstimate, ckUsdtFeeEstimate] =
      await Promise.all([
        client.lending.estimateInflowFee({
          asset: Asset.ETH,
          chain: Chain.ICP,
        }),
        client.lending.estimateInflowFee({
          asset: Asset.USDC,
          chain: Chain.ICP,
        }),
        client.lending.estimateInflowFee({
          asset: Asset.USDT,
          chain: Chain.ICP,
        }),
      ]);
    const icpFeeEstimate = await client.lending.estimateInflowFee({
      asset: Asset.ICP,
      chain: Chain.ICP,
    });

    // then
    expect(ckBtcFeeEstimate.totalFee).toBeGreaterThan(0n);
    expect(ckEthFeeEstimate.totalFee).toBeGreaterThan(0n);
    expect(ckUsdcFeeEstimate.totalFee).toBeGreaterThan(0n);
    expect(ckUsdtFeeEstimate.totalFee).toBeGreaterThan(0n);
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
