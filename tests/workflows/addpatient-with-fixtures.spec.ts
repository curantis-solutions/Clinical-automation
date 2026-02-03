/**
 * =============================================================================
 * ADD PATIENT WORKFLOW - USING FIXTURES
 * =============================================================================
 *
 * This file demonstrates how to use the reusable PatientWorkflow.addPatientFromFixture function
 * with predefined patient data fixtures.
 *
 * =============================================================================
 */

import { test, expect, Page, BrowserContext } from '@playwright/test';
import * as PatientWorkflow from './addpatient-workflow';
import * as PatientFixtures from '../../fixtures/patient-data.fixture';
import { LoginPage } from '../../pages/login.page';
import { CredentialManager } from '../../utils/credential-manager';
import { DashboardPage } from '../../pages/dashboard.page';
import { PatientPage } from 'pages_new/patient.page';
import * as patientDetailsPage from 'pages_new/patient-details.page';

let sharedPage: Page;
let sharedContext: BrowserContext;
let loginPage: LoginPage;
let dashboardPage: DashboardPage;
let patientPage: PatientPage;

let storedPatientId: number;

// Global fixture reference for easy access across all tests
const hospiceFixture = PatientFixtures.PATIENT_FIXTURES.HOSPICE;
test.describe.serial('Add Patient Workflow - Using Fixtures @workflow @fixture', () => {

  test.beforeAll(async ({ browser }) => {
    sharedContext = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      ignoreHTTPSErrors: true,
      baseURL: CredentialManager.getBaseUrl(),
    });

    sharedPage = await sharedContext.newPage();
    sharedPage.setDefaultTimeout(30000);

    // Initialize login page
    loginPage = new LoginPage(sharedPage);

    // Login once for all tests
    console.log('🔐 Logging in to QA environment...');
    await loginPage.goto();
    const credentials = CredentialManager.getCredentials(undefined, 'RN');
    await loginPage.login(credentials.username, credentials.password);
    await sharedPage.waitForURL(/dashboard/, { timeout: 15000 });
    console.log('✅ Login successful - ready for tests');
  });

  test.afterAll(async () => {
    if (sharedContext) {
      await sharedContext.close();
    }
  });

  // ===========================================================================
  // STEP 1: Navigate to Dashboard and Patient List
  // ===========================================================================
  test('Step 1: Navigate to Dashboard and Patient List', async () => {
    // Initialize dashboard page
    dashboardPage = new DashboardPage(sharedPage);

    // Ensure on dashboard
    const isDashboardVisible = await dashboardPage.isDashboardDisplayed();
    if (!isDashboardVisible) {
      await dashboardPage.goto();
      await sharedPage.waitForURL(/dashboard/, { timeout: 15000 });
    }
    console.log('✅ On Dashboard');

    // Wait for page to fully load and Rubik's cube button to be enabled
    await sharedPage.waitForLoadState('networkidle');
    await sharedPage.waitForTimeout(2000);

    // Wait for Rubik's cube button to be enabled (not disabled)
    const rubiksCubeButton = sharedPage.locator('[data-cy="btn-options-applications"]');
    await rubiksCubeButton.waitFor({ state: 'visible', timeout: 10000 });

    // Wait additional time for button to be enabled
    await sharedPage.waitForTimeout(2000);

    // Click Rubik's Cube to open module menu
    // await dashboardPage.clickRubiksCube();
    // await sharedPage.waitForTimeout(1000);

    // Navigate to Patient module
    await dashboardPage.navigateToModule('Patient');
    await sharedPage.waitForTimeout(2000);
    console.log('✅ Navigated to Patient List');
  });

  // ===========================================================================
  // EXAMPLE 1a: Add Hospice Patient
  // ===========================================================================
  test('Example 1: Add Hospice patient using fixture file data ', async () => {
    const result = await PatientWorkflow.addPatientFromFixture(
      sharedPage,
      hospiceFixture,
      {
        skipLogin: true, // Already logged in from beforeAll
      }
    );

    expect(result.success).toBeTruthy();
    expect(result.success).toBeTruthy();
    console.log(result);
    // expect(result.patientFirstName).toBe('James');
    // expect(result.patientLastName).toBe('Anderson');
    // expect(result.patientId).toBeDefined();

    console.log(`✅ Created patient: ${result.patientFirstName} ${result.patientLastName}`);
    console.log(`   Patient ID: ${result.patientId}`);

  });
    // ===========================================================================
  // EXAMPLE 1b: Access Stored Patient ID from Fixture
  // ===========================================================================
  test('Example 2d: Verify Patient ID Stored in Fixture', async () => {
    // Retrieve the patient ID that was stored in the fixture during Example 1
     let storedPatientId = PatientFixtures.getPatientIdFromFixture(hospiceFixture);

    // Verify patient ID was captured and stored
    expect(storedPatientId).toBeDefined();
    expect(storedPatientId).toBeGreaterThan(0);

    console.log('✅ Patient ID successfully retrieved from fixture');
    console.log(`   Stored Patient ID: ${storedPatientId}`);
    console.log(`   Created At: ${hospiceFixture.runtimeData?.createdAt}`);
    console.log(`   URL: ${hospiceFixture.runtimeData?.url}`);
  });

  // ===========================================================================
  // EXAMPLE 1c: Search Patient by ID and Verify
  // ===========================================================================
  test('Example 1c: Search Patient by ID', async () => {
    // Initialize patient page
    patientPage = new PatientPage(sharedPage);

    // Get patient ID from fixture
    const patientId = PatientFixtures.getPatientIdFromFixture(hospiceFixture);

    // Verify patient ID exists
    expect(patientId).toBeDefined();
    expect(patientId).toBeGreaterThan(0);

    // Ensure patientId is not undefined for TypeScript
    if (!patientId) {
      throw new Error('Patient ID is undefined');
    }

    console.log(`🔍 Searching for patient with ID: ${patientId}`);

    // Search for patient by ID
    await patientPage.searchPatient(patientId.toString());

    // Verify patient appears in search results
    const isPatientVisible = await patientPage.verifyPatientInGrid(0);
    expect(isPatientVisible).toBeTruthy();

    console.log('✅ Patient found in search results');
    console.log(`   Patient ID searched: ${patientId}`);

    // Get patient chart ID to verify it matches
    const chartId = await patientPage.getPatientChartId();
    console.log(`   Patient chart ID from grid: ${chartId}`);

    // Click on the patient to open patient details page
    await patientPage.getPatientFromGrid(0);
    await sharedPage.waitForLoadState('networkidle');
    await sharedPage.waitForTimeout(2000);

    // Verify we're on patient details page
    const currentUrl = sharedPage.url();
    expect(currentUrl).toContain('patient-details');
    console.log('✅ Patient details page loaded successfully');
    console.log(`   Current URL: ${currentUrl}`);
  });

  // ===========================================================================
  // EXAMPLE 2: Add Caller Information to Patient
  // ===========================================================================
  test('Example 2: Add Caller Information - From Fixture', async () => {
    // Get caller information from fixture
    const callerInfo = hospiceFixture.referralInfo?.caller;

    // Add caller information using fixture data
    const callerResult = await PatientWorkflow.addCallerInformation(sharedPage, {
      referralType: callerInfo?.referralType || 'Call',
      relation: callerInfo?.relation || 'Physician',
      // searchName: callerInfo?.searchName || 'cypresslast',
      searchName: callerInfo?.searchName,
    });

    expect(callerResult.success).toBeTruthy();
    console.log('✅ Caller information added successfully');
    console.log(`   Using search name from fixture: ${callerInfo?.searchName}`);
  });

  // ===========================================================================
  // EXAMPLE 2a: Add Referrer Information
  // ===========================================================================
  test('Example 2a: Add Referrer Information - From Fixture', async () => {
    // Get referrer information from fixture
    const referrerInfo = hospiceFixture.referralInfo?.referrer;

    // Add referrer information using fixture data
    const referrerResult = await PatientWorkflow.addReferrerInformation(sharedPage, {
      relation: referrerInfo?.relation,
      searchName: referrerInfo?.searchName,
      sameAsCaller: referrerInfo?.sameAsCaller ?? true,
    });

    expect(referrerResult.success).toBeTruthy();
    console.log('✅ Referrer information added successfully');
    console.log(`   Same as Caller: ${referrerInfo?.sameAsCaller}`);
  });

  // ===========================================================================
  // EXAMPLE 2b: Add Referring Physician Information
  // ===========================================================================
  test('Example 2b: Add Referring Physician - From Fixture', async () => {
    // Get referring physician information from fixture
    const referringPhysicianInfo = hospiceFixture.referralInfo?.referringPhysician;

    // Add referring physician using fixture data
    const referringPhysicianResult = await PatientWorkflow.addReferringPhysicianInformation(sharedPage, {
      searchName: referringPhysicianInfo?.searchName,
      sameAsReferrer: referringPhysicianInfo?.sameAsReferrer,
    });

    expect(referringPhysicianResult.success).toBeTruthy();
    console.log('✅ Referring physician information added successfully');
    console.log(`   Same as Referrer: ${referringPhysicianInfo?.sameAsReferrer}`);
  });

  // ===========================================================================
  // EXAMPLE 2c: Add Ordering Physician Information
  // ===========================================================================
  test('Example 2c: Add Ordering Physician - From Fixture', async () => {
    // Get ordering physician information from fixture
    const orderingPhysicianInfo = hospiceFixture.referralInfo?.orderingPhysician;

    // Add ordering physician using fixture data
    const orderingPhysicianResult = await PatientWorkflow.addOrderingPhysicianInformation(sharedPage, {
      searchName: orderingPhysicianInfo?.searchName,
      sameAsReferringPhysician: orderingPhysicianInfo?.sameAsReferringPhysician,
    });

    expect(orderingPhysicianResult.success).toBeTruthy();
    console.log('✅ Ordering physician information added successfully');
    console.log(`   Same as Referring Physician: ${orderingPhysicianInfo?.sameAsReferringPhysician}`);
  });


  // ===========================================================================
  // EXAMPLE 3: Add Hospice Female Non-Veteran Patient
  // ===========================================================================
  test.skip('Example 3: Add Hospice Female Non-Veteran from Fixture', async () => {
    const result = await PatientWorkflow.addPatientFromFixture(
      sharedPage,
      PatientFixtures.PATIENT_FIXTURES.HOSPICE_FEMALE_NON_VETERAN,
      {
        skipLogin: true, // Already logged in from previous test
      }
    );

    expect(result.success).toBeTruthy();
    expect(result.patientFirstName).toBe('Mary');
    expect(result.patientLastName).toBe('Thompson');

    console.log(`✅ Created patient: ${result.patientFirstName} ${result.patientLastName}`);
  });

  // ===========================================================================
  // EXAMPLE 3: Add Palliative Female Single Patient
  // ===========================================================================
  test.skip('Example 3: Add Palliative Female Single from Fixture', async () => {
    const result = await PatientWorkflow.addPatientFromFixture(
      sharedPage,
      PatientFixtures.PATIENT_FIXTURES.PALLIATIVE_FEMALE_SINGLE,
      {
        skipLogin: true,
      }
    );

    expect(result.success).toBeTruthy();
    expect(result.patientFirstName).toBe('Sarah');
    expect(result.patientLastName).toBe('Johnson');

    console.log(`✅ Created Palliative patient: ${result.patientFirstName} ${result.patientLastName}`);
  });

  // ===========================================================================
  // EXAMPLE 4: Add Evaluation Male Veteran Patient
  // ===========================================================================
  test.skip('Example 4: Add Evaluation Male Veteran from Fixture', async () => {
    const result = await PatientWorkflow.addPatientFromFixture(
      sharedPage,
      PatientFixtures.PATIENT_FIXTURES.EVALUATION_MALE_VETERAN,
      {
        skipLogin: true,
      }
    );

    expect(result.success).toBeTruthy();
    expect(result.patientFirstName).toBe('William');
    expect(result.patientLastName).toBe('Brown');

    console.log(`✅ Created Evaluation patient: ${result.patientFirstName} ${result.patientLastName}`);
  });

  // ===========================================================================
  // EXAMPLE 5: Add Hospice Patient with Skilled Bed
  // ===========================================================================
  test.skip('Example 5: Add Hospice Patient with Skilled Bed from Fixture', async () => {
    const result = await PatientWorkflow.addPatientFromFixture(
      sharedPage,
      PatientFixtures.PATIENT_FIXTURES.HOSPICE_MALE_SKILLED_BED,
      {
        skipLogin: true,
        returnToPatientList: true, // Return to patient list after creation
      }
    );

    expect(result.success).toBeTruthy();
    expect(result.patientFirstName).toBe('Robert');
    expect(result.patientLastName).toBe('Martinez');

    console.log(`✅ Created Hospice patient with skilled bed: ${result.patientFirstName} ${result.patientLastName}`);
  });

  // ===========================================================================
  // EXAMPLE 6: Add Patient with Minimal Data (Auto-generated names)
  // ===========================================================================
  test.skip('Example 6: Add Patient with Minimal Data from Fixture', async () => {
    const result = await PatientWorkflow.addPatientFromFixture(
      sharedPage,
      PatientFixtures.PATIENT_FIXTURES.HOSPICE_MINIMAL_MALE,
      {
        skipLogin: true,
      }
    );

    expect(result.success).toBeTruthy();
    expect(result.patientFirstName).toBeTruthy(); // Auto-generated name
    expect(result.patientLastName).toBeTruthy(); // Auto-generated name

    console.log(`✅ Created patient with auto-generated name: ${result.patientFirstName} ${result.patientLastName}`);
  });

  // ===========================================================================
  // EXAMPLE 7: Add All Hospice Patients from Fixtures
  // ===========================================================================
  test.skip('Example 7: Add All Hospice Patients from Fixtures', async () => {
    const hospiceFixtures = PatientFixtures.getHospiceFixtures();
    const results: PatientWorkflow.PatientWorkflowResult[] = [];

    for (const fixture of hospiceFixtures) {
      const result = await PatientWorkflow.addPatientFromFixture(sharedPage, fixture, {
        skipLogin: true,
        returnToPatientList: true,
      });

      expect(result.success).toBeTruthy();
      results.push(result);
    }

    console.log(`\n✅ Successfully created ${results.length} Hospice patients:`);
    results.forEach((result, index) => {
      console.log(`   ${index + 1}. ${result.patientFirstName} ${result.patientLastName} (ID: ${result.patientId})`);
    });
  });

  // ===========================================================================
  // EXAMPLE 8: Add All Palliative Patients from Fixtures
  // ===========================================================================
  test.skip('Example 8: Add All Palliative Patients from Fixtures', async () => {
    const palliativeFixtures = PatientFixtures.getPalliativeFixtures();
    const results: PatientWorkflow.PatientWorkflowResult[] = [];

    for (const fixture of palliativeFixtures) {
      const result = await PatientWorkflow.addPatientFromFixture(sharedPage, fixture, {
        skipLogin: true,
        returnToPatientList: true,
      });

      expect(result.success).toBeTruthy();
      results.push(result);
    }

    console.log(`\n✅ Successfully created ${results.length} Palliative patients:`);
    results.forEach((result, index) => {
      console.log(`   ${index + 1}. ${result.patientFirstName} ${result.patientLastName} (ID: ${result.patientId})`);
    });
  });

  // ===========================================================================
  // EXAMPLE 9: Add All Evaluation Patients from Fixtures
  // ===========================================================================
  test.skip('Example 9: Add All Evaluation Patients from Fixtures', async () => {
    const evaluationFixtures = PatientFixtures.getEvaluationFixtures();
    const results: PatientWorkflow.PatientWorkflowResult[] = [];

    for (const fixture of evaluationFixtures) {
      const result = await PatientWorkflow.addPatientFromFixture(sharedPage, fixture, {
        skipLogin: true,
        returnToPatientList: true,
      });

      expect(result.success).toBeTruthy();
      results.push(result);
    }

    console.log(`\n✅ Successfully created ${results.length} Evaluation patients:`);
    results.forEach((result, index) => {
      console.log(`   ${index + 1}. ${result.patientFirstName} ${result.patientLastName} (ID: ${result.patientId})`);
    });
  });

  // ===========================================================================
  // EXAMPLE 10: Add Random Patient from Fixtures
  // ===========================================================================
  test.skip('Example 10: Add Random Patient from Fixtures', async () => {
    const randomFixture = PatientFixtures.getRandomPatientFixture();

    const result = await PatientWorkflow.addPatientFromFixture(sharedPage, randomFixture, {
      skipLogin: true,
    });

    expect(result.success).toBeTruthy();

    console.log(`\n✅ Created random patient from fixture: ${randomFixture.fixtureName}`);
    console.log(`   Name: ${result.patientFirstName} ${result.patientLastName}`);
    console.log(`   Care Type: ${randomFixture.careType}`);
    console.log(`   Patient ID: ${result.patientId}`);
  });
});
