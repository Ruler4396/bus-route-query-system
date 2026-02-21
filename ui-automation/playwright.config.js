const { defineConfig } = require('@playwright/test');
const fs = require('fs');

let baseURL = process.env.UI_BASE_URL || 'http://127.0.0.1:8133/springbootmf383/front/';
if (!baseURL.endsWith('/')) {
  baseURL += '/';
}
const executableCandidates = [
  process.env.UI_CHROMIUM_EXECUTABLE,
  '/root/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome',
  '/root/.cache/ms-playwright/chromium-1208/chrome-linux/chrome'
].filter(Boolean);
const chromiumExecutablePath = executableCandidates.find((candidate) => fs.existsSync(candidate));

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: Number(process.env.UI_WORKERS || 1),
  timeout: 50_000,
  expect: {
    timeout: 10_000
  },
  reporter: [
    ['list'],
    ['json', { outputFile: 'reports/ui-check-report.json' }]
  ],
  outputDir: 'test-results',
  use: {
    baseURL,
    headless: true,
    launchOptions: {
      executablePath: chromiumExecutablePath,
      args: ['--no-sandbox', '--disable-dev-shm-usage']
    },
    viewport: { width: 1440, height: 900 },
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'off',
    ignoreHTTPSErrors: true
  }
});
