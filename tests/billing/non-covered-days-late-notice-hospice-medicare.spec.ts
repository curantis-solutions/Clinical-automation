/**
 * =============================================================================
 * Non-Covered Days (Late Notice) — CR-2992
 * =============================================================================
 *
 * MODULE: Billing
 * SCENARIO: Admit patient with on-time written cert → verify no code 77 →
 *           add on-time Notice Accepted Date → verify no code 77 →
 *           edit Notice Accepted Date to late (admit date+7) → verify code 77 with
 *           reason "Late Notice" → submit NOE → 812 moves to Ready →
 *           verify UB-04 Box 35 code 77 → submit claim → verify 837 code 77
 *
 * RUN:
 *   npx playwright test tests/billing/non-covered-days-late-notice-hospice-medicare.spec.ts --headed --workers=1
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
import { buildClaimUb04Expected, toUb04Date } from '../../types/ub04.types';

let sharedPage: Page;
let sharedContext: BrowserContext;
let pages: PageObjects;

// Captured from the test flow — no hardcoding
let capturedPatientId = '';
let capturedPatientName = '';
let capturedPayerName = '';
let capturedAttendingPhysician = '';

const hospiceFixture = PatientFixtures.PATIENT_FIXTURES.HOSPICE;

// Date strategy per CR-2992 (Late Notice):
// Admit date = 1st of previous month (same as BPSD)
// Written cert (on-time) = BPSD + 2 days (within 2-day window)
// Notice Accepted Date (late) = admit date + 7 days (outside 2-day window)
// Non-covered span: admit date to (notice accepted date - 1) = 1st to 7th of previous month
const ADMIT_DATE = DateHelper.getDateOfMonth(1, 1);            // 1st of prev month (= BPSD)
const WRITTEN_CERT_ON_TIME = DateHelper.getDateOfMonth(3, 1);  // BPSD + 2 (within window)
const NOTICE_ACCEPTED_LATE = DateHelper.getDateOfMonth(8, 1);  // admit date + 7 (late)
const NON_COVERED_START = ADMIT_DATE;                           // admit date
const NON_COVERED_END = DateHelper.getDateOfMonth(7, 1);       // notice accepted date - 1

test.describe.serial('Non-Covered Days (Late Notice) — CR-2992', () => {

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
  // STEP 01: Create patient, fill all sections, admit with on-time written cert
  // ===========================================================================
  test('Step 01a: Login as MD', async () => {
    test.setTimeout(TEST_TIMEOUTS.STANDARD);
    await pages.login.goto();
    const physicianNamePromise = TestDataManager.interceptPhysicianName(sharedPage);
    const credentials = CredentialManager.getCredentials(undefined, 'MD');
    await pages.login.login(credentials.username, credentials.password);
    await sharedPage.waitForURL(/dashboard/, { timeout: TIMEOUTS.API });
    await physicianNamePromise;
    console.log('✅ Step 01a: Logged in as MD');
  });

  test('Step 01b: Create Hospice Patient', async () => {
    test.setTimeout(TEST_TIMEOUTS.LONG);
    await sharedPage.waitForLoadState('networkidle');
    await sharedPage.waitForTimeout(2000);
    await pages.dashboard.navigateToModule('Patient');
    await sharedPage.waitForTimeout(2000);

    const result = await pages.patientWorkflow.addPatientFromFixture(hospiceFixture, { skipLogin: true });
    expect(result.success).toBeTruthy();
    console.log(`✅ Step 01b: Created patient (ID: ${result.patientId})`);
  });

  test('Step 01c: Open Patient Chart and capture name', async () => {
    test.setTimeout(TEST_TIMEOUTS.STANDARD);
    const patientId = PatientFixtures.getPatientIdFromFixture(hospiceFixture);
    expect(patientId).toBeDefined();
    if (!patientId) throw new Error('Patient ID is undefined');
    capturedPatientId = patientId.toString();

    await pages.patient.searchPatient(capturedPatientId);
    await pages.patient.verifyPatientInGrid(0);
    await pages.patient.getPatientFromGrid(0);
    await sharedPage.waitForLoadState('networkidle');
    await sharedPage.waitForTimeout(2000);

    capturedPatientName = await pages.patientDetails.getPatientBillingName();
    console.log(`✅ Step 01c: Patient ${capturedPatientId} — name: ${capturedPatientName}`);
  });

  test('Step 01d: Fill Profile section', async () => {
    await pages.patientWorkflow.addCallerInformation({ referralType: 'Call', relation: 'Physician' });
    await pages.patientWorkflow.addReferrerInformation({ sameAsCaller: true });
    await pages.patientWorkflow.addReferringPhysicianInformation('add', { sameAsReferrer: true });
    await pages.patientWorkflow.addOrderingPhysicianInformation('add', { sameAsReferringPhysician: true });
    await pages.locWorkflow.addLOCOrder('Routine Home Care', { careLocationType: 'Q5004', startDate: ADMIT_DATE });
    await pages.diagnosisWorkflow.fillDiagnosisDetails('add', { primaryDiagnosis: { searchText: 'C801', optionIndex: 0 } });
    await pages.admitPatientWorkflow.verifySectionCheckmark('profile');
    console.log('✅ Step 01d: Profile section complete');
  });

  test('Step 01e: Fill Care Team section', async () => {
    await pages.careTeamWorkflow.navigateToCareTeam();
    await pages.careTeamWorkflow.selectCareTeam();
    await pages.careTeamWorkflow.addStandardRoles();
    await pages.careTeamWorkflow.fillAttendingPhysician('add', [], 0,
      createAttendingPhysicianData({ startDate: ADMIT_DATE }));
    capturedAttendingPhysician = await pages.careTeamWorkflow.getAttendingPhysicianName();
    await pages.careTeamWorkflow.fillCaregiverDetails('add');
    await pages.admitPatientWorkflow.verifySectionCheckmark('care-team');
    console.log(`✅ Step 01e: Care team complete — attending: ${capturedAttendingPhysician}`);
  });

  test('Step 01f: Fill Benefits section', async () => {
    await pages.benefitsWorkflow.fillBenefitDetails('add', [], 'Hospice', 'Primary',
      createBenefitData({ payerEffectiveDate: ADMIT_DATE, benefitPeriodStartDate: ADMIT_DATE }));
    capturedPayerName = await pages.benefitsWorkflow.getPayerNameByLevel('Primary');
    await pages.admitPatientWorkflow.verifySectionCheckmark('benefits');
    console.log(`✅ Step 01f: Benefits complete — payer: ${capturedPayerName}`);
  });

  test('Step 01g: Fill Consents section', async () => {
    await pages.consentsWorkflow.fillConsents('yes');
    await pages.admitPatientWorkflow.verifySectionCheckmark('consents');
    console.log('✅ Step 01g: Consents complete');
  });

  test('Step 01h: Add Written Certification (on-time)', async () => {
    test.setTimeout(TEST_TIMEOUTS.STANDARD);
    await pages.certificationWorkflow.fillCertificationDetails('add', 'Written', [], {
      certType: 'Written',
      certifyingSignedOn: WRITTEN_CERT_ON_TIME,
      attendingSignedOn: WRITTEN_CERT_ON_TIME,
      signatureReceivedFromAttending: true,
    });

    const writtenExists = await pages.certification.isWrittenCertificationVisible(0);
    expect(writtenExists).toBeTruthy();

    console.log(`✅ Step 01h: Written certification added (on-time: ${WRITTEN_CERT_ON_TIME})`);
  });

  test('Step 01i: Admit patient (backdated)', async () => {
    test.setTimeout(TEST_TIMEOUTS.STANDARD);
    await pages.admitPatientWorkflow.verifyAllSectionsComplete();
    await pages.admitPatientWorkflow.admitPatient(ADMIT_DATE);
    await pages.admitPatientWorkflow.verifyAdmissionSuccess();
    console.log(`✅ Step 01i: Patient admitted (date: ${ADMIT_DATE})`);
  });

  // ===========================================================================
  // STEP 02: Add on-time Notice Accepted Date → verify no code 77
  // ===========================================================================
  test('Step 02a: Add on-time Notice Accepted Date in Benefits', async () => {
    test.setTimeout(TEST_TIMEOUTS.STANDARD);

    await pages.dashboard.navigateToModule('Patient');
    await sharedPage.waitForTimeout(1000);
    await pages.patient.searchPatient(capturedPatientId);
    await pages.patient.getPatientFromGrid(0);
    await sharedPage.waitForLoadState('networkidle');
    await sharedPage.waitForTimeout(2000);

    await pages.benefitsWorkflow.fillBenefitDetails(
      'edit',
      ['noticeAcceptedDate'],
      'Hospice',
      'Primary',
      { noticeAcceptedDate: ADMIT_DATE }
    );

    console.log('✅ Step 02a: On-time Notice Accepted Date added');
  });

  test('Step 02b: Verify no code 77 in Review (on-time notice)', async () => {
    test.setTimeout(TEST_TIMEOUTS.EXTENDED);

    // Wait for 812 to appear in Review (NOE not submitted yet — stays in Review)
    await expect(async () => {
      await pages.billingWorkflow.navigateToBillingClaims('Review');
      await pages.claims.searchByPatient(capturedPatientId);
      await pages.claims.assertClaimTypeVisible('812');
    }).toPass({ timeout: 120_000, intervals: [5_000] });

    const rowIndex = await pages.claims.findRowByBillType('812');
    expect(rowIndex).toBeGreaterThanOrEqual(0);

    // Verify no unfunded days icon (on-time notice = no code 77)
    const hasIcon = await pages.claims.isUnfundedDaysIconVisible(rowIndex);
    expect(hasIcon).toBeFalsy();

    console.log('✅ Step 02b: No code 77 icon in Review — on-time notice has no non-covered days');
  });

  // ===========================================================================
  // STEP 03: Edit Notice Accepted Date to late → verify code 77
  // ===========================================================================
  test('Step 03a: Edit Notice Accepted Date to late', async () => {
    test.setTimeout(TEST_TIMEOUTS.STANDARD);

    await pages.dashboard.navigateToModule('Patient');
    await sharedPage.waitForTimeout(1000);
    await pages.patient.searchPatient(capturedPatientId);
    await pages.patient.getPatientFromGrid(0);
    await sharedPage.waitForLoadState('networkidle');
    await sharedPage.waitForTimeout(2000);

    await pages.benefitsWorkflow.fillBenefitDetails(
      'edit',
      ['noticeAcceptedDate'],
      'Hospice',
      'Primary',
      { noticeAcceptedDate: NOTICE_ACCEPTED_LATE }
    );

    console.log(`✅ Step 03a: Notice Accepted Date edited to late (${NOTICE_ACCEPTED_LATE})`);
  });

  test('Step 03b: Verify code 77 icon and popover in Review', async () => {
    test.setTimeout(TEST_TIMEOUTS.EXTENDED);

    // Poll until claim reprocesses with code 77 icon in Review
    await expect(async () => {
      await pages.billingWorkflow.navigateToBillingClaims('Review');
      await pages.claims.searchByPatient(capturedPatientId);
      const rowIndex = await pages.claims.findRowByBillType('812');
      if (rowIndex < 0) throw new Error('812 not found in Review after notice edit');
      const hasIcon = await pages.claims.isUnfundedDaysIconVisible(rowIndex);
      if (!hasIcon) throw new Error('Unfunded Days icon not yet visible in Review');
    }).toPass({ timeout: 120_000, intervals: [5_000] });

    const rowIndex = await pages.claims.findRowByBillType('812');
    expect(rowIndex).toBeGreaterThanOrEqual(0);

    const popoverText = await pages.claims.getOccurrencePopoverText(rowIndex);
    expect(popoverText).toContain('Claim has Occurrence Code 77 for non-covered');

    console.log('✅ Step 03b: Code 77 icon + popover verified in Review');
  });

  test('Step 03c: Verify Non-Covered Details tab in Review', async () => {
    test.setTimeout(TEST_TIMEOUTS.EXTENDED);

    // Step 03b already confirmed code 77 icon — data is present, just read it
    await pages.billingWorkflow.navigateToBillingClaims('Review');
    await pages.claims.searchByPatient(capturedPatientId);

    const rowIndex = await pages.claims.findRowByBillType('812');
    expect(rowIndex).toBeGreaterThanOrEqual(0);

    await pages.claims.expandClaimRow(rowIndex);
    const details = await pages.claims.readNonCoveredDetails(0);

    expect(details.reason).toBe('Late Notice');
    expect(details.startDate).toBe(NON_COVERED_START);
    expect(details.endDate).toBe(NON_COVERED_END);

    console.log(`✅ Step 03c: Non-Covered Details — Reason: ${details.reason} | Span: ${details.startDate} - ${details.endDate}`);
  });

  // ===========================================================================
  // STEP 04: Submit NOE → 812 moves to Ready → verify UB-04 code 77
  // ===========================================================================
  test('Step 04a: Submit NOE from Ready > Notices', async () => {
    test.setTimeout(TEST_TIMEOUTS.EXTENDED);

    // Wait for NOE to appear in Ready > Notices
    await expect(async () => {
      await pages.billingWorkflow.navigateToBillingClaims('Ready');
      await pages.claims.switchSecondaryTab('Notices');
      await pages.claims.searchByPatient(capturedPatientId);
      await pages.claims.assertClaimTypeVisible('81A');
    }).toPass({ timeout: 120_000, intervals: [5_000] });

    await pages.billingWorkflow.submitNoeFromReady(capturedPatientId);

    console.log('✅ Step 04a: NOE submitted');
  });

  test('Step 04b: Wait for 812 to move to Ready > Claims', async () => {
    test.setTimeout(TEST_TIMEOUTS.EXTENDED);

    await expect(async () => {
      await pages.billingWorkflow.navigateToBillingClaims('Ready');
      await pages.claims.switchSecondaryTab('Claims');
      await pages.claims.searchByPatient(capturedPatientId);
      await pages.claims.assertClaimTypeVisible('812');
    }).toPass({ timeout: 120_000, intervals: [5_000] });

    // Verify code 77 icon persists in Ready
    const rowIndex = await pages.claims.findRowByPatientAndBillType(capturedPatientId, '812');
    const hasIcon = await pages.claims.isUnfundedDaysIconVisible(rowIndex);
    expect(hasIcon).toBeTruthy();

    console.log('✅ Step 04b: 812 moved to Ready — code 77 icon still present');
  });

  test('Step 04c: Verify UB-04 has code 77 in Ready', async () => {
    test.setTimeout(TEST_TIMEOUTS.EXTENDED);

    // Step 04b already confirmed 812 is in Ready — navigate, download once, verify
    await pages.billingWorkflow.navigateToBillingClaims('Ready');
    await pages.claims.switchSecondaryTab('Claims');
    await pages.claims.searchByPatient(capturedPatientId);

    const rowIndex = await pages.claims.findRowByPatientAndBillType(capturedPatientId, '812');
    expect(rowIndex).toBeGreaterThanOrEqual(0);

    const text = await pages.claims.downloadClaimPdf(rowIndex);
    expect(text).toContain('77');
    expect(text).toContain(toUb04Date(NON_COVERED_START));
    expect(text).toContain(toUb04Date(NON_COVERED_END));

    console.log(`✅ Step 04c: UB-04 verified — code 77, span: ${toUb04Date(NON_COVERED_START)}-${toUb04Date(NON_COVERED_END)}`);
  });

  // ===========================================================================
  // STEP 05: Submit 812 claim → verify 837 has code 77
  // ===========================================================================
  test('Step 05a: Submit 812 claim', async () => {
    test.setTimeout(TEST_TIMEOUTS.STANDARD);

    await pages.billingWorkflow.submitClaimFromReady(capturedPatientId, '812');

    console.log('✅ Step 05a: 812 claim submitted');
  });

  test('Step 05b: Verify 812 in AR', async () => {
    test.setTimeout(TEST_TIMEOUTS.EXTENDED);

    const { arData } = await pages.billingWorkflow.verifyAndDownloadClaimInAR(
      capturedPatientId,
      capturedPayerName,
      capturedPatientName,
      'UB-04'
    );

    expect(arData.status).toBe('Submitted');
    expect(arData.billedAmount).not.toBe('$0.00');

    console.log(`✅ Step 05b: AR verified — Status: ${arData.status} | Billed: ${arData.billedAmount}`);
  });

  test('Step 05c: Verify 837 has occurrence code 77', async () => {
    test.setTimeout(TEST_TIMEOUTS.STANDARD);

    const content = await pages.billingWorkflow.download837TextFromAR(
      capturedPatientId,
      capturedPayerName,
      'Claims'
    );

    const ediFrom = DateHelper.toEdiDate(NON_COVERED_START);
    const ediTo = DateHelper.toEdiDate(NON_COVERED_END);
    const expectedSegment = `HI*BI:77:RD8:${ediFrom}-${ediTo}~`;
    expect(content).toContain(expectedSegment);

    console.log(`✅ Step 05c: 837 verified — found: ${expectedSegment}`);
  });
});
