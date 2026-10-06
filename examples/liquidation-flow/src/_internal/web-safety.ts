const MAX_BASE_UNIT_AMOUNT = 2n ** 256n - 1n;

const MAX_AMOUNT_DIGITS = 78;

const MAX_ASSET_DECIMALS = 18n;

const MAX_ASSET_AMOUNT_LENGTH = 100;

export function parseAssetAmountToBaseUnits(
  value: unknown,
  decimals: bigint,
  asset: string,
  maximumBaseUnits = MAX_BASE_UNIT_AMOUNT
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

  const [wholeDigits, fractionalDigits = ""] = value.split(".");
  const decimalPlaces = Number(decimals);

  if (fractionalDigits.length > decimalPlaces) {
    throw new Error(
      `${asset} supports up to ${decimalPlaces} decimal places. Remove the extra digits.`
    );
  }

  const amountBaseUnits =
    BigInt(wholeDigits) * 10n ** decimals +
    BigInt(fractionalDigits.padEnd(decimalPlaces, "0") || "0");

  if (amountBaseUnits <= 0n) {
    throw new Error(`Enter a ${asset} amount greater than zero.`);
  }

  if (amountBaseUnits > maximumBaseUnits) {
    throw new Error(
      `The ${asset} amount exceeds the configured limit. Enter a smaller amount.`
    );
  }

  return amountBaseUnits;
}

export function parseBaseUnitAmount(
  value: unknown,
  minimumBaseUnits: bigint,
  maximumBaseUnits = MAX_BASE_UNIT_AMOUNT
): bigint {
  if (
    typeof value !== "string" ||
    value.length > MAX_AMOUNT_DIGITS ||
    !/^\d+$/.test(value)
  ) {
    throw new Error("Enter a whole base-unit amount.");
  }

  const amountBaseUnits = BigInt(value);

  if (
    amountBaseUnits < minimumBaseUnits ||
    amountBaseUnits > maximumBaseUnits
  ) {
    throw new Error(
      `Amount must be between ${minimumBaseUnits} and ${maximumBaseUnits} base units.`
    );
  }

  return amountBaseUnits;
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
