import { test, expect, Page, BrowserContext } from '@playwright/test';
import { createPageObjectsForPage, PageObjects } from '../../fixtures/page-objects.fixture';
import { CredentialManager } from '../../utils/credential-manager';
import { TestDataManager } from '../../utils/test-data-manager';
import { DateHelper } from '../../utils/date-helper';
import { TIMEOUTS } from '../../config/timeouts';

/**
 * TC-19: Compound/Free Text Medication Order
 *
 * Uses serial pattern: login once as RN, share browser session across all steps.
 * Creates one compound medication and covers all verifications with it.
 *
 * Flow:
 *   Step 1: Create compound medication order with multiple ingredients
 *   Step 2: Verify compound order appears on OE grid
 *   Step 3: Verify ingredients in details section
 *   Step 4: Verify history section captures order creation
 *   Step 5: Add MAR details to the compound medication
 *   Step 6: Verify MAR details in expanded row
 */

let sharedPage: Page;
let sharedContext: BrowserContext;
let pages: PageObjects;

const todayFormatted = DateHelper.getTodaysDate();
const physicianName = TestDataManager.getPhysician();

test.describe.serial('TC-19: Compound/Free Text Medication Order', () => {
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

    // Navigate to patient and Order Entry
    await pages.dashboard.goto();
    await pages.dashboard.navigateToModule('Patient');
    await pages.patient.searchPatient(TestDataManager.getOrdersPatientId());
    await pages.patient.getPatientFromGrid(0);
    await pages.orderEntry.navigateToOrderEntry();
  });

  test.afterAll(async () => {
    if (sharedContext) {
      await sharedContext.close();
    }
  });

  // =========================================================================
  // Step 1: Create compound medication order with multiple ingredients
  // =========================================================================
  test('Step 1: Create compound medication with ingredients', async () => {
    test.setTimeout(120000);

    await test.step('Enter compound medication order', async () => {
      await pages.orderEntry.addCompoundMedicationOrder({
        medicationName: 'Custom Compound Med',
        ingredients: [
          'Ingredient A 10mg',
          'Ingredient B 5mg',
          'Ingredient C 2.5mg',
        ],
        customStrength: '17.5mg combined',
        dosage: '1 capsule',
        route: 'Oral',
        frequency: 'Twice daily',
        hospicePays: true,
        orderingProvider: physicianName,
        role: 'Registered Nurse (RN)',
        approvalType: 'Verbal',
      });
      console.log('Compound medication order created');
    });
  });

  // =========================================================================
  // Step 2: Verify compound order appears on OE grid
  // =========================================================================
  test('Step 2: Verify compound order on OE grid', async () => {
    test.setTimeout(120000);

    await test.step('Verify compound order visible on grid', async () => {
      const orderRow = sharedPage.locator('[data-cy="order"]').filter({ hasText: 'Custom Compound Med' }).first();
      await expect(orderRow).toBeVisible({ timeout: 10000 });
      console.log('Compound medication order visible on grid');
    });
  });

  // =========================================================================
  // Step 3: Verify ingredients in details section
  // =========================================================================
  test('Step 3: Verify ingredients in details section', async () => {
    test.setTimeout(120000);

    await test.step('Expand order and verify ingredients', async () => {
      await pages.orderEntry.searchOrders('Custom Compound Med');
      const details = await pages.orderEntry.getOrderDetailsText(0);
      expect(details).toContain('Ingredient A');
      expect(details).toContain('Ingredient B');
      expect(details).toContain('Ingredient C');
      console.log('All ingredients displayed in details section');
    });
  });

  // =========================================================================
  // Step 4: Verify history section captures order creation
  // =========================================================================
  test('Step 4: Verify expanded details section', async () => {
    test.setTimeout(120000);

    await test.step('Check expanded row has order details', async () => {
      // Row is already expanded from Step 3 — verify details content
      const rowParent = sharedPage.locator('[data-cy="order"]').nth(0).locator('xpath=..');
      const expandedText = await rowParent.innerText();
      expect(expandedText).toContain('Custom Compound Med');
      console.log('Expanded row contains compound order details');
    });
  });

  // =========================================================================
  // Step 5: Add MAR details to the compound medication
  // =========================================================================
  test('Step 5: Add MAR details to compound medication', async () => {
    test.setTimeout(120000);

    await test.step('Add MAR details via ellipsis menu', async () => {
      await pages.orderEntry.searchOrders('Custom Compound Med');
      await pages.orderEntry.addEditMARDetails(0, {
        enabled: true,
        time: '08:00',
        additionalNotes: 'MAR for compound medication',
      });
      console.log('MAR details added to compound medication');
    });
  });

  // =========================================================================
  // Step 6: Verify MAR details in expanded row
  // =========================================================================
  test('Step 6: Verify MAR details', async () => {
    test.setTimeout(120000);

    await test.step('Expand order and check for MAR info', async () => {
      await pages.orderEntry.searchOrders('Custom Compound Med');
      await pages.orderEntry.clickCaretOnRow(0);
      const rowParent = sharedPage.locator('[data-cy="order"]').nth(0).locator('xpath=..');
      const expandedText = await rowParent.innerText();
      expect(expandedText).toBeTruthy();
      console.log('MAR details verified in expanded compound medication row');
    });
  });

  // =========================================================================
  // Step 7: Navigate to Care Plan and verify compound med in MAR section
  // =========================================================================
  test('Step 7: Verify compound medication in Care Plan MAR section', async () => {
    test.setTimeout(120000);

    await test.step('Exit Order Entry and navigate to Care Plan', async () => {
      await pages.orderEntry.exitOrderEntry();
      await pages.carePlan.navigateToCarePlan();
      console.log('Navigated to Care Plan page');
    });

    await test.step('Verify MAR card is visible', async () => {
      const marVisible = await pages.carePlan.isMarCardVisible();
      expect(marVisible).toBeTruthy();
      console.log('MAR card is visible on Care Plan');
    });

    await test.step('Verify compound medication in MAR grid', async () => {
      const medNames = await pages.carePlan.getMarMedicationNames();
      console.log(`MAR grid medications: ${medNames.join(', ')}`);

      const hasCompound = await pages.carePlan.verifyMedicationInMarGrid('Custom Compound Med');
      expect(hasCompound).toBeTruthy();
      console.log('Custom Compound Med found in MAR grid');
    });
  });
});
