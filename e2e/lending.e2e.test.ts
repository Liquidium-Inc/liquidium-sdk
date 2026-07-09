import { expect, test } from "vitest";
import {
  Asset,
  Chain,
  LiquidiumClient,
  LiquidiumErrorCode,
  type SendIcrcTransferRequest,
  SupplyAction,
} from "../packages/client/src";
import { CK_CANISTER_IDS } from "../packages/client/src/core/config";
import { describeLive } from "./_internal/live";
import {
  selectBorrowPool,
  selectBtcCollateralPool,
  selectIcpPool,
} from "./_internal/pools";
import { createEthereumTestWallet } from "./_internal/test-wallets";

const FAKE_ICP_TXID = "fake-icp-txid";
const FAKE_CK_BTC_TXID = "fake-ck-btc-txid";
const FAKE_CK_STABLECOIN_TXID = "fake-ck-stablecoin-txid";
const ICP_TRANSFER_AMOUNT_E8S = 100_000_000n;
const CK_BTC_TRANSFER_AMOUNT_SATS = 100_000n;
const CK_STABLECOIN_TRANSFER_AMOUNT_BASE_UNITS = 1_000_000n;
const VALID_ETH_L1_ADDRESS = "0x52908400098527886E0F7030069857D2E4169EE7";
const VALID_BTC_L1_ADDRESS = "1BoatSLRHtKNngkdXEeobR76b53LETtpyT";

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
      chain: Chain.BTC,
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

  test("should resolve a manual ICP supply target in both ledger account formats", async () => {
    // given
    const client = new LiquidiumClient();
    const { account, walletAdapter } = createEthereumTestWallet();
    const profileId = await client.accounts.createProfile({
      account,
      chain: Chain.ETH,
      walletAdapter,
    });
    const pools = await client.market.listPools();
    const icpPool = selectIcpPool(pools);

    // when
    const icpSupplyFlow = await client.lending.supply({
      profileId,
      poolId: icpPool.id,
      action: SupplyAction.deposit,
      chain: Chain.ICP,
    });

    // then
    expect(icpSupplyFlow.txid).toBeUndefined();
    expect(icpSupplyFlow.target).toMatchObject({
      type: "IcpLedgerAccount",
      poolId: icpPool.id,
      asset: Asset.ICP,
      chain: Chain.ICP,
      action: SupplyAction.deposit,
    });

    if (icpSupplyFlow.target.type !== "IcpLedgerAccount") {
      throw new Error("Expected an ICP ledger account supply target");
    }

    expect(icpSupplyFlow.target.account.icpIcrcAccount.owner).toBe(icpPool.id);
    expect(icpSupplyFlow.target.account.icpIcrcAccount.address).toBeTruthy();
    expect(icpSupplyFlow.target.account.icpAccountIdentifier).toMatch(
      /^[0-9a-f]{64}$/
    );
  });

  test("should build an ICP ledger wallet transfer without broadcasting funds", async () => {
    // given
    const client = new LiquidiumClient();
    const { account, walletAdapter } = createEthereumTestWallet();
    const profileId = await client.accounts.createProfile({
      account,
      chain: Chain.ETH,
      walletAdapter,
    });
    const pools = await client.market.listPools();
    const icpPool = selectIcpPool(pools);
    let capturedTransferRequest: SendIcrcTransferRequest | undefined;

    // when
    const icpSupplyFlow = await client.lending.supply({
      profileId,
      poolId: icpPool.id,
      action: SupplyAction.deposit,
      chain: Chain.ICP,
      amount: ICP_TRANSFER_AMOUNT_E8S,
      account: "icp-sender",
      walletAdapter: {
        sendIcrcTransfer: async (request) => {
          capturedTransferRequest = request;
          return FAKE_ICP_TXID;
        },
      },
    });

    // then
    expect(icpSupplyFlow.txid).toBe(FAKE_ICP_TXID);
    expect(capturedTransferRequest).toMatchObject({
      chain: Chain.ICP,
      asset: Asset.ICP,
      account: "icp-sender",
      actionType: "supply-deposit",
      transfer: {
        ledgerCanisterId: CK_CANISTER_IDS.icp.ledger,
        amount: ICP_TRANSFER_AMOUNT_E8S,
      },
    });

    if (icpSupplyFlow.target.type !== "IcpLedgerAccount") {
      throw new Error("Expected an ICP ledger account supply target");
    }

    expect(capturedTransferRequest?.transfer.to).toEqual(
      icpSupplyFlow.target.account.icpIcrcAccount
    );
  });

  test("should build a ckBTC ledger wallet transfer without broadcasting funds", async () => {
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
    let capturedTransferRequest: SendIcrcTransferRequest | undefined;

    // when
    const ckBtcSupplyFlow = await client.lending.supply({
      profileId,
      poolId: btcPool.id,
      action: SupplyAction.deposit,
      chain: Chain.ICP,
      amount: CK_BTC_TRANSFER_AMOUNT_SATS,
      account: "ck-btc-sender",
      walletAdapter: {
        sendIcrcTransfer: async (request) => {
          capturedTransferRequest = request;
          return FAKE_CK_BTC_TXID;
        },
      },
    });

    // then
    expect(ckBtcSupplyFlow.txid).toBe(FAKE_CK_BTC_TXID);
    expect(capturedTransferRequest).toMatchObject({
      chain: Chain.ICP,
      asset: Asset.BTC,
      account: "ck-btc-sender",
      actionType: "supply-deposit",
      transfer: {
        ledgerCanisterId: CK_CANISTER_IDS.ckBTC.ledger,
        amount: CK_BTC_TRANSFER_AMOUNT_SATS,
      },
    });

    if (ckBtcSupplyFlow.target.type !== "IcrcAccount") {
      throw new Error("Expected a ckBTC ICRC account supply target");
    }

    expect(capturedTransferRequest?.transfer.to).toEqual(
      ckBtcSupplyFlow.target.account
    );
  });

  test("should build a ck stablecoin ledger wallet transfer without broadcasting funds", async () => {
    // given
    const client = new LiquidiumClient();
    const { account, walletAdapter } = createEthereumTestWallet();
    const profileId = await client.accounts.createProfile({
      account,
      chain: Chain.ETH,
      walletAdapter,
    });
    const pools = await client.market.listPools();
    const stablecoinPool = selectBorrowPool(pools);
    let capturedTransferRequest: SendIcrcTransferRequest | undefined;

    // when
    const ckStablecoinSupplyFlow = await client.lending.supply({
      profileId,
      poolId: stablecoinPool.id,
      action: SupplyAction.repayment,
      chain: Chain.ICP,
      amount: CK_STABLECOIN_TRANSFER_AMOUNT_BASE_UNITS,
      account: "ck-stablecoin-sender",
      walletAdapter: {
        sendIcrcTransfer: async (request) => {
          capturedTransferRequest = request;
          return FAKE_CK_STABLECOIN_TXID;
        },
      },
    });

    // then
    expect(ckStablecoinSupplyFlow.txid).toBe(FAKE_CK_STABLECOIN_TXID);
    expect(capturedTransferRequest).toMatchObject({
      chain: Chain.ICP,
      asset: stablecoinPool.asset,
      account: "ck-stablecoin-sender",
      actionType: "supply-repayment",
      transfer: {
        ledgerCanisterId: getExpectedStablecoinLedgerCanisterId(
          stablecoinPool.asset
        ),
        amount: CK_STABLECOIN_TRANSFER_AMOUNT_BASE_UNITS,
      },
    });

    if (ckStablecoinSupplyFlow.target.type !== "IcrcAccount") {
      throw new Error("Expected a ck stablecoin ICRC account supply target");
    }

    expect(capturedTransferRequest?.transfer.to).toEqual(
      ckStablecoinSupplyFlow.target.account
    );
  });

  test("should reject an ETH L1 borrow receiver for an ICP pool", async () => {
    // given
    const client = new LiquidiumClient();
    const pools = await client.market.listPools();
    const icpPool = selectIcpPool(pools);

    // when
    const result = client.lending.prepareBorrow({
      profileId: "aaaaa-aa",
      poolId: icpPool.id,
      amount: ICP_TRANSFER_AMOUNT_E8S,
      chain: Chain.ETH,
      receiver: {
        type: "ChainAddress",
        address: VALID_ETH_L1_ADDRESS,
      },
      signerWalletAddress: VALID_ETH_L1_ADDRESS,
    });

    // then
    await expect(result).rejects.toMatchObject({
      code: LiquidiumErrorCode.VALIDATION_ERROR,
      message: "Target pool does not support this address type",
    });
  });

  test("should reject a BTC L1 withdraw receiver for an ICP pool", async () => {
    // given
    const client = new LiquidiumClient();
    const pools = await client.market.listPools();
    const icpPool = selectIcpPool(pools);

    // when
    const result = client.lending.prepareWithdraw({
      profileId: "aaaaa-aa",
      poolId: icpPool.id,
      amount: ICP_TRANSFER_AMOUNT_E8S,
      chain: Chain.BTC,
      receiver: {
        type: "ChainAddress",
        address: VALID_BTC_L1_ADDRESS,
      },
      signerWalletAddress: VALID_ETH_L1_ADDRESS,
    });

    // then
    await expect(result).rejects.toMatchObject({
      code: LiquidiumErrorCode.VALIDATION_ERROR,
      message: "Target pool does not support this address type",
    });
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

function getExpectedStablecoinLedgerCanisterId(asset: string): string {
  switch (asset) {
    case Asset.USDC:
      return CK_CANISTER_IDS.ckUSDC.ledger;
    case Asset.USDT:
      return CK_CANISTER_IDS.ckUSDT.ledger;
    default:
      throw new Error(`Unsupported stablecoin asset for e2e test: ${asset}`);
  }
}
