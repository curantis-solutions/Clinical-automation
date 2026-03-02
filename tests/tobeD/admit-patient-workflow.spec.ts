/**
 * =============================================================================
 * ADMIT PATIENT WORKFLOW TEST
 * =============================================================================
 *
 * PURPOSE:
 * Complete workflow for admitting a new patient in QA environment:
 * - Login to QA environment as RN
 * - Navigate to Patient module via Rubik's Cube
 * - Click Add Patient button
 * - Fill complete Admit Patient form
 * - Save and verify patient creation
 *
 * PAGE OBJECTS USED (via createPageObjectsForPage factory):
 * - pages.login:          pages\login.page.ts
 * - pages.dashboard:      pages\dashboard.page.ts
 * - pages.patient:        pages\patient.pagenew.ts
 * - pages.patientDetails: pages\patient-details.page.ts
 *
 * =============================================================================
 */

import { test, expect, createPageObjectsForPage, type PageObjects } from '@fixtures/page-objects.fixture';
import { Page, BrowserContext } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { CredentialManager } from '../../utils/credential-manager';
import { PatientData } from '../../types/patient.types';
import { setupPatientChartListener } from '../../utils/api-helper';

// =============================================================================
// SHARED STATE
// =============================================================================
let sharedPage: Page;
let sharedContext: BrowserContext;
let pages: PageObjects;

// Patient data storage
let patientFirstName: string;
let patientLastName: string;
let patientId: number | undefined;
let patientData: PatientData;

// =============================================================================
// TEST SUITE
// =============================================================================
test.describe.serial('Admit Patient Workflow @workflow @smoke', () => {

  /**
   * SETUP - Initialize browser context and page objects
   */
  test.beforeAll(async ({ browser }) => {
    // Create browser context
    sharedContext = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      ignoreHTTPSErrors: true,
      baseURL: CredentialManager.getBaseUrl(),
    });

    // Create page instance
    sharedPage = await sharedContext.newPage();
    sharedPage.setDefaultTimeout(30000);
    sharedPage.setDefaultNavigationTimeout(30000);

    // Initialize all page objects via factory
    pages = createPageObjectsForPage(sharedPage);
  });

  /**
   * CLEANUP - Close browser context
   */
  test.afterAll(async () => {
    if (sharedContext) {
      await sharedContext.close();
    }
  });

  // ===========================================================================
  // STEP 01: LOGIN TO QA ENVIRONMENT
  // ===========================================================================
  test('Step 01: Login to QA Environment', async () => {
    test.setTimeout(120000);

    console.log('🔐 Logging into QA environment...');

    // Navigate to login page
    await pages.login.goto();

    // Get RN credentials from environment
    const credentials = CredentialManager.getCredentials(undefined, 'RN');

    // Perform login
    await pages.login.login(credentials.username, credentials.password);

    // Wait for dashboard redirect
    await sharedPage.waitForURL(/dashboard/, { timeout: 15000 });

    // Verify successful login
    const currentUrl = sharedPage.url();
    expect(currentUrl).toContain('dashboard');

    console.log('✅ Step 01 Complete: Logged in successfully');
  });

  // ===========================================================================
  // STEP 02: NAVIGATE TO PATIENT MODULE VIA RUBIK'S CUBE
  // ===========================================================================
  test('Step 02: Navigate to Patient Module via Rubiks Cube', async () => {
    test.setTimeout(120000);

    console.log('🎯 Navigating to Patient module...');

    // Ensure we're on dashboard
    const isDashboardVisible = await pages.dashboard.isDashboardDisplayed();
    if (!isDashboardVisible) {
      await pages.dashboard.goto();
    }

    // Wait for page to fully load
    await sharedPage.waitForLoadState('networkidle');
    await sharedPage.waitForTimeout(2000);

    // Navigate to Patient module (opens Rubik's Cube menu and clicks Patient)
    await pages.dashboard.navigateToModule('Patient');

    // Wait for Patient page to load
    await sharedPage.waitForTimeout(2000);

    console.log('✅ Step 02 Complete: Navigated to Patient module');
  });

  // ===========================================================================
  // STEP 03: CLICK ADD PATIENT BUTTON
  // ===========================================================================
  test('Step 03: Open Add Patient Form', async () => {
    test.setTimeout(120000);

    console.log('➕ Opening Add Patient form...');

    // Setup API listener to capture patient ID
    setupPatientChartListener(sharedPage, (capturedPatientId) => {
      patientId = capturedPatientId;
      console.log(`📋 Captured Patient ID: ${patientId}`);
    });

    // Click Add Patient button
    await pages.patient.clickAddPatient();

    // Wait for form to appear
    await sharedPage.waitForTimeout(1500);

    // Verify Add Patient form is displayed
    const careTypeSelector = '[data-cy="radio-type-of-care-hospice"]';
    await sharedPage.waitForSelector(careTypeSelector, { timeout: 10000 });

    const isFormVisible = await sharedPage.locator(careTypeSelector).isVisible();
    expect(isFormVisible).toBeTruthy();

    console.log('✅ Step 03 Complete: Add Patient form opened');
  });

  // ===========================================================================
  // STEP 04: FILL PATIENT DEMOGRAPHICS
  // ===========================================================================
  test('Step 04: Fill Patient Demographics', async () => {
    test.setTimeout(180000);

    console.log('📝 Filling patient demographics...');

    // Generate patient data
    patientFirstName = faker.person.firstName();
    patientLastName = faker.person.lastName();

    patientData = {
      careType: 'Hospice',
      demographics: {
        firstName: patientFirstName,
        lastName: patientLastName,
        middleInitial: faker.person.middleName().charAt(0),
        ssn: faker.string.numeric(9),
        dateOfBirth: '03/15/1955',
        gender: 'Male',
        veteran: false,
      },
      contactInfo: {
        phoneNumber: '214-555-1234',
        emailAddress: faker.internet.email({ firstName: patientFirstName, lastName: patientLastName }),
      },
      address: {
        streetAddress: faker.location.streetAddress(),
        city: 'Dallas',
        state: 'TX',
        zipCode: '75201',
        sameAddress: true,
      },
      additionalInfo: {
        maritalStatus: 'Married',
        firstLanguage: 'English',
        religion: 'Christian',
        ethnicity: 'Not Hispanic',
        ethnicityHope: 'Not Hispanic',
        raceHope: 'White',
        skilledBed: false,
      },
    };

    // Select Care Type: Hospice
    console.log('  → Selecting Care Type: Hospice');
    await pages.patient.selectCareType('Hospice');

    // Fill Demographics
    console.log(`  → Filling demographics: ${patientFirstName} ${patientLastName}`);
    await pages.patient.fillDemographics(patientData);

    console.log('✅ Step 04 Complete: Demographics filled');
  });

  // ===========================================================================
  // STEP 05: FILL ADDITIONAL INFORMATION
  // ===========================================================================
  test('Step 05: Fill Additional Information', async () => {
    test.setTimeout(180000);

    console.log('📝 Filling additional information...');

    // Fill additional info (marital status, language, religion, ethnicity)
    await pages.patient.fillAdditionalInfo(patientData);

    console.log('✅ Step 05 Complete: Additional information filled');
  });

  // ===========================================================================
  // STEP 06: FILL CONTACT INFORMATION
  // ===========================================================================
  test('Step 06: Fill Contact Information', async () => {
    test.setTimeout(120000);

    console.log('📝 Filling contact information...');

    // Fill contact info (phone, email)
    await pages.patient.fillContactInfo(patientData);

    console.log('✅ Step 06 Complete: Contact information filled');
    console.log(`  → Phone: ${patientData.contactInfo.phoneNumber}`);
    console.log(`  → Email: ${patientData.contactInfo.emailAddress}`);
  });

  // ===========================================================================
  // STEP 07: FILL ADDRESS INFORMATION
  // ===========================================================================
  test('Step 07: Fill Address Information', async () => {
    test.setTimeout(120000);

    console.log('📝 Filling address information...');

    // Fill address (street, city, state, zip)
    await pages.patient.fillAddress(patientData);

    console.log('✅ Step 07 Complete: Address information filled');
    console.log(`  → Address: ${patientData.address.streetAddress}`);
    console.log(`  → City: ${patientData.address.city}, ${patientData.address.state} ${patientData.address.zipCode}`);
  });

  // ===========================================================================
  // STEP 08: FILL HOSPICE-SPECIFIC FIELDS
  // ===========================================================================
  test('Step 08: Fill Hospice-Specific Fields', async () => {
    test.setTimeout(120000);

    console.log('📝 Filling hospice-specific fields...');

    // Fill hospice-specific fields (skilled bed)
    await pages.patient.fillHospiceSpecificFields(false);

    console.log('✅ Step 08 Complete: Hospice-specific fields filled');
    console.log('  → Skilled Bed: No');
  });

  // ===========================================================================
  // STEP 09: SAVE PATIENT
  // ===========================================================================
  test('Step 09: Save Patient', async () => {
    test.setTimeout(120000);

    console.log('💾 Saving patient...');

    // Save the patient
    await pages.patient.savePatient();

    // Wait for save operation to complete
    await sharedPage.waitForLoadState('networkidle');
    await sharedPage.waitForTimeout(3000);

    console.log('✅ Step 09 Complete: Patient saved successfully');
    console.log(`  → Patient Name: ${patientFirstName} ${patientLastName}`);
    console.log(`  → Patient ID: ${patientId || 'Pending...'}`);
  });

  // ===========================================================================
  // STEP 10: VERIFY PATIENT CREATED
  // ===========================================================================
  test('Step 10: Verify Patient Created', async () => {
    test.setTimeout(120000);

    console.log('🔍 Verifying patient creation...');

    // Wait a bit more for patient ID capture
    await sharedPage.waitForTimeout(2000);

    // Search for the patient
    if (patientId) {
      console.log(`  → Searching by Patient ID: ${patientId}`);
      await pages.patient.searchPatient(String(patientId));
    } else {
      console.log(`  → Searching by Last Name: ${patientLastName}`);
      await pages.patient.searchPatient(patientLastName);
    }

    await sharedPage.waitForTimeout(3000);

    // Verify patient exists in grid
    const patientExists = await pages.patient.verifyPatientInGrid(0);
    expect(patientExists).toBeTruthy();

    // Verify patient name matches
    const searchResult = await pages.patient.verifyPatientNameInGrid(patientLastName);
    expect(searchResult.found).toBeTruthy();

    console.log('✅ Step 10 Complete: Patient verified in grid');
    console.log(`  → Match Found: ${searchResult.matchedName}`);
    console.log(`  → Match Type: ${searchResult.matchType}`);
  });

  // ===========================================================================
  // STEP 11: OPEN PATIENT CHART
  // ===========================================================================
  test('Step 11: Open Patient Chart', async () => {
    test.setTimeout(120000);

    console.log('📂 Opening patient chart...');

    // Click on patient in grid
    await pages.patient.getPatientFromGrid(0);

    // Wait for patient chart to load
    await sharedPage.waitForLoadState('networkidle');
    await sharedPage.waitForTimeout(2000);

    // Verify we're on patient details page
    const currentUrl = sharedPage.url();
    expect(currentUrl).toContain('patient-details');

    console.log('✅ Step 11 Complete: Patient chart opened successfully');
    console.log(`  → Current URL: ${currentUrl}`);
  });

  // ===========================================================================
  // STEP 12: FINAL SUMMARY
  // ===========================================================================
  test('Step 12: Workflow Summary', async () => {
    console.log('\n' + '='.repeat(70));
    console.log('🎉 ADMIT PATIENT WORKFLOW COMPLETED SUCCESSFULLY');
    console.log('='.repeat(70));
    console.log('Patient Details:');
    console.log(`  Name:        ${patientFirstName} ${patientLastName}`);
    console.log(`  SSN:         ${patientData.demographics.ssn}`);
    console.log(`  DOB:         ${patientData.demographics.dateOfBirth}`);
    console.log(`  Gender:      ${patientData.demographics.gender}`);
    console.log(`  Patient ID:  ${patientId || 'Not captured'}`);
    console.log(`  Care Type:   ${patientData.careType}`);
    console.log(`  Phone:       ${patientData.contactInfo.phoneNumber}`);
    console.log(`  Email:       ${patientData.contactInfo.emailAddress}`);
    console.log(`  Address:     ${patientData.address.streetAddress}, ${patientData.address.city}, ${patientData.address.state} ${patientData.address.zipCode}`);
    console.log('='.repeat(70) + '\n');
  });
});
