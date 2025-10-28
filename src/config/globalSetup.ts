import { config } from "./testConfig";
import { chromium, expect } from '@playwright/test';

async function globalSetup() {
    console.log("🔐 Running global setup to capture authenticated state...");

    console.log("Following config is being used for global setup:", config)

    const browser = await chromium.launch();
    const page = await browser.newPage();


    const baseURL = config.baseUrlUI;
    if (!baseURL) throw new Error("❌ BASE_URL not set!");

      const userEmail = process.env.USER_EMAIL!;
  const userPassword = process.env.USER_PASSWORD!;

  if (!userEmail || !userPassword)
    throw new Error("❌ USER_EMAIL or USER_PASSWORD missing from env!");

    await page.goto(`${baseURL}/login`);

    await page.fill("#userName", userEmail);
    await page.fill("#password", userPassword);
    await page.click("button[id='login']");

    await expect(page.locator("label[id='userName-value']")).toBeVisible();

    await page.waitForURL("**/profile", { timeout: 10_000 });

    await page.context().storageState({
        path: "src/config/storageState.json",
    });

    console.log("✅ Auth state stored for reuse by UI tests.");

    await browser.close();
}

export default globalSetup;
