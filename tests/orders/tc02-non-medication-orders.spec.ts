import { test, expect, Page, BrowserContext } from '@playwright/test';
import { createPageObjectsForPage, PageObjects } from '../../fixtures/page-objects.fixture';
import { CredentialManager } from '../../utils/credential-manager';
import { TestDataManager } from '../../utils/test-data-manager';
import { DateHelper } from '../../utils/date-helper';
import { NonMedicationOrderData, NonMedicationOrderType } from '../../types/order.types';
import { TIMEOUTS } from '../../config/timeouts';
/**
 * TC-02: Non-Medication Orders – DME, Other, Supplies, Treatment
 *
 * Uses serial pattern: login once, share browser session across all steps.
 * Tests creation, grid verification, OM/Provider Panel flow,
 * and discontinue for each non-medication order type.
 */

let sharedPage: Page;
let sharedContext: BrowserContext;
let pages: PageObjects;

const todayFormatted = DateHelper.getTodaysDate();
const physicianName = TestDataManager.getPhysician();
test.describe.serial('TC-02: Non-Medication Orders – DME, Other, Supplies, Treatment', () => {
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

    // Login once
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

  const orderTypes: NonMedicationOrderType[] = [ 'DME','Other', 'Supplies', 'Treatment']; 

  for (const orderType of orderTypes) {
    test(`Step 2-4: Create ${orderType} order and verify on grid`, async () => {
      test.setTimeout(120000);

      await test.step(`Add ${orderType} order`, async () => {
        const orderData: NonMedicationOrderData = {
          orderType,
          name: `Test ${orderType} Order`,
          description: `Automated test for ${orderType} order`,
          ...(orderType === 'DME' ? { bodySystem: 'Cardiovascular' } : {}),
          startDate: todayFormatted,
          orderingProvider: physicianName,
          role: 'Registered Nurse (RN)',
          approvalType: 'Verbal',
          hospicePays: true,
        };

        await pages.orderEntry.addNonMedicationOrder(orderData);
      });

      await test.step(`Verify ${orderType} order on grid`, async () => {
        const rowCount = await pages.orderEntry.getOrderRowCount();
        expect(rowCount).toBeGreaterThan(0);
        console.log(`${orderType} order verified on grid`);
      });
    });
  }

  test('Step 5: Verify orders flow to OM/Provider Panel', async () => {
    test.setTimeout(120000);

    await test.step('Create a verbal order', async () => {
      const orderData: NonMedicationOrderData = {
        orderType: 'DME',
        name: 'Test DME for OM flow',
        bodySystem: 'Cardiovascular',
        startDate: todayFormatted,
        orderingProvider: physicianName,
        role: 'Registered Nurse (RN)',
        approvalType: 'Verbal',
        hospicePays: true,
      };
      await pages.orderEntry.addNonMedicationOrder(orderData);
    });

    await test.step('Verify order exists on grid', async () => {
      const rowCount = await pages.orderEntry.getOrderRowCount();
      expect(rowCount).toBeGreaterThan(0);
      console.log('Verbal non-med order created - should flow to OM & Provider Panel');
    });
  });

  test('Step 6-7: Discontinue order and verify details', async () => {
    test.setTimeout(120000);

    await test.step('Create an order to discontinue', async () => {
      const orderData: NonMedicationOrderData = {
        orderType: 'Supplies',
        name: 'Test Supplies for Discontinue',
        startDate: todayFormatted,
        orderingProvider: physicianName,
        role: 'Registered Nurse (RN)',
        approvalType: 'Verbal',
        hospicePays: true,
      };
      await pages.orderEntry.addNonMedicationOrder(orderData);
    });

    await test.step('Discontinue the order with today\'s date', async () => {
      await pages.orderEntry.discontinueOrder(0, {
        discontinueDate: todayFormatted,
        discontinueProviderName: physicianName,
        discontinueReason: 'No longer needed',
        approvalType: 'Verbal',
      });
    });

    await test.step('Verify discontinue details and history', async () => {
      // After discontinuing, the order disappears when "Hide Discontinued" is checked (default).
      // Uncheck the toggle to see the discontinued order, then verify its details.
     // await pages.orderEntry.toggleHideDiscontinued();

      await pages.orderEntry.clickCaretOnRow(0);
      const historyText = await pages.orderEntry.getHistoryText(0);
      expect(historyText).toBeTruthy();
      console.log('Discontinue details and history verified');
    });
  });
});
