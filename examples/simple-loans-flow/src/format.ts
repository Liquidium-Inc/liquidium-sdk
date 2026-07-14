import type {
  Activity,
  GetActivityStatusResponse,
  LiquidiumStatus,
  Pool,
  SimpleLoan,
  SimpleLoanFindResult,
  SimpleLoanInitialDepositTargetQuote,
  SimpleLoanRepaymentTargetQuote,
  SupplyTarget,
} from "@liquidium/client";

const DISPLAY_DECIMALS = 6;
const PERCENT_DECIMALS = 2n;
const PERCENT_SCALE = 100n;
const MILLISECONDS_PER_SECOND = 1_000n;
const RECENT_LOANS_STORAGE_KEY = "liquidium-simple-loans.recentRefs";
const MAX_RECENT_LOANS = 10;
const ERROR_FIELD_EXCLUDE_LIST = new Set(["name", "message", "stack", "cause"]);

type SimpleLoanFormatOptions = {
  pools?: Pool[];
  includeTargets?: boolean;
};

type StatusSubject = "Activity" | "Loan";

export function getElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);

  if (!element) {
    throw new Error(`Missing element: ${id}`);
  }

  return element as T;
}

export function parseAmountToBaseUnits(
  value: string,
  decimals: bigint
): bigint {
  const trimmedValue = value.trim();
  const decimalPlaces = Number(decimals);

  if (!trimmedValue || decimalPlaces < 0) {
    throw new Error("Enter a valid amount.");
  }

  const [wholePart, fractionalPart = ""] = trimmedValue.split(".");

  if (!/^\d+$/.test(wholePart) || !/^\d*$/.test(fractionalPart)) {
    throw new Error("Amount must be a positive decimal number.");
  }

  if (fractionalPart.length > decimalPlaces) {
    throw new Error(
      `Amount has too many decimal places. Maximum is ${decimalPlaces}.`
    );
  }

  const paddedFractionalPart = fractionalPart.padEnd(decimalPlaces, "0");
  const baseUnitText = `${wholePart}${paddedFractionalPart}`.replace(
    /^0+(?=\d)/,
    ""
  );
  const amount = BigInt(baseUnitText || "0");

  if (amount <= 0n) {
    throw new Error("Amount must be greater than zero.");
  }

  return amount;
}

export function parsePositiveBigInt(value: string, label: string): bigint {
  const trimmedValue = value.trim();

  if (!/^\d+$/.test(trimmedValue)) {
    throw new Error(`${label} must be a positive whole number.`);
  }

  const parsedValue = BigInt(trimmedValue);

  if (parsedValue <= 0n) {
    throw new Error(`${label} must be greater than zero.`);
  }

  return parsedValue;
}

export function parsePercentToBps(value: string): bigint {
  const percentInCents = parseAmountToBaseUnits(value, PERCENT_DECIMALS);

  return (percentInCents * PERCENT_SCALE) / 100n;
}

export function formatAmount(amount: bigint, decimals: bigint): string {
  const decimalPlaces = Number(decimals);
  const sign = amount < 0n ? "-" : "";
  const absoluteAmount = amount < 0n ? -amount : amount;

  if (decimalPlaces === 0) {
    return `${sign}${absoluteAmount.toString()}`;
  }

  const paddedAmount = absoluteAmount
    .toString()
    .padStart(decimalPlaces + 1, "0");
  const wholePart = paddedAmount.slice(0, -decimalPlaces) || "0";
  const fractionalPart = paddedAmount
    .slice(-decimalPlaces)
    .slice(0, DISPLAY_DECIMALS)
    .replace(/0+$/, "");

  if (!fractionalPart) {
    return `${sign}${wholePart}`;
  }

  return `${sign}${wholePart}.${fractionalPart}`;
}

export function formatPercentFromBps(value: bigint): string {
  return `${formatAmount(value, 2n)}%`;
}

export function formatUnixTimestampSeconds(
  timestampSeconds: bigint | null
): string {
  if (timestampSeconds === null) {
    return "not set";
  }

  const timestampMilliseconds = Number(
    timestampSeconds * MILLISECONDS_PER_SECOND
  );

  return `${timestampSeconds.toString()} (${new Date(timestampMilliseconds).toISOString()})`;
}

export function formatPool(pool: Pool): string {
  return [
    `${pool.asset} on ${pool.chain}`,
    `Pool: ${pool.id}`,
    `Available: ${formatAmount(pool.availableLiquidity, pool.decimals)} ${
      pool.asset
    }`,
    `Max LTV: ${formatPercentFromBps(pool.maxLtv)}`,
    `Frozen: ${pool.frozen ? "yes" : "no"}`,
  ].join("\n");
}

export function formatSupplyTarget(target: SupplyTarget): string {
  return [
    `Send ${target.asset} on ${target.chain} to:`,
    target.address,
    target.icpAccountIdentifier
      ? `ICP account identifier: ${target.icpAccountIdentifier}`
      : null,
    `Pool: ${target.poolId}`,
  ]
    .filter((line): line is string => line !== null)
    .join("\n");
}

function formatInitialDepositTargetQuote(
  label: string,
  quote: SimpleLoanInitialDepositTargetQuote,
  asset: string,
  decimals: bigint
): string[] {
  return [
    label,
    `Amount to send: ${formatAmount(quote.amount, decimals)} ${asset} on ${quote.target.chain}`,
    `Estimated inflow fee: ${formatAmount(quote.inflowFeeAmount, decimals)} ${asset}`,
    formatSupplyTarget(quote.target),
  ];
}

function formatRepaymentTargetQuote(
  label: string,
  quote: SimpleLoanRepaymentTargetQuote,
  asset: string,
  decimals: bigint
): string[] {
  return [
    label,
    `Amount to repay: ${formatAmount(quote.amount, decimals)} ${asset} on ${quote.target.chain}`,
    `Inflow fee: ${formatAmount(quote.inflowFeeAmount, decimals)} ${asset}${
      quote.inflowFeeEstimateAvailable ? "" : " (estimate unavailable)"
    }`,
    formatSupplyTarget(quote.target),
  ];
}

export function formatSimpleLoan(
  loan: SimpleLoan,
  options: SimpleLoanFormatOptions = {}
): string {
  const collateralDecimals = getSimpleLoanPoolDecimals(
    options.pools,
    loan.collateral.poolId,
    loan.collateral.decimals
  );
  const borrowDecimals = getSimpleLoanPoolDecimals(
    options.pools,
    loan.borrow.poolId,
    loan.borrow.decimals
  );
  const includeTargets = options.includeTargets ?? true;
  const initialDepositQuotes = Object.values(
    loan.initialDeposit.targets
  ).filter(
    (quote): quote is SimpleLoanInitialDepositTargetQuote => quote !== undefined
  );
  const repaymentQuotes = Object.values(loan.repayment.targets).filter(
    (quote): quote is SimpleLoanRepaymentTargetQuote => quote !== undefined
  );
  const targetLines = includeTargets
    ? [
        "",
        "Initial deposit targets:",
        ...initialDepositQuotes.flatMap((quote) => [
          "",
          ...formatInitialDepositTargetQuote(
            `${quote.target.chain} target`,
            quote,
            loan.initialDeposit.asset,
            collateralDecimals
          ),
        ]),
        "",
        `Credited collateral: ${formatAmount(
          loan.initialDeposit.collateralAmount,
          collateralDecimals
        )} ${loan.initialDeposit.asset}`,
        `Deposit detected: ${formatUnixTimestampSeconds(
          loan.initialDeposit.detectedTimestamp
        )}`,
        `Deposit expires: ${formatUnixTimestampSeconds(
          loan.initialDeposit.expiryTimestamp
        )}`,
      ]
    : [];
  const repaymentLines = includeTargets
    ? [
        "Repayment targets:",
        ...repaymentQuotes.flatMap((quote) => [
          "",
          ...formatRepaymentTargetQuote(
            `${quote.target.chain} target`,
            quote,
            loan.repayment.asset,
            borrowDecimals
          ),
        ]),
        "",
        `Current debt: ${formatAmount(loan.repayment.debtAmount, borrowDecimals)} ${
          loan.repayment.asset
        }`,
        `Interest buffer: ${formatAmount(
          loan.repayment.interestBufferAmount,
          borrowDecimals
        )} ${loan.repayment.asset} (${loan.repayment.interestBufferSeconds.toString()} seconds)`,
      ]
    : [];

  return [
    `Reference: ${loan.ref}`,
    `Loan id: ${loan.loanId.toString()}`,
    "Status:",
    formatStatus(loan.status, "Loan"),
    `Profile id: ${loan.profileId}`,
    `Max LTV: ${formatPercentFromBps(loan.terms.ltvMaxBps)}`,
    `Deposit window seconds: ${loan.terms.depositWindowSeconds.toString()}`,
    "",
    "Collateral:",
    `${formatAmount(loan.collateral.amount, collateralDecimals)} ${
      loan.collateral.asset
    }`,
    `Pool: ${loan.collateral.poolId}`,
    "",
    "Borrow:",
    `Amount: ${formatAmount(loan.borrow.amount, borrowDecimals)} ${
      loan.borrow.asset
    } on ${loan.borrow.chain}`,
    `Destination: ${formatSimpleLoanAccount(loan.borrow.destination)}`,
    `Pool: ${loan.borrow.poolId}`,
    "",
    `Refund destination: ${formatSimpleLoanAccount(loan.refundDestination)}`,
    ...targetLines,
    "",
    "Current position:",
    `Collateral: ${formatAmount(
      loan.position.collateralAmount,
      collateralDecimals
    )} ${loan.collateral.asset}`,
    `Collateral interest: ${formatAmount(
      loan.position.collateralInterestAmount,
      collateralDecimals
    )} ${loan.collateral.asset}`,
    `Borrowed: ${formatAmount(loan.position.borrowedAmount, borrowDecimals)} ${
      loan.borrow.asset
    }`,
    `Debt interest: ${formatAmount(
      loan.position.debtInterestAmount,
      borrowDecimals
    )} ${loan.borrow.asset}`,
    `Total debt: ${formatAmount(
      loan.position.totalDebtAmount,
      borrowDecimals
    )} ${loan.borrow.asset}`,
    ...(includeTargets ? ["", "Repayment quote:", ...repaymentLines] : []),
  ].join("\n");
}

function getSimpleLoanPoolDecimals(
  pools: Pool[] | undefined,
  poolId: string,
  fallbackDecimals: bigint
): bigint {
  return (
    pools?.find((pool) => pool.id === poolId)?.decimals ?? fallbackDecimals
  );
}

export function formatActivityStatus(
  response: GetActivityStatusResponse
): string {
  if (!response.found) {
    return `Activity not found: ${response.id}`;
  }

  return formatActivity(response.activity);
}

export function formatFindResult(
  result: SimpleLoanFindResult,
  index: number,
  totalResults: number
): string {
  return [
    `Result ${index.toString()} of ${totalResults.toString()}`,
    `Reference: ${result.ref}`,
    `Loan id: ${result.loanId.toString()}`,
    `Created at: ${formatUnixTimestampSeconds(result.createdAt)}`,
    `Profile id: ${result.profileId}`,
    `Collateral: ${result.collateral.amount.toString()} ${result.collateral.asset}`,
    `Borrow asset: ${result.borrow.asset}`,
    `Collateral pool: ${result.collateral.poolId}`,
    `Borrow pool: ${result.borrow.poolId}`,
    "Use the reference or loan id above to load full loan details.",
  ].join("\n");
}

function formatActivity(activity: Activity): string {
  return [
    `Activity id: ${activity.id}`,
    `Operation: ${activity.status.operation}`,
    "Status:",
    formatStatus(activity.status, "Activity"),
    `Pool: ${activity.poolId}`,
    `Asset: ${activity.asset ?? "not set"}`,
    `Chain: ${activity.chain ?? "not set"}`,
    `Amount: ${activity.amount.toString()} base units`,
    `Timestamp ms: ${activity.timestampMs.toString()}`,
    `Txids: ${activity.txids?.join(", ") ?? "not set"}`,
    activity.topUp
      ? formatActivityTopUp(activity.topUp)
      : "Top-up: not required",
  ].join("\n");
}

function formatActivityTopUp(topUp: Activity["topUp"]): string {
  if (!topUp) {
    return "Top-up: not required";
  }

  return [
    "Top-up:",
    `Required: ${topUp.required ? "yes" : "no"}`,
    `Deposited amount: ${topUp.depositedAmount.toString()} base units`,
    `Fee amount: ${topUp.feeAmount.toString()} base units`,
    `Shortfall amount: ${topUp.shortfallAmount.toString()} base units`,
  ].join("\n");
}

function formatStatus(status: LiquidiumStatus, subject: StatusSubject): string {
  const actionLine =
    subject === "Loan"
      ? formatLoanStatusDetail(status)
      : `Activity action: ${status.operation}`;

  return [
    `${subject} state: ${status.state}`,
    actionLine,
    `Confirmations: ${status.confirmations?.toString() ?? "not set"}`,
    `Required confirmations: ${
      status.requiredConfirmations?.toString() ?? "not set"
    }`,
  ].join("\n");
}

function formatLoanStatusDetail(status: LiquidiumStatus): string {
  if (status.operation === "repayment" && status.state === "active") {
    return "Repayment due: yes";
  }

  if (status.operation === "repayment" && status.state === "completed") {
    return "Repayment: complete";
  }

  return `Related action: ${status.operation}`;
}

export function stringifyForDisplay(value: unknown): string {
  return JSON.stringify(
    value,
    (_key, nestedValue) => {
      if (typeof nestedValue === "bigint") {
        return nestedValue.toString();
      }

      return nestedValue;
    },
    2
  );
}

export function saveRecentLoanRef(ref: string): void {
  const existingRefs = getRecentLoanRefs();
  const nextRefs = [
    ref,
    ...existingRefs.filter((existingRef) => existingRef !== ref),
  ].slice(0, MAX_RECENT_LOANS);

  window.localStorage.setItem(
    RECENT_LOANS_STORAGE_KEY,
    JSON.stringify(nextRefs)
  );
}

export function getRecentLoanRefs(): string[] {
  const storedValue = window.localStorage.getItem(RECENT_LOANS_STORAGE_KEY);

  if (!storedValue) {
    return [];
  }

  try {
    const parsedValue = JSON.parse(storedValue);

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue.filter(
      (value): value is string => typeof value === "string"
    );
  } catch {
    return [];
  }
}

export function formatError(error: unknown): string {
  const seenErrors = new WeakSet<object>();

  return formatErrorWithDetails(error, seenErrors);
}

function formatErrorWithDetails(
  error: unknown,
  seenErrors: WeakSet<object>
): string {
  if (error instanceof Error) {
    if (seenErrors.has(error)) {
      return "[Circular error]";
    }
    seenErrors.add(error);

    const code = "code" in error ? String(error.code) : null;
    const details = getErrorDetails(error);
    const cause = "cause" in error ? error.cause : undefined;
    const parts = [code ? `${code}: ${error.message}` : error.message];

    if (details) {
      parts.push(`Details: ${details}`);
    }

    if (cause !== undefined) {
      parts.push(`Cause: ${formatErrorWithDetails(cause, seenErrors)}`);
    }

    return parts.join("\n");
  }

  if (typeof error === "object" && error !== null) {
    return stringifyForDisplay(error);
  }

  return String(error);
}

function getErrorDetails(error: Error): string | undefined {
  const entries = Object.entries(error).filter(
    ([key, value]) => !ERROR_FIELD_EXCLUDE_LIST.has(key) && value !== undefined
  );

  if (entries.length === 0) {
    return undefined;
  }

  return stringifyForDisplay(Object.fromEntries(entries));
}

function formatSimpleLoanAccount(
  account: SimpleLoan["borrow"]["destination"]
): string {
  return `${account.type}: ${account.address}`;
}
