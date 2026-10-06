import { randomBytes } from "node:crypto";
import { readFile } from "node:fs/promises";
import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from "node:http";
import { IcrcLedgerCanister } from "@icp-sdk/canisters/ledger/icrc";
import { Actor, HttpAgent } from "@icp-sdk/core/agent";
import { IDL } from "@icp-sdk/core/candid";
import { Secp256k1KeyIdentity } from "@icp-sdk/core/identity/secp256k1";
import { Principal } from "@icp-sdk/core/principal";
import type { LiquidationResult } from "@liquidium/client";
import {
  parseAssetAmountToBaseUnits,
  parseBaseUnitAmount,
  requireLocalRequest,
} from "./_internal/web-safety.js";
import { createClient } from "./client.js";
import { executeLiquidation } from "./sdk-example.js";

const HOST = "127.0.0.1";

const PORT = 4318;

const ORIGIN = `http://${HOST}:${PORT}`;

const ICP_HOST = "https://icp-api.io";

const MAX_BODY_BYTES = 2_048;

const CSRF_TOKEN_BYTES = 32;

const MINIMUM_DEBT_AMOUNT_BASE_UNITS = 1n;

const HEALTH_FACTOR_THRESHOLD = 1000n;

const REQUEST_TIMEOUT_30_SECONDS_MS = 30_000;

const JSON_HEADERS = {
  "Content-Type": "application/json",
  "Cache-Control": "no-store",
};

const STATIC_FILES = new Map([
  ["/", { fileName: "index.html", contentType: "text/html" }],
  ["/app.js", { fileName: "app.js", contentType: "text/javascript" }],
  ["/style.css", { fileName: "style.css", contentType: "text/css" }],
]);

interface PoolLedgerRecord {
  principal: Principal;
  asset_type: { CkAsset: Principal } | { Unknown: null };
}

interface LendingQueries {
  list_pools(): Promise<PoolLedgerRecord[]>;
  get_liquidators(): Promise<Principal[]>;
}

interface ActionBody {
  debtAmount?: unknown;
  minCollateralAmount?: unknown;
}

interface LiquidatorBalance {
  asset: string;
  decimals: bigint;
  ledgerCanisterId: string | null;
  amount: bigint | null;
  error: string | null;
}

async function main(): Promise<void> {
  const lendingCanisterId = Principal.fromText(
    getRequiredEnvironmentVariable("LIQUIDIUM_LENDING_CANISTER_ID")
  );

  const borrowerProfileId = Principal.fromText(
    getRequiredEnvironmentVariable("LIQUIDATION_BORROWER_PROFILE_ID")
  ).toText();

  const debtAsset = getRequiredEnvironmentVariable("LIQUIDATION_DEBT_ASSET");

  const collateralAsset = getRequiredEnvironmentVariable(
    "LIQUIDATION_COLLATERAL_ASSET"
  );

  if (debtAsset === collateralAsset) {
    throw new Error("Choose different debt and collateral assets.");
  }

  const maximumDebtAmountBaseUnits = parseBaseUnitAmount(
    getRequiredEnvironmentVariable("LIQUIDATION_DEBT_AMOUNT_BASE_UNITS"),
    MINIMUM_DEBT_AMOUNT_BASE_UNITS
  );

  const identity = Secp256k1KeyIdentity.fromPem(
    await readFile(
      getRequiredEnvironmentVariable("LIQUIDATOR_IDENTITY_PEM_PATH"),
      "utf8"
    )
  );

  const liquidatorPrincipal = identity.getPrincipal();

  const agent = await HttpAgent.create({
    host: ICP_HOST,
    identity,
  });

  const client = createClient({
    agent,
    lendingCanisterId: lendingCanisterId.toText(),
  });

  const lendingActor = Actor.createActor<LendingQueries>(
    () =>
      IDL.Service({
        list_pools: IDL.Func(
          [],
          [
            IDL.Vec(
              IDL.Record({
                principal: IDL.Principal,
                asset_type: IDL.Variant({
                  CkAsset: IDL.Principal,
                  Unknown: IDL.Null,
                }),
              })
            ),
          ],
          ["query"]
        ),
        get_liquidators: IDL.Func([], [IDL.Vec(IDL.Principal)], ["query"]),
      }),
    { agent, canisterId: lendingCanisterId }
  );

  const csrfToken = randomBytes(CSRF_TOKEN_BYTES).toString("hex");
  let isBusy = false;
  let hasSubmittedLiquidation = false;
  let liquidationResult: LiquidationResult | undefined;

  async function getSnapshot() {
    const [pools, poolLedgerRecords, positions, health, liquidators] =
      await Promise.all([
        client.market.listPools(),
        lendingActor.list_pools(),
        client.positions.listPositions(borrowerProfileId),
        client.positions.getHealthFactor(borrowerProfileId),
        lendingActor.get_liquidators(),
      ]);

    const debtPool = pools.find((pool) => pool.asset === debtAsset);
    const collateralPool = pools.find((pool) => pool.asset === collateralAsset);

    if (!debtPool || !collateralPool) {
      throw new Error("Configured debt or collateral pool is unavailable.");
    }

    const debtPoolLedgerRecord = poolLedgerRecords.find(
      (pool) => pool.principal.toText() === debtPool.id
    );

    if (
      !debtPoolLedgerRecord ||
      !("CkAsset" in debtPoolLedgerRecord.asset_type)
    ) {
      throw new Error("Debt pool has no ICRC ledger.");
    }

    const debtLedgerPrincipal = debtPoolLedgerRecord.asset_type.CkAsset;

    const debtLedger = IcrcLedgerCanister.create({
      agent,
      canisterId: debtLedgerPrincipal,
    });

    const [balanceBaseUnits, ledgerFeeBaseUnits] = await Promise.all([
      debtLedger.balance({ owner: liquidatorPrincipal }),
      debtLedger.transactionFee({}),
    ]);

    const liquidatorBalances = await Promise.all(
      pools.map(async (pool): Promise<LiquidatorBalance> => {
        const poolLedgerRecord = poolLedgerRecords.find(
          (poolRecord) => poolRecord.principal.toText() === pool.id
        );

        const ledgerPrincipal =
          poolLedgerRecord && "CkAsset" in poolLedgerRecord.asset_type
            ? poolLedgerRecord.asset_type.CkAsset
            : undefined;

        const asset = pool.asset === "ICP" ? "ICP" : `ck${pool.asset}`;

        if (!ledgerPrincipal) {
          return {
            asset,
            decimals: pool.decimals,
            ledgerCanisterId: null,
            amount: null,
            error: "No supported ledger is configured for this pool.",
          };
        }

        const ledgerCanisterId = ledgerPrincipal.toText();

        try {
          const amountBaseUnits =
            ledgerCanisterId === debtLedgerPrincipal.toText()
              ? balanceBaseUnits
              : await IcrcLedgerCanister.create({
                  agent,
                  canisterId: ledgerPrincipal,
                }).balance({ owner: liquidatorPrincipal });

          return {
            asset,
            decimals: pool.decimals,
            ledgerCanisterId,
            amount: amountBaseUnits,
            error: null,
          };
        } catch (error) {
          return {
            asset,
            decimals: pool.decimals,
            ledgerCanisterId,
            amount: null,
            error:
              error instanceof Error
                ? error.message
                : "Balance query failed. Refresh to try again.",
          };
        }
      })
    );

    if (liquidationResult) {
      liquidationResult = await client.liquidations.getLiquidation(
        liquidationResult.id
      );
    }

    const debtPosition = positions.find(
      (position) => position.poolId === debtPool.id
    );

    const collateralPosition = positions.find(
      (position) => position.poolId === collateralPool.id
    );

    return {
      csrfToken,
      borrowerProfileId,
      liquidatorPrincipal: liquidatorPrincipal.toText(),
      lendingCanisterId: lendingCanisterId.toText(),
      debtAsset,
      collateralAsset,
      debtPool,
      collateralPool,
      ledgerCanisterId: debtLedgerPrincipal.toText(),
      balance: balanceBaseUnits,
      liquidatorBalances,
      fee: ledgerFeeBaseUnits,
      positions,
      health,
      eligible:
        health.healthFactor !== null &&
        health.healthFactor < HEALTH_FACTOR_THRESHOLD,
      debtPosition,
      collateralPosition,
      maximumDebtAmount: maximumDebtAmountBaseUnits,
      submitted: hasSubmittedLiquidation,
      result: liquidationResult,
      allowlisted: liquidators.some(
        (registeredLiquidator) =>
          registeredLiquidator.toText() === liquidatorPrincipal.toText()
      ),
      defaultMinCollateralAmount:
        process.env.LIQUIDATION_MIN_COLLATERAL_AMOUNT_BASE_UNITS ?? "0",
    };
  }

  async function handleRequest(
    request: IncomingMessage,
    response: ServerResponse
  ): Promise<void> {
    try {
      requireLocalRequest(request.headers.host, request.headers.origin, ORIGIN);
      response.setHeader(
        "Content-Security-Policy",
        "default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'"
      );
      response.setHeader("X-Content-Type-Options", "nosniff");
      response.setHeader("Referrer-Policy", "no-referrer");
      const path = new URL(request.url ?? "/", ORIGIN).pathname;
      const staticFile = STATIC_FILES.get(path);

      if (request.method === "GET" && staticFile) {
        response.writeHead(200, {
          "Content-Type": staticFile.contentType,
          "Cache-Control": "no-store",
        });
        response.end(
          await readFile(
            new URL(`../ui/${staticFile.fileName}`, import.meta.url)
          )
        );

        return;
      }

      if (request.method === "GET" && path === "/api/state") {
        respond(response, 200, await getSnapshot());

        return;
      }

      if (request.method !== "POST" || path !== "/api/liquidate") {
        respond(response, 404, { error: "Not found." });

        return;
      }

      if (
        request.headers.origin !== ORIGIN ||
        request.headers["x-csrf-token"] !== csrfToken ||
        request.headers["content-type"] !== "application/json"
      ) {
        respond(response, 403, {
          error: "Request rejected. Reload this local UI.",
        });

        return;
      }

      if (isBusy || hasSubmittedLiquidation) {
        respond(response, 409, {
          error:
            "An action is pending or a liquidation was already submitted. Check status before restarting the server.",
        });

        return;
      }

      isBusy = true;

      try {
        const actionBody = await readActionBody(request);
        const snapshot = await getSnapshot();

        const debtAmountBaseUnits = parseAssetAmountToBaseUnits(
          actionBody.debtAmount,
          snapshot.debtPool.decimals,
          debtAsset,
          maximumDebtAmountBaseUnits
        );

        const minCollateralAmountBaseUnits = parseAssetAmountToBaseUnits(
          actionBody.minCollateralAmount,
          snapshot.collateralPool.decimals,
          collateralAsset
        );

        if (!snapshot.eligible) {
          throw new Error(
            "This borrower is not liquidatable. Refresh after the test price changes."
          );
        }

        if (
          !snapshot.debtPosition ||
          snapshot.debtPosition.borrowed <= 0n ||
          !snapshot.collateralPosition ||
          snapshot.collateralPosition.deposited <= 0n
        ) {
          throw new Error(
            "This borrower does not have the selected debt and collateral."
          );
        }

        // ponytail: one submission per server session; restart only after reconciling uncertain outcomes.
        hasSubmittedLiquidation = true;
        liquidationResult = await executeLiquidation({
          client,
          borrowerProfileId,
          debtPoolId: snapshot.debtPool.id,
          collateralPoolId: snapshot.collateralPool.id,
          debtAmount: debtAmountBaseUnits,
          receiverPrincipal: liquidatorPrincipal.toText(),
          minCollateralAmount: minCollateralAmountBaseUnits,
        });
        respond(response, 200, liquidationResult);
      } finally {
        isBusy = false;
      }
    } catch (error) {
      respond(response, 400, {
        error: error instanceof Error ? error.message : "Request failed.",
      });
    }
  }

  const server = createServer((request, response) => {
    void handleRequest(request, response);
  });

  server.requestTimeout = REQUEST_TIMEOUT_30_SECONDS_MS;
  server.on("error", (error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
  server.listen(PORT, HOST, () =>
    console.log(
      `Liquidation UI: ${ORIGIN}\nBorrower locked to ${borrowerProfileId}\nConfirm execution to let the SDK approve if needed and liquidate.`
    )
  );
}

function getRequiredEnvironmentVariable(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is required.`);
  }

  return value;
}

function respond<T>(
  response: ServerResponse,
  statusCode: number,
  body: T
): void {
  response.writeHead(statusCode, JSON_HEADERS);
  response.end(
    JSON.stringify(body, (_, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
}

async function readActionBody(request: IncomingMessage): Promise<ActionBody> {
  const bodyChunks: Buffer[] = [];
  let bodySizeBytes = 0;

  for await (const chunk of request) {
    const buffer = Buffer.from(chunk);
    bodySizeBytes += buffer.length;

    if (bodySizeBytes > MAX_BODY_BYTES) {
      throw new Error("Request body is too large.");
    }

    bodyChunks.push(buffer);
  }

  const body: unknown = JSON.parse(Buffer.concat(bodyChunks).toString("utf8"));

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new Error("Invalid request body.");
  }

  return body;
}

main().catch((error) => {
  console.error(
    error instanceof Error ? error.message : "Server startup failed."
  );
  process.exitCode = 1;
});
