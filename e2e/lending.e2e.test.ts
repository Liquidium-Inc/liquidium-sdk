import { expect, test } from "vitest";
import {
  Asset,
  Chain,
  LiquidiumClient,
  SupplyAction,
} from "../packages/client/src";
import { describeLive } from "./_internal/live";
import { selectBorrowPool, selectBtcCollateralPool } from "./_internal/pools";
import { createEthereumTestWallet } from "./_internal/test-wallets";

describeLive("live lending e2e", () => {
  test("should resolve a manual BTC supply target without broadcasting transactions", async () => {
    // given
    const client = new LiquidiumClient();
    const { account, walletAdapter } = createEthereumTestWallet();
    const profileId = await client.accounts.createProfile({
      account,
      chain: Chain.ETH,
      walletAdapter,
    });
    const pools = await client.market.listPools();
    const btcPool = selectBtcCollateralPool(pools);

    // when
    const btcSupplyFlow = await client.lending.supply({
      profileId,
      poolId: btcPool.id,
      action: SupplyAction.deposit,
    });

    // then
    expect(btcSupplyFlow.txid).toBeUndefined();
    expect(btcSupplyFlow.target).toMatchObject({
      type: "ChainAddress",
      poolId: btcPool.id,
      asset: Asset.BTC,
      chain: Chain.BTC,
      action: SupplyAction.deposit,
    });
  });

  test("should estimate BTC and ETH stablecoin inflow fees", async () => {
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

  test("should expose the live borrowing-disabled flag", async () => {
    // given
    const client = new LiquidiumClient();

    // when
    const isBorrowingDisabled = await client.lending.isBorrowingDisabled();

    // then
    expect(typeof isBorrowingDisabled).toBe("boolean");
  });
});
