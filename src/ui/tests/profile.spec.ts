import { test } from "@playwright/test";
import { ProfilePage } from "../pages/profilePage";

test.describe('@ui', () => {
test("UI – validate user profile after global login", async ({ page }) => {
  const profilePage = new ProfilePage(page);
  await profilePage.goto();
  // await loginPage.login("kjplhyb", "Admin@123");
  await profilePage.verifyProfileLoad();
  const loggedUser = await page.locator("#userName-value").textContent();
  console.log(`Logged in as: ${loggedUser}`);
});

  test("UI - Logout and access control", async ({ page }) => {
    // ...
  });

});
