import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "client",
          include: ["packages/client/src/**/*.{test,spec}.{ts,tsx}"],
        },
      },
    ],
  },
});
