/**
 * =============================================================================
 * ADMIT HOSPICE PATIENT — END-TO-END TEST (Fixtures)
 * =============================================================================
 *
 * Creates a new hospice patient, fills all 5 required sections
 * (Profile, Care Team, Benefits, Consents, Certifications),
 * verifies each section's sidebar checkmark, then admits the patient.
 *
 * Reuses all existing workflows — no section logic is duplicated here.
 * =============================================================================
 */

import { test, expect, createPageObjectsForPage, type PageObjects } from '@fixtures/page-objects.fixture';
import { Page, BrowserContext } from '@playwright/test';
import * as PatientFixtures from '../../fixtures/patient-data.fixture';
import { CredentialManager } from '../../utils/credential-manager';
import { TestDataManager } from '../../utils/test-data-manager';
import { createAttendingPhysicianData } from '../../fixtures/care-team-fixtures';
import { createBenefitData } from '../../fixtures/benefit-fixtures';

let sharedPage: Page;
let sharedContext: BrowserContext;
let pages: PageObjects;

// Global fixture reference for easy access across all tests
const hospiceFixture = PatientFixtures.PATIENT_FIXTURES.HOSPICE;

// Single date used across all sections — change here to shift everything
const ADMIT_DATE = '02/01/2026';

test.describe.serial('Admit Hospice Patient — E2E @workflow @admit', () => {

  test.beforeAll(async ({ browser }) => {
    sharedContext = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      ignoreHTTPSErrors: true,
      baseURL: CredentialManager.getBaseUrl(),
    });

    sharedPage = await sharedContext.newPage();
    sharedPage.setDefaultTimeout(30000);

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
    console.log('✅ Login successful');

    await physicianNamePromise;
  });

  test.afterAll(async () => {
    if (sharedContext) {
      await sharedContext.close();
    }
  });

  // ===========================================================================
  // STEP 01: Navigate to Patient module
  // ===========================================================================
  test('Step 01: Navigate to Patient List', async () => {
    const isDashboardVisible = await pages.dashboard.isDashboardDisplayed();
    if (!isDashboardVisible) {
      await pages.dashboard.goto();
      await sharedPage.waitForURL(/dashboard/, { timeout: 15000 });
    }

    await sharedPage.waitForLoadState('networkidle');
    await sharedPage.waitForTimeout(2000);

    await pages.dashboard.navigateToModule('Patient');
    await sharedPage.waitForTimeout(2000);
    console.log('✅ Navigated to Patient List');
  });

  // ===========================================================================
  // STEP 02: Create hospice patient from fixture
  // ===========================================================================
  test('Step 02: Create Hospice Patient', async () => {
    const result = await pages.patientWorkflow.addPatientFromFixture(
      hospiceFixture,
      { skipLogin: true }
    );

    expect(result.success).toBeTruthy();
    console.log(`✅ Created patient: ${result.patientFirstName} ${result.patientLastName} (ID: ${result.patientId})`);
  });

  // ===========================================================================
  // STEP 03: Search and open patient chart
  // ===========================================================================
  test('Step 03: Search and Open Patient Chart', async () => {
    const patientId = PatientFixtures.getPatientIdFromFixture(hospiceFixture);
    expect(patientId).toBeDefined();
    expect(patientId).toBeGreaterThan(0);

    if (!patientId) throw new Error('Patient ID is undefined');

    console.log(`🔍 Searching for patient ID: ${patientId}`);
    await pages.patient.searchPatient(patientId.toString());

    const isPatientVisible = await pages.patient.verifyPatientInGrid(0);
    expect(isPatientVisible).toBeTruthy();

    await pages.patient.getPatientFromGrid(0);
    await sharedPage.waitForLoadState('networkidle');
    await sharedPage.waitForTimeout(2000);

    const currentUrl = sharedPage.url();
    expect(currentUrl).toContain('patient-details');
    console.log('✅ Patient chart opened');
  });

  // ===========================================================================
  // STEP 04: Fill Profile section (Caller, Referrer, Referring & Ordering Physician)
  // ===========================================================================
  test('Step 04a: Add Caller Information', async () => {
    const callerInfo = hospiceFixture.referralInfo?.caller;
    const result = await pages.patientWorkflow.addCallerInformation({
      referralType: callerInfo?.referralType || 'Call',
      relation: callerInfo?.relation || 'Physician',
      searchName: callerInfo?.searchName,
    });
    expect(result.success).toBeTruthy();
    console.log('✅ Caller information added');
  });

  test('Step 04b: Add Referrer Information', async () => {
    const referrerInfo = hospiceFixture.referralInfo?.referrer;
    const result = await pages.patientWorkflow.addReferrerInformation({
      relation: referrerInfo?.relation,
      searchName: referrerInfo?.searchName,
      sameAsCaller: referrerInfo?.sameAsCaller ?? true,
    });
    expect(result.success).toBeTruthy();
    console.log('✅ Referrer information added');
  });

  test('Step 04c: Add Referring Physician', async () => {
    const info = hospiceFixture.referralInfo?.referringPhysician;
    const result = await pages.patientWorkflow.addReferringPhysicianInformation('add', {
      searchName: info?.searchName,
      sameAsReferrer: info?.sameAsReferrer,
    });
    expect(result.success).toBeTruthy();
    console.log('✅ Referring physician added');
  });

  test('Step 04d: Add Ordering Physician', async () => {
    const info = hospiceFixture.referralInfo?.orderingPhysician;
    const result = await pages.patientWorkflow.addOrderingPhysicianInformation('add', {
      searchName: info?.searchName,
      sameAsReferringPhysician: info?.sameAsReferringPhysician,
    });
    expect(result.success).toBeTruthy();
    console.log('✅ Ordering physician added');
  });

  // ===========================================================================
  // STEP 05: Add LOC
  // ===========================================================================
  test('Step 05: Add Routine Home Care LOC', async () => {
    await pages.locWorkflow.addLOCOrder('Routine Home Care', {
      careLocationType: 'Q5004',
      startDate: ADMIT_DATE,
    });
    console.log('✅ Routine Home Care LOC added');
  });

  // ===========================================================================
  // STEP 06: Add Diagnosis + Verify Profile checkmark
  // ===========================================================================
  test('Step 06a: Add Primary Diagnosis', async () => {
    await pages.diagnosisWorkflow.fillDiagnosisDetails('add', {
      primaryDiagnosis: { searchText: 'C801', optionIndex: 0 },
    });
    console.log('✅ Primary diagnosis added');
  });

  test('Step 06b: Verify Profile checkmark', async () => {
    await pages.admitPatientWorkflow.verifySectionCheckmark('profile');
  });

  // ===========================================================================
  // STEP 07: Fill Care Team section
  // ===========================================================================
  test('Step 07a: Add Care Team and Standard Roles', async () => {
    await pages.careTeamWorkflow.navigateToCareTeam();
    await pages.careTeamWorkflow.selectCareTeam();
    await pages.careTeamWorkflow.addStandardRoles();
    console.log('✅ Care team and standard roles added');
  });

  test('Step 07b: Add Attending Physician', async () => {
    await pages.careTeamWorkflow.fillAttendingPhysician('add', [], 0, createAttendingPhysicianData({ startDate: ADMIT_DATE }));
    const count = await pages.careTeamWorkflow.getAttendingPhysicianCount();
    expect(count).toBeGreaterThan(0);
    console.log('✅ Attending physician added');
  });

  test('Step 07c: Add Caregiver', async () => {
    await pages.careTeamWorkflow.fillCaregiverDetails('add');
    console.log('✅ Caregiver added');
  });

  test('Step 07d: Verify Care Team checkmark', async () => {
    await pages.admitPatientWorkflow.verifySectionCheckmark('care-team');
  });

  // ===========================================================================
  // STEP 08: Fill Benefits section
  // ===========================================================================
  test('Step 08a: Add Benefit', async () => {
    await pages.benefitsWorkflow.fillBenefitDetails('add', [], 'Hospice', 'Primary', createBenefitData({ payerEffectiveDate: ADMIT_DATE, benefitPeriodStartDate: ADMIT_DATE }));
    console.log('✅ Benefit added');
  });

  test('Step 08b: Verify Benefits checkmark', async () => {
    await pages.admitPatientWorkflow.verifySectionCheckmark('benefits');
  });

  // ===========================================================================
  // STEP 09: Fill Consents section
  // ===========================================================================
  test('Step 09a: Add Consents', async () => {
    await pages.consentsWorkflow.fillConsents('yes');
    console.log('✅ Consents completed');
  });

  test('Step 09b: Verify Consents checkmark', async () => {
    await pages.admitPatientWorkflow.verifySectionCheckmark('consents');
  });

  // ===========================================================================
  // STEP 10: Fill Certifications section
  // ===========================================================================
  test('Step 10a: Add Verbal Certification', async () => {
    await pages.certificationWorkflow.fillCertificationDetails('add', 'Verbal', [], {
      certType: 'Verbal',
      certifyingObtainedOn: ADMIT_DATE,
      attendingObtainedOn: ADMIT_DATE,
    });

    const saveVisible = await pages.certification.isSaveButtonVisible();
    expect(saveVisible).toBeFalsy();

    const verbalExists = await pages.certification.isVerbalCertificationVisible(0);
    expect(verbalExists).toBeTruthy();
    console.log('✅ Verbal certification added');
  });

  test('Step 10b: Add Written Certification', async () => {
    await pages.certificationWorkflow.fillCertificationDetails('add', 'Written', [], {
      certType: 'Written',
      certifyingSignedOn: ADMIT_DATE,
      attendingSignedOn: ADMIT_DATE,
    });

    const saveVisible = await pages.certification.isSaveButtonVisible();
    expect(saveVisible).toBeFalsy();

    const writtenExists = await pages.certification.isWrittenCertificationVisible(0);
    expect(writtenExists).toBeTruthy();
    console.log('✅ Written certification added');
  });

  test('Step 10c: Verify Certifications checkmark', async () => {
    await pages.admitPatientWorkflow.verifySectionCheckmark('certifications');
  });

  // ===========================================================================
  // STEP 11: Verify all sections complete
  // ===========================================================================
  test('Step 11: Verify All 5 Sections Complete', async () => {
    await pages.admitPatientWorkflow.verifyAllSectionsComplete();
  });

  // ===========================================================================
  // STEP 12: Admit Patient
  // ===========================================================================
  test('Step 12: Admit Patient and Confirm Modal', async () => {
    await pages.admitPatientWorkflow.admitPatient(ADMIT_DATE);
  });

  // ===========================================================================
  // STEP 13: Verify admission success
  // ===========================================================================
  test('Step 13: Verify Admission Success', async () => {
    await pages.admitPatientWorkflow.verifyAdmissionSuccess();
  });

  // ===========================================================================
  // STEP 14: Store patient ID for subsequent order test suites
  // ===========================================================================
  test('Step 14: Save patient ID for order tests', async () => {
    const patientId = PatientFixtures.getPatientIdFromFixture(hospiceFixture);
    expect(patientId).toBeDefined();
    expect(patientId).toBeGreaterThan(0);

    TestDataManager.setOrdersPatientId(patientId!);
    console.log(`✅ Patient ID ${patientId} saved — all order tests will use this patient`);
  });

});
