const STATUS_REFRESH_5_SECONDS_MS = 5_000;

const MILLISECONDS_PER_SECOND = 1_000;

const getElement = (id) => document.getElementById(id);

const confirmationDialog = getElement("confirmation");

let snapshot;

let isBusy = false;

let statusRefreshTimer;

function formatAssetAmount(amountBaseUnits, decimals) {
  if (amountBaseUnits === undefined || amountBaseUnits === null) {
    return "—";
  }

  const baseUnitsPerToken = 10n ** BigInt(decimals);
  const parsedAmountBaseUnits = BigInt(amountBaseUnits);

  const fractionalDigits = (parsedAmountBaseUnits % baseUnitsPerToken)
    .toString()
    .padStart(Number(decimals), "0")
    .replace(/0+$/, "");

  return `${parsedAmountBaseUnits / baseUnitsPerToken}${fractionalDigits ? `.${fractionalDigits}` : ""}`;
}

function normalizeAssetAmount(amountText) {
  const [wholeDigits, fractionalDigits = ""] = amountText.split(".");
  const normalizedWholeDigits = wholeDigits.replace(/^0+(?=\d)/, "");
  const normalizedFractionalDigits = fractionalDigits.replace(/0+$/, "");

  return `${normalizedWholeDigits}${normalizedFractionalDigits ? `.${normalizedFractionalDigits}` : ""}`;
}

async function requestJson(path, body) {
  const response = await fetch(
    path,
    body
      ? {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-csrf-token": snapshot.csrfToken,
          },
          body: JSON.stringify(body),
        }
      : { cache: "no-store" }
  );

  const responseBody = await response.json();

  if (!response.ok) {
    throw new Error(responseBody.error ?? "Request failed.");
  }

  return responseBody;
}

function updateControls() {
  getElement("refresh").disabled = isBusy;
  getElement("track").disabled = isBusy || !snapshot?.submitted;
  getElement("controls").disabled = isBusy || !snapshot;
  getElement("debt").readOnly = Boolean(snapshot?.submitted);
  getElement("minimum").readOnly = Boolean(snapshot?.submitted);

  const cannotSubmit =
    isBusy || !snapshot || !snapshot.eligible || snapshot.submitted;

  getElement("execute").disabled = cannotSubmit;
  getElement("confirm").disabled = cannotSubmit;
}

async function refresh() {
  clearTimeout(statusRefreshTimer);

  let shouldRefreshAgain = false;
  isBusy = true;
  updateControls();

  if (!snapshot?.result) {
    getElement("message").textContent = "Reading staging positions…";
  }

  getElement("message").dataset.error = "false";
  getElement("wallet-updated").textContent = "Refreshing balances…";

  try {
    snapshot = await requestJson("/api/state");
    const debtDecimals = snapshot.debtPool.decimals;
    getElement("borrower").textContent = snapshot.borrowerProfileId;
    getElement("principal").textContent = snapshot.liquidatorPrincipal;
    getElement("funding-address").value = snapshot.liquidatorPrincipal;
    getElement("copy-funding-address").disabled = false;
    renderWalletBalances(snapshot.liquidatorBalances);
    getElement("wallet-updated").textContent =
      `Updated ${new Date().toLocaleTimeString()}. Use Refresh position to check again.`;
    getElement("ledger").textContent = snapshot.ledgerCanisterId;
    getElement("lending").textContent = snapshot.lendingCanisterId;
    getElement("allowlisted").textContent = snapshot.allowlisted
      ? "Registered"
      : "Not listed. Registration is not required.";
    getElement("eligibility").textContent = snapshot.eligible
      ? "Eligible"
      : "Not liquidatable";
    getElement("health").textContent =
      snapshot.health.healthFactor === null
        ? "No debt"
        : formatAssetAmount(
            snapshot.health.healthFactor,
            snapshot.health.healthFactorDecimals
          );
    getElement("pay").textContent = snapshot.debtAsset;
    getElement("receive").textContent = snapshot.collateralAsset;
    getElement("balance").textContent =
      `${formatAssetAmount(snapshot.balance, debtDecimals)} ck${snapshot.debtAsset}`;
    getElement("fee").textContent =
      `${formatAssetAmount(snapshot.fee, debtDecimals)} ${snapshot.debtAsset}`;
    getElement("debt-unit").textContent = `(${snapshot.debtAsset})`;
    getElement("collateral-unit").textContent = `(${snapshot.collateralAsset})`;
    getElement("debt-help").textContent =
      `You can repay up to ${formatAssetAmount(snapshot.maximumDebtAmount, debtDecimals)} ${snapshot.debtAsset} in this test. Ledger fees are additional.`;
    getElement("minimum-help").textContent =
      `This example requires a positive ${snapshot.collateralAsset} amount, but normal liquidation ignores this minimum and allows smaller partial fills. Transfer fees apply.`;

    if (!getElement("debt").value) {
      getElement("debt").value = formatAssetAmount(
        snapshot.maximumDebtAmount,
        debtDecimals
      );
    }

    if (
      !getElement("minimum").value &&
      snapshot.defaultMinCollateralAmount !== "0"
    ) {
      getElement("minimum").value = formatAssetAmount(
        snapshot.defaultMinCollateralAmount,
        snapshot.collateralPool.decimals
      );
    }

    renderBorrowerPositions(snapshot.positions);

    if (snapshot.result) {
      showResult(snapshot.result);
      shouldRefreshAgain = shouldRefreshResult(snapshot.result);
    } else {
      showReadinessMessage();
    }

    if (snapshot.submitted && !snapshot.result) {
      getElement("result-summary").textContent =
        "No liquidation result is available. Check the request error and ledger transfers before restarting.";
    }
  } catch (error) {
    getElement("message").textContent = error.message;
    getElement("message").dataset.error = "true";
    getElement("wallet-updated").textContent =
      "Refresh failed. Any balances shown are from the last successful refresh.";

    if (!snapshot?.submitted) {
      snapshot = undefined;
    }
  } finally {
    isBusy = false;
    updateControls();

    if (shouldRefreshAgain) {
      statusRefreshTimer = setTimeout(refresh, STATUS_REFRESH_5_SECONDS_MS);
    }
  }
}

function renderWalletBalances(balances) {
  getElement("wallet-balances").replaceChildren(
    ...balances.map((balance) => {
      const balanceRow = document.createElement("tr");
      const assetCell = document.createElement("td");
      assetCell.textContent = balance.asset;

      const ledgerLabel = document.createElement("small");
      ledgerLabel.textContent =
        balance.ledgerCanisterId ?? "Ledger unavailable";
      assetCell.append(ledgerLabel);

      const balanceCell = document.createElement("td");
      balanceCell.textContent =
        balance.amount === null
          ? "Unavailable"
          : formatAssetAmount(balance.amount, balance.decimals);

      if (balance.error) {
        const errorLabel = document.createElement("small");
        errorLabel.textContent = balance.error;
        balanceCell.append(errorLabel);
      }

      balanceRow.append(assetCell, balanceCell);

      return balanceRow;
    })
  );
}

function renderBorrowerPositions(positions) {
  getElement("positions").replaceChildren(
    ...positions.map((position) => {
      const positionRow = document.createElement("tr");

      for (const cellText of [
        position.asset,
        formatAssetAmount(position.deposited, position.depositedDecimals),
        formatAssetAmount(position.borrowed, position.borrowedDecimals),
      ]) {
        const positionCell = document.createElement("td");
        positionCell.textContent = cellText;
        positionRow.append(positionCell);
      }

      return positionRow;
    })
  );
}

function showReadinessMessage() {
  if (snapshot.submitted) {
    getElement("message").textContent =
      "A liquidation request was made. Check the receipt before any further action.";

    return;
  }

  if (!snapshot.eligible) {
    getElement("message").textContent =
      "This borrower is healthy. Refresh after changing the staging test price.";

    return;
  }

  getElement("message").textContent =
    "Ready for review. The SDK handles spending approval if needed when you confirm execution.";
}

function readActionBody() {
  const debtAmount = getElement("debt").value;
  const minCollateralAmount = getElement("minimum").value;

  if (
    !/^\d+(\.\d+)?$/.test(debtAmount) ||
    !/^\d+(\.\d+)?$/.test(minCollateralAmount)
  ) {
    throw new Error(
      "Enter asset amounts with a decimal point, such as 1 or 0.5."
    );
  }

  if (!/[1-9]/.test(debtAmount) || !/[1-9]/.test(minCollateralAmount)) {
    throw new Error("Both amounts must be greater than zero.");
  }

  return { debtAmount, minCollateralAmount };
}

function showResult(result) {
  const resultState = getResultState(result);

  const statusMessages = {
    confirmed: "Liquidation confirmed",
    pending: "Liquidation pending — checking transfers every 5 seconds",
    refund_pending:
      "Liquidation failed — refund pending. Checking every 5 seconds.",
    refund_complete: result.changeTx.txid
      ? "Liquidation failed — refund transfer confirmed. Ledger fees apply."
      : "Liquidation failed — refund processing complete. No refund transaction was reported.",
    failed: "Liquidation needs attention — do not submit again",
  };

  getElement("tracking").dataset.state = resultState;
  getElement("result-badge").textContent = {
    confirmed: "Confirmed",
    pending: "Pending",
    refund_pending: "Refund pending",
    refund_complete: "Refund complete",
    failed: "Needs attention",
  }[resultState];
  getElement("result-summary").textContent = statusMessages[resultState];

  if (getElement("message").textContent !== statusMessages[resultState]) {
    getElement("message").textContent = statusMessages[resultState];
  }

  getElement("message").dataset.error = String(resultState === "failed");
  getElement("receipt").hidden = false;
  getElement("receipt-id").textContent = result.id;
  getElement("receipt-time").textContent = new Date(
    Number(result.timestamp) * MILLISECONDS_PER_SECOND
  ).toLocaleString();
  getElement("receipt-collateral").textContent =
    result.status.state === "failed_liquidation" &&
    result.collateralTx.state === "success"
      ? "Not sent — liquidation failed"
      : `${result.collateralTx.state}${result.collateralTx.txid ? ` · Transaction ${result.collateralTx.txid}` : ""}`;
  getElement("receipt-change").textContent =
    `${result.changeTx.state}${result.changeTx.txid ? ` · Transaction ${result.changeTx.txid}` : ""}`;
  getElement("result-error").textContent = [
    result.status.error,
    result.collateralTx.error,
    result.changeTx.error,
  ]
    .filter(Boolean)
    .join(" ");
  getElement("result-amounts").hidden = false;
  getElement("result-amounts").textContent =
    result.status.state === "failed_liquidation"
      ? "Liquidation did not complete. Check the change / refund transfer and wallet balance. Ledger fees are not returned."
      : `Debt repaid: ${formatAssetAmount(result.amounts.debtRepaid, snapshot.debtPool.decimals)} ${snapshot.debtAsset}. ${resultState === "confirmed" ? "Collateral received after fees" : "Collateral after fees (delivery not confirmed)"}: ${formatAssetAmount(result.amounts.collateralReceived, snapshot.collateralPool.decimals)} ${snapshot.collateralAsset}.`;
  getElement("result-details").hidden = false;
  getElement("result").textContent = JSON.stringify(result, null, 2);
}

function getResultState(result) {
  if (
    result.status.state === "failed_liquidation" &&
    result.collateralTx.state === "success"
  ) {
    if (result.changeTx.state === "pending") {
      return "refund_pending";
    }

    if (result.changeTx.state === "success") {
      return "refund_complete";
    }
  }

  const transferStates = [
    result.status.state,
    result.collateralTx.state,
    result.changeTx.state,
  ];

  if (
    transferStates.some((transferState) => transferState.includes("failed"))
  ) {
    return "failed";
  }

  if (transferStates.every((transferState) => transferState === "success")) {
    return "confirmed";
  }

  return "pending";
}

function shouldRefreshResult(result) {
  return (
    getResultState(result) === "pending" ||
    result.collateralTx.state === "pending" ||
    result.changeTx.state === "pending"
  );
}

getElement("action-form").addEventListener("submit", (event) => {
  event.preventDefault();

  if (isBusy || !snapshot?.eligible || snapshot.submitted) {
    return;
  }

  getElement("action-error").textContent = "";

  try {
    const actionBody = readActionBody();
    getElement("confirmation-text").textContent =
      `Offer up to ${normalizeAssetAmount(actionBody.debtAmount)} ${snapshot.debtAsset} for borrower ${snapshot.borrowerProfileId}. Normal liquidation allows smaller partial fills. The submitted minimum of ${normalizeAssetAmount(actionBody.minCollateralAmount)} ${snapshot.collateralAsset} is not enforced in this mode. Transfer fees apply. The SDK will approve debt spending if needed, with a separate ledger fee of ${formatAssetAmount(snapshot.fee, snapshot.debtPool.decimals)} ${snapshot.debtAsset}. The assets come from your liquidator account.`;
    confirmationDialog.showModal();
  } catch (error) {
    getElement("action-error").textContent = error.message;
  }
});

getElement("confirm").addEventListener("click", async () => {
  if (
    isBusy ||
    !confirmationDialog.open ||
    !snapshot?.eligible ||
    snapshot.submitted
  ) {
    return;
  }

  confirmationDialog.close();
  isBusy = true;
  updateControls();
  getElement("action-error").textContent = "";
  getElement("message").textContent =
    "Preparing spending approval and submitting liquidation. Wait for the result; do not submit again.";

  try {
    showResult(await requestJson("/api/liquidate", readActionBody()));
  } catch (error) {
    getElement("action-error").textContent =
      `${error.message} Check status before retrying.`;
  } finally {
    isBusy = false;
    await refresh();
    getElement("tracking").scrollIntoView({ block: "start" });
  }
});

getElement("cancel").addEventListener("click", () =>
  confirmationDialog.close()
);

getElement("copy-funding-address").addEventListener("click", async () => {
  const fundingAddressInput = getElement("funding-address");

  try {
    await navigator.clipboard.writeText(fundingAddressInput.value);
    getElement("funding-copy-status").textContent = "Funding address copied.";
  } catch {
    fundingAddressInput.focus();
    fundingAddressInput.select();
    getElement("funding-copy-status").textContent =
      "Address selected. Copy it manually.";
  }
});

getElement("debt").addEventListener("input", updateControls);

getElement("refresh").addEventListener("click", refresh);

getElement("track").addEventListener("click", refresh);

void refresh();
