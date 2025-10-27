🧪 Hybrid Playwright + Axios Automation Framework

Enterprise-grade hybrid test automation framework integrating UI, API, and containerized execution — powered by Playwright, Axios, TypeScript, Docker, and Allure.

🚀 Overview

This project showcases a scalable hybrid test automation architecture built for real-world DevOps and cloud environments (e.g., SIDGS × Google Cloud).
It combines Playwright for UI automation, Axios for API validation, and Docker for reproducible test runs — all tied together with Allure + Playwright HTML reports and optional Slack notifications.

✅ Key Highlights
Capability	Description
🎭 UI Automation	Playwright + TypeScript with Page Object Model
🌐 API Testing	Axios + TypeScript for REST endpoints
⚙️ Config Management	.env + dotenv for environment isolation
🧩 Reporting	Playwright HTML + Allure dashboards
🐳 Containerization	Dockerized test runner for CI/CD
🔔 Notifications	Slack webhook summary on completion
☁️ CI/CD Ready	Jenkins + GitHub Actions integration
🧩 Framework Structure (click to expand)
<details>
src/
 ├── api/
 │   ├── clients/         → Axios clients for REST APIs
 │   └── tests/           → API test specs
 │
 ├── ui/
 │   ├── pages/           → Page Object Model classes
 │   └── tests/           → Playwright UI specs
 │
 ├── config/              → Environment config (.env + testConfig.ts)
 └── utils/               → Shared utilities (Slack, data, metrics)
</details>

⚙️ Setup Instructions
🧰 Prerequisites

Node ≥ 18

npm (or yarn)

Docker (optional for containerized runs)

1️⃣ Clone the Repository
git clone https://github.com/<your-username>/hybrid-playwright-api.git
cd hybrid-playwright-api

2️⃣ Install Dependencies
npm ci
npx playwright install

3️⃣ Configure Environment

Create a .env file in the project root:

BASE_URL_UI=https://demoqa.com
BASE_URL_API=https://jsonplaceholder.typicode.com
SLACK_WEBHOOK_URL=   # optional

▶️ Running Tests Locally
Run All Tests
npx playwright test

Run Specific Suites
# API tests
npx playwright test src/api/tests/userApi.spec.ts

# UI tests
npx playwright test src/ui/tests/login.spec.ts

View HTML Report
npx playwright show-report

🐳 Running in Docker
Build the Docker Image
docker build -t hybrid-playwright-api .

Execute Tests in Container
docker run --rm \
  -v $(pwd)/playwright-report:/usr/src/app/playwright-report \
  hybrid-playwright-api

View Report Locally
npx playwright show-report

📊 Allure Reporting (Advanced)

Generate a comprehensive analytics dashboard.

# Generate Allure report
allure generate allure-results --clean -o allure-report

# Open dashboard
allure open allure-report


Allure Includes:

Pass/fail analytics

Historical trends

Step-by-step logs & attachments

Screenshots + trace files

🔔 Slack Notifications (Optional)

Create a Slack Incoming Webhook and copy the URL.

Add it to .env:

SLACK_WEBHOOK_URL=https://hooks.slack.com/services/XXXX/XXXX/XXXX


The globalTeardown.ts automatically posts test-run summaries to Slack after execution.

### ☁️ CI/CD Integration

- **GitHub Actions:** Automated test execution and report upload are configured in  
  [`/.github/workflows/ci.yml`](.github/workflows/ci.yml)
<details>
<summary>🔧 GitHub Actions Workflow (click to expand)</summary>

```yaml
name: Hybrid QA Pipeline
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npx playwright install
      - run: npx playwright test
      - name: Upload HTML Report
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report
```
</details>

- **Jenkins Pipeline:** Declarative pipeline setup is available in  
  [`/Jenkinsfile`](./Jenkinsfile)

Both pipelines:
- Build the Docker image  
- Run hybrid UI + API tests  
- Publish Playwright and Allure reports  
- (Optionally) notify via Slack webhook 

📈 Sample Dashboards
Playwright HTML Report

Allure Dashboard

🧠 Future Enhancements

🤖 AI-driven selector self-healing

📈 Grafana + InfluxDB metrics export

☁️ GCP Cloud Build integration

🔧 API mocking / service virtualization layer

👨‍💻 Author

Kunal Jor
Delivery Lead | SDET Architect | QA Transformation Specialist (18+ years)

📧 kunaljor83@gmail.com
🌐 LinkedIn Profile

🏁 Summary
| Capability    | Status | Description                   |
| ------------- | ------ | ----------------------------- |
| UI Testing    | ✅      | Playwright + TypeScript (POM) |
| API Testing   | ✅      | Axios REST client             |
| Config Mgmt   | ✅      | `.env` + dotenv               |
| Reporting     | ✅      | Playwright + Allure           |
| CI/CD Ready   | ✅      | GitHub Actions + Jenkins      |
| Containerized | ✅      | Docker runtime                |
| Notifications | ✅      | Slack webhook                 |
