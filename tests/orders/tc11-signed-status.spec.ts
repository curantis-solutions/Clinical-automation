import { test, expect, Page, BrowserContext } from '@playwright/test';
import { createPageObjectsForPage, PageObjects } from '../../fixtures/page-objects.fixture';
import { CredentialManager } from '../../utils/credential-manager';
import { TestDataManager } from '../../utils/test-data-manager';
import { DateHelper } from '../../utils/date-helper';
import { AuthHelper } from '../../utils/auth.helper';
import { TIMEOUTS } from '../../config/timeouts';

/**
 * TC-11: Signed Status – Verbal, Written & Provider Orders
 *
 * Uses serial pattern: login once, share browser session across all steps.
 * Tests that verbal orders show NO, written orders show YES,
 * provider-entered orders show e-signed, and rejected orders display correctly.
 *
 * Flow:
 *   Step 1-2: RN creates verbal order → signed status = "No"
 *   Step 3:   RN creates written order → signed status = "Yes"
 *   Step 4-5: MD logs in, creates order with attestation → signed status = "e-signed"
 *   Step 6:   MD verifies history shows "Electronically Signed"
 *   Step 7:   MD navigates to Provider Panel → rejects an order
 *   Step 8:   MD verifies rejected status on OE page
 */

let sharedPage: Page;
let sharedContext: BrowserContext;
let pages: PageObjects;

const todayFormatted = DateHelper.getTodaysDate();
const physicianName = TestDataManager.getPhysician();

test.describe.serial('TC-11: Signed Status – Verbal, Written & Provider Orders', () => {
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
  // Step 1-2: RN verbal order → signed status = "No"
  // =========================================================================
  test('Step 1-2: RN verbal order signed status = No', async () => {
    test.setTimeout(120000);

    await test.step('Create verbal DME order', async () => {
      await pages.orderEntry.addNonMedicationOrder({
        orderType: 'DME',
        name: 'Test DME Verbal Status No',
        startDate: todayFormatted,
        bodySystem: 'Cardiovascular',
        orderingProvider: physicianName,
        role: 'Registered Nurse (RN)',
        approvalType: 'Verbal',
        hospicePays: true,
      });
      console.log('Verbal DME order created');
    });

    await test.step('Verify signed status is No', async () => {
      await pages.orderEntry.searchOrders('Test DME Verbal Status No');
      const signedStatus = await pages.orderEntry.getSignedStatus(0);
      expect(signedStatus).toContain('No');
      console.log('Verbal order signed status: No');
      await pages.orderEntry.clearSearch();
    });
  });

  // =========================================================================
  // Step 3: RN written order → signed status = "Yes"
  // =========================================================================
  test('Step 3: RN written order signed status = Yes', async () => {
    test.setTimeout(120000);

      await test.step('Create written Other order', async () => {
      await pages.orderEntry.clickAddOrder();
      await pages.orderEntry.selectOrderType('Other');
      await pages.orderEntry.fillOrderName('Test Other Written Order status Yes');
      await pages.orderEntry.setStartDate(todayFormatted);
      await pages.orderEntry.selectOrderingProvider('Registered Nurse (RN)', physicianName);
      await pages.orderEntry.selectHospicePays(true);
      await pages.orderEntry.selectApprovalType('Written');

      // Upload document (use a test fixture file)
      await pages.orderEntry.uploadDocument(['C:\\Users\\Sri\\Claude-QA-Automation\\claude-qa-automation\\docs\\uploadsign.docx']);
      await pages.orderEntry.submitOrder();
      console.log('Written Other order created');
    });

    await test.step('Verify signed status is Yes', async () => {
      await pages.orderEntry.searchOrders('Test Other Written Order status Yes');
      const signedStatus = await pages.orderEntry.getSignedStatus(0);
      expect(signedStatus).toContain('Yes');
      console.log('Written order signed status: Yes');
      await pages.orderEntry.clearSearch();
    });
  });

  // =========================================================================
  // Step 4-5: MD creates order with attestation → signed status = "e-signed"
  // =========================================================================
  test('Step 4-5: Provider order signed status = e-signed', async () => {
    test.setTimeout(120000);

    await test.step('Logout RN and login as MD', async () => {
      await AuthHelper.logout(sharedPage);
      console.log('Logged out RN');

      await pages.login.goto();
      const mdCreds = CredentialManager.getCredentials(undefined, 'MD');
      await pages.login.login(mdCreds.username, mdCreds.password);
      console.log('Logged in as MD');
    });

    await test.step('Navigate to patient Order Entry', async () => {
      await pages.dashboard.goto();
      await pages.dashboard.navigateToModule('Patient');
      await pages.patient.searchPatient(TestDataManager.getOrdersPatientId());
      await pages.patient.getPatientFromGrid(0);
      await pages.orderEntry.navigateToOrderEntry();
    });

    await test.step('Create order as MD with attestation', async () => {
      await pages.orderEntry.clickAddOrder();
      await pages.orderEntry.selectOrderType('DME');
      await pages.orderEntry.fillOrderName('Test DME Provider Order');
      await pages.orderEntry.selectBodySystems('Cardiovascular')
      await pages.orderEntry.setStartDate(todayFormatted);
      await pages.orderEntry.selectHospicePays(true);

      // MD — attestation checkbox
      await pages.orderEntry.clickAttestationCheckbox();
      await pages.orderEntry.clickProceed();
      console.log('MD order with attestation created');
    });

    await test.step('Verify signed status is e-signed', async () => {
      await pages.orderEntry.searchOrders('Test DME Provider Order');
      const signedStatus = await pages.orderEntry.getSignedStatus(0);
      expect(signedStatus).toContain('e-signed');
      console.log('Provider order signed status: e-signed');
    });
  });

  // =========================================================================
  // Step 6: Verify history shows "Electronically Signed"
  // =========================================================================
  test('Step 6: Verify history shows Electronically Signed', async () => {
    test.setTimeout(120000);

    await test.step('Expand order details and check history', async () => {
      await pages.orderEntry.searchOrders('Test DME Provider Order');
      await pages.orderEntry.clickCaretOnRow(0);
      const historyText = await pages.orderEntry.getHistoryText(0);
      expect(historyText).toContain('Signed Electronically');
      console.log('History confirms: order signed electronically');
    });
  });
// skipping the below test as it is covered in tc09-provider-panel.spec.ts and to reduce test execution time.
  // =========================================================================
  // Step 7: MD navigates to Provider Panel and rejects an order
  // =========================================================================
  test.skip('Step 7: MD rejects order from Provider Panel', async () => {
    test.setTimeout(120000);

    await test.step('Navigate to Provider Panel', async () => {
      await pages.providerPanel.navigateToProviderPanel();
      console.log('Navigated to Provider Panel');
    });

    await test.step('Reject an order', async () => {
      await pages.providerPanel.rejectOrder(0, 'Not appropriate');
      console.log('Order rejected from Provider Panel');
    });
  });

  // =========================================================================
  // Step 8: Verify rejected status on OE page
  // =========================================================================
  test.skip('Step 8: Verify rejected status on Order Entry', async () => {
    test.setTimeout(120000);

    await test.step('Navigate to patient Order Entry', async () => {
      await pages.providerPanel.navigateToPatientOrderEntry(0);
    });

    await test.step('Verify signed status shows Rejected', async () => {
      const signedStatus = await pages.orderEntry.getSignedStatus(0);
      expect(signedStatus).toContain('Rejected');
      console.log('Rejected order signed status: Rejected');
    });
  });
});
