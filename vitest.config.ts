import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary"],
    },
    environment: "node",
    globals: false,
    include: ["tests/**/*.test.ts"],
    passWithNoTests: false,
    restoreMocks: true,
  },
});
