import { Page, expect } from "@playwright/test";
import { config } from "../../config/testConfig";   // import base URLs

export class ProfilePage {
  constructor(private page: Page) {}
  async goto() { await this.page.goto(`${config.baseUrlUI}/login`); }
  async login(u: string, p: string) {
    await this.page.fill("#userName", u);
    await this.page.fill("#password", p);
    await this.page.click("button[id='login']");
  }
  async verifyProfileLoad() { await expect(this.page.locator("#userName-value")).toHaveText('kjplhyb') }
}
