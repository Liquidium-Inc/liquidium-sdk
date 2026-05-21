import { afterEach, describe, expect, test, vi } from "vitest";
import { computeExpiryTimestampFromNow } from "./time";

describe("computeExpiryTimestampFromNow", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  test("should return now plus default five minute validity", () => {
    // given
    const NOW_MS = 1_700_000_000_000;
    const CURRENT_TIME_SECONDS = 1_700_000_000n;
    const EXPECTED_EXPIRY_TIMESTAMP = CURRENT_TIME_SECONDS + 300n;
    vi.useFakeTimers();
    vi.setSystemTime(NOW_MS);

    // when
    const expiryTimestamp = computeExpiryTimestampFromNow();

    // then
    expect(expiryTimestamp).toBe(EXPECTED_EXPIRY_TIMESTAMP);
  });

  test("should return now plus a custom validity window", () => {
    // given
    const NOW_MS = 1_700_000_000_000;
    const CURRENT_TIME_SECONDS = 1_700_000_000n;
    const CUSTOM_VALIDITY_SECONDS = 42n;
    const EXPECTED_EXPIRY_TIMESTAMP =
      CURRENT_TIME_SECONDS + CUSTOM_VALIDITY_SECONDS;
    vi.useFakeTimers();
    vi.setSystemTime(NOW_MS);

    // when
    const expiryTimestamp = computeExpiryTimestampFromNow(
      CUSTOM_VALIDITY_SECONDS
    );

    // then
    expect(expiryTimestamp).toBe(EXPECTED_EXPIRY_TIMESTAMP);
  });
});
