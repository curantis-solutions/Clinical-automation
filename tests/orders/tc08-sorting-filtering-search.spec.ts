import { test, expect } from '../../fixtures/page-objects.fixture';
import * as dotenv from 'dotenv';
import { CredentialManager } from '../../utils/credential-manager';
import { TestDataManager } from '../../utils/test-data-manager';
import { DateHelper } from '../../utils/date-helper';

dotenv.config({ path: '.env.local' });

/**
 * TC-08: Sorting, Filtering & Search
 *
 * Tests sorting all columns, filtering by order type / signed status / teams,
 * and search functionality on OE page.
 *  * will tune this later
 */
test.describe('TC-08: Sorting, Filtering & Search', () => {
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

  test('Step 2: Test sorting all columns', async ({ pages }) => {
    const columns = ['order-number', 'order-type', 'name-description', 'ordered-by', 'start-date', 'discontinue-date', 'signed-status'];

    for (const column of columns) {
      await test.step(`Sort by ${column}`, async () => {
        await pages.orderEntry.sortByColumn(column);
        console.log(`Sorted by ${column} - ascending`);

        // Sort again for descending
        await pages.orderEntry.sortByColumn(column);
        console.log(`Sorted by ${column} - descending`);
      });
    }
  });

  test('Step 3: Test all filters', async ({ page, pages }) => {
    await test.step('Filter by order type', async () => {
      const orderTypes = ['Medication', 'DME', 'Visit Frequency', 'Level of Care'];
      for (const type of orderTypes) {
        await pages.orderEntry.filterByOrderType(type);
        await page.waitForTimeout(1000);
        console.log(`Filtered by order type: ${type}`);
      }
    });

    await test.step('Filter by signed status', async () => {
      const statuses = ['Yes', 'No'];
      for (const status of statuses) {
        await pages.orderEntry.filterBySignedStatus(status);
        await page.waitForTimeout(1000);
        console.log(`Filtered by signed status: ${status}`);
      }
    });
  });

  test('Step 4: Test search feature', async ({ page, pages }) => {
    await test.step('Search by order number', async () => {
      await pages.orderEntry.searchOrders('1');
      await page.waitForTimeout(2000);
      console.log('Searched by order number');
      await pages.orderEntry.clearSearch();
    });

    await test.step('Search by order type', async () => {
      await pages.orderEntry.searchOrders('Medication');
      await page.waitForTimeout(2000);
      console.log('Searched by order type');
      await pages.orderEntry.clearSearch();
    });

    await test.step('Search by provider name', async () => {
      await pages.orderEntry.searchOrders(physicianName);
      await page.waitForTimeout(2000);
      console.log('Searched by provider name');
      await pages.orderEntry.clearSearch();
    });

    await test.step('Search by signed status', async () => {
      await pages.orderEntry.searchOrders('No');
      await page.waitForTimeout(2000);
      console.log('Searched by signed status');
      await pages.orderEntry.clearSearch();
    });
  });
});
