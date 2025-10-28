import { test, expect } from '@playwright/test';
import { Eyes, Target } from '@applitools/eyes-playwright';
import { config } from "../../config/testConfig";   // import base URLs

test.describe('@visual Visual Testing', () => {
test('Visual check of login page', async ({ page }) => {
  const eyes = new Eyes();
  await eyes.open(page, 'Hybrid Playwright Demo', 'Login Page Visual Test', { width: 1200, height: 800 });

  await page.goto(`${config.baseUrlUI}/login`); // or your app's URL
  await page.waitForTimeout(2000);
  await eyes.check('Main Page', Target.window().fully());

  await eyes.close();
});
});
