import { expect, test } from "vitest";
import { Chain, LiquidiumClient } from "../src";
import { describeLive } from "./_internal/live";
import {
  getMinimumBorrowAmount,
  selectBorrowPool,
  selectBtcCollateralPool,
} from "./_internal/pools";
import {
  createBitcoinjsTestWallet,
  createEthereumTestWallet,
} from "./_internal/test-wallets";

const DEFAULT_DEPOSIT_WINDOW_SECONDS = 3_600n;
const INSTANT_LOAN_TARGET_LTV_BPS = 2_000n;
const INSTANT_LOAN_LTV_BUFFER_BPS = 200n;

describeLive("live instant loans e2e", () => {
  test("should create and hydrate an instant loan through the live API and canisters", async () => {
    // given
    const client = new LiquidiumClient();
    const { account: evmAddress } = createEthereumTestWallet();
    const { account: bitcoinAddress } = createBitcoinjsTestWallet();
    const pools = await client.market.listPools();
    const assetPrices = await client.market.getAssetPrices();
    const collateralPool = selectBtcCollateralPool(pools);
    const borrowPool = selectBorrowPool(pools);
    const borrowAmount = getMinimumBorrowAmount(borrowPool);
    const quote = client.quote.getQuote(
      {
        borrowAmount,
        borrowPoolId: borrowPool.id,
        collateralPoolId: collateralPool.id,
        targetLtvBps: INSTANT_LOAN_TARGET_LTV_BPS,
      },
      pools,
      assetPrices
    );

    if (quote.validationErrors.length > 0) {
      throw new Error(quote.validationErrors[0]?.message);
    }

    const ltvMaxBps = quote.targetLtvBps + INSTANT_LOAN_LTV_BUFFER_BPS;

    // when
    const loan = await client.instantLoans.create({
      collateralPoolId: collateralPool.id,
      borrowPoolId: borrowPool.id,
      collateralAsset: "BTC",
      borrowAsset: borrowPool.asset as "USDC" | "USDT",
      collateralAmount: quote.requiredCollateralAmount,
      borrowAmount,
      ltvMaxBps,
      depositWindowSeconds: DEFAULT_DEPOSIT_WINDOW_SECONDS,
      borrowDestination: evmAddress,
      refundDestination: bitcoinAddress,
    });
    const loanById = await client.instantLoans.get({ loanId: loan.loanId });
    const loanByRef = await client.instantLoans.get({ ref: loan.ref });
    const findResults = await client.instantLoans.find(loan.ref);

    // then
    expect(loan.loanId).toBeGreaterThan(0n);
    expect(loan.ref).toBeTruthy();
    expect(loan.profileId).toBeTruthy();
    expect(loan.status.operation).toBe("deposit");
    expect(loan.collateral).toMatchObject({
      poolId: collateralPool.id,
      asset: "BTC",
      chain: Chain.BTC,
      amount: quote.requiredCollateralAmount,
    });
    expect(loan.borrow).toMatchObject({
      poolId: borrowPool.id,
      asset: borrowPool.asset,
      chain: Chain.ETH,
      amount: borrowAmount,
      destination: {
        type: "External",
        address: evmAddress,
      },
    });
    expect(loan.initialDeposit.amount).toBeGreaterThanOrEqual(
      quote.requiredCollateralAmount
    );
    expect(loan.initialDeposit.target).toBeTruthy();
    expect(loan.repayment.target).toBeTruthy();
    expect(loanById.loanId).toBe(loan.loanId);
    expect(loanByRef.loanId).toBe(loan.loanId);
    expect(Array.isArray(findResults)).toBe(true);
  });
});
