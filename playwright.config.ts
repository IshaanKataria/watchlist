import { existsSync } from "node:fs";

import { defineConfig, devices } from "@playwright/test";

// Setup and teardown reach Supabase with the service-role key, from the file `pnpm dev` reads.
if (existsSync(".env.local")) process.loadEnvFile(".env.local");

const baseURL = process.env.BASE_URL ?? "http://localhost:3000";

export default defineConfig({
  testDir: "e2e",
  // Every spec shares one database and the demo account, so tests take turns.
  workers: 1,
  // A dev server compiles each route on first visit and can take seconds to answer a refresh.
  expect: { timeout: 10_000 },
  globalTeardown: "./e2e/global-teardown.ts",
  use: { baseURL, trace: "retain-on-failure" },
  projects: [
    { name: "setup", testMatch: /auth\.setup\.ts/ },
    {
      name: "Desktop Chrome",
      use: { ...devices["Desktop Chrome"] },
      dependencies: ["setup"],
    },
    {
      name: "iPhone 14",
      use: { ...devices["iPhone 14"] },
      dependencies: ["setup"],
      // Plain HTTP: a phone changes nothing there.
      testIgnore: /security\.spec\.ts/,
    },
  ],
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: "pnpm build && pnpm start",
        url: baseURL,
        reuseExistingServer: true,
        timeout: 180_000,
      },
});
