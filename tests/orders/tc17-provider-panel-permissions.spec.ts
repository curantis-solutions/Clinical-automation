import { test, expect, Page, BrowserContext } from '@playwright/test';
import { createPageObjectsForPage, PageObjects } from '../../fixtures/page-objects.fixture';
import { CredentialManager } from '../../utils/credential-manager';
import { TestDataManager } from '../../utils/test-data-manager';
import { TIMEOUTS } from '../../config/timeouts';

/**
 * TC-17: Provider Panel – RN/Admin Permissions
 *
 * Uses serial pattern: login once as RN, share browser session across all steps.
 * Tests that RN cannot e-sign or reject orders from the Provider Panel.
 *
 * Flow:
 *   Step 1: RN navigates to Provider Panel
 *   Step 2: RN searches for provider and selects
 *   Step 3: Verify orders are visible but Actions dropdown is disabled
 *   Step 4: Verify no ellipsis (e-sign/reject) menu exists on order rows
 */

let sharedPage: Page;
let sharedContext: BrowserContext;
let pages: PageObjects;

const physicianName = TestDataManager.getPhysician();

test.describe.serial('TC-17: Provider Panel – RN/Admin Permissions', () => {
  test.beforeAll(async ({ browser }) => {
    sharedContext = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      ignoreHTTPSErrors: true,
      baseURL: CredentialManager.getBaseUrl(),
    });
    sharedPage = await sharedContext.newPage();
    sharedPage.setDefaultTimeout(TIMEOUTS.PAGE_DEFAULT);
    sharedPage.setDefaultNavigationTimeout(TIMEOUTS.PAGE_NAVIGATION);
    pages = createPageObjectsForPage(sharedPage);

    // Login as RN
    await pages.login.goto();
    const rnCreds = CredentialManager.getCredentials(undefined, 'RN');
    await pages.login.login(rnCreds.username, rnCreds.password);
    console.log('Logged in as RN');
  });

  test.afterAll(async () => {
    if (sharedContext) {
      await sharedContext.close();
    }
  });

  // =========================================================================
  // Step 1: RN navigates to Provider Panel
  // =========================================================================
  test('Step 1: RN navigates to Provider Panel', async () => {
    test.setTimeout(120000);

    await test.step('Navigate to Provider Panel', async () => {
      await pages.providerPanel.navigateToProviderPanel();
      console.log('RN navigated to Provider Panel');
    });
  });

  // =========================================================================
  // Step 2: RN searches for provider and selects
  // =========================================================================
  test('Step 2: RN searches for provider and selects', async () => {
    test.setTimeout(120000);

    await test.step('Search for provider and select', async () => {
      await pages.providerPanel.searchProvider(physicianName);
      console.log('Searched and selected provider');
    });
  });

  // =========================================================================
  // Step 3: Verify Actions dropdown is disabled for RN
  // =========================================================================
  test('Step 3: Verify Actions dropdown is disabled for RN', async () => {
    test.setTimeout(120000);

    await test.step('Verify orders are visible on Provider Panel', async () => {
      // Orders header shows count e.g. "Patient Orders to Review/Sign (147)"
      const ordersHeader = sharedPage.getByText('Patient Orders to Review/Sign').first();
      await expect(ordersHeader).toBeVisible({ timeout: 10000 });
      console.log('Orders are visible on Provider Panel');
    });

    await test.step('Verify Actions for e-Sign Orders dropdown is disabled', async () => {
      const actionsDropdown = sharedPage.getByText('Actions for e-Sign Orders').locator('..').locator('input[role="combobox"], select, [role="combobox"]').first();
      const isDisabled = await actionsDropdown.isDisabled();
      expect(isDisabled).toBeTruthy();
      console.log('Actions for e-Sign Orders dropdown is disabled for RN');
    });
  });

  // =========================================================================
  // Step 4: Verify no ellipsis (e-sign/reject) menu on order rows
  // =========================================================================
  test('Step 4: Verify no e-sign/reject options on order rows for RN', async () => {
    test.setTimeout(120000);

    await test.step('Verify ellipsis menu is not present on order rows', async () => {
      // RN should not see any ellipsis action menus on order rows
      const ellipsisCount = await sharedPage.locator('[data-cy="btn-allergy-more"]').count();
      expect(ellipsisCount).toBe(0);
      console.log('No ellipsis menu found on order rows — e-sign/reject not available for RN');
    });

    await test.step('Verify e-sign button is not present', async () => {
      const eSignCount = await sharedPage.locator('[data-cy="btn-eSign"]').count();
      expect(eSignCount).toBe(0);
      console.log('E-sign button not present for RN');
    });

    await test.step('Verify reject button is not present', async () => {
      const rejectCount = await sharedPage.locator('[data-cy="btn-reject"]').count();
      expect(rejectCount).toBe(0);
      console.log('Reject button not present for RN');
    });
  });
});
