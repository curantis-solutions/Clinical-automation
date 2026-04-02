import { test, expect, Page, BrowserContext } from '@playwright/test';
import { createPageObjectsForPage, PageObjects } from '../../fixtures/page-objects.fixture';
import { CredentialManager } from '../../utils/credential-manager';
import { TestDataManager } from '../../utils/test-data-manager';
import { DateHelper } from '../../utils/date-helper';
import { TIMEOUTS } from '../../config/timeouts';

/**
 * TC-13: Medication Order – Duplicate & Custom Strength
 *
 * Uses serial pattern: login once, share browser session across all steps.
 * Tests duplicate medication warning and custom strength entry.
 *
 * Flow:
 *   Step 3-4: Enter medication order, re-enter same → duplicate warning
 *   Step 5-7: Enter medication with custom strength → verify in description
 */

let sharedPage: Page;
let sharedContext: BrowserContext;
let pages: PageObjects;

const todayFormatted = DateHelper.getTodaysDate();
const physicianName = TestDataManager.getPhysician();

test.describe.serial('TC-13: Medication Order – Duplicate & Custom Strength', () => {
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
    const credentials = CredentialManager.getCredentials(undefined, 'RN');
    await pages.login.login(credentials.username, credentials.password);
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
  // Step 3-4: Enter medication and re-enter same - duplicate warning
  // =========================================================================
  test('Step 3-4: Enter medication and re-enter same - duplicate warning', async () => {
    test.setTimeout(120000);

    await test.step('Enter first medication order', async () => {
      await pages.orderEntry.addMedicationOrder({
        medicationName: 'Lisinopril',
        dosage: '10mg',
        route: 'Oral',
        frequency: 'Daily',
        orderingProvider: physicianName,
        role: 'Registered Nurse (RN)',
        hospicePays: true,
        approvalType: 'Verbal',
      });
      console.log('First medication order created');
    });

    await test.step('Re-enter same medication and verify duplicate warning', async () => {
      await pages.orderEntry.clickAddOrder();
      await pages.orderEntry.selectOrderType('Medication');
      await pages.orderEntry.searchMedication('Lisinopril');

      const warningMsg = await pages.orderEntry.getWarningMessage();
      expect(warningMsg).toContain('same name as a previous order');
      console.log(`Duplicate warning: ${warningMsg}`);

      // Close the modal so subsequent tests can interact with the grid
      await pages.orderEntry.cancelOrder();
    });
  });

  // =========================================================================
  // Step 5-7: Enter custom strength and verify in description
  // =========================================================================
  test('Step 5-7: Enter custom strength and verify in description', async () => {
    test.setTimeout(120000);

    await test.step('Enter medication with custom strength', async () => {
      await pages.orderEntry.clickAddOrder();
      await pages.orderEntry.selectOrderType('Medication');
      await pages.orderEntry.searchMedication('Metformin (bulk)');

      // Enter custom strength
      await pages.orderEntry.enterCustomStrength('100 mg');
      console.log('Custom strength "100 mg" entered');
    });

    await test.step('Fill remaining fields and submit', async () => {
      await pages.orderEntry.fillDosage('1 tablet');
      await pages.orderEntry.selectRoute('Oral');
      await pages.orderEntry.selectFrequency('Daily');
      await pages.orderEntry.setDiscontinueDate(DateHelper.getFutureDate(30));
      await pages.orderEntry.selectOrderingProvider('Registered Nurse (RN)', physicianName);
      await pages.orderEntry.selectHospicePays(true);
      await pages.orderEntry.selectApprovalType('Verbal');
      await pages.orderEntry.clickReadBackVerified();
      await pages.orderEntry.submitOrder();
    });

    await test.step('Verify custom strength in name/description', async () => {
      await pages.orderEntry.searchOrders('Metformin');
      const details = await pages.orderEntry.getOrderDetailsText(0);
      expect(details).toContain('100 mg');
      console.log('Custom strength displayed in order details');
      await pages.orderEntry.clearSearch();
    });
  });
});
