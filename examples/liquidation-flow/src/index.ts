import { readFile } from "node:fs/promises";
import { IcrcLedgerCanister } from "@icp-sdk/canisters/ledger/icrc";
import { HttpAgent } from "@icp-sdk/core/agent";
import { Secp256k1KeyIdentity } from "@icp-sdk/core/identity/secp256k1";
import { Principal } from "@icp-sdk/core/principal";
import {
  Asset,
  type LiquidationCandidate,
  type LiquidationCandidatePosition,
  LiquidiumClient,
} from "@liquidium/client";

const ICP_HOST = "https://icp-api.io";
const SCAN_LIMIT = 100n;
const MAX_RESULTS = 20n;
const MINIMUM_DEBT_AMOUNT = 1n;
const MINIMUM_COLLATERAL_AMOUNT = 0n;
const SUPPORTED_DEBT_ASSETS = new Set<string>(Object.values(Asset));

interface SelectedLiquidationCandidate {
  candidate: LiquidationCandidate;
  debtPosition: LiquidationCandidatePosition;
  collateralPosition: LiquidationCandidatePosition;
}

async function main(): Promise<void> {
  const identityPemPath = getRequiredEnvironmentVariable(
    "LIQUIDATOR_IDENTITY_PEM_PATH"
  );
  const lendingCanisterId = parsePrincipalEnvironmentVariable(
    "LIQUIDIUM_LENDING_CANISTER_ID"
  );
  const debtAsset = getRequiredEnvironmentVariable("LIQUIDATION_DEBT_ASSET");
  const debtAmount = parseBigIntEnvironmentVariable(
    "LIQUIDATION_DEBT_AMOUNT_BASE_UNITS",
    MINIMUM_DEBT_AMOUNT
  );
  const minCollateralAmount = parseBigIntEnvironmentVariable(
    "LIQUIDATION_MIN_COLLATERAL_AMOUNT_BASE_UNITS",
    MINIMUM_COLLATERAL_AMOUNT
  );

  if (!SUPPORTED_DEBT_ASSETS.has(debtAsset)) {
    throw new Error(
      `LIQUIDATION_DEBT_ASSET must be one of ${[...SUPPORTED_DEBT_ASSETS].join(", ")}`
    );
  }

  const identityPem = await readFile(identityPemPath, "utf8");
  const identity = Secp256k1KeyIdentity.fromPem(identityPem);
  const agent = await HttpAgent.create({ host: ICP_HOST, identity });
  const client = new LiquidiumClient({
    agent,
    canisterIds: { lending: lendingCanisterId.toText() },
  });
  const { candidate, debtPosition, collateralPosition } =
    await findLiquidationCandidate(client, debtAsset, debtAmount);

  if (debtPosition.assetType.type !== "ck_asset") {
    throw new Error("Selected debt position has no ICRC ledger canister id");
  }

  const debtLedgerCanisterId = debtPosition.assetType.ledgerCanisterId;

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
  const liquidation = await client.liquidations.liquidate({
    borrowerProfileId: candidate.borrowerProfileId,
    debtPoolId: debtPosition.poolId,
    collateralPoolId: collateralPosition.poolId,
    debtAmount,
    receiverPrincipal: identity.getPrincipal().toText(),
    minCollateralAmount,
  });

  console.log({
    liquidatorPrincipal: identity.getPrincipal().toText(),
    borrowerProfileId: candidate.borrowerProfileId,
    debtAsset: debtPosition.asset,
    collateralAsset: collateralPosition.asset,
    debtLedgerCanisterId,
    debtLedgerFee,
    approvedAllowanceAmount,
    approvalBlockIndex,
    liquidationId: liquidation.id,
    liquidationStatus: liquidation.status,
  });
}

async function findLiquidationCandidate(
  client: LiquidiumClient,
  debtAsset: string,
  debtAmount: bigint
): Promise<SelectedLiquidationCandidate> {
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

function getRequiredEnvironmentVariable(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
}

function parsePrincipalEnvironmentVariable(name: string): Principal {
  const value = getRequiredEnvironmentVariable(name);

  try {
    return Principal.fromText(value);
  } catch {
    throw new Error(`${name} must be a valid principal`);
  }
}

function parseBigIntEnvironmentVariable(name: string, minimum: bigint): bigint {
  const value = getRequiredEnvironmentVariable(name);
  let parsedValue: bigint;

  try {
    parsedValue = BigInt(value);
  } catch {
    throw new Error(`${name} must be an integer`);
  }

  if (parsedValue < minimum) {
    throw new Error(`${name} must be at least ${minimum}`);
  }

  return parsedValue;
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
