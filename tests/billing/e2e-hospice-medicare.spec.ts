/**
 * =============================================================================
 * E2E Hospice Medicare — Full billing flow
 * =============================================================================
 *
 * MODULE: Billing
 * SCENARIO: Create patient → fill all sections → admit → verify claims →
 *           verify NOE details + UB-04 PDF → add Notice Accepted Date →
 *           submit NOE → verify 837 Batch + AR → verify download options →
 *           wait for 812 in Ready → verify 812 PDF
 *
 * RUN:
 *   npx playwright test tests/billing/e2e-hospice-medicare.spec.ts --headed --workers=1
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
import { NoticeExpectedData } from '../../types/billing.types';
import { buildNoticeUb04Expected, buildClaimUb04Expected } from '../../types/ub04.types';

let sharedPage: Page;
let sharedContext: BrowserContext;
let pages: PageObjects;

// Captured from the test flow — no hardcoding
let capturedPatientId = '';
let capturedPatientName = '';
let capturedPayerName = '';
let capturedAttendingPhysician = '';
let capturedCertifyingPhysician = '';

const hospiceFixture = PatientFixtures.PATIENT_FIXTURES.HOSPICE;
const ADMIT_DATE = DateHelper.getDateOfMonth();

test.describe.serial('E2E Hospice Medicare', () => {

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
    capturedPatientId = patientId.toString();

    await pages.patient.searchPatient(capturedPatientId);
    const isPatientVisible = await pages.patient.verifyPatientInGrid(0);
    expect(isPatientVisible).toBeTruthy();

    await pages.patient.getPatientFromGrid(0);
    await sharedPage.waitForLoadState('networkidle');
    await sharedPage.waitForTimeout(2000);
    expect(sharedPage.url()).toContain('patient-details');

    capturedPatientName = await pages.patientDetails.getPatientBillingName();
    console.log(`✅ Step 03: Patient ${capturedPatientId} — name: ${capturedPatientName}`);
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
    capturedAttendingPhysician = await pages.careTeamWorkflow.getAttendingPhysicianName();
    console.log(`✅ Attending physician added — ${capturedAttendingPhysician}`);
  });

  test('Step 07c: Add Caregiver', async () => {
    await pages.careTeamWorkflow.fillCaregiverDetails('add');
    console.log('✅ Caregiver added');
  });

  test('Step 07d: Verify Care Team checkmark', async () => {
    await pages.admitPatientWorkflow.verifySectionCheckmark('care-team');
  });

  // ===========================================================================
  // STEP 08: Fill Benefits (with plan address — no gaps)
  // ===========================================================================
  test('Step 08a: Add Benefit', async () => {
    await pages.benefitsWorkflow.fillBenefitDetails('add', [], 'Hospice', 'Primary',
      createBenefitData({ payerEffectiveDate: ADMIT_DATE, benefitPeriodStartDate: ADMIT_DATE }));
    capturedPayerName = await pages.benefitsWorkflow.getPayerNameByLevel('Primary');
    console.log(`✅ Benefit added — payer: ${capturedPayerName}`);
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
  // STEP 10: Fill Certifications (Written only)
  // ===========================================================================
  test('Step 10: Add Written Certification', async () => {
    await pages.certificationWorkflow.fillCertificationDetails('add', 'Written', [], {
      certType: 'Written',
      certifyingSignedOn: ADMIT_DATE,
      attendingSignedOn: ADMIT_DATE,
      signatureReceivedFromAttending: true,
    });
    const writtenExists = await pages.certification.isWrittenCertificationVisible(0);
    expect(writtenExists).toBeTruthy();
    capturedCertifyingPhysician = await pages.certification.getWrittenCertifyingPhysicianName();
    console.log(`✅ Written certification added — certifying: ${capturedCertifyingPhysician}`);
  });

  test('Step 10c: Verify Certifications checkmark', async () => {
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


    await expect(async () => {
      await pages.billingWorkflow.navigateToBillingClaims('Review');
      await pages.claims.searchByPatient(capturedPatientId);
      await pages.claims.assertClaimCount(2);
      await pages.claims.assertClaimTypeVisible('812');
      await pages.claims.assertClaimTypeVisible('813');
    }).toPass({ timeout: 120_000, intervals: [5_000] });

    console.log('✅ Step 12: 2 claims (812 + 813) detected in Review tab');
  });

  // ===========================================================================
  // STEP 13: Verify 812 claim has NOE-related errors (2 errors only — no cert gap)
  // ===========================================================================
  test('Step 13: Verify 812 claim errors', async () => {
    await pages.billingWorkflow.navigateToBillingClaims('Review');
    await pages.claims.searchByPatient(capturedPatientId);

    const row812 = await pages.claims.findRowByPatientAndBillType(capturedPatientId, '812');
    expect(row812).toBeGreaterThanOrEqual(0);

    const errorCount = await pages.claims.getClaimErrorCount(row812);
    expect(errorCount).toBe(2);

    await pages.claims.expandClaimRow(row812);
    const errors = await pages.claims.getErrorMessages();
    expect(errors).toContain('NOE has not been submitted');
    expect(errors).toContain('Missing Notice Accepted Date');
    console.log(`✅ Step 13: 812 has 2 errors — NOE + Notice Accepted Date`);
  });

  // ===========================================================================
  // STEP 14: Verify Notice in Ready > Notices tab
  // ===========================================================================
  test('Step 14: Verify Notice in Ready > Notices tab', async () => {

    await pages.claims.navigateTo('Ready', 'Notices');
    await pages.claims.searchByPatient(capturedPatientId);
    await pages.claims.assertClaimCount(1);
    await pages.claims.assertClaimTypeVisible('81A');
    console.log('✅ Step 14: 1 Notice (81A) found in Ready > Notices tab');
  });

  // ===========================================================================
  // STEP 15: Verify NOE claim details in Ready > Notices
  // ===========================================================================
  test('Step 15: Verify NOE claim details — all fields + no RLIS + UB04', async () => {
    test.setTimeout(TEST_TIMEOUTS.STANDARD);

    const expectedNotice: NoticeExpectedData = {
      patientName: capturedPatientName,
      payerName: capturedPayerName,
      patientChartId: capturedPatientId,
      serviceStart: ADMIT_DATE,
      serviceEnd: '-',
      daysSinceAdmit: DateHelper.calculateDaysSinceAdmit(ADMIT_DATE),
      billType: '81A',
      siaAmount: '$0.00',
      claimTotalAmount: '$0.00',
      conditionCode: '-',
    };

    const actual = await pages.billingWorkflow.verifyNoticeClaimDetails(capturedPatientId, expectedNotice);
    console.log(`✅ Step 15: NOE verified — ${actual.patientName} | ${actual.payerName} | RLIS absent | UB04 visible`);
  });

  // ===========================================================================
  // STEP 16: Download UB04 PDF and verify form fields
  // ===========================================================================
  test('Step 16: Verify UB-04 PDF contents', async () => {
    test.setTimeout(TEST_TIMEOUTS.STANDARD);

    const claimId = await pages.claims.getRowFieldValue(0, 'claimId');

    const ub04Expected = buildNoticeUb04Expected({
      claimId,
      chartId: capturedPatientId,
      patientName: capturedPatientName,
      payerName: capturedPayerName,
      admitDate: ADMIT_DATE,
      bpsd: ADMIT_DATE,
    });

    await pages.billingWorkflow.verifyClaimUb04(capturedPatientId, ub04Expected, 'Notices');
    console.log(`✅ Step 16: UB-04 PDF verified — Box 4=81A, Box 14=3, Box 15=9, Box 17=30, Box 31=27, no RLIS`);
  });

  // ===========================================================================
  // STEP 17: Navigate to patient and add Notice Accepted Date
  // ===========================================================================
  test('Step 17: Edit Benefits — add Notice Accepted Date', async () => {
    test.setTimeout(TEST_TIMEOUTS.STANDARD);

    // Navigate back to patient record
    await sharedPage.goto(`${CredentialManager.getBaseUrl()}/#/referral-tabs/patient/patient-details/${capturedPatientId}`);
    await sharedPage.waitForLoadState('networkidle');
    await sharedPage.waitForTimeout(TIMEOUTS.MEDIUM);

    await pages.benefitsWorkflow.fillBenefitDetails(
      'edit',
      ['noticeAcceptedDate'],
      'Hospice',
      'Primary',
      { noticeAcceptedDate: ADMIT_DATE }
    );
    console.log('✅ Step 17: Notice Accepted Date added');
  });

  // ===========================================================================
  // STEP 18: Submit NOE from Ready > Notices
  // ===========================================================================
  test('Step 18: Submit NOE — Generate Claim from Ready > Notices', async () => {
    test.setTimeout(TEST_TIMEOUTS.STANDARD);

    await pages.billingWorkflow.submitNoeFromReady(capturedPatientId);
    console.log('✅ Step 18: NOE submitted via Generate Claim');
  });

  // ===========================================================================
  // STEP 19: Verify 837 Batch > Notices + download options (single navigation)
  // ===========================================================================
  test('Step 19: Verify NOE in 837 Batch + verify download formats [837, CSV]', async () => {
    test.setTimeout(TEST_TIMEOUTS.EXTENDED);

    const { detail, availableFormats } = await pages.billingWorkflow.verifyAndDownloadNoeIn837Batch(
      capturedPatientId, capturedPayerName, '837'
    );
    expect(detail.patientId).toBe(capturedPatientId);
    expect(availableFormats).toContain('837');
    expect(availableFormats).toContain('CSV');
    console.log(`✅ Step 19: 837 Batch verified — Claim: ${detail.claimId} | Formats: [${availableFormats.join(', ')}]`);
  });

  // ===========================================================================
  // STEP 20: Verify AR > Notices + download options (single navigation)
  // ===========================================================================
  test('Step 20: Verify NOE in AR + verify download formats [UB-04, 837, CSV]', async () => {
    test.setTimeout(TEST_TIMEOUTS.EXTENDED);

    const { arData, availableFormats } = await pages.billingWorkflow.verifyAndDownloadNoeInAR(
      capturedPatientId, capturedPayerName, capturedPatientName, 'UB-04'
    );
    expect(arData.status).toBe('Submitted');
    expect(arData.billedAmount).toBe('$0.00');
    expect(availableFormats).toContain('UB-04');
    expect(availableFormats).toContain('837');
    expect(availableFormats).toContain('CSV');
    console.log(`✅ Step 20: AR verified — Status: ${arData.status} | Formats: [${availableFormats.join(', ')}]`);
  });

  // ===========================================================================
  // STEP 21: Wait for 812 to move to Ready > Claims
  // ===========================================================================
  test('Step 21: Wait for 812 claim to move to Ready > Claims', async () => {
    test.setTimeout(120_000);
    await pages.billingWorkflow.navigateToBillingClaims('Ready');

    await expect(async () => {
      await pages.claims.navigateTo('Ready', 'Claims');
      await pages.claims.searchByPatient(capturedPatientId);
      await pages.claims.assertClaimTypeVisible('812');
    }).toPass({ timeout: 90_000, intervals: [5_000] });

    console.log('✅ Step 21: 812 claim moved to Ready > Claims');
  });

  // ===========================================================================
  // STEP 23: Verify 812 claim details — PDF link + RLIS present
  // ===========================================================================
  test('Step 22: Verify 812 claim details in Ready > Claims', async () => {
    test.setTimeout(TEST_TIMEOUTS.STANDARD);

    const rowIndex = await pages.claims.findRowByPatientAndBillType(capturedPatientId, '812');
    expect(rowIndex).toBeGreaterThanOrEqual(0);

    const claimId = await pages.claims.getRowFieldValue(rowIndex, 'claimId');
    const serviceStart = await pages.claims.getRowFieldValue(rowIndex, 'serviceStart');
    const serviceEnd = await pages.claims.getRowFieldValue(rowIndex, 'serviceEnd');

    expect(serviceStart).toBe(ADMIT_DATE);
    expect(serviceEnd).not.toBe('-');

    await pages.claims.assertPdfLinkVisible(rowIndex);
    await pages.claims.expandClaimRow(rowIndex);
    await pages.claims.switchClaimDetailTab('Claim Details');
    await pages.claims.assertRlisDataPresent();

    console.log(`✅ Step 22: 812 verified — Claim: ${claimId} | Service: ${serviceStart} - ${serviceEnd} | PDF + RLIS`);
  });

  // ===========================================================================
  // STEP 24: Download 812 PDF and verify UB-04 fields
  // ===========================================================================
  test('Step 23: Download 812 PDF and verify UB-04 fields', async () => {
    test.setTimeout(TEST_TIMEOUTS.STANDARD);

    await pages.claims.navigateTo('Ready', 'Claims');
    await pages.claims.searchByPatient(capturedPatientId);

    const rowIndex = await pages.claims.findRowByPatientAndBillType(capturedPatientId, '812');
    expect(rowIndex).toBeGreaterThanOrEqual(0);

    const claimId = await pages.claims.getRowFieldValue(rowIndex, 'claimId');
    const serviceEnd = await pages.claims.getRowFieldValue(rowIndex, 'serviceEnd');

    // Care team format: "FirstName LastName" → last word is last name
    const attendingParts = capturedAttendingPhysician.trim().split(/\s+/);
    const attendingLastName = attendingParts[attendingParts.length - 1];
    // Cert format: "LastName, FirstName (Role)" → first part before comma
    const certifyingLastName = capturedCertifyingPhysician.split(',')[0].trim();

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

    // Use the workflow's full UB-04 verification (covers all boxes including Box 76 attending)
    await pages.billingWorkflow.verifyClaimUb04(capturedPatientId, expected, 'Claims');

    console.log(`✅ Step 23: 812 PDF verified — Claim: ${claimId} | Attending: ${attendingLastName}`);
  });
});
