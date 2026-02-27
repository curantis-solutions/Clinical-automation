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

import { test, expect, createPageObjectsForPage, type PageObjects } from '@fixtures/page-objects.fixture';
import { Page, BrowserContext } from '@playwright/test';
import * as PatientFixtures from '../../fixtures/patient-data.fixture';
import { CredentialManager } from '../../utils/credential-manager';
import { TestDataManager } from '../../utils/test-data-manager';

let sharedPage: Page;
let sharedContext: BrowserContext;
let pages: PageObjects;

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

    // Create page objects using the factory
    pages = createPageObjectsForPage(sharedPage);

    // Login once for all tests
    TestDataManager.setRole('RN');
    console.log('🔐 Logging in to QA environment...');
    await pages.login.goto();

    // Set up API interception BEFORE login to capture physician name
    const physicianNamePromise = TestDataManager.interceptPhysicianName(sharedPage);

    const credentials = CredentialManager.getCredentials(undefined, 'RN');
    await pages.login.login(credentials.username, credentials.password);
    await sharedPage.waitForURL(/dashboard/, { timeout: 15000 });
    console.log('✅ Login successful - ready for tests');

    // Resolve the intercepted physician name (stored automatically in TestDataManager)
    await physicianNamePromise;
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
    // Ensure on dashboard
    const isDashboardVisible = await pages.dashboard.isDashboardDisplayed();
    if (!isDashboardVisible) {
      await pages.dashboard.goto();
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
    // await pages.dashboard.clickRubiksCube();
    // await sharedPage.waitForTimeout(1000);

    // Navigate to Patient module
    await pages.dashboard.navigateToModule('Patient');
    await sharedPage.waitForTimeout(2000);
    console.log('✅ Navigated to Patient List');
  });

  // ===========================================================================
  // EXAMPLE 1a: Add Hospice Patient
  // ===========================================================================
  test('Example 1: Add Hospice patient using fixture file data ', async () => {
    const result = await pages.patientWorkflow.addPatientFromFixture(
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
    await pages.patient.searchPatient(patientId.toString());

    // Verify patient appears in search results
    const isPatientVisible = await pages.patient.verifyPatientInGrid(0);
    expect(isPatientVisible).toBeTruthy();

    console.log('✅ Patient found in search results');
    console.log(`   Patient ID searched: ${patientId}`);

    // Get patient chart ID to verify it matches
    const chartId = await pages.patient.getPatientChartId();
    console.log(`   Patient chart ID from grid: ${chartId}`);

    // Click on the patient to open patient details page
    await pages.patient.getPatientFromGrid(0);
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
    const callerResult = await pages.patientWorkflow.addCallerInformation({
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
    const referrerResult = await pages.patientWorkflow.addReferrerInformation({
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
    const referringPhysicianResult = await pages.patientWorkflow.addReferringPhysicianInformation(
      'add',
      {
        searchName: referringPhysicianInfo?.searchName,
        sameAsReferrer: referringPhysicianInfo?.sameAsReferrer,
      }
    );

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
    const orderingPhysicianResult = await pages.patientWorkflow.addOrderingPhysicianInformation('add', {
      searchName: orderingPhysicianInfo?.searchName,
      sameAsReferringPhysician: orderingPhysicianInfo?.sameAsReferringPhysician,
    });

    expect(orderingPhysicianResult.success).toBeTruthy();
    console.log('✅ Ordering physician information added successfully');
    console.log(`   Same as Referring Physician: ${orderingPhysicianInfo?.sameAsReferringPhysician}`);
  });
   // ===========================================================================
  // STEP 3: Navigate to Care Team and Add Care Team / attending physician / caregiver
  // ===========================================================================
  test('Step 3: Navigate to Care Team and Add Team', async () => {
    console.log('🏥 Navigating to Care Team section...');

    // Navigate to Care Team tab
    await pages.careTeamWorkflow.navigateToCareTeam();

    // Select care team (uses fixture data or environment default)
    await pages.careTeamWorkflow.selectCareTeam();
    console.log('✅ Care team selected');

    // Add standard roles (Social Worker, Spiritual Advisor, RN, Medical Director)
    await pages.careTeamWorkflow.addStandardRoles();
    console.log('✅ Standard care team roles added');

    console.log('✅ Care Team setup completed successfully');
  });

  // ===========================================================================
  // STEP 3.a: Add Attending Physician
  // ===========================================================================
  test('Step 3.a: Add Attending Physician', async () => {
    console.log('👨‍⚕️ Adding Attending Physician...');

    // Add attending physician using fixture data
    await pages.careTeamWorkflow.fillAttendingPhysician('add');

    // Verify physician was added
    const physicianCount = await pages.careTeamWorkflow.getAttendingPhysicianCount();
    expect(physicianCount).toBeGreaterThan(0);

    console.log('✅ Attending Physician added successfully');
    console.log(`   Total physicians: ${physicianCount}`);
  });

  // ===========================================================================
  // STEP 3.b: Add Caregiver
  // ===========================================================================
  test('Step 3.b: Add Caregiver', async () => {
    console.log('👪 Adding Caregiver...');

    // Add caregiver using fixture data
    await pages.careTeamWorkflow.fillCaregiverDetails('add');

    console.log('✅ Caregiver added successfully');
  
  });
// ===========================================================================
// STEP 4: Navigate to Benefits and Add Benefit
// ===========================================================================  

   test("Step 4: Navigate to Benefits and add benefit", async () => {
      // Use the workflow to add benefit
      // Data is read from BENEFIT_FORM_DATA in fixtures/benefit-fixtures.ts
      await pages.benefitsWorkflow.fillBenefitDetails("add");
  
      console.log("Benefit added successfully");
    });


     // ===========================================================================
      // STEP 5: Add or Edit Consents 
      // ===========================================================================
      test('Step 5: Navigate to Consents and Add/Edit Form', async () => {
        // Use the consents workflow - it auto-detects add vs edit mode
        await pages.consentsWorkflow.fillConsents('yes');

        console.log('Consents workflow completed successfully');
      });

  // ===========================================================================
  // STEP 6: Add Verbal Certification
  // ===========================================================================
  test('Step 6a: Add Verbal Certification', async () => {
    await pages.certificationWorkflow.fillCertificationDetails('add', 'Verbal');

    // Verify: form should be closed (save button gone)
    const saveVisible = await pages.certification.isSaveButtonVisible();
    expect(saveVisible).toBeFalsy();

    // Verify: a Verbal certification record exists in the grid
    const verbalExists = await pages.certification.isVerbalCertificationVisible(0);
    expect(verbalExists).toBeTruthy();

    console.log('Verbal certification added and verified in grid');
  });

  // ===========================================================================
  // STEP 6: Add Written Certification
  // ===========================================================================
  test('Step 6b: Add Written Certification', async () => {
    await pages.certificationWorkflow.fillCertificationDetails('add', 'Written', [], {
      certType: 'Written',
      certifyingSignedOn: '01/01/2026',
      attendingSignedOn: '01/01/2026',
    });

    // Verify: form should be closed (save button gone)
    const saveVisible = await pages.certification.isSaveButtonVisible();
    expect(saveVisible).toBeFalsy();

    // Verify: a Written certification record exists in the grid
    const writtenExists = await pages.certification.isWrittenCertificationVisible(0);
    expect(writtenExists).toBeTruthy();

    console.log('Written certification added and verified in grid');
  });

    // ===========================================================================
    // STEP 7: Add Routine Home Care LOC with Q5004 care location
    // ===========================================================================
    test('Step 7a: Add Routine Home Care LOC (Q5004, 02/01/2026)', async () => {
      await pages.locWorkflow.addLOCOrder('Routine Home Care', {
        careLocationType: 'Q5004',
        startDate: '02/01/2026',
      });
      console.log('Added Routine Home Care LOC with Q5004 care location');
    });

    // ===========================================================================
      // STEP 7: Void existing LOC and create Respite Care replacement
      // ===========================================================================
      test('Step 7b: Void and create Respite Care (02/01/2026)', async () => {
        await pages.locWorkflow.voidAndRecreateLOCOrder(
          { voidReason: 'Switching to Respite Care' },
          'Respite Care',
          { startDate: '02/01/2026' }
        );
        console.log('Voided existing LOC and created Respite Care replacement');
      
      });



});
