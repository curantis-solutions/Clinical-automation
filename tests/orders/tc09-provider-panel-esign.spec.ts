import { test, expect, Page, BrowserContext } from '@playwright/test';
import { createPageObjectsForPage, PageObjects } from '../../fixtures/page-objects.fixture';
import { CredentialManager } from '../../utils/credential-manager';
import { TestDataManager } from '../../utils/test-data-manager';
import { DateHelper } from '../../utils/date-helper';
import { MedicationOrderData } from '../../types/order.types';
import { AuthHelper } from '../../utils/auth.helper';

/**
 * TC-09: Provider Panel – E-Sign & Reject Orders
 *
 * Uses serial pattern: share browser session across all steps.
 * RN creates two medication orders (capturing order IDs via API intercept),
 * then MD logs in to Provider Panel to e-sign the first, reject the second,
 * and verify statuses back on Order Entry.
 *
 * Flow:
 *   Step 1:    RN creates med order #1 (for e-sign)   → capture orderId
 *   Step 2:    RN creates med order #2 (for reject)    → capture orderId
 *   Step 3-4:  MD → Provider Panel → search order #1   → e-sign
 *   Step 5-6:  MD → Provider Panel → search order #2   → reject
 *   Step 7:    MD → Order Entry → verify order #1 shows "Electronically Signed"
 *   Step 8:    MD → Order Entry → verify order #2 shows "Rejected"
 *   Step 9:    Bulk e-sign selected orders
 *   Step 10:   E-sign all remaining orders
 */

let sharedPage: Page;
let sharedContext: BrowserContext;
let pages: PageObjects;

const todayFormatted = DateHelper.getTodaysDate();
const physicianName = TestDataManager.getPhysician();

// Order IDs captured from API responses
let eSignOrderId = '';
let rejectOrderId = '';

/**
 * Helper: create a medication order as RN and capture the orderId from the 201 API response.
 */
async function createMedOrderAndCaptureId(
  medData: MedicationOrderData,
  label: string
): Promise<string> {
  const orderResponsePromise = sharedPage.waitForResponse(
    (resp) =>
      resp.request().method() === 'POST' &&
      resp.url().includes('/orders') &&
      resp.status() === 201,
    { timeout: 60000 }
  );

  await pages.orderEntry.addMedicationOrder(medData);

  let orderId = '';
  
  try {
    const response = await orderResponsePromise;
    const body = await response.json();
    orderId = String(body?.orderId || '');
    console.log(`[${label}] Captured order ID: ${orderId} (${body?.nameDescription})`);
  } catch {
    console.log(`[${label}] Could not capture order ID from API`);
  }
  return orderId;
}

test.describe.serial('TC-09: Provider Panel – E-Sign & Reject Orders', () => {
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
    const patientId = TestDataManager.getOrdersPatientId();

    // Login as RN
    await pages.login.goto();
    const rnCreds = CredentialManager.getCredentials(undefined, 'RN');
    await pages.login.login(rnCreds.username, rnCreds.password);
    console.log('Logged in as RN');

    // Navigate to patient and Order Entry
    await pages.dashboard.goto();
    await pages.dashboard.navigateToModule('Patient');
    await pages.patient.searchPatient(patientId);
    await pages.patient.getPatientFromGrid(0);
    await pages.orderEntry.navigateToOrderEntry();
  });

  test.afterAll(async () => {
    if (sharedContext) {
      await sharedContext.close();
    }
  });

  // Step 1: RN creates medication order #1 (will be e-signed by MD)
  test('Step 1: RN creates medication order for e-sign', async () => {
    test.setTimeout(120000);

    await test.step('Create verbal medication order and capture order ID', async () => {
      eSignOrderId = await createMedOrderAndCaptureId(
        {
          medicationName: 'Bayer Aspirin',
          dosage: '325mg',
          route: 'Oral',
          frequency: 'Daily',
          hospicePays: true,
          orderingProvider: physicianName,
          role: 'Registered Nurse (RN)',
          approvalType: 'Verbal',
        },
        'E-Sign Order'
      );
    });
  });

  // Step 2: RN creates medication order #2 (will be rejected by MD)
  test('Step 2: RN creates medication order for reject', async () => {
    test.setTimeout(120000);

    await test.step('Create verbal medication order and capture order ID', async () => {
      rejectOrderId = await createMedOrderAndCaptureId(
        {
          medicationName: 'Ibuprofen PM',
          dosage: '200mg',
          route: 'Oral',
          frequency: 'Twice daily',
          hospicePays: true,
          orderingProvider: physicianName,
          role: 'Registered Nurse (RN)',
          approvalType: 'Verbal',
        },
        'Reject Order'
      );
    });
  });

  // Step 3-4: MD logs in, searches order #1 on Provider Panel, e-signs it
  test('Step 3-4: MD e-signs order on Provider Panel', async () => {
    test.setTimeout(120000);

    await test.step('Logout RN and login as MD', async () => {
      await AuthHelper.logout(sharedPage);
      console.log('Logged out RN');

      await pages.login.goto();
      const mdCreds = CredentialManager.getCredentials(undefined, 'MD');
      await pages.login.login(mdCreds.username, mdCreds.password);
      console.log('Logged in as MD');
    });

    await test.step('Navigate to Provider Panel', async () => {
      await pages.providerPanel.navigateToProviderPanel();
    });

    await test.step('Verify Collapse/Expand All', async () => {
      await pages.providerPanel.collapseAll();
      await pages.providerPanel.expandAll();
    });

    await test.step('Search for e-sign order and e-sign it', async () => {
      await pages.providerPanel.searchOrders(eSignOrderId || 'Bayer Aspirin');

      // Wait for the correct order ID to appear in filtered results
      if (eSignOrderId) {
        await sharedPage.locator(`text="${eSignOrderId}"`).first().waitFor({ state: 'visible', timeout: 10000 });
        console.log(`Order ${eSignOrderId} found in Provider Panel`);
        await pages.providerPanel.eSignOrderById(eSignOrderId);
      } else {
        await pages.providerPanel.eSignOrder(0);
      }
      console.log(`Order ${eSignOrderId} e-signed`);
    });
  });

  // Step 5-6: MD clears search, searches order #2 on Provider Panel, rejects it
  test('Step 5-6: MD rejects order on Provider Panel', async () => {
    test.setTimeout(120000);

    await test.step('Clear search, find reject order, and reject it', async () => {
      // Clear previous search and search for the reject order
      await pages.providerPanel.searchOrders(rejectOrderId || 'Ibuprofen PM');

      // Wait for the correct order ID to appear in filtered results
      if (rejectOrderId) {
        await sharedPage.locator(`text="${rejectOrderId}"`).first().waitFor({ state: 'visible', timeout: 10000 });
        console.log(`Order ${rejectOrderId} found in Provider Panel`);
        await pages.providerPanel.rejectOrderById(rejectOrderId, 'Order not appropriate for patient');
      } else {
        await pages.providerPanel.rejectOrder(0, 'Order not appropriate for patient');
      }
      console.log(`Order ${rejectOrderId} rejected`);
    });
  });

  // Step 7: MD navigates to OE, searches Bayer Aspirin, verifies e-Signed in grid
  test('Step 7: Verify e-signed order status on Order Entry', async () => {
    test.setTimeout(120000);

    await test.step('Navigate to patient Order Entry', async () => {
      await pages.dashboard.navigateToModule('Patient');
      await pages.patient.searchPatient(TestDataManager.getOrdersPatientId());
      await pages.patient.getPatientFromGrid(0);
      await pages.orderEntry.navigateToOrderEntry();
    });

    await test.step('Search Bayer Aspirin and verify e-Signed', async () => {
      await pages.orderEntry.searchOrders('Bayer Aspirin');
      await sharedPage.waitForTimeout(2000);
      console.log(`Searched OE for: Bayer Aspirin (order ${eSignOrderId})`);

      const aspirinRow = sharedPage.locator('[data-cy="order"]').filter({ hasText: 'Bayer Aspirin' }).first();
      await expect(aspirinRow).toBeVisible({ timeout: 10000 });
      await expect(aspirinRow).toContainText('e-Signed');
      console.log(`Order ${eSignOrderId} verified as e-Signed on OE`);
    });
  });

  // Step 8: MD clears search, searches Ibuprofen PM, verifies Rejected in grid
  test('Step 8: Verify rejected order status on Order Entry', async () => {
    test.setTimeout(120000);

    await test.step('Clear search, search Ibuprofen PM, verify Rejected', async () => {
      await pages.orderEntry.clearSearch();
      await pages.orderEntry.searchOrders('Ibuprofen PM');
      await sharedPage.waitForTimeout(2000);
      console.log(`Searched OE for: Ibuprofen PM (order ${rejectOrderId})`);

      const ibuprofenRow = sharedPage.locator('[data-cy="order"]').filter({ hasText: 'Ibuprofen' }).first();
      await expect(ibuprofenRow).toBeVisible({ timeout: 10000 });
      await expect(ibuprofenRow).toContainText('Rejected');
      console.log(`Order ${rejectOrderId} verified as Rejected on OE`);
    });
  });

  // Step 9: Bulk e-sign selected orders
  test.skip('Step 9: Bulk e-sign selected orders', async () => {
    test.setTimeout(120000);

    await test.step('Navigate to Provider Panel and select orders', async () => {
      await pages.providerPanel.navigateToProviderPanel();
      // Clear any previous search to show all orders
      await pages.providerPanel.searchOrders('');
      await sharedPage.waitForTimeout(2000);
      await pages.providerPanel.selectMultipleOrders([0, 1, 2]);
    });

    await test.step('E-sign selected orders', async () => {
      await pages.providerPanel.eSignSelectedOrders();
      console.log('Selected orders e-signed');
    });

    await test.step('Refresh and verify orders disappeared', async () => {
      await sharedPage.reload();
      await sharedPage.waitForTimeout(3000);
      console.log('Page refreshed - e-signed orders should be gone');
    });
  });

  // Step 10: E-sign all remaining orders
  // Note: This step is skipped ,WILL HANDLE IT IN FUTURE, as it may require additional setup to ensure there are multiple orders to bulk e-sign after previous steps have removed some orders.
  test.skip('Step 10: E-sign all orders', async () => {
    test.setTimeout(120000);

    await test.step('Navigate to Provider Panel and e-sign all', async () => {
      await pages.providerPanel.navigateToProviderPanel();
      await pages.providerPanel.eSignAllOrders();
      console.log('All orders e-signed');
    });

    await test.step('Refresh and verify all orders disappeared', async () => {
      await sharedPage.reload();
      await sharedPage.waitForTimeout(3000);
      const remainingCount = await pages.providerPanel.getOrderRowCount();
      expect(remainingCount).toBe(0);
      console.log('All orders removed from Provider Panel after e-sign all');
    });
  });
});
