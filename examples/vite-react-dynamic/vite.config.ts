import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";

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
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@liquidium/client": fileURLToPath(
        new URL("../../packages/client/src/index.ts", import.meta.url)
      ),
      "@noble/hashes": fileURLToPath(
        new URL(
          "../../node_modules/.pnpm/@noble+hashes@1.8.0/node_modules/@noble/hashes",
          import.meta.url
        )
      ),
      "@noble/hashes/utils": fileURLToPath(
        new URL(
          "../../node_modules/.pnpm/@noble+hashes@1.8.0/node_modules/@noble/hashes/utils.js",
          import.meta.url
        )
      ),
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
