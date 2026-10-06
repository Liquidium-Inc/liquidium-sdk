import assert from "node:assert/strict";
import { test } from "node:test";
import {
  type ExecuteLiquidationRequest,
  type LiquidationCandidate,
  type LiquidationCandidatePosition,
  type LiquidationResult,
  LiquidiumClient,
} from "@liquidium/client";
import {
  executeLiquidation,
  findLiquidationCandidate,
} from "../sdk-example.js";

test("selects positive debt below the offer cap and submits the configured offer", async () => {
  // given
  const offerAmountBaseUnits = 1_000_000n;
  const outstandingDebtBaseUnits = 900_000n;
  const zeroAmountBaseUnits = 0n;
  const collateralAmountBaseUnits = 1n;
  const zeroBasisPoints = 0n;
  const healthFactor = 900n;
  const totalDebtUsdRay = 10n ** 27n;
  const scannedAccounts = 1n;

  const debtPosition: LiquidationCandidatePosition = {
    poolId: "debt-pool",
    asset: "USDT",
    assetType: { type: "ck_asset", ledgerCanisterId: "debt-ledger" },
    collateralAmount: zeroAmountBaseUnits,
    debtAmount: outstandingDebtBaseUnits,
    liquidationBonusBps: zeroBasisPoints,
    liquidationThresholdBps: zeroBasisPoints,
    protocolFeeBps: zeroBasisPoints,
  };

  const emptyDebtPosition = {
    ...debtPosition,
    debtAmount: zeroAmountBaseUnits,
  };

  const collateralPosition: LiquidationCandidatePosition = {
    ...debtPosition,
    poolId: "collateral-pool",
    asset: "BTC",
    collateralAmount: collateralAmountBaseUnits,
    debtAmount: zeroAmountBaseUnits,
  };

  const candidate: LiquidationCandidate = {
    borrowerProfileId: "borrower",
    healthFactor,
    totalDebtUsd: totalDebtUsdRay,
    weightedLiquidationThresholdBps: zeroBasisPoints,
    positions: [emptyDebtPosition, debtPosition, collateralPosition],
  };

  const liquidationId = 42n;
  const timestampSeconds = 1n;

  const liquidationResult: LiquidationResult = {
    id: liquidationId,
    timestamp: timestampSeconds,
    amounts: {
      debtRepaid: zeroAmountBaseUnits,
      collateralReceived: zeroAmountBaseUnits,
    },
    debtAsset: debtPosition.assetType,
    collateralAsset: collateralPosition.assetType,
    status: { state: "pending" },
    changeTx: { state: "pending" },
    collateralTx: { state: "pending" },
  };

  const client = new LiquidiumClient();
  const submittedRequests: ExecuteLiquidationRequest[] = [];
  client.liquidations.scan = async () => ({
    candidates: [candidate],
    scanned: scannedAccounts,
  });
  client.liquidations.liquidate = async (request) => {
    submittedRequests.push(request);

    return liquidationResult;
  };

  // when
  const selected = await findLiquidationCandidate({
    client,
    debtAsset: "USDT",
  });

  const result = await executeLiquidation({
    client,
    borrowerProfileId: selected.candidate.borrowerProfileId,
    debtPoolId: selected.debtPosition.poolId,
    collateralPoolId: selected.collateralPosition.poolId,
    debtAmount: offerAmountBaseUnits,
    receiverPrincipal: "liquidator",
    minCollateralAmount: zeroAmountBaseUnits,
  });

  // then
  const EXPECTED_SUBMISSION_COUNT = 1;

  assert.equal(selected.debtPosition, debtPosition);
  assert.equal(selected.collateralPosition, collateralPosition);
  assert.equal(submittedRequests.length, EXPECTED_SUBMISSION_COUNT);
  assert.equal(submittedRequests[0]?.debtAmount, offerAmountBaseUnits);
  assert.equal(result, liquidationResult);
});
