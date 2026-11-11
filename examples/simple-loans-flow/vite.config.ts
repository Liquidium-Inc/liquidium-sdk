import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig, lazyPlugins } from "vite-plus";

const resolveProjectPath = (path: string) =>
  fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  plugins: lazyPlugins(() => [react()]),
  resolve: {
    alias: {
      "@": resolveProjectPath("./src"),
      "@liquidium/client": resolveProjectPath(
        "../../packages/client/src/index.ts"
      ),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
        status: "status.html",
      },
      onwarn(warning, warn) {
        if (
          warning.code === "INVALID_ANNOTATION" &&
          warning.id?.includes("/node_modules/ox/")
        ) {
          return;
        }

        warn(warning);
      },
    },
  },
  optimizeDeps: {
    exclude: ["@liquidium/client"],
  },
});
