import { test, expect, Page, BrowserContext } from '@playwright/test';
import { createPageObjectsForPage, PageObjects } from '../../fixtures/page-objects.fixture';
import { CredentialManager } from '../../utils/credential-manager';
import { TestDataManager } from '../../utils/test-data-manager';
import { DateHelper } from '../../utils/date-helper';
import { VisitFrequencyOrderData } from '../../types/order.types';
import { TIMEOUTS } from '../../config/timeouts';

/**
 * TC-16: Visit Frequency – Service Declined & Care Plan Verification
 *
 * Uses serial pattern: login once, share browser session across all steps.
 * Creates VF orders (active and service declined), verifies on OE grid,
 * then navigates to Care Plan to verify data under Visit Frequency section.
 *
 * Flow:
 *   Step 1:   Create active VF order (Social Worker)
 *   Step 2:   Verify active VF order on OE grid
 *   Step 3:   Navigate to Care Plan → verify Active Orders tab shows the VF order
 *   Step 4:   Go back to OE → create VF order with Service Declined
 *   Step 5:   Verify Service Declined on OE grid (Ordered By column)
 *   Step 6:   Navigate to Care Plan → verify Declined Orders tab shows the declined VF
 *   Step 7:   Create another VF order (Hospice Aide) → discontinue with Service Declined
 *   Step 8:   Navigate to Care Plan → verify Active tab still has original, Declined tab updated
 */

let sharedPage: Page;
let sharedContext: BrowserContext;
let pages: PageObjects;

const todayFormatted = DateHelper.getTodaysDate();
const physicianName = TestDataManager.getPhysician();

test.describe.serial('TC-16: Visit Frequency – Service Declined & Care Plan Verification', () => {
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
  // Step 1: Create active VF order (Social Worker)
  // =========================================================================
  test('Step 1: Create active VF order (Social Worker)', async () => {
    test.setTimeout(120000);

    await test.step('Enter VF order for Social Worker', async () => {
      const vfData: VisitFrequencyOrderData = {
        discipline: 'Social Worker',
        numberOfVisits: 2,
        timeInterval: 'Week',
        duration: '1',
        startDate: todayFormatted,
        orderingProvider: physicianName,
        role: 'Registered Nurse (RN)',
        approvalType: 'Verbal',
      };
      await pages.orderEntry.addVisitFrequencyOrder(vfData);
      console.log('Active VF order (Social Worker) created');
    });
  });

  // =========================================================================
  // Step 2: Verify active VF order on OE grid
  // =========================================================================
  test('Step 2: Verify active VF order on OE grid', async () => {
    test.setTimeout(120000);

    await test.step('Verify order exists on grid', async () => {
      const rowCount = await pages.orderEntry.getOrderRowCount();
      expect(rowCount).toBeGreaterThan(0);

      const orderRow = sharedPage.locator('[data-cy="order"]').filter({ hasText: 'Social Worker' }).first();
      await expect(orderRow).toBeVisible({ timeout: 5000 });
      console.log('Social Worker VF order visible on OE grid');
    });
  });

  // =========================================================================
  // Step 3: Navigate to Care Plan → verify Active Orders tab
  // =========================================================================
  test('Step 3: Verify VF order on Care Plan Active Orders tab', async () => {
    test.setTimeout(120000);

    await test.step('Exit Order Entry and navigate to Care Plan', async () => {
      await pages.orderEntry.exitOrderEntry();
      await pages.carePlan.navigateToCarePlan();
      console.log('Navigated to Care Plan');
    });

    await test.step('Verify Visit Frequency Active Orders tab', async () => {
      const vfVisible = await pages.carePlan.isVisitFrequencyCardVisible();
      expect(vfVisible).toBeTruthy();
      console.log('Visit Frequency card is visible');

      // Click Active Orders tab
      await pages.carePlan.clickActiveOrdersTab();

      // Verify Social Worker discipline appears
      const hasSocialWorker = await pages.carePlan.verifyDisciplineInVisitFrequency('Social Worker');
      expect(hasSocialWorker).toBeTruthy();
      console.log('Social Worker VF order found in Active Orders tab');
    });
  });

  // =========================================================================
  // Step 4: Go back to OE → create VF order with Service Declined
  // =========================================================================
  test('Step 4: Create VF order with Service Declined', async () => {
    test.setTimeout(120000);

    await test.step('Navigate back to Order Entry', async () => {
      await pages.orderEntry.navigateToOrderEntry();
      console.log('Back on Order Entry page');
    });

    await test.step('Create VF order with Service Declined', async () => {
      await pages.orderEntry.clickAddOrder();
      await pages.orderEntry.selectOrderType('Visit Frequency');
      await pages.orderEntry.selectDiscipline('Spiritual Advisor');
      await pages.orderEntry.enableServiceDeclined();
      await pages.orderEntry.fillServiceDeclinedDetails(todayFormatted, 'Patient refused');
      await pages.orderEntry.setStartDate(todayFormatted);
      await pages.orderEntry.clickProceed();
      console.log('VF order with Service Declined (Spiritual Advisor) created');
    });
  });

  // =========================================================================
  // Step 5: Verify Service Declined on OE grid
  // =========================================================================
  test('Step 5: Verify Service Declined on OE grid', async () => {
    test.setTimeout(120000);

    await test.step('Verify Service Declined in Ordered By column', async () => {
      const orderRow = sharedPage.locator('[data-cy="order"]').filter({ hasText: 'Spiritual' }).first();
      await expect(orderRow).toBeVisible({ timeout: 5000 });
      await expect(orderRow).toContainText('Service Declined');
      console.log('Service Declined displayed on OE grid');
    });
  });

  // =========================================================================
  // Step 6: Navigate to Care Plan → verify Declined Orders tab
  // =========================================================================
  test('Step 6: Verify declined VF on Care Plan Declined Orders tab', async () => {
    test.setTimeout(120000);

    await test.step('Exit Order Entry and navigate to Care Plan', async () => {
      await pages.orderEntry.exitOrderEntry();
      await pages.carePlan.navigateToCarePlan();
      console.log('Navigated to Care Plan');
    });

    await test.step('Click Declined Orders tab and verify', async () => {
      await pages.carePlan.clickDeclinedOrdersTab();

      // Verify Spiritual Advisory appears in Declined tab
      const hasSpiritual = await pages.carePlan.verifyDisciplineInVisitFrequency('Spiritual');
      expect(hasSpiritual).toBeTruthy();
      console.log('Spiritual Advisory VF order found in Declined Orders tab');
    });

    await test.step('Verify Active Orders tab still has Social Worker', async () => {
      await pages.carePlan.clickActiveOrdersTab();

      const hasSocialWorker = await pages.carePlan.verifyDisciplineInVisitFrequency('Social Worker');
      expect(hasSocialWorker).toBeTruthy();
      console.log('Social Worker still in Active Orders tab');
    });
  });

  // =========================================================================
  // Step 7: Create another VF order then discontinue with Service Declined
  // =========================================================================
  test('Step 7: Create VF order and discontinue with Service Declined', async () => {
    test.setTimeout(120000);

    await test.step('Navigate to Order Entry and create VF order', async () => {
      await pages.orderEntry.navigateToOrderEntry();

      const vfData: VisitFrequencyOrderData = {
        discipline: 'Hospice Aide',
        numberOfVisits: 2,
        timeInterval: 'Week',
        duration: '2',
        startDate: todayFormatted,
        orderingProvider: physicianName,
        role: 'Registered Nurse (RN)',
        approvalType: 'Verbal',
      };
      await pages.orderEntry.addVisitFrequencyOrder(vfData);
      console.log('Hospice Aide VF order created');
    });

    await test.step('Discontinue with Service Declined', async () => {
      await pages.orderEntry.searchOrders('Hospice Aide');
      await pages.orderEntry.discontinueOrder(0, {
        discontinueDate: todayFormatted,
        discontinueProviderName: physicianName,
        discontinueReason: 'Service no longer needed',
        approvalType: 'Verbal',
        isServiceDeclined: true,
      });
      console.log('Hospice Aide VF order discontinued with Service Declined');
      await pages.orderEntry.clearSearch();
    });
  });

  // =========================================================================
  // Step 8: Navigate to Care Plan → verify both tabs updated
  // =========================================================================
  test('Step 8: Verify Care Plan reflects all VF orders', async () => {
    test.setTimeout(120000);

    await test.step('Exit Order Entry and navigate to Care Plan', async () => {
      await pages.orderEntry.exitOrderEntry();
      await pages.carePlan.navigateToCarePlan();
      console.log('Navigated to Care Plan');
    });

    await test.step('Verify Active Orders tab', async () => {
      await pages.carePlan.clickActiveOrdersTab();
      const hasSocialWorker = await pages.carePlan.verifyDisciplineInVisitFrequency('Social Worker');
      expect(hasSocialWorker).toBeTruthy();
      console.log('Active Orders tab verified');
    });

    await test.step('Verify Declined Orders tab has declined entries', async () => {
      await pages.carePlan.clickDeclinedOrdersTab();
      const cardText = await pages.carePlan.getVisitFrequencyCardText();
      const hasDeclinedContent = cardText.toLowerCase().includes('spiritual') ||
                                  cardText.toLowerCase().includes('hospice aide') ||
                                  cardText.toLowerCase().includes('declined');
      expect(hasDeclinedContent).toBeTruthy();
      console.log('Declined Orders tab verified with declined VF entries');
    });
  });
});
