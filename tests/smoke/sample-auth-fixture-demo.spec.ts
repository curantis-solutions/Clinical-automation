/**
 * Sample Test: Demonstrating New Fixtures
 *
 * This test file shows how to use the new fixtures and utilities:
 * - auth.fixture.ts: Pre-authenticated pages (loginAsRN, loginAsMD)
 * - page-objects.fixture.ts: Pre-instantiated page objects
 * - wait-helper.ts: Intelligent wait methods
 * - timeouts.ts: Centralized timeout constants
 *
 * Run this test:
 *   npx playwright test tests/smoke/sample-fixture-demo.spec.ts --headed
 */
import { test, expect } from '../../fixtures/page-objects.fixture';
import { WaitHelper } from '../../utils/wait-helper';
import { TIMEOUTS, TEST_TIMEOUTS } from '../../config/timeouts';

test.describe('Fixture Demo Tests', () => {
  // Set a reasonable timeout for demo tests
  test.setTimeout(TEST_TIMEOUTS.STANDARD);

  test('Demo: Login as RN using auth fixture', async ({ loginAsRN, pages }) => {
    // loginAsRN is already authenticated - no need to call login manually!
    console.log('Already logged in as RN via fixture');

    // Create wait helper for intelligent waits
    const wait = new WaitHelper(loginAsRN);

    // Wait for dashboard to fully load
    await wait.forLoadingComplete();
    await wait.forNetworkIdle();

    // Verify we're on the dashboard
    const currentUrl = loginAsRN.url();
    expect(currentUrl).toContain('dashboard');
    console.log(`Current URL: ${currentUrl}`);

    // Use page objects from fixture
    const isDashboard = await pages.dashboard.isDashboardDisplayed();
    console.log(`Dashboard displayed: ${isDashboard}`);
  });

  test('Demo: Using wait helper instead of hardcoded timeouts', async ({ loginAsRN }) => {
    const wait = new WaitHelper(loginAsRN);

    // BEFORE (hardcoded timeout):
    // await page.waitForTimeout(5000);

    // AFTER (intelligent wait):
    await wait.forNetworkIdle();
    await wait.forLoadingComplete();

    // Wait for specific element
    // await wait.forElement('[data-cy="patient-grid"]');

    // Wait for text to appear
    // await wait.forText('Welcome');

    // Wait with retry for flaky operations
    // await wait.withRetry(async () => {
    //   await loginAsRN.click('[data-cy="save-btn"]');
    // }, 3, 1000);

    console.log('Wait helper demo completed');
  });

  test('Demo: Using timeout constants', async ({ page }) => {
    // BEFORE (magic numbers):
    // test.setTimeout(600000);
    // await page.waitForTimeout(5000);

    // AFTER (named constants):
    test.setTimeout(TEST_TIMEOUTS.LONG); // 5 minutes

    // Use constants for consistency
    console.log(`SHORT timeout: ${TIMEOUTS.SHORT}ms`);
    console.log(`MEDIUM timeout: ${TIMEOUTS.MEDIUM}ms`);
    console.log(`LONG timeout: ${TIMEOUTS.LONG}ms`);
    console.log(`NAVIGATION timeout: ${TIMEOUTS.NAVIGATION}ms`);
    console.log(`TEST_STANDARD timeout: ${TEST_TIMEOUTS.STANDARD}ms`);

    // Navigate to login page
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    console.log('Timeout constants demo completed');
  });

  test('Demo: Using testIdAttribute (data-cy)', async ({ page }) => {
    // Navigate to login
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // With testIdAttribute set to 'data-cy' in playwright.config.ts,
    // you can now use getByTestId() with data-cy attributes:

    // BEFORE:
    // await page.locator('[data-cy="btn-save"]').click();

    // AFTER (once elements have data-cy):
    // await page.getByTestId('btn-save').click();

    // For now, verify the config is working
    console.log('testIdAttribute demo completed');
    console.log('You can now use page.getByTestId() with data-cy attributes');
  });
});

test.describe('Quick Login Demo', () => {
  test('Demo: MD login fixture', async ({ loginAsMD }) => {
    // loginAsMD is already authenticated as Medical Director
    console.log('Logged in as MD via fixture');

    const currentUrl = loginAsMD.url();
    expect(currentUrl).toContain('dashboard');
    console.log(`MD session URL: ${currentUrl}`);
  });
});
