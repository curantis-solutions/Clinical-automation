import { test, expect, Page, BrowserContext } from '@playwright/test';
import { createPageObjectsForPage, PageObjects } from '../../fixtures/page-objects.fixture';
import { CredentialManager } from '../../utils/credential-manager';
import { TestDataManager } from '../../utils/test-data-manager';
import { DateHelper } from '../../utils/date-helper';
import { NonMedicationOrderData, NonMedicationOrderType } from '../../types/order.types';
import { testData } from '@config/test-data';


/**
 * TC-03: Document Upload – Written & Verbal Orders
 *
 * Tests document upload for both written and verbal orders,
 * document indicator verification, and history tracking.
 */
test.describe('TC-03: Document Upload – Written & Verbal Orders', () => {
let sharedPage: Page;
let sharedContext: BrowserContext;
let pages: PageObjects;

const todayFormatted = DateHelper.getTodaysDate();
const physicianName = testData.prod.cch.physician; 
test.describe.serial('TC-03:  Document Upload – Written & Verbal Orders', () => {
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
  test('Step 2-3: Enter written order with document upload', async () => {
    await test.step('Enter order with written approval and upload document', async () => {
      await pages.orderEntry.clickAddOrder();
      await pages.orderEntry.selectOrderType('DME');
      await pages.orderEntry.fillOrderName('Test DME Written Order');
      await pages.orderEntry.selectBodySystems('Cardiovascular')
      await pages.orderEntry.setStartDate(todayFormatted);
      await pages.orderEntry.selectOrderingProvider('Registered Nurse (RN)', physicianName);
      await pages.orderEntry.selectHospicePays(true);
      await pages.orderEntry.selectApprovalType('Written');

      // Upload document (use a test fixture file)
      await pages.orderEntry.uploadDocument(['C:\\Users\\Sri\\Claude-QA-Automation\\claude-qa-automation\\docs\\uploadsign.docx']);
      await pages.orderEntry.submitOrder();
    });

    await test.step('Verify document indicator and signed status YES', async () => {
      
      const signedStatus = await pages.orderEntry.getSignedStatus(0);
      expect(signedStatus).toContain('Yes');
      console.log('Written order with document: Signed status = Yes');
    });
  });

  test('Step 4-5: Enter verbal order and upload signed order via ellipsis', async () => {
    await test.step('Enter verbal order', async () => {
      await pages.orderEntry.clickAddOrder();
      await pages.orderEntry.selectOrderType('Other');
      await pages.orderEntry.fillOrderName('Test Other Verbal Order');
      await pages.orderEntry.setStartDate(todayFormatted);
      await pages.orderEntry.selectOrderingProvider('Registered Nurse (RN)', physicianName);
      await pages.orderEntry.selectHospicePays(true);
      await pages.orderEntry.selectApprovalType('Verbal');
      await pages.orderEntry.clickReadBackVerified();
      await pages.orderEntry.submitOrder();
    });

    await test.step('Upload signed order via ellipsis menu', async () => {
      await pages.orderEntry.clickEllipsisOnRow(0);
      await pages.orderEntry.uploadSignedOrder(['C:\\Users\\Sri\\Claude-QA-Automation\\claude-qa-automation\\docs\\uploadsign.docx']);
    });

    await test.step('Verify signed status changed to YES', async () => {
      const signedStatus = await pages.orderEntry.getSignedStatus(0);
      expect(signedStatus).toContain('Yes');
      console.log('Verbal order after upload: Signed status = Yes');
    });
  });

  test('Step 9: Verify history section shows document uploaded', async () => {
    // await test.step('Create order and upload document', async () => {
    //   await pages.orderEntry.clickAddOrder();
    //   await pages.orderEntry.selectOrderType('Treatment');
    //   await pages.orderEntry.fillOrderName('Test Treatment for History');
    //   await pages.orderEntry.setStartDate(todayFormatted);
    //    await pages.orderEntry.selectHospicePays(true);
    //   await pages.orderEntry.selectOrderingProvider('Registered Nurse (RN)', physicianName);
    //   await pages.orderEntry.selectApprovalType('Verbal');
    //   await pages.orderEntry.submitOrder();

    //   await pages.orderEntry.clickEllipsisOnRow(0);
    //   await pages.orderEntry.uploadSignedOrder(['test-data/test-document.pdf']);
    // });

    await test.step('Verify history shows document uploaded', async () => {
      await pages.orderEntry.clickCaretOnRow(0);
      const historyText = await pages.orderEntry.getHistoryText(0);
      expect(historyText).toContain('Document uploaded');
      console.log('History section confirmed: Document uploaded');
    });
  });
});
});
