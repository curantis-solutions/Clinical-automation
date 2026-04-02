import { test, expect, Page, BrowserContext } from '@playwright/test';
import { createPageObjectsForPage, PageObjects } from '../../fixtures/page-objects.fixture';
import { CredentialManager } from '../../utils/credential-manager';
import { TestDataManager } from '../../utils/test-data-manager';
import { DateHelper } from '../../utils/date-helper';
import { TIMEOUTS } from '../../config/timeouts';

/**
 * TC-18: Visit Frequency – Other Discipline & Custom Entry
 *
 * Uses serial pattern: login once, share browser session across all steps.
 * Tests the "Other" discipline dropdown with predefined disciplines
 * and custom discipline entry, then verifies on Care Plan.
 *
 * Flow:
 *   Step 1:   Open VF form → validate all discipline options are available
 *   Step 2:   Select "Other" → verify additional discipline dropdown appears
 *   Step 3:   Create VF order with predefined Other discipline (Dietician)
 *   Step 4:   Verify Dietician order on OE grid
 *   Step 5:   Navigate to Care Plan → verify Dietician in Active Orders tab
 *   Step 6:   Back to OE → create VF order with custom discipline (Music Therapy)
 *   Step 7:   Verify Music Therapy order on OE grid
 *   Step 8:   Navigate to Care Plan → verify both Dietician and Music Therapy in Active Orders
 */

let sharedPage: Page;
let sharedContext: BrowserContext;
let pages: PageObjects;

const todayFormatted = DateHelper.getTodaysDate();
const physicianName = TestDataManager.getPhysician();

test.describe.serial('TC-18: Visit Frequency – Other Discipline & Custom Entry', () => {
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
  // Step 1: Validate all discipline options
  // =========================================================================
  test('Step 1: Validate disciplines in VF dropdown', async () => {
    test.setTimeout(120000);

    await test.step('Open VF form and validate disciplines', async () => {
      await pages.orderEntry.clickAddOrder();
      await pages.orderEntry.selectOrderType('Visit Frequency');

      // Click discipline dropdown to view options
      await sharedPage.locator('[data-cy="select-discipline"]').click();
      await sharedPage.waitForTimeout(1000);

      const disciplines = [
        'Bereavement', 'Hospice Aide', 'Skilled Nurse',
        'Social Worker', 'Spiritual Advisor', 'Volunteer', 'Other',
      ];
      for (const disc of disciplines) {
        const option = sharedPage.locator('[class*="ng-option"] span').filter({ hasText: disc });
        const count = await option.count();
        expect(count).toBeGreaterThan(0);
        console.log(`Discipline "${disc}" available`);
      }
    });
  });

  // =========================================================================
  // Step 2: Select "Other" → verify additional dropdown
  // =========================================================================
  test('Step 2: Select Other and verify additional dropdown', async () => {
    test.setTimeout(120000);

    await test.step('Select Other and verify other discipline dropdown', async () => {
      await sharedPage.locator('[class*="ng-option"] span')
        .filter({ hasText: 'Other' })
        .click();
      await sharedPage.waitForTimeout(1000);

      const otherDropdown = sharedPage.locator('[data-cy="select-discipline-other"]');
      await expect(otherDropdown).toBeVisible({ timeout: 5000 });
      console.log('Other discipline dropdown appeared');

      // Cancel this form — we'll create the order in the next step
      await pages.orderEntry.cancelOrder();
    });
  });

  // =========================================================================
  // Step 3: Create VF order with predefined Other discipline (Dietician)
  // =========================================================================
  test('Step 3: Create VF order with Dietitian discipline', async () => {
    test.setTimeout(120000);

    await test.step('Enter VF order with Dietitian', async () => {
      await pages.orderEntry.addVisitFrequencyOrder({
        discipline: 'Other',
        otherDiscipline: 'Dietitian',
        numberOfVisits: 1,
        timeInterval: 'Week',
        duration: '1',
        startDate: todayFormatted,
        orderingProvider: physicianName,
        role: 'Registered Nurse (RN)',
        approvalType: 'Verbal',
      });
      console.log('VF order with Dietitian created');
    });
  });

  // =========================================================================
  // Step 4: Verify Dietitian order on OE grid
  // =========================================================================
  test('Step 4: Verify Dietitian order on OE grid', async () => {
    test.setTimeout(120000);

    await test.step('Verify order on grid', async () => {
      const rowCount = await pages.orderEntry.getOrderRowCount();
      expect(rowCount).toBeGreaterThan(0);

      const dietitianRow = sharedPage.locator('[data-cy="order"]').filter({ hasText: 'Dietitian' }).first();
      await expect(dietitianRow).toBeVisible({ timeout: 5000 });
      console.log('Dietitian VF order visible on OE grid');
    });
  });

  // =========================================================================
  // Step 5: Navigate to Care Plan → verify Active Orders tab
  // =========================================================================
  test('Step 5: Verify Dietitian on Care Plan Active Orders', async () => {
    test.setTimeout(120000);

    await test.step('Exit Order Entry and navigate to Care Plan', async () => {
      await pages.orderEntry.exitOrderEntry();
      await pages.carePlan.navigateToCarePlan();
      console.log('Navigated to Care Plan');
    });

    await test.step('Verify Dietitian in Active Orders tab', async () => {
      const vfVisible = await pages.carePlan.isVisitFrequencyCardVisible();
      expect(vfVisible).toBeTruthy();

      await pages.carePlan.clickActiveOrdersTab();

      const hasDietitian = await pages.carePlan.verifyDisciplineInVisitFrequency('Dietitian');
      expect(hasDietitian).toBeTruthy();
      console.log('Dietitian VF order found in Active Orders tab');
    });
  });

  // =========================================================================
  // Step 6: Back to OE → create VF order with custom discipline (Music Therapy)
  // =========================================================================
  test('Step 6: Create VF order with custom Music Therapy discipline', async () => {
    test.setTimeout(120000);

    await test.step('Navigate back to Order Entry', async () => {
      await pages.orderEntry.navigateToOrderEntry();
      console.log('Back on Order Entry page');
    });

    await test.step('Enter VF order with custom discipline', async () => {
      await pages.orderEntry.addVisitFrequencyOrder({
        discipline: 'Other',
        otherDiscipline: 'Music Therapy',
        numberOfVisits: 1,
        timeInterval: 'Week',
        duration: '1',
        startDate: todayFormatted,
        orderingProvider: physicianName,
        role: 'Registered Nurse (RN)',
        approvalType: 'Verbal',
      });
      console.log('VF order with custom Music Therapy discipline created');
    });
  });

  // =========================================================================
  // Step 7: Verify Music Therapy order on OE grid
  // =========================================================================
  test('Step 7: Verify Music Therapy order on OE grid', async () => {
    test.setTimeout(120000);

    await test.step('Verify custom discipline on grid', async () => {
      const rowCount = await pages.orderEntry.getOrderRowCount();
      expect(rowCount).toBeGreaterThan(0);

      const musicRow = sharedPage.locator('[data-cy="order"]').filter({ hasText: 'Music Therapy' }).first();
      await expect(musicRow).toBeVisible({ timeout: 5000 });
      console.log('Music Therapy VF order visible on OE grid');
    });
  });

  // =========================================================================
  // Step 8: Navigate to Care Plan → verify both in Active Orders
  // =========================================================================
  test('Step 8: Verify both disciplines on Care Plan Active Orders', async () => {
    test.setTimeout(120000);

    await test.step('Exit Order Entry and navigate to Care Plan', async () => {
      await pages.orderEntry.exitOrderEntry();
      await pages.carePlan.navigateToCarePlan();
      console.log('Navigated to Care Plan');
    });

    await test.step('Verify both disciplines in Active Orders tab', async () => {
      await pages.carePlan.clickActiveOrdersTab();

      const hasDietitian = await pages.carePlan.verifyDisciplineInVisitFrequency('Dietitian');
      expect(hasDietitian).toBeTruthy();
      console.log('Dietitian found in Active Orders');

      const hasMusicTherapy = await pages.carePlan.verifyDisciplineInVisitFrequency('Music Therapy');
      expect(hasMusicTherapy).toBeTruthy();
      console.log('Music Therapy found in Active Orders');

      console.log('Both Other disciplines verified on Care Plan');
    });
  });
});
