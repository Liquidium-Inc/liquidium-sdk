const element = (id) => document.getElementById(id);
let state;
let busy = false;
let statusRefreshTimer;
const STATUS_REFRESH_5_SECONDS_MS = 5_000;
const MILLISECONDS_PER_SECOND = 1_000;
const confirmation = element("confirmation");

function formatUnits(value, decimals) {
  if (value === undefined || value === null) return "—";
  const scale = 10n ** BigInt(decimals);
  const amount = BigInt(value);
  const fraction = (amount % scale)
    .toString()
    .padStart(Number(decimals), "0")
    .replace(/0+$/, "");
  return `${amount / scale}${fraction ? `.${fraction}` : ""}`;
}

function normalizeAmount(value) {
  const [whole, fraction = ""] = value.split(".");
  const integer = whole.replace(/^0+(?=\d)/, "");
  const trimmedFraction = fraction.replace(/0+$/, "");
  return `${integer}${trimmedFraction ? `.${trimmedFraction}` : ""}`;
}

async function request(path, body) {
  const response = await fetch(
    path,
    body
      ? {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-csrf-token": state.csrfToken,
          },
          body: JSON.stringify(body),
        }
      : { cache: "no-store" }
  );
  const data = await response.json();
  if (!response.ok) throw new Error(data.error ?? "Request failed.");
  return data;
}

function updateControls() {
  element("refresh").disabled = busy;
  element("track").disabled = busy || !state?.submitted;
  element("controls").disabled = busy || !state;
  element("debt").readOnly = Boolean(state?.submitted);
  element("minimum").readOnly = Boolean(state?.submitted);
  const cannotSubmit = busy || !state || !state.eligible || state.submitted;
  element("execute").disabled = cannotSubmit;
  element("confirm").disabled = cannotSubmit;
}

async function refresh() {
  clearTimeout(statusRefreshTimer);
  let shouldRefreshAgain = false;
  busy = true;
  updateControls();
  if (!state?.result)
    element("message").textContent = "Reading staging positions…";
  element("message").dataset.error = "false";
  element("wallet-updated").textContent = "Refreshing balances…";
  try {
    state = await request("/api/state");
    const debtDecimals = state.debtPool.decimals;
    element("borrower").textContent = state.borrowerProfileId;
    element("principal").textContent = state.liquidatorPrincipal;
    element("funding-address").value = state.liquidatorPrincipal;
    element("copy-funding-address").disabled = false;
    element("wallet-balances").replaceChildren(
      ...state.liquidatorBalances.map((balance) => {
        const row = document.createElement("tr");
        const assetCell = document.createElement("td");
        assetCell.textContent = balance.asset;
        const ledger = document.createElement("small");
        ledger.textContent = balance.ledgerCanisterId ?? "Ledger unavailable";
        assetCell.append(ledger);
        const balanceCell = document.createElement("td");
        balanceCell.textContent =
          balance.amount === null
            ? "Unavailable"
            : formatUnits(balance.amount, balance.decimals);
        if (balance.error) {
          const error = document.createElement("small");
          error.textContent = balance.error;
          balanceCell.append(error);
        }
        row.append(assetCell, balanceCell);
        return row;
      })
    );
    element("wallet-updated").textContent =
      `Updated ${new Date().toLocaleTimeString()}. Use Refresh position to check again.`;
    element("ledger").textContent = state.ledgerCanisterId;
    element("lending").textContent = state.lendingCanisterId;
    element("allowlisted").textContent = state.allowlisted
      ? "Registered"
      : "Not listed. Some test builds require registration.";
    element("eligibility").textContent = state.eligible
      ? "Eligible"
      : "Not liquidatable";
    element("health").textContent =
      state.health.healthFactor === null
        ? "No debt"
        : formatUnits(
            state.health.healthFactor,
            state.health.healthFactorDecimals
          );
    element("pay").textContent = state.debtAsset;
    element("receive").textContent = state.collateralAsset;
    element("balance").textContent =
      `${formatUnits(state.balance, debtDecimals)} ck${state.debtAsset}`;
    element("fee").textContent =
      `${formatUnits(state.fee, debtDecimals)} ${state.debtAsset}`;
    element("debt-unit").textContent = `(${state.debtAsset})`;
    element("collateral-unit").textContent = `(${state.collateralAsset})`;
    element("debt-help").textContent =
      `You can repay up to ${formatUnits(state.maximumDebtAmount, debtDecimals)} ${state.debtAsset} in this test. Ledger fees are additional.`;
    element("minimum-help").textContent =
      `This example requires a positive ${state.collateralAsset} amount, but normal liquidation ignores this minimum and allows smaller partial fills. Transfer fees apply.`;
    if (!element("debt").value)
      element("debt").value = formatUnits(
        state.maximumDebtAmount,
        debtDecimals
      );
    if (!element("minimum").value && state.defaultMinCollateralAmount !== "0")
      element("minimum").value = formatUnits(
        state.defaultMinCollateralAmount,
        state.collateralPool.decimals
      );
    element("positions").replaceChildren(
      ...state.positions.map((position) => {
        const row = document.createElement("tr");
        for (const value of [
          position.asset,
          formatUnits(position.deposited, position.depositedDecimals),
          formatUnits(position.borrowed, position.borrowedDecimals),
        ]) {
          const cell = document.createElement("td");
          cell.textContent = value;
          row.append(cell);
        }
        return row;
      })
    );
    if (state.result) {
      showResult(state.result);
      shouldRefreshAgain = shouldRefreshResult(state.result);
    } else {
      element("message").textContent = state.submitted
        ? "A liquidation request was made. Check the receipt before any further action."
        : !state.eligible
          ? "This borrower is healthy. Refresh after changing the staging test price."
          : "Ready for review. The SDK handles spending approval if needed when you confirm execution.";
    }
    if (state.submitted && !state.result)
      element("result-summary").textContent =
        "No liquidation result is available. Check the request error and ledger transfers before restarting.";
  } catch (error) {
    element("message").textContent = error.message;
    element("message").dataset.error = "true";
    element("wallet-updated").textContent =
      "Refresh failed. Any balances shown are from the last successful refresh.";
    if (!state?.submitted) state = undefined;
  } finally {
    busy = false;
    updateControls();
    if (shouldRefreshAgain) {
      statusRefreshTimer = setTimeout(refresh, STATUS_REFRESH_5_SECONDS_MS);
    }
  }
}

function actionBody() {
  const debtAmount = element("debt").value;
  const minCollateralAmount = element("minimum").value;
  if (
    !/^\d+(\.\d+)?$/.test(debtAmount) ||
    !/^\d+(\.\d+)?$/.test(minCollateralAmount)
  )
    throw new Error(
      "Enter asset amounts with a decimal point, such as 1 or 0.5."
    );
  if (!/[1-9]/.test(debtAmount) || !/[1-9]/.test(minCollateralAmount))
    throw new Error("Both amounts must be greater than zero.");
  return { debtAmount, minCollateralAmount };
}

function showResult(result) {
  const resultState = getResultState(result);
  const labels = {
    confirmed: "Liquidation confirmed",
    pending: "Liquidation pending — checking transfers every 5 seconds",
    refund_pending:
      "Liquidation failed — refund pending. Checking every 5 seconds.",
    refund_complete: result.changeTx.txid
      ? "Liquidation failed — refund transfer confirmed. Ledger fees apply."
      : "Liquidation failed — refund processing complete. No refund transaction was reported.",
    failed: "Liquidation needs attention — do not submit again",
  };
  element("tracking").dataset.state = resultState;
  element("result-badge").textContent = {
    confirmed: "Confirmed",
    pending: "Pending",
    refund_pending: "Refund pending",
    refund_complete: "Refund complete",
    failed: "Needs attention",
  }[resultState];
  element("result-summary").textContent = labels[resultState];
  if (element("message").textContent !== labels[resultState]) {
    element("message").textContent = labels[resultState];
  }
  element("message").dataset.error = String(resultState === "failed");
  element("receipt").hidden = false;
  element("receipt-id").textContent = result.id;
  element("receipt-time").textContent = new Date(
    Number(result.timestamp) * MILLISECONDS_PER_SECOND
  ).toLocaleString();
  element("receipt-collateral").textContent =
    result.status.state === "failed_liquidation" &&
    result.collateralTx.state === "success"
      ? "Not sent — liquidation failed"
      : `${result.collateralTx.state}${result.collateralTx.txid ? ` · Transaction ${result.collateralTx.txid}` : ""}`;
  element("receipt-change").textContent =
    `${result.changeTx.state}${result.changeTx.txid ? ` · Transaction ${result.changeTx.txid}` : ""}`;
  element("result-error").textContent = [
    result.status.error,
    result.collateralTx.error,
    result.changeTx.error,
  ]
    .filter(Boolean)
    .join(" ");
  element("result-amounts").hidden = false;
  element("result-amounts").textContent =
    result.status.state === "failed_liquidation"
      ? "Liquidation did not complete. Check the change / refund transfer and wallet balance. Ledger fees are not returned."
      : `Debt repaid: ${formatUnits(result.amounts.debtRepaid, state.debtPool.decimals)} ${state.debtAsset}. ${resultState === "confirmed" ? "Collateral received after fees" : "Collateral after fees (delivery not confirmed)"}: ${formatUnits(result.amounts.collateralReceived, state.collateralPool.decimals)} ${state.collateralAsset}.`;
  element("result-details").hidden = false;
  element("result").textContent = JSON.stringify(result, null, 2);
}

function getResultState(result) {
  if (
    result.status.state === "failed_liquidation" &&
    result.collateralTx.state === "success"
  ) {
    if (result.changeTx.state === "pending") return "refund_pending";
    if (result.changeTx.state === "success") return "refund_complete";
  }
  const states = [
    result.status.state,
    result.collateralTx.state,
    result.changeTx.state,
  ];
  if (states.some((transferState) => transferState.includes("failed")))
    return "failed";
  if (states.every((transferState) => transferState === "success"))
    return "confirmed";
  return "pending";
}

function shouldRefreshResult(result) {
  return (
    getResultState(result) === "pending" ||
    result.collateralTx.state === "pending" ||
    result.changeTx.state === "pending"
  );
}

element("action-form").addEventListener("submit", (event) => {
  event.preventDefault();
  if (busy || !state?.eligible || state.submitted) return;
  element("action-error").textContent = "";
  try {
    const body = actionBody();
    element("confirmation-text").textContent =
      `Offer up to ${normalizeAmount(body.debtAmount)} ${state.debtAsset} for borrower ${state.borrowerProfileId}. Normal liquidation allows smaller partial fills. The submitted minimum of ${normalizeAmount(body.minCollateralAmount)} ${state.collateralAsset} is not enforced in this mode. Transfer fees apply. The SDK will approve debt spending if needed, with a separate ledger fee of ${formatUnits(state.fee, state.debtPool.decimals)} ${state.debtAsset}. The assets come from your liquidator account.`;
    confirmation.showModal();
  } catch (error) {
    element("action-error").textContent = error.message;
  }
});

element("confirm").addEventListener("click", async () => {
  if (busy || !confirmation.open || !state?.eligible || state.submitted) return;
  confirmation.close();
  busy = true;
  updateControls();
  element("action-error").textContent = "";
  element("message").textContent =
    "Preparing spending approval and submitting liquidation. Wait for the result; do not submit again.";
  try {
    showResult(await request("/api/liquidate", actionBody()));
  } catch (error) {
    element("action-error").textContent =
      `${error.message} Check status before retrying.`;
  } finally {
    busy = false;
    await refresh();
    element("tracking").scrollIntoView({ block: "start" });
  }
});
element("cancel").addEventListener("click", () => confirmation.close());
element("copy-funding-address").addEventListener("click", async () => {
  const address = element("funding-address");
  try {
    await navigator.clipboard.writeText(address.value);
    element("funding-copy-status").textContent = "Funding address copied.";
  } catch {
    address.focus();
    address.select();
    element("funding-copy-status").textContent =
      "Address selected. Copy it manually.";
  }
});
element("debt").addEventListener("input", updateControls);
element("refresh").addEventListener("click", refresh);
element("track").addEventListener("click", refresh);
void refresh();
