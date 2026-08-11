import { IcrcLedgerCanister } from "@icp-sdk/canisters/ledger/icrc";
import type { HttpAgent } from "@icp-sdk/core/agent";
import { Principal } from "@icp-sdk/core/principal";
import type {
  LiquidationCandidate,
  LiquidationCandidatePosition,
  LiquidationResult,
  LiquidiumClient,
} from "@liquidium/client";

const SCAN_LIMIT = 100n;
const MAX_RESULTS = 20n;

interface FindLiquidationCandidateParams {
  client: LiquidiumClient;
  debtAsset: string;
  debtAmount: bigint;
}

interface SelectedLiquidationCandidate {
  candidate: LiquidationCandidate;
  debtPosition: LiquidationCandidatePosition;
  collateralPosition: LiquidationCandidatePosition;
}

interface ApproveLiquidationAllowanceParams {
  agent: HttpAgent;
  debtLedgerCanisterId: string;
  lendingCanisterId: Principal;
  debtAmount: bigint;
}

interface LiquidationAllowanceApproval {
  debtLedgerFee: bigint;
  approvedAllowanceAmount: bigint;
  approvalBlockIndex: bigint;
}

interface ExecuteLiquidationParams {
  client: LiquidiumClient;
  borrowerProfileId: string;
  debtPoolId: string;
  collateralPoolId: string;
  debtAmount: bigint;
  receiverPrincipal: string;
  minCollateralAmount: bigint;
}

export async function findLiquidationCandidate({
  client,
  debtAsset,
  debtAmount,
}: FindLiquidationCandidateParams): Promise<SelectedLiquidationCandidate> {
  let cursor: string | undefined;

  do {
    const page = await client.liquidations.scan({
      cursor,
      scanLimit: SCAN_LIMIT,
      maxResults: MAX_RESULTS,
    });

    for (const candidate of page.candidates) {
      const debtPosition = candidate.positions.find(
        (position) =>
          position.asset === debtAsset &&
          position.debtAmount >= debtAmount &&
          position.assetType.type === "ck_asset"
      );

      if (!debtPosition) {
        continue;
      }

      const collateralPosition = candidate.positions.find(
        (position) =>
          position.poolId !== debtPosition.poolId &&
          position.collateralAmount > 0n
      );

      if (collateralPosition) {
        return { candidate, debtPosition, collateralPosition };
      }
    }

    cursor = page.nextCursor;
  } while (cursor !== undefined);

  throw new Error(`No liquidation candidate found for ${debtAsset}`);
}

export async function approveLiquidationAllowance({
  agent,
  debtLedgerCanisterId,
  lendingCanisterId,
  debtAmount,
}: ApproveLiquidationAllowanceParams): Promise<LiquidationAllowanceApproval> {
  const debtLedger = IcrcLedgerCanister.create({
    agent,
    canisterId: Principal.fromText(debtLedgerCanisterId),
  });
  const debtLedgerFee = await debtLedger.transactionFee({});
  const approvedAllowanceAmount = debtAmount + debtLedgerFee;
  const approvalBlockIndex = await debtLedger.approve({
    amount: approvedAllowanceAmount,
    spender: { owner: lendingCanisterId, subaccount: [] },
  });

  return { debtLedgerFee, approvedAllowanceAmount, approvalBlockIndex };
}

export async function executeLiquidation({
  client,
  borrowerProfileId,
  debtPoolId,
  collateralPoolId,
  debtAmount,
  receiverPrincipal,
  minCollateralAmount,
}: ExecuteLiquidationParams): Promise<LiquidationResult> {
  return await client.liquidations.liquidate({
    borrowerProfileId,
    debtPoolId,
    collateralPoolId,
    debtAmount,
    receiverPrincipal,
    minCollateralAmount,
  });
}
