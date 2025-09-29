import { test, expect, chromium, Browser, Page } from '@playwright/test';
import { LoginPage } from '../../pages/login.page';
import { CredentialManager } from '../../utils/credential-manager';

// This test file uses a single browser session for all tests
test.describe('Login Tests - Single Session @smoke', () => {
  let browser: Browser;
  let page: Page;
  let loginPage: LoginPage;

  // Setup: Launch browser once before all tests
  test.beforeAll(async () => {
    console.log('🚀 Launching browser for all tests...');
    browser = await chromium.launch({
      headless: CredentialManager.isHeadless(),
      slowMo: Number(process.env.SLOWMO) || 0
    });

    // Create a single page that will be reused
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      ignoreHTTPSErrors: true,
      baseURL: CredentialManager.getBaseUrl()
    });

    page = await context.newPage();
    loginPage = new LoginPage(page);
    console.log('✅ Browser and page ready');
  });

  // Cleanup: Close browser after all tests
  test.afterAll(async () => {
    console.log('🔒 Closing browser...');
    await browser.close();
  });

  // Navigate to login page before each test
  test.beforeEach(async () => {
    await loginPage.goto();
  });

  test('Step 1: Verify login page is accessible', async () => {
    const isLoginPage = await loginPage.isLoginPageDisplayed();
    expect(isLoginPage).toBeTruthy();

    const title = await page.title();
    console.log(`✅ Login page loaded with title: ${title}`);
  });

  test('Step 2: Login with valid credentials', async () => {
    const credentials = CredentialManager.getCredentials();
    console.log(`🔐 Attempting login with: ${credentials.username}`);

    // Perform login
    await loginPage.login(credentials.username, credentials.password);

    // Verify successful login
    await loginPage.verifySuccessfulLogin();

    const currentUrl = await page.url();
    console.log(`✅ Successfully logged in, current URL: ${currentUrl}`);

    // Wait for dashboard elements to load
    await page.waitForLoadState('networkidle');

    // Check if we're on the dashboard
    const pageTitle = await page.title();
    console.log(`📊 Dashboard loaded with title: ${pageTitle}`);

    // Take a screenshot of the dashboard/logged-in state
    await page.screenshot({
      path: `screenshots/dashboard-after-login-${Date.now()}.png`,
      fullPage: true
    });
  });

  test('Step 3: Verify we stay logged in', async () => {
    // Since we're using the same session, we should still be logged in
    const currentUrl = await page.url();

    // We should NOT be on the login page
    expect(currentUrl).not.toContain('login');
    console.log(`✅ Still logged in, current URL: ${currentUrl}`);
  });

  test('Step 4: Navigate around while logged in', async () => {
    // Try navigating to different pages while logged in
    const currentUrl = await page.url();
    console.log(`📍 Current location: ${currentUrl}`);

    // Take a final screenshot
    await page.screenshot({
      path: `screenshots/final-state-${Date.now()}.png`,
      fullPage: true
    });
  });
});