import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import {
  parseAmount,
  parseAssetAmount,
  requireLocalRequest,
} from "./web-safety.js";

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
  const document = {
    getElementById: () => ({ value: "", dataset: {}, addEventListener() {} }),
  };

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
  const handlers = new Map<string, (event?: unknown) => unknown>();
  const elements = new Map<string, ReturnType<typeof createElement>>();
  const document = {
    getElementById(id: string) {
      let element = elements.get(id);
      if (!element) {
        element = createElement(id);
        elements.set(id, element);
      }
      return element;
    },
  };
  function createElement(id: string) {
    return {
      value: "",
      dataset: {},
      textContent: "",
      disabled: true,
      open: false,
      addEventListener(event: string, handler: (event?: unknown) => unknown) {
        handlers.set(`${id}:${event}`, handler);
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
  }
  const debtAmount = "1";
  const minCollateralAmount = "0.00001";
  const liquidation = {
    id: "42",
    timestamp: "1791201050",
    amounts: { debtRepaid: "1000000", collateralReceived: "20888" },
    status: { state: "success" },
    collateralTx: { state: "success" },
    changeTx: { state: "success" },
  };
  const state = {
    csrfToken: "test-token",
    eligible: true,
    submitted: false,
    result: undefined as typeof liquidation | undefined,
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
  const posts: Array<{
    path: string;
    body: string;
    headers: Record<string, string>;
  }> = [];
  const fetch = async (
    path: string,
    options: { method?: string; body: string; headers: Record<string, string> }
  ) => {
    if (options.method === "POST") {
      posts.push({ path, body: options.body, headers: options.headers });
      state.submitted = true;
      state.result = liquidation;
      return { ok: true, json: async () => liquidation };
    }
    return { ok: true, json: async () => state };
  };
  await runInNewContext(`${browserCode}\nrefresh()`, {
    document,
    fetch,
    clearTimeout,
  });
  document.getElementById("debt").value = debtAmount;
  document.getElementById("minimum").value = minCollateralAmount;
  const submit = handlers.get("action-form:submit");
  const confirm = handlers.get("confirm:click");
  const cancel = handlers.get("cancel:click");
  assert.ok(submit && confirm && cancel);

  // when
  submit({ preventDefault() {} });
  const reviewEnabled = !document.getElementById("execute").disabled;
  const reviewOpened = document.getElementById("confirmation").open;
  const postsAfterReview = posts.length;
  cancel();
  await confirm();
  const postsAfterCancel = posts.length;
  submit({ preventDefault() {} });
  const pending = confirm();
  await confirm();
  await pending;

  // then
  assert.equal(reviewEnabled, true);
  assert.equal(reviewOpened, true);
  assert.equal(postsAfterReview, 0);
  assert.equal(postsAfterCancel, 0);
  assert.equal(posts.length, 1);
  assert.equal(posts[0]?.path, "/api/liquidate");
  assert.deepEqual(JSON.parse(posts[0]?.body ?? ""), {
    debtAmount,
    minCollateralAmount,
  });
  assert.equal(posts[0]?.headers["x-csrf-token"], state.csrfToken);
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
  const nodes = new Map<
    string,
    {
      value: string;
      dataset: Record<string, string>;
      textContent: string;
      disabled: boolean;
      addEventListener(): void;
      replaceChildren(): void;
    }
  >();
  const document = {
    getElementById(id: string) {
      let node = nodes.get(id);
      if (!node) {
        node = {
          value: "",
          dataset: {},
          textContent: "",
          disabled: true,
          addEventListener() {},
          replaceChildren() {},
        };
        nodes.set(id, node);
      }
      return node;
    },
  };
  const refundTransactionId = "refund-block";
  const result = {
    id: "42",
    timestamp: "1791201050",
    amounts: { debtRepaid: "0", collateralReceived: "0" },
    status: {
      state: "failed_liquidation",
      error: "Minimum collateral not met",
    },
    collateralTx: { state: "success" },
    changeTx: { state: "pending", txid: undefined as string | undefined },
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
  let failQuery = false;
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
        ok: !failQuery,
        json: async () =>
          failQuery ? { error: "Status query failed" } : snapshot,
      };
    },
  };

  // when
  runInNewContext(browserCode, context);
  await new Promise<void>((resolve) => setImmediate(resolve));
  const pendingBadge = document.getElementById("result-badge").textContent;
  const pendingRefresh = nextRefresh;
  assert.ok(pendingRefresh);
  failQuery = true;
  await pendingRefresh();
  const canRefreshAfterError = !document.getElementById("track").disabled;
  const canSubmitAfterError = !document.getElementById("execute").disabled;
  const stoppedAfterError = nextRefresh === undefined;
  failQuery = false;
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
  assert.equal(stoppedAfterError, true);
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
  const amounts = cases.map(({ input, decimals, asset }) =>
    parseAssetAmount(input, decimals, asset)
  );

  // then
  assert.deepEqual(
    amounts,
    cases.map(({ expected }) => expected)
  );
});

test("rejects excessive precision, zero, invalid syntax, and amounts above the spending cap", () => {
  // given
  const decimals = 6n;
  const maximum = 1_000_000n;
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
  const boundaryAmount = parseAssetAmount(
    "1.000000",
    decimals,
    "USDT",
    maximum
  );

  // then
  assert.equal(boundaryAmount, maximum);
  for (const amount of invalidAmounts) {
    assert.throws(() => parseAssetAmount(amount, decimals, "USDT", maximum));
  }
  assert.throws(() => parseAssetAmount("1", -1n, "TOKEN"));
  assert.throws(() => parseAssetAmount("1", 19n, "TOKEN"));
});

test("rejects invalid amounts and accepts the configured boundary", () => {
  // given
  const maximum = 1_000_000n;
  const invalidAmounts = ["0", "-1", "1.5", "1000001", "1e6", null];

  // when
  const amount = parseAmount(maximum.toString(), 1n, maximum);

  // then
  assert.equal(amount, maximum);
  for (const value of invalidAmounts) {
    assert.throws(() => parseAmount(value, 1n, maximum));
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
