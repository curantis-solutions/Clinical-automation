import { test, expect, chromium, Browser, Page } from '@playwright/test';
import { DashboardPage } from '../../pages/dashboard.page';
import { CredentialManager } from '../../utils/credential-manager';
import { AuthHelper } from '../../helpers/auth.helper';

test.describe('Dashboard Navigation Tests @smoke', () => {
  let browser: Browser;
  let page: Page;
  let dashboardPage: DashboardPage;

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
    dashboardPage = new DashboardPage(page);
    console.log('🚀 Browser launched for dashboard navigation tests');
  });

  // Close browser after all tests
  test.afterAll(async () => {
    await browser.close();
    console.log('🔒 Browser closed');
  });

  test('Login and navigate to multiple modules via Rubik\'s cube', async () => {
    test.setTimeout(120000);
    // Step 1: Login using AuthHelper
    console.log('🔐 Step 1: Logging in...');
    await AuthHelper.login(page);

    // Wait for dashboard to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Verify we're on the dashboard
    const isDashboard = await dashboardPage.isDashboardDisplayed();
    expect(isDashboard).toBeTruthy();
    console.log('✅ Successfully logged in and on dashboard');

    // Take a screenshot
    await page.screenshot({
      path: `screenshots/dashboard-loaded-${Date.now()}.png`,
      fullPage: true
    });

    // Step 2: Verify Rubik's cube icon is visible
    console.log('🔍 Step 2: Checking for Rubik\'s cube icon...');
    const isRubiksCubeVisible = await dashboardPage.isRubiksCubeVisible();
    expect(isRubiksCubeVisible).toBeTruthy();
    console.log('✅ Rubik\'s cube icon is visible');

    // Step 3: Navigate to multiple modules to verify all locators
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
        await dashboardPage.navigateToModule(moduleName);

        // Wait for navigation
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);

        // Get current URL
        const currentUrl = await page.url();
        console.log(`✅ Successfully navigated to ${moduleName}`);
        console.log(`📍 URL: ${currentUrl}`);

        // Take a screenshot
        await page.screenshot({
          path: `screenshots/module-${moduleName.toLowerCase()}-${Date.now()}.png`,
          fullPage: true
        });

        // Go back to dashboard for next iteration
        await dashboardPage.goto();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
        console.log('🏠 Returned to dashboard');

      } catch (error) {
        console.error(`❌ Failed to navigate to ${moduleName}:`, error);
        // Take screenshot of failure
        await page.screenshot({
          path: `screenshots/FAILED-${moduleName.toLowerCase()}-${Date.now()}.png`,
          fullPage: true
        });
        throw error;
      }
    }

    console.log('\n🎉 All modules tested successfully!');
  });
});
