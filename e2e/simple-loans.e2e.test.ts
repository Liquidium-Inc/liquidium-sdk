import { expect, test } from "vitest";
import {
  type AssetPrices,
  LiquidiumClient,
  LiquidiumErrorCode,
  type Pool,
  publicIdFromInt,
  type SimpleLoan,
} from "../packages/client/src";
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
const SIMPLE_LOAN_TARGET_LTV_BPS = 2_000n;
const SIMPLE_LOAN_LTV_BUFFER_BPS = 200n;
const NONEXISTENT_LOAN_ID = 1_000_000_000n;

describeLive("live Simple Loans e2e", () => {
  test("should create and hydrate one simple loan", async () => {
    // given
    const client = new LiquidiumClient();
    const pools = await client.market.listPools();
    const assetPrices = await client.market.getAssetPrices();
    const collateralPool = selectBtcCollateralPool(pools);
    const borrowPool = selectBorrowPool(pools);

    // when
    const loan = await createLiveSimpleLoan({
      client,
      collateralPool,
      borrowPool,
      pools,
      assetPrices,
    });
    const loanById = await client.simpleLoans.get({ loanId: loan.loanId });
    const loanByRef = await client.simpleLoans.get({ ref: loan.ref });

    // then
    expect(loan.loanId).toBeGreaterThan(0n);
    expect(loan.ref).toBeTruthy();
    expect(loan.profileId).toBeTruthy();
    expect(loan.status.operation).toBe("deposit");
    expect(loan.borrow.asset).toBe(borrowPool.asset);
    expect(loan.initialDeposit.targets.BTC?.target).toBeTruthy();
    expect(loan.initialDeposit.targets.ICP?.target).toBeTruthy();
    expect(loan.repayment.targets.ETH?.target).toBeTruthy();
    expect(loan.repayment.targets.ICP?.target).toBeTruthy();
    expect(loanById.loanId).toBe(loan.loanId);
    expect(loanByRef.loanId).toBe(loan.loanId);
  });

  test("should fail cleanly for a nonexistent simple loan id", async () => {
    // given
    const client = new LiquidiumClient();

    // when
    const result = client.simpleLoans.get({ loanId: NONEXISTENT_LOAN_ID });

    // then
    await expect(result).rejects.toMatchObject({
      code: LiquidiumErrorCode.POSITION_NOT_FOUND,
    });
  });

  test("should fail cleanly for a nonexistent simple loan ref", async () => {
    // given
    const client = new LiquidiumClient();
    const ref = publicIdFromInt(NONEXISTENT_LOAN_ID);

    // when
    const result = client.simpleLoans.get({ ref });

    // then
    await expect(result).rejects.toMatchObject({
      code: LiquidiumErrorCode.POSITION_NOT_FOUND,
    });
  });
});

async function createLiveSimpleLoan(params: {
  client: LiquidiumClient;
  collateralPool: Pool;
  borrowPool: Pool;
  pools: Pool[];
  assetPrices: AssetPrices;
}): Promise<SimpleLoan> {
  const { account: evmAddress } = createEthereumTestWallet();
  const { account: bitcoinAddress } = createBitcoinjsTestWallet();
  const borrowAmount = getMinimumBorrowAmount(params.borrowPool);
  const quote = params.client.quote.getQuote(
    {
      borrowAmount,
      borrowPoolId: params.borrowPool.id,
      collateralPoolId: params.collateralPool.id,
      targetLtvBps: SIMPLE_LOAN_TARGET_LTV_BPS,
    },
    params.pools,
    params.assetPrices
  );

  if (quote.validationErrors.length > 0) {
    throw new Error(quote.validationErrors[0]?.message);
  }

  return await params.client.simpleLoans.create({
    collateral: {
      poolId: params.collateralPool.id,
      asset: "BTC",
      amount: quote.requiredCollateralAmount,
    },
    borrow: {
      poolId: params.borrowPool.id,
      asset: params.borrowPool.asset as "USDC" | "USDT",
      amount: borrowAmount,
      chain: "ETH",
      destination: evmAddress,
    },
    refund: {
      chain: "BTC",
      destination: bitcoinAddress,
    },
    ltvMaxBps: quote.targetLtvBps + SIMPLE_LOAN_LTV_BUFFER_BPS,
    depositWindowSeconds: DEFAULT_DEPOSIT_WINDOW_SECONDS,
  });
}
