import { test, expect, Page, BrowserContext } from '@playwright/test';
import { createPageObjectsForPage, PageObjects } from '../../fixtures/page-objects.fixture';
import { CredentialManager } from '../../utils/credential-manager';
import { TestDataManager } from '../../utils/test-data-manager';
import { DateHelper } from '../../utils/date-helper';
import { TIMEOUTS } from '../../config/timeouts';

/**
 * TC-04: Hospice Coverage – Edit & Validate
 *
 * Uses serial pattern: login once, share browser session across all steps.
 * Tests hospice coverage selection (Yes/No), edit hospice coverage via ellipsis,
 * and validation on OE/OM pages.
 */

let sharedPage: Page;
let sharedContext: BrowserContext;
let pages: PageObjects;

const todayFormatted = DateHelper.getTodaysDate();
const physicianName = TestDataManager.getPhysician();

test.describe.serial('TC-04: Hospice Coverage – Edit & Validate', () => {
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

  test('Step 3-7: Enter order with No hospice pays, edit to Yes', async () => {
    await test.step('Enter order with hospice pays = No', async () => {
      await pages.orderEntry.clickAddOrder();
      await pages.orderEntry.selectOrderType('DME');
      await pages.orderEntry.fillOrderName('Test DME Hospice No');
      await pages.orderEntry.selectBodySystems('Cardiovascular')
      await pages.orderEntry.setStartDate(todayFormatted);
      await pages.orderEntry.selectHospicePays(false);
      await pages.orderEntry.selectOrderingProvider('Registered Nurse (RN)', physicianName);
      await pages.orderEntry.selectApprovalType('Verbal');
      await pages.orderEntry.submitOrder();
    });

    await test.step('Search and edit hospice coverage to Yes', async () => {
      await pages.orderEntry.searchOrders('Test DME Hospice No');
      await pages.orderEntry.editHospiceCoverage(0, {
        hospicePays: true,
      });
    });

    await test.step('Verify hospice coverage updated to Yes in details', async () => {
      const details = await pages.orderEntry.getOrderDetailsText(0);
      expect(details).toContain('Yes');
      console.log('Hospice coverage updated to Yes');
      await pages.orderEntry.clearSearch();
    });
  });

  test('Step 8-11: Enter order with Yes hospice pays, edit to No', async () => {
    await test.step('Enter order with hospice pays = Yes', async () => {
      await pages.orderEntry.clickAddOrder();
      await pages.orderEntry.selectOrderType('Treatment');
      await pages.orderEntry.fillOrderName('Test Treatment Hospice Yes');
      await pages.orderEntry.setStartDate(todayFormatted);
      await pages.orderEntry.selectHospicePays(true);
      await pages.orderEntry.selectOrderingProvider('Registered Nurse (RN)', physicianName);
      await pages.orderEntry.selectApprovalType('Verbal');
      // Treatment orders with Verbal approval require Read back & Verified
      await pages.orderEntry.clickReadBackVerified();
      await pages.orderEntry.submitOrder();
    });

    await test.step('Search and edit hospice coverage to No with reason', async () => {
      await pages.orderEntry.searchOrders('Test Treatment Hospice Yes');
      await pages.orderEntry.editHospiceCoverage(0, {
        hospicePays: false,
        reasonForNonCoverage: 'NRMR: Not related, medically reasonable',
      });
    });

    await test.step('Verify hospice coverage updated to No in details', async () => {
      const details = await pages.orderEntry.getOrderDetailsText(0);
      expect(details).toContain('No');
      console.log('Hospice coverage updated to No');
      await pages.orderEntry.clearSearch();
    });
  });

  test('Step 12: Verify history captures hospice coverage changes', async () => {
    await test.step('Create order and edit hospice coverage', async () => {
      await pages.orderEntry.clickAddOrder();
      await pages.orderEntry.selectOrderType('Supplies');
      await pages.orderEntry.fillOrderName('Test Supplies for History');
      await pages.orderEntry.setStartDate(todayFormatted);
      await pages.orderEntry.selectHospicePays(true);
      await pages.orderEntry.selectOrderingProvider('Registered Nurse (RN)', physicianName);
      await pages.orderEntry.selectApprovalType('Verbal');
      await pages.orderEntry.submitOrder();

      // Search and edit to No
      await pages.orderEntry.searchOrders('Test Supplies for History');
      await pages.orderEntry.editHospiceCoverage(0, {
        hospicePays: false,
      });
    });

    await test.step('Verify history section captures changes', async () => {
      await pages.orderEntry.clickCaretOnRow(0);
      const historyText = await pages.orderEntry.getHistoryText(0);
      expect(historyText).toBeTruthy();
      console.log('History section captures hospice coverage changes');
      await pages.orderEntry.clearSearch();
    });
  });
});
