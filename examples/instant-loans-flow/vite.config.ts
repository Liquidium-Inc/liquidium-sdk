import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const resolveProjectPath = (path: string) =>
  fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolveProjectPath("./src"),
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
          warning.id?.includes("/node_modules/.pnpm/ox@")
        ) {
          return;
        }

        warn(warning);
      },
    },
  },
});
