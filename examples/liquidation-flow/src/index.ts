import { readFile } from "node:fs/promises";
import { HttpAgent } from "@icp-sdk/core/agent";
import { Secp256k1KeyIdentity } from "@icp-sdk/core/identity/secp256k1";
import { Principal } from "@icp-sdk/core/principal";
import { Asset } from "@liquidium/client";
import { createClient } from "./client";
import {
  approveLiquidationAllowance,
  executeLiquidation,
  findLiquidationCandidate,
} from "./sdk-example";

const ICP_HOST = "https://icp-api.io";
const MINIMUM_DEBT_AMOUNT = 1n;
const MINIMUM_COLLATERAL_AMOUNT = 0n;
const SUPPORTED_DEBT_ASSETS = new Set<string>(Object.values(Asset));

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
  const client = createClient({
    agent,
    lendingCanisterId: lendingCanisterId.toText(),
  });
  const { candidate, debtPosition, collateralPosition } =
    await findLiquidationCandidate({ client, debtAsset, debtAmount });

  if (debtPosition.assetType.type !== "ck_asset") {
    throw new Error("Selected debt position has no ICRC ledger canister id");
  }

  const debtLedgerCanisterId = debtPosition.assetType.ledgerCanisterId;
  const { debtLedgerFee, approvedAllowanceAmount, approvalBlockIndex } =
    await approveLiquidationAllowance({
      agent,
      debtLedgerCanisterId,
      lendingCanisterId,
      debtAmount,
    });
  const liquidation = await executeLiquidation({
    client,
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
