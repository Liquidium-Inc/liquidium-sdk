import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import {
  parseAssetAmountToBaseUnits,
  parseBaseUnitAmount,
  requireLocalRequest,
} from "./web-safety.js";

interface BrowserEvent {
  preventDefault(): void;
}

type BrowserEventHandler = (event?: BrowserEvent) => void | Promise<void>;

interface BrowserElement {
  value: string;
  dataset: { state?: string; error?: string };
  textContent: string;
  disabled: boolean;
  open: boolean;
  addEventListener(eventName: string, handler: BrowserEventHandler): void;
  replaceChildren(): void;
  scrollIntoView(): void;
  showModal(): void;
  close(): void;
}

interface SubmittedRequest {
  path: string;
  body: string;
  headers: { "x-csrf-token": string };
}

interface BrowserRequestOptions {
  method?: string;
  body: string;
  headers: SubmittedRequest["headers"];
}

interface BrowserTransfer {
  state: string;
  txid?: string;
}

test("confirms liquidation only after the lifecycle and both transfers succeed", () => {
  // given
  const browserCode = readFileSync(
    new URL("../../ui/app.js", import.meta.url),
    "utf8"
  );

  const cases = [
    {
      status: "success",
      collateral: "success",
      change: "success",
      expected: "confirmed",
    },
    {
      status: "success",
      collateral: "pending",
      change: "success",
      expected: "pending",
    },
    {
      status: "core_executed",
      collateral: "success",
      change: "success",
      expected: "pending",
    },
    {
      status: "success",
      collateral: "success",
      change: "pending",
      expected: "pending",
    },
    {
      status: "failed_liquidation",
      collateral: "pending",
      change: "success",
      expected: "failed",
    },
    {
      status: "failed_liquidation",
      collateral: "success",
      change: "pending",
      expected: "refund_pending",
    },
    {
      status: "failed_liquidation",
      collateral: "success",
      change: "success",
      expected: "refund_complete",
    },
    {
      status: "failed_liquidation",
      collateral: "success",
      change: "failed",
      expected: "failed",
    },
    {
      status: "success",
      collateral: "failed",
      change: "success",
      expected: "failed",
    },
    {
      status: "change_transfer_failed",
      collateral: "success",
      change: "failed",
      expected: "failed",
    },
  ];

  const document = createBrowserDocument();

  // when
  const results = runInNewContext(
    `${browserCode}\ncases.map(testCase => getResultState({status: {state: testCase.status}, collateralTx: {state: testCase.collateral}, changeTx: {state: testCase.change}})).join(",")`,
    {
      document,
      cases,
      clearTimeout,
      fetch: () => new Promise(() => {}),
    }
  );

  // then
  assert.equal(results, cases.map((testCase) => testCase.expected).join(","));
});

test("reviews without spending and sends one liquidation request only after confirmation", async () => {
  // given
  const browserCode = readFileSync(
    new URL("../../ui/app.js", import.meta.url),
    "utf8"
  );

  const document = createBrowserDocument();

  const debtAmountText = "1";
  const minCollateralAmountText = "0.00001";

  const liquidation = {
    id: "42",
    timestamp: "1791201050",
    amounts: { debtRepaid: "1000000", collateralReceived: "20888" },
    status: { state: "success" },
    collateralTx: { state: "success" },
    changeTx: { state: "success" },
  };

  let liquidationResult: typeof liquidation | undefined;

  const snapshot = {
    csrfToken: "test-token",
    eligible: true,
    submitted: false,
    get result() {
      return liquidationResult;
    },
    debtAsset: "USDT",
    collateralAsset: "BTC",
    borrowerProfileId: "test-borrower",
    debtPool: { decimals: "6" },
    collateralPool: { decimals: "8" },
    liquidatorBalances: [],
    positions: [],
    liquidatorPrincipal: "test-liquidator",
    health: { healthFactor: "237", healthFactorDecimals: "3" },
    balance: "3000000",
    fee: "10000",
    maximumDebtAmount: "1000000",
    defaultMinCollateralAmount: "0",
  };

  const submittedRequests: SubmittedRequest[] = [];

  const fetch = async (path: string, options: BrowserRequestOptions) => {
    if (options.method === "POST") {
      submittedRequests.push({
        path,
        body: options.body,
        headers: options.headers,
      });
      snapshot.submitted = true;
      liquidationResult = liquidation;

      return { ok: true, json: async () => liquidation };
    }

    return { ok: true, json: async () => snapshot };
  };

  await runInNewContext(`${browserCode}\nrefresh()`, {
    document,
    fetch,
    clearTimeout,
  });
  document.getElementById("debt").value = debtAmountText;
  document.getElementById("minimum").value = minCollateralAmountText;
  const submit = document.eventHandlers.get("action-form:submit");
  const confirm = document.eventHandlers.get("confirm:click");
  const cancel = document.eventHandlers.get("cancel:click");
  assert.ok(submit && confirm && cancel);

  // when
  submit({ preventDefault() {} });
  const isReviewEnabled = !document.getElementById("execute").disabled;
  const isReviewOpen = document.getElementById("confirmation").open;
  const requestsAfterReview = submittedRequests.length;
  cancel();
  await confirm();
  const requestsAfterCancel = submittedRequests.length;
  submit({ preventDefault() {} });
  const pendingSubmission = confirm();
  await confirm();
  await pendingSubmission;

  // then
  assert.equal(isReviewEnabled, true);
  assert.equal(isReviewOpen, true);
  assert.equal(requestsAfterReview, 0);
  assert.equal(requestsAfterCancel, 0);
  assert.equal(submittedRequests.length, 1);
  assert.equal(submittedRequests[0]?.path, "/api/liquidate");
  assert.deepEqual(JSON.parse(submittedRequests[0]?.body ?? ""), {
    debtAmount: debtAmountText,
    minCollateralAmount: minCollateralAmountText,
  });
  assert.equal(
    submittedRequests[0]?.headers["x-csrf-token"],
    snapshot.csrfToken
  );
  assert.equal(document.getElementById("execute").disabled, true);
  assert.equal(
    document.getElementById("result-badge").textContent,
    "Confirmed"
  );
});

test("keeps checking a pending refund after liquidation fails and stops when it completes", async () => {
  // given
  const browserCode = readFileSync(
    new URL("../../ui/app.js", import.meta.url),
    "utf8"
  );

  const document = createBrowserDocument();

  const refundTransactionId = "refund-block";

  const changeTransfer: BrowserTransfer = { state: "pending" };

  const result = {
    id: "42",
    timestamp: "1791201050",
    amounts: { debtRepaid: "0", collateralReceived: "0" },
    status: {
      state: "failed_liquidation",
      error: "Minimum collateral not met",
    },
    collateralTx: { state: "success" },
    changeTx: changeTransfer,
  };

  const snapshot = {
    submitted: true,
    result,
    eligible: true,
    debtAsset: "USDT",
    collateralAsset: "BTC",
    debtPool: { decimals: "6" },
    collateralPool: { decimals: "8" },
    liquidatorBalances: [],
    positions: [],
    health: { healthFactor: "237", healthFactorDecimals: "3" },
    balance: "1980000",
    fee: "10000",
    maximumDebtAmount: "1000000",
    defaultMinCollateralAmount: "0",
  };

  let nextRefresh: (() => Promise<void>) | undefined;
  let refreshDelayMilliseconds: number | undefined;
  let hasQueryFailure = false;
  const requests: string[] = [];

  const context = {
    document,
    clearTimeout: () => {
      nextRefresh = undefined;
    },
    setTimeout: (callback: () => Promise<void>, delay: number) => {
      nextRefresh = callback;
      refreshDelayMilliseconds = delay;
    },
    fetch: async (path: string, options: { method?: string }) => {
      requests.push(`${options.method ?? "GET"} ${path}`);

      return {
        ok: !hasQueryFailure,
        json: async () =>
          hasQueryFailure ? { error: "Status query failed" } : snapshot,
      };
    },
  };

  // when
  runInNewContext(browserCode, context);
  await new Promise<void>((resolve) => setImmediate(resolve));
  const pendingBadge = document.getElementById("result-badge").textContent;
  const pendingRefresh = nextRefresh;
  assert.ok(pendingRefresh);
  hasQueryFailure = true;
  await pendingRefresh();
  const canRefreshAfterError = !document.getElementById("track").disabled;
  const canSubmitAfterError = !document.getElementById("execute").disabled;
  const hasStoppedAfterError = nextRefresh === undefined;
  hasQueryFailure = false;
  await pendingRefresh();
  const resumedRefresh = nextRefresh;
  assert.ok(resumedRefresh);
  result.changeTx.state = "success";
  result.changeTx.txid = refundTransactionId;
  await resumedRefresh();

  // then
  const EXPECTED_REFRESH_5_SECONDS_MS = 5_000;
  assert.equal(refreshDelayMilliseconds, EXPECTED_REFRESH_5_SECONDS_MS);
  assert.equal(pendingBadge, "Refund pending");
  assert.equal(canRefreshAfterError, true);
  assert.equal(canSubmitAfterError, false);
  assert.equal(hasStoppedAfterError, true);
  assert.equal(nextRefresh, undefined);
  assert.equal(
    document.getElementById("result-badge").textContent,
    "Refund complete"
  );
  assert.ok(
    document
      .getElementById("receipt-change")
      .textContent.includes(refundTransactionId)
  );
  assert.equal(
    document.getElementById("receipt-collateral").textContent,
    "Not sent — liquidation failed"
  );
  assert.ok(requests.every((request) => request === "GET /api/state"));
});

test("formats base-unit amounts without losing precision", () => {
  // given
  const browserCode = readFileSync(
    new URL("../../ui/app.js", import.meta.url),
    "utf8"
  );

  const cases = [
    { amountBaseUnits: "0", decimals: "6", expected: "0" },
    { amountBaseUnits: "1", decimals: "8", expected: "0.00000001" },
    { amountBaseUnits: "1000000", decimals: "6", expected: "1" },
    {
      amountBaseUnits: "100000000000000001",
      decimals: "18",
      expected: "0.100000000000000001",
    },
    { amountBaseUnits: null, decimals: "8", expected: "—" },
  ];

  const document = createBrowserDocument();

  // when
  const formattedAmountsJson = runInNewContext(
    `${browserCode}\nJSON.stringify(cases.map(testCase => formatAssetAmount(testCase.amountBaseUnits, testCase.decimals)))`,
    {
      document,
      cases,
      clearTimeout,
      fetch: () => new Promise(() => {}),
    }
  );

  // then
  const EXPECTED_AMOUNTS_JSON = JSON.stringify(
    cases.map(({ expected }) => expected)
  );

  assert.equal(formattedAmountsJson, EXPECTED_AMOUNTS_JSON);
});

test("converts asset amounts exactly at supported scales", () => {
  // given
  const cases = [
    { asset: "USDT", decimals: 6n, input: "1.25", expected: 1_250_000n },
    { asset: "BTC", decimals: 8n, input: "0.00000001", expected: 1n },
    {
      asset: "ETH",
      decimals: 18n,
      input: "0.100000000000000001",
      expected: 100_000_000_000_000_001n,
    },
    {
      asset: "ICP",
      decimals: 8n,
      input: "01.00000000",
      expected: 100_000_000n,
    },
    { asset: "TOKEN", decimals: 0n, input: "1", expected: 1n },
  ];

  // when
  const amountsBaseUnits = cases.map(({ input, decimals, asset }) =>
    parseAssetAmountToBaseUnits(input, decimals, asset)
  );

  // then
  assert.deepEqual(
    amountsBaseUnits,
    cases.map(({ expected }) => expected)
  );
});

test("rejects excessive precision, zero, invalid syntax, and amounts above the spending cap", () => {
  // given
  const decimals = 6n;
  const spendingCapBaseUnits = 1_000_000n;

  const invalidAmounts = [
    "0",
    "0.000000",
    "0.0000001",
    "1.000001",
    "-1",
    "1e6",
    "1,5",
    ".5",
    "1.",
    "",
    " 1",
    null,
  ];

  // when
  const boundaryAmountBaseUnits = parseAssetAmountToBaseUnits(
    "1.000000",
    decimals,
    "USDT",
    spendingCapBaseUnits
  );

  // then
  assert.equal(boundaryAmountBaseUnits, spendingCapBaseUnits);

  for (const amount of invalidAmounts) {
    assert.throws(() =>
      parseAssetAmountToBaseUnits(
        amount,
        decimals,
        "USDT",
        spendingCapBaseUnits
      )
    );
  }

  assert.throws(() => parseAssetAmountToBaseUnits("1", -1n, "TOKEN"));
  assert.throws(() => parseAssetAmountToBaseUnits("1", 19n, "TOKEN"));
});

test("rejects invalid amounts and accepts the configured boundary", () => {
  // given
  const spendingCapBaseUnits = 1_000_000n;
  const invalidAmounts = ["0", "-1", "1.5", "1000001", "1e6", null];

  // when
  const amountBaseUnits = parseBaseUnitAmount(
    spendingCapBaseUnits.toString(),
    1n,
    spendingCapBaseUnits
  );

  // then
  assert.equal(amountBaseUnits, spendingCapBaseUnits);

  for (const value of invalidAmounts) {
    assert.throws(() => parseBaseUnitAmount(value, 1n, spendingCapBaseUnits));
  }
});

test("rejects foreign origins and DNS rebinding hosts", () => {
  // given
  const origin = "http://127.0.0.1:4318";
  const host = "127.0.0.1:4318";

  // when
  requireLocalRequest(host, origin, origin);

  // then
  assert.throws(() =>
    requireLocalRequest("attacker.example:4318", origin, origin)
  );
  assert.throws(() =>
    requireLocalRequest(host, "https://attacker.example", origin)
  );
});

function createBrowserDocument() {
  const elements = new Map<string, BrowserElement>();
  const eventHandlers = new Map<string, BrowserEventHandler>();

  return {
    eventHandlers,
    getElementById(id: string): BrowserElement {
      const existingElement = elements.get(id);

      if (existingElement) {
        return existingElement;
      }

      const element: BrowserElement = {
        value: "",
        dataset: {},
        textContent: "",
        disabled: true,
        open: false,
        addEventListener(eventName, handler) {
          eventHandlers.set(`${id}:${eventName}`, handler);
        },
        replaceChildren() {},
        scrollIntoView() {},
        showModal() {
          this.open = true;
        },
        close() {
          this.open = false;
        },
      };

      elements.set(id, element);

      return element;
    },
  };
}
