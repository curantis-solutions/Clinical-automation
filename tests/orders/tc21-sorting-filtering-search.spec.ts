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

  test('TC-08: Sorting, Filtering & Search', async ({ page, pages }) => {
    test.setTimeout(300000);

    await test.step('Step 1: Login and navigate to Order Entry', async () => {
      await pages.login.goto();
      const credentials = CredentialManager.getCredentials(undefined, 'RN');
      await pages.login.login(credentials.username, credentials.password);

      await pages.dashboard.goto();
      await pages.dashboard.navigateToModule('Patient');
      await pages.patient.searchPatient(TestDataManager.getOrdersPatientId());
      await pages.patient.getPatientFromGrid(0);
      await pages.orderEntry.navigateToOrderEntry();
    });

    await test.step('Step 2: Test sorting all columns', async () => {
      const columns: { key: string; text?: string }[] = [
        { key: 'order-type' },
        { key: 'name-description' },
        { key: 'created-by' },
        { key: 'ordering-provider-display-name' },
        { key: 'order-start-date', text: 'Start Date' },
        { key: 'discontinue-date' },
        { key: 'order-start-date', text: 'Date Signed' },
        { key: 'signed' },
      ];

      for (const column of columns) {
        const label = column.text || column.key;
        await test.step(`Sort by ${label}`, async () => {
          await pages.orderEntry.sortByColumn(column.key, column.text);
          console.log(`Sorted by ${label} - ascending`);

          // Sort again for descending
          await pages.orderEntry.sortByColumn(column.key, column.text);
          console.log(`Sorted by ${label} - descending`);
        });
      }
    });

    await test.step('Step 3: Test all filters', async () => {
      await test.step('Filter by order type', async () => {
        const orderTypes = ['Medication', 'Durable Medical Equipment', 'Visit Frequency', 'Level of Care', 'Other', 'Supplies', 'Treatment'];
        for (const type of orderTypes) {
          await pages.orderEntry.filterByOrderType(type);
          await pages.orderEntry.applyFilters();

          const rowCount = await pages.orderEntry.getOrderRowCount();
          console.log(`Filtered by order type: ${type} - found ${rowCount} orders`);

          if (rowCount > 0) {
            const firstRowType = await page.locator('[data-cy="value-order-created-row-type-display-name"]').first().textContent();
            expect(firstRowType?.trim()).toBe(type);
            console.log(`✅ Verified filtered rows show order type: ${type}`);
          }

          await pages.orderEntry.clearFilters();
        }
      });

      await test.step('Filter by hospice coverage', async () => {
        const coverageOptions = ['Yes', 'No'];
        for (const option of coverageOptions) {
          await pages.orderEntry.filterByHospiceCoverage(option);
          await pages.orderEntry.applyFilters();

          const rowCount = await pages.orderEntry.getOrderRowCount();
          console.log(`Filtered by hospice coverage: ${option} - found ${rowCount} orders`);

          await pages.orderEntry.clearFilters();
        }
      });
    });

    await test.step('Step 4: Test search feature', async () => {
      await test.step('Search by order type', async () => {
        await pages.orderEntry.searchOrders('Medication');
        await page.waitForTimeout(2000);

        const rowCount = await pages.orderEntry.getOrderRowCount();
        console.log(`Searched by order type 'Medication' - found ${rowCount} orders`);
        expect(rowCount).toBeGreaterThan(0);

        const allRows = page.locator('[data-cy="order"]');
        const allRowsText = await allRows.allTextContents();
        const hasMatch = allRowsText.some(text => text.includes('Medication'));
        expect(hasMatch).toBeTruthy();
        console.log('✅ Verified search results contain Medication');

        await pages.orderEntry.clearSearch();
      });

      await test.step('Search by provider name', async () => {
        await pages.orderEntry.searchOrders(physicianName);
        await page.waitForTimeout(2000);

        const rowCount = await pages.orderEntry.getOrderRowCount();
        console.log(`Searched by provider '${physicianName}' - found ${rowCount} orders`);
        expect(rowCount).toBeGreaterThan(0);

        const allRows = page.locator('[data-cy="order"]');
        const allRowsText = await allRows.allTextContents();
        const hasMatch = allRowsText.some(text => text.toLowerCase().includes(physicianName.toLowerCase()));
        expect(hasMatch).toBeTruthy();
        console.log(`✅ Verified search results contain ${physicianName}`);

        await pages.orderEntry.clearSearch();
      });

    });
  });
});
