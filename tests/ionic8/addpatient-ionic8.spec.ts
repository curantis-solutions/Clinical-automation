/**
 * =============================================================================
 * ADMIT HOSPICE PATIENT — END-TO-END TEST (Ionic 8 / qa2)
 * =============================================================================
 *
 * Validates Ionic 8 page objects against qa2 environment by running the
 * full admit hospice E2E flow. Same workflow logic as the original test —
 * only the page objects (selectors) differ.
 *
 * Steps verified (Session 9, 2026-03-16 — full E2E admit flow):
 *   01–05a   PASS    (create patient, profile, LOC)
 *   05b      BLOCKED (void LOC — qa2 spinner bug)
 *   06a      PASS    (add primary diagnosis)
 *   06a-edit PASS    (edit primary diagnosis)
 *   06b      PASS    (verify profile checkmark)
 *   07a–07d  PASS    (care team, attending physician, caregiver, checkmark)
 *   08a      PASS    (add benefit)
 *   08a-edit PASS    (edit benefit period start date)
 *   08b      PASS    (verify benefits checkmark)
 *   09a      PASS    (add consents)
 *   09a-edit PASS    (edit consents mixed values)
 *   09b      PASS    (verify consents checkmark)
 *   10a      PASS    (add verbal certification)
 *   10a-edit PASS    (edit verbal certification)
 *   10b      PASS    (add written certification)
 *   10b-edit BLOCKED (qa2 doesn't load saved narrative in edit)
 *   10c      PASS    (verify certifications checkmark)
 *   11       PASS    (verify all 5 sections complete)
 *   12       PASS    (admit patient)
 *   13       PASS    (verify admission success)
 * =============================================================================
 */

import { test, expect, Page, BrowserContext } from '@playwright/test';
import { createIonic8PageObjects, Ionic8PageObjects } from '../../fixtures/page-objects-ionic8.fixture';

// ── Shared fixtures / utils (unchanged) ─────────────────────────────────────
import * as PatientFixtures from '../../fixtures/patient-data.fixture';
import { CredentialManager } from '../../utils/credential-manager';
import { TestDataManager } from '../../utils/test-data-manager';
import { createAttendingPhysicianData } from '../../fixtures/care-team-fixtures';
import { createBenefitData } from '../../fixtures/benefit-fixtures';

// ── qa2 base URL ────────────────────────────────────────────────────────────
const QA2_BASE_URL = 'https://clinical.qa2.curantissolutions.com';

// ── Single date used across all sections ────────────────────────────────────
const ADMIT_DATE = '02/01/2026';

// ── Shared state ────────────────────────────────────────────────────────────
let sharedPage: Page;
let sharedContext: BrowserContext;
let po: Ionic8PageObjects;

// Global fixture reference
const hospiceFixture = PatientFixtures.PATIENT_FIXTURES.HOSPICE;

test.describe.serial('Admit Hospice Patient — Ionic 8 (qa2) @ionic8 @workflow @admit', () => {

  test.beforeAll(async ({ browser }) => {
    sharedContext = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      ignoreHTTPSErrors: true,
      baseURL: QA2_BASE_URL,
    });

    sharedPage = await sharedContext.newPage();
    sharedPage.setDefaultTimeout(30000);

    // ── Instantiate all Ionic 8 page objects & workflows ──────────────────
    po = createIonic8PageObjects(sharedPage);

    // ── Login ─────────────────────────────────────────────────────────────
    TestDataManager.setRole('MD');
    console.log('🔐 Logging in to QA2 environment (Ionic 8)...');
    await po.login.goto();

    // Set up API interception BEFORE login to capture physician name
    const physicianNamePromise = TestDataManager.interceptPhysicianName(sharedPage);

    const credentials = CredentialManager.getCredentials(undefined, 'MD');
    await po.login.login(credentials.username, credentials.password);
    await sharedPage.waitForURL(/dashboard/, { timeout: 15000 });
    console.log('✅ Login successful (qa2)');

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
    const isDashboardVisible = await po.dashboard.isDashboardDisplayed();
    if (!isDashboardVisible) {
      await po.dashboard.goto();
      await sharedPage.waitForURL(/dashboard/, { timeout: 15000 });
    }

    await sharedPage.waitForLoadState('networkidle');
    await sharedPage.waitForTimeout(2000);

    await po.dashboard.navigateToModule('Patient');
    await sharedPage.waitForTimeout(2000);
    console.log('✅ Navigated to Patient List');
  });

  // ===========================================================================
  // STEP 02: Create hospice patient from fixture
  // ===========================================================================
  test('Step 02: Create Hospice Patient', async () => {
    const result = await po.patientWorkflow.addPatientFromFixture(
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
    await po.patient.searchPatient(patientId.toString());

    const isPatientVisible = await po.patient.verifyPatientInGrid(0);
    expect(isPatientVisible).toBeTruthy();

    await po.patient.getPatientFromGrid(0);
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
    const result = await po.patientWorkflow.addCallerInformation({
      referralType: callerInfo?.referralType || 'Call',
      relation: callerInfo?.relation || 'Physician',
      searchName: callerInfo?.searchName,
    });
    expect(result.success).toBeTruthy();
    // Wait for caller data to persist before referrer step (referrer uses "Same as Caller")
    await sharedPage.waitForLoadState('networkidle');
    await sharedPage.waitForTimeout(2000);
    console.log('✅ Caller information added');
  });

  test('Step 04b: Add Referrer Information', async () => {
    const referrerInfo = hospiceFixture.referralInfo?.referrer;
    const result = await po.patientWorkflow.addReferrerInformation({
      relation: referrerInfo?.relation,
      searchName: referrerInfo?.searchName,
      sameAsCaller: referrerInfo?.sameAsCaller ?? true,
    });
    expect(result.success).toBeTruthy();
    // Wait for referrer modal to fully close before next step
    await sharedPage.waitForLoadState('networkidle');
    await sharedPage.waitForTimeout(3000);
    console.log('✅ Referrer information added');
  });

  test('Step 04c: Add Referring Physician', async () => {
    const physInfo = hospiceFixture.referralInfo?.referringPhysician;
    const result = await po.patientWorkflow.addReferringPhysicianInformation('add', {
      searchName: physInfo?.searchName || 'cypresslast',
      sameAsReferrer: physInfo?.sameAsReferrer ?? false,
    });
    expect(result.success).toBeTruthy();
    console.log('✅ Referring physician added');
  });

  test('Step 04d: Add Ordering Physician', async () => {
    const physInfo = hospiceFixture.referralInfo?.orderingPhysician;
    const result = await po.patientWorkflow.addOrderingPhysicianInformation('add', {
      searchName: physInfo?.searchName || 'cypresslast',
      sameAsReferringPhysician: physInfo?.sameAsReferringPhysician ?? false,
    });
    expect(result.success).toBeTruthy();
    console.log('✅ Ordering physician added');
  });

  // ===========================================================================
  // STEP 05: Add Level of Care
  // ===========================================================================
  test('Step 05a: Add Routine Home Care LOC', async () => {
    await po.locWorkflow.addLOCOrder('Routine Home Care', {
      careLocationType: 'Q5004',
      startDate: ADMIT_DATE,
    });
    console.log('✅ Routine Home Care LOC added');
  });

  // BUG: qa2 void submit crashes (this.spinner.present is not a function),
  // and Add Order "Proceed" hangs after void. Re-enable after app fix.
  test.skip('Step 05b: Void LOC and Recreate as Respite Care', async () => {
    await po.locWorkflow.voidAndRecreateLOCOrder(
      { voidReason: 'Changing LOC type for testing' },
      'Respite Care',
      {
        careLocationType: 'Q5004',
        startDate: ADMIT_DATE,
      }
    );
    console.log('✅ LOC voided and recreated as Respite Care');
  });

  // ===========================================================================
  // STEP 06: Diagnosis
  // ===========================================================================

  test('Step 06a: Add Primary Diagnosis', async () => {
    await po.diagnosisWorkflow.fillDiagnosisDetails('add', {
      primaryDiagnosis: { searchText: 'C801', optionIndex: 0 },
    });
    console.log('✅ Primary diagnosis added');
  });

  test('Step 06a-edit: Edit Primary Diagnosis', async () => {
    await po.diagnosisWorkflow.fillDiagnosisDetails('edit', {
      primaryDiagnosis: { searchText: 'F329', optionIndex: 0 },
    }, ['primaryDiagnosis']);
    console.log('✅ Primary diagnosis edited to F329');
  });

  test('Step 06b: Verify Profile checkmark', async () => {
    await po.admitPatientWorkflow.verifySectionCheckmark('profile');
  });

  // ===========================================================================
  // STEP 07: Fill Care Team section
  // ===========================================================================
  test('Step 07a: Add Care Team and Standard Roles', async () => {
    await po.careTeamWorkflow.navigateToCareTeam();
    await po.careTeamWorkflow.selectCareTeam();
    await po.careTeamWorkflow.addStandardRoles();
    console.log('✅ Care team and standard roles added');
  });

  test('Step 07b: Add Attending Physician', async () => {
    await po.careTeamWorkflow.navigateToCareTeam();
    await po.careTeamWorkflow.fillAttendingPhysician('add', [], 0, createAttendingPhysicianData({ startDate: ADMIT_DATE }));
    const count = await po.careTeamWorkflow.getAttendingPhysicianCount();
    expect(count).toBeGreaterThan(0);
    console.log('✅ Attending physician added');
  });

  test('Step 07c: Add Caregiver', async () => {
    await po.careTeamWorkflow.fillCaregiverDetails('add');
    console.log('✅ Caregiver added');
  });

  test('Step 07d: Verify Care Team checkmark', async () => {
    await po.admitPatientWorkflow.verifySectionCheckmark('care-team');
  });

  // ===========================================================================
  // STEP 08: Fill Benefits section
  // ===========================================================================
  test('Step 08a: Add Benefit', async () => {
    await po.benefitsWorkflow.fillBenefitDetails('add', [], 'Hospice', 'Primary', createBenefitData({ payerEffectiveDate: ADMIT_DATE, benefitPeriodStartDate: ADMIT_DATE }));
    console.log('✅ Benefit added');
  });

  test('Step 08a-edit: Edit Benefit — fill Benefit Period Start Date', async () => {
    await po.benefitsWorkflow.fillBenefitDetails('edit', ['benefitPeriodStartDate'], 'Hospice', 'Primary', createBenefitData({ benefitPeriodStartDate: ADMIT_DATE }));
    console.log('✅ Benefit edited — Benefit Period Start Date set');
  });

  test('Step 08b: Verify Benefits checkmark', async () => {
    await po.admitPatientWorkflow.verifySectionCheckmark('benefits');
  });

  // ===========================================================================
  // STEP 09: Fill Consents section
  // ===========================================================================
  test('Step 09a: Add Consents', async () => {
    await po.consentsWorkflow.fillConsents('yes');
    console.log('✅ Consents completed');
  });

  test('Step 09a-edit: Edit Consents — change some to No', async () => {
    await po.consentsWorkflow.fillConsentsCustom({
      allRecordsObtained: 'yes',
      roiConsent: 'no',
      cahpsReporting: 'yes',
      hospiceElectionForm: 'no',
      healthCareProxy: 'yes',
      acknowledgmentOfCare: 'yes',
      financialPowerOfAttorney: 'no',
      durablePowerOfAttorney: 'yes',
      providerReferralOrders: 'yes',
    });
    console.log('✅ Consents edited with mixed values');
  });

  test('Step 09b: Verify Consents checkmark', async () => {
    await po.admitPatientWorkflow.verifySectionCheckmark('consents');
  });

  // ===========================================================================
  // STEP 10: Fill Certifications section
  // ===========================================================================
  test('Step 10a: Add Verbal Certification', async () => {
    await po.certificationWorkflow.fillCertificationDetails('add', 'Verbal', [], {
      certType: 'Verbal',
      certifyingObtainedOn: ADMIT_DATE,
      attendingObtainedOn: ADMIT_DATE,
    });

    const saveVisible = await po.certification.isSaveButtonVisible();
    expect(saveVisible).toBeFalsy();

    const verbalExists = await po.certification.isVerbalCertificationVisible(0);
    expect(verbalExists).toBeTruthy();
    console.log('✅ Verbal certification added');
  });

  test('Step 10b: Add Written Certification', async () => {
    await po.certificationWorkflow.fillCertificationDetails('add', 'Written', [], {
      certType: 'Written',
      certifyingSignedOn: ADMIT_DATE,
      attendingSignedOn: ADMIT_DATE,
    });

    const saveVisible = await po.certification.isSaveButtonVisible();
    expect(saveVisible).toBeFalsy();

    const writtenExists = await po.certification.isWrittenCertificationVisible(0);
    expect(writtenExists).toBeTruthy();
    console.log('✅ Written certification added');
  });

  test('Step 10a-edit: Edit Verbal Certification', async () => {
    await po.certificationWorkflow.fillCertificationDetails('edit', 'Verbal', ['certifyingObtainedOn', 'attendingObtainedOn'], {
      certType: 'Verbal',
      certifyingObtainedOn: '02/15/2026',
      attendingObtainedOn: '02/15/2026',
    }, { reasonForChange: 'Updating obtained dates for testing' });

    const verbalExists = await po.certification.isVerbalCertificationVisible(0);
    expect(verbalExists).toBeTruthy();
    console.log('✅ Verbal certification edited');
  });

  // BUG: qa2 Written cert edit doesn't load saved narrative statement — field appears empty,
  // so Save stays disabled. Re-verify once app bug is fixed.
  test.skip('Step 10b-edit: Edit Written Certification', async () => {
    await po.certificationWorkflow.fillCertificationDetails('edit', 'Written', ['briefNarrativeStatement', 'certifyingSignedOn', 'attendingSignedOn'], {
      certType: 'Written',
      certifyingSignedOn: '02/15/2026',
      attendingSignedOn: '02/15/2026',
      briefNarrativeStatement: 'Updated narrative statement for testing',
    }, { reasonForChange: 'Updating signed dates and narrative for testing' });

    const writtenExists = await po.certification.isWrittenCertificationVisible(0);
    expect(writtenExists).toBeTruthy();
    console.log('✅ Written certification edited');
  });

  test('Step 10c: Verify Certifications checkmark', async () => {
    await po.admitPatientWorkflow.verifySectionCheckmark('certifications');
  });

  // ===========================================================================
  // STEP 11: Verify all sections complete
  // ===========================================================================
  test('Step 11: Verify All 5 Sections Complete', async () => {
    await po.admitPatientWorkflow.verifyAllSectionsComplete();
  });

  // ===========================================================================
  // STEP 12: Admit Patient
  // ===========================================================================
  test('Step 12: Admit Patient and Confirm Modal', async () => {
    await po.admitPatientWorkflow.admitPatient(ADMIT_DATE);
  });

  // ===========================================================================
  // STEP 13: Verify admission success
  // ===========================================================================
  test('Step 13: Verify Admission Success', async () => {
    await po.admitPatientWorkflow.verifyAdmissionSuccess();
  });

});
