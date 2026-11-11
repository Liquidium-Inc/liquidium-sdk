import type { Pool } from "@liquidium/client";
import { expect, test } from "vite-plus/test";
import {
  expectAssetIdentifier,
  expectAssetPrices,
  expectBigInt,
  expectNonEmptyString,
  expectObject,
  expectOptionalLimit,
  expectOptionalObject,
  expectOptionalString,
  expectOptionalStringValues,
  expectPools,
  expectReceiver,
  parseMethodInput,
} from "./method-input";
import {
  stringifyExampleValue,
  UNDEFINED_JSON_VALUE,
} from "./stringify-example-value";

test("decodes nested JSON before reading method fields", () => {
  // given
  const input = '{"amount":"123","filters":{"limit":20},"items":[null,true]}';

  // when
  const result = expectObject(parseMethodInput(input));

  // then
  const EXPECTED_INPUT = {
    amount: "123",
    filters: { limit: 20 },
    items: [null, true],
  };

  expect(result).toEqual(EXPECTED_INPUT);
});

test.each(["{", '{"amount":1e400}'])(
  "rejects invalid or non-finite JSON input %s",
  (input) => {
    // given
    const parse = () => parseMethodInput(input);

    // when
    const result = parse;

    // then
    expect(result).toThrow();
  }
);

test.each([null, [], "text", true])(
  "keeps the object validation message for %j",
  (input) => {
    // given
    const fieldName = "filters";

    // when
    const parse = () => expectObject(input, fieldName);

    // then
    expect(parse).toThrow(`${fieldName} must be a JSON object.`);
  }
);

test.each([undefined, null])(
  "accepts an omitted optional object %j",
  (input) => {
    // given
    const fieldName = "filters";

    // when
    const result = expectOptionalObject(input, fieldName);

    // then
    expect(result).toBeUndefined();
  }
);

test.each([
  { input: null, message: "account must be a string." },
  { input: "  ", message: "account is required." },
])("keeps required string errors for $input", ({ input, message }) => {
  // given
  const fieldName = "account";

  // when
  const parse = () => expectNonEmptyString(input, fieldName);

  // then
  expect(parse).toThrow(message);
});

test.each([undefined, null, "  "])(
  "accepts an omitted or empty optional string %j",
  (input) => {
    // given
    const fieldName = "cursor";

    // when
    const result = expectOptionalString(input, fieldName);

    // then
    expect(result).toBeUndefined();
  }
);

test("trims strings and keeps the optional string error", () => {
  // given
  const input = "  wallet-address  ";
  const invalidInput = false;
  const fieldName = "account";

  // when
  const result = expectNonEmptyString(input, fieldName);
  const parseInvalid = () => expectOptionalString(invalidInput, fieldName);

  // then
  const EXPECTED_ADDRESS = "wallet-address";
  expect(result).toBe(EXPECTED_ADDRESS);
  expect(parseInvalid).toThrow(`${fieldName} must be a string when provided.`);
});

test.each([
  { input: 0, expected: 0n },
  { input: -1, expected: -1n },
  { input: Number.MAX_SAFE_INTEGER, expected: BigInt(Number.MAX_SAFE_INTEGER) },
  { input: " 9007199254740993 ", expected: 9007199254740993n },
])(
  "converts integer input $input without changing its value",
  ({ input, expected }) => {
    // given
    const fieldName = "amount";

    // when
    const result = expectBigInt(input, fieldName);

    // then
    expect(result).toBe(expected);
  }
);

test.each([
  { input: "  ", message: "amount cannot be empty." },
  {
    input: 1.5,
    message: "amount must be an integer string, number, or bigint.",
  },
  {
    input: true,
    message: "amount must be an integer string, number, or bigint.",
  },
])("keeps integer input errors for $input", ({ input, message }) => {
  // given
  const fieldName = "amount";

  // when
  const parse = () => expectBigInt(input, fieldName);

  // then
  expect(parse).toThrow(message);
});

test.each([1, 100, 200])("accepts list limit %i at its bounds", (input) => {
  // given
  const maximumLimit = 200;
  const fieldName = "filters.limit";

  // when
  const result = expectOptionalLimit(input, fieldName, maximumLimit);

  // then
  expect(result).toBe(input);
});

test.each([0, 201])("keeps the list limit bounds for %i", (input) => {
  // given
  const maximumLimit = 200;
  const minimumLimit = 1;
  const fieldName = "filters.limit";

  // when
  const parse = () => expectOptionalLimit(input, fieldName, maximumLimit);

  // then
  expect(parse).toThrow(
    `${fieldName} must be between ${minimumLimit} and ${maximumLimit}.`
  );
});

test.each(["20", 1.5])("keeps the integer limit error for %j", (input) => {
  // given
  const fieldName = "filters.limit";

  // when
  const parse = () => expectOptionalLimit(input, fieldName);

  // then
  expect(parse).toThrow(`${fieldName} must be an integer.`);
});

test("keeps operation order, duplicate values, and whitespace trimming", () => {
  // given
  const allowedOperations = ["deposit", "borrow"] as const;
  const operations = [" borrow ", "deposit", "borrow"];
  const fieldName = "filters.operations";

  // when
  const result = expectOptionalStringValues(
    operations,
    fieldName,
    allowedOperations
  );

  // then
  const EXPECTED_OPERATIONS = ["borrow", "deposit", "borrow"];
  expect(result).toEqual(EXPECTED_OPERATIONS);
});

test("keeps the allowed operation error without asserting array types", () => {
  // given
  const allowedOperations = ["deposit", "borrow"] as const;
  const operations = ["repayment"];
  const fieldName = "filters.operations";

  // when
  const parse = () =>
    expectOptionalStringValues(operations, fieldName, allowedOperations);

  // then
  expect(parse).toThrow(`${fieldName} must contain only: deposit, borrow.`);
});

test("normalizes supported asset routes and rejects unsupported pairs", () => {
  // given
  const asset = " btc ";
  const chain = " icp ";
  const invalidChain = "ETH";

  // when
  const result = expectAssetIdentifier(asset, chain);
  const parseInvalid = () => expectAssetIdentifier(asset, invalidChain);

  // then
  const EXPECTED_IDENTIFIER = { asset: "BTC", chain: "ICP" };

  expect(result).toEqual(EXPECTED_IDENTIFIER);
  expect(parseInvalid).toThrow(
    "chain and asset must form a supported Chain + Asset pair."
  );
});

test("keeps receiver strings and typed receiver addresses", () => {
  // given
  const address = "wallet-address";
  const receiver = { type: "ChainAddress", address };
  const fieldName = "receiver";

  // when
  const stringResult = expectReceiver(` ${address} `, fieldName);
  const objectResult = expectReceiver(receiver, fieldName);
  const untypedResult = expectReceiver({ address }, fieldName);

  // then
  expect(stringResult).toBe(address);
  expect(objectResult).toEqual(receiver);
  expect(untypedResult).toBe(address);
});

test("decodes serialized pool bigint fields and optional undefined markers", () => {
  // given
  const pool = createPool();
  const input = stringifyExampleValue([pool]);

  // when
  const result = expectPools(parseMethodInput(input));

  // then
  expect(result).toEqual([pool]);
});

test("rejects incomplete pool data before calling the quote method", () => {
  // given
  const input = [{ id: "pool-id" }];

  // when
  const parse = () => expectPools(input);

  // then
  expect(parse).toThrow();
});

test("decodes numeric asset prices and rejects string prices", () => {
  // given
  const assetPriceUsd = 100_000;
  const prices = { BTC: assetPriceUsd };
  const invalidPrices = { BTC: String(assetPriceUsd) };

  // when
  const result = expectAssetPrices(prices);
  const parseInvalid = () => expectAssetPrices(invalidPrices);

  // then
  expect(result).toEqual(prices);
  expect(parseInvalid).toThrow();
});

test("keeps SDK result display values for bigint, functions, undefined, and errors", () => {
  // given
  const amount = 123n;
  const error = new Error("SDK request failed.");

  const payload = {
    amount,
    submit: () => undefined,
    missing: undefined,
    error,
  };

  // when
  const result = parseMethodInput(stringifyExampleValue(payload));

  // then
  const EXPECTED_PAYLOAD = {
    amount: amount.toString(),
    submit: "[Function submit]",
    missing: UNDEFINED_JSON_VALUE,
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack ?? UNDEFINED_JSON_VALUE,
    },
  };

  expect(result).toEqual(EXPECTED_PAYLOAD);
});

function createPool(): Pool {
  const amount = 100_000n;
  const rate = 1n;
  const decimals = 8n;
  const rateDecimals = 27n;
  const maxLtvBps = 6800n;

  return {
    id: "pool-id",
    asset: "BTC",
    displayName: "Bitcoin",
    chain: "BTC",
    decimals,
    frozen: false,
    totalSupply: amount,
    totalDebt: amount,
    availableLiquidity: amount,
    supplyCap: undefined,
    borrowCap: amount,
    maxLtv: maxLtvBps,
    liquidationThreshold: maxLtvBps,
    liquidationBonus: rate,
    protocolLiquidationFee: rate,
    reserveFactor: rate,
    activationFee: rate,
    rateDecimals,
    lendingRate: rate,
    estimatedLendingApy: rate,
    borrowingRate: rate,
    estimatedBorrowingApy: rate,
    utilizationRate: rate,
    baseRate: rate,
    optimalUtilizationRate: rate,
    rateSlopeBefore: rate,
    rateSlopeAfter: rate,
    lendingIndex: rate,
    borrowIndex: rate,
    sameAssetBorrowing: false,
    sameAssetBorrowingDustThreshold: amount,
    lastUpdated: undefined,
  };
}
