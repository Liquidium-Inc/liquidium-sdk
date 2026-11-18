import { defineConfig } from "vite-plus";

const GENERATED_AND_TOOLING_IGNORE_PATTERNS = [
  ".agent/**",
  ".agents/**",
  ".claude/**",
  ".codex/**",
  ".continue/**",
  ".cursor/**",
  ".gemini/**",
  ".opencode/**",
  ".pi/**",
  ".roo/**",
  ".windsurf/**",
  "skills/**",
  "tools/oxlint/anti-slop/**",
  "packages/client/src/generated/**",
  "examples/sdk-method-query/src/generated-method-arg-references.ts",
];

export default defineConfig({
  fmt: {
    printWidth: 80,
    trailingComma: "es5",
    sortPackageJson: false,
    ignorePatterns: [
      "**/*.md",
      "**/*.mdx",
      "**/*.css",
      "**/*.html",
      ...GENERATED_AND_TOOLING_IGNORE_PATTERNS,
    ],
  },
  lint: {
    ignorePatterns: GENERATED_AND_TOOLING_IGNORE_PATTERNS,
    jsPlugins: [
      { name: "vite-plus", specifier: "vite-plus/oxlint-plugin" },
      { name: "anti-slop", specifier: "./tools/oxlint/anti-slop/index.ts" },
    ],
    rules: {
      "vite-plus/prefer-vite-plus-imports": "error",
      "oxc/no-accumulating-spread": "error",
      "anti-slop/no-array-filter-map": "error",
      "anti-slop/no-reduce-accumulator-copy": "error",
      "anti-slop/no-chained-type-assertions": "error",
      "anti-slop/no-conditional-empty-object-spread": "error",
      "anti-slop/no-known-value-widening": "error",
      "anti-slop/no-module-mocking": "error",
      "anti-slop/no-object-parameters": "error",
      "anti-slop/no-reflect-apply": "error",
      "anti-slop/no-reflect-get": "error",
      "anti-slop/no-runtime-typeof": "error",
      "anti-slop/no-shape-in-symbol-names": "error",
      "anti-slop/no-unknown-parameters": "error",
      "anti-slop/no-unknown-returns": "error",
      "anti-slop/no-unknown-type-aliases": "error",
      "anti-slop/no-unsafe-dictionary-type": "error",
      "anti-slop/no-widen-then-assert": "error",
      "anti-slop/require-readable-spacing": "error",
      "anti-slop/require-safety-comment-for-type-assertion": "error",
    },
    options: { typeAware: true, typeCheck: true },
  },
});
