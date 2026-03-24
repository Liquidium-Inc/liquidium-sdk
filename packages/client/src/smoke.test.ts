import { describe, expect, test } from "vitest";

describe("client package", () => {
  test("smoke test", () => {
    // given
    const isSdkTestEnvironmentReady = true;

    // when
    const result = isSdkTestEnvironmentReady;

    // then
    const EXPECTED_RESULT = true;
    expect(result).toBe(EXPECTED_RESULT);
  });
});
