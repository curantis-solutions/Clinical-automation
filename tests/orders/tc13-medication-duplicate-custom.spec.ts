import { test, expect } from '../../fixtures/page-objects.fixture';
import * as dotenv from 'dotenv';
import { CredentialManager } from '../../utils/credential-manager';
import { TestDataManager } from '../../utils/test-data-manager';
import { DateHelper } from '../../utils/date-helper';

dotenv.config({ path: '.env.local' });

/**
 * TC-13: Medication Order – Duplicate & Custom Strength
 *
 * Tests duplicate medication warning and custom strength entry.
 *  * will tune this later
 */
test.describe('TC-13: Medication Order – Duplicate & Custom Strength', () => {
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

  test('Step 3-4: Enter medication and re-enter same - duplicate warning', async ({ pages }) => {
    await test.step('Enter first medication order', async () => {
      await pages.orderEntry.addMedicationOrder({
        medicationName: 'Lisinopril',
        dosage: '10mg',
        route: 'Oral',
        frequency: 'Daily',
        orderingProvider: physicianName,
        role: 'Registered Nurse (RN)',
        approvalType: 'Verbal',
      });
      console.log('First medication order created');
    });

    await test.step('Re-enter same medication and verify duplicate warning', async () => {
      await pages.orderEntry.clickAddOrder();
      await pages.orderEntry.selectOrderType('Medication');
      await pages.orderEntry.searchMedication('Lisinopril');

      const warningMsg = await pages.orderEntry.getWarningMessage();
      expect(warningMsg).toContain('same name as a previous order');
      console.log(`Duplicate warning: ${warningMsg}`);
    });
  });

  test('Step 5-7: Enter custom strength and verify in description', async ({ pages }) => {
    await test.step('Enter medication with custom strength', async () => {
      await pages.orderEntry.clickAddOrder();
      await pages.orderEntry.selectOrderType('Medication');
      await pages.orderEntry.searchMedication('Metformin');

      // Enter custom strength
      await pages.orderEntry.enterCustomStrength('100 mg');
      console.log('Custom strength "100 mg" entered');
    });

    await test.step('Fill remaining fields and submit', async () => {
      await pages.orderEntry.fillDosage('1 tablet');
      await pages.orderEntry.selectRoute('Oral');
      await pages.orderEntry.selectFrequency('Daily');
      await pages.orderEntry.selectOrderingProvider('Registered Nurse (RN)', physicianName);
      await pages.orderEntry.selectApprovalType('Verbal');
      await pages.orderEntry.submitOrder();
    });

    await test.step('Verify custom strength in name/description', async () => {
      await pages.orderEntry.clickCaretOnRow(0);
      const details = await pages.orderEntry.getOrderDetailsText(0);
      expect(details).toContain('100 mg');
      console.log('Custom strength displayed in order details');
    });
  });
});
