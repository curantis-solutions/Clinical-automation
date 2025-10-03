import { Page } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { CredentialManager } from '../utils/credential-manager';

/**
 * Authentication helper for role-based login and logout
 * All credentials are fetched from .env.local file
 */
export class AuthHelper {
  /**
   * Login with specified role and environment
   * @param page - Playwright page object
   * @param role - User role (admin, user, viewer, etc.) - optional
   * @param environment - Environment (dev, qa, staging, prod) - optional, defaults to TEST_ENV
   * @returns Promise<void>
   */
  static async loginWithRole(
    page: Page,
    role?: string,
    environment?: string
  ): Promise<void> {
    const loginPage = new LoginPage(page);

    // Get credentials from .env.local via CredentialManager
    const credentials = CredentialManager.getCredentials(environment, role);

    console.log(`🔐 Logging in as ${role || 'default user'} in ${environment || CredentialManager.getEnvironment()} environment`);

    // Navigate to login page if not already there
    const currentUrl = await page.url();
    if (!currentUrl.includes('login') && currentUrl === 'about:blank') {
      await loginPage.goto();
    }

    // Perform login
    await loginPage.login(credentials.username, credentials.password);

    console.log(`✅ Successfully logged in as: ${credentials.username}`);
  }

  /**
   * Login with default credentials (no role specified)
   * @param page - Playwright page object
   * @param environment - Environment (dev, qa, staging, prod) - optional
   * @returns Promise<void>
   */
  static async login(page: Page, environment?: string): Promise<void> {
    await this.loginWithRole(page, undefined, environment);
  }

  /**
   * Logout from the application
   * @param page - Playwright page object
   * @returns Promise<void>
   */
  static async logout(page: Page): Promise<void> {
    try {
      // Wait for page to be ready
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      // Look for user profile button
      const userProfileSelectors = [
        '[class*="btn-user-profile"]',
        '#btn-user-profile',
        'button.btn-user-profile',
        '[data-testid="user-profile"]',
        '[aria-label*="user profile" i]',
        '[aria-label*="account" i]'
      ];

      let userProfileButton = null;
      for (const selector of userProfileSelectors) {
        try {
          const element = page.locator(selector).first();
          if (await element.isVisible({ timeout: 2000 })) {
            userProfileButton = element;
            console.log(`✅ Found user profile button: ${selector}`);
            break;
          }
        } catch {
          continue;
        }
      }

      if (!userProfileButton) {
        throw new Error('User profile button not found');
      }

      // Click user profile button
      await userProfileButton.click();
      console.log('✅ Clicked user profile button');

      // Wait for menu to appear
      await page.waitForTimeout(1000);

      // Look for sign out option
      const signOutSelectors = [
        'text="Sign out"',
        'text="Sign Out"',
        'text="SIGN OUT"',
        'text="Logout"',
        'text="Log out"',
        'button:has-text("Sign out")',
        'a:has-text("Sign out")',
        '[aria-label*="Sign out" i]',
        '[aria-label*="Logout" i]',
        'li:has-text("Sign out")',
        'div:has-text("Sign out")'
      ];

      let signOutButton = null;
      for (const selector of signOutSelectors) {
        try {
          const element = page.locator(selector).first();
          if (await element.isVisible({ timeout: 1000 })) {
            signOutButton = element;
            console.log(`✅ Found sign out option: ${selector}`);
            break;
          }
        } catch {
          continue;
        }
      }

      if (!signOutButton) {
        throw new Error('Sign out option not found after clicking user profile');
      }

      // Click sign out
      await signOutButton.click();
      console.log('✅ Clicked sign out button');

      // Wait for navigation back to login page
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      const currentUrl = page.url();
      console.log(`✅ Successfully logged out, current URL: ${currentUrl}`);
    } catch (error) {
      console.error('❌ Logout failed:', error);
      throw error;
    }
  }

  /**
   * Verify if user is logged in (not on login page)
   * @param page - Playwright page object
   * @returns Promise<boolean>
   */
  static async isLoggedIn(page: Page): Promise<boolean> {
    const currentUrl = await page.url();
    return !currentUrl.includes('login');
  }

  /**
   * Verify if user is on login page
   * @param page - Playwright page object
   * @returns Promise<boolean>
   */
  static async isOnLoginPage(page: Page): Promise<boolean> {
    const loginPage = new LoginPage(page);
    return await loginPage.isLoginPageDisplayed();
  }
}
