import { expect } from '@playwright/test';
import { test } from '../../fixtures/authenticatedWorker';

test.describe('@ui Smoke', () => {
test("Sample Playwright smoke test", async ({ authenticatedPage }) => {
  await expect(authenticatedPage.locator('.rt-table')).toBeVisible();
});
});
