import { IncomingWebhook } from "@slack/webhook";

// Read webhook URL from environment variable (secure for CI/CD)
const url = process.env.SLACK_WEBHOOK_URL;

// Validate so it doesn’t break local runs
if (!url) {
  console.warn("⚠️  SLACK_WEBHOOK_URL not found in environment — Slack notifications disabled.");
}

const webhook = url ? new IncomingWebhook(url) : null;

/**
 * Sends a summary message to Slack once the test run completes.
 */
export async function notifySlack(summary: string) {
  if (!webhook) return;

  try {
    await webhook.send({
      text: `✅ Test Execution Completed\n${summary}`,
    });
    console.log("📤 Slack notification sent successfully!");
  } catch (err) {
    console.error("❌ Failed to send Slack notification:", err);
  }
}
