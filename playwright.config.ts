import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Get environment configuration
const testEnv = process.env.TEST_ENV || 'qa';
const baseURL = process.env[`${testEnv.toUpperCase()}_URL`] || 'https://clinical.qa1.curantissolutions.com';

console.log(`🎭 Running tests against: ${testEnv.toUpperCase()} environment (${baseURL})`);

export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : Number(process.env.RETRIES) || 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : Number(process.env.WORKERS) || 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    // Local reporters (uncomment to use for local reporting)
    // ['html', {
    //   outputFolder: 'playwright-report',
    //   open: process.env.SHOW_REPORT === 'true' ? 'always' : 'never'
    // }],
    // ['json', { outputFile: 'reports/test-results.json' }],

    // Currents.dev reporter (commented out)
    // ['@currents/playwright', {
    //   projectId: 'tkbg1Q',
    //   recordKey: 'Z2WtoCZ9YllGaWen'
    // }],
    ['list'] // Keep list for console output
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    /* Screenshot only on failure */
    screenshot: process.env.SCREENSHOT_ON_FAILURE === 'true' ? 'only-on-failure' : 'off',

    /* Video only on failure */
    video: process.env.VIDEO_ON_FAILURE === 'true' ? 'retain-on-failure' : 'off',

    /* Slow down actions */
    launchOptions: {
      slowMo: Number(process.env.SLOWMO) || 0,
    },

    /* Viewport size */
    viewport: { width: 1280, height: 720 },

    /* Ignore HTTPS errors */
    ignoreHTTPSErrors: true,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        headless: process.env.HEADLESS !== 'false',
      },
    },

    // Uncomment to test on other browsers
    // {
    //   name: 'firefox',
    //   use: {
    //     ...devices['Desktop Firefox'],
    //     headless: process.env.HEADLESS !== 'false',
    //   },
    // },
    // {
    //   name: 'webkit',
    //   use: {
    //     ...devices['Desktop Safari'],
    //     headless: process.env.HEADLESS !== 'false',
    //   },
    // },
  ],

  /* Configure test timeout */
  timeout: Number(process.env.TIMEOUT) || 30000,

  /* Configure expect timeout */
  expect: {
    timeout: 5000
  },
});