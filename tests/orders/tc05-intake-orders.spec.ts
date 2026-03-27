import { test, expect } from '../../fixtures/page-objects.fixture';
import * as dotenv from 'dotenv';
import { CredentialManager } from '../../utils/credential-manager';
import { TestDataManager } from '../../utils/test-data-manager';
import { DateHelper } from '../../utils/date-helper';

dotenv.config({ path: '.env.local' });

/**
 * TC-05: Intake Orders – CRUD & Convert to Order
 *
 * Tests Intake Order creation, editing, deletion,
 * and conversion to a full Order Entry order.
 * will tune this later
 */
test.describe('TC-05: Intake Orders – CRUD & Convert to Order', () => {
  const todayFormatted = DateHelper.getTodaysDate();
  const physicianName = TestDataManager.getPhysician();

  test.beforeEach(async ({ pages }) => {
    test.setTimeout(300000);

    await pages.login.goto();
    const credentials = CredentialManager.getCredentials(undefined, 'RN');
    await pages.login.login(credentials.username, credentials.password);

    // Navigate to hospice patient's Intake Orders page
    await pages.dashboard.goto();
    await pages.dashboard.navigateToModule('Patient');
    await pages.patient.getPatientFromGrid(0);
    await pages.orderEntry.navigateToIntakeOrders();
  });

  test('Step 2-3: Create Intake Order and verify on grid', async ({ pages }) => {
    await test.step('Click + icon and enter required fields', async () => {
      await pages.orderEntry.addIntakeOrder({
        orderType: 'DME',
        name: 'Test Intake DME Order',
        startDate: todayFormatted,
      });
    });

    await test.step('Verify order appears on Intake Orders grid', async () => {
      const rowCount = await pages.orderEntry.getOrderRowCount();
      expect(rowCount).toBeGreaterThan(0);
      console.log('Intake order created and visible on grid');
    });
  });

  test('Step 4: Edit an Intake Order', async ({ pages }) => {
    await test.step('Create an intake order', async () => {
      await pages.orderEntry.addIntakeOrder({
        orderType: 'Supplies',
        name: 'Test Intake Supplies - Original',
        startDate: todayFormatted,
      });
    });

    await test.step('Edit the intake order via ellipsis', async () => {
      await pages.orderEntry.editIntakeOrder();
      // Edit fields in the popup
      await pages.orderEntry.fillOrderName('Test Intake Supplies - Edited');
      await pages.orderEntry.submitOrder();
    });

    await test.step('Verify edited data on grid', async () => {
      const isEdited = await pages.orderEntry.isOrderOnGrid('Edited');
      expect(isEdited).toBeTruthy();
      console.log('Intake order edited successfully');
    });
  });

  test('Step 5: Delete an Intake Order', async ({ pages }) => {
    await test.step('Create an intake order', async () => {
      await pages.orderEntry.addIntakeOrder({
        orderType: 'Other',
        name: 'Test Intake Other - To Delete',
        startDate: todayFormatted,
      });
    });

    await test.step('Delete the intake order via ellipsis', async () => {
      const initialCount = await pages.orderEntry.getOrderRowCount();
      await pages.orderEntry.deleteIntakeOrder();

      const finalCount = await pages.orderEntry.getOrderRowCount();
      expect(finalCount).toBeLessThan(initialCount);
      console.log('Intake order deleted successfully');
    });
  });

  test('Step 6-10: Convert Intake Order to Order Entry', async ({ pages }) => {
    await test.step('Create another intake order', async () => {
      await pages.orderEntry.addIntakeOrder({
        orderType: 'Treatment',
        name: 'Test Intake Treatment - Convert',
        startDate: todayFormatted,
      });
    });

    await test.step('Convert to Order via ellipsis', async () => {
      await pages.orderEntry.convertIntakeToOrder();
      console.log('Convert to Order popup should appear with prefilled data');
    });

    await test.step('Enter required fields and submit on Convert popup', async () => {
      await pages.orderEntry.selectOrderingProvider('Registered Nurse (RN)', physicianName);
      await pages.orderEntry.selectApprovalType('Verbal');
      await pages.orderEntry.submitOrder();
    });

    await test.step('Verify converted order on OE grid', async () => {
      const rowCount = await pages.orderEntry.getOrderRowCount();
      expect(rowCount).toBeGreaterThan(0);
      console.log('Intake order converted and visible on OE grid');
    });

    await test.step('Verify order data by clicking caret', async () => {
      await pages.orderEntry.clickCaretOnRow(0);
      const details = await pages.orderEntry.getOrderDetailsText(0);
      expect(details).toBeTruthy();
      console.log('Converted order details verified');
    });
  });
});
