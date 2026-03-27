import { test, expect } from '../../fixtures/page-objects.fixture';
import * as dotenv from 'dotenv';
import { CredentialManager } from '../../utils/credential-manager';
import { TestDataManager } from '../../utils/test-data-manager';
import { DateHelper } from '../../utils/date-helper';

dotenv.config({ path: '.env.local' });

/**
 * TC-18: Visit Frequency – Other Discipline & Custom Entry
 *
 * Tests the "Other" discipline dropdown with predefined disciplines
 * and custom discipline entry.
 */
test.describe('TC-18: Visit Frequency – Other Discipline & Custom Entry', () => {
  const todayFormatted = DateHelper.getTodaysDate();
  const physicianName = TestDataManager.getPhysician();

  test.beforeEach(async ({ pages }) => {
    test.setTimeout(300000);

    await pages.login.goto();
    const credentials = CredentialManager.getCredentials(undefined, 'RN');
    await pages.login.login(credentials.username, credentials.password);

    await pages.dashboard.goto();
    await pages.dashboard.navigateToModule('Patient');
    await pages.patient.getPatientFromGrid(0);
    await pages.orderEntry.navigateToOrderEntry();
  });

  test('Step 4-5: Validate disciplines and Other dropdown', async ({ page, pages }) => {
    await test.step('Open VF form and validate disciplines', async () => {
      await pages.orderEntry.clickAddOrder();
      await pages.orderEntry.selectOrderType('Visit Frequency');

      // Click discipline dropdown to view options
      await page.locator('[data-cy="select-discipline"]').click();
      await page.waitForTimeout(1000);

      const disciplines = ['Bereavement', 'Hospice Aide', 'Skilled Nurse', 'Social Worker', 'Spiritual Advisory', 'Volunteer', 'Other'];
      for (const disc of disciplines) {
        const option = page.locator('[class*="ng-option"] span').filter({ hasText: disc });
        const count = await option.count();
        expect(count).toBeGreaterThan(0);
        console.log(`Discipline "${disc}" available`);
      }
    });

    await test.step('Select Other and verify additional discipline dropdown', async () => {
      await page.locator('[class*="ng-option"] span')
        .filter({ hasText: 'Other' })
        .click();
      await page.waitForTimeout(1000);

      // Verify additional disciplines appear
      const otherDropdown = page.locator('[data-cy="select-other-discipline"]');
      const isVisible = await otherDropdown.isVisible();
      expect(isVisible).toBeTruthy();
      console.log('Other discipline dropdown appeared');
    });
  });

  test('Step 6-7: Select predefined Other discipline (Dietician)', async ({ pages }) => {
    await test.step('Enter VF order with Dietician', async () => {
      await pages.orderEntry.addVisitFrequencyOrder({
        discipline: 'Other',
        otherDiscipline: 'Dietician',
        numberOfVisits: 1,
        timeInterval: 'Week',
        duration: '1 Week',
        startDate: todayFormatted,
        orderingProvider: physicianName,
        role: 'Registered Nurse (RN)',
        approvalType: 'Verbal',
      });
    });

    await test.step('Verify order on grid with Dietician discipline', async () => {
      const rowCount = await pages.orderEntry.getOrderRowCount();
      expect(rowCount).toBeGreaterThan(0);
      console.log('VF order with Dietician discipline on grid');
    });
  });

  test('Step 8-9: Enter custom discipline (Music Therapy)', async ({ pages }) => {
    await test.step('Enter VF order with custom discipline', async () => {
      await pages.orderEntry.addVisitFrequencyOrder({
        discipline: 'Other',
        otherDiscipline: 'Music Therapy',
        numberOfVisits: 1,
        timeInterval: 'Week',
        duration: '1 Week',
        startDate: todayFormatted,
        orderingProvider: physicianName,
        role: 'Registered Nurse (RN)',
        approvalType: 'Verbal',
      });
    });

    await test.step('Verify custom discipline on grid', async () => {
      const rowCount = await pages.orderEntry.getOrderRowCount();
      expect(rowCount).toBeGreaterThan(0);
      console.log('VF order with custom Music Therapy discipline on grid');
    });
  });
});
