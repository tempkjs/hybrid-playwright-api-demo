import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./src",
  timeout: 60000,
  retries: 1,
  reporter: [
    ["line"],                                     // CLI summary
    ["html", { open: "never", outputFolder: "playwright-report" }],  // HTML dashboard
    ["allure-playwright"]                         // Allure analytics
  ],
  use: {
    channel: 'chrome',
    headless: true,
    screenshot: "only-on-failure",
    trace: "on-first-retry",
    video: "retain-on-failure"
  },
  globalTeardown: "./globalTeardown.ts",
});
