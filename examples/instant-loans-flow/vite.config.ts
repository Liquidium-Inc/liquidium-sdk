import { createRequire } from "node:module";
import { dirname } from "node:path";
import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";

const resolveProjectPath = (path: string) =>
  fileURLToPath(new URL(path, import.meta.url));

const requireFromExample = createRequire(import.meta.url);
const requireFromDynamicEthereum = createRequire(
  requireFromExample.resolve("@dynamic-labs/ethereum/package.json")
);
const requireFromDynamicEmbeddedWallet = createRequire(
  requireFromDynamicEthereum.resolve(
    "@dynamic-labs/embedded-wallet-evm/package.json"
  )
);
const nobleHashesUtilsPath = requireFromExample.resolve("@noble/hashes/utils");
const turnkeyApiKeyStamperDistPath = dirname(
  requireFromDynamicEmbeddedWallet.resolve("@turnkey/api-key-stamper")
);
const WALLET_STACK_CHUNK_SIZE_WARNING_LIMIT_KB = 6_000;

export default defineConfig({
  define: {
    global: "globalThis",
    process: {
      env: {},
      version: "v18.0.0",
    },
  },
  plugins: [
    react(),
    nodePolyfills({
      include: ["buffer", "process", "stream", "util"],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      protocolImports: true,
    }),
  ],
  resolve: {
    alias: {
      "@": resolveProjectPath("./src"),
      "@noble/hashes": dirname(nobleHashesUtilsPath),
      "@noble/hashes/utils": nobleHashesUtilsPath,
      "./nodecrypto.mjs": `${turnkeyApiKeyStamperDistPath}/webcrypto.mjs`,
    },
  },
  build: {
    chunkSizeWarningLimit: WALLET_STACK_CHUNK_SIZE_WARNING_LIMIT_KB,
    rollupOptions: {
      input: {
        main: "index.html",
        status: "status.html",
      },
      onwarn(warning, warn) {
        if (
          warning.code === "INVALID_ANNOTATION" &&
          warning.id?.includes("/node_modules/.pnpm/ox@")
        ) {
          return;
        }

        warn(warning);
      },
      output: {
        manualChunks(id) {
          if (
            id.includes("@dynamic-labs") ||
            id.includes("@reown") ||
            id.includes("@turnkey") ||
            id.includes("@walletconnect") ||
            id.includes("viem") ||
            id.includes("/ox/")
          ) {
            return "wallet-stack";
          }
        },
      },
    },
  },
});
