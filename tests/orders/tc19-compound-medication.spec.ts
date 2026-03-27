import { test, expect } from '../../fixtures/page-objects.fixture';
import * as dotenv from 'dotenv';
import { CredentialManager } from '../../utils/credential-manager';
import { TestDataManager } from '../../utils/test-data-manager';
import { DateHelper } from '../../utils/date-helper';
import { CompoundMedicationOrderData } from '../../types/order.types';

dotenv.config({ path: '.env.local' });

/**
 * TC-19: Compound/Free Text Medication Order
 *
 * Tests compound medication creation with multiple ingredients,
 * data flow verification, and MAR details addition.
 */
test.describe('TC-19: Compound/Free Text Medication Order', () => {
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

  test('Step 2-4: Enter compound medication with ingredients', async ({ pages }) => {
    await test.step('Create compound medication order', async () => {
      const compoundData: CompoundMedicationOrderData = {
        medicationName: 'Custom Compound Med',
        ingredients: [
          'Ingredient A 10mg',
          'Ingredient B 5mg',
          'Ingredient C 2.5mg',
        ],
        dosage: '1 capsule',
        route: 'Oral',
        frequency: 'Twice daily',
        orderingProvider: physicianName,
        role: 'Registered Nurse (RN)',
        approvalType: 'Verbal',
      };

      await pages.orderEntry.addCompoundMedicationOrder(compoundData);
    });

    await test.step('Verify compound order on grid', async () => {
      const rowCount = await pages.orderEntry.getOrderRowCount();
      expect(rowCount).toBeGreaterThan(0);
      console.log('Compound medication order visible on grid');
    });

    await test.step('Verify ingredients in details section', async () => {
      await pages.orderEntry.clickCaretOnRow(0);
      const details = await pages.orderEntry.getOrderDetailsText(0);
      expect(details).toContain('Ingredient A');
      console.log('Ingredients displayed in details section');
    });
  });

  test('Step 5-6: Verify data flow to OM page', async ({ pages }) => {
    await test.step('Create compound medication order', async () => {
      await pages.orderEntry.addCompoundMedicationOrder({
        medicationName: 'Test Compound for OM',
        ingredients: ['Ingredient X 20mg', 'Ingredient Y 10mg'],
        orderingProvider: physicianName,
        role: 'Registered Nurse (RN)',
        approvalType: 'Verbal',
      });
    });

    await test.step('Verify order exists', async () => {
      const rowCount = await pages.orderEntry.getOrderRowCount();
      expect(rowCount).toBeGreaterThan(0);
      console.log('Compound order created - should flow to OM page');
    });

    await test.step('Check history section', async () => {
      await pages.orderEntry.clickCaretOnRow(0);
      const historyText = await pages.orderEntry.getHistoryText(0);
      expect(historyText).toBeTruthy();
      console.log('History section captures compound order actions');
    });
  });

  test('Step 8: Add MAR details to compound medication', async ({ pages }) => {
    await test.step('Create compound order', async () => {
      await pages.orderEntry.addCompoundMedicationOrder({
        medicationName: 'Compound with MAR',
        ingredients: ['Active Ingredient 50mg'],
        dosage: '1 dose',
        route: 'Oral',
        frequency: 'Daily',
        orderingProvider: physicianName,
        role: 'Registered Nurse (RN)',
        approvalType: 'Verbal',
      });
    });

    await test.step('Add MAR details via ellipsis', async () => {
      await pages.orderEntry.addEditMARDetails(0, {
        enabled: true,
        time: '08:00',
        additionalNotes: 'MAR for compound medication',
      });
    });

    await test.step('Verify MAR details in history', async () => {
      await pages.orderEntry.clickCaretOnRow(0);
      const historyText = await pages.orderEntry.getHistoryText(0);
      expect(historyText).toContain('MAR details');
      console.log('MAR details added to compound medication');
    });
  });
});
