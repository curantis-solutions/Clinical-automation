import { test, expect, Page, BrowserContext } from '@playwright/test';
import { createPageObjectsForPage, PageObjects } from '../../fixtures/page-objects.fixture';
import { CredentialManager } from '../../utils/credential-manager';
import { TestDataManager } from '../../utils/test-data-manager';
import { DateHelper } from '../../utils/date-helper';
import { MedicationOrderData } from '../../types/order.types';
import { TIMEOUTS } from '../../config/timeouts';

/**
 * TC-14: Medication Order – Add/Edit MAR Details & Verify on Care Plan
 *
 * Uses serial pattern: login once, share browser session across all steps.
 * Creates medication orders, adds MAR details via ellipsis menu,
 * navigates to Care Plan page to verify MAR grid, then repeats for a second order.
 *
 * Flow:
 *   Step 1:  RN creates medication order #1 (Amoxicillin)
 *   Step 2:  Add MAR details to order #1 via ellipsis → Add/Edit MAR
 *   Step 3:  Navigate to Care Plan → verify MAR grid shows 1 medication
 *   Step 4:  Go back to Order Entry → create medication order #2 (Zithromax)
 *   Step 5:  Add MAR details to order #2 via ellipsis
 *   Step 6:  Navigate to Care Plan → verify MAR grid shows 2 medications
 */

let sharedPage: Page;
let sharedContext: BrowserContext;
let pages: PageObjects;

const physicianName = TestDataManager.getPhysician();

test.describe.serial('TC-14: Medication Order – Add/Edit MAR Details & Care Plan Verification', () => {
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
  // Step 1: Create medication order #1
  // =========================================================================
  test('Step 1: Create medication order #1 (Amoxicillin)', async () => {
    test.setTimeout(120000);

    await test.step('Create medication order without MAR', async () => {
      await pages.orderEntry.addMedicationOrder({
        medicationName: 'Amoxicillin',
        dosage: '250mg',
        route: 'Oral',
        frequency: 'Three times daily',
        hospicePays: true,
        orderingProvider: physicianName,
        role: 'Registered Nurse (RN)',
        approvalType: 'Verbal',
      });
      console.log('Medication order #1 (Amoxicillin) created');
    });
  });

  // =========================================================================
  // Step 2: Add MAR details to order #1 via ellipsis menu
  // =========================================================================
  test('Step 2: Add MAR details to order #1', async () => {
    test.setTimeout(120000);

    await test.step('Add MAR details via ellipsis menu', async () => {
      await pages.orderEntry.searchOrders('Amoxicillin');
      await pages.orderEntry.addEditMARDetails(0, {
        enabled: true,
        time: '09:00',
        daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      });
      console.log('MAR details added to order #1');
      await pages.orderEntry.clearSearch();
    });
  });

  // =========================================================================
  // Step 3: Navigate to Care Plan and verify MAR grid shows 1 medication
  // =========================================================================
  test('Step 3: Verify MAR grid on Care Plan (1 medication)', async () => {
    test.setTimeout(120000);

    await test.step('Exit Order Entry and navigate to Care Plan', async () => {
      await pages.orderEntry.exitOrderEntry();
      await pages.carePlan.navigateToCarePlan();
      console.log('Navigated to Care Plan page');
    });

    await test.step('Verify MAR card is visible with medication', async () => {
      // Verify MAR card is visible
      const marVisible = await pages.carePlan.isMarCardVisible();
      expect(marVisible).toBeTruthy();
      console.log('MAR card is visible');

      // Verify medication count badge >= 1
      const medCount = await pages.carePlan.getMarMedicationCount();
      console.log(`Medications badge count: ${medCount}`);
      expect(medCount).toBeGreaterThanOrEqual(1);

      // Verify Amoxicillin appears in the MAR grid
      const medNames = await pages.carePlan.getMarMedicationNames();
      console.log(`MAR grid medications: ${medNames.join(', ')}`);
      const hasAmoxicillin = await pages.carePlan.verifyMedicationInMarGrid('amoxicillin');
      expect(hasAmoxicillin).toBeTruthy();

      // Verify MAR grid table exists with time slots
      const gridCount = await pages.carePlan.getMarGridTableCount();
      expect(gridCount).toBeGreaterThanOrEqual(1);
      console.log('MAR grid table with time slots verified');
    });
  });

  // =========================================================================
  // Step 4: Go back to Order Entry and create medication order #2
  // =========================================================================
  test('Step 4: Create medication order #2 (Zithromax)', async () => {
    test.setTimeout(120000);

    await test.step('Navigate back to Order Entry', async () => {
      await pages.orderEntry.navigateToOrderEntry();
      console.log('Back on Order Entry page');
    });

    await test.step('Create second medication order', async () => {
      await pages.orderEntry.addMedicationOrder({
        medicationName: 'Zithromax',
        dosage: '200mg',
        route: 'Oral',
        frequency: 'Daily',
        hospicePays: true,
        orderingProvider: physicianName,
        role: 'Registered Nurse (RN)',
        approvalType: 'Verbal',
      });
      console.log('Medication order #2 (Zithromax) created');
    });
  });

  // =========================================================================
  // Step 5: Add MAR details to order #2 via ellipsis menu
  // =========================================================================
  test('Step 5: Add MAR details to order #2', async () => {
    test.setTimeout(120000);

    await test.step('Add MAR details with Administration option', async () => {
      await pages.orderEntry.searchOrders('Zithromax');
      await pages.orderEntry.addEditMARDetails(0, {
        enabled: true,
        administration: 'Morning',
        additionalNotes: 'Take on empty stomach',
      });
      console.log('MAR details added to order #2');
      await pages.orderEntry.clearSearch();
    });
  });

  // =========================================================================
  // Step 6: Navigate to Care Plan and verify MAR grid shows 2 medications
  // =========================================================================
  test('Step 6: Verify MAR grid on Care Plan (2 medications)', async () => {
    test.setTimeout(120000);

    await test.step('Exit Order Entry back to Care Plan', async () => {
      await pages.orderEntry.exitOrderEntry();
      // exitOrderEntry returns to Care Plan page (where we came from)
      await sharedPage.waitForTimeout(2000);
      console.log('Back on Care Plan page');
    });

    await test.step('Verify MAR card shows 2 medications', async () => {
      const marVisible = await pages.carePlan.isMarCardVisible();
      expect(marVisible).toBeTruthy();

      // Verify medication count badge >= 2
      const medCount = await pages.carePlan.getMarMedicationCount();
      console.log(`Medications badge count: ${medCount}`);
      expect(medCount).toBeGreaterThanOrEqual(2);

      // Verify grid tables count >= 2
      const gridCount = await pages.carePlan.getMarGridTableCount();
      console.log(`MAR grid tables count: ${gridCount}`);
      expect(gridCount).toBeGreaterThanOrEqual(2);

      // Verify both medication names in the MAR grid
      const medNames = await pages.carePlan.getMarMedicationNames();
      console.log(`MAR medications: ${medNames.join(', ')}`);

      const hasAmoxicillin = await pages.carePlan.verifyMedicationInMarGrid('amoxicillin');
      const hasZithromax = await pages.carePlan.verifyMedicationInMarGrid('zithromax');
      expect(hasAmoxicillin).toBeTruthy();
      expect(hasZithromax).toBeTruthy();
      console.log('Both medications verified in MAR grid');
    });
  });
});
