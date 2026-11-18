import { defineConfig } from "vite-plus";

export default defineConfig({
  pack: {
    entry: ["src/index.ts"],
    format: ["esm", "cjs"],
    fixedExtension: false,
    dts: true,
    sourcemap: true,
    clean: true,
    treeshake: true,
    deps: {
      neverBundle: [
        "@icp-sdk/canisters/ledger/icrc",
        "@icp-sdk/core/agent",
        "@icp-sdk/core/candid",
        "@icp-sdk/core/principal",
      ],
    },
    target: "es2022",
  },
});
