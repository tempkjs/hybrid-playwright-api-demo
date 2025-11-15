const fs = require("fs");
const path = require("path");

// Input paths
const RESULTS_DIR = "report-artifacts/mabl-results";
const REPORT_DIR = "report-summary/mabl-report";

// Ensure output directory
fs.mkdirSync(REPORT_DIR, { recursive: true });

// Find the run folder
const runFolders = fs.readdirSync(RESULTS_DIR);
const runIdFolder = runFolders.find(f => fs.existsSync(`${RESULTS_DIR}/${f}/xray.json`));

if (!runIdFolder) {
  console.error("❌ No xray.json found in mabl-results/");
  process.exit(1);
}

const runPath = path.join(RESULTS_DIR, runIdFolder);
const jsonPath = path.join(runPath, "xray.json");

const data = JSON.parse(fs.readFileSync(jsonPath));

// ---- Generate MAIN SUMMARY PAGE ---- //
const summaryHtml = `
<html>
<head>
  <title>Mabl Report Summary</title>
</head>
<body>
<h1>Mabl Test Execution Report</h1>
<p><strong>Run ID:</strong> ${runIdFolder}</p>

<h2>Test Results</h2>
<ul>
${data.tests.map(t => `
  <li>
    <a href="./${t.testKey}.html">${t.testSummary}</a>
    — <strong>${t.status}</strong>
  </li>
`).join("")}
</ul>

</body>
</html>
`;

fs.writeFileSync(`${REPORT_DIR}/index.html`, summaryHtml);

// ---- Generate INDIVIDUAL TEST PAGES ---- //
data.tests.forEach(test => {
  const testHtml = `
  <html>
  <head>
    <title>${test.testSummary}</title>
  </head>
  <body>
    <h1>${test.testSummary}</h1>
    <p><strong>Status:</strong> ${test.status}</p>
    <pre>${JSON.stringify(test, null, 2)}</pre>
    <p><a href="index.html">⬅ Back to summary</a></p>
  </body>
  </html>
  `;

  fs.writeFileSync(`${REPORT_DIR}/${test.testKey}.html`, testHtml);
});

console.log("✅ Mabl HTML report generated at report-summary/mabl-report/");