import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@liquidium/client": fileURLToPath(
        new URL("../../packages/client/src/index.ts", import.meta.url)
      ),
    },
  },
  optimizeDeps: { exclude: ["@liquidium/client"] },
});
