import { expect, test } from "vitest";
import {
  type AssetPrices,
  type CreateInstantLoanRequest,
  type InstantLoan,
  LiquidiumClient,
  LiquidiumErrorCode,
  type Pool,
  publicIdFromInt,
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
const INSTANT_LOAN_TARGET_LTV_BPS = 2_000n;
const INSTANT_LOAN_LTV_BUFFER_BPS = 200n;
const NONEXISTENT_LOAN_ID = 1_000_000_000n;
const VALID_BTC_L1_ADDRESS = "1BoatSLRHtKNngkdXEeobR76b53LETtpyT";
const VALID_ETH_L1_ADDRESS = "0x52908400098527886E0F7030069857D2E4169EE7";
const ICP_POOL_ID_PLACEHOLDER = "r2pk3-4yaaa-aaaar-qb7zq-cai";
const USDT_POOL_ID_PLACEHOLDER = "hnnn4-iyaaa-aaaar-qb4bq-cai";
const BTC_POOL_ID_PLACEHOLDER = "hkmli-faaaa-aaaar-qb4ba-cai";
const DEFAULT_COLLATERAL_AMOUNT_BASE_UNITS = 10_000_000n;
const DEFAULT_BORROW_AMOUNT_BASE_UNITS = 5_726_000_000n;
const DEFAULT_ICP_AMOUNT_E8S = 1_000_000n;
const DEFAULT_LTV_MAX_BPS = 6_000n;

describeLive("live instant loans e2e", () => {
  test("should create and hydrate one instant loan", async () => {
    // given
    const client = new LiquidiumClient();
    const pools = await client.market.listPools();
    const assetPrices = await client.market.getAssetPrices();
    const collateralPool = selectBtcCollateralPool(pools);
    const borrowPool = selectBorrowPool(pools);

    // when
    const loan = await createLiveInstantLoan({
      client,
      collateralPool,
      borrowPool,
      pools,
      assetPrices,
    });
    const loanById = await client.instantLoans.get({ loanId: loan.loanId });
    const loanByRef = await client.instantLoans.get({ ref: loan.ref });

    // then
    expect(loan.loanId).toBeGreaterThan(0n);
    expect(loan.ref).toBeTruthy();
    expect(loan.profileId).toBeTruthy();
    expect(loan.status.operation).toBe("deposit");
    expect(loan.borrow.asset).toBe(borrowPool.asset);
    expect(loan.initialDeposit.target).toBeTruthy();
    expect(loan.repayment.target).toBeTruthy();
    expect(loanById.loanId).toBe(loan.loanId);
    expect(loanByRef.loanId).toBe(loan.loanId);
  });

  test("should fail cleanly for a nonexistent instant loan id", async () => {
    // given
    const client = new LiquidiumClient();

    // when
    const result = client.instantLoans.get({ loanId: NONEXISTENT_LOAN_ID });

    // then
    await expect(result).rejects.toMatchObject({
      code: LiquidiumErrorCode.POSITION_NOT_FOUND,
    });
  });

  test("should fail cleanly for a nonexistent instant loan ref", async () => {
    // given
    const client = new LiquidiumClient();
    const ref = publicIdFromInt(NONEXISTENT_LOAN_ID);

    // when
    const result = client.instantLoans.get({ ref });

    // then
    await expect(result).rejects.toMatchObject({
      code: LiquidiumErrorCode.POSITION_NOT_FOUND,
    });
  });

  test.each([
    {
      name: "ck stablecoin borrow to an ETH L1 address",
      requestOverrides: {
        borrowTransferMode: "ckLedger",
        borrowDestination: {
          type: "ChainAddress",
          address: VALID_ETH_L1_ADDRESS,
        },
      },
      expectedCode: LiquidiumErrorCode.VALIDATION_ERROR,
    },
    {
      name: "ckBTC refund to a BTC L1 address",
      requestOverrides: {
        refundTransferMode: "ckLedger",
        refundDestination: {
          type: "ChainAddress",
          address: VALID_BTC_L1_ADDRESS,
        },
      },
      expectedCode: LiquidiumErrorCode.VALIDATION_ERROR,
    },
    {
      name: "ICP borrow to an ETH L1 address",
      requestOverrides: {
        borrowPoolId: ICP_POOL_ID_PLACEHOLDER,
        borrowAsset: "ICP",
        borrowAmount: DEFAULT_ICP_AMOUNT_E8S,
        borrowDestination: {
          type: "ChainAddress",
          address: VALID_ETH_L1_ADDRESS,
        },
      },
      expectedCode: LiquidiumErrorCode.INVALID_ADDRESS,
    },
  ])("should reject unsafe instant loan destination before creating a loan: $name", async ({
    requestOverrides,
    expectedCode,
  }) => {
    // given
    const client = new LiquidiumClient();

    // when
    const result = client.instantLoans.create(
      createInstantLoanValidationRequest(requestOverrides)
    );

    // then
    await expect(result).rejects.toMatchObject({
      code: expectedCode,
    });
  });
});

async function createLiveInstantLoan(params: {
  client: LiquidiumClient;
  collateralPool: Pool;
  borrowPool: Pool;
  pools: Pool[];
  assetPrices: AssetPrices;
}): Promise<InstantLoan> {
  const { account: evmAddress } = createEthereumTestWallet();
  const { account: bitcoinAddress } = createBitcoinjsTestWallet();
  const borrowAmount = getMinimumBorrowAmount(params.borrowPool);
  const quote = params.client.quote.getQuote(
    {
      borrowAmount,
      borrowPoolId: params.borrowPool.id,
      collateralPoolId: params.collateralPool.id,
      targetLtvBps: INSTANT_LOAN_TARGET_LTV_BPS,
    },
    params.pools,
    params.assetPrices
  );

  if (quote.validationErrors.length > 0) {
    throw new Error(quote.validationErrors[0]?.message);
  }

  return await params.client.instantLoans.create({
    collateralPoolId: params.collateralPool.id,
    borrowPoolId: params.borrowPool.id,
    collateralAsset: "BTC",
    borrowAsset: params.borrowPool.asset as "USDC" | "USDT",
    collateralAmount: quote.requiredCollateralAmount,
    borrowAmount,
    ltvMaxBps: quote.targetLtvBps + INSTANT_LOAN_LTV_BUFFER_BPS,
    depositWindowSeconds: DEFAULT_DEPOSIT_WINDOW_SECONDS,
    borrowTransferMode: "nativeAsset",
    borrowDestination: evmAddress,
    refundTransferMode: "nativeAsset",
    refundDestination: bitcoinAddress,
  });
}

function createInstantLoanValidationRequest(
  overrides: Partial<CreateInstantLoanRequest> = {}
): CreateInstantLoanRequest {
  return {
    collateralPoolId: BTC_POOL_ID_PLACEHOLDER,
    borrowPoolId: USDT_POOL_ID_PLACEHOLDER,
    collateralAsset: "BTC",
    borrowAsset: "USDT",
    collateralAmount: DEFAULT_COLLATERAL_AMOUNT_BASE_UNITS,
    borrowAmount: DEFAULT_BORROW_AMOUNT_BASE_UNITS,
    ltvMaxBps: DEFAULT_LTV_MAX_BPS,
    depositWindowSeconds: DEFAULT_DEPOSIT_WINDOW_SECONDS,
    borrowTransferMode: "nativeAsset",
    borrowDestination: VALID_ETH_L1_ADDRESS,
    refundTransferMode: "nativeAsset",
    refundDestination: VALID_BTC_L1_ADDRESS,
    ...overrides,
  };
}
