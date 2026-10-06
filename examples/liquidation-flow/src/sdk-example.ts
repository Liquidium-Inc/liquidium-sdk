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
