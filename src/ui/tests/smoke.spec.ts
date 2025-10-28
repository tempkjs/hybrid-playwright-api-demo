import { test, expect } from "@playwright/test";

test.describe('@ui Smoke', () => {
test("Sample Playwright smoke test", async ({ page }) => {
  await page.goto("https://playwright.dev/");
  await expect(page).toHaveTitle(/Playwright/);
});
});
