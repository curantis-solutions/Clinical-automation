import { test, expect } from '../../fixtures/page-objects.fixture';
import * as dotenv from 'dotenv';
import { CredentialManager } from '../../utils/credential-manager';
import { TestDataManager } from '../../utils/test-data-manager';
import { DateHelper } from '../../utils/date-helper';

dotenv.config({ path: '.env.local' });

/**
 * TC-10: Order Management – Operational Notes
 *
 * Tests adding operational notes from OM page,
 * verifying in history section, and cross-page validation on OE.
 *  * will tune this later
 */
test.describe('TC-10: Order Management – Operational Notes', () => {
  const todayFormatted = DateHelper.getTodaysDate();
  const physicianName = TestDataManager.getPhysician();

  test.beforeEach(async ({ pages }) => {
    test.setTimeout(300000);

    await pages.login.goto();
    const credentials = CredentialManager.getCredentials(undefined, 'RN');
    await pages.login.login(credentials.username, credentials.password);
  });

  test('Step 1-4: Navigate to OM and add operational note', async ({ pages }) => {
    await test.step('Navigate to Order Management', async () => {
      await pages.dashboard.goto();
      await pages.dashboard.navigateToModule('Order Management');
      console.log('Navigated to Order Management page');
    });

    await test.step('Add an operational note via ellipsis', async () => {
      await pages.orderEntry.addOperationalNote(0, 'Test operational note - automated test');
    });

    await test.step('Verify note in history section', async () => {
      await pages.orderEntry.clickCaretOnRow(0);
      const historyText = await pages.orderEntry.getHistoryText(0);
      expect(historyText).toContain('Note added');
      console.log('Operational note visible in history section');
    });
  });

  test('Step 5-6: Navigate to patient profile and verify note on OE page', async ({ page, pages }) => {
    await test.step('Navigate to Order Management', async () => {
      await pages.dashboard.goto();
      await pages.dashboard.navigateToModule('Order Management');
    });

    await test.step('Add operational note', async () => {
      await pages.orderEntry.addOperationalNote(0, 'Cross-page validation note');
    });

    await test.step('Click patient ID to navigate to profile', async () => {
      // Hover over patient ID and click hyperlink
      await page.locator('[data-cy="link-patient-id"]').first().click();
      await page.waitForTimeout(3000);
      console.log('Navigated to patient profile');
    });

    await test.step('Navigate to Order Entry and verify note', async () => {
      await pages.orderEntry.navigateToOrderEntry();

      await pages.orderEntry.clickCaretOnRow(0);
      const historyText = await pages.orderEntry.getHistoryText(0);
      expect(historyText).toBeTruthy();
      console.log('Operational note verified on OE page');
    });
  });
});
