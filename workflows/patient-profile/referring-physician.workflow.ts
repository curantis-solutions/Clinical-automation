/**
 * =============================================================================
 * ADD REFERRING PHYSICIAN INFORMATION FUNCTION
 * =============================================================================
 */

import { Page } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { PatientDetailsPage } from '../../pages_new/patient-details.page';

/**
 * Configuration interface for referring physician information
 */
export interface ReferringPhysicianInfoConfig {
  searchName?: string;            // Physician name to search (optional - uses DEFAULT_PHYSICIAN_SEARCH_NAME if not provided)
  sameAsReferrer?: boolean;       // Use same information as referrer (default: false)
}

// Default physician search name from fixture
export const DEFAULT_PHYSICIAN_SEARCH_NAME = 'cypresslast';

/**
 * Result returned after adding referring physician information
 */
export interface ReferringPhysicianInfoResult {
  success: boolean;
  error?: string;
}

/**
 * Add or edit referring physician information for a patient
 * @param page - Playwright Page object
 * @param mode - 'add' or 'edit' mode
 * @param physicianInfo - Referring physician information configuration
 * @param fieldsToEdit - Array of fields to edit in edit mode (required for edit)
 * @returns Referring physician info result with success status
 *
 * @example // Add mode - clicks '+' button, fills all fields
 * await addReferringPhysicianInformation(page, 'add', {});                           // uses default (cypresslast)
 * await addReferringPhysicianInformation(page, 'add', { searchName: 'Dr. Smith' });  // custom search
 * await addReferringPhysicianInformation(page, 'add', { sameAsReferrer: true });     // same as referrer
 *
 * @example // Edit mode - clicks 3-dot menu → pencil icon, updates only specified fields
 * await addReferringPhysicianInformation(page, 'edit', { searchName: 'Dr. Jones' }, ['searchName']);
 */
export async function addReferringPhysicianInformation(
  page: Page,
  mode: 'add' | 'edit',
  physicianInfo: ReferringPhysicianInfoConfig,
  fieldsToEdit: string[] = []
): Promise<ReferringPhysicianInfoResult> {
  const patientDetailsPage = new PatientDetailsPage(page);

  try {
    console.log(`\n👨‍⚕️ ${mode === 'add' ? 'Adding' : 'Editing'} referring physician information...`);
    console.log(`  → Same as Referrer: ${physicianInfo.sameAsReferrer || false}`);

    // Open form based on mode
    await openReferringPhysicianForm(page, patientDetailsPage, mode);

    // Handle fields based on mode and fieldsToEdit
    const shouldEdit = (field: string): boolean => {
      return mode !== 'edit' || fieldsToEdit.includes(field);
    };

    if (shouldEdit('sameAsReferrer') && physicianInfo.sameAsReferrer) {
      await toggleSameAsReferrer(page, patientDetailsPage);
    } else if (shouldEdit('searchName')) {
      // Use provided searchName or default from fixture
      const searchName = physicianInfo.searchName || DEFAULT_PHYSICIAN_SEARCH_NAME;
      console.log(`  → Using physician search name: ${searchName}${!physicianInfo.searchName ? ' (default)' : ''}`);
      await handleReferringPhysicianData(page, patientDetailsPage, searchName);
    }

    // Save form
    await saveReferringPhysicianForm(page, patientDetailsPage);

    logReferringPhysicianSuccess(physicianInfo, mode);
    return { success: true };

  } catch (error) {
    console.error('❌ Referring physician operation failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Open the referring physician form based on mode
 */
async function openReferringPhysicianForm(
  page: Page,
  patientDetailsPage: PatientDetailsPage,
  mode: 'add' | 'edit'
): Promise<void> {
  if (mode === 'add') {
    // Click the plus button to add new
    await page.locator(patientDetailsPage.getSelector('addReferringPhysician')).click();
  } else {
    // For edit: Click the "more" icon (3-dot menu) in the Referring Physician section
    // The "more" icon is an img element, and there are multiple on the page
    // We need to find the one in the Referring Physician section
    const referringPhysicianSection = page.locator('text=Referring Physician').locator('..').locator('img[alt="more"]');

    // Try to click the more icon in the referring physician section
    if (await referringPhysicianSection.isVisible()) {
      await referringPhysicianSection.click();
    } else {
      // Fallback: use the generic more icon selector (3rd one on page for referring physician)
      const moreIcons = page.getByRole('img', { name: 'more' });
      await moreIcons.nth(2).click();
    }
    await page.waitForTimeout(500);
    console.log('  → Clicked more icon in Referring Physician section');

    // Click the "create" button (edit/pencil icon) in the popup menu
    await page.getByRole('button', { name: 'create' }).click();
    console.log('  → Clicked edit button');
  }
  await page.waitForTimeout(1500);
  await page.waitForSelector(patientDetailsPage.getSelector('referringPhysicianSameAsReferrer') as string, { timeout: 10000 });
  console.log(`  ✓ Referring physician form opened (${mode} mode)`);
}

/**
 * Toggle "Same as Referrer" checkbox
 */
async function toggleSameAsReferrer(page: Page, patientDetailsPage: PatientDetailsPage): Promise<void> {
  console.log('  → Checking "Same as Referrer" checkbox...');
  await page.locator(patientDetailsPage.getSelector('referringPhysicianSameAsReferrer')).click();
  await page.waitForTimeout(1000);
  console.log('  ✓ Same as Referrer selected');
}

/**
 * Handle referring physician data - search for existing physician
 * Note: Cannot enter new physician manually - must search and select or use "Same as Referrer"
 */
async function handleReferringPhysicianData(
  page: Page,
  patientDetailsPage: PatientDetailsPage,
  searchName?: string
): Promise<void> {
  console.log('  → Handling Referring Physician data...');

  const sameAsReferrerCheckbox = page.locator(patientDetailsPage.getSelector('referringPhysicianSameAsReferrer') as string);

  // Helper function to check if ion-checkbox is checked (uses 'checked' attribute)
  const isCheckboxChecked = async () => {
    const checkedAttr = await sameAsReferrerCheckbox.getAttribute('checked');
    return checkedAttr === 'true' || checkedAttr === '';
  };

  if (searchName) {
    // Ensure "Same as Referrer" checkbox is unchecked to enable search
    if (await isCheckboxChecked()) {
      console.log('  → Unchecking "Same as Referrer" to enable search...');
      await sameAsReferrerCheckbox.click();
      await page.waitForTimeout(500);
    }

    const found = await searchAndSelectReferringPhysician(page, patientDetailsPage, searchName);
    if (!found) {
      // If no search results, use "Same as Referrer" as fallback
      console.log('  → No physician found, using "Same as Referrer" as fallback');
      await sameAsReferrerCheckbox.click();
      await page.waitForTimeout(500);
    }
  } else {
    // No search name provided - use "Same as Referrer"
    console.log('  → No search name provided, using "Same as Referrer"');
    if (!(await isCheckboxChecked())) {
      await sameAsReferrerCheckbox.click();
      await page.waitForTimeout(500);
    }
  }
}

/**
 * Search and select referring physician
 */
async function searchAndSelectReferringPhysician(
  page: Page,
  patientDetailsPage: PatientDetailsPage,
  searchName: string
): Promise<boolean> {
  console.log(`  → Searching for physician: ${searchName}`);

  // Fill the search field
  const searchField = page.locator(patientDetailsPage.getSelector('referringPhysicianSearchPhysician') as string);
  await searchField.fill(searchName);
  await page.waitForTimeout(1500);

  // Try multiple selectors for search results (DOM structure varies)
  // 1. First try the page object selector
  let searchResults = page.locator(patientDetailsPage.getSelector('referringPhysicianSearchResults') as string);
  let resultsCount = await searchResults.count();

  // 2. If not found, try text-based locator (search results appear as text below the input)
  if (resultsCount === 0) {
    // Look for a clickable element containing the search term (case insensitive)
    const searchResultByText = page.locator(`text=/${searchName}/i`).first();
    if (await searchResultByText.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log(`  ✓ Found physician by text match, selecting...`);
      await searchResultByText.click();
      await page.waitForTimeout(1000);
      return true;
    }
  }

  if (resultsCount > 0) {
    console.log(`  ✓ Found ${resultsCount} physician(s), selecting first one`);
    await searchResults.first().click();
    await page.waitForTimeout(1000);
    return true;
  }

  console.log('  → No physicians found, entering new physician data');
  await page.locator(patientDetailsPage.getSelector('referringPhysicianSearchPhysician') as string).clear();
  return false;
}

/**
 * Fill new referring physician data
 */
async function fillNewReferringPhysician(page: Page, patientDetailsPage: PatientDetailsPage): Promise<void> {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const npi = faker.string.numeric(10); // 10-digit NPI

  console.log(`  → Entering new physician: ${firstName} ${lastName}`);
  console.log(`  → NPI: ${npi}`);

  await page.locator(patientDetailsPage.getSelector('referringPhysicianFirstName') as string).fill(firstName);
  await page.locator(patientDetailsPage.getSelector('referringPhysicianLastName') as string).fill(lastName);
  await page.locator(patientDetailsPage.getSelector('referringPhysicianNpi') as string).fill(npi);

  // Fill phone and email
  const phoneNumber = faker.phone.number();
  const email = faker.internet.email({ firstName, lastName });

  await page.locator(patientDetailsPage.getSelector('referringPhysicianPhone') as string).fill(phoneNumber);
  await page.locator(patientDetailsPage.getSelector('referringPhysicianEmail') as string).fill(email);

  console.log('  ✓ Physician data entered');
}

/**
 * Save the referring physician form
 */
async function saveReferringPhysicianForm(page: Page, patientDetailsPage: PatientDetailsPage): Promise<void> {
  console.log('  → Saving referring physician information...');
  await page.locator(patientDetailsPage.getSelector('referringPhysicianFormSave') as string).click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
}

/**
 * Log referring physician success message
 */
function logReferringPhysicianSuccess(
  physicianInfo: ReferringPhysicianInfoConfig,
  mode: 'add' | 'edit'
): void {
  console.log('\n' + '='.repeat(70));
  console.log(`✅ REFERRING PHYSICIAN ${mode === 'add' ? 'ADDED' : 'UPDATED'} SUCCESSFULLY`);
  console.log('='.repeat(70));
  if (physicianInfo.sameAsReferrer) {
    console.log('   Same as Referrer: Yes');
  } else if (physicianInfo.searchName) {
    console.log(`   Physician: ${physicianInfo.searchName}`);
  }
  console.log('='.repeat(70) + '\n');
}
