import type {
  ActivityFilter,
  Asset,
  AssetIdentifier,
  AssetPrices,
  Chain,
  InflowOperation,
  LiquidiumAccountInput,
  LiquidiumAccountType,
  Pool,
  SigningChain,
} from "@liquidium/client";
import { isAssetIdentifier } from "@liquidium/client";
import { z } from "zod";
import { UNDEFINED_JSON_VALUE } from "./stringify-example-value";

const MIN_LIST_LIMIT = 1;
const MAX_LIST_LIMIT = 1000;
const JSON_VALUE_SCHEMA = z.json();
const JSON_OBJECT_SCHEMA = z.record(z.string(), JSON_VALUE_SCHEMA);
const JSON_ARRAY_SCHEMA = z.array(JSON_VALUE_SCHEMA);
const INTEGER_SCHEMA = z.number().refine(Number.isInteger);

const POOL_BIGINT_SCHEMA = z
  .union([z.string(), INTEGER_SCHEMA])
  .transform((value) => expectBigInt(value, "pool amount"));

const OPTIONAL_POOL_BIGINT_SCHEMA = z
  .union([
    z.literal(UNDEFINED_JSON_VALUE).transform(() => undefined),
    POOL_BIGINT_SCHEMA,
  ])
  .optional();

const POOL_SCHEMA = z.object({
  id: z.string(),
  asset: z.enum(["BTC", "ETH", "ICP", "SOL", "USDC", "USDT"]),
  displayName: z.string(),
  chain: z.enum(["BTC", "ETH", "ICP", "SOL"]),
  decimals: POOL_BIGINT_SCHEMA,
  frozen: z.boolean(),
  totalSupply: POOL_BIGINT_SCHEMA,
  totalDebt: POOL_BIGINT_SCHEMA,
  availableLiquidity: POOL_BIGINT_SCHEMA,
  supplyCap: OPTIONAL_POOL_BIGINT_SCHEMA,
  borrowCap: OPTIONAL_POOL_BIGINT_SCHEMA,
  maxLtv: POOL_BIGINT_SCHEMA,
  liquidationThreshold: POOL_BIGINT_SCHEMA,
  liquidationBonus: POOL_BIGINT_SCHEMA,
  protocolLiquidationFee: POOL_BIGINT_SCHEMA,
  reserveFactor: POOL_BIGINT_SCHEMA,
  activationFee: POOL_BIGINT_SCHEMA,
  rateDecimals: POOL_BIGINT_SCHEMA,
  lendingRate: POOL_BIGINT_SCHEMA,
  estimatedLendingApy: POOL_BIGINT_SCHEMA,
  borrowingRate: POOL_BIGINT_SCHEMA,
  estimatedBorrowingApy: POOL_BIGINT_SCHEMA,
  utilizationRate: POOL_BIGINT_SCHEMA,
  baseRate: POOL_BIGINT_SCHEMA,
  optimalUtilizationRate: POOL_BIGINT_SCHEMA,
  rateSlopeBefore: POOL_BIGINT_SCHEMA,
  rateSlopeAfter: POOL_BIGINT_SCHEMA,
  lendingIndex: POOL_BIGINT_SCHEMA,
  borrowIndex: POOL_BIGINT_SCHEMA,
  sameAssetBorrowing: z.boolean(),
  sameAssetBorrowingDustThreshold: POOL_BIGINT_SCHEMA,
  lastUpdated: OPTIONAL_POOL_BIGINT_SCHEMA,
}) satisfies z.ZodType<Pool>;

export type MethodInput = z.infer<typeof JSON_VALUE_SCHEMA>;

export type MethodArgs = z.infer<typeof JSON_OBJECT_SCHEMA>;

export function parseMethodInput(input: string): MethodInput {
  return JSON_VALUE_SCHEMA.parse(JSON.parse(input));
}

export function expectObject(
  value: MethodInput | undefined,
  fieldName = "input"
): MethodArgs {
  const parsed = JSON_OBJECT_SCHEMA.safeParse(value);

  if (!parsed.success) {
    throw new Error(`${fieldName} must be a JSON object.`);
  }

  return parsed.data;
}

export function expectOptionalObject(
  value: MethodInput | undefined,
  fieldName: string
): MethodArgs | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  return expectObject(value, fieldName);
}

export function expectArray(
  value: MethodInput | undefined,
  fieldName: string
): MethodInput[] {
  const parsed = JSON_ARRAY_SCHEMA.safeParse(value);

  if (!parsed.success) {
    throw new Error(`${fieldName} must be an array.`);
  }

  return parsed.data;
}

export function expectNonEmptyString(
  value: MethodInput | undefined,
  fieldName: string
): string {
  const parsed = z.string().safeParse(value);

  if (!parsed.success) {
    throw new Error(`${fieldName} must be a string.`);
  }

  const trimmedValue = parsed.data.trim();

  if (!trimmedValue) {
    throw new Error(`${fieldName} is required.`);
  }

  return trimmedValue;
}

export function expectOptionalString(
  value: MethodInput | undefined,
  fieldName: string
): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  const parsed = z.string().safeParse(value);

  if (!parsed.success) {
    throw new Error(`${fieldName} must be a string when provided.`);
  }

  return parsed.data.trim() || undefined;
}

export function expectBigInt(
  value: MethodInput | undefined,
  fieldName: string
): bigint {
  const integer = INTEGER_SCHEMA.safeParse(value);

  if (integer.success) {
    return BigInt(integer.data);
  }

  const string = z.string().safeParse(value);

  if (!string.success) {
    throw new Error(
      `${fieldName} must be an integer string, number, or bigint.`
    );
  }

  const trimmedValue = string.data.trim();

  if (!trimmedValue) {
    throw new Error(`${fieldName} cannot be empty.`);
  }

  return BigInt(trimmedValue);
}

export function expectOptionalLimit(
  value: MethodInput | undefined,
  fieldName: string,
  maximumLimit = MAX_LIST_LIMIT
): number | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  const parsed = INTEGER_SCHEMA.safeParse(value);

  if (!parsed.success) {
    throw new Error(`${fieldName} must be an integer.`);
  }

  if (parsed.data < MIN_LIST_LIMIT || parsed.data > maximumLimit) {
    throw new Error(
      `${fieldName} must be between ${MIN_LIST_LIMIT} and ${maximumLimit}.`
    );
  }

  return parsed.data;
}

export function expectOptionalStringValues<T extends string>(
  value: MethodInput | undefined,
  fieldName: string,
  allowedValues: readonly T[]
): T[] | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  const values = expectArray(value, fieldName).map((item, index) =>
    expectNonEmptyString(item, `${fieldName}[${index}]`)
  );

  return values.map((value) => {
    const allowedValue = allowedValues.find((allowed) => allowed === value);

    if (allowedValue === undefined) {
      throw new Error(
        `${fieldName} must contain only: ${allowedValues.join(", ")}.`
      );
    }

    return allowedValue;
  });
}

export function expectChain(
  value: MethodInput | undefined,
  fieldName: string
): Chain {
  const chain = expectNonEmptyString(value, fieldName).toUpperCase();
  const parsed = z.enum(["BTC", "ETH", "ICP", "SOL"]).safeParse(chain);

  if (!parsed.success) {
    throw new Error(`${fieldName} must be BTC, ETH, ICP, or SOL.`);
  }

  return parsed.data;
}

export function expectSigningChain(
  value: MethodInput | undefined,
  fieldName: string
): SigningChain {
  const chain = expectNonEmptyString(value, fieldName).toUpperCase();
  const parsed = z.enum(["BTC", "ETH", "SOL"]).safeParse(chain);

  if (!parsed.success) {
    throw new Error(`${fieldName} must be BTC, ETH, or SOL.`);
  }

  return parsed.data;
}

export function expectAsset(
  value: MethodInput | undefined,
  fieldName: string
): Asset {
  const asset = expectNonEmptyString(value, fieldName).toUpperCase();

  const parsed = z
    .enum(["BTC", "ETH", "ICP", "SOL", "USDC", "USDT"])
    .safeParse(asset);

  if (!parsed.success) {
    throw new Error(`${fieldName} must be BTC, ETH, ICP, SOL, USDC, or USDT.`);
  }

  return parsed.data;
}

export function expectAssetIdentifier(
  assetValue: MethodInput | undefined,
  chainValue: MethodInput | undefined,
  fieldPrefix?: string
): AssetIdentifier {
  const assetField = fieldPrefix ? `${fieldPrefix}.asset` : "asset";
  const chainField = fieldPrefix ? `${fieldPrefix}.chain` : "chain";

  const identifier = {
    asset: expectAsset(assetValue, assetField),
    chain: expectChain(chainValue, chainField),
  };

  if (isAssetIdentifier(identifier)) {
    return identifier;
  }

  throw new Error(
    `${chainField} and ${assetField} must form a supported Chain + Asset pair.`
  );
}

export function expectReceiver(
  value: MethodInput | undefined,
  fieldName: string
): LiquidiumAccountInput {
  const string = z.string().safeParse(value);

  if (string.success) {
    return expectNonEmptyString(string.data, fieldName);
  }

  const receiver = expectObject(value, fieldName);

  const address = expectNonEmptyString(
    receiver.address,
    `${fieldName}.address`
  );

  if (receiver.type === undefined) {
    return address;
  }

  return {
    address,
    type: expectLiquidiumAccountType(receiver.type, `${fieldName}.type`),
  };
}

export function expectOptionalInflowChain(
  value: MethodInput | undefined,
  fieldName: string
): SigningChain | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  return expectSigningChain(value, fieldName);
}

export function expectSupplyAction(
  value: MethodInput | undefined,
  fieldName: string
): InflowOperation {
  const action = expectNonEmptyString(value, fieldName).toLowerCase();
  const parsed = z.enum(["deposit", "repayment"]).safeParse(action);

  if (!parsed.success) {
    throw new Error(`${fieldName} must be deposit or repayment.`);
  }

  return parsed.data;
}

export function expectOptionalSupplyMechanism(
  value: MethodInput | undefined,
  fieldName: string
): "contractInteraction" | undefined {
  const mechanism = expectOptionalString(value, fieldName);

  if (!mechanism) {
    return undefined;
  }

  if (mechanism === "contractInteraction") {
    return mechanism;
  }

  throw new Error(`${fieldName} must be contractInteraction when provided.`);
}

export function expectOptionalActivityFilter(
  value: MethodInput | undefined,
  fieldName: string
): ActivityFilter | undefined {
  const filter = expectOptionalString(value, fieldName);

  if (!filter) {
    return undefined;
  }

  const parsed = z.enum(["active", "completed", "all"]).safeParse(filter);

  if (!parsed.success) {
    throw new Error(`${fieldName} must be active, completed, or all.`);
  }

  return parsed.data;
}

export function expectPools(value: MethodInput | undefined): Pool[] {
  return z.array(POOL_SCHEMA).parse(expectArray(value, "pools"));
}

export function expectAssetPrices(value: MethodInput | undefined): AssetPrices {
  return z.record(z.string(), z.number()).parse(expectObject(value, "prices"));
}

function expectLiquidiumAccountType(
  value: MethodInput | undefined,
  fieldName: string
): LiquidiumAccountType {
  const accountType = expectNonEmptyString(value, fieldName);

  const parsed = z
    .enum([
      "ChainAddress",
      "IcPrincipal",
      "IcpAccountIdentifier",
      "IcrcAccount",
    ])
    .safeParse(accountType);

  if (!parsed.success) {
    throw new Error(
      `${fieldName} must be ChainAddress, IcPrincipal, IcpAccountIdentifier, or IcrcAccount.`
    );
  }

  return parsed.data;
}
