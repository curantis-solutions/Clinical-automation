/**
 * =============================================================================
 * REUSABLE ADD PATIENT WORKFLOW FUNCTION
 * =============================================================================
 *
 * This module provides a reusable function to add patients with configurable
 * parameters for different care types and patient information.
 *
 * USAGE:
 * import { addPatientWorkflow, PatientWorkflowConfig } from './addpatient-workflow';
 *
 * const config: PatientWorkflowConfig = {
 *   careType: 'Hospice',
 *   demographics: { ... },
 *   contactInfo: { ... },
 *   address: { ... }
 * };
 *
 * await addPatientWorkflow(page, config);
 *
 * =============================================================================
 */

import { Page } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { DashboardPage } from '../pages/dashboard.page';
import { PatientPagenew } from '../pages_new/patient.pagenew';
import { CareType, Gender } from '../types/patient.types';
import { setupPatientChartListener } from '../utils/api-helper';
import { PatientDataFixture, updateFixtureRuntimeData } from '../fixtures/patient-data.fixture';
import { PatientDetailsPage } from 'pages_new/patient-details.page';


/**
 * Configuration interface for patient workflow
 */
export interface PatientWorkflowConfig {
  // Care Type (required)
  careType: CareType;

  // Demographics (all required except optional fields)
  demographics: {
    firstName?: string;  // Auto-generated if not provided
    lastName?: string;   // Auto-generated if not provided
    middleInitial?: string;
    ssn?: string;        // Auto-generated if not provided
    dateOfBirth: string; // Format: MM/DD/YYYY
    gender: Gender;
    veteran: boolean;
    nickname?: string;
  };

  // Contact Information (required)
  contactInfo: {
    phoneNumber?: string;    // Auto-generated if not provided
    emailAddress?: string;   // Auto-generated if not provided
  };

  // Address Information (required)
  address: {
    streetAddress?: string;  // Auto-generated if not provided
    city: string;
    state: string;           // e.g., 'TX', 'CA'
    zipCode: string;
    zipCodeExt?: string;
    county?: string;
    sameAddress?: boolean;   // Default: true
  };

  // Additional Information (optional)
  additionalInfo?: {
    maritalStatus?: string;
    firstLanguage?: string;
    religion?: string;
    ethnicity?: string;
    ethnicityHope?: string;
    raceHope?: string;
    skilledBed?: boolean;    // For Hospice only
  };

  // Login Credentials (optional - uses default if not provided)
  credentials?: {
    username?: string;
    password?: string;
    role?: string;           // e.g., 'RN', 'MD', 'SW'
  };

  // Options
  options?: {
    skipLogin?: boolean;     // If already logged in
    skipNavigation?: boolean; // If already on Patient page
    returnToPatientList?: boolean; // Navigate back to patient list after creation
  };
}

/**
 * Result returned after patient workflow completion
 */
export interface PatientWorkflowResult {
  success: boolean;
  patientId?: number;
  patientFirstName: string;
  patientLastName: string;
  patientSSN: string;
  error?: string;
  url?: string;
}

/**
 * Main reusable function to add a patient
 * @param page - Playwright Page object
 * @param config - Patient workflow configuration
 * @returns Patient workflow result with patient details
 */
export async function addPatientWorkflow(
  page: Page,
  config: PatientWorkflowConfig
): Promise<PatientWorkflowResult> {
  // Initialize page objects
  const dashboardPage = new DashboardPage(page);
  const patientPage = new PatientPagenew(page);

  // Storage for patient data
  let patientId: number | undefined;
  let patientFirstName: string = '';
  let patientLastName: string = '';
  let patientSSN: string = '';

  try {

    
    // ===========================================================================
    // STEP 3: SETUP API LISTENER
    // ===========================================================================
    setupPatientChartListener(page, (capturedPatientId) => {
      patientId = capturedPatientId;
      console.log(`📋 Captured Patient ID: ${patientId}`);
    });

    // ===========================================================================
    // STEP 4: CLICK ADD PATIENT
    // ===========================================================================
    console.log('➕ Opening Add Patient form...');
    await patientPage.clickAddPatient();
    await page.waitForTimeout(1500);

    const careTypeSelector = '[data-cy="radio-type-of-care-hospice"]';
    await page.waitForSelector(careTypeSelector, { timeout: 10000 });
    console.log('✅ Add Patient form opened');

    // ===========================================================================
    // STEP 5: GENERATE/PREPARE PATIENT DATA
    // ===========================================================================
    console.log('📝 Preparing patient data...');

    // Generate missing fields
    patientFirstName = config.demographics.firstName || faker.person.firstName();
    patientLastName = config.demographics.lastName || faker.person.lastName();
    patientSSN = config.demographics.ssn || faker.string.numeric(9);

    const patientData = {
      careType: config.careType,
      demographics: {
        firstName: patientFirstName,
        lastName: patientLastName,
        middleInitial: config.demographics.middleInitial || faker.person.middleName().charAt(0),
        nickname: config.demographics.nickname,
        ssn: patientSSN,
        dateOfBirth: config.demographics.dateOfBirth,
        gender: config.demographics.gender,
        veteran: config.demographics.veteran,
      },
      contactInfo: {
        phoneNumber: config.contactInfo.phoneNumber || faker.phone.number(),
        emailAddress: config.contactInfo.emailAddress || faker.internet.email({
          firstName: patientFirstName,
          lastName: patientLastName,
        }),
      },
      address: {
        streetAddress: config.address.streetAddress || faker.location.streetAddress(),
        city: config.address.city,
        state: config.address.state,
        zipCode: config.address.zipCode,
        zipCodeExt: config.address.zipCodeExt,
        county: config.address.county,
        sameAddress: config.address.sameAddress ?? true,
      },
      additionalInfo: config.additionalInfo || {
        maritalStatus: 'Married',
        firstLanguage: 'English',
        religion: 'Christian',
        ethnicity: 'Not Hispanic',
        ethnicityHope: 'Not Hispanic',
        raceHope: 'White',
        skilledBed: false,
      },
    };

    console.log(`  → Patient: ${patientFirstName} ${patientLastName}`);
    console.log(`  → Care Type: ${config.careType}`);

    // ===========================================================================
    // STEP 6: FILL PATIENT FORM
    // ===========================================================================
    console.log('📝 Filling patient form...');

    // Select Care Type
    await patientPage.selectCareType(config.careType);
    console.log('  ✓ Care type selected');

    // Fill Demographics
    await patientPage.fillDemographics(patientData);
    console.log('  ✓ Demographics filled');

    // Fill Additional Info
    await patientPage.fillAdditionalInfo(patientData);
    console.log('  ✓ Additional info filled');

    // Fill Contact Info
    await patientPage.fillContactInfo(patientData);
    console.log('  ✓ Contact info filled');

    // Fill Address
    await patientPage.fillAddress(patientData);
    console.log('  ✓ Address filled');

    // Fill Hospice-specific fields (if applicable)
    if (config.careType === 'Hospice') {
      const skilledBed = patientData.additionalInfo?.skilledBed ?? false;
      await patientPage.fillHospiceSpecificFields(skilledBed);
      console.log('  ✓ Hospice fields filled');
    }

    // ===========================================================================
    // STEP 7: SAVE PATIENT
    // ===========================================================================
    console.log('💾 Saving patient...');
    await patientPage.savePatient();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    console.log('✅ Patient saved successfully');

    // ===========================================================================
    // STEP 8: RETURN TO PATIENT LIST (if requested)
    // ===========================================================================
    if (config.options?.returnToPatientList) {
      console.log('🔙 Returning to patient list...');
      await page.goBack();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
    }

    // ===========================================================================
    // RETURN RESULT
    // ===========================================================================
    const result: PatientWorkflowResult = {
      success: true,
      patientId,
      patientFirstName,
      patientLastName,
      patientSSN,
      url: page.url(),
    };

    console.log('\n' + '='.repeat(70));
    console.log('🎉 PATIENT CREATED SUCCESSFULLY');
    console.log('='.repeat(70));
    console.log(`  Name:        ${patientFirstName} ${patientLastName}`);
    console.log(`  SSN:         ${patientSSN}`);
    console.log(`  DOB:         ${config.demographics.dateOfBirth}`);
    console.log(`  Gender:      ${config.demographics.gender}`);
    console.log(`  Patient ID:  ${patientId || 'Not captured'}`);
    console.log(`  Care Type:   ${config.careType}`);
    console.log('='.repeat(70) + '\n');

    return result;

  } catch (error) {
    console.error('❌ Patient workflow failed:', error);

    return {
      success: false,
      patientFirstName: patientFirstName || 'Unknown',
      patientLastName: patientLastName || 'Unknown',
      patientSSN: patientSSN || 'Unknown',
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Add patient using fixture data
 * @param page - Playwright Page object
 * @param fixture - Patient data fixture from patient-data.fixture.ts
 * @param options - Optional workflow options (skipLogin, skipNavigation, etc.)
 * @returns Patient workflow result with patient details
 */
export async function addPatientFromFixture(
  page: Page,
  fixture: PatientDataFixture,
  options?: {
    skipLogin?: boolean;
    skipNavigation?: boolean;
    returnToPatientList?: boolean;
    credentials?: {
      username?: string;
      password?: string;
      role?: string;
    };
  }
): Promise<PatientWorkflowResult> {
  console.log(`\n📋 Using fixture: ${fixture.fixtureName}`);
  console.log(`   Description: ${fixture.description}`);

  // Convert fixture to workflow config
  const config: PatientWorkflowConfig = {
    careType: fixture.careType,
    demographics: fixture.demographics,
    contactInfo: fixture.contactInfo,
    address: fixture.address,
    additionalInfo: fixture.additionalInfo,
    credentials: options?.credentials,
    options: {
      skipLogin: options?.skipLogin,
      skipNavigation: options?.skipNavigation,
      returnToPatientList: options?.returnToPatientList,
    },
  };

  // Use the main workflow function
  const result = await addPatientWorkflow(page, config);

  // Store patient ID and URL back to fixture if successful
  if (result.success && result.patientId) {
    updateFixtureRuntimeData(fixture, {
      patientId: result.patientId,
      url: result.url,
    });
  }

  return result;
}

/**
 * =============================================================================
 * ADD CALLER INFORMATION FUNCTION
 * =============================================================================
 */

/**
 * Configuration interface for caller information
 */
export interface CallerInfoConfig {
  referralType: string;           // e.g., 'Physician', 'Community Resource', 'Family Member', etc.
  relation?: string;              // Relation ID or name
  searchName?: string;         // Physician/community name to search (optional)
  
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
 * @param page - Playwright Page object
 * @param callerInfo - Caller information configuration
 * @returns Caller info result with success status
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

    // Open caller form
    await openCallerForm(page, patientDetailsPage);

    // Select referral type
    await selectReferralType(page, callerInfo.referralType);

    // Select relation (if provided)
    if (callerInfo.relation) {
      await selectRelation(page, patientDetailsPage, callerInfo.relation);
    }

    // Handle caller data based on relation type
    await handleCallerByRelation(page, patientDetailsPage, callerInfo);

    // Save caller information
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

/**
 * Open the caller form
 */
async function openCallerForm(page: Page, patientDetailsPage: PatientDetailsPage): Promise<void> {
  await page.locator(patientDetailsPage.getSelector('addCaller')).click();
  await page.waitForTimeout(1500);
  await page.waitForSelector(patientDetailsPage.getSelector('callerFormReferralType') as string, { timeout: 10000 });
  console.log('  ✓ Caller form opened');
}

/**
 * Select referral type from dropdown
 */
async function selectReferralType(page: Page, referralType: string): Promise<void> {
  console.log(`  → Selecting referral type: ${referralType}`);
  await page.locator('[data-cy="select-referral-type"]').click();
  await page.waitForTimeout(500);
  await page.locator(`ion-popover ion-item:has-text("${referralType}")`).click();
  await page.waitForTimeout(1000);
  console.log('  ✓ Referral type selected');
}

/**
 * Select relation from dropdown
 */
async function selectRelation(page: Page, patientDetailsPage: PatientDetailsPage, relation: string): Promise<void> {
  console.log(`  → Selecting relation: ${relation}`);
  await page.locator(patientDetailsPage.getSelector('callerFormRelation') as string).click();
  await page.waitForTimeout(500);
  await page.locator(`ion-popover ion-item:has-text("${relation}")`).click();
  await page.waitForTimeout(1000);
  console.log('  ✓ Relation selected');
}

/**
 * Handle caller data based on relation type
 */
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

/**
 * Handle physician caller - search or create new
 */
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

/**
 * Handle community resource caller - search or create new
 */
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

/**
 * Generic search and select function for physician/resource
 */
async function searchAndSelect(
  page: Page,
  patientDetailsPage: PatientDetailsPage,
  searchFieldSelector: string,
  searchName: string,
  type: 'physician' | 'resource'
): Promise<boolean> {
  console.log(`  → Searching for ${type}: ${searchName}`);

  // Fill the search input
  await page.locator(patientDetailsPage.getSelector(searchFieldSelector as any) as string).fill(searchName);
  await page.waitForTimeout(1500);

  const searchResults = page.locator(patientDetailsPage.getSelector('callerFormPhysicianSearchResults') as string);
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

/**
 * Save the caller form
 */
async function saveCallerForm(page: Page, patientDetailsPage: PatientDetailsPage): Promise<void> {
  console.log('  → Saving caller information...');
  await page.locator(patientDetailsPage.getSelector('callerFormSave') as string).click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
}

/**
 * Log success message
 */
function logSuccess(callerInfo: CallerInfoConfig): void {
  console.log('\n' + '='.repeat(70));
  console.log('✅ CALLER INFORMATION ADDED SUCCESSFULLY');
  console.log('='.repeat(70));
  console.log(`  Referral Type: ${callerInfo.referralType}`);
  console.log(`  Relation:      ${callerInfo.relation || 'N/A'}`);
  console.log('='.repeat(70) + '\n');
}

/**
 * Helper function to fill new physician data
 */
async function fillNewPhysician(page: Page, patientDetailsPage: PatientDetailsPage): Promise<void> {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const npi = faker.string.numeric(10); // 10-digit NPI

  console.log(`  → Entering new physician: ${firstName} ${lastName}`);
  console.log(`  → NPI: ${npi}`);

  await page.locator(patientDetailsPage.getSelector('callerFormFirstName') as string).fill(firstName);
  await page.locator(patientDetailsPage.getSelector('callerFormLastName') as string).fill(lastName);
  await page.locator(patientDetailsPage.getSelector('callerFormNpi') as string).fill(npi);

  // Fill phone and email
  const phoneNumber = faker.phone.number();
  const email = faker.internet.email({ firstName, lastName });

  await page.locator(patientDetailsPage.getSelector('callerFormPhone') as string).fill(phoneNumber);
  await page.locator(patientDetailsPage.getSelector('callerFormEmail') as string).fill(email);

  console.log('  ✓ Physician data entered');
}

/**
 * Helper function to fill random caller data
 */
async function fillRandomCallerData(page: Page, patientDetailsPage: PatientDetailsPage): Promise<void> {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();

  console.log(`  → Entering random caller data: ${firstName} ${lastName}`);

  await page.locator(patientDetailsPage.getSelector('callerFormFirstName') as string).fill(firstName);
  await page.locator(patientDetailsPage.getSelector('callerFormLastName') as string).fill(lastName);

  // Fill phone and email
  const phoneNumber = faker.phone.number();
  const email = faker.internet.email({ firstName, lastName });

  await page.locator(patientDetailsPage.getSelector('callerFormPhone') as string).fill(phoneNumber);
  await page.locator(patientDetailsPage.getSelector('callerFormEmail') as string).fill(email);

  console.log('  ✓ Random caller data entered');
}

/**
 * =============================================================================
 * ADD REFERRER INFORMATION FUNCTION
 * =============================================================================
 */

/**
 * Configuration interface for referrer information
 */
export interface ReferrerInfoConfig {
  relation?: string;              // Relation name (e.g., 'Physician', 'Community Resource', etc.)
  searchName?: string;            // Physician/community name to search (optional)
  sameAsCaller?: boolean;         // Use same information as caller (default: false)
}

/**
 * Result returned after adding referrer information
 */
export interface ReferrerInfoResult {
  success: boolean;
  error?: string;
}

/**
 * Add referrer information to a patient
 * @param page - Playwright Page object
 * @param referrerInfo - Referrer information configuration
 * @returns Referrer info result with success status
 */
export async function addReferrerInformation(
  page: Page,
  referrerInfo: ReferrerInfoConfig
): Promise<ReferrerInfoResult> {
  const patientDetailsPage = new PatientDetailsPage(page);

  try {
    console.log('\n🔗 Adding referrer information...');
    console.log(`  → Relation: ${referrerInfo.relation || 'N/A'}`);
    console.log(`  → Same as Caller: ${referrerInfo.sameAsCaller || false}`);

    // Open referrer form
    await openReferrerForm(page, patientDetailsPage);

    // Handle "Same as Caller" checkbox if needed
    if (referrerInfo.sameAsCaller) {
      await toggleSameAsCaller(page, patientDetailsPage);
    } else {
      // Handle referrer data based on relation type
      await handleReferrerByRelation(page, patientDetailsPage, referrerInfo);
    }

    // Save referrer information
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

/**
 * Open the referrer form
 */
async function openReferrerForm(page: Page, patientDetailsPage: PatientDetailsPage): Promise<void> {
  await page.locator(patientDetailsPage.getSelector('addReferrer')).click();
  await page.waitForTimeout(1500);
  await page.waitForSelector(patientDetailsPage.getSelector('referrerFormSameAsCaller') as string, { timeout: 10000 });
  console.log('  ✓ Referrer form opened');
}

/**
 * Toggle "Same as Caller" checkbox
 */
async function toggleSameAsCaller(page: Page, patientDetailsPage: PatientDetailsPage): Promise<void> {
  console.log('  → Checking "Same as Caller" checkbox...');
  await page.locator(patientDetailsPage.getSelector('referrerFormSameAsCaller')).click();
  await page.waitForTimeout(1000);
  console.log('  ✓ Same as Caller selected');
}

/**
 * Handle referrer data based on relation type
 */
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
    // If no relation specified, select a default relation (e.g., "Family")
    const relationText = referrerInfo.relation || 'Family';
    console.log(`  → Handling other referrer type (${relationText}), filling random data...`);
    await selectReferrerRelationByText(page, patientDetailsPage, relationText);
    await fillRandomReferrerData(page, patientDetailsPage);
  }
}

/**
 * Select referrer relation from dropdown by text
 */
async function selectReferrerRelationByText(page: Page, patientDetailsPage: PatientDetailsPage, relationText: string): Promise<void> {
  console.log(`  → Selecting referrer relation: ${relationText}`);
  await page.locator(patientDetailsPage.getSelector('referrerFormRelation') as string).click();
  await page.waitForTimeout(500);

  // Use text matching like caller form does
  await page.locator(`ion-popover ion-item:has-text("${relationText}")`).click();
  await page.waitForTimeout(500);
  console.log('  ✓ Referrer relation selected');
}

/**
 * Handle physician referrer - search or create new
 */
async function handleReferrerPhysician(
  page: Page,
  patientDetailsPage: PatientDetailsPage,
  searchName?: string
): Promise<void> {
  console.log('  → Handling Physician referrer...');

  // First, select the Physician relation to show physician-specific fields
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

/**
 * Handle community resource referrer - search or create new
 */
async function handleReferrerCommunityResource(
  page: Page,
  patientDetailsPage: PatientDetailsPage,
  searchName?: string
): Promise<void> {
  console.log('  → Handling Community Resource referrer...');

  // First, select the Community Resource relation to show resource-specific fields
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

/**
 * Generic search and select function for referrer physician/resource
 */
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

/**
 * Fill new physician data for referrer
 */
async function fillNewReferrerPhysician(page: Page, patientDetailsPage: PatientDetailsPage): Promise<void> {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const npi = faker.string.numeric(10); // 10-digit NPI

  console.log(`  → Entering new physician: ${firstName} ${lastName}`);
  console.log(`  → NPI: ${npi}`);

  await page.locator(patientDetailsPage.getSelector('referrerFormFirstName') as string).fill(firstName);
  await page.locator(patientDetailsPage.getSelector('referrerFormLastName') as string).fill(lastName);
  await page.locator(patientDetailsPage.getSelector('referrerFormNpi') as string).fill(npi);

  // Fill phone and email
  const phoneNumber = faker.phone.number();
  const email = faker.internet.email({ firstName, lastName });

  await page.locator(patientDetailsPage.getSelector('referrerFormPhone') as string).fill(phoneNumber);
  await page.locator(patientDetailsPage.getSelector('referrerFormEmail') as string).fill(email);

  console.log('  ✓ Physician data entered');
}

/**
 * Fill random referrer data (for non-physician, non-community resource referrers)
 */
async function fillRandomReferrerData(page: Page, patientDetailsPage: PatientDetailsPage): Promise<void> {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();

  console.log(`  → Entering random referrer data: ${firstName} ${lastName}`);

  await page.locator(patientDetailsPage.getSelector('referrerFormFirstName') as string).fill(firstName);
  await page.locator(patientDetailsPage.getSelector('referrerFormLastName') as string).fill(lastName);

  // Fill phone and email
  const phoneNumber = faker.phone.number();
  const email = faker.internet.email({ firstName, lastName });

  await page.locator(patientDetailsPage.getSelector('referrerFormPhone') as string).fill(phoneNumber);
  await page.locator(patientDetailsPage.getSelector('referrerFormEmail') as string).fill(email);

  console.log('  ✓ Random referrer data entered (no NPI - not a physician)');
}

/**
 * Save the referrer form
 */
async function saveReferrerForm(page: Page, patientDetailsPage: PatientDetailsPage): Promise<void> {
  console.log('  → Saving referrer information...');
  await page.locator(patientDetailsPage.getSelector('referrerFormSave') as string).click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
}

/**
 * Log referrer success message
 */
function logReferrerSuccess(referrerInfo: ReferrerInfoConfig): void {
  console.log('\n' + '='.repeat(70));
  console.log('✅ REFERRER INFORMATION ADDED SUCCESSFULLY');
  console.log('='.repeat(70));
  console.log(`  Relation:       ${referrerInfo.relation || 'N/A'}`);
  console.log(`  Same as Caller: ${referrerInfo.sameAsCaller || false}`);
  console.log('='.repeat(70) + '\n');
}

/**
 * =============================================================================
 * ADD REFERRING PHYSICIAN INFORMATION FUNCTION
 * =============================================================================
 */

/**
 * Configuration interface for referring physician information
 */
export interface ReferringPhysicianInfoConfig {
  searchName?: string;            // Physician name to search (optional)
  sameAsReferrer?: boolean;       // Use same information as referrer (default: false)
}

/**
 * Result returned after adding referring physician information
 */
export interface ReferringPhysicianInfoResult {
  success: boolean;
  error?: string;
}

/**
 * Add referring physician information to a patient
 * @param page - Playwright Page object
 * @param physicianInfo - Referring physician information configuration
 * @returns Referring physician info result with success status
 */
export async function addReferringPhysicianInformation(
  page: Page,
  physicianInfo: ReferringPhysicianInfoConfig
): Promise<ReferringPhysicianInfoResult> {
  const patientDetailsPage = new PatientDetailsPage(page);

  try {
    console.log('\n👨‍⚕️ Adding referring physician information...');
    console.log(`  → Same as Referrer: ${physicianInfo.sameAsReferrer || false}`);

    // Open referring physician form
    await openReferringPhysicianForm(page, patientDetailsPage);

    // Handle "Same as Referrer" checkbox if needed
    if (physicianInfo.sameAsReferrer) {
      await toggleSameAsReferrer(page, patientDetailsPage);
    } else {
      // Handle physician data - search or create new
      await handleReferringPhysicianData(page, patientDetailsPage, physicianInfo.searchName);
    }

    // Save referring physician information
    await saveReferringPhysicianForm(page, patientDetailsPage);

    logReferringPhysicianSuccess(physicianInfo);
    return { success: true };

  } catch (error) {
    console.error('❌ Add referring physician information failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Open the referring physician form
 */
async function openReferringPhysicianForm(page: Page, patientDetailsPage: PatientDetailsPage): Promise<void> {
  await page.locator(patientDetailsPage.getSelector('addReferringPhysician')).click();
  await page.waitForTimeout(1500);
  await page.waitForSelector(patientDetailsPage.getSelector('referringPhysicianSameAsReferrer') as string, { timeout: 10000 });
  console.log('  ✓ Referring physician form opened');
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

  await page.locator(patientDetailsPage.getSelector('referringPhysicianSearchPhysician') as string).fill(searchName);
  await page.waitForTimeout(1500);

  const searchResults = page.locator(patientDetailsPage.getSelector('referringPhysicianSearchResults') as string);
  const resultsCount = await searchResults.count();

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
function logReferringPhysicianSuccess(physicianInfo: ReferringPhysicianInfoConfig): void {
  console.log('\n' + '='.repeat(70));
  console.log('✅ REFERRING PHYSICIAN INFORMATION ADDED SUCCESSFULLY');
  console.log('='.repeat(70));
  console.log(`  Same as Referrer: ${physicianInfo.sameAsReferrer || false}`);
  console.log('='.repeat(70) + '\n');
}

// =============================================================================
// ORDERING PHYSICIAN INFORMATION WORKFLOW
// =============================================================================

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
 * Add ordering physician information to patient
 * @param page - Playwright page instance
 * @param physicianInfo - Ordering physician configuration
 * @returns Result of adding ordering physician information
 */
export async function addOrderingPhysicianInformation(
  page: Page,
  physicianInfo: OrderingPhysicianInfoConfig
): Promise<OrderingPhysicianInfoResult> {
  const patientDetailsPage = new PatientDetailsPage(page);

  try {
    console.log('\n🩺 Adding ordering physician information...');
    console.log(`  → Same as Referring Physician: ${physicianInfo.sameAsReferringPhysician || false}`);

    // Open ordering physician form
    await openOrderingPhysicianForm(page, patientDetailsPage);

    // Handle "Same as Referring Physician" checkbox if needed
    if (physicianInfo.sameAsReferringPhysician) {
      await toggleSameAsReferringPhysician(page, patientDetailsPage);
    } else {
      // Handle physician data - search or create new
      await handleOrderingPhysicianData(page, patientDetailsPage, physicianInfo.searchName);
    }

    // Save ordering physician information
    await saveOrderingPhysicianForm(page, patientDetailsPage);

    logOrderingPhysicianSuccess(physicianInfo);
    return { success: true };

  } catch (error) {
    console.error('❌ Add ordering physician information failed:', error);
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
 * Open the ordering physician form
 */
async function openOrderingPhysicianForm(page: Page, patientDetailsPage: PatientDetailsPage): Promise<void> {
  console.log('  → Opening ordering physician form...');
  await page.locator(patientDetailsPage.getSelector('addOrderingPhysician') as string).click();
  await page.waitForTimeout(1000);
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
function logOrderingPhysicianSuccess(physicianInfo: OrderingPhysicianInfoConfig): void {
  console.log('\n' + '='.repeat(70));
  console.log('✅ ORDERING PHYSICIAN INFORMATION ADDED SUCCESSFULLY');
  console.log('='.repeat(70));
  console.log(`  Same as Referring Physician: ${physicianInfo.sameAsReferringPhysician || false}`);
  console.log('='.repeat(70) + '\n');
}
