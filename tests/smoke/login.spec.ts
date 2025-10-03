import { test, expect, chromium, Browser, Page } from '@playwright/test';
import { LoginPage } from '../../pages/login.page';
import { CredentialManager } from '../../utils/credential-manager';
import { AuthHelper } from '../../helpers/auth.helper';

test.describe('Login Tests @smoke', () => {
  let browser: Browser;
  let page: Page;
  let loginPage: LoginPage;

  // Launch browser once before all tests
  test.beforeAll(async () => {
    browser = await chromium.launch({
      headless: CredentialManager.isHeadless(),
      slowMo: Number(process.env.SLOWMO) || 0
    });

    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      ignoreHTTPSErrors: true,
      baseURL: CredentialManager.getBaseUrl()
    });

    page = await context.newPage();
    loginPage = new LoginPage(page);
    console.log('🚀 Browser launched - using single window for all tests');
  });

  // Close browser after all tests
  test.afterAll(async () => {
    await browser.close();
    console.log('🔒 Browser closed');
  });

  test('Step 1: Verify login page elements', async () => {
    // Navigate to login page
    await loginPage.goto();

    // Verify login page is displayed
    const isLoginPage = await loginPage.isLoginPageDisplayed();
    expect(isLoginPage).toBeTruthy();

    // Check for email input field
    const isUsernameVisible = await loginPage.isUsernameInputVisible();
    expect(isUsernameVisible).toBeTruthy();

    // Check for password input field
    const isPasswordVisible = await loginPage.isPasswordInputVisible();
    expect(isPasswordVisible).toBeTruthy();

    // Check for Sign In button
    const isLoginButtonVisible = await loginPage.isLoginButtonVisible();
    expect(isLoginButtonVisible).toBeTruthy();

    console.log('✅ All login page elements are visible');
  });

  test('Step 2: Login successfully', async () => {
    // Use AuthHelper to login (credentials from .env.local)
    await AuthHelper.login(page);

    // Wait for navigation to complete
    await page.waitForLoadState('networkidle');

    // Wait a bit for any client-side routing
    await page.waitForTimeout(3000);

    // Verify we're logged in (not on login page anymore)
    const currentUrl = page.url();
    const baseUrl = CredentialManager.getBaseUrl();

    // Check that we're no longer on the login page
    expect(currentUrl).not.toContain('login');

    // Verify we're on the correct environment URL
    const urlHost = new URL(baseUrl).host;
    expect(currentUrl).toContain(urlHost);

    console.log(`📍 Current URL after login: ${currentUrl}`);

    // Take a screenshot of the page after login
    await page.screenshot({
      path: `screenshots/after-login-${Date.now()}.png`,
      fullPage: true
    });

    // Verify login form is not visible (we're logged in)
    const isStillOnLoginPage = await loginPage.isLoginPageDisplayed();
    if (isStillOnLoginPage) {
      console.log('❌ Still on login page - login may have failed');
      throw new Error('Login failed - still showing login form');
    } else {
      console.log('✅ Login form is gone - login successful');
    }

    // Verify page title
    const pageTitle = await page.title();
    expect(pageTitle).toContain('Curantis');
    console.log(`📄 Page title: ${pageTitle}`);
  });

  test('Step 3: Verify user stays logged in', async () => {
    // Since we're using the same browser, we should still be logged in
    const currentUrl = page.url();
    const baseUrl = CredentialManager.getBaseUrl();
    const urlHost = new URL(baseUrl).host;

    // Verify we're not back on the login page
    expect(currentUrl).not.toContain('login');
    expect(currentUrl).toContain(urlHost);

    console.log(`✅ User is still logged in at: ${currentUrl}`);

    // Take a final screenshot
    await page.screenshot({
      path: `screenshots/still-logged-in-${Date.now()}.png`,
      fullPage: true
    });
  });

  test('Step 4: Logout from the application', async () => {
    // Take a screenshot before attempting logout
    await page.screenshot({
      path: `screenshots/before-logout-${Date.now()}.png`,
      fullPage: true
    });

    // Use AuthHelper to logout
    await AuthHelper.logout(page);

    // Verify we're back on the login page
    const loginPageVisible = await loginPage.isLoginPageDisplayed();
    expect(loginPageVisible).toBeTruthy();
    console.log('✅ Login form is displayed after logout');

    // Take a screenshot of the login page after logout
    await page.screenshot({
      path: `screenshots/after-logout-${Date.now()}.png`,
      fullPage: true
    });
  });
});