/**
 * =============================================================================
 * ADD REFERRING PHYSICIAN INFORMATION FUNCTION (Ionic 8)
 * =============================================================================
 */

import { Page } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { PatientDetailsPage } from '../../pages_ionic8/patient-details.page';

export interface ReferringPhysicianInfoConfig {
  searchName?: string;
  sameAsReferrer?: boolean;
}

export const DEFAULT_PHYSICIAN_SEARCH_NAME = 'cypresslast';

export interface ReferringPhysicianInfoResult {
  success: boolean;
  error?: string;
}

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

    await openReferringPhysicianForm(page, patientDetailsPage, mode);

    const shouldEdit = (field: string): boolean => {
      return mode !== 'edit' || fieldsToEdit.includes(field);
    };

    if (shouldEdit('sameAsReferrer') && physicianInfo.sameAsReferrer) {
      await toggleSameAsReferrer(page, patientDetailsPage);
    } else if (shouldEdit('searchName')) {
      const searchName = physicianInfo.searchName || DEFAULT_PHYSICIAN_SEARCH_NAME;
      console.log(`  → Using physician search name: ${searchName}${!physicianInfo.searchName ? ' (default)' : ''}`);
      await handleReferringPhysicianData(page, patientDetailsPage, searchName);
    }

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

async function openReferringPhysicianForm(
  page: Page,
  patientDetailsPage: PatientDetailsPage,
  mode: 'add' | 'edit'
): Promise<void> {
  if (mode === 'add') {
    await page.locator(patientDetailsPage.getSelector('addReferringPhysician')).click();
  } else {
    const referringPhysicianSection = page.locator('text=Referring Physician').locator('..').locator('img[alt="more"]');

    if (await referringPhysicianSection.isVisible()) {
      await referringPhysicianSection.click();
    } else {
      const moreIcons = page.getByRole('img', { name: 'more' });
      await moreIcons.nth(2).click();
    }
    await page.waitForTimeout(500);
    console.log('  → Clicked more icon in Referring Physician section');

    await page.getByRole('button', { name: 'create' }).click();
    console.log('  → Clicked edit button');
  }
  await page.waitForTimeout(1500);
  await page.waitForSelector(patientDetailsPage.getSelector('referringPhysicianSameAsReferrer') as string, { timeout: 10000 });
  console.log(`  ✓ Referring physician form opened (${mode} mode)`);
}

async function toggleSameAsReferrer(page: Page, patientDetailsPage: PatientDetailsPage): Promise<void> {
  console.log('  → Checking "Same as Referrer" checkbox...');
  await page.locator(patientDetailsPage.getSelector('referringPhysicianSameAsReferrer')).click();
  await page.waitForTimeout(1000);
  console.log('  ✓ Same as Referrer selected');
}

async function handleReferringPhysicianData(
  page: Page,
  patientDetailsPage: PatientDetailsPage,
  searchName?: string
): Promise<void> {
  console.log('  → Handling Referring Physician data...');

  const sameAsReferrerCheckbox = page.locator(patientDetailsPage.getSelector('referringPhysicianSameAsReferrer') as string);

  const isCheckboxChecked = async () => {
    const checkedAttr = await sameAsReferrerCheckbox.getAttribute('checked');
    return checkedAttr === 'true' || checkedAttr === '';
  };

  if (searchName) {
    if (await isCheckboxChecked()) {
      console.log('  → Unchecking "Same as Referrer" to enable search...');
      await sameAsReferrerCheckbox.click();
      await page.waitForTimeout(500);
    }

    const found = await searchAndSelectReferringPhysician(page, patientDetailsPage, searchName);
    if (!found) {
      console.log('  → No physician found, using "Same as Referrer" as fallback');
      await sameAsReferrerCheckbox.click();
      await page.waitForTimeout(500);
    }
  } else {
    console.log('  → No search name provided, using "Same as Referrer"');
    if (!(await isCheckboxChecked())) {
      await sameAsReferrerCheckbox.click();
      await page.waitForTimeout(500);
    }
  }
}

async function searchAndSelectReferringPhysician(
  page: Page,
  patientDetailsPage: PatientDetailsPage,
  searchName: string
): Promise<boolean> {
  console.log(`  → Searching for physician: ${searchName}`);

  // Search physician is an ng-select — click to open, type in the combobox
  const ngSelect = page.locator(patientDetailsPage.getSelector('referringPhysicianSearchPhysician') as string);
  await ngSelect.click();
  await page.waitForTimeout(500);
  await page.locator(patientDetailsPage.getSelector('referringPhysicianSearchInput') as string).fill(searchName);
  await page.waitForTimeout(2000);

  const searchResults = page.locator(patientDetailsPage.getSelector('referringPhysicianSearchResults') as string);
  const resultsCount = await searchResults.count();

  if (resultsCount > 0) {
    console.log(`  ✓ Found ${resultsCount} physician(s), selecting first one`);
    await searchResults.first().click();
    await page.waitForTimeout(1000);
    return true;
  }

  console.log('  → No physicians found');
  return false;
}

async function saveReferringPhysicianForm(page: Page, patientDetailsPage: PatientDetailsPage): Promise<void> {
  console.log('  → Saving referring physician information...');
  await page.locator(patientDetailsPage.getSelector('referringPhysicianFormSave') as string).click({ force: true });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
}

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
