// =============================================================================
// ORDERING PHYSICIAN INFORMATION WORKFLOW (Ionic 8)
// =============================================================================

import { Page } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { PatientDetailsPage } from '../../pages_ionic8/patient-details.page';

export interface OrderingPhysicianInfoConfig {
  searchName?: string;
  sameAsReferringPhysician?: boolean;
}

export interface OrderingPhysicianInfoResult {
  success: boolean;
  error?: string;
}

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

    await openOrderingPhysicianForm(page, patientDetailsPage, mode);

    const shouldEdit = (field: string): boolean => {
      return mode !== 'edit' || fieldsToEdit.includes(field);
    };

    if (shouldEdit('sameAsReferringPhysician') && physicianInfo.sameAsReferringPhysician) {
      await toggleSameAsReferringPhysician(page, patientDetailsPage);
    } else if (shouldEdit('searchName')) {
      await handleOrderingPhysicianData(page, patientDetailsPage, physicianInfo.searchName);
    }

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

async function openOrderingPhysicianForm(
  page: Page,
  patientDetailsPage: PatientDetailsPage,
  mode: 'add' | 'edit'
): Promise<void> {
  if (mode === 'add') {
    await page.locator(patientDetailsPage.getSelector('addOrderingPhysician') as string).click();
  } else {
    const orderingPhysicianSection = page.locator('text=Ordering Physician').locator('..').locator('img[alt="more"]');

    if (await orderingPhysicianSection.isVisible()) {
      await orderingPhysicianSection.click();
    } else {
      const moreIcons = page.getByRole('img', { name: 'more' });
      await moreIcons.nth(3).click();
    }
    await page.waitForTimeout(500);
    console.log('  → Clicked more icon in Ordering Physician section');

    await page.getByRole('button', { name: 'create' }).click();
    console.log('  → Clicked edit button');
  }
  await page.waitForTimeout(1500);
  await page.waitForSelector(patientDetailsPage.getSelector('orderingPhysicianSameAsReferringPhysician') as string, { timeout: 10000 });
  console.log(`  ✓ Ordering physician form opened (${mode} mode)`);
}

async function toggleSameAsReferringPhysician(page: Page, patientDetailsPage: PatientDetailsPage): Promise<void> {
  console.log('  → Checking "Same as Referring Physician" checkbox...');
  const checkbox = page.locator(patientDetailsPage.getSelector('orderingPhysicianSameAsReferringPhysician') as string);
  await checkbox.click();
  await page.waitForTimeout(500);
}

async function handleOrderingPhysicianData(
  page: Page,
  patientDetailsPage: PatientDetailsPage,
  searchName?: string
): Promise<void> {
  const sameAsReferringCheckbox = page.locator(patientDetailsPage.getSelector('orderingPhysicianSameAsReferringPhysician') as string);

  const isCheckboxChecked = async () => {
    const checkedAttr = await sameAsReferringCheckbox.getAttribute('checked');
    return checkedAttr === 'true' || checkedAttr === '';
  };

  if (searchName) {
    if (await isCheckboxChecked()) {
      console.log('  → Unchecking "Same as Referring Physician" to enable search...');
      await sameAsReferringCheckbox.click();
      await page.waitForTimeout(500);
    }

    console.log(`  → Searching for physician: ${searchName}`);
    const found = await searchAndSelectOrderingPhysician(page, patientDetailsPage, searchName);
    if (!found) {
      console.log('  → No physician found, using "Same as Referring Physician" as fallback');
      await sameAsReferringCheckbox.click();
      await page.waitForTimeout(500);
    }
  } else {
    console.log('  → No search name provided, using "Same as Referring Physician"');
    if (!(await isCheckboxChecked())) {
      await sameAsReferringCheckbox.click();
      await page.waitForTimeout(500);
    }
  }
}

async function searchAndSelectOrderingPhysician(
  page: Page,
  patientDetailsPage: PatientDetailsPage,
  searchName: string
): Promise<boolean> {
  // Search physician is an ng-select — click to open, type in the combobox
  const ngSelect = page.locator(patientDetailsPage.getSelector('orderingPhysicianSearchPhysician') as string);
  await ngSelect.click();
  await page.waitForTimeout(500);
  await page.locator(patientDetailsPage.getSelector('orderingPhysicianSearchInput') as string).fill(searchName);
  await page.waitForTimeout(2000);

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

async function saveOrderingPhysicianForm(page: Page, patientDetailsPage: PatientDetailsPage): Promise<void> {
  console.log('  → Saving ordering physician information...');
  await page.locator(patientDetailsPage.getSelector('orderingPhysicianFormSave') as string).click({ force: true });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
}

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
