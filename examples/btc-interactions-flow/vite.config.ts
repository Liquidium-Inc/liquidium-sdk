import { createRequire } from "node:module";
import { dirname } from "node:path";
import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";

const resolveProjectPath = (path: string) =>
  fileURLToPath(new URL(path, import.meta.url));

const requireFromExample = createRequire(import.meta.url);
const nobleHashesUtilsPath = requireFromExample.resolve("@noble/hashes/utils");
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
    },
  },
  build: {
    chunkSizeWarningLimit: WALLET_STACK_CHUNK_SIZE_WARNING_LIMIT_KB,
    rollupOptions: {
      input: {
        main: "index.html",
        status: "status.html",
      },
      output: {
        manualChunks(id) {
          if (
            id.includes("@dynamic-labs") ||
            id.includes("@reown") ||
            id.includes("@walletconnect") ||
            id.includes("bitcoinjs-lib") ||
            id.includes("sats-connect") ||
            id.includes("ecpair") ||
            id.includes("@noble")
          ) {
            return "wallet-stack";
          }
        },
      },
    },
  },
});
