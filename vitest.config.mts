import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    environment: "node",
    // Playwright owns *.spec.ts under e2e/.
    include: ["**/*.test.ts"],
    passWithNoTests: true,
  },
});
