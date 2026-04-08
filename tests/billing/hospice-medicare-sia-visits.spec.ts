/**
 * =============================================================================
 * E2E Hospice Medicare — Visits + SIA Billing Verification
 * =============================================================================
 *
 * MODULE: Billing + Visits
 * SCENARIO: Create patient → fill all sections → admit → verify claims →
 *           verify 812 errors → login as RN →
 *           create + record + complete INA visit →
 *           create + record + complete Postmortem visit (discharges patient) →
 *           login as MD → verify 814 discharge claim →
 *           verify SIA calculated + RLIS present + service end = death date
 *
 * BILL TYPE RULES:
 *   814: Discharge claim (discharge month ≠ admit month)
 *   811: Discharge claim (discharge month = admit month)
 *
 * SIA (Service Intensity Add-on):
 *   Skilled Nursing Visit (Revenue 0551, HCPCS G0299) → ~$33.93 per visit
 *   Routine Home Care (Revenue 0651, HCPCS Q5001) → $0.00
 *
 * ROLES: MD (login, admit, billing), RN (INA + Postmortem visits)
 *
 * RUN:
 *   npx playwright test tests/billing/hospice-medicare-sia-visits.spec.ts --headed --workers=1
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
let capturedCertifyingPhysician = '';

const hospiceFixture = PatientFixtures.PATIENT_FIXTURES.HOSPICE;
const ADMIT_DATE = DateHelper.getDateOfMonth();

// INA visit: 2 days ago
const INA_VISIT_DATE = DateHelper.getPastDate(2);

// Postmortem: death yesterday at 14:00, visit yesterday 10:00-10:30
const POSTMORTEM_VISIT_DATE = DateHelper.getPastDate(1);

// Death Assessment ion-picker parts (yesterday)
const deathDate = new Date();
deathDate.setDate(deathDate.getDate() - 1);
const DEATH_MONTH = deathDate.toLocaleString('en-US', { month: 'short' });
const DEATH_DAY = String(deathDate.getDate());
const DEATH_YEAR = String(deathDate.getFullYear());

test.describe.serial('E2E Hospice Medicare — Visits + SIA Billing', () => {

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
    console.log('Step 01: Logged in as MD');
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
    console.log(`Step 02: Created patient ${result.patientFirstName} ${result.patientLastName} (ID: ${result.patientId})`);
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
    console.log(`Step 03: Patient ${capturedPatientId} — name: ${capturedPatientName}`);
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
    console.log('Caller information added');
  });

  test('Step 04b: Add Referrer Information', async () => {
    const result = await pages.patientWorkflow.addReferrerInformation({
      sameAsCaller: true,
    });
    expect(result.success).toBeTruthy();
    console.log('Referrer information added');
  });

  test('Step 04c: Add Referring Physician', async () => {
    const result = await pages.patientWorkflow.addReferringPhysicianInformation('add', {
      sameAsReferrer: true,
    });
    expect(result.success).toBeTruthy();
    console.log('Referring physician added');
  });

  test('Step 04d: Add Ordering Physician', async () => {
    const result = await pages.patientWorkflow.addOrderingPhysicianInformation('add', {
      sameAsReferringPhysician: true,
    });
    expect(result.success).toBeTruthy();
    console.log('Ordering physician added');
  });

  // ===========================================================================
  // STEP 05: Add LOC
  // ===========================================================================
  test('Step 05: Add Routine Home Care LOC', async () => {
    await pages.locWorkflow.addLOCOrder('Routine Home Care', {
      startDate: ADMIT_DATE,
    });
    console.log('Routine Home Care LOC added');
  });

  // ===========================================================================
  // STEP 06: Add Diagnosis + Verify Profile checkmark
  // ===========================================================================
  test('Step 06a: Add Primary Diagnosis', async () => {
    await pages.diagnosisWorkflow.fillDiagnosisDetails('add', {
      primaryDiagnosis: { searchText: 'C801', optionIndex: 0 },
    });
    console.log('Primary diagnosis added');
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
    console.log('Care team and standard roles added');
  });

  test('Step 07b: Add Attending Physician', async () => {
    await pages.careTeamWorkflow.fillAttendingPhysician('add', [], 0,
      createAttendingPhysicianData({ startDate: ADMIT_DATE }));
    const count = await pages.careTeamWorkflow.getAttendingPhysicianCount();
    expect(count).toBeGreaterThan(0);
    capturedAttendingPhysician = await pages.careTeamWorkflow.getAttendingPhysicianName();
    console.log(`Attending physician added — ${capturedAttendingPhysician}`);
  });

  test('Step 07c: Add Caregiver', async () => {
    await pages.careTeamWorkflow.fillCaregiverDetails('add');
    console.log('Caregiver added');
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
    console.log(`Benefit added — payer: ${capturedPayerName}`);
  });

  test('Step 08b: Verify Benefits checkmark', async () => {
    await pages.admitPatientWorkflow.verifySectionCheckmark('benefits');
  });

  // ===========================================================================
  // STEP 09: Fill Consents section
  // ===========================================================================
  test('Step 09a: Add Consents', async () => {
    await pages.consentsWorkflow.fillConsents('yes');
    console.log('Consents completed');
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
    console.log(`Written certification added — certifying: ${capturedCertifyingPhysician}`);
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
    console.log(`Step 11: Patient admitted (date: ${ADMIT_DATE})`);
  });

  // ===========================================================================
  // STEP 12: Wait for claims to generate
  // ===========================================================================
  test('Step 12: Wait for claims to generate', async () => {
    test.setTimeout(TEST_TIMEOUTS.EXTENDED);
    console.log('Waiting for claims to generate (polling Review tab)...');

    await expect(async () => {
      await pages.billingWorkflow.navigateToBillingClaims('Review');
      await pages.claims.searchByPatient(capturedPatientId);
      await pages.claims.assertClaimCount(2);
      await pages.claims.assertClaimTypeVisible('812');
      await pages.claims.assertClaimTypeVisible('813');
    }).toPass({ timeout: 120_000, intervals: [5_000] });

    console.log('Step 12: 2 claims (812 + 813) detected in Review tab');
  });

  // ===========================================================================
  // STEP 13: Verify 812 claim has NOE-related errors
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
    console.log('Step 13: 812 has 2 errors — NOE + Notice Accepted Date');
  });

  // ===========================================================================
  // STEP 14: Login as RN and navigate to Care Plan for visits
  // ===========================================================================
  test('Step 14: Login as RN and navigate to patient Care Plan', async () => {
    test.setTimeout(TEST_TIMEOUTS.LONG);
    await pages.login.loginAsRole('RN');
    TestDataManager.setRole('RN');

    await pages.dashboard.navigateToModule('Patient');
    await pages.patient.searchPatient(capturedPatientId);
    await pages.patient.getPatientFromGrid(0);
    await pages.carePlan.navigateToCarePlan();
    console.log('Step 14: Logged in as RN, on Care Plan');
  });

  // ===========================================================================
  // STEP 15: Create, record, and complete INA visit (RN)
  // ===========================================================================
  test('Step 15a: Create INA visit', async () => {
    test.setTimeout(TEST_TIMEOUTS.LONG);
    await pages.visitWorkflow.createVisitByType('INA');
    console.log('Step 15a: INA visit created via config');
  });

  test('Step 15b: Record INA visit (BP + Narrative + HIS preview)', async () => {
    test.setTimeout(TEST_TIMEOUTS.LONG);
    await pages.visitWorkflow.recordINAVisit();
    console.log('Step 15b: INA visit recorded');
  });

  test('Step 15c: Complete INA visit (signature + dates)', async () => {
    test.setTimeout(TEST_TIMEOUTS.LONG);
    await pages.visitWorkflow.completeVisitByType('INA', {
      visitDate: INA_VISIT_DATE,
    });
    console.log(`Step 15c: INA visit completed — ${INA_VISIT_DATE}`);
  });

  test('Step 15d: Verify INA visit in Care Plan grid', async () => {
    test.setTimeout(TEST_TIMEOUTS.LONG);
    await pages.carePlan.waitForVisitCompletionDialogs();

    // Navigate away then back to force visits grid reload
    await pages.patientDetails.clickSidebarTab('profile');
    await pages.carePlan.navigateToCarePlan();

    const visitRow = await pages.carePlan.findVisitByType('Initial Nursing Assessment');
    expect(visitRow).toBeGreaterThanOrEqual(0);
    const status = await pages.carePlan.getVisitStatus(visitRow);
    expect(status).toBe('Completed');
    console.log('Step 15d: INA visit verified — Completed');
  });

  // ===========================================================================
  // STEP 16: Create, record, and complete Postmortem visit (RN)
  // WARNING: This discharges the patient as Expired
  // ===========================================================================
  test('Step 16a: Create Postmortem visit', async () => {
    test.setTimeout(TEST_TIMEOUTS.LONG);
    await pages.visitWorkflow.createVisitByType('POSTMORTEM');
    console.log('Step 16a: Postmortem visit created via config');
  });

  test('Step 16b: Record Postmortem visit (Death Assessment + BP + Narrative)', async () => {
    test.setTimeout(TEST_TIMEOUTS.LONG);
    await pages.visitWorkflow.recordPostmortemVisit({
      month: DEATH_MONTH,
      day: DEATH_DAY,
      year: DEATH_YEAR,
      hour: '10',
      minute: '00',
    });
    console.log('Step 16b: Postmortem visit recorded');
  });

  test('Step 16c: Complete Postmortem visit (Discharge as Expired)', async () => {
    test.setTimeout(TEST_TIMEOUTS.LONG);
    await pages.visitWorkflow.completeVisitByType('POSTMORTEM', {
      visitDate: POSTMORTEM_VISIT_DATE,
      startTime: { hours: '10', minutes: '00' },
      endTime: { hours: '10', minutes: '30' },
    });
    console.log('Step 16c: Postmortem visit completed — patient discharged as Expired');
  });

  test('Step 16d: Verify Postmortem visit in Care Plan grid', async () => {
    test.setTimeout(TEST_TIMEOUTS.LONG);

    // Navigate away then back to force visits grid reload
    await pages.patientDetails.clickSidebarTab('profile');
    await pages.carePlan.navigateToCarePlan();

    const visitRow = await pages.carePlan.findVisitByType('Postmortem Encounter');
    expect(visitRow).toBeGreaterThanOrEqual(0);
    const status = await pages.carePlan.getVisitStatus(visitRow);
    expect(status).toBe('Completed');
    console.log('Step 16d: Postmortem visit verified — Completed');
  });

  // ===========================================================================
  // STEP 17: Re-login as MD and verify billing claims updated after visits
  // ===========================================================================
  test('Step 17a: Login as MD', async () => {
    test.setTimeout(TEST_TIMEOUTS.LONG);
    await pages.login.loginAsRole('MD');
    TestDataManager.setRole('MD');
    console.log('Step 17a: Logged in as MD');
  });

  test('Step 17b: Verify 814 discharge claim — SIA + service end = death date', async () => {
    test.setTimeout(TEST_TIMEOUTS.EXTENDED);

    // Poll for 814 claim with non-zero SIA (visits need time to reflect)
    await expect(async () => {
      await pages.billingWorkflow.navigateToBillingClaims('Review');
      await pages.claims.searchByPatient(capturedPatientId);
      await pages.claims.assertClaimTypeVisible('814');

      const row814 = await pages.claims.findRowByPatientAndBillType(capturedPatientId, '814');
      expect(row814).toBeGreaterThanOrEqual(0);

      const siaAmount = await pages.claims.getRowFieldValue(row814, 'siaAmount');
      expect(siaAmount).not.toBe('$0.00');
    }).toPass({ timeout: 120_000, intervals: [5_000] });

    const row814 = await pages.claims.findRowByPatientAndBillType(capturedPatientId, '814');
    const billType = await pages.claims.getRowFieldValue(row814, 'billType');
    const siaAmount = await pages.claims.getRowFieldValue(row814, 'siaAmount');
    const serviceEnd = await pages.claims.getRowFieldValue(row814, 'serviceEnd');
    const claimTotal = await pages.claims.getRowFieldValue(row814, 'claimTotalAmount');

    // Service end must equal death date (yesterday)
    expect(serviceEnd).toBe(POSTMORTEM_VISIT_DATE);
    expect(billType).toBe('814');
    expect(siaAmount).not.toBe('$0.00');

    console.log(`Step 17b: 814 verified — bill type: ${billType}, service end: ${serviceEnd}, SIA: ${siaAmount}, total: ${claimTotal}`);
  });

  test('Step 17c: Verify 814 RLIS — visit revenue line items present', async () => {
    test.setTimeout(TEST_TIMEOUTS.STANDARD);

    await pages.billingWorkflow.navigateToBillingClaims('Review');
    await pages.claims.searchByPatient(capturedPatientId);

    const row814 = await pages.claims.findRowByPatientAndBillType(capturedPatientId, '814');
    expect(row814).toBeGreaterThanOrEqual(0);

    await pages.claims.expandClaimRow(row814);
    await pages.claims.switchClaimDetailTab('Claim Details');
    await pages.claims.assertRlisDataPresent();

    console.log('Step 17c: 814 RLIS verified — visit revenue line items present');
  });
});
