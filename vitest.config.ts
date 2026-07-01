import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: "client",
          include: ["packages/client/src/**/*.{test,spec}.{ts,tsx}"],
        },
      },
      {
        extends: true,
        test: {
          name: "client-e2e",
          include: ["packages/client/e2e/**/*.{test,spec}.{ts,tsx}"],
          fileParallelism: false,
          maxWorkers: 1,
          testTimeout: 120_000,
          hookTimeout: 120_000,
        },
      },
    ],
  },
});
