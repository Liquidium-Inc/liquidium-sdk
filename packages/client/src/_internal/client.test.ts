import { describe, expect, test } from "vitest";
import { LiquidiumClient, LiquidiumError, LiquidiumErrorCode } from "../index";

describe("LiquidiumClient", () => {
  test("creates a client with default mainnet config", () => {
    // given
    const config = {};

    // when
    const client = LiquidiumClient.create(config);

    // then
    expect(client).toBeDefined();
    expect(client.accounts).toBeDefined();
    expect(client.lending).toBeDefined();
    expect(client.positions).toBeDefined();
    expect(client.market).toBeDefined();
    expect(client.activities).toBeDefined();
    expect(client.history).toBeDefined();
  });

  test("creates a client with API base URL", () => {
    // given
    const config = {
      apiBaseUrl: "https://app.liquidium.fi/api",
    };

    // when
    const client = LiquidiumClient.create(config);

    // then
    expect(client).toBeDefined();
  });
});

describe("LiquidiumError", () => {
  test("constructs with code and message", () => {
    // given
    const code = LiquidiumErrorCode.POOL_NOT_FOUND;
    const message = "Pool xyz not found";

    // when
    const error = new LiquidiumError(code, message);

    // then
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("LiquidiumError");
    expect(error.code).toBe("POOL_NOT_FOUND");
    expect(error.message).toBe(message);
  });

  test("defaults message to error code", () => {
    // given
    const code = LiquidiumErrorCode.INTERNAL;

    // when
    const error = new LiquidiumError(code);

    // then
    expect(error.message).toBe("INTERNAL");
  });

  test("preserves cause", () => {
    // given
    const original = new Error("network failure");

    // when
    const error = new LiquidiumError(
      LiquidiumErrorCode.NETWORK_ERROR,
      "Failed to connect",
      original
    );

    // then
    expect(error.cause).toBe(original);
  });
});
