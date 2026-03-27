import { test, expect, Page, BrowserContext } from '@playwright/test';
import { createPageObjectsForPage, PageObjects } from '../../fixtures/page-objects.fixture';
import { CredentialManager } from '../../utils/credential-manager';
import { TestDataManager } from '../../utils/test-data-manager';
import { DateHelper } from '../../utils/date-helper';
import { LOCOrderData } from '../../types/order.types';

/**
 * TC-06: Level of Care (LOC) Orders
 *
 * Uses serial pattern: login once, share browser session across all steps.
 * Tests LOC order creation, duplicate start date validation,
 * void/cancel flow, and auto-discontinue behavior.
 *
 * Optimized sequential flow — each step reuses orders from the previous step:
 *   Step 3:     Create CC (backdate)           → CC active
 *   Step 4-6:   Try duplicate with same date   → warning → cancel (reuses CC)
 *   Step 7-11:  Void CC → add RHC on popup     → RHC active (reuses CC)
 *   Step 12-13: Add GIP on top of RHC          → GIP active, RHC discontinued (reuses RHC)
 *   Step 14:    Void GIP                       → RHC becomes active (reuses GIP)
 */

let sharedPage: Page;
let sharedContext: BrowserContext;
let pages: PageObjects;

const todayFormatted = DateHelper.getTodaysDate();
const oneMonthAgo = DateHelper.getPastDate(30);
const yesterdayFormatted = DateHelper.getPastDate(1);
const physicianName = TestDataManager.getPhysician();
const pnf = 'UnspecifiedFacilityTest';

test.describe.serial('TC-06: Level of Care (LOC) Orders', () => {
  test.beforeAll(async ({ browser }) => {
    sharedContext = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      ignoreHTTPSErrors: true,
      baseURL: CredentialManager.getBaseUrl(),
    });
    sharedPage = await sharedContext.newPage();
    sharedPage.setDefaultTimeout(30000);
    sharedPage.setDefaultNavigationTimeout(30000);
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

  // Step 3: Create CC order — this order is reused by Steps 4-6 and 7-11
  test('Step 3: Enter LOC order (Continuous Care) with backdate', async () => {
    test.setTimeout(120000);

    await test.step('Enter Continuous Care LOC order with backdate', async () => {
      const locData: LOCOrderData = {
        locType: 'Continuous Care',
        startDate: oneMonthAgo,
        orderingProvider: physicianName,
        role: 'Registered Nurse (RN)',
        facility: TestDataManager.getFacilityALF(),
      };

      await pages.orderEntry.addLOCOrder(locData);
    });

    await test.step('Verify LOC order on grid', async () => {
      const rowCount = await pages.orderEntry.getOrderRowCount();
      expect(rowCount).toBeGreaterThan(0);
      console.log('Continuous Care LOC order created with backdate');
    });
  });

  // Step 4-6: Reuses CC from Step 3 — try entering LOC with same start date
  test('Step 4-6: Duplicate start date validation', async () => {
    test.setTimeout(120000);

    await test.step('Try entering another LOC with same start date as CC from Step 3', async () => {
      await pages.orderEntry.clickAddOrder();
      await pages.orderEntry.selectOrderType('Level of Care');
      await pages.orderEntry.selectLevelOfCare('General In-Patient');
      await pages.orderEntry.selectGIPReasonPain();
      await pages.orderEntry.selectCareLocationType('Q5009');
      await pages.orderEntry.selectCareLocation(pnf);
      await pages.orderEntry.setStartDate(oneMonthAgo);

      const warningMsg = await pages.orderEntry.getWarningMessage();
      expect(warningMsg).toContain('Duplicate start date');
      console.log(`Warning: ${warningMsg}`);
    });

    await test.step('Verify submit is not enabled with duplicate dates', async () => {
      const isEnabled = await pages.orderEntry.isSubmitEnabled();
      expect(isEnabled).toBeFalsy();
      console.log('Submit button correctly disabled for duplicate start date');
    });

    await test.step('Cancel the form', async () => {
      await pages.orderEntry.cancelOrder();
      console.log('Order form cancelled');
    });
  });

  // Step 7-11: Reuses CC from Step 3 — void it and add RHC
  test('Step 7-11: Void LOC order and add new LOC', async () => {
    test.setTimeout(120000);

    await test.step('Void the Continuous Care order from Step 3', async () => {
      await pages.orderEntry.voidOrder(0, 'Test void reason - replacing with RHC');
    });

    await test.step('Add new LOC order (Routine Home Care) on popup', async () => {
      // After voiding CC, popup should appear automatically
      await pages.orderEntry.selectLevelOfCare('Routine Home Care');
      await pages.orderEntry.selectCareLocationType('Home');
      await pages.orderEntry.setStartDate(oneMonthAgo);
      await pages.orderEntry.selectOrderingProvider('Registered Nurse (RN)', physicianName);
      await pages.orderEntry.selectApprovalType('Verbal');
      await pages.orderEntry.submitOrder();
    });

    await test.step('Verify new RHC order on grid and previous CC order is voided', async () => {
      const rowCount = await pages.orderEntry.getOrderRowCount();
      expect(rowCount).toBeGreaterThan(0);

      // Find the CC order row and verify it shows "Voided" in the discontinue date column
      const orderRows = sharedPage.locator('[data-cy="order"]');
      const ccRow = orderRows.filter({
        has: sharedPage.locator('[data-cy="value-order-created-row-name-description"]', { hasText: 'Continuous Care' }),
      });
      const ccVoidedStatus = ccRow.locator('[data-cy="value-order-created-row-discontinue-date"]');
      await expect(ccVoidedStatus).toContainText('Voided');
      console.log('Continuous Care order verified as Voided');

      // Verify RHC order exists on the grid
      const rhcRow = orderRows.filter({
        has: sharedPage.locator('[data-cy="value-order-created-row-name-description"]', { hasText: 'Routine Home Care' }),
      });
      await expect(rhcRow).toBeVisible();
      console.log('New RHC order created after voiding Continuous Care');
    });

    await test.step('Exit Order Entry and verify RHC is Active on LOC page', async () => {
      await pages.orderEntry.exitOrderEntry();
      await pages.orderEntry.navigateToLevelOfCare();

      // Verify RHC row shows "Active" status on the LOC page
      const rhcLocRow = sharedPage.locator('ion-row.table-values').filter({
        has: sharedPage.locator('span.capitalise', { hasText: 'Routine Home Care' }),
      });
      await expect(rhcLocRow.locator('span.capitalise', { hasText: 'Active' })).toBeVisible();
      console.log('Routine Home Care verified as Active on LOC page');

      // Navigate back to Order Entry for subsequent steps
      await pages.orderEntry.navigateToOrderEntry();
    });
  });

  // Step 12-13: Reuses RHC from Step 7-11 — add GIP on top to auto-discontinue RHC
  test('Step 12-13: Add new LOC and verify auto-discontinue of previous', async () => {
    test.setTimeout(120000);

    await test.step('Add new GIP order with today start date', async () => {
      const gipData: LOCOrderData = {
        locType: 'General In-Patient',
        startDate: todayFormatted,
        orderingProvider: physicianName,
        role: 'Registered Nurse (RN)',
        facility: TestDataManager.getFacilitySNF(),
        gipReasonPain: true,
        careLocationType: 'Q5004',
      };
      await pages.orderEntry.addLOCOrder(gipData);
    });

    await test.step('Verify RHC auto-discontinued with yesterday date', async () => {
      // The RHC order row contains a discontinued sub-row inside the same [data-cy="order"] element
      const orderRows = sharedPage.locator('[data-cy="order"]');
      const rhcRow = orderRows.filter({
        has: sharedPage.locator('[data-cy="value-order-created-row-name-description"]', { hasText: 'Routine Home Care' }),
      });
      await expect(rhcRow).toBeVisible();

      // Verify the discontinued sub-row shows yesterday's date
      const discontinueDate = rhcRow.locator('[data-cy="value-discontinue-order-row-discontinue-date"]');
      await expect(discontinueDate).toContainText(yesterdayFormatted);
      console.log(`RHC auto-discontinued with date: ${yesterdayFormatted}`);
    });
  });

  // Step 14: Reuses GIP from Step 12-13 — void it so RHC becomes active again
  test('Step 14: Void latest LOC and verify previous becomes active', async () => {
    test.setTimeout(120000);

    await test.step('Void GIP order from Step 12-13', async () => {
      await pages.orderEntry.voidOrder(0, 'Patient no longer needs GIP');
    });

    await test.step('Verify GIP voided and RHC becomes active on LOC page', async () => {
     
      await pages.orderEntry.exitOrderEntry();
      await pages.orderEntry.navigateToLevelOfCare();

      // Verify RHC row shows "Active" status on the LOC page
      const rhcLocRow = sharedPage.locator('ion-row.table-values').filter({
        has: sharedPage.locator('span.capitalise', { hasText: 'Routine Home Care' }),
      });
      await expect(rhcLocRow.locator('span.capitalise', { hasText: 'Active' })).toBeVisible();
      console.log('GIP voided, RHC verified as Active on LOC page');
    });
  });
});
