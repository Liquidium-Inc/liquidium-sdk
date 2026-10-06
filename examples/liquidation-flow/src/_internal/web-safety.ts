const MAX_BASE_UNIT_AMOUNT = 2n ** 256n - 1n;
const MAX_AMOUNT_DIGITS = 78;
const MAX_ASSET_DECIMALS = 18n;
const MAX_ASSET_AMOUNT_LENGTH = 100;

export function parseAssetAmount(
  value: unknown,
  decimals: bigint,
  asset: string,
  maximum = MAX_BASE_UNIT_AMOUNT
): bigint {
  if (decimals < 0n || decimals > MAX_ASSET_DECIMALS) {
    throw new Error("Unsupported asset precision.");
  }
  if (
    typeof value !== "string" ||
    value.length > MAX_ASSET_AMOUNT_LENGTH ||
    !/^\d+(\.\d+)?$/.test(value)
  ) {
    throw new Error(`Enter a ${asset} amount, such as 1 or 0.5.`);
  }
  const [whole, fraction = ""] = value.split(".");
  const precision = Number(decimals);
  if (fraction.length > precision) {
    throw new Error(
      `${asset} supports up to ${precision} decimal places. Remove the extra digits.`
    );
  }
  const amount =
    BigInt(whole) * 10n ** decimals +
    BigInt(fraction.padEnd(precision, "0") || "0");
  if (amount <= 0n)
    throw new Error(`Enter a ${asset} amount greater than zero.`);
  if (amount > maximum)
    throw new Error(
      `The ${asset} amount exceeds the configured limit. Enter a smaller amount.`
    );
  return amount;
}

export function parseAmount(
  value: unknown,
  minimum: bigint,
  maximum = MAX_BASE_UNIT_AMOUNT
): bigint {
  if (
    typeof value !== "string" ||
    value.length > MAX_AMOUNT_DIGITS ||
    !/^\d+$/.test(value)
  ) {
    throw new Error("Enter a whole base-unit amount.");
  }
  const amount = BigInt(value);
  if (amount < minimum || amount > maximum) {
    throw new Error(
      `Amount must be between ${minimum} and ${maximum} base units.`
    );
  }
  return amount;
}

export function requireLocalRequest(
  host: string | undefined,
  origin: string | undefined,
  expectedOrigin: string
): void {
  if (
    host !== new URL(expectedOrigin).host ||
    (origin !== undefined && origin !== expectedOrigin)
  ) {
    throw new Error("Only requests from this local UI are allowed.");
  }
}
