import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "vite-plus/test";

test.each([
  {
    source: "const count = { count: 1 }.count;",
    expectedExitCode: 0,
    expectedDiagnostic: null,
  },
  {
    source: 'const count = Reflect.get({ count: 1 }, "count");',
    expectedExitCode: 1,
    expectedDiagnostic: "anti-slop(no-reflect-get)",
  },
  {
    source: 'import { vi } from "vite-plus/test"; vi.mock("./dependency");',
    expectedExitCode: 1,
    expectedDiagnostic: "anti-slop(no-module-mocking)",
  },
  {
    source: 'import { vi } from "vite-plus/test"; vi.doMock("./dependency");',
    expectedExitCode: 1,
    expectedDiagnostic: "anti-slop(no-module-mocking)",
  },
  {
    source:
      'import { vi as mocks } from "vite-plus/test"; mocks.mock("./dependency");',
    expectedExitCode: 1,
    expectedDiagnostic: "anti-slop(no-module-mocking)",
  },
  {
    source: 'import { vi } from "vitest"; vi.mock("./dependency");',
    expectedExitCode: 1,
    expectedDiagnostic: "anti-slop(no-module-mocking)",
  },
  {
    source: 'import { jest } from "@jest/globals"; jest.mock("./dependency");',
    expectedExitCode: 1,
    expectedDiagnostic: "anti-slop(no-module-mocking)",
  },
  {
    source:
      'import { vi } from "vite-plus/test"; vi.spyOn({ run() {} }, "run");',
    expectedExitCode: 0,
    expectedDiagnostic: null,
  },
  {
    source: "const vi = { mock() {} }; vi.mock();",
    expectedExitCode: 0,
    expectedDiagnostic: null,
  },
])(
  "should return $expectedExitCode for $source",
  ({ source, expectedExitCode, expectedDiagnostic }) => {
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
        rules: {
          "anti-slop/no-reflect-get": "error",
          "anti-slop/no-module-mocking": "error",
        },
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

      if (expectedDiagnostic) {
        expect(result.stdout + result.stderr).toContain(expectedDiagnostic);
      }
    } finally {
      rmSync(fixtureDirectory, { recursive: true, force: true });
    }
  }
);
