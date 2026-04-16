import { LiquidiumError } from "@liquidium/client";
import { getAssetDecimals, isStablecoinAsset } from "./assets";

export function formatLiquidiumError(error: unknown): string {
  if (error instanceof LiquidiumError) {
    return `${error.code}: ${error.message}`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown error";
}

export function bigintJsonReplacer(_key: string, value: unknown) {
  return typeof value === "bigint" ? value.toString() : value;
}

export function parseDecimalToBaseUnits(
  value: string,
  decimals: number
): bigint | null {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return null;
  }

  if (!/^\d+(\.\d+)?$/.test(normalizedValue)) {
    return null;
  }

  const [wholePart, fractionalPart = ""] = normalizedValue.split(".");
  const paddedFractionalPart = fractionalPart
    .slice(0, decimals)
    .padEnd(decimals, "0");

  return BigInt(`${wholePart}${paddedFractionalPart}`);
}

export function formatBaseUnitsAsDecimal(
  value: bigint,
  decimals: number,
  maxFractionDigits: number
): string {
  const isNegative = value < 0n;
  const normalizedValue = isNegative ? value * -1n : value;
  const stringValue = normalizedValue.toString().padStart(decimals + 1, "0");
  const wholePart = stringValue.slice(0, -decimals) || "0";
  const fractionalPart = stringValue.slice(-decimals);
  const trimmedFractionalPart = fractionalPart
    .slice(0, maxFractionDigits)
    .replace(/0+$/, "");
  const formattedWholePart = new Intl.NumberFormat("en-US").format(
    Number(wholePart)
  );
  const signPrefix = isNegative ? "-" : "";

  if (!trimmedFractionalPart) {
    return `${signPrefix}${formattedWholePart}`;
  }

  return `${signPrefix}${formattedWholePart}.${trimmedFractionalPart}`;
}

export function formatPoolAmount(value: bigint, asset: string): string {
  const decimals = getAssetDecimals(asset);
  const maxFractionDigits = asset === "BTC" ? 8 : 4;

  return `${formatBaseUnitsAsDecimal(value, decimals, maxFractionDigits)} ${asset}`;
}

const INTERNAL_USD_DECIMALS = 8;
const USD_MAX_FRACTION_DIGITS = 2;

export function formatInternalUsd(value: bigint): string {
  return formatUsdFromDecimalString(
    formatBaseUnitsAsDecimal(
      value,
      INTERNAL_USD_DECIMALS,
      USD_MAX_FRACTION_DIGITS
    )
  );
}

export function formatUsdFromDecimalString(value: string): string {
  const amount = Number(value || "0");

  if (Number.isNaN(amount)) {
    return "$0";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: USD_MAX_FRACTION_DIGITS,
  }).format(amount);
}

export function formatBorrowAmountDisplay(
  value: string,
  asset: string | undefined
): string {
  if (!asset) {
    return "--";
  }

  const normalizedValue = value.trim();
  const isStableAsset = isStablecoinAsset(asset);

  if (!normalizedValue) {
    return isStableAsset ? "$0" : `0 ${asset}`;
  }

  if (isStableAsset) {
    return formatUsdFromDecimalString(normalizedValue);
  }

  return `${normalizedValue} ${asset}`;
}

export function formatBpsAsPercent(value: number): string {
  return `${(value / 100).toFixed(0)}%`;
}
