/**
 * =============================================================================
 * ADD REFERRER INFORMATION FUNCTION (Ionic 8)
 * =============================================================================
 */

import { Page } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { PatientDetailsPage } from '../../pages_ionic8/patient-details.page';
import { selectNgOption } from '../../utils/form-helpers';

export interface ReferrerInfoConfig {
  relation?: string;
  searchName?: string;
  sameAsCaller?: boolean;
}

export interface ReferrerInfoResult {
  success: boolean;
  error?: string;
}

export async function addReferrerInformation(
  page: Page,
  referrerInfo: ReferrerInfoConfig
): Promise<ReferrerInfoResult> {
  const patientDetailsPage = new PatientDetailsPage(page);

  try {
    console.log('\n🔗 Adding referrer information...');
    console.log(`  → Relation: ${referrerInfo.relation || 'N/A'}`);
    console.log(`  → Same as Caller: ${referrerInfo.sameAsCaller || false}`);

    await openReferrerForm(page, patientDetailsPage);

    if (referrerInfo.sameAsCaller) {
      await toggleSameAsCaller(page, patientDetailsPage);
    } else {
      await handleReferrerByRelation(page, patientDetailsPage, referrerInfo);
    }

    await saveReferrerForm(page, patientDetailsPage);

    logReferrerSuccess(referrerInfo);
    return { success: true };

  } catch (error) {
    console.error('❌ Add referrer information failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function openReferrerForm(page: Page, patientDetailsPage: PatientDetailsPage): Promise<void> {
  await page.locator(patientDetailsPage.getSelector('addReferrer')).click();
  await page.waitForTimeout(1500);
  await page.waitForSelector(patientDetailsPage.getSelector('referrerFormSameAsCaller') as string, { timeout: 10000 });
  console.log('  ✓ Referrer form opened');
}

async function toggleSameAsCaller(page: Page, patientDetailsPage: PatientDetailsPage): Promise<void> {
  console.log('  → Checking "Same as Caller" checkbox...');
  // Wait for caller data to load into the form before toggling
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.locator(patientDetailsPage.getSelector('referrerFormSameAsCaller')).click();
  await page.waitForTimeout(2000);
  console.log('  ✓ Same as Caller selected');
}

async function handleReferrerByRelation(
  page: Page,
  patientDetailsPage: PatientDetailsPage,
  referrerInfo: ReferrerInfoConfig
): Promise<void> {
  const relation = referrerInfo.relation?.toLowerCase();

  if (relation === 'physician') {
    await handleReferrerPhysician(page, patientDetailsPage, referrerInfo.searchName);
  } else if (relation === 'community resource') {
    await handleReferrerCommunityResource(page, patientDetailsPage, referrerInfo.searchName);
  } else {
    const relationText = referrerInfo.relation || 'Family';
    console.log(`  → Handling other referrer type (${relationText}), filling random data...`);
    await selectReferrerRelationByText(page, patientDetailsPage, relationText);
    await fillRandomReferrerData(page, patientDetailsPage);
  }
}

async function selectReferrerRelationByText(page: Page, patientDetailsPage: PatientDetailsPage, relationText: string): Promise<void> {
  console.log(`  → Selecting referrer relation: ${relationText}`);
  await selectNgOption(page, patientDetailsPage.getSelector('referrerFormRelation') as string, relationText);
  console.log('  ✓ Referrer relation selected');
}

async function handleReferrerPhysician(
  page: Page,
  patientDetailsPage: PatientDetailsPage,
  searchName?: string
): Promise<void> {
  console.log('  → Handling Physician referrer...');
  await selectReferrerRelationByText(page, patientDetailsPage, 'Physician');

  if (searchName) {
    const found = await searchAndSelectReferrer(page, patientDetailsPage, 'referrerFormSearchPhysician', searchName, 'physician');
    if (!found) {
      await fillNewReferrerPhysician(page, patientDetailsPage);
    }
  } else {
    console.log('  → No physician name provided, entering new physician data');
    await fillNewReferrerPhysician(page, patientDetailsPage);
  }
}

async function handleReferrerCommunityResource(
  page: Page,
  patientDetailsPage: PatientDetailsPage,
  searchName?: string
): Promise<void> {
  console.log('  → Handling Community Resource referrer...');
  await selectReferrerRelationByText(page, patientDetailsPage, 'Community Resource');

  if (searchName) {
    const found = await searchAndSelectReferrer(page, patientDetailsPage, 'referrerFormSearchCommunityResource', searchName, 'resource');
    if (!found) {
      await fillRandomReferrerData(page, patientDetailsPage);
    }
  } else {
    console.log('  → No resource name provided, entering new resource data');
    await fillRandomReferrerData(page, patientDetailsPage);
  }
}

async function searchAndSelectReferrer(
  page: Page,
  patientDetailsPage: PatientDetailsPage,
  searchFieldSelector: string,
  searchName: string,
  type: 'physician' | 'resource'
): Promise<boolean> {
  console.log(`  → Searching for ${type}: ${searchName}`);

  await page.locator(patientDetailsPage.getSelector(searchFieldSelector as any) as string).fill(searchName);
  await page.waitForTimeout(1500);

  const searchResults = page.locator(patientDetailsPage.getSelector('referrerFormPhysicianSearchResults') as string);
  const resultsCount = await searchResults.count();

  if (resultsCount > 0) {
    console.log(`  ✓ Found ${resultsCount} ${type}(s), selecting first one`);
    await searchResults.first().click();
    await page.waitForTimeout(1000);
    return true;
  }

  console.log(`  → No ${type}s found, entering new ${type} data`);
  await page.locator(patientDetailsPage.getSelector(searchFieldSelector as any) as string).clear();
  return false;
}

async function fillNewReferrerPhysician(page: Page, patientDetailsPage: PatientDetailsPage): Promise<void> {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const npi = faker.string.numeric(10);

  console.log(`  → Entering new physician: ${firstName} ${lastName}`);
  console.log(`  → NPI: ${npi}`);

  await page.locator(patientDetailsPage.getSelector('referrerFormFirstName') as string).fill(firstName);
  await page.locator(patientDetailsPage.getSelector('referrerFormLastName') as string).fill(lastName);
  await page.locator(patientDetailsPage.getSelector('referrerFormNpi') as string).fill(npi);

  const phoneNumber = faker.phone.number();
  const email = faker.internet.email({ firstName, lastName });

  await page.locator(patientDetailsPage.getSelector('referrerFormPhone') as string).fill(phoneNumber);
  await page.locator(patientDetailsPage.getSelector('referrerFormEmail') as string).fill(email);

  console.log('  ✓ Physician data entered');
}

async function fillRandomReferrerData(page: Page, patientDetailsPage: PatientDetailsPage): Promise<void> {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();

  console.log(`  → Entering random referrer data: ${firstName} ${lastName}`);

  await page.locator(patientDetailsPage.getSelector('referrerFormFirstName') as string).fill(firstName);
  await page.locator(patientDetailsPage.getSelector('referrerFormLastName') as string).fill(lastName);

  const phoneNumber = faker.phone.number();
  const email = faker.internet.email({ firstName, lastName });

  await page.locator(patientDetailsPage.getSelector('referrerFormPhone') as string).fill(phoneNumber);
  await page.locator(patientDetailsPage.getSelector('referrerFormEmail') as string).fill(email);

  console.log('  ✓ Random referrer data entered (no NPI - not a physician)');
}

async function saveReferrerForm(page: Page, patientDetailsPage: PatientDetailsPage): Promise<void> {
  console.log('  → Saving referrer information...');
  await page.locator(patientDetailsPage.getSelector('referrerFormSave') as string).click({ force: true });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
}

function logReferrerSuccess(referrerInfo: ReferrerInfoConfig): void {
  console.log('\n' + '='.repeat(70));
  console.log('✅ REFERRER INFORMATION ADDED SUCCESSFULLY');
  console.log('='.repeat(70));
  console.log(`  Relation:       ${referrerInfo.relation || 'N/A'}`);
  console.log(`  Same as Caller: ${referrerInfo.sameAsCaller || false}`);
  console.log('='.repeat(70) + '\n');
}
