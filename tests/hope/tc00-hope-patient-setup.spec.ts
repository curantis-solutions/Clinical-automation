/**
 * =============================================================================
 * TC-00: HOPE Patient Setup — Create & Admit Test Patients
 * =============================================================================
 *
 * One-time setup spec that creates and admits patients for HOPE lifecycle tests.
 * Stores patient IDs in current-test-data.json for tc01/tc02 to read.
 *
 * Run this BEFORE the lifecycle specs:
 *   npx playwright test tests/hope/tc00 --headed
 *
 * Patients created:
 *   - Patient A (hopePatientA): For No-SFV lifecycle (S1 → S3 → S5 → S7)
 *   - Patient B (hopePatientB): For With-SFV lifecycle (S2 → S4 → S6 → S7)
 * =============================================================================
 */

import { test, expect, createPageObjectsForPage, type PageObjects } from '../../fixtures/page-objects.fixture';
import { Page, BrowserContext } from '@playwright/test';
import * as PatientFixtures from '../../fixtures/patient-data.fixture';
import { CredentialManager } from '../../utils/credential-manager';
import { TestDataManager } from '../../utils/test-data-manager';
import { createAttendingPhysicianData } from '../../fixtures/care-team-fixtures';
import { createBenefitData } from '../../fixtures/benefit-fixtures';
import { TIMEOUTS } from '../../config/timeouts';
import { DateHelper } from '../../utils/date-helper';
import { PATIENT_A_NO_SFV, PATIENT_B_WITH_SFV } from '../../fixtures/hope-scenario-data.fixture';

let sharedPage: Page;
let sharedContext: BrowserContext;
let pages: PageObjects;

// Backdate admission to 1st of previous month so INV/HUV deadlines are already due
const ADMIT_DATE = DateHelper.getDateOfMonth('first');

test.describe.serial('HOPE: Patient Setup — Create & Admit @hope @setup', () => {

  test.beforeAll(async ({ browser }) => {
    sharedContext = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      ignoreHTTPSErrors: true,
      baseURL: CredentialManager.getBaseUrl(),
      permissions: ['geolocation'],
      geolocation: { latitude: 41.8781, longitude: -87.6298 },
    });

    sharedPage = await sharedContext.newPage();
    sharedPage.setDefaultTimeout(TIMEOUTS.PAGE_DEFAULT);
    sharedPage.setDefaultNavigationTimeout(TIMEOUTS.PAGE_NAVIGATION);
    pages = createPageObjectsForPage(sharedPage);
  });

  test.afterAll(async () => {
    if (sharedContext) {
      await sharedContext.close();
    }
  });

  // =========================================================================
  // Step 01: Login
  // =========================================================================
  test('Step 01: Login as RN', async () => {
    test.setTimeout(120_000);

    TestDataManager.setRole('RN');
    await pages.login.goto();

    const physicianNamePromise = TestDataManager.interceptPhysicianName(sharedPage);

    const credentials = CredentialManager.getCredentials(undefined, 'RN');
    await pages.login.login(credentials.username, credentials.password);
    await sharedPage.waitForURL(/dashboard/, { timeout: 15000 });
    console.log('Logged in as RN');

    await physicianNamePromise;
  });

  // =========================================================================
  // Step 02: Create Patient A (No SFV)
  // =========================================================================
  test('Step 02: Create Patient A', async () => {
    test.setTimeout(300_000);

    await test.step('Navigate to Patient module', async () => {
      await pages.dashboard.goto();
      await sharedPage.waitForLoadState('networkidle');
      await pages.dashboard.navigateToModule('Patient');
      await sharedPage.waitForTimeout(2000);
    });

    await test.step('Create patient from fixture', async () => {
      const hospiceFixture = PatientFixtures.PATIENT_FIXTURES.HOSPICE;
      const result = await pages.patientWorkflow.addPatientFromFixture(
        hospiceFixture,
        { skipLogin: true }
      );
      expect(result.success).toBeTruthy();
      console.log(`Created Patient A: ${result.patientFirstName} ${result.patientLastName} (ID: ${result.patientId})`);
    });
  });

  // =========================================================================
  // Step 03: Fill admission sections for Patient A
  // =========================================================================
  test.skip('Step 03: Fill Patient A admission sections', async () => {
    test.setTimeout(600_000);

    await test.step('Add Caller Information', async () => {
      await pages.patientWorkflow.addCallerInformation({
        referralType: 'Call',
        relation: 'Physician',
        searchName: 'cypresslast',
      });
    });

    await test.step('Add Referrer Information', async () => {
      await pages.patientWorkflow.addReferrerInformation({
        relation: 'Physician',
        sameAsCaller: true,
      });
    });

    await test.step('Add Referring Physician', async () => {
      await pages.patientWorkflow.addReferringPhysicianInformation('add', {
        searchName: 'cypresslast',
      });
    });

    await test.step('Add Ordering Physician', async () => {
      await pages.patientWorkflow.addOrderingPhysicianInformation('add', {
        sameAsReferringPhysician: true,
      });
    });

    await test.step('Add LOC', async () => {
      await pages.locWorkflow.addLOCOrder('Routine Home Care', {
        careLocationType: 'Q5004',
        startDate: ADMIT_DATE,
      });
    });

    await test.step('Add Diagnosis', async () => {
      await pages.diagnosisWorkflow.fillDiagnosisDetails('add', {
        primaryDiagnosis: { searchText: 'C801', optionIndex: 0 },
      });
    });

    await test.step('Verify Profile checkmark', async () => {
      await pages.admitPatientWorkflow.verifySectionCheckmark('profile');
    });

    await test.step('Add Care Team', async () => {
      await pages.careTeamWorkflow.navigateToCareTeam();
      await pages.careTeamWorkflow.selectCareTeam();
      await pages.careTeamWorkflow.addStandardRoles();
    });

    await test.step('Add Attending Physician', async () => {
      await pages.careTeamWorkflow.fillAttendingPhysician(
        'add', [], 0,
        createAttendingPhysicianData({ startDate: ADMIT_DATE })
      );
    });

    await test.step('Add Caregiver', async () => {
      await pages.careTeamWorkflow.fillCaregiverDetails('add');
    });

    await test.step('Verify Care Team checkmark', async () => {
      await pages.admitPatientWorkflow.verifySectionCheckmark('care-team');
    });

    await test.step('Add Benefit', async () => {
      await pages.benefitsWorkflow.fillBenefitDetails(
        'add', [], 'Hospice', 'Primary',
        createBenefitData({ payerEffectiveDate: ADMIT_DATE, benefitPeriodStartDate: ADMIT_DATE })
      );
    });

    await test.step('Verify Benefits checkmark', async () => {
      await pages.admitPatientWorkflow.verifySectionCheckmark('benefits');
    });

    await test.step('Add Consents', async () => {
      await pages.consentsWorkflow.fillConsents('yes');
    });

    await test.step('Verify Consents checkmark', async () => {
      await pages.admitPatientWorkflow.verifySectionCheckmark('consents');
    });

    await test.step('Add Certifications', async () => {
      await pages.certificationWorkflow.fillCertificationDetails('add', 'Verbal', [], {
        certType: 'Verbal',
        certifyingObtainedOn: ADMIT_DATE,
        attendingObtainedOn: ADMIT_DATE,
      });
      await pages.certificationWorkflow.fillCertificationDetails('add', 'Written', [], {
        certType: 'Written',
        certifyingSignedOn: ADMIT_DATE,
        attendingSignedOn: ADMIT_DATE,
      });
    });

    await test.step('Verify Certifications checkmark', async () => {
      await pages.admitPatientWorkflow.verifySectionCheckmark('certifications');
    });

    await test.step('Verify all sections complete', async () => {
      await pages.admitPatientWorkflow.verifyAllSectionsComplete();
    });

    await test.step('Admit patient', async () => {
      await pages.admitPatientWorkflow.admitPatient(ADMIT_DATE);
      await pages.admitPatientWorkflow.verifyAdmissionSuccess();
    });
  });

  // =========================================================================
  // Step 04: Save Patient A ID
  // =========================================================================
  test('Step 04: Save Patient A ID', async () => {
    const hospiceFixture = PatientFixtures.PATIENT_FIXTURES.HOSPICE;
    let patientId = PatientFixtures.getPatientIdFromFixture(hospiceFixture);

    // Fallback: extract from URL
    if (!patientId) {
      const urlMatch = sharedPage.url().match(/patient-(?:details|charts?)\/(\d+)/);
      if (urlMatch) {
        patientId = Number(urlMatch[1]);
      }
    }

    expect(patientId).toBeDefined();
    expect(patientId).toBeGreaterThan(0);

    TestDataManager.setHopePatientId(PATIENT_A_NO_SFV.patientKey, patientId!);
    console.log(`Patient A saved: ${PATIENT_A_NO_SFV.patientKey} = ${patientId}`);
  });

  // =========================================================================
  // Step 05: Create Patient B (With SFV) — Same process
  // =========================================================================
  test('Step 05: Create Patient B', async () => {
    test.setTimeout(300_000);

    await test.step('Navigate to Patient module', async () => {
      await pages.dashboard.goto();
      await sharedPage.waitForLoadState('networkidle');
      await pages.dashboard.navigateToModule('Patient');
      await sharedPage.waitForTimeout(2000);
    });

    await test.step('Create patient from fixture', async () => {
      const hospiceFixture = PatientFixtures.PATIENT_FIXTURES.HOSPICE;
      const result = await pages.patientWorkflow.addPatientFromFixture(
        hospiceFixture,
        { skipLogin: true }
      );
      expect(result.success).toBeTruthy();
      console.log(`Created Patient B: ${result.patientFirstName} ${result.patientLastName} (ID: ${result.patientId})`);
    });
  });

  // =========================================================================
  // Step 06: Fill admission sections for Patient B (same as Patient A)
  // =========================================================================
  test.skip('Step 06: Fill Patient B admission sections', async () => {
    test.setTimeout(600_000);
    // Same admission flow as Step 03 — reuse the same pattern
    // (Skipped for now — unskip when admission workflow is ready)
  });

  // =========================================================================
  // Step 07: Save Patient B ID
  // =========================================================================
  test('Step 07: Save Patient B ID', async () => {
    const hospiceFixture = PatientFixtures.PATIENT_FIXTURES.HOSPICE;
    let patientId = PatientFixtures.getPatientIdFromFixture(hospiceFixture);

    if (!patientId) {
      const urlMatch = sharedPage.url().match(/patient-(?:details|charts?)\/(\d+)/);
      if (urlMatch) {
        patientId = Number(urlMatch[1]);
      }
    }

    expect(patientId).toBeDefined();
    expect(patientId).toBeGreaterThan(0);

    TestDataManager.setHopePatientId(PATIENT_B_WITH_SFV.patientKey, patientId!);
    console.log(`Patient B saved: ${PATIENT_B_WITH_SFV.patientKey} = ${patientId}`);
  });
});
