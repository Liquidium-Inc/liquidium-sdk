import { defineConfig } from "vite-plus";

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
      "packages/client/src/generated/**",
      "examples/sdk-method-query/src/generated-method-arg-references.ts",
      "skills/**",
      "tools/oxlint/anti-slop/**",
    ],
  },
  lint: {
    ignorePatterns: [
      "packages/client/src/generated/**",
      "skills/**",
      "tools/oxlint/anti-slop/**",
    ],
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    rules: { "vite-plus/prefer-vite-plus-imports": "error" },
    options: { typeAware: true, typeCheck: true },
  },
});
