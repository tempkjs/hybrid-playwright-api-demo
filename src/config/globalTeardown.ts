import { notifySlack } from "../utils/notifySlack";

export default async function globalTeardown() {
  await notifySlack("Allure report generated and uploaded successfully!");
}
