import { test } from '../../fixtures/authenticatedWorker';
import { ProfilePage } from "../pages/profilePage";

test.describe('@ui Profile', () => {
test("UI – validate user profile after global login", async ({ authenticatedPage }) => {
  const profilePage = new ProfilePage(authenticatedPage);
  await profilePage.goto();
  // await loginPage.login("kjplhyb", "Admin@123");
  await profilePage.verifyProfileLoad();
  const loggedUser = await authenticatedPage.locator("#userName-value").textContent();
  console.log(`Logged in as: ${loggedUser}`);
});

  test("UI - Logout and access control", async ({ page }) => {
    // ...
  });

});
