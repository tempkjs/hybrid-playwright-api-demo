import { test } from "@playwright/test";
import { LoginPage } from "../pages/loginPage";

test("UI – login flow", async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login("kjplhyb", "Admin@123");
  await loginPage.verifyLogin();
});
