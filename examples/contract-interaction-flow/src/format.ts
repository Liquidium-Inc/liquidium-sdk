import type {
  Activity,
  GetActivityStatusResponse,
  LiquidiumStatus,
  OutflowDetails,
  Pool,
  SupplyFlow,
  SupplyTarget,
} from "@liquidium/client";

const DISPLAY_DECIMALS = 6;
const RECENT_ACTIVITY_IDS_STORAGE_KEY =
  "liquidium-contract-interaction.recentActivityIds";
const MAX_RECENT_ACTIVITY_IDS = 10;
const ERROR_FIELD_EXCLUDE_LIST = new Set(["name", "message", "stack", "cause"]);

type StatusSubject = "Activity" | "Flow";

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

export function formatPool(pool: Pool): string {
  return [
    `${pool.asset} on ${pool.chain}`,
    `Pool: ${pool.id}`,
    `Available: ${formatAmount(pool.availableLiquidity, pool.decimals)} ${pool.asset}`,
    `Max LTV: ${formatPercentFromBps(pool.maxLtv)}`,
    `Frozen: ${pool.frozen ? "yes" : "no"}`,
  ].join("\n");
}

export function formatSupplyFlow(flow: SupplyFlow): string {
  const actionLabel =
    flow.target.action === "repayment" ? "repayment" : "supply";
  const flowLabel = flow.txid
    ? `Contract interaction ${actionLabel} submitted.`
    : `Direct ck ${actionLabel} target generated.`;

  return [
    flowLabel,
    `Mechanism: ${flow.type}`,
    `Txid: ${flow.txid ?? "not set"}`,
    "Status:",
    formatStatus(flow.status, "Flow"),
    "",
    formatSupplyTarget(flow.target),
  ].join("\n");
}

export function formatOutflowDetails(outflow: OutflowDetails): string {
  return [
    `Outflow id: ${outflow.id}`,
    `Type: ${outflow.outflowType}`,
    `Amount: ${outflow.amount.toString()} base units`,
    `Receiver: ${formatOutflowReceiver(outflow.receiver)}`,
    `Outflow ref: ${outflow.outflowRef ?? "not set"}`,
    `Txid: ${outflow.txid ?? "not set"}`,
  ].join("\n");
}

function formatOutflowReceiver(receiver: OutflowDetails["receiver"]): string {
  switch (receiver.type) {
    case "ChainAddress":
      return `${receiver.type} ${receiver.address}`;
    case "IcPrincipal":
      return `${receiver.type} ${receiver.principal}`;
    case "IcpAccountIdentifier":
      return `${receiver.type} ${receiver.accountIdentifier}`;
    case "IcrcAccount":
      return `${receiver.type} ${receiver.address}`;
  }
}

export function formatSupplyTarget(target: SupplyTarget): string {
  if (target.type === "ChainAddress") {
    return [
      `Target type: ${target.type}`,
      `Address: ${target.address}`,
      `Pool: ${target.poolId}`,
      `Action: ${target.action}`,
    ].join("\n");
  }

  if (target.type === "IcrcAccount") {
    return [
      `Target type: ${target.type}`,
      `Account: ${target.account.address}`,
      `Owner: ${target.account.owner}`,
      `Subaccount: ${formatBytes(target.account.subaccount)}`,
      `Action: ${target.action}`,
    ].join("\n");
  }

  return [
    `Target type: ${target.type}`,
    `Account: ${target.account.icpIcrcAccount.address}`,
    `ICP account identifier: ${target.account.icpAccountIdentifier}`,
    `Owner: ${target.account.icpIcrcAccount.owner}`,
    `Subaccount: ${formatBytes(target.account.icpIcrcAccount.subaccount)}`,
    `Action: ${target.action}`,
  ].join("\n");
}

export function formatActivityStatus(
  response: GetActivityStatusResponse
): string {
  if (!response.found) {
    return `Activity not found: ${response.id}`;
  }

  return formatActivity(response.activity);
}

export function formatActivity(activity: Activity): string {
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

function formatStatus(status: LiquidiumStatus, subject: StatusSubject): string {
  const actionLabel = `${subject} action`;

  return [
    `${subject} state: ${status.state}`,
    `${actionLabel}: ${status.operation}`,
    `Confirmations: ${status.confirmations?.toString() ?? "not set"}`,
    `Required confirmations: ${status.requiredConfirmations?.toString() ?? "not set"}`,
  ].join("\n");
}

export function saveRecentActivityId(activityId: string): void {
  const existingIds = getRecentActivityIds();
  const nextIds = [
    activityId,
    ...existingIds.filter((existingId) => existingId !== activityId),
  ].slice(0, MAX_RECENT_ACTIVITY_IDS);

  window.localStorage.setItem(
    RECENT_ACTIVITY_IDS_STORAGE_KEY,
    JSON.stringify(nextIds)
  );
}

export function getRecentActivityIds(): string[] {
  const storedValue = window.localStorage.getItem(
    RECENT_ACTIVITY_IDS_STORAGE_KEY
  );

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

function stringifyForDisplay(value: unknown): string {
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

function formatBytes(bytes: Uint8Array | undefined): string {
  if (!bytes) {
    return "not set";
  }

  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
