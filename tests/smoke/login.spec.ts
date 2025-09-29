import { test, expect, chromium, Browser, Page } from '@playwright/test';
import { LoginPage } from '../../pages/login.page';
import { CredentialManager } from '../../utils/credential-manager';

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
    const emailInput = page.locator('input[placeholder="EMAIL"]');
    await expect(emailInput).toBeVisible();

    // Check for password input field
    const passwordInput = page.locator('input[placeholder="PASSWORD"]');
    await expect(passwordInput).toBeVisible();

    // Check for Sign In button
    const signInButton = page.locator('button:has-text("SIGN IN")');
    await expect(signInButton).toBeVisible();

    console.log('✅ All login page elements are visible');
  });

  test('Step 2: Login successfully', async () => {
    // Get credentials from environment variables
    const credentials = CredentialManager.getCredentials();

    // Since we're already on login page from previous test, just login
    await loginPage.login(credentials.username, credentials.password);

    // Wait for navigation to complete
    await page.waitForLoadState('networkidle');

    // Wait a bit for any client-side routing
    await page.waitForTimeout(3000);

    // Verify we're logged in (not on login page anymore)
    const currentUrl = page.url();

    // Check that we're no longer on the login page
    expect(currentUrl).not.toContain('login');
    expect(currentUrl).toContain('clinical.qa1.curantissolutions.com');

    // Log success
    console.log(`✅ Successfully logged in as ${credentials.username}`);
    console.log(`📍 Current URL after login: ${currentUrl}`);

    // Look for common elements that appear after login
    // This could be a navigation menu, user profile, logout button, etc.
    const possibleDashboardElements = [
      'button:has-text("Logout")',
      'button:has-text("Sign Out")',
      '[data-testid="dashboard"]',
      'nav',
      '.dashboard',
      '#dashboard',
      '[role="navigation"]',
      'a:has-text("Dashboard")',
      'a:has-text("Home")'
    ];

    // Check if any dashboard/logged-in elements are visible
    let foundElement = null;
    for (const selector of possibleDashboardElements) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 1000 })) {
          foundElement = selector;
          break;
        }
      } catch {
        // Element not found, continue checking
      }
    }

    if (foundElement) {
      console.log(`✅ Found logged-in element: ${foundElement}`);
    } else {
      console.log('⚠️ No specific dashboard elements found, but URL changed from login');
    }

    // Take a screenshot of the page after login
    await page.screenshot({
      path: `screenshots/after-login-${Date.now()}.png`,
      fullPage: true
    });

    // Log what's visible on the page
    const pageContent = await page.content();
    const hasLoginForm = pageContent.includes('EMAIL') && pageContent.includes('PASSWORD');

    if (hasLoginForm) {
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

    // Verify we're not back on the login page
    expect(currentUrl).not.toContain('login');
    expect(currentUrl).toContain('clinical.qa1.curantissolutions.com');

    console.log(`✅ User is still logged in at: ${currentUrl}`);

    // Take a final screenshot
    await page.screenshot({
      path: `screenshots/still-logged-in-${Date.now()}.png`,
      fullPage: true
    });
  });

  test('Step 4: Logout from the application', async () => {
    // First, make sure we're still on the dashboard
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Take a screenshot before attempting logout
    await page.screenshot({
      path: `screenshots/before-logout-${Date.now()}.png`,
      fullPage: true
    });

    // Step 1: Click on the user profile button (btn-user-profile)
    const userProfileButton = page.locator('[class*="btn-user-profile"], #btn-user-profile, button.btn-user-profile, [data-testid="user-profile"]').first();

    // Wait for and click the user profile button
    await userProfileButton.waitFor({ state: 'visible', timeout: 5000 });
    await userProfileButton.click();
    console.log('✅ Clicked on user profile button');

    // Wait for the menu to appear
    await page.waitForTimeout(1000);

    // Step 2: Now look for and click the Sign out option
    const signOutSelectors = [
      'text="Sign out"',
      'text="Sign Out"',
      'text="SIGN OUT"',
      'button:has-text("Sign out")',
      'a:has-text("Sign out")',
      '[aria-label*="Sign out" i]',
      'li:has-text("Sign out")',
      'div:has-text("Sign out")'
    ];

    let signOutButton = null;
    for (const selector of signOutSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 1000 })) {
          signOutButton = element;
          console.log(`✅ Found Sign out option with selector: ${selector}`);
          break;
        }
      } catch {
        continue;
      }
    }

    if (!signOutButton) {
      throw new Error('Sign out option not found after clicking user profile');
    }

    // Click the Sign out button
    await signOutButton.click();
    console.log('✅ Clicked Sign out button');

    // Wait for navigation back to login page
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Verify we're back on the login page
    const currentUrl = page.url();
    const loginPageVisible = await loginPage.isLoginPageDisplayed();

    // Check if we're back on login page
    expect(loginPageVisible).toBeTruthy();
    console.log(`✅ Successfully logged out, back at: ${currentUrl}`);

    // Verify login form elements are visible again
    const emailInput = page.locator('input[placeholder="EMAIL"]');
    await expect(emailInput).toBeVisible();
    console.log('✅ Login form is displayed after logout');

    // Take a screenshot of the login page after logout
    await page.screenshot({
      path: `screenshots/after-logout-${Date.now()}.png`,
      fullPage: true
    });
  });
});