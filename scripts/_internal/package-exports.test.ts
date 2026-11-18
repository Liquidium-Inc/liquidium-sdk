import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { expect, test } from "vite-plus/test";

test("should build loadable ESM and CommonJS package exports", () => {
  // given
  const packageDirectory = new URL("../../packages/client/", import.meta.url);

  const expectedOutputPaths = [
    "dist/index.js",
    "dist/index.cjs",
    "dist/index.d.ts",
    "dist/index.d.cts",
  ];

  // when
  const outputFilesExist = expectedOutputPaths.map((outputPath) =>
    existsSync(new URL(outputPath, packageDirectory))
  );

  const exportNames = execFileSync(
    process.execPath,
    [
      "--input-type=module",
      "-e",
      `import { createRequire } from "node:module";
       import * as esm from "./dist/index.js";
       const cjs = createRequire(import.meta.url)("./dist/index.cjs");
       console.log(JSON.stringify([Object.keys(esm).sort(), Object.keys(cjs).sort()]));`,
    ],
    { cwd: fileURLToPath(packageDirectory), encoding: "utf8" }
  );

  // then
  expect(outputFilesExist).toEqual(expectedOutputPaths.map(() => true));
  const [esmExports, commonJsExports] = JSON.parse(exportNames);
  expect(esmExports).toContain("LiquidiumClient");
  expect(commonJsExports).toEqual(esmExports);
});
