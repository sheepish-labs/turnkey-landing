import { defineConfig } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const isLocal = baseURL.startsWith("http://localhost");

export default defineConfig({
  testDir: "./e2e",
  use: { baseURL },
  ...(isLocal
    ? {
        webServer: {
          command: "npm run dev",
          url: "http://localhost:3000",
          reuseExistingServer: !process.env.CI,
          timeout: 30000,
        },
      }
    : {}),
});
