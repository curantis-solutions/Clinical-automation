/**
 * =============================================================================
 * AUTH FIXTURE - Playwright Test Fixtures for Authentication
 * =============================================================================
 *
 * WHAT ARE FIXTURES?
 * Fixtures are Playwright's way to set up preconditions before a test runs.
 * Instead of repeating login code in every test, fixtures handle it automatically.
 *
 * HOW THIS FILE WORKS:
 * 1. We extend Playwright's base `test` with custom fixtures (loginAsRN, loginAsMD, loginAs)
 * 2. When you use a fixture in your test, Playwright runs its setup code BEFORE your test
 * 3. After your test completes, Playwright handles cleanup automatically
 *
 * WHEN TO USE FIXTURES vs beforeAll:
 * - USE FIXTURES: For SINGLE tests that need authentication (most common)
 * - USE beforeAll: For SEQUENTIAL tests that share state (see workflow-demo.spec.ts)
 *
 * USAGE EXAMPLES:
 *
 *   // Example 1: Simple test with RN login
 *   import { test, expect } from '../fixtures/auth.fixture';
 *
 *   test('My test', async ({ loginAsRN }) => {
 *     // loginAsRN is a Page that's already logged in as RN
 *     await loginAsRN.goto('/patients');
 *     // ... rest of your test
 *   });
 *
 *   // Example 2: Test with MD login
 *   test('Doctor test', async ({ loginAsMD }) => {
 *     // loginAsMD is a Page logged in as MD
 *   });
 *
 *   // Example 3: Dynamic role/tenant login
 *   test('Custom role test', async ({ loginAs }) => {
 *     const page = await loginAs('SW', 'integrum');  // Login as SW for integrum tenant
 *   });
 *
 * AVAILABLE FIXTURES:
 *   - loginAsRN: Page pre-authenticated with RN (Registered Nurse) credentials
 *   - loginAsMD: Page pre-authenticated with MD (Medical Doctor) credentials
 *   - loginAs:   Function for custom role/tenant login → loginAs(role, tenant?)
 *
 * =============================================================================
 */

import { test as base, Page } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { CredentialManager } from '../utils/credential-manager';
import { TIMEOUTS } from '../config/timeouts';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/**
 * AuthFixtures type - Defines the shape of our custom fixtures
 *
 * - loginAsRN: Returns a Page object already logged in as RN
 * - loginAsMD: Returns a Page object already logged in as MD
 * - loginAs: Function that accepts role (and optional tenant) and returns logged-in Page
 */
type AuthFixtures = {
  loginAsRN: Page;
  loginAsMD: Page;
  loginAs: (role: string, tenant?: string) => Promise<Page>;
};

// =============================================================================
// HELPER FUNCTION
// =============================================================================

/**
 * Performs the actual login process
 *
 * @param page - Playwright Page object
 * @param role - User role (RN, MD, SW, HA, etc.)
 * @param tenant - Optional tenant override (defaults to TENANT from .env)
 *
 * FLOW:
 * 1. Navigate to login page
 * 2. Get credentials from .env based on role and tenant
 *    Format: {ENV}_{TENANT}_{ROLE}_USERNAME / PASSWORD
 *    Example: QA_CTH_RN_USERNAME
 * 3. Fill and submit login form
 * 4. Wait for redirect to dashboard/home
 */
async function performLogin(page: Page, role: string, tenant?: string): Promise<void> {
  // Initialize LoginPage object for interacting with login form
  const loginPage = new LoginPage(page);
  await loginPage.goto();

  // Get tenant - use provided value or fall back to .env TENANT
  const effectiveTenant = tenant || CredentialManager.getTenant();

  // Fetch credentials from .env based on environment, role, and tenant
  // CredentialManager looks for: {ENV}_{TENANT}_{ROLE}_USERNAME
  const credentials = CredentialManager.getCredentials(undefined, role, effectiveTenant);

  // Validate credentials exist
  if (!credentials.username || !credentials.password) {
    throw new Error(`Credentials not found for role: ${role}, tenant: ${effectiveTenant}`);
  }

  // Perform login using LoginPage methods
  await loginPage.login(credentials.username, credentials.password);

  // Wait for successful redirect to dashboard or home page
  // This confirms login was successful
  await page.waitForURL(/dashboard|home/i, { timeout: TIMEOUTS.NAVIGATION });

  console.log(`Logged in as ${role} for tenant ${effectiveTenant}`);
}

// =============================================================================
// FIXTURE DEFINITIONS
// =============================================================================

/**
 * Extended test object with auth fixtures
 *
 * HOW test.extend() WORKS:
 * - Takes the base Playwright test object
 * - Adds our custom fixtures (loginAsRN, loginAsMD, loginAs)
 * - Returns a new test object that includes both built-in and custom fixtures
 *
 * FIXTURE LIFECYCLE:
 * 1. Before test: Fixture setup runs (login happens)
 * 2. During test: Your test code runs with the authenticated page
 * 3. After test: Playwright cleans up automatically (closes page/context)
 */
export const test = base.extend<AuthFixtures>({

  /**
   * loginAsRN fixture - Pre-authenticated page for RN (Registered Nurse)
   *
   * USAGE:
   *   test('my test', async ({ loginAsRN }) => {
   *     // loginAsRN is already logged in, ready to use
   *     await loginAsRN.click('#some-button');
   *   });
   */
  loginAsRN: async ({ page }, use) => {
    // Setup: Login as RN before test runs
    await performLogin(page, 'RN');
    // Hand the authenticated page to the test
    await use(page);
    // Cleanup: Playwright handles this automatically after test
  },

  /**
   * loginAsMD fixture - Pre-authenticated page for MD (Medical Doctor)
   *
   * USAGE:
   *   test('doctor test', async ({ loginAsMD }) => {
   *     // loginAsMD is already logged in, ready to use
   *   });
   */
  loginAsMD: async ({ page }, use) => {
    // Setup: Login as MD before test runs
    await performLogin(page, 'MD');
    // Hand the authenticated page to the test
    await use(page);
    // Cleanup: Playwright handles this automatically after test
  },

  /**
   * loginAs fixture - Flexible login function for any role/tenant
   *
   * USAGE:
   *   test('custom login test', async ({ loginAs }) => {
   *     // Login as Social Worker for a specific tenant
   *     const page = await loginAs('SW', 'integrum');
   *
   *     // Or use default tenant from .env
   *     const page2 = await loginAs('HA');  // Home Aide
   *   });
   *
   * AVAILABLE ROLES (depends on your .env config):
   *   - RN (Registered Nurse)
   *   - MD (Medical Doctor)
   *   - SW (Social Worker)
   *   - HA (Home Aide)
   *   - etc.
   */
  loginAs: async ({ page }, use) => {
    // Create a login function that tests can call with any role/tenant
    const loginFn = async (role: string, tenant?: string): Promise<Page> => {
      await performLogin(page, role, tenant);
      return page;
    };
    // Provide the function to the test
    await use(loginFn);
    // Cleanup: Playwright handles this automatically after test
  },
});

// =============================================================================
// EXPORTS
// =============================================================================

// Re-export expect from Playwright so tests only need one import
export { expect } from '@playwright/test';

// Export types for TypeScript users who need them
export type { AuthFixtures };
