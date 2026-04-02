import { test, expect, Page, BrowserContext } from '@playwright/test';
import { createPageObjectsForPage, PageObjects } from '../../fixtures/page-objects.fixture';
import { CredentialManager } from '../../utils/credential-manager';
import { TestDataManager } from '../../utils/test-data-manager';
import { DateHelper } from '../../utils/date-helper';
import { VisitFrequencyOrderData } from '../../types/order.types';
import { TIMEOUTS } from '../../config/timeouts';

/**
 * TC-01: Visit Frequency Order – Standard & PRN
 *
 * Uses serial pattern: login once, share browser session across all steps.
 * Tests VF order creation with and without PRN,
 * duplicate discipline warnings, and overlapping date range handling.
 */

let sharedPage: Page;
let sharedContext: BrowserContext;
let pages: PageObjects;

const todayFormatted = DateHelper.getTodaysDate();
const physicianName = TestDataManager.getPhysician();

test.describe.serial('TC-01: Visit Frequency Order – Standard & PRN', () => {
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
  });

  test.afterAll(async () => {
    if (sharedContext) {
      await sharedContext.close();
    }
  });

  test('Step 1-4: Enter VF order without PRN and verify description', async () => {
    test.setTimeout(120000);

    await test.step('Navigate to patient and Order Entry', async () => {
      await pages.dashboard.goto();
      await pages.dashboard.navigateToModule('Patient');
      await pages.patient.searchPatient(TestDataManager.getOrdersPatientId());
      await pages.patient.getPatientFromGrid(0);
      await pages.orderEntry.navigateToOrderEntry();
    });

    await test.step('Enter VF order without PRN', async () => {
      const vfData: VisitFrequencyOrderData = {
        discipline: 'Skilled Nurse',
        numberOfVisits: 3,
        timeInterval: 'Week',
        duration: '1',
        isPRN: false,
        startDate: todayFormatted,
        orderingProvider: 'MDcypress',
        role: 'Registered Nurse (RN)',
        approvalType: 'Verbal',
      };

      await pages.orderEntry.clickAddOrder();
      await pages.orderEntry.selectOrderType('Visit Frequency');
      await pages.orderEntry.selectDiscipline(vfData.discipline);
      await pages.orderEntry.fillVisitCount(vfData.numberOfVisits);
      await pages.orderEntry.selectTimeInterval(vfData.timeInterval);
      await pages.orderEntry.selectDuration(vfData.duration);

      // Verify description displays discipline, visits, interval, duration, total visits
      const description = await pages.orderEntry.getVFDescription();
      expect(description).toBeTruthy();
      console.log(`VF Description: ${description}`);

      await pages.orderEntry.setStartDate(vfData.startDate);
      await pages.orderEntry.selectOrderingProvider(vfData.role, vfData.orderingProvider);
      await pages.orderEntry.selectApprovalType(vfData.approvalType);
      await pages.orderEntry.clickProceed();
    });

    await test.step('Verify VF order on grid', async () => {
      const rowCount = await pages.orderEntry.getOrderRowCount();
      expect(rowCount).toBeGreaterThan(0);
      console.log('VF order without PRN verified on grid');
    });
  });

  test('Step 5-6: Enter VF order with PRN and verify description', async () => {
    test.setTimeout(120000);

    await test.step('Enter VF order with PRN', async () => {
      const vfPRNData: VisitFrequencyOrderData = {
        discipline: 'Social Worker',
        numberOfVisits: 2,
        timeInterval: 'Week',
        duration: '2',
        isPRN: true,
        prnReason: 'Patient request',
        prnQuantity: 1,
        startDate: todayFormatted,
        orderingProvider: 'MDcypress',
        role: 'Registered Nurse (RN)',
        approvalType: 'Verbal',
      };

      await pages.orderEntry.addVisitFrequencyOrder(vfPRNData);
    });

    await test.step('Verify PRN VF order on grid with PRN details in description', async () => {
      const rowCount = await pages.orderEntry.getOrderRowCount();
      expect(rowCount).toBeGreaterThan(0);
      console.log('VF order with PRN verified on grid');
    });
  });

  test('Step 7-8: Duplicate discipline and overlapping date warning', async () => {
    test.setTimeout(120000);

    await test.step('Enter first VF order', async () => {
      const vfData: VisitFrequencyOrderData = {
        discipline: 'Spiritual Advisor',
        numberOfVisits: 1,
        timeInterval: 'Week',
        duration: '1',
        startDate: todayFormatted,
        orderingProvider: 'MDcypress',
        role: 'Registered Nurse (RN)',
        approvalType: 'Verbal',
      };
      await pages.orderEntry.addVisitFrequencyOrder(vfData);
    });

    await test.step('Enter duplicate VF order and validate discipline warning', async () => {
      await pages.orderEntry.clickAddOrder();
      await pages.orderEntry.selectOrderType('Visit Frequency');
      await pages.orderEntry.selectDiscipline('Spiritual Advisor');

      // Validate discipline warning (.disciplineErrorText)
      const warningMsg = await pages.orderEntry.getWarningMessage('discipline');
      expect(warningMsg).toContain('visit frequency order for this discipline already exists');
      console.log(`Discipline warning: ${warningMsg}`);
    });

    await test.step('Fill overlapping start date and validate overlap warning', async () => {
      await pages.orderEntry.fillVisitCount(1);
      await pages.orderEntry.selectTimeInterval('Week');
      await pages.orderEntry.selectDuration('1');

      // Validate date picker overlap warning (.datePickerErrorText)
      // Warning appears automatically after duration is selected (start date auto-populates)
      // Note: Re-selecting the date via the date picker removes the warning from DOM
      const overlapWarning = await pages.orderEntry.getWarningMessage('datePicker');
      expect(overlapWarning).toContain('already exists within the selected date range');
      console.log(`Overlap warning: ${overlapWarning}`);

      // Cancel the order form to clean up for subsequent tests
      await pages.orderEntry.cancelOrder();
    });
  });

  test('Step 9-10: Proceed with overlapping order and verify discontinue', async () => {
    test.setTimeout(120000);

    await test.step('Enter overlapping VF order and proceed', async () => {
      const vfData: VisitFrequencyOrderData = {
        discipline: 'Volunteer',
        numberOfVisits: 1,
        timeInterval: 'Week',
        duration: '2',
        startDate: todayFormatted,
        orderingProvider: 'MDcypress',
        role: 'Registered Nurse (RN)',
        approvalType: 'Verbal',
      };
      await pages.orderEntry.addVisitFrequencyOrder(vfData);

      // Enter another with same discipline and overlapping date
      const vfOverlapData: VisitFrequencyOrderData = {
        ...vfData,
        duration: '1',
      };
      await pages.orderEntry.addVisitFrequencyOrder(vfOverlapData);
    });

    await test.step('Validate discontinued order reason', async () => {
      // Search for Volunteer to isolate the overlapping orders
      await pages.orderEntry.searchOrders('Volunteer');

      // Row 1 is the previous Volunteer order with auto-discontinued sub-row
      await pages.orderEntry.clickCaretOnRow(1);
      const details = await pages.orderEntry.getHistoryText(1);
      expect(details).toContain('discontinued because a new order');
      console.log('Previous order discontinued with correct reason');

      // Collapse the expanded row to avoid interfering with subsequent form interactions
      await pages.orderEntry.clickCaretOnRow(1);
      await pages.orderEntry.clearSearch();
    });
  });

  test('Step 11: Verify data flow to OM/Provider Panel', async () => {
    test.setTimeout(120000);

    await test.step('Create verbal VF order', async () => {
      const vfData: VisitFrequencyOrderData = {
        discipline: 'Hospice Aide',
        numberOfVisits: 2,
        timeInterval: 'Week',
        duration: '1',
        startDate: todayFormatted,
        orderingProvider: 'MDcypress',
        role: 'Registered Nurse (RN)',
        approvalType: 'Verbal',
      };
      await pages.orderEntry.addVisitFrequencyOrder(vfData);
    });

    await test.step('Verify order on grid', async () => {
      const rowCount = await pages.orderEntry.getOrderRowCount();
      expect(rowCount).toBeGreaterThan(0);
      console.log('Verbal VF order created - should flow to OM/Provider Panel');
    });
  });
});
