import { runInNewContext } from "node:vm";
import { expect, test } from "vite-plus/test";
import { stringifyExampleValue } from "./stringify-example-value";

test("should display functions from another JavaScript realm", () => {
  // given
  const functionSource = "() => undefined";
  const submit = runInNewContext(functionSource);

  // when
  const result = stringifyExampleValue({ submit });

  // then
  const EXPECTED_RESULT = '{\n  "submit": "[Function submit]"\n}';
  expect(result).toBe(EXPECTED_RESULT);
});
