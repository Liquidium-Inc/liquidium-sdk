import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  external: [
    "@icp-sdk/canisters/ledger/icrc",
    "@icp-sdk/core/agent",
    "@icp-sdk/core/candid",
    "@icp-sdk/core/principal",
  ],
});
