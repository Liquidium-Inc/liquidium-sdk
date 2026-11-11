import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "vite-plus/test";

test.each([
  { source: "const count = { count: 1 }.count;", expectedExitCode: 0 },
  {
    source: 'const count = Reflect.get({ count: 1 }, "count");',
    expectedExitCode: 1,
  },
])(
  "should return $expectedExitCode for $source",
  ({ source, expectedExitCode }) => {
    // given
    const fixtureDirectory = mkdtempSync(
      join(tmpdir(), "liquidium-anti-slop-")
    );

    const fixturePath = join(fixtureDirectory, "fixture.ts");
    const configPath = join(fixtureDirectory, ".oxlintrc.json");

    const pluginPath = fileURLToPath(
      new URL("../../tools/oxlint/anti-slop/index.ts", import.meta.url)
    );

    const linterPath = fileURLToPath(
      new URL("../../node_modules/oxlint/bin/oxlint", import.meta.url)
    );

    writeFileSync(fixturePath, `${source}\n`);
    writeFileSync(
      configPath,
      JSON.stringify({
        jsPlugins: [{ name: "anti-slop", specifier: pluginPath }],
        rules: { "anti-slop/no-reflect-get": "error" },
      })
    );

    try {
      // when
      const result = spawnSync(
        process.execPath,
        [linterPath, "--config", configPath, fixturePath],
        { encoding: "utf8" }
      );

      // then
      expect(result.error).toBeUndefined();
      expect(result.status, result.stdout + result.stderr).toBe(
        expectedExitCode
      );
    } finally {
      rmSync(fixtureDirectory, { recursive: true, force: true });
    }
  }
);
