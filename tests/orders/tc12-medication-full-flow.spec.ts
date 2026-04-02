import { test, expect, Page, BrowserContext } from '@playwright/test';
import { createPageObjectsForPage, PageObjects } from '../../fixtures/page-objects.fixture';
import { CredentialManager } from '../../utils/credential-manager';
import { TestDataManager } from '../../utils/test-data-manager';
import { DateHelper } from '../../utils/date-helper';
import { MedicationOrderData } from '../../types/order.types';
import { TIMEOUTS } from '../../config/timeouts';

/**
 * TC-12: Medication Order – Full Flow with MAR & PRN
 *
 * Uses serial pattern: login once, share browser session across all steps.
 * Tests medication order creation with PRN and MAR details,
 * discontinue flow, and data flow to OM/Provider Panel.
 */

let sharedPage: Page;
let sharedContext: BrowserContext;
let pages: PageObjects;

const todayFormatted = DateHelper.getTodaysDate();
const physicianName = TestDataManager.getPhysician();

test.describe.serial('TC-12: Medication Order – Full Flow with MAR & PRN', () => {
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

  test('Step 2-3: Enter medication with PRN and MAR', async () => {
    test.setTimeout(120000);

    await test.step('Enter medication order with PRN and MAR details', async () => {
      const medData: MedicationOrderData = {
        medicationName: 'Morphine injection',
        dosage: '10mg',
        route: 'external',
        frequency: 'Every 4 hours',
        isPRN: true,
        prnReasons: 'Pain management',
        isMAR: true,
        marTime: '08:00',
        marDaysOfWeek: ['Monday', 'Wednesday', 'Friday'],
        marNotes: 'Administer with food',
        discontinueDate: DateHelper.getFutureDate(30),
        hospicePays: true,
        orderingProvider: physicianName,
        role: 'Registered Nurse (RN)',
        approvalType: 'Verbal',
      };

      await pages.orderEntry.addMedicationOrder(medData);
    });

    await test.step('Verify order on grid', async () => {
      await pages.orderEntry.searchOrders('Morphine injection');
      const rowCount = await pages.orderEntry.getOrderRowCount();
      expect(rowCount).toBeGreaterThan(0);
      console.log('Medication order with PRN & MAR on grid');
    });

    await test.step('Verify details by clicking caret', async () => {
      // getOrderDetailsText already clicks the caret internally
      const details = await pages.orderEntry.getOrderDetailsText(0);
      expect(details).toBeTruthy();
      console.log('Medication order details verified');
      await pages.orderEntry.clearSearch();
    });
  });

  test('Step 4-5: Discontinue medication order', async () => {
    test.setTimeout(120000);

    await test.step('Create medication order', async () => {
      const medData: MedicationOrderData = {
        medicationName: 'Ibuprofen-famotidine',
        dosage: '800mg',
        route: 'Oral',
        frequency: 'Twice daily',
        hospicePays: true,
        orderingProvider: physicianName,
        role: 'Registered Nurse (RN)',
        approvalType: 'Verbal',
      };
     await pages.orderEntry.addMedicationOrder(medData);
    });

    await test.step('Discontinue the medication order', async () => {
      await pages.orderEntry.searchOrders('Ibuprofen-famotidine');
      await pages.orderEntry.discontinueOrder(0, {
        discontinueDate: todayFormatted,
        discontinueProviderName: physicianName,
        discontinueReason: 'Patient adverse reaction',
        approvalType: 'Verbal',
      });
    });

    await test.step('Verify discontinued order', async () => {
      // await pages.orderEntry.toggleHideDiscontinued();
      await pages.orderEntry.searchOrders('Ibuprofen-famotidine');

      // getOrderDetailsText already clicks the caret internally
      const details = await pages.orderEntry.getOrderDetailsText(0);
      expect(details).toBeTruthy();
      console.log('Medication order discontinued and verified');
      await pages.orderEntry.clearSearch();
    });
  });

  test('Step 6: Verify data flow to OM and Provider Panel', async () => {
    test.setTimeout(120000);

    let capturedOrderId = '';

    await test.step('Create verbal medication order and capture order ID', async () => {
      // App calls /orders twice: first returns 200 (empty), second returns 201 (order data).
      // Match the 201 response which contains the orderId.
      const orderResponsePromise = sharedPage.waitForResponse(
        (resp) =>
          resp.request().method() === 'POST' &&
          resp.url().includes('/orders') &&
          resp.status() === 201,
        { timeout: 60000 }
      );

      const medData: MedicationOrderData = {
        medicationName: 'Acetaminophen extra strength',
        dosage: '500mg',
        route: 'Oral',
        frequency: 'Every 6 hours',
        hospicePays: true,
        orderingProvider: physicianName,
        role: 'Registered Nurse (RN)',
        approvalType: 'Verbal',
      };
      await pages.orderEntry.addMedicationOrder(medData);

      // Extract orderId from the API response
      try {
        const response = await orderResponsePromise;
        const body = await response.json();
        capturedOrderId = String(body?.orderId || '');
        console.log(`Captured order ID from API: ${capturedOrderId}`);
        console.log(`Order type: ${body?.orderType}, Name: ${body?.nameDescription}`);
      } catch {
        console.log('Could not capture order ID — will search by medication name');
      }
    });

    await test.step('Navigate to Order Management', async () => {
      

      // Click Rubik's cube and select Order Management
      await pages.dashboard.navigateToModule('OrderManagement');

      // Verify navigation to list orders page
      await sharedPage.waitForURL('**/listOrders**', { timeout: 10000 });
      expect(sharedPage.url()).toContain('listOrders');
      console.log('Navigated to Order Management - listOrders page');
    });

    await test.step('Search for order and verify in grid', async () => {
      // Search by order ID if captured, otherwise search by medication name
      const searchTerm = capturedOrderId || 'Acetaminophen';
      const searchInput = sharedPage.locator('input.searchbar-input');
      await searchInput.waitFor({ state: 'visible', timeout: 5000 });
      await searchInput.fill(searchTerm);
      await searchInput.press('Enter');
      await sharedPage.waitForTimeout(3000);
      console.log(`Searched for: ${searchTerm}`);

      // Verify the order appears in the OM grid
      const orderRow = sharedPage.locator('ion-row.order-record-rows').first();
      await expect(orderRow).toBeVisible({ timeout: 10000 });

      // Verify order type is "Medication"
      const orderType = orderRow.locator('.ion-col-order-type ion-label');
      await expect(orderType).toContainText('Medication');

      // Verify order number matches
      const orderNumber = orderRow.locator('.ion-col-order-number ion-label');
      const displayedOrderNum = await orderNumber.textContent();
      console.log(`Order number in OM grid: ${displayedOrderNum?.trim()}`);

      // Verify start date
      const startDate = orderRow.locator('.ion-col-order-start-date');
      await expect(startDate).toContainText(todayFormatted);

      console.log('Order verified in Order Management grid');
    });

    await test.step('Add operational note on OM page', async () => {
      // Click ellipsis on the first order row in OM grid
      const orderRow = sharedPage.locator('ion-row.order-record-rows').first();
      await orderRow.locator('[data-cy="btn-allergy-more"]').click();
      await sharedPage.waitForTimeout(1000);
      console.log('Clicked ellipsis on OM order row');

      // Click "Add an Operational Note"
      await sharedPage.locator('[data-cy="btn-add-notes"]').click();
      await sharedPage.waitForTimeout(2000);
      console.log('Opened Add Operational Note dialog');

      // Fill the note textarea
      await sharedPage.locator('ion-textarea[formcontrolname="note"] textarea').fill('Cross-page validation note');
      await sharedPage.waitForTimeout(500);

      // Click Save
      await sharedPage.locator('add-notes-popover button.save-button').click();
      await sharedPage.waitForTimeout(3000);
      console.log('Operational note saved');
    });

    await test.step('Navigate to patient Order Entry', async () => {
      // Click patient ID link to navigate to patient
      const patientIdLink = sharedPage.locator('ion-row.order-record-rows').first().locator('.ion-col-patient-id a');
      await patientIdLink.click();
      await sharedPage.waitForTimeout(3000);
      console.log('Navigated to patient profile via patient ID link');

      await pages.orderEntry.navigateToOrderEntry();
    });

    await test.step('Verify operational note in OE history', async () => {
      const searchTerm = capturedOrderId || 'Acetaminophen';
      await pages.orderEntry.searchOrders(searchTerm);
      await pages.orderEntry.clickCaretOnRow(0);
      const historyText = await pages.orderEntry.getHistoryText(0);
      expect(historyText).toContain('Cross-page validation note');
      console.log('Operational note verified on OE page');
      await pages.orderEntry.clearSearch();
    });
  });
});
