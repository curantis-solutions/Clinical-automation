/**
 * =============================================================================
 * DASHBOARD NAVIGATION TESTS - Module Navigation via Rubik's Cube
 * =============================================================================
 *
 * PURPOSE:
 * Tests dashboard module navigation using the Rubik's cube menu.
 * Verifies that all main modules (Billing, Patient, Workforce, etc.) are accessible.
 *
 * PATTERN USED:
 * - test.describe.serial() - Ensures tests run in order
 * - test.beforeAll() - Creates shared browser context ONCE
 * - createPageObjectsForPage() - Factory from page-objects.fixture
 *
 * FLOW:
 * 1. Login as MD (Medical Doctor)
 * 2. Verify dashboard loaded
 * 3. Navigate to each module via Rubik's cube
 * 4. Return to dashboard between each navigation
 *
 * RUN:
 *   npx playwright test tests/smoke/dashboard-navigation.spec.ts --headed --workers=1
 *
 * =============================================================================
 */

import { test, expect, Page, BrowserContext } from '@playwright/test';
import { createPageObjectsForPage, PageObjects } from '../../fixtures/page-objects.fixture';
import { CredentialManager } from '../../utils/credential-manager';
import { AuthHelper } from '../../utils/auth.helper';
// TIMEOUTS: API (30s), SHORT (1s), MEDIUM (3s) | VIEWPORTS: desktop (1280x720)
import { TIMEOUTS, VIEWPORTS, TEST_TIMEOUTS } from '../../config/timeouts';

// =============================================================================
// SHARED STATE - Variables persist across all tests in this file
// =============================================================================
let sharedPage: Page;
let sharedContext: BrowserContext;
let pages: PageObjects;

// =============================================================================
// TEST SUITE
// =============================================================================
test.describe.serial('Dashboard Navigation Tests @smoke', () => {

  /**
   * SETUP - Runs once before all tests
   */
  test.beforeAll(async ({ browser }) => {
    // Create browser context with standard settings
    sharedContext = await browser.newContext({
      viewport: VIEWPORTS.desktop,  // 1280x720
      ignoreHTTPSErrors: true,
      baseURL: CredentialManager.getBaseUrl(),
    });

    // Create single page instance for all tests
    sharedPage = await sharedContext.newPage();
    sharedPage.setDefaultTimeout(TIMEOUTS.API);  // 30s default timeout
    sharedPage.setDefaultNavigationTimeout(TIMEOUTS.API);

    // Initialize all page objects using the factory
    pages = createPageObjectsForPage(sharedPage);
    console.log('🚀 Browser launched for dashboard navigation tests');
  });

  /**
   * CLEANUP - Runs once after all tests complete
   */
  test.afterAll(async () => {
    if (sharedContext) {
      await sharedContext.close();
    }
    console.log('🔒 Browser closed');
  });

  /**
   * Login and navigate to multiple modules via Rubik's cube
   */
  test('Login and navigate to multiple modules via Rubik\'s cube', async () => {
    // Set test timeout using constant (2 minutes)
    test.setTimeout(TEST_TIMEOUTS.STANDARD);

    // =========================================================================
    // STEP 1: Login using pages.login
    // =========================================================================
    console.log('🔐 Step 1: Logging in as MD...');
    await pages.login.goto();

    // Get credentials and perform login as MD
    const credentials = CredentialManager.getCredentials(undefined, 'MD');
    await pages.login.login(credentials.username, credentials.password);

    // Wait for dashboard to load
    await sharedPage.waitForURL(/dashboard/, { timeout: TIMEOUTS.NAVIGATION });
    await sharedPage.waitForLoadState('networkidle');
    await sharedPage.waitForTimeout(TIMEOUTS.MEDIUM);  // 3s - wait for dynamic content

    // Verify we're on the dashboard
    const isDashboard = await pages.dashboard.isDashboardDisplayed();
    expect(isDashboard).toBeTruthy();
    console.log('✅ Successfully logged in and on dashboard');

    // Take a screenshot
    await sharedPage.screenshot({
      path: `screenshots/dashboard-loaded-${Date.now()}.png`,
      fullPage: true
    });

    // =========================================================================
    // STEP 2: Verify Rubik's cube icon is visible
    // =========================================================================
    console.log('🔍 Step 2: Checking for Rubik\'s cube icon...');
    const isRubiksCubeVisible = await pages.dashboard.isRubiksCubeVisible();
    expect(isRubiksCubeVisible).toBeTruthy();
    console.log('✅ Rubik\'s cube icon is visible');

    // =========================================================================
    // STEP 3: Navigate to multiple modules to verify all locators
    // =========================================================================
    const modulesToTest = [
      'Billing',
      'Patient',
      'Workforce',
      'Reports',
      'Analytics'
    ];

    for (const moduleName of modulesToTest) {
      console.log(`\n📊 Testing module: ${moduleName}`);

      try {
        await pages.dashboard.navigateToModule(moduleName);

        // Wait for navigation
        await sharedPage.waitForLoadState('networkidle');
        await sharedPage.waitForTimeout(TIMEOUTS.SHORT);  // 1s - brief pause

        // Get current URL
        const currentUrl = sharedPage.url();
        console.log(`✅ Successfully navigated to ${moduleName}`);
        console.log(`📍 URL: ${currentUrl}`);

        // Take a screenshot
        await sharedPage.screenshot({
          path: `screenshots/module-${moduleName.toLowerCase()}-${Date.now()}.png`,
          fullPage: true
        });

        // Go back to dashboard for next iteration
        await pages.dashboard.goto();
        await sharedPage.waitForLoadState('networkidle');
        await sharedPage.waitForTimeout(TIMEOUTS.SHORT);  // 1s - brief pause
        console.log('🏠 Returned to dashboard');

      } catch (error) {
        console.error(`❌ Failed to navigate to ${moduleName}:`, error);
        // Take screenshot of failure
        await sharedPage.screenshot({
          path: `screenshots/FAILED-${moduleName.toLowerCase()}-${Date.now()}.png`,
          fullPage: true
        });
        throw error;
      }
    }

    console.log('\n🎉 All modules tested successfully!');
  });
});
