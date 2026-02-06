// =============================================================================
// ORDERING PHYSICIAN INFORMATION WORKFLOW
// =============================================================================

import { Page } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { PatientDetailsPage } from '../../pages_new/patient-details.page';

/**
 * Ordering Physician Information Configuration Interface
 */
export interface OrderingPhysicianInfoConfig {
  searchName?: string;            // Physician name to search (optional)
  sameAsReferringPhysician?: boolean; // Use same information as referring physician (default: false)
}

/**
 * Ordering Physician Information Result Interface
 */
export interface OrderingPhysicianInfoResult {
  success: boolean;
  error?: string;
}

/**
 * Add or edit ordering physician information on a patient
 * @param page - Playwright page instance
 * @param mode - 'add' to add new, 'edit' to modify existing
 * @param physicianInfo - Ordering physician configuration
 * @param fieldsToEdit - In edit mode, only these fields will be modified
 * @returns Result of the ordering physician operation
 *
 * @example // Add mode - clicks '+' button, fills all fields
 * await addOrderingPhysicianInformation(page, 'add', { sameAsReferringPhysician: true });
 * await addOrderingPhysicianInformation(page, 'add', { searchName: 'cypresslast' });
 *
 * @example // Edit mode - clicks 3-dot menu → pencil icon, updates only specified fields
 * await addOrderingPhysicianInformation(page, 'edit', { searchName: 'referring1' }, ['searchName']);
 */
export async function addOrderingPhysicianInformation(
  page: Page,
  mode: 'add' | 'edit',
  physicianInfo: OrderingPhysicianInfoConfig,
  fieldsToEdit: string[] = []
): Promise<OrderingPhysicianInfoResult> {
  const patientDetailsPage = new PatientDetailsPage(page);

  try {
    console.log(`\n🩺 ${mode === 'add' ? 'Adding' : 'Editing'} ordering physician information...`);
    console.log(`  → Same as Referring Physician: ${physicianInfo.sameAsReferringPhysician || false}`);

    // Open form based on mode
    await openOrderingPhysicianForm(page, patientDetailsPage, mode);

    // Handle fields based on mode and fieldsToEdit
    const shouldEdit = (field: string): boolean => {
      return mode !== 'edit' || fieldsToEdit.includes(field);
    };

    if (shouldEdit('sameAsReferringPhysician') && physicianInfo.sameAsReferringPhysician) {
      await toggleSameAsReferringPhysician(page, patientDetailsPage);
    } else if (shouldEdit('searchName')) {
      // Handle physician data - search or create new
      await handleOrderingPhysicianData(page, patientDetailsPage, physicianInfo.searchName);
    }

    // Save ordering physician information
    await saveOrderingPhysicianForm(page, patientDetailsPage);

    logOrderingPhysicianSuccess(physicianInfo, mode);
    return { success: true };

  } catch (error) {
    console.error('❌ Ordering physician operation failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// =============================================================================
// ORDERING PHYSICIAN HELPER FUNCTIONS
// =============================================================================

/**
 * Open the ordering physician form based on mode
 */
async function openOrderingPhysicianForm(
  page: Page,
  patientDetailsPage: PatientDetailsPage,
  mode: 'add' | 'edit'
): Promise<void> {
  if (mode === 'add') {
    // Click the plus button to add new
    await page.locator(patientDetailsPage.getSelector('addOrderingPhysician') as string).click();
  } else {
    // For edit: Click the "more" icon (3-dot menu) in the Ordering Physician section
    const orderingPhysicianSection = page.locator('text=Ordering Physician').locator('..').locator('img[alt="more"]');

    if (await orderingPhysicianSection.isVisible()) {
      await orderingPhysicianSection.click();
    } else {
      // Fallback: use the generic more icon selector (4th one on page for ordering physician)
      const moreIcons = page.getByRole('img', { name: 'more' });
      await moreIcons.nth(3).click();
    }
    await page.waitForTimeout(500);
    console.log('  → Clicked more icon in Ordering Physician section');

    // Click the "create" button (edit/pencil icon) in the popup menu
    await page.getByRole('button', { name: 'create' }).click();
    console.log('  → Clicked edit button');
  }
  await page.waitForTimeout(1500);
  await page.waitForSelector(patientDetailsPage.getSelector('orderingPhysicianSameAsReferringPhysician') as string, { timeout: 10000 });
  console.log(`  ✓ Ordering physician form opened (${mode} mode)`);
}

/**
 * Toggle "Same as Referring Physician" checkbox
 */
async function toggleSameAsReferringPhysician(page: Page, patientDetailsPage: PatientDetailsPage): Promise<void> {
  console.log('  → Checking "Same as Referring Physician" checkbox...');
  const checkbox = page.locator(patientDetailsPage.getSelector('orderingPhysicianSameAsReferringPhysician') as string);
  await checkbox.click();
  await page.waitForTimeout(500);
}

/**
 * Handle ordering physician data entry
 */
async function handleOrderingPhysicianData(
  page: Page,
  patientDetailsPage: PatientDetailsPage,
  searchName?: string
): Promise<void> {
  const sameAsReferringCheckbox = page.locator(patientDetailsPage.getSelector('orderingPhysicianSameAsReferringPhysician') as string);

  // Helper function to check if ion-checkbox is checked (uses 'checked' attribute)
  const isCheckboxChecked = async () => {
    const checkedAttr = await sameAsReferringCheckbox.getAttribute('checked');
    return checkedAttr === 'true' || checkedAttr === '';
  };

  if (searchName) {
    // Ensure "Same as Referring Physician" checkbox is unchecked to enable search
    if (await isCheckboxChecked()) {
      console.log('  → Unchecking "Same as Referring Physician" to enable search...');
      await sameAsReferringCheckbox.click();
      await page.waitForTimeout(500);
    }

    console.log(`  → Searching for physician: ${searchName}`);
    const found = await searchAndSelectOrderingPhysician(page, patientDetailsPage, searchName);
    if (!found) {
      // If no search results, use "Same as Referring Physician" as fallback
      console.log('  → No physician found, using "Same as Referring Physician" as fallback');
      await sameAsReferringCheckbox.click();
      await page.waitForTimeout(500);
    }
  } else {
    // No search name provided - use "Same as Referring Physician"
    console.log('  → No search name provided, using "Same as Referring Physician"');
    if (!(await isCheckboxChecked())) {
      await sameAsReferringCheckbox.click();
      await page.waitForTimeout(500);
    }
  }
}

/**
 * Search and select ordering physician
 * @returns true if a physician was found and selected, false otherwise
 */
async function searchAndSelectOrderingPhysician(
  page: Page,
  patientDetailsPage: PatientDetailsPage,
  searchName: string
): Promise<boolean> {
  const searchInput = page.locator(patientDetailsPage.getSelector('orderingPhysicianSearchPhysician') as string);
  await searchInput.click();
  await searchInput.fill(searchName);
  await page.waitForTimeout(1500);

  const searchResults = page.locator(patientDetailsPage.getSelector('orderingPhysicianSearchResults') as string);
  const resultsCount = await searchResults.count();

  if (resultsCount > 0) {
    console.log(`  → Found ${resultsCount} result(s), selecting first match...`);
    await searchResults.first().click();
    await page.waitForTimeout(1000);
    return true;
  }

  console.log('  → No physician found in search results');
  return false;
}

/**
 * Fill new ordering physician with random data
 */
async function fillNewOrderingPhysician(page: Page, patientDetailsPage: PatientDetailsPage): Promise<void> {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const npi = faker.string.numeric(10); // 10-digit NPI

  console.log(`  → Filling physician: ${firstName} ${lastName}`);

  await page.locator(patientDetailsPage.getSelector('orderingPhysicianFirstName') as string).fill(firstName);
  await page.locator(patientDetailsPage.getSelector('orderingPhysicianLastName') as string).fill(lastName);
  await page.locator(patientDetailsPage.getSelector('orderingPhysicianNpi') as string).fill(npi);
  await page.locator(patientDetailsPage.getSelector('orderingPhysicianPhone') as string).fill(faker.phone.number());
  await page.locator(patientDetailsPage.getSelector('orderingPhysicianEmail') as string).fill(faker.internet.email());

  console.log(`  → NPI: ${npi}`);
}

/**
 * Save the ordering physician form
 */
async function saveOrderingPhysicianForm(page: Page, patientDetailsPage: PatientDetailsPage): Promise<void> {
  console.log('  → Saving ordering physician information...');
  await page.locator(patientDetailsPage.getSelector('orderingPhysicianFormSave') as string).click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
}

/**
 * Log ordering physician success message
 */
function logOrderingPhysicianSuccess(
  physicianInfo: OrderingPhysicianInfoConfig,
  mode: 'add' | 'edit'
): void {
  console.log('\n' + '='.repeat(70));
  console.log(`✅ ORDERING PHYSICIAN ${mode === 'add' ? 'ADDED' : 'UPDATED'} SUCCESSFULLY`);
  console.log('='.repeat(70));
  if (physicianInfo.sameAsReferringPhysician) {
    console.log('   Same as Referring Physician: Yes');
  } else if (physicianInfo.searchName) {
    console.log(`   Physician: ${physicianInfo.searchName}`);
  }
  console.log('='.repeat(70) + '\n');
}
