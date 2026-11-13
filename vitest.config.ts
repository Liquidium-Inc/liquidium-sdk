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
          name: "p2p-evm",
          include: ["packages/p2p-evm/src/**/*.{test,spec}.{ts,tsx}"],
        },
      },
      {
        extends: true,
        test: {
          name: "example-wallet",
          include: ["examples/sdk-method-query/src/_internal/**/*.test.ts"],
        },
      },
      {
        extends: true,
        test: {
          name: "release",
          include: ["scripts/_internal/**/*.test.ts"],
        },
      },
      {
        extends: true,
        test: {
          name: "client-e2e",
          include: ["e2e/**/*.{test,spec}.{ts,tsx}"],
          fileParallelism: false,
          maxWorkers: 1,
          testTimeout: 120_000,
          hookTimeout: 120_000,
        },
      },
    ],
  },
});
