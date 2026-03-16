/**
 * =============================================================================
 * ADD CALLER INFORMATION FUNCTION (Ionic 8)
 * =============================================================================
 */

import { Page } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { PatientDetailsPage } from '../../pages_ionic8/patient-details.page';
import { selectNgOption } from '../../utils/form-helpers';

/**
 * Configuration interface for caller information
 */
export interface CallerInfoConfig {
  referralType: string;
  relation?: string;
  searchName?: string;
}

/**
 * Result returned after adding caller information
 */
export interface CallerInfoResult {
  success: boolean;
  error?: string;
}

/**
 * Add caller information to a patient
 */
export async function addCallerInformation(
  page: Page,
  callerInfo: CallerInfoConfig
): Promise<CallerInfoResult> {
  const patientDetailsPage = new PatientDetailsPage(page);

  try {
    console.log('\n📞 Adding caller information...');
    console.log(`  → Referral Type: ${callerInfo.referralType}`);
    console.log(`  → Relation: ${callerInfo.relation || 'N/A'}`);

    await openCallerForm(page, patientDetailsPage);
    await selectReferralType(page, patientDetailsPage, callerInfo.referralType);

    if (callerInfo.relation) {
      await selectRelation(page, patientDetailsPage, callerInfo.relation);
    }

    await handleCallerByRelation(page, patientDetailsPage, callerInfo);
    await saveCallerForm(page, patientDetailsPage);

    logSuccess(callerInfo);
    return { success: true };

  } catch (error) {
    console.error('❌ Add caller information failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function openCallerForm(page: Page, patientDetailsPage: PatientDetailsPage): Promise<void> {
  await page.locator(patientDetailsPage.getSelector('addCaller')).click();
  await page.waitForTimeout(1500);
  await page.waitForSelector(patientDetailsPage.getSelector('callerFormReferralType') as string, { timeout: 10000 });
  console.log('  ✓ Caller form opened');
}

async function selectReferralType(page: Page, patientDetailsPage: PatientDetailsPage, referralType: string): Promise<void> {
  console.log(`  → Selecting referral type: ${referralType}`);
  await selectNgOption(page, patientDetailsPage.getSelector('callerFormReferralType') as string, referralType);
  console.log('  ✓ Referral type selected');
}

async function selectRelation(page: Page, patientDetailsPage: PatientDetailsPage, relation: string): Promise<void> {
  console.log(`  → Selecting relation: ${relation}`);
  await selectNgOption(page, patientDetailsPage.getSelector('callerFormRelation') as string, relation);
  console.log('  ✓ Relation selected');
}

async function handleCallerByRelation(
  page: Page,
  patientDetailsPage: PatientDetailsPage,
  callerInfo: CallerInfoConfig
): Promise<void> {
  const relation = callerInfo.relation?.toLowerCase();

  if (relation === 'physician') {
    await handlePhysicianCaller(page, patientDetailsPage, callerInfo.searchName);
  } else if (relation === 'community resource') {
    await handleCommunityResourceCaller(page, patientDetailsPage, callerInfo.searchName);
  } else {
    console.log('  → Handling other caller type, filling random data...');
    await fillRandomCallerData(page, patientDetailsPage);
  }
}

async function handlePhysicianCaller(
  page: Page,
  patientDetailsPage: PatientDetailsPage,
  searchName?: string
): Promise<void> {
  console.log('  → Handling Physician caller...');

  if (searchName) {
    const found = await searchAndSelect(page, patientDetailsPage, 'callerFormSearchPhysician', searchName, 'physician');
    if (!found) {
      await fillNewPhysician(page, patientDetailsPage);
    }
  } else {
    console.log('  → No physician name provided, entering new physician data');
    await fillNewPhysician(page, patientDetailsPage);
  }
}

async function handleCommunityResourceCaller(
  page: Page,
  patientDetailsPage: PatientDetailsPage,
  searchName?: string
): Promise<void> {
  console.log('  → Handling Community Resource caller...');

  if (searchName) {
    const found = await searchAndSelect(page, patientDetailsPage, 'callerFormSearchCommunityResource', searchName, 'resource');
    if (!found) {
      await fillRandomCallerData(page, patientDetailsPage);
    }
  } else {
    console.log('  → No resource name provided, entering new resource data');
    await fillRandomCallerData(page, patientDetailsPage);
  }
}

async function searchAndSelect(
  page: Page,
  patientDetailsPage: PatientDetailsPage,
  searchFieldSelector: string,
  searchName: string,
  type: 'physician' | 'resource'
): Promise<boolean> {
  console.log(`  → Searching for ${type}: ${searchName}`);

  if (type === 'physician') {
    // ng-select pattern: click container → fill inner input → pick from dropdown
    const ngSelect = page.locator(patientDetailsPage.getSelector(searchFieldSelector as any) as string);
    await ngSelect.click();
    await page.waitForTimeout(500);
    const input = ngSelect.locator('input');
    await input.fill(searchName);
    await page.waitForTimeout(2000);
  } else {
    await page.locator(patientDetailsPage.getSelector(searchFieldSelector as any) as string).fill(searchName);
    await page.waitForTimeout(1500);
  }

  const searchResults = page.locator(patientDetailsPage.getSelector('callerFormPhysicianSearchResults') as string);
  const resultsCount = await searchResults.count();

  if (resultsCount > 0) {
    console.log(`  ✓ Found ${resultsCount} ${type}(s), selecting first one`);
    await searchResults.first().click();
    await page.waitForTimeout(1000);
    return true;
  }

  console.log(`  → No ${type}s found, entering new ${type} data`);
  if (type !== 'physician') {
    await page.locator(patientDetailsPage.getSelector(searchFieldSelector as any) as string).clear();
  }
  return false;
}

async function saveCallerForm(page: Page, patientDetailsPage: PatientDetailsPage): Promise<void> {
  console.log('  → Saving caller information...');
  await page.locator(patientDetailsPage.getSelector('callerFormSave') as string).click({ force: true });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
}

function logSuccess(callerInfo: CallerInfoConfig): void {
  console.log('\n' + '='.repeat(70));
  console.log('✅ CALLER INFORMATION ADDED SUCCESSFULLY');
  console.log('='.repeat(70));
  console.log(`  Referral Type: ${callerInfo.referralType}`);
  console.log(`  Relation:      ${callerInfo.relation || 'N/A'}`);
  console.log('='.repeat(70) + '\n');
}

async function fillNewPhysician(page: Page, patientDetailsPage: PatientDetailsPage): Promise<void> {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const npi = faker.string.numeric(10);

  console.log(`  → Entering new physician: ${firstName} ${lastName}`);
  console.log(`  → NPI: ${npi}`);

  await page.locator(patientDetailsPage.getSelector('callerFormFirstName') as string).fill(firstName);
  await page.locator(patientDetailsPage.getSelector('callerFormLastName') as string).fill(lastName);
  await page.locator(patientDetailsPage.getSelector('callerFormNpi') as string).fill(npi);

  const phoneNumber = faker.phone.number();
  const email = faker.internet.email({ firstName, lastName });

  await page.locator(patientDetailsPage.getSelector('callerFormPhone') as string).fill(phoneNumber);
  await page.locator(patientDetailsPage.getSelector('callerFormEmail') as string).fill(email);

  console.log('  ✓ Physician data entered');
}

async function fillRandomCallerData(page: Page, patientDetailsPage: PatientDetailsPage): Promise<void> {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();

  console.log(`  → Entering random caller data: ${firstName} ${lastName}`);

  await page.locator(patientDetailsPage.getSelector('callerFormFirstName') as string).fill(firstName);
  await page.locator(patientDetailsPage.getSelector('callerFormLastName') as string).fill(lastName);

  const phoneNumber = faker.phone.number();
  const email = faker.internet.email({ firstName, lastName });

  await page.locator(patientDetailsPage.getSelector('callerFormPhone') as string).fill(phoneNumber);
  await page.locator(patientDetailsPage.getSelector('callerFormEmail') as string).fill(email);

  console.log('  ✓ Random caller data entered');
}
