import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";

const resolveProjectPath = (path: string) =>
  fileURLToPath(new URL(path, import.meta.url));

const turnkeyApiKeyStamperDistPath =
  "../../node_modules/.pnpm/@turnkey+api-key-stamper@0.4.7/node_modules/@turnkey/api-key-stamper/dist";
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
      "@liquidium/client": resolveProjectPath(
        "../../packages/client/src/index.ts"
      ),
      "@noble/hashes": resolveProjectPath(
        "../../node_modules/.pnpm/@noble+hashes@1.8.0/node_modules/@noble/hashes"
      ),
      "@noble/hashes/utils": resolveProjectPath(
        "../../node_modules/.pnpm/@noble+hashes@1.8.0/node_modules/@noble/hashes/utils.js"
      ),
      "./nodecrypto.mjs": resolveProjectPath(
        `${turnkeyApiKeyStamperDistPath}/webcrypto.mjs`
      ),
    },
  },
  build: {
    chunkSizeWarningLimit: WALLET_STACK_CHUNK_SIZE_WARNING_LIMIT_KB,
    rollupOptions: {
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
  optimizeDeps: {
    exclude: ["@liquidium/client"],
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
