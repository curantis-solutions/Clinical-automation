/**
 * =============================================================================
 * WORKFLOW DEMO TEST - SW (Social Worker) Login
 * =============================================================================
 *
 * PURPOSE:
 * Demonstrates the recommended pattern for tests that need to share browser
 * state across multiple steps (e.g., login once, perform multiple actions).
 *
 * PATTERN USED:
 * - test.describe.serial() - Ensures tests run in order
 * - test.beforeAll() - Creates shared browser context ONCE
 * - Module-level variables - Share page and data between tests
 * - createPageObjectsForPage() - Factory from page-objects.fixture for page objects
 *
 * WHY THIS PATTERN?
 * - Playwright creates a fresh page for each test by default (isolation)
 * - For workflows like "Login → Add Patient → Verify", we need state to persist
 * - This pattern keeps one browser session across all steps
 * - Using the page object factory keeps this consistent with fixture-based tests
 *
 * IMPORTANT NOTES:
 * - After login, the app automatically redirects to dashboard - NO need to navigate again
 * - Step 03 intentionally refreshes the page to verify session persistence
 * - All tests use the same sharedPage instance
 * - Page objects accessed via pages.login, pages.dashboard, pages.patient, etc.
 *
 * =============================================================================
 */

import { test, expect, Page, BrowserContext } from '@playwright/test';
import { createPageObjectsForPage, PageObjects } from '../../fixtures/page-objects.fixture';
import { CredentialManager } from '../../utils/credential-manager';
import { AuthHelper } from '../../utils/auth.helper';

// =============================================================================
// SHARED STATE - These variables persist across all tests in this file
// =============================================================================
let sharedPage: Page;
let sharedContext: BrowserContext;
let pages: PageObjects;

// Storage for data that needs to pass between test steps
const testData: {
  isLoggedIn: boolean;
  userRole: string;
} = {
  isLoggedIn: false,
  userRole: '',
};

// =============================================================================
// TEST SUITE
// =============================================================================
test.describe.serial('Workflow Demo SW @smoke', () => {

  /**
   * SETUP - Runs once before all tests
   * Creates the shared browser context and page that all tests will use
   */
  test.beforeAll(async ({ browser }) => {
    // Create a new browser context with standard settings
    sharedContext = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      ignoreHTTPSErrors: true,
      baseURL: CredentialManager.getBaseUrl(),
    });

    // Create single page instance for all tests
    sharedPage = await sharedContext.newPage();

    // Set longer timeouts for slower environments (e.g., PROD)
    sharedPage.setDefaultTimeout(30000);
    sharedPage.setDefaultNavigationTimeout(30000);

    // Initialize all page objects using the factory from page-objects.fixture
    // This gives us access to pages.login, pages.dashboard, pages.patient, etc.
    pages = createPageObjectsForPage(sharedPage);
  });

  /**
   * CLEANUP - Runs once after all tests complete
   * Closes the browser context to free resources
   */
  test.afterAll(async () => {
    if (sharedContext) {
      await sharedContext.close();
    }
  });

  // ===========================================================================
  // STEP 01: LOGIN
  // ===========================================================================
  test('Step 01: Login as SW', async () => {
    // Navigate to login page
    await pages.login.goto();

    // Get credentials from .env.local based on role
    const credentials = CredentialManager.getCredentials(undefined, 'SW');

    // Perform login
    await pages.login.login(credentials.username, credentials.password);

    // Wait for app to redirect to dashboard after login
    await sharedPage.waitForURL(/dashboard/, { timeout: 15000 });

    // Verify: URL should contain 'dashboard'
    const currentUrl = sharedPage.url();
    expect(currentUrl).toContain('dashboard');

    // Store login state for subsequent tests
    testData.isLoggedIn = true;
    testData.userRole = 'SW';

    console.log('SW Login successful - landed on dashboard');
  });

  // ===========================================================================
  // STEP 02: VERIFY DASHBOARD
  // ===========================================================================
  test('Step 02: Verify Dashboard Access', async () => {
    // Prerequisite: Must be logged in from Step 01
    expect(testData.isLoggedIn).toBeTruthy();

    // Verify: We should already be on dashboard (NO navigation needed)
    const currentUrl = sharedPage.url();
    expect(currentUrl).toContain('dashboard');

    // Verify page loaded correctly
    const title = await sharedPage.title();
    expect(title).toBeTruthy();

    console.log(`Dashboard verified - Title: "${title}"`);
  });

  // ===========================================================================
  // STEP 03: VERIFY SESSION PERSISTENCE
  // ===========================================================================
  test('Step 03: Verify Session Persists After Refresh', async () => {
    // Prerequisite: Must be logged in from Step 01
    expect(testData.isLoggedIn).toBeTruthy();

    // Action: Refresh the page to test if session is maintained
    await sharedPage.reload();
    await sharedPage.waitForLoadState('networkidle');

    // Verify: Should still be on dashboard (not redirected to login)
    const currentUrl = sharedPage.url();
    expect(currentUrl).toContain('dashboard');
    expect(currentUrl).not.toContain('login');

    console.log('SW session persists after page refresh');
  });

  // ===========================================================================
  // STEP 04: LOGOUT
  // ===========================================================================
  test('Step 04: Logout', async () => {
    // Prerequisite: Must be logged in
    expect(testData.isLoggedIn).toBeTruthy();

    // Wait for page to be ready
    await sharedPage.waitForLoadState('networkidle');

    // Perform logout (clicks profile button → Sign out)
    await AuthHelper.logout(sharedPage);

    // Verify: Should be back on login page
    const loginVisible = await pages.login.isLoginPageDisplayed();
    expect(loginVisible).toBeTruthy();

    // Update state
    testData.isLoggedIn = false;

    console.log('SW Logout successful - back on login page');
  });
});
