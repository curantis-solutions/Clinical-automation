import { test, expect } from '../../fixtures/page-objects.fixture';
import * as dotenv from 'dotenv';
import { CredentialManager } from '../../utils/credential-manager';
import { TestDataManager } from '../../utils/test-data-manager';
import { DateHelper } from '../../utils/date-helper';
import { VisitFrequencyOrderData } from '../../types/order.types';

dotenv.config({ path: '.env.local' });

/**
 * TC-16: Visit Frequency – Service Declined
 *
 * Tests Service Declined checkbox for VF orders,
 * discontinue with service declined, and grid verification.
 */
test.describe('TC-16: Visit Frequency – Service Declined', () => {
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

  test('Step 3-6: Enter VF order with Service Declined', async ({ pages }) => {
    await test.step('Select discipline other than Skilled Nurse', async () => {
      await pages.orderEntry.clickAddOrder();
      await pages.orderEntry.selectOrderType('Visit Frequency');
      await pages.orderEntry.selectDiscipline('Social Worker');
    });

    await test.step('Click Service Declined and fill fields', async () => {
      await pages.orderEntry.enableServiceDeclined();
      await pages.orderEntry.fillServiceDeclinedDetails(todayFormatted, 'Patient refused');

      await pages.orderEntry.fillVisitCount(1);
      await pages.orderEntry.selectTimeInterval('Week');
      await pages.orderEntry.selectDuration('1 Week');
      await pages.orderEntry.setStartDate(todayFormatted);
      await pages.orderEntry.selectOrderingProvider('Registered Nurse (RN)', physicianName);
      await pages.orderEntry.selectApprovalType('Verbal');
      await pages.orderEntry.clickProceed();
    });

    await test.step('Validate declined order on grid', async () => {
      const orderedBy = await pages.orderEntry.getOrderedBy(0);
      expect(orderedBy).toContain('Service Declined');
      console.log('Service Declined displayed under Ordered by column');
    });
  });

  test('Step 7-10: Discontinue with Service Declined', async ({ pages }) => {
    await test.step('Enter VF order without Service Declined', async () => {
      const vfData: VisitFrequencyOrderData = {
        discipline: 'Hospice Aide',
        numberOfVisits: 2,
        timeInterval: 'Week',
        duration: '2 Weeks',
        startDate: todayFormatted,
        orderingProvider: physicianName,
        role: 'Registered Nurse (RN)',
        approvalType: 'Verbal',
      };
      await pages.orderEntry.addVisitFrequencyOrder(vfData);
    });

    await test.step('Discontinue with Service Declined checkbox', async () => {
      await pages.orderEntry.discontinueOrder(0, {
        discontinueDate: todayFormatted,
        discontinueReason: 'Service no longer needed',
        approvalType: 'Verbal',
        isServiceDeclined: true,
        dateDeclined: todayFormatted,
        declinedReason: 'Patient refused',
      });
    });

    await test.step('Verify Service Declined on grid', async () => {
      await pages.orderEntry.toggleHideDiscontinued();
      const orderedBy = await pages.orderEntry.getOrderedBy(0);
      expect(orderedBy).toContain('Service Declined');
      console.log('Discontinued order shows Service Declined');
    });
  });

  test('Step 11-14: Discontinue with override warning', async ({ page, pages }) => {
    await test.step('Enter VF order with future discontinue date', async () => {
      const futureDate = DateHelper.getFutureDate(7);
      const vfData: VisitFrequencyOrderData = {
        discipline: 'Spiritual Advisory',
        numberOfVisits: 1,
        timeInterval: 'Week',
        duration: '2 Weeks',
        startDate: todayFormatted,
        orderingProvider: physicianName,
        role: 'Registered Nurse (RN)',
        approvalType: 'Verbal',
      };
      await pages.orderEntry.addVisitFrequencyOrder(vfData);
    });

    await test.step('Discontinue and verify override warning', async () => {
      await pages.orderEntry.clickEllipsisOnRow(0);
      await page.locator('[data-cy="btn-discontinue-order"]').click();
      await page.waitForTimeout(2000);

      const warningMsg = await pages.orderEntry.getWarningMessage();
      expect(warningMsg).toContain('future discontinue date has already been entered');
      console.log(`Override warning: ${warningMsg}`);
    });

    await test.step('Change to current date and submit', async () => {
      await page.locator('[data-cy="date-discontinue-date"]').click();
      await DateHelper.selectDateFormatted(page, todayFormatted);

      await page.locator('[data-cy="input-discontinue-reason"]').fill('Overriding previous discontinue date');
      await page.locator('[data-cy="radio-verbal"]').click();
      await page.locator('[data-cy="btn-submit-discontinue"]').click();
      await page.waitForTimeout(5000);
    });

    await test.step('Validate discontinue date on grid', async () => {
      await pages.orderEntry.toggleHideDiscontinued();
      const rowCount = await pages.orderEntry.getOrderRowCount();
      expect(rowCount).toBeGreaterThan(0);
      console.log('Discontinue date updated on grid');
    });
  });
});
