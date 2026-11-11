import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig, lazyPlugins } from "vite-plus";

export default defineConfig({
  plugins: lazyPlugins(() => [react()]),
  resolve: {
    alias: {
      "@liquidium/client": fileURLToPath(
        new URL("../../packages/client/src/index.ts", import.meta.url)
      ),
    },
  },
  optimizeDeps: { exclude: ["@liquidium/client"] },
});
