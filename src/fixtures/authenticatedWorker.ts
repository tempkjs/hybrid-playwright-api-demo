import { config } from "../config/testConfig";
import { test as base, BrowserContext, Page } from "@playwright/test";
import * as fs from "fs";

export const test = base.extend<{
  authenticatedPage: Page;
}>({
  authenticatedPage: async ({ browser }, use, testInfo) => {
    const authDir = ".auth";
    if (!fs.existsSync(authDir)) {
      fs.mkdirSync(authDir);
    }

    const workerIndex = testInfo.workerIndex;
    const storageStateFile = `${authDir}/auth-${workerIndex}.json`;

    let context: BrowserContext;
    let page: Page;

        const baseURL = config.baseUrlUI;
    if (!baseURL) throw new Error("❌ BASE_URL not set!");
    else
      console.log("✅ BASE_URL found:", baseURL);

    // ✅ Reuse state if available
    if (fs.existsSync(storageStateFile)) {
      context = await browser.newContext({
        storageState: storageStateFile
      });
      page = await context.newPage();
      await page.goto(baseURL!);
    } else {
      context = await browser.newContext();
      page = await context.newPage();


    const userEmail = process.env.USER_EMAIL!;
  const userPassword = process.env.USER_PASSWORD!;

    if (!userEmail || !userPassword)
    throw new Error("❌ USER_EMAIL or USER_PASSWORD missing from env!");
  else{
    console.log("✅ USER_EMAIL and USER_PASSWORD found in env.");
 console.log("User Email:", userEmail);
 console.log("User Password:", userPassword);
  }

    // Perform login steps:
    await page.goto(baseURL! + '/login', { waitUntil: 'domcontentloaded' });
    await page.fill('#userName', userEmail);
    await page.fill('#password', userPassword);
    await page.click('button[id="login"]');
      await page.waitForURL(baseURL! + "/profile");

      // ✅ Save session for worker reuse
      await context.storageState({ path: storageStateFile });
    }

    await use(page);

    // Cleanup to avoid too many browser contexts
    await context.close();
  },
});
