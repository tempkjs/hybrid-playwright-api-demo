import dotenv from "dotenv";
const ENV = process.env.NODE_ENV || "dev";
dotenv.config({ path: `./src/config/env/${ENV}.env` });
import { defineConfig } from "@playwright/test";

const tag = process.env.TAG;
console.log(`Running tests with tag: ${tag}`);

export default defineConfig({
  grep: tag ? new RegExp(tag) : undefined,
  globalSetup: "./globalSetup.ts",
  globalTeardown: "./globalTeardown.ts",
  testDir: "../",
  timeout: 60000,
  retries: 0,
  reporter: [
    ["line"],                                     
    ["html", { open: "never", outputFolder: "playwright-report" }], 
    ["allure-playwright"]                         
  ],
  use: {
    channel: 'chrome',
    headless: true,
    screenshot: "only-on-failure",
    trace: "on-first-retry",
    video: "retain-on-failure",
    storageState: 'src/config/storageState.json',
  },
});
