import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite-plus";

export default defineConfig({
  resolve: {
    alias: {
      "@liquidium/client": fileURLToPath(
        new URL("../../packages/client/src/index.ts", import.meta.url)
      ),
    },
  },
  test: { include: ["src/_internal/*.test.ts"] },
});
