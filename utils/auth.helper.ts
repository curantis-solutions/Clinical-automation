import { Page } from '@playwright/test';
import { LoginPage } from '../pages/login.page';

/**
 * =============================================================================
 * AUTH HELPER - Authentication utility functions
 * =============================================================================
 *
 * PURPOSE:
 * Provides helper functions for authentication actions during tests.
 * These are UTILITY functions, not fixtures - use them for actions DURING tests.
 *
 * WHEN TO USE THIS vs AUTH FIXTURE:
 * - auth.fixture.ts → For LOGGING IN at the start of a test
 * - auth.helper.ts  → For LOGOUT and session checks during/after tests
 *
 * AVAILABLE METHODS:
 * - logout(page)        - Sign out from the application
 * - isLoggedIn(page)    - Check if user is logged in (URL check)
 * - isOnLoginPage(page) - Check if login page is displayed
 *
 * USAGE EXAMPLE:
 *   import { AuthHelper } from '../utils/auth.helper';
 *
 *   // In your test after completing actions:
 *   await AuthHelper.logout(page);
 *
 *   // Check session state:
 *   const loggedIn = await AuthHelper.isLoggedIn(page);
 *
 * NOTE: For LOGIN, use fixtures instead:
 *   import { test } from '../fixtures/auth.fixture';
 *   test('my test', async ({ loginAsRN }) => { ... });
 *
 * =============================================================================
 */
export class AuthHelper {

  /**
   * Logout from the application
   *
   * LOGOUT FLOW:
   * 1. Wait for page to be ready (networkidle)
   * 2. Click user profile button (#btn-user-profile)
   * 3. Wait for dropdown menu to appear
   * 4. Find and click "Sign out" option
   * 5. Wait for redirect to login page
   *
   * SIGN OUT BUTTON FALLBACK STRATEGY:
   * Different apps may use different text/selectors for sign out.
   * This method tries multiple selectors in order until one works:
   * - text="Sign out"
   * - text="Sign Out"
   * - text="SIGN OUT"
   * - text="Logout"
   * - text="Log out"
   * - button:has-text("Sign out")
   * - a:has-text("Sign out")
   * - li:has-text("Sign out")
   *
   * @param page - Playwright Page object
   * @throws Error if user profile button or sign out option not found
   */
  static async logout(page: Page): Promise<void> {
    try {
      // =======================================================================
      // STEP 1: Wait for page to be ready
      // =======================================================================
      // networkidle means no network requests for 500ms - page is stable
      await page.waitForLoadState('networkidle');
      // Extra buffer for dynamic content to finish loading
      await page.waitForTimeout(2000);

      // =======================================================================
      // STEP 2: Click user profile button to open dropdown menu
      // =======================================================================
      // The user profile button has a specific ID in this application
      const userProfileButton = page.locator('#btn-user-profile');

      // Debug: Check if button exists (helpful for troubleshooting)
      const buttonCount = await userProfileButton.count();
      console.log(`Found ${buttonCount} element(s) with #btn-user-profile`);

      // If button not found, log additional debug info and throw error
      if (buttonCount === 0) {
        const allButtons = await page.locator('button').count();
        console.log(`Total buttons on page: ${allButtons}`);
        throw new Error('User profile button #btn-user-profile not found');
      }

      // Wait for button to be visible and clickable
      await userProfileButton.waitFor({ state: 'visible', timeout: 10000 });
      console.log('User profile button is visible, clicking...');
      await userProfileButton.click();
      console.log('Clicked user profile button');

      // =======================================================================
      // STEP 3: Wait for dropdown menu to appear
      // =======================================================================
      // Give the menu animation time to complete
      await page.waitForTimeout(1000);

      // =======================================================================
      // STEP 4: Find and click sign out option
      // =======================================================================
      // Try multiple selectors since different apps use different text
      const signOutSelectors = [
        'text="Sign out"',       // Exact match, sentence case
        'text="Sign Out"',       // Exact match, title case
        'text="SIGN OUT"',       // Exact match, uppercase
        'text="Logout"',         // Alternative wording
        'text="Log out"',        // Alternative wording with space
        'button:has-text("Sign out")',  // Button containing text
        'a:has-text("Sign out")',       // Link containing text
        'li:has-text("Sign out")',      // List item containing text
      ];

      // Try each selector until we find a visible sign out option
      let signOutButton = null;
      for (const selector of signOutSelectors) {
        try {
          const element = page.locator(selector).first();
          // Short timeout (1s) for each attempt - fail fast and try next
          if (await element.isVisible({ timeout: 1000 })) {
            signOutButton = element;
            console.log(`Found sign out option: ${selector}`);
            break;
          }
        } catch {
          // Selector didn't match or wasn't visible - try next one
          continue;
        }
      }

      // If no sign out option found after trying all selectors, throw error
      if (!signOutButton) {
        throw new Error('Sign out option not found after clicking user profile');
      }

      // Click the found sign out button
      await signOutButton.click();
      console.log('Clicked sign out button');

      // =======================================================================
      // STEP 5: Wait for redirect to login page
      // =======================================================================
      // After sign out, app should redirect to login page
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      console.log(`Successfully logged out, current URL: ${page.url()}`);
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  }

  /**
   * Check if user is logged in (not on login page)
   *
   * LOGIC:
   * - If URL contains 'login', user is NOT logged in
   * - If URL does NOT contain 'login', user IS logged in
   *
   * NOTE: This is a simple URL-based check. For more accurate checks,
   * you might want to verify specific elements or session cookies.
   *
   * @param page - Playwright Page object
   * @returns true if logged in (not on login page), false otherwise
   */
  static async isLoggedIn(page: Page): Promise<boolean> {
    const currentUrl = page.url();
    // Simple check: if URL contains 'login', we're not logged in
    return !currentUrl.includes('login');
  }

  /**
   * Check if user is on the login page
   *
   * LOGIC:
   * Uses the LoginPage object to check if login form elements are displayed.
   * More reliable than URL check because it verifies actual page content.
   *
   * @param page - Playwright Page object
   * @returns true if login page is displayed, false otherwise
   */
  static async isOnLoginPage(page: Page): Promise<boolean> {
    // Use LoginPage object for accurate detection of login form
    const loginPage = new LoginPage(page);
    return await loginPage.isLoginPageDisplayed();
  }
}
