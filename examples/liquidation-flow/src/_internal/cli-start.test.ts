import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const CLI_START_TIMEOUT_10_SECONDS_MS = 10_000;

test("loads the compiled CLI before validating its configuration", () => {
  // given
  const cliEntryPath = fileURLToPath(new URL("../index.js", import.meta.url));

  const environment = {
    ...process.env,
    LIQUIDATOR_IDENTITY_PEM_PATH: "",
  };

  // when
  const result = spawnSync(process.execPath, [cliEntryPath], {
    encoding: "utf8",
    env: environment,
    timeout: CLI_START_TIMEOUT_10_SECONDS_MS,
  });

  // then
  const EXPECTED_EXIT_CODE = 1;

  const EXPECTED_CONFIGURATION_ERROR =
    "LIQUIDATOR_IDENTITY_PEM_PATH is required";

  assert.equal(result.error, undefined);
  assert.equal(result.status, EXPECTED_EXIT_CODE);
  assert.ok(result.stderr.includes(EXPECTED_CONFIGURATION_ERROR));
});
