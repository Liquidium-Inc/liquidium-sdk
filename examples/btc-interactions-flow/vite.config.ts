import { createRequire } from "node:module";
import { dirname } from "node:path";
import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig, lazyPlugins } from "vite-plus";
import { nodePolyfills } from "vite-plugin-node-polyfills";

const resolveProjectPath = (path: string) =>
  fileURLToPath(new URL(path, import.meta.url));

const requireFromExample = createRequire(import.meta.url);
const nobleHashesUtilsPath = requireFromExample.resolve("@noble/hashes/utils");
const WALLET_STACK_CHUNK_SIZE_WARNING_LIMIT_KB = 6_000;

export default defineConfig(({ command }) => ({
  define: {
    global: "globalThis",
    process: {
      env: {},
      version: "v18.0.0",
    },
  },
  plugins: lazyPlugins(() => [
    react(),
    nodePolyfills({
      include: ["buffer", "process", "stream", "util"],
      globals: {
        Buffer: command === "build" ? "build" : "dev",
        global: command === "build" ? "build" : "dev",
        process: command === "build" ? "build" : "dev",
      },
      protocolImports: true,
    }),
  ]),
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
}));
