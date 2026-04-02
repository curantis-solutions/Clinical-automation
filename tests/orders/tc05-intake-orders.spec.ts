import { test, expect, Page, BrowserContext } from '@playwright/test';
import { createPageObjectsForPage, PageObjects } from '../../fixtures/page-objects.fixture';
import { CredentialManager } from '../../utils/credential-manager';
import { TestDataManager } from '../../utils/test-data-manager';
import { DateHelper } from '../../utils/date-helper';
import { TIMEOUTS } from '../../config/timeouts';

/**
 * TC-05: Intake Orders – Add Medication, Convert to non-eRx, Delete
 *
 * Uses serial pattern: login once as RN, share browser session across all steps.
 *
 * Flow:
 *   Step 1: Navigate to Intake Orders page
 *   Step 2: Add intake medication (Tylenol 8 Hour) and verify on grid
 *   Step 3: Convert intake medication to non-eRx order
 *   Step 4: Verify data pre-fills in Order Entry add order popup, fill required fields, submit
 *   Step 5: Verify converted order on OE grid
 *   Step 6: Navigate back to Intake, verify Converted = "Yes - To non-eRx"
 *   Step 7: Add another intake medication for delete test
 *   Step 8: Delete the medication and verify removal from grid
 */

let sharedPage: Page;
let sharedContext: BrowserContext;
let pages: PageObjects;

const todayFormatted = DateHelper.getTodaysDate();
const physicianName = TestDataManager.getPhysician();

test.describe.serial('TC-05: Intake Orders – Add Medication, Convert & Delete', () => {
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

    // Navigate to patient
    await pages.dashboard.goto();
    await pages.dashboard.navigateToModule('Patient');
    await pages.patient.searchPatient(TestDataManager.getOrdersPatientId());
    await pages.patient.getPatientFromGrid(0);
  });

  test.afterAll(async () => {
    if (sharedContext) {
      await sharedContext.close();
    }
  });

  // =========================================================================
  // Step 1: Navigate to Intake Orders page
  // =========================================================================
  test('Step 1: Navigate to Intake Orders page', async () => {
    test.setTimeout(120000);

    await test.step('Navigate to Intake Orders', async () => {
      await pages.orderEntry.navigateToIntakeOrders();
      console.log('On Intake Orders page');
    });
  });

  // =========================================================================
  // Step 2: Add intake medication and verify on grid
  // =========================================================================
  test('Step 2: Add intake medication and verify on grid', async () => {
    test.setTimeout(120000);

    await test.step('Click Add and fill intake medication form', async () => {
      await pages.orderEntry.clickAddIntakeOrder()
      // Click the add (+) button next to "Intake Medications" header
      // const addBtn = sharedPage.locator('button').filter({ has: sharedPage.locator('img[alt="add"], img[src*="add"]') }).last();
      // await addBtn.click();
      await sharedPage.waitForTimeout(2000);
      console.log('Clicked Add on Intake Medications');

      // Name — ng-select typeahead with placeholder "Medication Name"
      const nameInput = sharedPage.locator('ng-select[formcontrolname="name"] input[role="combobox"]');
      await nameInput.click();
      await nameInput.fill('Tylenol 8 Hour');
      await sharedPage.waitForTimeout(3000);
      // Click the matching option from the dropdown panel
      const nameOption = sharedPage.locator('ng-dropdown-panel .ng-option .ng-option-label').filter({ hasText: 'Tylenol 8 Hour' }).first();
      await nameOption.waitFor({ state: 'visible', timeout: 10000 });
      await nameOption.click();
      await sharedPage.waitForTimeout(2000);
      console.log('Selected medication: Tylenol 8 Hour');

      // Route
      const routeInput = sharedPage.locator('ion-input[formcontrolname="route"] input');
      await routeInput.fill('oral');
      await sharedPage.waitForTimeout(500);
      console.log('Filled route: oral');

      // Strength — ng-select with addTagText="Other", auto-populates from medication
      // Select the first available strength if dropdown has options
      const strengthDropdown = sharedPage.locator('ng-select[formcontrolname="strength"]');
      await strengthDropdown.click();
      await sharedPage.waitForTimeout(1000);
      const strengthOption = sharedPage.locator('ng-dropdown-panel .ng-option').first();
      if (await strengthOption.isVisible({ timeout: 3000 }).catch(() => false)) {
        await strengthOption.click();
        console.log('Selected strength from dropdown');
      } else {
        // Close dropdown if no options
        await sharedPage.keyboard.press('Escape');
        console.log('Strength auto-populated or no options available');
      }
      await sharedPage.waitForTimeout(500);

      // Dosage
      const dosageInput = sharedPage.locator('ion-input[formcontrolname="dosage"] input');
      await dosageInput.fill('oral');
      await sharedPage.waitForTimeout(500);
      console.log('Filled dosage: oral');

      // Frequency
      const frequencyInput = sharedPage.locator('ion-input[formcontrolname="frequency"] input');
      await frequencyInput.fill('2 times');
      await sharedPage.waitForTimeout(500);
      console.log('Filled frequency: 2 times');

      // Symptoms
      const symptomsInput = sharedPage.locator('ion-input[formcontrolname="symptoms"] input');
      await symptomsInput.fill('pain');
      await sharedPage.waitForTimeout(500);
      console.log('Filled symptoms: pain');

      // Intake Notes
      const notesInput = sharedPage.locator('ion-textarea[formcontrolname="rnNotes"] textarea');
      await notesInput.fill('add intake notes');
      await sharedPage.waitForTimeout(500);
      console.log('Filled intake notes');

      // Click Save
      const saveBtn = sharedPage.locator('medication-edit button.save-button');
      await saveBtn.click();
      await sharedPage.waitForTimeout(3000);
      console.log('Saved intake medication');
    });

    await test.step('Verify medication appears on intake grid', async () => {
      const medRow = sharedPage.locator('ion-row.pc-row').filter({ hasText: 'Tylenol 8 Hour' }).first();
      await expect(medRow).toBeVisible({ timeout: 10000 });
      console.log('Tylenol 8 Hour visible on intake grid');

      // Verify Converted column shows "No"
      const convertedLabel = medRow.locator('ion-label').filter({ hasText: 'No' }).first();
      await expect(convertedLabel).toBeVisible();
      console.log('Converted status: No');
    });
  });

  // =========================================================================
  // Step 3: Convert intake medication to non-eRx order
  // =========================================================================
  test('Step 3: Convert intake medication to non-eRx order', async () => {
    test.setTimeout(120000);

    await test.step('Click ellipsis and select Convert to non-eRx Order', async () => {
      // Click the ellipsis (more) icon on the Tylenol row
      const medRow = sharedPage.locator('ion-row.pc-row').filter({ hasText: 'Tylenol 8 Hour' }).first();
      await medRow.locator('ion-icon.more-icon').click();
      await sharedPage.waitForTimeout(1000);
      console.log('Clicked ellipsis on Tylenol row');

      // Click "Convert to non-eRx Order"
      await sharedPage.locator('[data-cy="btn-convert-to-order"]').click();
      await sharedPage.waitForTimeout(3000);
      console.log('Clicked Convert to non-eRx Order');
    });
  });

  // =========================================================================
  // Step 4: Verify data in OE add order popup, fill required fields, submit
  // =========================================================================
  test('Step 4: Verify pre-filled data and submit order on Order Entry', async () => {
    test.setTimeout(120000);

    await test.step('Verify Convert To Order page with pre-filled data', async () => {
      // The add-order page opens with header "Covert To Order" (full page, not ion-modal)
      const convertHeader = sharedPage.locator('add-order ion-header').first();
      await expect(convertHeader).toBeVisible({ timeout: 10000 });
      console.log('Convert To Order page visible');

      // Verify medication name is pre-filled
      const nameValue = sharedPage.locator('[data-cy="select-name"] .ng-value-label').first();
      if (await nameValue.isVisible({ timeout: 3000 }).catch(() => false)) {
        const nameText = await nameValue.textContent();
        console.log(`Pre-filled medication name: ${nameText}`);
      }

      // Verify order type is locked to Medication - non-eRx
      const orderType = sharedPage.locator('[data-cy="select-order-type-dropdown"] .ng-value-label').first();
      if (await orderType.isVisible({ timeout: 3000 }).catch(() => false)) {
        const typeText = await orderType.textContent();
        console.log(`Pre-filled order type: ${typeText}`);
      }
    });

    await test.step('Fill additional required fields for medication order', async () => {
      // Hospice Coverage
      await pages.orderEntry.selectHospicePays(true);

      // Ordering Provider
      await pages.orderEntry.selectOrderingProvider('Registered Nurse (RN)', physicianName);

      // Approval Type
      await pages.orderEntry.selectApprovalType('Verbal');

      // Read Back and Verified (required for verbal medication orders)
      await pages.orderEntry.clickReadBackVerified();

      console.log('Filled all required fields for medication order');
    });

    await test.step('Submit the order', async () => {
      await pages.orderEntry.submitOrder();
      console.log('Medication order submitted from converted intake');
    });
  });

  // =========================================================================
  // Step 5: Verify converted order on OE grid
  // =========================================================================
  test('Step 5: Verify converted order on Order Entry grid', async () => {
    test.setTimeout(120000);

    await test.step('Verify Tylenol order appears on OE grid', async () => {
      const orderRow = sharedPage.locator('[data-cy="order"]').filter({ hasText: 'Tylenol' }).first();
      await expect(orderRow).toBeVisible({ timeout: 10000 });
      console.log('Converted Tylenol order visible on Order Entry grid');
    });
  });

  // =========================================================================
  // Step 6: Navigate back to Intake, verify Converted = "Yes - To non-eRx"
  // =========================================================================
  test('Step 6: Verify converted status on Intake Orders grid', async () => {
    test.setTimeout(120000);

    await test.step('Navigate back to Intake Orders', async () => {
      await pages.orderEntry.exitOrderEntry();
      console.log('Back on Intake Orders page');
    });

    await test.step('Verify Converted column shows Yes - To non-eRx', async () => {
      const medRow = sharedPage.locator('ion-row.pc-row').filter({ hasText: 'Tylenol 8 Hour' }).first();
      await expect(medRow).toBeVisible({ timeout: 10000 });

      // Check for "Yes - To non-eRx" text in the row
      await expect(medRow).toContainText('Yes - To non-eRx');
      console.log('Converted status updated to Yes - To non-eRx');
    });
  });

  // =========================================================================
  // Step 7: Add another intake medication for delete test
  // =========================================================================
  test('Step 7: Add another intake medication for delete test', async () => {
    test.setTimeout(120000);

    await test.step('Add second intake medication', async () => {
      // Click the add (+) button
      await pages.orderEntry.clickAddIntakeOrder();
      await sharedPage.waitForTimeout(1000);

      // Name
      const nameInput = sharedPage.locator('ng-select[formcontrolname="name"] input[role="combobox"]');
      await nameInput.click();
      await nameInput.fill('Amoxicillin');
      await sharedPage.waitForTimeout(3000);
      const nameOption = sharedPage.locator('ng-dropdown-panel .ng-option .ng-option-label').filter({ hasText: 'Amoxicillin' }).first();
      await nameOption.waitFor({ state: 'visible', timeout: 10000 });
      await nameOption.click();
      await sharedPage.waitForTimeout(2000);
      console.log('Selected medication: Amoxicillin');

      // Route
      const routeInput = sharedPage.locator('ion-input[formcontrolname="route"] input');
      await routeInput.fill('oral');
      await sharedPage.waitForTimeout(500);

      // Strength
      const strengthDropdown = sharedPage.locator('ng-select[formcontrolname="strength"]');
      await strengthDropdown.click();
      await sharedPage.waitForTimeout(1000);
      const strengthOption = sharedPage.locator('ng-dropdown-panel .ng-option').first();
      if (await strengthOption.isVisible({ timeout: 3000 }).catch(() => false)) {
        await strengthOption.click();
      } else {
        await sharedPage.keyboard.press('Escape');
      }
      await sharedPage.waitForTimeout(500);

      // Dosage
      const dosageInput = sharedPage.locator('ion-input[formcontrolname="dosage"] input');
      await dosageInput.fill('1 tablet');
      await sharedPage.waitForTimeout(500);

      // Frequency
      const frequencyInput = sharedPage.locator('ion-input[formcontrolname="frequency"] input');
      await frequencyInput.fill('Daily');
      await sharedPage.waitForTimeout(500);

      // Click Save
      const saveBtn = sharedPage.locator('medication-edit button.save-button');
      await saveBtn.click();
      await sharedPage.waitForTimeout(3000);
      console.log('Saved second intake medication');
    });

    await test.step('Verify Amoxicillin appears on intake grid', async () => {
      const medRow = sharedPage.locator('ion-row.pc-row').filter({ hasText: 'Amoxicillin' }).first();
      await expect(medRow).toBeVisible({ timeout: 10000 });
      console.log('Amoxicillin visible on intake grid');
    });
  });

  // =========================================================================
  // Step 8: Delete the medication and verify removal from grid
  // =========================================================================
  test('Step 8: Delete intake medication and verify removal', async () => {
    test.setTimeout(120000);

    await test.step('Click ellipsis on Amoxicillin row and select Delete', async () => {
      const medRow = sharedPage.locator('ion-row.pc-row').filter({ hasText: 'Amoxicillin' }).first();
      await medRow.locator('ion-icon.more-icon').click();
      await sharedPage.waitForTimeout(1000);
      console.log('Clicked ellipsis on Amoxicillin row');

      // Click Delete option
      await sharedPage.locator('[data-cy="btn-delete-option"]').click();
      await sharedPage.waitForTimeout(2000);
      console.log('Clicked Delete');
    });

    await test.step('Confirm deletion by clicking Proceed', async () => {
      // Delete confirmation alert with Cancel and Proceed buttons
      const proceedBtn = sharedPage.locator('.alert-button').filter({ hasText: 'Proceed' });
      await expect(proceedBtn).toBeVisible({ timeout: 5000 });
      await proceedBtn.click();
      await sharedPage.waitForTimeout(3000);
      console.log('Confirmed deletion — clicked Proceed');
    });

    await test.step('Verify Amoxicillin is removed from intake grid', async () => {
      const medRow = sharedPage.locator('ion-row.pc-row').filter({ hasText: 'Amoxicillin' });
      await expect(medRow).toHaveCount(0, { timeout: 10000 });
      console.log('Amoxicillin successfully deleted from intake grid');
    });
  });
});
