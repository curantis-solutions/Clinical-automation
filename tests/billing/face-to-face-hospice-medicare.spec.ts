/**
 * =============================================================================
 * Face-to-Face (F2F) Visit Validation — CR-2993
 * =============================================================================
 *
 * MODULE: Billing
 * SCENARIO: Create patient → admit backdated (~7 months) → add certs for all BPs →
 *           verify F2F error on first BP3 claim → add valid F2F → verify error cleared →
 *           edit F2F date to invalid → verify error with days → fix date → verify cleared
 *
 * BP DURATION RULES:
 *   BP1: 90 days, BP2: 90 days, BP3+: 60 days each
 *
 * F2F RULES:
 *   Required 3rd benefit period onward.
 *   Valid window: 0 to 30 days before BPSD.
 *   Claim mapping: BPSD <= claimEndDate <= BPED
 *
 * RUN:
 *   npx playwright test tests/billing/face-to-face-hospice-medicare.spec.ts --headed --workers=1
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

// Captured from the test flow — no hardcoding
let capturedPatientId = '';
let capturedPatientName = '';
let capturedPayerName = '';
let capturedAttendingPhysician = '';

const hospiceFixture = PatientFixtures.PATIENT_FIXTURES.HOSPICE;

// ── Admit date: ~7 months ago so patient reaches BP3 ──
// Using getDateOfMonth(1, 7) = 1st of 7 months ago
const ADMIT_DATE = DateHelper.getDateOfMonth(1, 7);

// ── Dynamic BP date calculations ──
// BP1: 90 days
const BP1_START = ADMIT_DATE;
const BP1_END = DateHelper.addDaysToDate(BP1_START, 89);

// BP2: 90 days
const BP2_START = DateHelper.addDaysToDate(BP1_END, 1);
const BP2_END = DateHelper.addDaysToDate(BP2_START, 89);

// BP3: 60 days
const BP3_START = DateHelper.addDaysToDate(BP2_END, 1);
const BP3_END = DateHelper.addDaysToDate(BP3_START, 59);

// Cert signed-on dates (within each BP, on-time = BPSD + 2)
const CERT_BP1_SIGNED = DateHelper.addDaysToDate(BP1_START, 2);
const CERT_BP2_SIGNED = DateHelper.addDaysToDate(BP2_START, 2);
const CERT_BP3_SIGNED = DateHelper.addDaysToDate(BP3_START, 2);

// F2F dates relative to BP3 start
const F2F_VALID_DATE = DateHelper.addDaysToDate(BP3_START, -15);   // ~15 days before BPSD (valid)
const F2F_INVALID_DATE = DateHelper.addDaysToDate(BP3_START, -32); // >30 days before BPSD (invalid)
const F2F_BPSD_DATE = BP3_START;                                    // same as BPSD (valid, day 0)

// F2F error patterns
const F2F_ERROR_PATTERN = /Patient is missing Face to Face visit/;
const F2F_DAYS_ERROR_PATTERN = /Patient is missing Face to Face visit \(\d+ days between Benefit Period Start Date:/;

// Track which row has the BP3 claim
let f2fClaimRowIndex = -1;

test.describe.serial('Face-to-Face (F2F) Visit Validation — CR-2993', () => {

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

    console.log('=== BP Date Calculations ===');
    console.log(`Admit: ${ADMIT_DATE}`);
    console.log(`BP1: ${BP1_START} - ${BP1_END} (90 days)`);
    console.log(`BP2: ${BP2_START} - ${BP2_END} (90 days)`);
    console.log(`BP3: ${BP3_START} - ${BP3_END} (60 days)`);
    console.log(`F2F valid: ${F2F_VALID_DATE}, invalid: ${F2F_INVALID_DATE}, BPSD: ${F2F_BPSD_DATE}`);
  });

  test.afterAll(async () => {
    if (sharedContext) await sharedContext.close();
  });

  // ===========================================================================
  // PHASE 1: Create patient, fill all sections, admit
  // ===========================================================================
  test('Step 01: Login as MD', async () => {
    test.setTimeout(TEST_TIMEOUTS.STANDARD);
    await pages.login.goto();
    const physicianNamePromise = TestDataManager.interceptPhysicianName(sharedPage);
    const credentials = CredentialManager.getCredentials(undefined, 'MD');
    await pages.login.login(credentials.username, credentials.password);
    await physicianNamePromise;
    console.log('Logged in as MD');
  });

  test('Step 02: Create Hospice Patient', async () => {
    test.setTimeout(TEST_TIMEOUTS.LONG);
    await pages.dashboard.navigateToModule('Patient');
    await sharedPage.waitForTimeout(2000);
    const result = await pages.patientWorkflow.addPatientFromFixture(hospiceFixture, { skipLogin: true });
    expect(result.success).toBeTruthy();
    console.log(`Created patient: ${result.patientFirstName} ${result.patientLastName} (ID: ${result.patientId})`);
  });

  test('Step 03: Search and open patient chart', async () => {
    test.setTimeout(TEST_TIMEOUTS.STANDARD);
    const patientId = PatientFixtures.getPatientIdFromFixture(hospiceFixture);
    if (!patientId) throw new Error('Patient ID is undefined');
    capturedPatientId = patientId.toString();

    await pages.patient.searchPatient(capturedPatientId);
    await pages.patient.verifyPatientInGrid(0);
    await pages.patient.getPatientFromGrid(0);
    await sharedPage.waitForLoadState('networkidle');

    capturedPatientName = await pages.patientDetails.getPatientBillingName();
    console.log(`Patient chart opened: ${capturedPatientId} — ${capturedPatientName}`);
  });

  test('Step 04a: Add Caller and Referrer', async () => {
    test.setTimeout(TEST_TIMEOUTS.STANDARD);
    await pages.patientWorkflow.addCallerInformation({ referralType: 'Call', relation: 'Physician' });
    await pages.patientWorkflow.addReferrerInformation({ sameAsCaller: true });
    await pages.patientWorkflow.addReferringPhysicianInformation('add', { sameAsReferrer: true });
    await pages.patientWorkflow.addOrderingPhysicianInformation('add', { sameAsReferringPhysician: true });
    console.log('Profile section filled');
  });

  test('Step 04b: Add LOC', async () => {
    test.setTimeout(TEST_TIMEOUTS.STANDARD);
    await pages.locWorkflow.addLOCOrder('Routine Home Care', { startDate: ADMIT_DATE });
    console.log('LOC added');
  });

  test('Step 04c: Add Diagnosis', async () => {
    test.setTimeout(TEST_TIMEOUTS.STANDARD);
    await pages.diagnosisWorkflow.fillDiagnosisDetails('add', {
      primaryDiagnosis: { searchText: 'C801', optionIndex: 0 },
    });
    await pages.admitPatientWorkflow.verifySectionCheckmark('profile');
    console.log('Diagnosis added');
  });

  test('Step 04d: Add Care Team', async () => {
    test.setTimeout(TEST_TIMEOUTS.STANDARD);
    await pages.careTeamWorkflow.navigateToCareTeam();
    await pages.careTeamWorkflow.selectCareTeam();
    await pages.careTeamWorkflow.addStandardRoles();
    await pages.careTeamWorkflow.fillAttendingPhysician('add', [], 0,
      createAttendingPhysicianData({ startDate: ADMIT_DATE }));
    capturedAttendingPhysician = await pages.careTeamWorkflow.getAttendingPhysicianName();
    await pages.careTeamWorkflow.fillCaregiverDetails('add');
    await pages.admitPatientWorkflow.verifySectionCheckmark('care-team');
    console.log(`Care Team added — attending: ${capturedAttendingPhysician}`);
  });

  test('Step 04e: Add Benefits', async () => {
    test.setTimeout(TEST_TIMEOUTS.STANDARD);
    await pages.benefitsWorkflow.fillBenefitDetails('add', [], 'Hospice', 'Primary',
      createBenefitData({ payerEffectiveDate: ADMIT_DATE, benefitPeriodStartDate: ADMIT_DATE }));
    capturedPayerName = await pages.benefitsWorkflow.getPayerNameByLevel('Primary');
    await pages.admitPatientWorkflow.verifySectionCheckmark('benefits');
    console.log(`Benefits added — payer: ${capturedPayerName}`);
  });

  test('Step 04f: Add Consents', async () => {
    test.setTimeout(TEST_TIMEOUTS.STANDARD);
    await pages.consentsWorkflow.fillConsents('yes');
    await pages.admitPatientWorkflow.verifySectionCheckmark('consents');
    console.log('Consents added');
  });

  test('Step 05a: Add Written Certification for BP1', async () => {
    test.setTimeout(TEST_TIMEOUTS.STANDARD);
    await pages.certificationWorkflow.fillCertificationDetails('add', 'Written', [], {
      certType: 'Written',
      benefitPeriodIndex: 1,
      certifyingSignedOn: CERT_BP1_SIGNED,
      attendingSignedOn: CERT_BP1_SIGNED,
      signatureReceivedFromAttending: true,
    });
    console.log(`Written cert added for BP1 (signed: ${CERT_BP1_SIGNED})`);
  });

  test('Step 05b: Add Written Certification for BP2', async () => {
    test.setTimeout(TEST_TIMEOUTS.STANDARD);
    await pages.certificationWorkflow.fillCertificationDetails('add', 'Written', [], {
      certType: 'Written',
      benefitPeriodIndex: 2,
      certifyingSignedOn: CERT_BP2_SIGNED,
      attendingSignedOn: CERT_BP2_SIGNED,
      signatureReceivedFromAttending: true,
    });
    console.log(`Written cert added for BP2 (signed: ${CERT_BP2_SIGNED})`);
  });

  test('Step 05c: Add Written Certification for BP3', async () => {
    test.setTimeout(TEST_TIMEOUTS.STANDARD);
    await pages.certificationWorkflow.fillCertificationDetails('add', 'Written', [], {
      certType: 'Written',
      benefitPeriodIndex: 3,
      certifyingSignedOn: CERT_BP3_SIGNED,
      attendingSignedOn: CERT_BP3_SIGNED,
      signatureReceivedFromAttending: true,
    });
    await pages.admitPatientWorkflow.verifySectionCheckmark('certifications');
    console.log(`Written cert added for BP3 (signed: ${CERT_BP3_SIGNED})`);
  });

  test('Step 06: Verify all sections and Admit', async () => {
    test.setTimeout(TEST_TIMEOUTS.STANDARD);
    await pages.admitPatientWorkflow.verifyAllSectionsComplete();
    await pages.admitPatientWorkflow.admitPatient(ADMIT_DATE);
    await pages.admitPatientWorkflow.verifyAdmissionSuccess();
    console.log(`Patient admitted with date: ${ADMIT_DATE}`);
  });

  // ===========================================================================
  // PHASE 2: Verify F2F error — only on first BP3 claim, not on others
  // ===========================================================================
  test('Step 07: Verify F2F error on first BP3 claim', async () => {
    test.setTimeout(TEST_TIMEOUTS.LONG);

    await expect(async () => {
      // Re-navigate each retry so claims data refreshes
      await pages.billingWorkflow.navigateToBillingClaims('Review');
      await pages.claims.searchByPatient(capturedPatientId);

      const count = await pages.claims.getVisibleRowCount();
      expect(count).toBeGreaterThan(0);

      // Find the earliest claim whose service end date falls within BP3
      f2fClaimRowIndex = await pages.claims.findEarliestRowByServiceEndDateInRange(BP3_START, BP3_END);
      expect(f2fClaimRowIndex).toBeGreaterThanOrEqual(0);

      await pages.claims.expandClaimRow(f2fClaimRowIndex);
      const errors = await pages.claims.getErrorMessages();
      const hasF2fError = errors.some(msg => F2F_ERROR_PATTERN.test(msg));
      expect(hasF2fError).toBeTruthy();
    }).toPass({ timeout: 120_000, intervals: [5_000] });

    const claimId = await pages.claims.getRowFieldValue(f2fClaimRowIndex, 'claimId');
    const serviceEnd = await pages.claims.getRowFieldValue(f2fClaimRowIndex, 'serviceEnd');
    console.log(`BP3 claim at row ${f2fClaimRowIndex}: claimId=${claimId}, serviceEnd=${serviceEnd}`);
    console.log('Verified: F2F error present on BP3 claim');
  });

  test('Step 08: Verify other claims do NOT have F2F error', async () => {
    test.setTimeout(TEST_TIMEOUTS.LONG);

    // Collapse BP3 row left open from Step 07
    await pages.claims.expandClaimRow(f2fClaimRowIndex);

    const rowCount = await pages.claims.getVisibleRowCount();
    for (let i = 0; i < rowCount; i++) {
      if (i === f2fClaimRowIndex) continue;

      await pages.claims.expandClaimRow(i);
      const errors = await pages.claims.getErrorMessages();
      const hasF2fError = errors.some(msg => F2F_ERROR_PATTERN.test(msg));

      const claimId = await pages.claims.getRowFieldValue(i, 'claimId');
      expect(hasF2fError).toBeFalsy();
      console.log(`Claim ${claimId} at row ${i}: no F2F error`);

      // Collapse before expanding next row
      await pages.claims.expandClaimRow(i);
    }
    console.log('Verified: No other claims have F2F error');
  });

  // ===========================================================================
  // PHASE 3: Add valid F2F visit → verify error cleared
  // ===========================================================================
  test('Step 09: Navigate to patient Care Plan', async () => {
    test.setTimeout(TEST_TIMEOUTS.STANDARD);
    await pages.dashboard.navigateToModule('Patient');
    await sharedPage.waitForTimeout(1000);
    await pages.patient.searchPatient(capturedPatientId);
    await pages.patient.getPatientFromGrid(0);
    await sharedPage.waitForLoadState('networkidle');
    await pages.carePlan.navigateToCarePlan();
    console.log('On Care Plan');
  });

  test('Step 10: Create, record, and complete F2F visit with valid date', async () => {
    test.setTimeout(TEST_TIMEOUTS.LONG);
    await pages.visitWorkflow.createAndRecordVisit('F2F', { visitDate: F2F_VALID_DATE });
    console.log(`F2F visit completed with valid date: ${F2F_VALID_DATE}`);
  });

  test('Step 11: Verify F2F error cleared on BP3 claim', async () => {
    test.setTimeout(TEST_TIMEOUTS.LONG);

    await expect(async () => {
      // Re-navigate each retry so claims data refreshes
      await pages.billingWorkflow.navigateToBillingClaims('Review');
      await pages.claims.searchByPatient(capturedPatientId);

      const bp3Row = await pages.claims.findEarliestRowByServiceEndDateInRange(BP3_START, BP3_END);
      if (bp3Row === -1) return; // BP3 claim moved out of Review

      await pages.claims.expandClaimRow(bp3Row);
      const errors = await pages.claims.getErrorMessages();
      console.log(`BP3 earliest row ${bp3Row} errors: ${JSON.stringify(errors)}`);
      const hasF2fError = errors.some(msg => F2F_ERROR_PATTERN.test(msg));
      expect(hasF2fError).toBeFalsy();
    }).toPass({ timeout: 120_000, intervals: [5_000] });

    console.log('Verified: F2F error cleared after valid F2F visit');
  });

  // ===========================================================================
  // PHASE 4: Change F2F date to invalid → verify error with days message
  // ===========================================================================
  test('Step 12: Edit F2F visit date to invalid (>30 days before BPSD)', async () => {
    test.setTimeout(TEST_TIMEOUTS.STANDARD);

    await pages.dashboard.navigateToModule('Patient');
    await sharedPage.waitForTimeout(1000);
    await pages.patient.searchPatient(capturedPatientId);
    await pages.patient.getPatientFromGrid(0);
    await sharedPage.waitForLoadState('networkidle');
    await pages.carePlan.navigateToCarePlan();

    await pages.visitRecording.editF2FVisitDate(F2F_INVALID_DATE);
    console.log(`Changed F2F date to invalid: ${F2F_INVALID_DATE}`);
  });

  test('Step 13: Verify F2F error reappears with days message', async () => {
    test.setTimeout(TEST_TIMEOUTS.LONG);

    await expect(async () => {
      // Re-navigate each retry so claims data refreshes
      await pages.billingWorkflow.navigateToBillingClaims('Review');
      await pages.claims.searchByPatient(capturedPatientId);

      const bp3Row = await pages.claims.findEarliestRowByServiceEndDateInRange(BP3_START, BP3_END);
      expect(bp3Row).toBeGreaterThanOrEqual(0);

      await pages.claims.expandClaimRow(bp3Row);
      const errors = await pages.claims.getErrorMessages();
      console.log(`BP3 earliest row ${bp3Row} errors: ${JSON.stringify(errors)}`);
      const hasDaysError = errors.some(msg => F2F_DAYS_ERROR_PATTERN.test(msg));
      expect(hasDaysError).toBeTruthy();
    }).toPass({ timeout: 120_000, intervals: [5_000] });

    console.log('Verified: F2F error with days message after invalid date');
  });

  // ===========================================================================
  // PHASE 5: Change F2F date to BPSD → verify error cleared
  // ===========================================================================
  test('Step 14: Change F2F visit date to BPSD (valid)', async () => {
    test.setTimeout(TEST_TIMEOUTS.STANDARD);

    await pages.dashboard.navigateToModule('Patient');
    await sharedPage.waitForTimeout(1000);
    await pages.patient.searchPatient(capturedPatientId);
    await pages.patient.getPatientFromGrid(0);
    await sharedPage.waitForLoadState('networkidle');
    await pages.carePlan.navigateToCarePlan();

    await pages.visitRecording.editF2FVisitDate(F2F_BPSD_DATE);
    console.log(`Changed F2F date to BPSD: ${F2F_BPSD_DATE}`);
  });

  test('Step 15: Verify F2F error cleared after valid date change', async () => {
    test.setTimeout(TEST_TIMEOUTS.LONG);

    await expect(async () => {
      // Re-navigate each retry so claims data refreshes
      await pages.billingWorkflow.navigateToBillingClaims('Review');
      await pages.claims.searchByPatient(capturedPatientId);

      const bp3Row = await pages.claims.findEarliestRowByServiceEndDateInRange(BP3_START, BP3_END);
      if (bp3Row === -1) return;

      await pages.claims.expandClaimRow(bp3Row);
      const errors = await pages.claims.getErrorMessages();
      console.log(`BP3 earliest row ${bp3Row} errors: ${JSON.stringify(errors)}`);
      const hasF2fError = errors.some(msg => F2F_ERROR_PATTERN.test(msg));
      expect(hasF2fError).toBeFalsy();
    }).toPass({ timeout: 120_000, intervals: [5_000] });

    console.log('Verified: F2F error cleared after changing date to BPSD');
  });
});
