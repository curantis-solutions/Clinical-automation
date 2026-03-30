/**
 * =============================================================================
 * Reprocessing Hospice Medicare — Claim error fix and reprocessing flow
 * =============================================================================
 *
 * MODULE: Billing
 * SCENARIO: Create patient with deliberate gaps (no Written cert, no plan address)
 *           → admit → verify claims land in Review with errors →
 *           fix errors (add cert + plan address + Notice Accepted Date) →
 *           verify reprocessing reduces errors → verify Notice moves to Ready
 *
 * DELIBERATE GAPS:
 *   - Certifications: only Verbal (skip Written) → error on hospice claim
 *   - Benefits: skip plan address → error on 812 + notice claim
 *   - After admission: NOE not submitted + Missing Notice Accepted Date
 *
 * RUN:
 *   npx playwright test tests/billing/reprocessing-hospice-medicare.spec.ts --headed --workers=1
 * =============================================================================
 */

import { test, expect, createPageObjectsForPage, type PageObjects } from '../../fixtures/page-objects.fixture';
import { Page, BrowserContext } from '@playwright/test';
import * as PatientFixtures from '../../fixtures/patient-data.fixture';
import { CredentialManager } from '../../utils/credential-manager';
import { TestDataManager } from '../../utils/test-data-manager';
import { TIMEOUTS, TEST_TIMEOUTS, VIEWPORTS } from '../../config/timeouts';
import { createAttendingPhysicianData } from '../../fixtures/care-team-fixtures';
import { createBenefitData } from '../../fixtures/benefit-fixtures';
import { DateHelper } from '../../utils/date-helper';

let sharedPage: Page;
let sharedContext: BrowserContext;
let pages: PageObjects;

// Captured from the test flow — used for NOE verification (no hardcoding)
let capturedPatientName = '';
let capturedPayerName = '';

const hospiceFixture = PatientFixtures.PATIENT_FIXTURES.HOSPICE;
const ADMIT_DATE = DateHelper.getDateOfMonth();

test.describe.serial('Reprocessing Hospice Medicare', () => {

  test.beforeAll(async ({ browser }) => {
    sharedContext = await browser.newContext({
      viewport: VIEWPORTS.desktop,
      ignoreHTTPSErrors: true,
      baseURL: CredentialManager.getBaseUrl(),
    });
    sharedPage = await sharedContext.newPage();
    sharedPage.setDefaultTimeout(TIMEOUTS.API);
    sharedPage.setDefaultNavigationTimeout(TIMEOUTS.API);
    pages = createPageObjectsForPage(sharedPage);

    TestDataManager.setRole('MD');
  });

  test.afterAll(async () => {
    if (sharedContext) await sharedContext.close();
  });

  // ===========================================================================
  // STEP 01: Login
  // ===========================================================================
  test('Step 01: Login as MD', async () => {
    test.setTimeout(TEST_TIMEOUTS.STANDARD);
    await pages.login.goto();
    const physicianNamePromise = TestDataManager.interceptPhysicianName(sharedPage);
    const credentials = CredentialManager.getCredentials(undefined, 'MD');
    await pages.login.login(credentials.username, credentials.password);
    await sharedPage.waitForURL(/dashboard/, { timeout: TIMEOUTS.API });
    expect(sharedPage.url()).toContain('dashboard');
    await physicianNamePromise;
    console.log('✅ Step 01: Logged in as MD');
  });

  // ===========================================================================
  // STEP 02: Navigate to Patients and create a new hospice patient
  // ===========================================================================
  test('Step 02: Create Hospice Patient', async () => {
    test.setTimeout(TEST_TIMEOUTS.LONG);
    const isDashboardVisible = await pages.dashboard.isDashboardDisplayed();
    if (!isDashboardVisible) {
      await pages.dashboard.goto();
      await sharedPage.waitForURL(/dashboard/, { timeout: TIMEOUTS.API });
    }
    await sharedPage.waitForLoadState('networkidle');
    await sharedPage.waitForTimeout(2000);
    await pages.dashboard.navigateToModule('Patient');
    await sharedPage.waitForTimeout(2000);

    const result = await pages.patientWorkflow.addPatientFromFixture(hospiceFixture, { skipLogin: true });
    expect(result.success).toBeTruthy();
    console.log(`✅ Step 02: Created patient ${result.patientFirstName} ${result.patientLastName} (ID: ${result.patientId})`);
  });

  // ===========================================================================
  // STEP 03: Search and open patient chart
  // ===========================================================================
  test('Step 03: Search and Open Patient Chart', async () => {
    test.setTimeout(TEST_TIMEOUTS.STANDARD);
    const patientId = PatientFixtures.getPatientIdFromFixture(hospiceFixture);
    expect(patientId).toBeDefined();
    if (!patientId) throw new Error('Patient ID is undefined');

    await pages.patient.searchPatient(patientId.toString());
    const isPatientVisible = await pages.patient.verifyPatientInGrid(0);
    expect(isPatientVisible).toBeTruthy();

    await pages.patient.getPatientFromGrid(0);
    await sharedPage.waitForLoadState('networkidle');
    await sharedPage.waitForTimeout(2000);
    expect(sharedPage.url()).toContain('patient-details');

    // Capture patient name from profile — used for NOE verification later
    capturedPatientName = await pages.patientDetails.getPatientBillingName();
    console.log(`✅ Step 03: Patient chart opened — name: ${capturedPatientName}`);
  });

  // ===========================================================================
  // STEP 04: Fill Profile section (Caller, Referrer, Physicians)
  // ===========================================================================
  test('Step 04a: Add Caller Information', async () => {
    const result = await pages.patientWorkflow.addCallerInformation({
      referralType: 'Call',
      relation: 'Physician',
    });
    expect(result.success).toBeTruthy();
    console.log('✅ Caller information added');
  });

  test('Step 04b: Add Referrer Information', async () => {
    const result = await pages.patientWorkflow.addReferrerInformation({
      sameAsCaller: true,
    });
    expect(result.success).toBeTruthy();
    console.log('✅ Referrer information added');
  });

  test('Step 04c: Add Referring Physician', async () => {
    const result = await pages.patientWorkflow.addReferringPhysicianInformation('add', {
      sameAsReferrer: true,
    });
    expect(result.success).toBeTruthy();
    console.log('✅ Referring physician added');
  });

  test('Step 04d: Add Ordering Physician', async () => {
    const result = await pages.patientWorkflow.addOrderingPhysicianInformation('add', {
      sameAsReferringPhysician: true,
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
    await pages.careTeamWorkflow.fillAttendingPhysician('add', [], 0,
      createAttendingPhysicianData({ startDate: ADMIT_DATE }));
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
  // STEP 08: Fill Benefits — DELIBERATELY SKIP PLAN ADDRESS
  // ===========================================================================
  test('Step 08a: Add Benefit (no plan address)', async () => {
    await pages.benefitsWorkflow.fillBenefitDetails('add', [], 'Hospice', 'Primary',
      createBenefitData({
        payerEffectiveDate: ADMIT_DATE,
        benefitPeriodStartDate: ADMIT_DATE,
        // Skip Plan Name selection → plan address never auto-populates → error on 812 + notice claim
        planNameIndex: undefined,
      }));
    // Capture payer name from the saved benefit card (reads actual display value)
    capturedPayerName = await pages.benefitsWorkflow.getPayerNameByLevel('Primary');
    console.log(`✅ Benefit added (plan address deliberately cleared) — payer: ${capturedPayerName}`);
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
  // STEP 10: Fill Certifications — ONLY VERBAL (skip Written)
  // ===========================================================================
  test('Step 10a: Add Verbal Certification (skip Written)', async () => {
    await pages.certificationWorkflow.fillCertificationDetails('add', 'Verbal', [], {
      certType: 'Verbal',
      certifyingObtainedOn: ADMIT_DATE,
      attendingObtainedOn: ADMIT_DATE,
    });
    const verbalExists = await pages.certification.isVerbalCertificationVisible(0);
    expect(verbalExists).toBeTruthy();
    console.log('✅ Verbal certification added (Written deliberately skipped)');
  });

  test('Step 10b: Verify Certifications checkmark', async () => {
    await pages.admitPatientWorkflow.verifySectionCheckmark('certifications');
  });

  // ===========================================================================
  // STEP 11: Verify all sections complete + Admit (backdated)
  // ===========================================================================
  test('Step 11: Verify All Sections and Admit', async () => {
    await pages.admitPatientWorkflow.verifyAllSectionsComplete();
    await pages.admitPatientWorkflow.admitPatient(ADMIT_DATE);
    await pages.admitPatientWorkflow.verifyAdmissionSuccess();
    console.log(`✅ Step 11: Patient admitted (date: ${ADMIT_DATE})`);
  });

  // ===========================================================================
  // STEP 12: Wait for claims to generate
  // ===========================================================================
  test('Step 12: Wait for claims to generate', async () => {
    test.setTimeout(TEST_TIMEOUTS.EXTENDED);
    console.log('🔍 Waiting for claims to generate (polling Review tab, up to 90s)...');

    const patientId = PatientFixtures.getPatientIdFromFixture(hospiceFixture);
    if (!patientId) throw new Error('Patient ID is undefined');

    await expect(async () => {
      await pages.billingWorkflow.navigateToBillingClaims('Review');
      await pages.claims.searchByPatient(patientId.toString());
      await pages.claims.assertClaimCount(2);
      await pages.claims.assertClaimTypeVisible('812');
      await pages.claims.assertClaimTypeVisible('813');
    }).toPass({ timeout: 120_000, intervals: [5_000] });

    console.log('✅ Step 12: 2 claims (812 + 813) detected in Review tab');
  });

  // ===========================================================================
  // STEP 13a: Verify 812 claim errors
  // ===========================================================================
  test('Step 13a: Verify 812 claim errors', async () => {
    const patientId = PatientFixtures.getPatientIdFromFixture(hospiceFixture);
    if (!patientId) throw new Error('Patient ID is undefined');

    await pages.billingWorkflow.navigateToBillingClaims('Review');
    await pages.claims.searchByPatient(patientId.toString());

    const row812 = await pages.claims.findRowByPatientAndBillType(patientId.toString(), '812');
    expect(row812).toBeGreaterThanOrEqual(0);

    // 812 should have 7 errors: plan address (3) + benefits incomplete + signed cert + NOE (2)
    const errorCount = await pages.claims.getClaimErrorCount(row812);
    expect(errorCount).toBe(7);

    await pages.claims.expandClaimRow(row812);
    const errors = await pages.claims.getErrorMessages();
    // NOE-related
    expect(errors).toContain('Missing Notice Accepted Date');
    expect(errors).toContain('NOE has not been submitted');
    // Missing signed certification (Written cert skipped)
    expect(errors).toEqual(expect.arrayContaining([
      expect.stringContaining('Signed certification is missing'),
    ]));
    // Plan address missing
    expect(errors).toEqual(expect.arrayContaining([
      expect.stringContaining('Benefits Plan Address Plan Address1'),
      expect.stringContaining('Benefits Plan Address Plan City'),
      expect.stringContaining('Benefits Plan Address Plan Zip'),
    ]));
    // Benefits incomplete
    expect(errors).toContain('Patient benefits are incomplete');

    console.log(`✅ Step 13a: 812 has 7 errors — plan address + benefits + signed cert + NOE`);
  });

  // ===========================================================================
  // STEP 13b: Verify 813 claim errors
  // ===========================================================================
  test('Step 13b: Verify 813 claim errors', async () => {
    const patientId = PatientFixtures.getPatientIdFromFixture(hospiceFixture);
    if (!patientId) throw new Error('Patient ID is undefined');

    await pages.claims.navigateTo('Review');
    await pages.claims.searchByPatient(patientId.toString());

    const row813 = await pages.claims.findRowByPatientAndBillType(patientId.toString(), '813');
    expect(row813).toBeGreaterThanOrEqual(0);

    // 813 has same 7 as 812 + service end date + existing claim = 9 errors
    const errorCount = await pages.claims.getClaimErrorCount(row813);
    expect(errorCount).toBe(9);

    await pages.claims.expandClaimRow(row813);
    const errors = await pages.claims.getErrorMessages();
    expect(errors).toContain('Missing Notice Accepted Date');
    expect(errors).toContain('NOE has not been submitted');
    expect(errors).toContain('There is an existing Claim from a previous date');
    expect(errors).toContain('Patient benefits are incomplete');
    expect(errors).toEqual(expect.arrayContaining([
      expect.stringContaining('Signed certification is missing'),
      expect.stringContaining('service end date is equal to or greater than'),
      expect.stringContaining('Benefits Plan Address Plan Address1'),
    ]));
    console.log('✅ Step 13b: 813 has 9 errors');
  });

  // ===========================================================================
  // STEP 14: Verify Notice in Review > Notices tab (has plan address errors)
  // ===========================================================================
  test('Step 14: Verify Notice in Review > Notices tab', async () => {
    const patientId = PatientFixtures.getPatientIdFromFixture(hospiceFixture);
    if (!patientId) throw new Error('Patient ID is undefined');

    await pages.claims.navigateTo('Review', 'Notices');
    await pages.claims.searchByPatient(patientId.toString());
    await pages.claims.assertClaimCount(1);
    await pages.claims.assertClaimTypeVisible('81A');

    // Notice should have 4 errors: plan address (3) + benefits incomplete
    const errorCount = await pages.claims.getClaimErrorCount(0);
    expect(errorCount).toBe(4);

    await pages.claims.expandClaimRow(0);
    const errors = await pages.claims.getErrorMessages();
    expect(errors).toContain('Patient benefits are incomplete');
    expect(errors).toEqual(expect.arrayContaining([
      expect.stringContaining('Benefits Plan Address Plan Address1'),
      expect.stringContaining('Benefits Plan Address Plan City'),
      expect.stringContaining('Benefits Plan Address Plan Zip'),
    ]));
    console.log('✅ Step 14: Notice (81A) in Review > Notices with 4 plan address errors');
  });

  // ===========================================================================
  // STEP 15: Navigate back to patient record to fix gaps
  // ===========================================================================
  test('Step 15: Navigate to patient record', async () => {
    test.setTimeout(TEST_TIMEOUTS.STANDARD);
    const patientId = PatientFixtures.getPatientIdFromFixture(hospiceFixture);
    if (!patientId) throw new Error('Patient ID is undefined');

    await pages.dashboard.navigateToModule('Patient');
    await sharedPage.waitForTimeout(2000);
    await pages.patient.searchPatient(patientId.toString());
    const isPatientVisible = await pages.patient.verifyPatientInGrid(0);
    expect(isPatientVisible).toBeTruthy();
    await pages.patient.getPatientFromGrid(0);
    await sharedPage.waitForLoadState('networkidle');
    await sharedPage.waitForTimeout(2000);
    expect(sharedPage.url()).toContain('patient-details');
    console.log('✅ Step 15: Patient record opened for fixes');
  });

  // ===========================================================================
  // STEP 16: Add Written certification (was deliberately skipped)
  // ===========================================================================
  test('Step 16: Add Written Certification', async () => {
    test.setTimeout(TEST_TIMEOUTS.STANDARD);
    await pages.certificationWorkflow.fillCertificationDetails('add', 'Written', [], {
      certType: 'Written',
      certifyingSignedOn: ADMIT_DATE,
      attendingSignedOn: ADMIT_DATE,
      signatureReceivedFromAttending: true,
    });
    const writtenExists = await pages.certification.isWrittenCertificationVisible(0);
    expect(writtenExists).toBeTruthy();
    console.log('✅ Step 16: Written certification added');
  });

  // ===========================================================================
  // STEP 17: Edit Benefits — select Plan Name + set Notice Accepted Date
  // ===========================================================================
  test('Step 17: Edit Benefits — add plan address + Notice Accepted Date', async () => {
    test.setTimeout(TEST_TIMEOUTS.STANDARD);
    await pages.benefitsWorkflow.fillBenefitDetails(
      'edit',
      ['planNameIndex', 'noticeAcceptedDate'],
      'Hospice',
      'Primary',
      { planNameIndex: 2, noticeAcceptedDate: ADMIT_DATE }
    );
    console.log('✅ Step 17: Benefits updated with Plan Name + Notice Accepted Date');
  });

  // ===========================================================================
  // STEP 18: Wait for reprocessing — errors should clear
  // ===========================================================================
  test('Step 18: Wait for reprocessing after fixes', async () => {
    test.setTimeout(TEST_TIMEOUTS.EXTENDED);
    const patientId = PatientFixtures.getPatientIdFromFixture(hospiceFixture);
    if (!patientId) throw new Error('Patient ID is undefined');

    console.log('⏳ Waiting for claims to reprocess after fixes (polling, up to 120s)...');

    // Poll until 812 has only 1 error (NOE not submitted)
    await expect(async () => {
      await pages.billingWorkflow.navigateToBillingClaims('Review');
      await pages.claims.searchByPatient(patientId.toString());

      const row812 = await pages.claims.findRowByPatientAndBillType(patientId.toString(), '812');
      if (row812 === -1) throw new Error('812 not found');
      const errCount = await pages.claims.getClaimErrorCount(row812);
      if (errCount !== 1) throw new Error(`812 still has ${errCount} errors, expected 1`);
    }).toPass({ timeout: 120_000, intervals: [5_000] });

    console.log('✅ Step 18: Reprocessing complete — 812 has 1 error');
  });

  // ===========================================================================
  // STEP 19: Verify 812 has only "NOE has not been submitted"
  // ===========================================================================
  test('Step 19: Verify 812 reduced to 1 error', async () => {
    test.setTimeout(TEST_TIMEOUTS.STANDARD);
    const patientId = PatientFixtures.getPatientIdFromFixture(hospiceFixture);
    if (!patientId) throw new Error('Patient ID is undefined');

    await pages.billingWorkflow.navigateToBillingClaims('Review');
    await pages.claims.searchByPatient(patientId.toString());

    const row812 = await pages.claims.findRowByPatientAndBillType(patientId.toString(), '812');
    expect(row812).toBeGreaterThanOrEqual(0);

    const errorCount = await pages.claims.getClaimErrorCount(row812);
    expect(errorCount).toBe(1);

    await pages.claims.expandClaimRow(row812);
    const errors = await pages.claims.getErrorMessages();
    expect(errors).toContain('NOE has not been submitted');
    console.log('✅ Step 19: 812 has only 1 error — NOE has not been submitted');
  });

  // ===========================================================================
  // STEP 20: Verify Notice moved to Ready > Notices
  // ===========================================================================
  test('Step 20: Verify Notice moved to Ready > Notices', async () => {
    test.setTimeout(TEST_TIMEOUTS.STANDARD);
    const patientId = PatientFixtures.getPatientIdFromFixture(hospiceFixture);
    if (!patientId) throw new Error('Patient ID is undefined');

    // Notice should no longer be in Review > Notices
    await pages.claims.navigateTo('Review', 'Notices');
    await pages.claims.searchByPatient(patientId.toString());
    await pages.claims.assertNoReviewErrors();
    console.log('  Notice cleared from Review > Notices');

    // Notice should now be in Ready > Notices
    await pages.claims.navigateTo('Ready', 'Notices');
    await pages.claims.searchByPatient(patientId.toString());
    await pages.claims.assertClaimCount(1);
    await pages.claims.assertClaimTypeVisible('81A');
    console.log('✅ Step 20: Notice (81A) moved to Ready > Notices');
  });

});
