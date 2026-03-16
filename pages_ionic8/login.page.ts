import { Page, expect } from '@playwright/test';
import { BasePage } from '../pages/base.page';

/**
 * Login Page Object — Ionic 8 (qa2)
 *
 * VERIFIED via MCP Playwright on qa2 (2026-03-05).
 *
 * Changes from Ionic 4 (qa1):
 * - Login page URL: /#/sign-in (was implicitly /#/login or /)
 * - Button text: "Sign In" mixed case (was "SIGN IN" uppercase)
 * - No structural selector changes — input placeholders EMAIL/PASSWORD still work
 */
export class LoginPage extends BasePage {
  private readonly selectors = {
    usernameInput: 'input[placeholder="EMAIL"], input[type="email"], input[name="email"]',
    passwordInput: 'input[placeholder="PASSWORD"], input[type="password"], input[name="password"]',
    // Ionic 8 uses "Sign In" (mixed case); using case-insensitive to support both
    loginButton: 'button:has-text("Sign In"), button:has-text("SIGN IN"), button[type="submit"]',
    errorMessage: '.error-message, .alert-danger, [role="alert"], [data-testid="error-message"]',
    forgotPassword: ':has-text("Forgot Password?")',
    firstTimeLogin: ':has-text("First Time Login?")',
  };

  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await this.navigate('/');
    await this.waitForPageLoad();
  }

  async enterUsername(username: string): Promise<void> {
    await this.waitForElement(this.selectors.usernameInput);
    await this.clearField(this.selectors.usernameInput);
    await this.fill(this.selectors.usernameInput, username);
  }

  async enterPassword(password: string): Promise<void> {
    await this.waitForElement(this.selectors.passwordInput);
    await this.clearField(this.selectors.passwordInput);
    await this.fill(this.selectors.passwordInput, password);
  }

  async clickLogin(): Promise<void> {
    await this.waitForElement(this.selectors.loginButton);
    const button = this.page.locator(this.selectors.loginButton).first();
    await button.scrollIntoViewIfNeeded();
    await button.click({ force: true });
  }

  async login(username: string, password: string): Promise<void> {
    await this.enterUsername(username);
    await this.enterPassword(password);
    await this.clickLogin();

    try {
      await this.page.waitForURL(
        (url) => !url.toString().includes('sign-in') && !url.toString().includes('login'),
        { timeout: 10000, waitUntil: 'networkidle' }
      );
    } catch (error) {
      const hasError = await this.isErrorMessageVisible();
      if (hasError) {
        const errorText = await this.getErrorMessage();
        throw new Error(`Login failed: ${errorText}`);
      }
      throw error;
    }
  }

  async isLoginPageDisplayed(): Promise<boolean> {
    try {
      await this.waitForElement(this.selectors.usernameInput, 5000);
      await this.waitForElement(this.selectors.passwordInput, 5000);
      return true;
    } catch {
      return false;
    }
  }

  async isErrorMessageVisible(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.errorMessage);
  }

  async getErrorMessage(): Promise<string> {
    if (await this.isErrorMessageVisible()) {
      return (await this.getText(this.selectors.errorMessage)) || '';
    }
    return '';
  }

  async verifySuccessfulLogin(expectedUrlPattern?: string | RegExp): Promise<void> {
    const currentUrl = await this.getUrl();
    expect(currentUrl).not.toContain('sign-in');
    if (expectedUrlPattern) {
      if (typeof expectedUrlPattern === 'string') {
        expect(currentUrl).toContain(expectedUrlPattern);
      } else {
        expect(currentUrl).toMatch(expectedUrlPattern);
      }
    }
  }
}
