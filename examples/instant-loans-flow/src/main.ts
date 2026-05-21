import "./styles.css";

import type { AssetPrices, InstantLoanAsset, Pool } from "@liquidium/client";
import { client, formatConfig } from "./client";
import {
  formatAmount,
  formatError,
  formatInstantLoan,
  formatPercentFromBps,
  formatPool,
  getElement,
  getRecentLoanRefs,
  parseAmountToBaseUnits,
  parsePercentToBps,
  parsePositiveBigInt,
  saveRecentLoanRef,
} from "./format";

let pools: Pool[] = [];
let assetPrices: AssetPrices = {};

const PRICE_DISPLAY_DECIMALS = 8;
const DEFAULT_COLLATERAL_ASSET = "BTC";
const DEFAULT_BORROW_ASSET = "USDC";

const sdkConfig = getElement<HTMLDivElement>("sdk-config");
const refreshPoolsButton = getElement<HTMLButtonElement>(
  "refresh-pools-button"
);
const createLoanButton = getElement<HTMLButtonElement>("create-loan-button");
const poolsList = getElement<HTMLDivElement>("pools-list");
const collateralPoolSelect = getElement<HTMLSelectElement>(
  "collateral-pool-select"
);
const borrowPoolSelect = getElement<HTMLSelectElement>("borrow-pool-select");
const pricePreview = getElement<HTMLDivElement>("price-preview");
const collateralAmountInput = getElement<HTMLInputElement>(
  "collateral-amount-input"
);
const borrowAmountInput = getElement<HTMLInputElement>("borrow-amount-input");
const maxLtvInput = getElement<HTMLInputElement>("max-ltv-input");
const depositWindowInput = getElement<HTMLInputElement>("deposit-window-input");
const borrowDestinationInput = getElement<HTMLInputElement>(
  "borrow-destination-input"
);
const refundDestinationInput = getElement<HTMLInputElement>(
  "refund-destination-input"
);
const ltvPreview = getElement<HTMLDivElement>("ltv-preview");
const loanResult = getElement<HTMLDivElement>("loan-result");
const recentLoansList = getElement<HTMLDivElement>("recent-loans-list");
const statusLog = getElement<HTMLPreElement>("status-log");

sdkConfig.textContent = formatConfig();
refreshRecentLoans();

refreshPoolsButton.addEventListener("click", () => run(loadPools));
createLoanButton.addEventListener("click", () => run(createInstantLoan));
collateralPoolSelect.addEventListener("change", () => {
  setMaxLtvInputToPoolMax();
  refreshPricePreview();
  refreshLtvPreview();
});
borrowPoolSelect.addEventListener("change", () => {
  refreshPricePreview();
  refreshLtvPreview();
});
collateralAmountInput.addEventListener("input", refreshLtvPreview);
borrowAmountInput.addEventListener("input", refreshLtvPreview);
maxLtvInput.addEventListener("input", refreshLtvPreview);

run(loadPools);

async function loadPools(): Promise<void> {
  setStatus("Loading pools...");
  [pools, assetPrices] = await Promise.all([
    client.market.listPools(),
    client.market.getAssetPrices(),
  ]);
  renderPools();
  populatePoolSelects();
  setMaxLtvInputToPoolMax();
  refreshPricePreview();
  refreshLtvPreview();
  setStatus(`Loaded ${pools.length} pools.`);
}

async function createInstantLoan(): Promise<void> {
  const collateralPool = getSelectedPool(collateralPoolSelect.value);
  const borrowPool = getSelectedPool(borrowPoolSelect.value);
  const collateralAmount = parseAmountToBaseUnits(
    collateralAmountInput.value,
    collateralPool.decimals
  );
  const borrowAmount = parseAmountToBaseUnits(
    borrowAmountInput.value,
    borrowPool.decimals
  );
  const ltvMaxBps = parsePercentToBps(maxLtvInput.value);
  const depositWindowSeconds = parsePositiveBigInt(
    depositWindowInput.value,
    "Deposit window seconds"
  );
  const borrowDestination = getRequiredInputValue(
    borrowDestinationInput,
    "Enter a borrow destination address."
  );
  const refundDestination = getRequiredInputValue(
    refundDestinationInput,
    "Enter a refund destination address."
  );

  setStatus("Creating instant loan...");
  loanResult.textContent = "Creating loan...";

  const loan = await client.instantLoans.create({
    collateralPoolId: collateralPool.id,
    borrowPoolId: borrowPool.id,
    collateralAsset: getInstantLoanAsset(collateralPool.asset),
    borrowAsset: getInstantLoanAsset(borrowPool.asset),
    collateralAmount,
    borrowAmount,
    ltvMaxBps,
    depositWindowSeconds,
    borrowDestination: { type: "External", address: borrowDestination },
    refundDestination: { type: "External", address: refundDestination },
  });

  saveRecentLoanRef(loan.ref);
  refreshRecentLoans();

  loanResult.textContent = [
    "Loan created. Save the reference and send collateral to the deposit target.",
    "",
    `Collateral amount: ${formatAmount(collateralAmount, collateralPool.decimals)} ${collateralPool.asset}`,
    `Borrow amount: ${formatAmount(borrowAmount, borrowPool.decimals)} ${borrowPool.asset}`,
    `Max LTV: ${formatPercentFromBps(ltvMaxBps)}`,
    "",
    formatInstantLoan(loan),
  ].join("\n");
  setStatus(`Created instant loan ${loan.ref}.`);
}

function getInstantLoanAsset(asset: string): InstantLoanAsset {
  return asset as InstantLoanAsset;
}

function renderPools(): void {
  if (pools.length === 0) {
    poolsList.textContent = "No pools available.";
    return;
  }

  poolsList.replaceChildren(
    ...pools.map((pool) => {
      const row = document.createElement("div");
      row.className = "asset-row";
      row.textContent = formatPool(pool);
      return row;
    })
  );
}

function populatePoolSelects(): void {
  populatePoolSelect(collateralPoolSelect);
  populatePoolSelect(borrowPoolSelect);
  selectPoolByAsset(collateralPoolSelect, DEFAULT_COLLATERAL_ASSET);
  selectPoolByAsset(borrowPoolSelect, DEFAULT_BORROW_ASSET);
}

function populatePoolSelect(select: HTMLSelectElement): void {
  select.replaceChildren(
    ...pools.map((pool) => {
      const option = document.createElement("option");
      option.value = pool.id;
      option.textContent = `${pool.asset} on ${pool.chain}`;
      return option;
    })
  );
}

function selectPoolByAsset(select: HTMLSelectElement, asset: string): void {
  const pool = pools.find((candidatePool) => candidatePool.asset === asset);

  if (!pool) {
    return;
  }

  select.value = pool.id;
}

function refreshLtvPreview(): void {
  try {
    const collateralPool = getSelectedPool(collateralPoolSelect.value);
    const borrowPool = getSelectedPool(borrowPoolSelect.value);
    const collateralAmount = parseAmountToBaseUnits(
      collateralAmountInput.value,
      collateralPool.decimals
    );
    const borrowAmount = parseAmountToBaseUnits(
      borrowAmountInput.value,
      borrowPool.decimals
    );
    const ltvMaxBps = parsePercentToBps(maxLtvInput.value);
    const ltvCalculation = client.quote.calculateLtv(
      {
        borrowAmount,
        borrowPoolId: borrowPool.id,
        collateralAmount,
        collateralPoolId: collateralPool.id,
      },
      pools,
      assetPrices
    );

    if (ltvCalculation.validationErrors.length > 0) {
      throw new Error(
        ltvCalculation.validationErrors
          .map((validationError) => validationError.message)
          .join(" ")
      );
    }

    ltvPreview.textContent = [
      `Implied current LTV: ${formatPercentFromBps(ltvCalculation.ltvBps)}`,
      `User max LTV: ${formatPercentFromBps(ltvMaxBps)}`,
      `SDK max allowed LTV: ${formatPercentFromBps(ltvCalculation.maxAllowedLtvBps)}`,
      ltvMaxBps > ltvCalculation.maxAllowedLtvBps
        ? "Warning: user max LTV is above the SDK max allowed LTV."
        : "User max LTV is within the SDK max allowed LTV.",
    ].join("\n");
  } catch (error) {
    ltvPreview.textContent =
      error instanceof Error
        ? `LTV preview unavailable: ${error.message}`
        : "LTV preview unavailable.";
  }
}

function refreshPricePreview(): void {
  try {
    const collateralPool = getSelectedPool(collateralPoolSelect.value);
    const borrowPool = getSelectedPool(borrowPoolSelect.value);

    pricePreview.textContent = [
      "Prices used for LTV:",
      `Collateral ${collateralPool.asset}: ${formatUsdPrice(assetPrices[collateralPool.asset])}`,
      `Borrow ${borrowPool.asset}: ${formatUsdPrice(assetPrices[borrowPool.asset])}`,
      "Source: lending canister get_prices().",
    ].join("\n");
  } catch {
    pricePreview.textContent = "Load pools to show the prices used for LTV.";
  }
}

function formatUsdPrice(price: number | undefined): string {
  if (typeof price !== "number" || !Number.isFinite(price) || price <= 0) {
    return "unavailable";
  }

  return `$${price.toLocaleString(undefined, {
    maximumFractionDigits: PRICE_DISPLAY_DECIMALS,
  })}`;
}

function setMaxLtvInputToPoolMax(): void {
  try {
    const collateralPool = getSelectedPool(collateralPoolSelect.value);
    maxLtvInput.value = formatBpsInput(collateralPool.maxLtv);
  } catch {
    return;
  }
}

function formatBpsInput(value: bigint): string {
  return (Number(value) / 100).toString();
}

function getSelectedPool(poolId: string): Pool {
  const pool = pools.find((candidatePool) => candidatePool.id === poolId);

  if (!pool) {
    throw new Error("Select an available pool first.");
  }

  if (pool.frozen) {
    throw new Error(`${pool.asset} on ${pool.chain} is currently frozen.`);
  }

  return pool;
}

function getRequiredInputValue(
  input: HTMLInputElement,
  message: string
): string {
  const value = input.value.trim();

  if (!value) {
    throw new Error(message);
  }

  return value;
}

function refreshRecentLoans(): void {
  const refs = getRecentLoanRefs();

  if (refs.length === 0) {
    recentLoansList.textContent = "No recent loans stored in this browser.";
    return;
  }

  recentLoansList.textContent = refs.join("\n");
}

async function run(action: () => Promise<void>): Promise<void> {
  try {
    await action();
  } catch (error) {
    setStatus(`Error: ${formatError(error)}`);
  }
}

function setStatus(message: string): void {
  statusLog.textContent = message;
}
