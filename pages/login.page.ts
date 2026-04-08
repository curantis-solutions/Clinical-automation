import { Page, expect } from '@playwright/test';
import { BasePage } from './base.page';
import { CredentialManager } from '../utils/credential-manager';
import { AuthHelper } from '../utils/auth.helper';
import { TIMEOUTS } from '../config/timeouts';

export class LoginPage extends BasePage {
  // Define selectors as private readonly properties
  private readonly selectors = {
    // Specific selectors for Curantis login form
    usernameInput: 'input[placeholder="EMAIL"], input[type="email"], input[name="email"]',
    passwordInput: 'input[placeholder="PASSWORD"], input[type="password"], input[name="password"]',
  loginButton: 'button:has-text("SIGN IN"), button:has-text("Sign In"), button[type="submit"]',
    errorMessage: '.error-message, .alert-danger, [role="alert"], [data-testid="error-message"]',
    // Additional selectors
    rememberMe: 'input[type="checkbox"][name="remember"], #remember-me',
    forgotPassword: 'a:has-text("Forgot Password?"), a:has-text("Forgot"), a:has-text("Reset")',
    clinicLogin: 'a:has-text("or Clinic Login?")',
  };

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to the login page
   */
  async goto(): Promise<void> {
    await this.navigate('/');
    await this.waitForPageLoad();
    console.log('Navigated to login page');
  }

  /**
   * Fill in the username field
   * @param username - The username to enter
   */
  async enterUsername(username: string): Promise<void> {
    await this.waitForElement(this.selectors.usernameInput);
    await this.clearField(this.selectors.usernameInput);
    await this.fill(this.selectors.usernameInput, username);
    console.log(`Entered username: ${username}`);
  }

  /**
   * Fill in the password field
   * @param password - The password to enter
   */
  async enterPassword(password: string): Promise<void> {
    await this.waitForElement(this.selectors.passwordInput);
    await this.clearField(this.selectors.passwordInput);
    await this.fill(this.selectors.passwordInput, password);
    console.log('Entered password: ***');
  }

  /**
   * Click the login button
   */
  async clickLogin(): Promise<void> {
    await this.waitForElement(this.selectors.loginButton);

    // Make sure the button is visible and clickable
    const button = this.page.locator(this.selectors.loginButton).first();
    await button.scrollIntoViewIfNeeded();
    await button.click();

    console.log('Clicked SIGN IN button');
  }

  /**
   * Perform a complete login
   * @param username - The username
   * @param password - The password
   * @param role - Optional role for logging purposes
   * @param environment - Optional environment for logging purposes
   */
  async login(username: string, password: string, role?: string, environment?: string): Promise<void> {
    await this.enterUsername(username);
    await this.enterPassword(password);
    await this.clickLogin();

    // Wait for either successful navigation or error message
    try {
      // Wait for navigation away from login page (successful login)
      await this.page.waitForURL((url) => !url.toString().includes('login'), {
        timeout: 10000,
        waitUntil: 'networkidle'
      });
      console.log('Login successful, navigated away from login page');
    } catch (error) {
      // Check if there's an error message
      const hasError = await this.isErrorMessageVisible();
      if (hasError) {
        const errorText = await this.getErrorMessage();
        console.error(`Login failed with error: ${errorText}`);
        throw new Error(`Login failed: ${errorText}`);
      }
      throw error;
    }
  }

  /**
   * Switch to a different role by logging out, then logging in with new role credentials.
   * Handles the full flow: logout → goto login → fill credentials → submit → wait for dashboard.
   * Safe to call even if already on login page (skips logout).
   * @param role - Role key (e.g., 'MD', 'RN', 'SW')
   * @param tenant - Optional tenant override (defaults to env TENANT)
   */
  async loginAsRole(role: string, tenant?: string): Promise<void> {
    // Logout first if currently logged in (on dashboard/app page, not login page)
    const onLoginPage = await this.isLoginPageDisplayed().catch(() => false);
    if (!onLoginPage) {
      await AuthHelper.logout(this.page);
    }

    await this.goto();
    const credentials = CredentialManager.getCredentials(undefined, role, tenant);
    await this.login(credentials.username, credentials.password);
    await this.page.waitForURL(/dashboard/, { timeout: TIMEOUTS.API });
    console.log(`Logged in as ${role}`);
  }

  /**
   * Check if the login page is displayed
   * @returns true if on login page
   */
  async isLoginPageDisplayed(): Promise<boolean> {
    try {
      await this.waitForElement(this.selectors.usernameInput, 5000);
      await this.waitForElement(this.selectors.passwordInput, 5000);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if username input is visible
   * @returns true if username input is visible
   */
  async isUsernameInputVisible(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.usernameInput);
  }

  /**
   * Check if password input is visible
   * @returns true if password input is visible
   */
  async isPasswordInputVisible(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.passwordInput);
  }

  /**
   * Check if login button is visible
   * @returns true if login button is visible
   */
  async isLoginButtonVisible(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.loginButton);
  }

  /**
   * Check if an error message is visible
   * @returns true if error message is visible
   */
  async isErrorMessageVisible(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.errorMessage);
  }

  /**
   * Get the error message text
   * @returns The error message text
   */
  async getErrorMessage(): Promise<string> {
    if (await this.isErrorMessageVisible()) {
      const text = await this.getText(this.selectors.errorMessage);
      return text || '';
    }
    return '';
  }

  /**
   * Check if remember me checkbox exists
   * @returns true if remember me checkbox exists
   */
  async hasRememberMeOption(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.rememberMe);
  }

  /**
   * Check remember me checkbox if it exists
   */
  async checkRememberMe(): Promise<void> {
    if (await this.hasRememberMeOption()) {
      await this.page.check(this.selectors.rememberMe);
      console.log('Checked "Remember Me" option');
    }
  }

  /**
   * Click on forgot password link if it exists
   */
  async clickForgotPassword(): Promise<void> {
    if (await this.isElementVisible(this.selectors.forgotPassword)) {
      await this.click(this.selectors.forgotPassword);
      console.log('Clicked "Forgot Password" link');
    }
  }

  /**
   * Verify successful login by checking URL change
   * @param expectedUrlPattern - Optional pattern to match against
   */
  async verifySuccessfulLogin(expectedUrlPattern?: string | RegExp): Promise<void> {
    const currentUrl = await this.getUrl();

    // Check that we're no longer on the login page
    expect(currentUrl).not.toContain('login');

    // If a pattern is provided, check against it
    if (expectedUrlPattern) {
      if (typeof expectedUrlPattern === 'string') {
        expect(currentUrl).toContain(expectedUrlPattern);
      } else {
        expect(currentUrl).toMatch(expectedUrlPattern);
      }
    }

    console.log(`Successfully logged in, current URL: ${currentUrl}`);
  }
}