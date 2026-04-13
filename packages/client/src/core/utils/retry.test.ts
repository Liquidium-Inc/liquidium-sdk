import { describe, expect, test, vi } from "vitest";
import { retryWithBackoff } from "./retry";

describe("retryWithBackoff", () => {
  test("should retry retriable errors and apply exponential backoff delays", async () => {
    // given
    const FIRST_DELAY_MS = 50;
    const SECOND_DELAY_MS = 100;
    const MAX_ATTEMPTS = 3;
    const INITIAL_RETRY_DELAY_MS = FIRST_DELAY_MS;
    const BACKOFF_MULTIPLIER = 2;
    const RETRIABLE_ERROR = new Error("retriable");
    const EXPECTED_RESULT = "ok";
    const executeMock = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(RETRIABLE_ERROR)
      .mockRejectedValueOnce(RETRIABLE_ERROR)
      .mockResolvedValueOnce(EXPECTED_RESULT);
    const waitForDelayMsMock = vi.fn<(delayMs: number) => Promise<void>>();
    waitForDelayMsMock.mockResolvedValue(undefined);

    // when
    const result = await retryWithBackoff({
      execute: executeMock,
      maxAttempts: MAX_ATTEMPTS,
      initialRetryDelayMs: INITIAL_RETRY_DELAY_MS,
      backoffMultiplier: BACKOFF_MULTIPLIER,
      shouldRetryError: () => true,
      waitForDelayMs: waitForDelayMsMock,
    });

    // then
    expect(result).toBe(EXPECTED_RESULT);
    expect(executeMock).toHaveBeenCalledTimes(MAX_ATTEMPTS);
    expect(waitForDelayMsMock).toHaveBeenNthCalledWith(1, FIRST_DELAY_MS);
    expect(waitForDelayMsMock).toHaveBeenNthCalledWith(2, SECOND_DELAY_MS);
  });

  test("should throw immediately for non-retriable errors", async () => {
    // given
    const MAX_ATTEMPTS = 4;
    const INITIAL_RETRY_DELAY_MS = 10;
    const BACKOFF_MULTIPLIER = 2;
    const NON_RETRIABLE_ERROR = new Error("non-retriable");
    const executeMock = vi
      .fn<() => Promise<void>>()
      .mockRejectedValueOnce(NON_RETRIABLE_ERROR);
    const waitForDelayMsMock = vi.fn<(delayMs: number) => Promise<void>>();
    waitForDelayMsMock.mockResolvedValue(undefined);

    // when / then
    await expect(
      retryWithBackoff({
        execute: executeMock,
        maxAttempts: MAX_ATTEMPTS,
        initialRetryDelayMs: INITIAL_RETRY_DELAY_MS,
        backoffMultiplier: BACKOFF_MULTIPLIER,
        shouldRetryError: () => false,
        waitForDelayMs: waitForDelayMsMock,
      })
    ).rejects.toBe(NON_RETRIABLE_ERROR);
    expect(executeMock).toHaveBeenCalledTimes(1);
    expect(waitForDelayMsMock).not.toHaveBeenCalled();
  });

  test("should throw for invalid retry option values", async () => {
    // given
    const execute = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);
    const NEGATIVE_DELAY_MS = -1;
    const INVALID_MAX_ATTEMPTS = 0;
    const INVALID_BACKOFF_MULTIPLIER = 0;

    // when / then
    await expect(
      retryWithBackoff({
        execute,
        maxAttempts: INVALID_MAX_ATTEMPTS,
        initialRetryDelayMs: 0,
        backoffMultiplier: 1,
        shouldRetryError: () => true,
      })
    ).rejects.toThrow("maxAttempts");

    await expect(
      retryWithBackoff({
        execute,
        maxAttempts: 1,
        initialRetryDelayMs: NEGATIVE_DELAY_MS,
        backoffMultiplier: 1,
        shouldRetryError: () => true,
      })
    ).rejects.toThrow("initialRetryDelayMs");

    await expect(
      retryWithBackoff({
        execute,
        maxAttempts: 1,
        initialRetryDelayMs: 0,
        backoffMultiplier: INVALID_BACKOFF_MULTIPLIER,
        shouldRetryError: () => true,
      })
    ).rejects.toThrow("backoffMultiplier");
  });
});
