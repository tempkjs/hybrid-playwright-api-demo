import dotenv from "dotenv";
const ENV = process.env.NODE_ENV || "dev";
dotenv.config({ path: `./src/config/env/${ENV}.env` });
import { chromium, expect } from '@playwright/test';

async function globalSetup() {
    console.log("🔐 Running global setup to capture authenticated state...");

    const browser = await chromium.launch();
    const page = await browser.newPage();

    const baseURL = process.env.BASE_URL_UI;
    if (!baseURL) throw new Error("❌ BASE_URL not set!");

    await page.goto(`${baseURL}/login`);

    await page.fill("#userName", process.env.USER_EMAIL!);
    await page.fill("#password", process.env.USER_PASSWORD!);
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
