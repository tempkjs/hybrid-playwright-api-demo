const fs = require("fs");
const path = require("path");

/**
 * CONFIG — Adjust only if your folder structure changes
 */
const RESULTS_DIR = "report-artifacts/mabl-results";             // Where the xray_results_*.json file is unzipped
const REPORT_DIR = "./report-summary/mabl-report";               // Where HTML output should be written

/**
 * Utility: Make a string safe for filenames
 */
function safe(str) {
  return String(str).toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

/**
 * 1. Ensure output folder exists
 */
fs.mkdirSync(REPORT_DIR, { recursive: true });

console.log("📁 REPORT_DIR =", REPORT_DIR);
console.log("📁 RESULTS_DIR =", RESULTS_DIR);

/**
 * 2. Locate the xray_results_<runId>.json file
 */
const runFolders = fs.readdirSync(RESULTS_DIR);
const runJsonFile = runFolders.find((f) => f.startsWith("xray_results_") && f.endsWith(".json"));

if (!runJsonFile) {
  console.error("❌ No xray_results_*.json found in mabl-results/");
  process.exit(1);
}

const runJsonPath = path.join(RESULTS_DIR, runJsonFile);
const data = JSON.parse(fs.readFileSync(runJsonPath, "utf-8"));

/**
 * Extract runId from filename
 */
const runId = runJsonFile.replace("xray_results_", "").replace(".json", "");

console.log("🔍 Found Mabl run JSON:", runJsonFile);
console.log("🆔 Run ID:", runId);

/**
 * 3. Normalize test structure to support BOTH formats
 *
 * Case A — Multi-test:
 *   { tests: [ { testInfo, steps, status }, { ... } ] }
 *
 * Case B — Single test:
 *   { testInfo, steps, status }
 */
let testRuns = [];

if (Array.isArray(data.tests)) {
  console.log("📌 Detected multi-test run");
  testRuns = data.tests;
} else if (data.testInfo) {
  console.log("📌 Detected single-test run");
  testRuns = [data];
} else {
  console.error("❌ ERROR: JSON does not contain testInfo or tests[]");
  process.exit(1);
}

/**
 * 4. Generate HTML for each test
 */
testRuns.forEach((run, idx) => {
  const testName = run.testInfo?.summary || `Test-${idx + 1}`;

  // Robust test identifier selection
  const testId =
    run.testInfo?.id ||
    run.testInfo?.testId ||
    run.testInfo?.testRunId ||
    safe(testName);

  const filename = `${testId}.html`;
  const filePath = path.join(REPORT_DIR, filename);

  console.log(`📝 Writing report: ${filename}`);

// --------------------------
  // BUILD SELF-HEAL SECTION
  // --------------------------
  const runDir = path.join(RESULTS_DIR, runId); // mabl creates events.json under a folder named after runId
  const eventsPath = path.join(runDir, "events.json");

  let healHtml = "";

  if (fs.existsSync(eventsPath)) {
    const events = JSON.parse(fs.readFileSync(eventsPath, "utf-8"));
    const heals = events.filter(e => e.eventType === "SELF_HEAL");

    if (heals.length > 0) {
      healHtml += `
      <h2>Self-Healing Events</h2>
      `;

      heals.forEach(h => {
        healHtml += `
        <div style="padding:10px; border:1px solid #ccc; margin-bottom:10px;">
          <p><b>Original Locator:</b> ${h.originalLocator}</p>
          <p><b>Healed Locator:</b> ${h.healedLocator}</p>
          <p><b>Confidence:</b> ${(h.confidence * 100).toFixed(1)}%</p>
        </div>
        `;
      });

    } else {
      healHtml += `
      <h2>Self-Healing Events</h2>
      <p>No self-healing activity detected.</p>
      `;
    }

  } else {
    healHtml += `
    <h2>Self-Healing Events</h2>
    <p>No events.json found. No self-heal data available.</p>
    `;
  }

  const html = `
<html>
<head>
  <title>${testName}</title>
  <style>
    body { font-family: Arial; margin: 20px; }
    pre { padding: 12px; background: #f7f7f7; border-radius: 6px; }
    h1 { margin-bottom: 5px; }
    .status { font-size: 18px; margin-bottom: 15px; }
  </style>
</head>
<body>

<h1>${testName}</h1>
<div class="status"><strong>Status:</strong> ${run.status}</div>

<h2>Raw Test JSON</h2>
<pre>${JSON.stringify(run, null, 2)}</pre>

</body>
</html>
`;

  fs.writeFileSync(filePath, html);
});

/**
 * 5. Build index.html summary page
 */
console.log("📝 Writing index.html ...");

let indexHtml = `
<html>
<head>
  <title>Mabl Test Execution Report</title>
  <style>
    body { font-family: Arial; margin: 20px; }
    ul { margin-top: 12px; }
    li { margin-bottom: 8px; }
  </style>
</head>
<body>

<h1>Mabl Test Execution Report</h1>
<h3>Run ID: ${runId}</h3>

<h2>Test Results</h2>
<ul>
`;

testRuns.forEach((run, idx) => {
  const testName = run.testInfo?.summary || `Test-${idx + 1}`;

  const testId =
    run.testInfo?.id ||
    run.testInfo?.testId ||
    run.testInfo?.testRunId ||
    safe(testName);

  indexHtml += `
  <li>
    <a href="./${testId}.html">${testName}</a> — <strong>${run.status}</strong>
  </li>
`;
});

indexHtml += `
</ul>

</body>
</html>
`;

fs.writeFileSync(path.join(REPORT_DIR, "index.html"), indexHtml);

console.log("✅ Mabl HTML report generated successfully at", REPORT_DIR);