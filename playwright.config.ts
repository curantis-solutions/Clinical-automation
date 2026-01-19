import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import { TIMEOUTS, TEST_TIMEOUTS, VIEWPORTS } from './config/timeouts';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Get environment configuration
const testEnv = process.env.TEST_ENV || 'qa';
const baseURL = process.env[`${testEnv.toUpperCase()}_URL`] || 'https://clinical.qa1.curantissolutions.com';

// Default worker count (4 for better parallelization)
const defaultWorkers = 4;

console.log(`🎭 Running tests against: ${testEnv.toUpperCase()} environment (${baseURL})`);

export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : Number(process.env.RETRIES) || 0,
  /* Workers for parallel test execution
   * Default: 4 workers for better parallelization
   * CI: Uses 4 workers (can be overridden via WORKERS env var)
   */
  workers: process.env.CI ? Number(process.env.WORKERS) || defaultWorkers : Number(process.env.WORKERS) || defaultWorkers,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    // HTML reporter - Visual test results with screenshots/videos/traces
    ['html', {
      outputFolder: 'playwright-report',
      open: process.env.SHOW_REPORT === 'always' ? 'always' : 'never'
    }],

    // JSON reporter for programmatic access
    ['json', { outputFile: 'reports/test-results.json' }],

    // Currents.dev reporter (disabled for local debugging)
    // ['@currents/playwright', {
    //   projectId: 'tkbg1Q',
    //   recordKey: 'Z2WtoCZ9YllGaWen'
    // }],

    // List reporter for console output
    ['list']
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL,

    /* Collect trace - captures DOM snapshots, network, console logs
     * Options: 'on' | 'off' | 'retain-on-failure' | 'on-first-retry'
     * Use 'retain-on-failure' for debugging (like Cypress time-travel)
     */
    trace: process.env.TRACE === 'on' ? 'on' : 'retain-on-failure',

    /* Screenshot configuration
     * 'on' - take screenshots after every action (best for debugging)
     * 'only-on-failure' - only when tests fail
     * 'off' - no screenshots
     */
    screenshot: process.env.SCREENSHOT === 'on' ? 'on' :
                process.env.SCREENSHOT_ON_FAILURE === 'true' ? 'only-on-failure' : 'off',

    /* Video configuration
     * 'on' - record video for every test
     * 'retain-on-failure' - keep video only when test fails
     * 'off' - no video recording
     */
    video: process.env.VIDEO === 'on' ? 'on' :
           process.env.VIDEO_ON_FAILURE === 'true' ? 'retain-on-failure' : 'off',

    /* Slow down actions for visual debugging (in milliseconds)
     * Useful when debugging complex interactions
     */
    launchOptions: {
      slowMo: Number(process.env.SLOWMO) || 0,
    },

    /* Viewport size */
    viewport: VIEWPORTS.desktop,

    /* Ignore HTTPS errors */
    ignoreHTTPSErrors: true,

    /* Test ID attribute for locators (e.g., page.getByTestId('save-button'))
     * This allows using data-cy attributes with getByTestId()
     */
    testIdAttribute: 'data-cy',

    /* Action timeout - time to wait for each action */
    actionTimeout: Number(process.env.ACTION_TIMEOUT) || TIMEOUTS.ACTION,

    /* Navigation timeout */
    navigationTimeout: Number(process.env.NAV_TIMEOUT) || TIMEOUTS.NAVIGATION,
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

  /* Configure test timeout (default: 2 minutes for standard tests) */
  timeout: Number(process.env.TIMEOUT) || TEST_TIMEOUTS.STANDARD,

  /* Configure expect timeout */
  expect: {
    timeout: TIMEOUTS.ELEMENT,
  },
});