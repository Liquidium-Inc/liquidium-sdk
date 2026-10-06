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
  parseAmount,
  parseAssetAmount,
  requireLocalRequest,
} from "./_internal/web-safety.js";
import { createClient } from "./client.js";
import { executeLiquidation } from "./sdk-example.js";

const HOST = "127.0.0.1";
const PORT = 4318;
const ORIGIN = `http://${HOST}:${PORT}`;
const MAX_BODY_BYTES = 2_048;
const HEALTH_FACTOR_THRESHOLD = 1000n;
const REQUEST_TIMEOUT_30_SECONDS_MS = 30_000;
const JSON_HEADERS = {
  "Content-Type": "application/json",
  "Cache-Control": "no-store",
};
const STATIC_FILES: Record<string, [string, string]> = {
  "/": ["index.html", "text/html"],
  "/app.js": ["app.js", "text/javascript"],
  "/style.css": ["style.css", "text/css"],
};

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
    requiredEnvironment("LIQUIDIUM_LENDING_CANISTER_ID")
  );
  const borrowerProfileId = Principal.fromText(
    requiredEnvironment("LIQUIDATION_BORROWER_PROFILE_ID")
  ).toText();
  const debtAsset = requiredEnvironment("LIQUIDATION_DEBT_ASSET");
  const collateralAsset = requiredEnvironment("LIQUIDATION_COLLATERAL_ASSET");
  if (debtAsset === collateralAsset)
    throw new Error("Choose different debt and collateral assets.");
  const maximumDebtAmount = parseAmount(
    requiredEnvironment("LIQUIDATION_DEBT_AMOUNT_BASE_UNITS"),
    1n
  );
  const identity = Secp256k1KeyIdentity.fromPem(
    await readFile(requiredEnvironment("LIQUIDATOR_IDENTITY_PEM_PATH"), "utf8")
  );
  const principal = identity.getPrincipal();
  const agent = await HttpAgent.create({
    host: "https://icp-api.io",
    identity,
  });
  const client = createClient({
    agent,
    lendingCanisterId: lendingCanisterId.toText(),
  });
  const lending = Actor.createActor<LendingQueries>(
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
  const csrfToken = randomBytes(32).toString("hex");
  let isBusy = false;
  let submitted = false;
  let result: LiquidationResult | undefined;

  async function snapshot() {
    const [pools, records, positions, health, liquidators] = await Promise.all([
      client.market.listPools(),
      lending.list_pools(),
      client.positions.listPositions(borrowerProfileId),
      client.positions.getHealthFactor(borrowerProfileId),
      lending.get_liquidators(),
    ]);
    const debtPool = pools.find((pool) => pool.asset === debtAsset);
    const collateralPool = pools.find((pool) => pool.asset === collateralAsset);
    if (!debtPool || !collateralPool)
      throw new Error("Configured debt or collateral pool is unavailable.");
    const record = records.find(
      (pool) => pool.principal.toText() === debtPool.id
    );
    if (!record || !("CkAsset" in record.asset_type))
      throw new Error("Debt pool has no ICRC ledger.");
    const ledgerId = record.asset_type.CkAsset;
    const ledger = IcrcLedgerCanister.create({ agent, canisterId: ledgerId });
    const [balance, fee] = await Promise.all([
      ledger.balance({ owner: principal }),
      ledger.transactionFee({}),
    ]);
    const liquidatorBalances = await Promise.all(
      pools.map(async (pool): Promise<LiquidatorBalance> => {
        const poolRecord = records.find(
          (record) => record.principal.toText() === pool.id
        );
        const ledgerPrincipal =
          poolRecord && "CkAsset" in poolRecord.asset_type
            ? poolRecord.asset_type.CkAsset
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
          const amount =
            ledgerCanisterId === ledgerId.toText()
              ? balance
              : await IcrcLedgerCanister.create({
                  agent,
                  canisterId: ledgerPrincipal,
                }).balance({ owner: principal });
          return {
            asset,
            decimals: pool.decimals,
            ledgerCanisterId,
            amount,
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
    if (result) result = await client.liquidations.getLiquidation(result.id);
    const debtPosition = positions.find(
      (position) => position.poolId === debtPool.id
    );
    const collateralPosition = positions.find(
      (position) => position.poolId === collateralPool.id
    );
    return {
      csrfToken,
      borrowerProfileId,
      liquidatorPrincipal: principal.toText(),
      lendingCanisterId: lendingCanisterId.toText(),
      debtAsset,
      collateralAsset,
      debtPool,
      collateralPool,
      ledgerCanisterId: ledgerId.toText(),
      balance,
      liquidatorBalances,
      fee,
      positions,
      health,
      eligible:
        health.healthFactor !== null &&
        health.healthFactor < HEALTH_FACTOR_THRESHOLD,
      debtPosition,
      collateralPosition,
      maximumDebtAmount,
      submitted,
      result,
      allowlisted: liquidators.some(
        (value) => value.toText() === principal.toText()
      ),
      defaultMinCollateralAmount:
        process.env.LIQUIDATION_MIN_COLLATERAL_AMOUNT_BASE_UNITS ?? "0",
    };
  }

  async function handle(
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
      if (request.method === "GET" && STATIC_FILES[path]) {
        const [file, contentType] = STATIC_FILES[path];
        response.writeHead(200, {
          "Content-Type": contentType,
          "Cache-Control": "no-store",
        });
        response.end(await readFile(new URL(`../ui/${file}`, import.meta.url)));
        return;
      }
      if (request.method === "GET" && path === "/api/state") {
        respond(response, 200, await snapshot());
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
      if (isBusy || submitted) {
        respond(response, 409, {
          error:
            "An action is pending or a liquidation was already submitted. Check status before restarting the server.",
        });
        return;
      }
      isBusy = true;
      try {
        const body = await readBody(request);
        const state = await snapshot();
        const debtAmount = parseAssetAmount(
          body.debtAmount,
          state.debtPool.decimals,
          debtAsset,
          maximumDebtAmount
        );
        const minCollateralAmount = parseAssetAmount(
          body.minCollateralAmount,
          state.collateralPool.decimals,
          collateralAsset
        );
        if (!state.eligible)
          throw new Error(
            "This borrower is not liquidatable. Refresh after the test price changes."
          );
        if (
          !state.debtPosition ||
          state.debtPosition.borrowed < debtAmount ||
          !state.collateralPosition ||
          state.collateralPosition.deposited <= 0n
        ) {
          throw new Error(
            "This borrower does not have the selected debt and collateral."
          );
        }
        // ponytail: one submission per server session; restart only after reconciling uncertain outcomes.
        submitted = true;
        result = await executeLiquidation({
          client,
          borrowerProfileId,
          debtPoolId: state.debtPool.id,
          collateralPoolId: state.collateralPool.id,
          debtAmount,
          receiverPrincipal: principal.toText(),
          minCollateralAmount,
        });
        respond(response, 200, result);
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
    void handle(request, response);
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

function requiredEnvironment(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required.`);
  return value;
}

function respond(
  response: ServerResponse,
  status: number,
  body: unknown
): void {
  response.writeHead(status, JSON_HEADERS);
  response.end(
    JSON.stringify(body, (_, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
}

async function readBody(request: IncomingMessage): Promise<ActionBody> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of request) {
    const buffer = Buffer.from(chunk);
    size += buffer.length;
    if (size > MAX_BODY_BYTES) throw new Error("Request body is too large.");
    chunks.push(buffer);
  }
  const body: unknown = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  if (!body || typeof body !== "object" || Array.isArray(body))
    throw new Error("Invalid request body.");
  return body;
}

main().catch((error) => {
  console.error(
    error instanceof Error ? error.message : "Server startup failed."
  );
  process.exitCode = 1;
});
