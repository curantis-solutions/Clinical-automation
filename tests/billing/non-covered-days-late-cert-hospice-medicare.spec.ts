/**
 * =============================================================================
 * Non-Covered Days — CR-2992
 * =============================================================================
 *
 * MODULE: Billing
 * SCENARIO: Admit patient with verbal cert only → verify cert error in Review →
 *           add on-time written cert (claim stays in Review — NOE errors remain) →
 *           verify no code 77 in Review → edit cert to late → verify code 77 in Review →
 *           verify UB-04 Box 35 code 77 in Review →
 *           clear NOE errors (Notice Accepted Date + submit NOE) → claim moves to Ready →
 *           submit claim from Ready → verify 837 code 77
 *
 * RUN:
 *   npx playwright test tests/billing/non-covered-days-hospice-medicare.spec.ts --headed --workers=1
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

// Date strategy per CR-2992:
// BPSD = 1st of previous month (same as admit date)
// Verbal cert date = BPSD + 4 days
// Written cert (on-time) = BPSD + 2 days (within 2-day window)
// Written cert (late) = BPSD + 4 days (outside 2-day window)
// Non-covered span: BPSD to (late cert date - 1) = 1st to 4th of previous month
const ADMIT_DATE = DateHelper.getDateOfMonth(1, 1);          // BPSD = 1st of prev month
const VERBAL_CERT_DATE = DateHelper.getDateOfMonth(5, 1);    // BPSD + 4
const WRITTEN_CERT_ON_TIME = DateHelper.getDateOfMonth(3, 1); // BPSD + 2 (within window)
const WRITTEN_CERT_LATE = DateHelper.getDateOfMonth(5, 1);    // BPSD + 4 (outside window)
const NON_COVERED_START = ADMIT_DATE;                          // BPSD
const NON_COVERED_END = DateHelper.getDateOfMonth(4, 1);      // Late cert date - 1

test.describe.serial('Non-Covered Days — CR-2992', () => {

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
  // STEP 01: Create patient, fill all sections, admit with verbal cert only
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

  test('Step 01h: Add Verbal Certification only', async () => {
    test.setTimeout(TEST_TIMEOUTS.STANDARD);
    await pages.certificationWorkflow.fillCertificationDetails('add', 'Verbal', [], {
      certType: 'Verbal',
      certifyingObtainedOn: VERBAL_CERT_DATE,
      attendingObtainedOn: VERBAL_CERT_DATE,
    });
    await pages.admitPatientWorkflow.verifySectionCheckmark('certifications');
    console.log(`✅ Step 01h: Verbal certification added (date: ${VERBAL_CERT_DATE})`);
  });

  test('Step 01i: Admit patient (backdated)', async () => {
    test.setTimeout(TEST_TIMEOUTS.STANDARD);
    await pages.admitPatientWorkflow.verifyAllSectionsComplete();
    await pages.admitPatientWorkflow.admitPatient(ADMIT_DATE);
    await pages.admitPatientWorkflow.verifyAdmissionSuccess();
    console.log(`✅ Step 01i: Patient admitted (date: ${ADMIT_DATE})`);
  });

  // ===========================================================================
  // STEP 02: Verify claim in Review with cert error
  // ===========================================================================
  test('Step 02: Verify claim in Review with cert error', async () => {
    test.setTimeout(TEST_TIMEOUTS.EXTENDED);

    await expect(async () => {
      await pages.billingWorkflow.navigateToBillingClaims('Review');
      await pages.claims.searchByPatient(capturedPatientId);
      await pages.claims.assertClaimTypeVisible('812');
    }).toPass({ timeout: 120_000, intervals: [5_000] });

    const rowIndex = await pages.claims.findRowByBillType('812');
    expect(rowIndex).toBeGreaterThanOrEqual(0);

    await pages.claims.expandClaimRow(rowIndex);
    const errors = await pages.claims.getErrorMessages();
    const hasCertError = errors.some(e => e.toLowerCase().includes('signed certification is missing'));
    expect(hasCertError).toBeTruthy();

    console.log(`✅ Step 02: 812 in Review with cert error — errors: ${errors.length}`);
  });

  // ===========================================================================
  // STEP 03: Add Written Cert (on-time) → cert error cleared, NOE errors remain → still in Review
  // ===========================================================================
  test('Step 03: Add on-time Written Certification', async () => {
    test.setTimeout(TEST_TIMEOUTS.STANDARD);

    await pages.dashboard.navigateToModule('Patient');
    await sharedPage.waitForTimeout(1000);
    await pages.patient.searchPatient(capturedPatientId);
    await pages.patient.getPatientFromGrid(0);
    await sharedPage.waitForLoadState('networkidle');
    await sharedPage.waitForTimeout(2000);

    await pages.certificationWorkflow.fillCertificationDetails('add', 'Written', [], {
      certType: 'Written',
      certifyingSignedOn: WRITTEN_CERT_ON_TIME,
      attendingSignedOn: WRITTEN_CERT_ON_TIME,
      signatureReceivedFromAttending: true,
    });

    const writtenExists = await pages.certification.isWrittenCertificationVisible(0);
    expect(writtenExists).toBeTruthy();

    console.log(`✅ Step 03: Written cert added (on-time: ${WRITTEN_CERT_ON_TIME}) — claim stays in Review (NOE errors remain)`);
  });

  // ===========================================================================
  // STEP 04: Verify no code 77 icon in Review (on-time cert = no non-covered days)
  // ===========================================================================
  test('Step 04: Verify no code 77 in Review', async () => {
    test.setTimeout(TEST_TIMEOUTS.EXTENDED);

    // Wait for claim to reprocess after adding written cert
    await expect(async () => {
      await pages.billingWorkflow.navigateToBillingClaims('Review');
      await pages.claims.searchByPatient(capturedPatientId);
      await pages.claims.assertClaimTypeVisible('812');
    }).toPass({ timeout: 120_000, intervals: [5_000] });

    const rowIndex = await pages.claims.findRowByBillType('812');
    expect(rowIndex).toBeGreaterThanOrEqual(0);

    // Verify no unfunded days icon (on-time cert = no code 77)
    const hasIcon = await pages.claims.isUnfundedDaysIconVisible(rowIndex);
    expect(hasIcon).toBeFalsy();

    console.log('✅ Step 04: No code 77 icon in Review — on-time cert has no non-covered days');
  });

  // ===========================================================================
  // STEP 05: Edit Written Cert to late date → code 77 appears in Review
  // ===========================================================================
  test('Step 05a: Edit Written Cert to late date', async () => {
    test.setTimeout(TEST_TIMEOUTS.STANDARD);

    await pages.dashboard.navigateToModule('Patient');
    await sharedPage.waitForTimeout(1000);
    await pages.patient.searchPatient(capturedPatientId);
    await pages.patient.getPatientFromGrid(0);
    await sharedPage.waitForLoadState('networkidle');
    await sharedPage.waitForTimeout(2000);

    await pages.certificationWorkflow.fillCertificationDetails(
      'edit', 'Written',
      ['certifyingSignedOn', 'attendingSignedOn'],
      {
        certType: 'Written',
        certifyingSignedOn: WRITTEN_CERT_LATE,
        attendingSignedOn: WRITTEN_CERT_LATE,
      },
      { reasonForChange: 'Updating cert date for non-covered days testing' }
    );

    console.log(`✅ Step 05a: Written cert edited to late date (${WRITTEN_CERT_LATE})`);
  });

  test('Step 05b: Add Notice Accepted Date in Benefits', async () => {
    test.setTimeout(TEST_TIMEOUTS.STANDARD);

    // Already on patient chart — navigate to Benefits from here
    await pages.benefitsWorkflow.fillBenefitDetails(
      'edit',
      ['noticeAcceptedDate'],
      'Hospice',
      'Primary',
      { noticeAcceptedDate: ADMIT_DATE }
    );

    console.log('✅ Step 05b: Notice Accepted Date added');
  });

  // ===========================================================================
  // STEP 06: Verify code 77 icon + Non-Covered Details in Review
  // ===========================================================================
  test('Step 06a: Verify code 77 icon and popover in Review', async () => {
    test.setTimeout(TEST_TIMEOUTS.EXTENDED);

    // Poll until claim reprocesses with code 77 icon in Review
    await expect(async () => {
      await pages.billingWorkflow.navigateToBillingClaims('Review');
      await pages.claims.searchByPatient(capturedPatientId);
      const rowIndex = await pages.claims.findRowByBillType('812');
      if (rowIndex < 0) throw new Error('812 not found in Review after cert edit');
      const hasIcon = await pages.claims.isUnfundedDaysIconVisible(rowIndex);
      if (!hasIcon) throw new Error('Unfunded Days icon not yet visible in Review');
    }).toPass({ timeout: 120_000, intervals: [5_000] });

    const rowIndex = await pages.claims.findRowByBillType('812');
    expect(rowIndex).toBeGreaterThanOrEqual(0);

    const popoverText = await pages.claims.getOccurrencePopoverText(rowIndex);
    expect(popoverText).toContain('Claim has Occurrence Code 77 for non-covered');

    console.log('✅ Step 06a: Code 77 icon + popover verified in Review');
  });

  test('Step 06b: Verify Non-Covered Details tab in Review', async () => {
    test.setTimeout(TEST_TIMEOUTS.EXTENDED);

    // Poll until Non-Covered Details tab is available (backend async — tab may not appear immediately)
    let details!: { reason: string; startDate: string; endDate: string };
    await expect(async () => {
      await pages.billingWorkflow.navigateToBillingClaims('Review');
      await pages.claims.searchByPatient(capturedPatientId);

      const rowIndex = await pages.claims.findRowByBillType('812');
      if (rowIndex < 0) throw new Error('812 not found in Review');

      await pages.claims.expandClaimRow(rowIndex);
      details = await pages.claims.readNonCoveredDetails(0);
    }).toPass({ timeout: 90_000, intervals: [5_000] });

    expect(details.reason).toBe('Late Certification');
    expect(details.startDate).toBe(NON_COVERED_START);
    expect(details.endDate).toBe(NON_COVERED_END);

    console.log(`✅ Step 06b: Non-Covered Details — Reason: ${details.reason} | Span: ${details.startDate} - ${details.endDate}`);
  });

  // ===========================================================================
  // STEP 07: Submit NOE → clear remaining errors → 812 moves to Ready → verify UB-04 code 77
  // ===========================================================================
  test('Step 07a: Submit NOE from Ready > Notices', async () => {
    test.setTimeout(TEST_TIMEOUTS.EXTENDED);

    // Wait for NOE to appear in Ready > Notices
    await expect(async () => {
      await pages.billingWorkflow.navigateToBillingClaims('Ready');
      await pages.claims.switchSecondaryTab('Notices');
      await pages.claims.searchByPatient(capturedPatientId);
      await pages.claims.assertClaimTypeVisible('81A');
    }).toPass({ timeout: 120_000, intervals: [5_000] });

    await pages.billingWorkflow.submitNoeFromReady(capturedPatientId);

    console.log('✅ Step 07a: NOE submitted');
  });

  test('Step 07b: Wait for 812 to move to Ready > Claims', async () => {
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

    console.log('✅ Step 07b: 812 moved to Ready — code 77 icon still present');
  });

  test('Step 07c: Verify UB-04 has code 77 in Ready', async () => {
    test.setTimeout(TEST_TIMEOUTS.EXTENDED);

    // Poll until PDF is generated and downloadable (backend async)
    await expect(async () => {
      await pages.billingWorkflow.navigateToBillingClaims('Ready');
      await pages.claims.switchSecondaryTab('Claims');
      await pages.claims.searchByPatient(capturedPatientId);

      const rowIndex = await pages.claims.findRowByPatientAndBillType(capturedPatientId, '812');
      if (rowIndex < 0) throw new Error('812 not found in Ready');

      const claimId = await pages.claims.getRowFieldValue(rowIndex, 'claimId');
      const serviceEnd = await pages.claims.getRowFieldValue(rowIndex, 'serviceEnd');

      const attendingParts = capturedAttendingPhysician.trim().split(/\s+/);
      const attendingLastName = attendingParts[attendingParts.length - 1];

      const expected = buildClaimUb04Expected({
        claimId,
        chartId: capturedPatientId,
        patientName: capturedPatientName,
        payerName: capturedPayerName,
        billType: '812',
        fromDate: ADMIT_DATE,
        throughDate: serviceEnd,
        admitDate: ADMIT_DATE,
        bpsd: ADMIT_DATE,
        attendingLastName,
      });

      expected.box35_occurrenceSpanCode = '77';
      expected.box35_occurrenceSpanFromDate = toUb04Date(NON_COVERED_START);
      expected.box35_occurrenceSpanToDate = toUb04Date(NON_COVERED_END);

      // This will throw if PDF not ready yet — toPass retries
      const text = await pages.claims.downloadClaimPdf(rowIndex);
      const errors: string[] = [];
      if (!text.includes('77')) errors.push('Code 77 not found in PDF');
      if (!text.includes(toUb04Date(NON_COVERED_START))) errors.push(`From date ${toUb04Date(NON_COVERED_START)} not found`);
      if (!text.includes(toUb04Date(NON_COVERED_END))) errors.push(`To date ${toUb04Date(NON_COVERED_END)} not found`);
      if (errors.length > 0) throw new Error(`UB-04 verification failed: ${errors.join(', ')}`);
    }).toPass({ timeout: 90_000, intervals: [5_000] });

    console.log(`✅ Step 07c: UB-04 verified — code 77, span: ${toUb04Date(NON_COVERED_START)}-${toUb04Date(NON_COVERED_END)}`);
  });

  // ===========================================================================
  // STEP 08: Submit 812 claim → verify 837 has code 77
  // ===========================================================================
  test('Step 08a: Submit 812 claim', async () => {
    test.setTimeout(TEST_TIMEOUTS.STANDARD);

    await pages.billingWorkflow.submitClaimFromReady(capturedPatientId, '812');

    console.log('✅ Step 08a: 812 claim submitted');
  });

  test('Step 08b: Verify 812 in AR', async () => {
    test.setTimeout(TEST_TIMEOUTS.EXTENDED);

    const { arData } = await pages.billingWorkflow.verifyAndDownloadClaimInAR(
      capturedPatientId,
      capturedPayerName,
      capturedPatientName,
      '837'
    );

    expect(arData.status).toBe('Submitted');
    expect(arData.billedAmount).not.toBe('$0.00');

    console.log(`✅ Step 08b: AR verified — Status: ${arData.status} | Billed: ${arData.billedAmount}`);
  });

  test('Step 08c: Verify 837 has occurrence code 77', async () => {
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

    console.log(`✅ Step 08c: 837 verified — found: ${expectedSegment}`);
  });
});
