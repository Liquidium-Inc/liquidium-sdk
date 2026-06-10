import "./styles.css";

import { formatConfig } from "./client";
import {
  formatActivityStatus,
  formatError,
  formatFindResult,
  formatInstantLoan,
  getElement,
  getRecentLoanRefs,
  parsePositiveBigInt,
  saveRecentLoanRef,
} from "./format";
import {
  findInstantLoans,
  getInstantLoan,
  getLoanActivityStatus,
  loadMarketData,
} from "./sdk-example";

const sdkConfig = getElement<HTMLDivElement>("sdk-config");
const loanRefInput = getElement<HTMLInputElement>("loan-ref-input");
const loanIdInput = getElement<HTMLInputElement>("loan-id-input");
const loadLoanButton = getElement<HTMLButtonElement>("load-loan-button");
const loanOutput = getElement<HTMLDivElement>("loan-output");
const activityIdInput = getElement<HTMLInputElement>("activity-id-input");
const loadActivityButton = getElement<HTMLButtonElement>(
  "load-activity-button"
);
const activityOutput = getElement<HTMLDivElement>("activity-output");
const queryInput = getElement<HTMLInputElement>("query-input");
const findLoansButton = getElement<HTMLButtonElement>("find-loans-button");
const candidatesOutput = getElement<HTMLDivElement>("candidates-output");
const recentLoansList = getElement<HTMLDivElement>("recent-loans-list");
const statusLog = getElement<HTMLPreElement>("status-log");

sdkConfig.textContent = formatConfig();
prefillRefFromUrl();
refreshRecentLoans();

loadLoanButton.addEventListener("click", () => run(loadLoan));
loadActivityButton.addEventListener("click", () => run(loadActivityStatus));
findLoansButton.addEventListener("click", () => run(findLoansByQuery));

async function loadLoan(): Promise<void> {
  const ref = loanRefInput.value.trim();
  const loanIdText = loanIdInput.value.trim();

  if (!ref && !loanIdText) {
    throw new Error("Enter a loan reference or loan id.");
  }

  setStatus("Loading loan status...");
  loanOutput.textContent = "Loading loan...";

  const [loan, marketData] = await Promise.all([
    ref
      ? getInstantLoan({ ref })
      : getInstantLoan({
          loanId: parsePositiveBigInt(loanIdText, "Loan id"),
        }),
    loadMarketData(),
  ]);

  loanRefInput.value = loan.ref;
  loanIdInput.value = loan.loanId.toString();
  saveRecentLoanRef(loan.ref);
  refreshRecentLoans();

  loanOutput.textContent = formatInstantLoan(loan, { pools: marketData.pools });
  setStatus(`Loaded instant loan ${loan.ref}.`);
}

async function loadActivityStatus(): Promise<void> {
  const shortRef = loanRefInput.value.trim();
  const activityId = activityIdInput.value.trim();

  if (!shortRef) {
    throw new Error("Enter a loan reference first.");
  }

  if (!activityId) {
    throw new Error("Enter an activity id.");
  }

  setStatus("Loading activity status...");
  activityOutput.textContent = "Loading activity status...";

  const response = await getLoanActivityStatus({
    shortRef,
    id: activityId,
  });

  activityOutput.textContent = formatActivityStatus(response);
  setStatus(`Loaded activity status for ${activityId}.`);
}

async function findLoansByQuery(): Promise<void> {
  const query = queryInput.value.trim();

  if (!query) {
    throw new Error(
      "Enter a loan reference, address, txid, or hash to search."
    );
  }

  setStatus("Finding candidate loans...");
  candidatesOutput.textContent = "Searching...";

  const results = await findInstantLoans(query);

  if (results.length === 0) {
    candidatesOutput.textContent = "No loans found for this query.";
    setStatus("No loans found.");
    return;
  }

  candidatesOutput.textContent = results
    .map((result, index) => formatFindResult(result, index + 1, results.length))
    .join("\n\n---\n\n");
  setStatus(`Found ${results.length} loan(s).`);
}

function prefillRefFromUrl(): void {
  const searchParams = new URLSearchParams(window.location.search);
  const ref = searchParams.get("ref");
  const activityId = searchParams.get("activityId");

  if (ref) {
    loanRefInput.value = ref;
  }

  if (activityId) {
    activityIdInput.value = activityId;
  }
}

function refreshRecentLoans(): void {
  const refs = getRecentLoanRefs();

  if (refs.length === 0) {
    recentLoansList.textContent = "No recent loans stored in this browser.";
    return;
  }

  recentLoansList.replaceChildren(
    ...refs.map((ref) => {
      const link = document.createElement("a");
      link.href = `/status.html?ref=${encodeURIComponent(ref)}`;
      link.textContent = ref;
      link.className = "recent-loan-link";
      return link;
    })
  );
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
