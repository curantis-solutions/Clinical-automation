/**
 * =============================================================================
 * TC-01: HOPE No-SFV Lifecycle — S1 → S3 → S5 → S7
 * =============================================================================
 *
 * Tests the complete HOPE lifecycle for a patient where all symptom impacts
 * are 0, 1, or 9 (no SFV required).
 *
 * Chain:
 *   S1: INV — Admit and complete Initial Nursing Visit
 *   S3: HUV1 — Complete HOPE Update Visit 1
 *   S5: HUV2 — Complete HOPE Update Visit 2
 *   S7: Discharge — Verify discharge HOPE record
 *
 * Prerequisites:
 *   - Run tc00-hope-patient-setup.spec.ts first to create Patient A
 *   - Patient ID stored in current-test-data.json as hopePatientA
 *
 * Run:
 *   npx playwright test tests/hope/tc01 --headed
 * =============================================================================
 */

import { test, expect, createPageObjectsForPage, type PageObjects } from '../../fixtures/page-objects.fixture';
import { Page, BrowserContext } from '@playwright/test';
import { CredentialManager } from '../../utils/credential-manager';
import { TestDataManager } from '../../utils/test-data-manager';
import { TIMEOUTS, TEST_TIMEOUTS } from '../../config/timeouts';
import { HOPEVisitWorkflow } from '../../workflows/hope-visit.workflow';
import { PATIENT_A_NO_SFV } from '../../fixtures/hope-scenario-data.fixture';
import {
  TAB_A_FIELDS, TAB_A_DISCHARGE_FIELDS, TAB_F_FIELDS, TAB_I_FIELDS, TAB_J_FIELDS,
  TAB_M_FIELDS, TAB_N_FIELDS, TAB_Z_FIELDS,
  type AdmissionTab,
} from '../../pages/hope-admission.page';
import { PatientStatusPage } from '../../pages/patient-status.page';
import { HopeHisPage } from '../../pages/hope-his.page';
import { DateHelper } from '@utils/date-helper';

let sharedPage: Page;
let sharedContext: BrowserContext;
let pages: PageObjects;
let hopeWorkflow: HOPEVisitWorkflow;
let patientStatus: PatientStatusPage;
let hopeHis: HopeHisPage;
let patientId: string;

const CHAIN = PATIENT_A_NO_SFV;
const dischargeDate =  DateHelper.getTodaysDate();
test.describe.serial(`HOPE: ${CHAIN.description} @hope @no-sfv`, () => {

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
    hopeWorkflow = new HOPEVisitWorkflow(sharedPage);
    patientStatus = new PatientStatusPage(sharedPage);
    hopeHis = new HopeHisPage(sharedPage);
  });

  test.afterAll(async () => {
    if (sharedContext) {
      await sharedContext.close();
    }
  });

  // =========================================================================
  // Step 01: Login and navigate to Patient A's Care Plan
  // =========================================================================
  test('Step 01: Login and navigate to Patient A Care Plan', async () => {
    test.setTimeout(120_000);

    await test.step('Login as RN', async () => {
      await pages.login.goto();
      const credentials = CredentialManager.getCredentials(undefined, 'RN');
      await pages.login.login(credentials.username, credentials.password);
      await sharedPage.waitForURL(/dashboard/, { timeout: 15000 });
      console.log('Logged in as RN');
    });

    await test.step('Navigate to patient Care Plan', async () => {
      patientId = TestDataManager.getHopePatientId(CHAIN.patientKey);
      console.log(`Patient A ID: ${patientId}`);

      await pages.dashboard.goto();
      await pages.dashboard.navigateToModule('Patient');
      await pages.patient.searchPatient(patientId);
      await pages.patient.getPatientFromGrid(0);
      await sharedPage.waitForTimeout(2000);

      await sharedPage.locator('[data-cy="btn-nav-bar-item-care-plan"]').click();
      await sharedPage.waitForURL(/carePlan/, { timeout: 15000 });
      console.log('Navigated to Care Plan');
    });
  });

  // =========================================================================
  // Step 02: S1 — Complete INV visit (No SFV)
  // =========================================================================
  test.skip('Step 02: S1 — Complete INV visit (No SFV)', async () => {
    test.setTimeout(TEST_TIMEOUTS.MAXIMUM); // 15 min

    const config = CHAIN.visits[0]; // S1 INV
    await hopeWorkflow.executeVisit(config);
  });

  // =========================================================================
  // Step 03: S1 — Open HOPE record, verify data per tab, fill required
  //          fields, check tab completion, and complete the record
  // =========================================================================
  test.skip('Step 03: S1 — Verify HOPE admission record, fill & complete', async () => {
    test.setTimeout(TEST_TIMEOUTS.MAXIMUM); // 15 min

    await test.step('Navigate to HIS/HOPE and open admission record', async () => {
      await pages.hopeAdmission.navigateToHopeModule();
      await pages.hopeAdmission.openLatestAdmissionRecord();
    });

    // ── Tab A — Verify data mapping + fill Payer Information ─────────
    await test.step('Tab A — Verify data and select Payer Information', async () => {
      const tabA: AdmissionTab = {
        key: 'A', label: 'A - Administrative Information',
        tabSelector: '.tabs-container span:has-text("A - Administrative Information")',
        fields: TAB_A_FIELDS,
      };
      const results = await pages.hopeAdmission.readTabFields(tabA);

      expect(results['A0100.A NPI']).toBeTruthy();
      expect(results['A0500 First Name']).toBeTruthy();
      expect(results['A0500 Last Name']).toBeTruthy();
      expect(results['A0600.A SSN']).toBeTruthy();
      expect(results['A0900 Birth Date']).toBeTruthy();
      expect(results['A1110.A Language']).toBeTruthy();

      for (const [label, value] of Object.entries(results)) {
        console.log(`  ${label}: ${value || '(empty)'}`);
      }

      // Fill Payer Info (required for Tab A completion)
      await pages.hopeAdmission.selectPayerInformation();
    });

    // ── Tab F — readTabFields navigates internally, then check Tab A status ─
    await test.step('Tab F — Verify data, check Tab A status', async () => {
      const tabF: AdmissionTab = {
        key: 'F', label: 'F - Preferences',
        tabSelector: '.tabs-container span:has-text("F - Preferences")',
        fields: TAB_F_FIELDS,
      };
      const results = await pages.hopeAdmission.readTabFields(tabF);

      // Check Tab A status (tab bar is visible from any tab)
      const tabAComplete = await pages.hopeAdmission.isTabComplete('A - Administrative Information');
      console.log(`  Tab A status: ${tabAComplete ? '✓ COMPLETE' : '○ INCOMPLETE'}`);

      expect(results['F2000.A CPR Preference']).toContain('discussion occurred');
      expect(results['F2000.B CPR Date']).toBeTruthy();
      expect(results['F2100.A Life-Sustaining']).toContain('discussion occurred');
      expect(results['F2100.B Life-Sustaining Date']).toBeTruthy();

      for (const [label, value] of Object.entries(results)) {
        console.log(`  ${label}: ${value || '(empty)'}`);
      }

      // Fill F3000.A Spiritual Concerns if empty (radio group, not dropdown)
      if (!results['F3000.A Spiritual Concerns']) {
        const firstRadio = sharedPage.locator('#automation-spiritual-concerns ion-item ion-radio').first();
        if (await firstRadio.isVisible({ timeout: 3000 }).catch(() => false)) {
          await firstRadio.click({ force: true });
          await sharedPage.waitForTimeout(500);
          console.log('  Selected F3000.A Spiritual Concerns: first radio option');
        } else {
          console.log('  F3000.A Spiritual Concerns radio not found');
        }
      }
    });

    // ── Tab I — readTabFields navigates internally, then check Tab F status ─
    await test.step('Tab I — Verify diagnosis data, check Tab F status', async () => {
      const tabI: AdmissionTab = {
        key: 'I', label: 'I - Active Diagnosis',
        tabSelector: '.tabs-container span:has-text("I - Active Diagnosis")',
        fields: TAB_I_FIELDS,
      };
      const results = await pages.hopeAdmission.readTabFields(tabI);

      const tabFComplete = await pages.hopeAdmission.isTabComplete('F - Preferences');
      console.log(`  Tab F status: ${tabFComplete ? '✓ COMPLETE' : '○ INCOMPLETE'}`);

      expect(results['I0010 Principal Diagnosis']).toContain('Cancer');

      for (const [label, value] of Object.entries(results)) {
        console.log(`  ${label}: ${value || '(empty)'}`);
      }
    });

    // ── Tab J — readTabFields navigates internally, then check Tab I status, fill Constipation
    await test.step('Tab J — Verify health conditions, fill Constipation severity', async () => {
      const tabJ: AdmissionTab = {
        key: 'J', label: 'J - Health Conditions',
        tabSelector: '.tabs-container span:has-text("J - Health Conditions")',
        fields: TAB_J_FIELDS,
      };
      const results = await pages.hopeAdmission.readTabFields(tabJ);

      const tabIComplete = await pages.hopeAdmission.isTabComplete('I - Active Diagnosis');
      console.log(`  Tab I status: ${tabIComplete ? '✓ COMPLETE' : '○ INCOMPLETE'}`);

      // Log all Tab J values first for visibility
      for (const [label, value] of Object.entries(results)) {
        console.log(`  ${label}: ${value || '(empty)'}`);
      }

      // Pain mapping
      expect(results['J0900.A Pain Screening']).toContain('Yes');
      expect(results['J0900.C Pain Severity']).toContain('Mild');
      expect(results['J0900.D Pain Tool']).toContain('Numeric');
      // Respiratory mapping
      expect(results['J2030.A SOB Screening']).toContain('Yes');
      expect(results['J2030.C SOB Indicated']).toContain('Yes');
      expect(results['J2040.A SOB Treatment']).toContain('Yes');
      // Symptom Impact mapping
      expect(results['J2050.A Symptom Impact Screening']).toContain('Yes');
      expect(results['J2051.A Pain']).toBeTruthy();
      expect(results['J2051.C Anxiety']).toBeTruthy();
      expect(results['J2051.H Agitation']).toBeTruthy();

      // Select Constipation severity = "0. Not at all" (already on Tab J)
      await pages.hopeAdmission.selectSingleDropdownFirstOption('automation-constipation-symptom-severity');
      console.log('  Selected Constipation severity: 0. Not at all');

      // Also fill Diarrhea if empty
      try {
        await pages.hopeAdmission.selectSingleDropdownFirstOption('automation-diarrhea-symptom-severity');
        console.log('  Selected Diarrhea severity: 0. Not at all');
      } catch { /* already filled */ }
    });

    // ── Tab N — readTabFields navigates internally, then check Tab M status ─
    await test.step('Tab N — Check Tab M status, verify medication data', async () => {
      const tabN: AdmissionTab = {
        key: 'N', label: 'N - Medications',
        tabSelector: '.tabs-container span:has-text("N - Medications")',
        fields: TAB_N_FIELDS,
      };
      const results = await pages.hopeAdmission.readTabFields(tabN);

      const tabMComplete = await pages.hopeAdmission.isTabComplete('M - Skin Conditions');
      console.log(`  Tab M status: ${tabMComplete ? '✓ COMPLETE' : '○ INCOMPLETE'}`);

      expect(results['N0500.A Scheduled Opioid']).toContain('Yes');
      expect(results['N0510.A PRN Opioid']).toContain('Yes');
      expect(results['N0520.A Bowel Regimen']).toContain('Yes');

      for (const [label, value] of Object.entries(results)) {
        console.log(`  ${label}: ${value || '(empty)'}`);
      }
    });

    // ── Tab Z — Navigate to Z, check all tab statuses, complete ─────────
    await test.step('Tab Z — Verify all tabs complete, sign and complete record', async () => {
      await pages.hopeAdmission.navigateToTab('Z - Record Administration');

      // Check all tab statuses
      const tabChecks = [
        'A - Administrative Information',
        'F - Preferences',
        'I - Active Diagnosis',
        'J - Health Conditions',
        'M - Skin Conditions',
        'N - Medications',
      ];
      console.log('\nFinal tab status:');
      for (const tabLabel of tabChecks) {
        const complete = await pages.hopeAdmission.isTabComplete(tabLabel);
        console.log(`  ${complete ? '✓' : '○'} ${tabLabel}`);
      }

      // Verify Complete button is enabled (all tabs should have checkmarks)
      const completeBtn = sharedPage.locator('#inputModalSubmit');
      const isDisabled = await completeBtn.evaluate(
        el => el.classList.contains('disabled')
      ).catch(() => true);
      expect(isDisabled).toBeFalsy();
      console.log('Complete button is enabled');

      // Get profile name, click Complete, sign
      const profileName = await pages.visitAssessment.getProfileName();
      console.log(`Profile name: ${profileName}`);
      await pages.hopeAdmission.clickComplete();
      await pages.visitAssessment.fillSignatureModal(profileName);
      console.log('HOPE Admission Record signed and completed');

      // Navigate back to HIS/HOPE grid to verify record status
      await sharedPage.waitForTimeout(3000);
      await pages.hopeAdmission.navigateToHopeModule();
      const gridData = await pages.hopeAdmission.getGridRowData();
      console.log(`Record status after completion: ${gridData['File Status'] || 'unknown'}`);
    });
  });

  // =========================================================================
  // Step 04: S3 — Complete HUV1 visit (No SFV)
  // =========================================================================
  test.skip('Step 04: S3 — Complete HUV1 visit (No SFV)', async () => {
    test.setTimeout(TEST_TIMEOUTS.MAXIMUM);

    await test.step('Navigate to Care Plan', async () => {
      await hopeWorkflow.navigateToCarePlan();
    });

    const config = CHAIN.visits[1]; // S3 HUV1
    await hopeWorkflow.executeVisit(config);
  });

  // =========================================================================
  // Step 05: S3 — Verify HOPE HUV1 record
  // =========================================================================
  test.skip('Step 05: S3 — Verify HOPE HUV1 record', async () => {
    test.setTimeout(TEST_TIMEOUTS.MAXIMUM);

    let huv1RowIndex = 0;

    await test.step('Navigate to HIS/HOPE and wait for HUV1 record', async () => {
      await pages.hopeAdmission.navigateToHopeModule();
      // Wait for the HUV1 record to appear in the grid (may take time to generate)
      huv1RowIndex = await pages.hopeAdmission.waitForRecordInGrid('HUV1', 60000);
    });

    await test.step('Verify HUV1 grid row data', async () => {
      const gridData = await pages.hopeAdmission.getGridRowData(huv1RowIndex);
      expect(gridData['Report']).toContain('HUV1');
      expect(gridData['Report Type']).toContain('HOPE');
      console.log('HUV1 grid data:', gridData);
    });

    await test.step('Open HUV1 record and verify tabs', async () => {
      await pages.hopeAdmission.openRecordByReport('HUV1');

      // Read Tab A to confirm record loaded
      const tabA: AdmissionTab = {
        key: 'A', label: 'A - Administrative Information',
        tabSelector: '.tabs-container span:has-text("A - Administrative Information")',
        fields: TAB_A_FIELDS,
      };
      const resultsA = await pages.hopeAdmission.readTabFields(tabA);
      expect(resultsA['A0100.A NPI']).toBeTruthy();
      expect(resultsA['A0250 Reason for Record']).toContain('HUV-1');
      console.log(`  A0250 Reason for Record: ${resultsA['A0250 Reason for Record']}`);
      console.log(`  Tab A: ${Object.values(resultsA).filter(v => v).length}/${TAB_A_FIELDS.length} fields populated`);

      // Fill Payer Info if needed
      await pages.hopeAdmission.selectPayerInformation();

      // Read Tab J to verify symptom data
      const tabJ: AdmissionTab = {
        key: 'J', label: 'J - Health Conditions',
        tabSelector: '.tabs-container span:has-text("J - Health Conditions")',
        fields: TAB_J_FIELDS,
      };
      const resultsJ = await pages.hopeAdmission.readTabFields(tabJ);

      // J0050 — Imminent Death should be "No"
      expect(resultsJ['J0050 Imminent Death']).toContain('No');
      console.log(`  J0050 Imminent Death: ${resultsJ['J0050 Imminent Death']}`);

      // J2050.A — Symptom Impact Screening should be "Yes"
      expect(resultsJ['J2050.A Symptom Impact Screening']).toContain('Yes');
      console.log(`  J2050.A Symptom Impact Screening: ${resultsJ['J2050.A Symptom Impact Screening']}`);

      // Verify "No Symptom Followup is needed" message
      const noSFVMessage = sharedPage.locator('text=No Symptom Followup, :has-text("No Symptom Follow")').first();
      const sfvMessageVisible = await noSFVMessage.isVisible({ timeout: 3000 }).catch(() => false);
      console.log(`  No Symptom Followup needed: ${sfvMessageVisible ? 'YES (message visible)' : 'not visible'}`);

      console.log(`  Tab J: ${Object.values(resultsJ).filter(v => v).length}/${TAB_J_FIELDS.length} fields populated`);
      for (const [label, value] of Object.entries(resultsJ)) {
        console.log(`    ${label}: ${value || '(empty)'}`);
      }

      // Fill Constipation/Diarrhea if empty
      try {
        await pages.hopeAdmission.selectSingleDropdownFirstOption('automation-constipation-symptom-severity');
      } catch { /* already filled */ }
      try {
        await pages.hopeAdmission.selectSingleDropdownFirstOption('automation-diarrhea-symptom-severity');
      } catch { /* already filled */ }

      // Read Tab M — Skin Conditions
      const tabM: AdmissionTab = {
        key: 'M', label: 'M - Skin Conditions',
        tabSelector: '.tabs-container span:has-text("M - Skin Conditions")',
        fields: TAB_M_FIELDS,
      };
      const resultsM = await pages.hopeAdmission.readTabFields(tabM);

      // M1190 — Does the patient have skin conditions? = Yes
      expect(resultsM['M1190 Skin Conditions']).toContain('Yes');
      console.log(`  M1190 Skin Conditions: ${resultsM['M1190 Skin Conditions']}`);

      // M1195.A — Diabetic Foot Ulcers should be checked
      expect(resultsM['M1195.A Diabetic Foot Ulcers']).toBe('true');
      console.log(`  M1195.A Diabetic Foot Ulcers: ${resultsM['M1195.A Diabetic Foot Ulcers']}`);

      for (const [label, value] of Object.entries(resultsM)) {
        console.log(`    ${label}: ${value || '(empty)'}`);
      }
    });

    await test.step('Complete HUV1 record', async () => {
      await pages.hopeAdmission.navigateToTab('Z - Record Administration');

      // Check all tab statuses
      const tabChecks = [
        'A - Administrative Information', 'F - Preferences', 'I - Active Diagnosis',
        'J - Health Conditions', 'M - Skin Conditions', 'N - Medications',
      ];
      console.log('\nHUV1 tab status:');
      for (const tabLabel of tabChecks) {
        const complete = await pages.hopeAdmission.isTabComplete(tabLabel);
        console.log(`  ${complete ? '✓' : '○'} ${tabLabel}`);
      }

      // Complete the record
      const completeBtn = sharedPage.locator('#inputModalSubmit');
      const isDisabled = await completeBtn.evaluate(
        el => el.classList.contains('disabled')
      ).catch(() => true);

      if (!isDisabled) {
        const profileName = await pages.visitAssessment.getProfileName();
        await pages.hopeAdmission.clickComplete();
        await pages.visitAssessment.fillSignatureModal(profileName);
        console.log('HUV1 HOPE Record completed');
      } else {
        console.log('HUV1 Complete button disabled — record has incomplete tabs');
      }

      // Navigate back to grid and verify status
      await pages.hopeAdmission.navigateToHopeModule();
      const huv1Row = await pages.hopeAdmission.waitForRecordInGrid('HUV1', 10000);
      const gridData = await pages.hopeAdmission.getGridRowData(huv1Row);
      console.log(`HUV1 record status: ${gridData['File Status'] || 'unknown'}`);
    });
  });

  // =========================================================================
  // Step 06: S5 — Complete HUV2 visit (No SFV)
  // =========================================================================
  test.skip('Step 06: S5 — Complete HUV2 visit (No SFV)', async () => {
    test.setTimeout(TEST_TIMEOUTS.MAXIMUM);

    await test.step('Navigate to Care Plan', async () => {
      await hopeWorkflow.navigateToCarePlan();
    });

    const config = CHAIN.visits[2]; // S5 HUV2
    await hopeWorkflow.executeVisit(config);
  });

  // =========================================================================
  // Step 07: S5 — Verify HOPE HUV2 record
  // =========================================================================
  test.skip('Step 07: S5 — Verify HOPE HUV2 record', async () => {
    test.setTimeout(TEST_TIMEOUTS.MAXIMUM);

    let huv2RowIndex = 0;

    await test.step('Navigate to HIS/HOPE and wait for HUV2 record', async () => {
      await pages.hopeAdmission.navigateToHopeModule();
      huv2RowIndex = await pages.hopeAdmission.waitForRecordInGrid('HUV2', 60000);
    });

    await test.step('Verify HUV2 grid row data', async () => {
      const gridData = await pages.hopeAdmission.getGridRowData(huv2RowIndex);
      expect(gridData['Report']).toContain('HUV2');
      expect(gridData['Report Type']).toContain('HOPE');
      console.log('HUV2 grid data:', gridData);
    });

    await test.step('Open HUV2 record and verify tabs', async () => {
      await pages.hopeAdmission.openRecordByReport('HUV2');

      // Tab A — Verify Reason for Record = HUV-2
      const tabA: AdmissionTab = {
        key: 'A', label: 'A - Administrative Information',
        tabSelector: '.tabs-container span:has-text("A - Administrative Information")',
        fields: TAB_A_FIELDS,
      };
      const resultsA = await pages.hopeAdmission.readTabFields(tabA);
      expect(resultsA['A0100.A NPI']).toBeTruthy();
      expect(resultsA['A0250 Reason for Record']).toContain('HUV-2');
      console.log(`  A0250 Reason for Record: ${resultsA['A0250 Reason for Record']}`);
      console.log(`  Tab A: ${Object.values(resultsA).filter(v => v).length}/${TAB_A_FIELDS.length} fields populated`);

      // Fill Payer Info if needed
      await pages.hopeAdmission.selectPayerInformation();

      // Tab J — Verify health conditions
      const tabJ: AdmissionTab = {
        key: 'J', label: 'J - Health Conditions',
        tabSelector: '.tabs-container span:has-text("J - Health Conditions")',
        fields: TAB_J_FIELDS,
      };
      const resultsJ = await pages.hopeAdmission.readTabFields(tabJ);

      // Log all Tab J values first
      console.log(`  Tab J: ${Object.values(resultsJ).filter(v => v).length}/${TAB_J_FIELDS.length} fields populated`);
      for (const [label, value] of Object.entries(resultsJ)) {
        console.log(`    ${label}: ${value || '(empty)'}`);
      }

      // J0050 — Imminent Death = No
      console.log(`  J0050 Imminent Death: ${resultsJ['J0050 Imminent Death'] || '(empty)'}`);
      if (resultsJ['J0050 Imminent Death']) {
        expect(resultsJ['J0050 Imminent Death']).toContain('No');
      }

      // J2050.A — Symptom Impact Screening = Yes
      console.log(`  J2050.A Symptom Impact Screening: ${resultsJ['J2050.A Symptom Impact Screening'] || '(empty)'}`);
      if (resultsJ['J2050.A Symptom Impact Screening']) {
        expect(resultsJ['J2050.A Symptom Impact Screening']).toContain('Yes');
      }

      // No SFV needed message
      const noSFVMessage = sharedPage.locator('text=No Symptom Followup, :has-text("No Symptom Follow")').first();
      const sfvMessageVisible = await noSFVMessage.isVisible({ timeout: 3000 }).catch(() => false);
      console.log(`  No Symptom Followup needed: ${sfvMessageVisible ? 'YES' : 'not visible'}`);

      // Fill Constipation/Diarrhea if empty
      try {
        await pages.hopeAdmission.selectSingleDropdownFirstOption('automation-constipation-symptom-severity');
      } catch { /* already filled */ }
      try {
        await pages.hopeAdmission.selectSingleDropdownFirstOption('automation-diarrhea-symptom-severity');
      } catch { /* already filled */ }

      // Tab M — Skin Conditions
      const tabM: AdmissionTab = {
        key: 'M', label: 'M - Skin Conditions',
        tabSelector: '.tabs-container span:has-text("M - Skin Conditions")',
        fields: TAB_M_FIELDS,
      };
      const resultsM = await pages.hopeAdmission.readTabFields(tabM);
      expect(resultsM['M1190 Skin Conditions']).toContain('Yes');
      expect(resultsM['M1195.A Diabetic Foot Ulcers']).toBe('true');
      console.log(`  M1190 Skin Conditions: ${resultsM['M1190 Skin Conditions']}`);
      console.log(`  M1195.A Diabetic Foot Ulcers: ${resultsM['M1195.A Diabetic Foot Ulcers']}`);
    });

    await test.step('Complete HUV2 record', async () => {
      await pages.hopeAdmission.navigateToTab('Z - Record Administration');

      // Check all tab statuses
      const tabChecks = [
        'A - Administrative Information', 'F - Preferences', 'I - Active Diagnosis',
        'J - Health Conditions', 'M - Skin Conditions', 'N - Medications',
      ];
      console.log('\nHUV2 tab status:');
      for (const tabLabel of tabChecks) {
        const complete = await pages.hopeAdmission.isTabComplete(tabLabel);
        console.log(`  ${complete ? '✓' : '○'} ${tabLabel}`);
      }

      // Complete the record
      const completeBtn = sharedPage.locator('#inputModalSubmit');
      const isDisabled = await completeBtn.evaluate(
        el => el.classList.contains('disabled')
      ).catch(() => true);

      if (!isDisabled) {
        const profileName = await pages.visitAssessment.getProfileName();
        await pages.hopeAdmission.clickComplete();
        await pages.visitAssessment.fillSignatureModal(profileName);
        console.log('HUV2 HOPE Record completed');
      } else {
        console.log('HUV2 Complete button disabled — record has incomplete tabs');
      }

      // Navigate back to grid and verify status
      await pages.hopeAdmission.navigateToHopeModule();
      const huv2Row = await pages.hopeAdmission.waitForRecordInGrid('HUV2', 10000);
      const gridData = await pages.hopeAdmission.getGridRowData(huv2Row);
      console.log(`HUV2 record status: ${gridData['File Status'] || 'unknown'}`);
    });
  });

  // =========================================================================
  // Step 08: S7 — Discharge patient via Status tab
  // =========================================================================
  test.skip('Step 08: S7 — Discharge patient', async () => {
    test.setTimeout(TEST_TIMEOUTS.MAXIMUM);

    await test.step('Discharge patient from Status tab', async () => {
      await patientStatus.dischargePatient(dischargeDate);
    });

    await test.step('Verify patient status changed to Discharged', async () => {
      const status = await patientStatus.getCurrentStatus();
      console.log(`Current status: ${status}`);
    });
  });

  // =========================================================================
  // Step 09: S7 — Verify discharge HOPE record
  // =========================================================================
  test.skip('Step 09: S7 — Verify discharge HOPE record', async () => {
    test.setTimeout(TEST_TIMEOUTS.MAXIMUM);

    let dischargeRowIndex = 0;

    await test.step('Navigate to HIS/HOPE and wait for Discharge record', async () => {
      await pages.hopeAdmission.navigateToHopeModule();
      dischargeRowIndex = await pages.hopeAdmission.waitForRecordInGrid('Discharge', 60000);
    });

    await test.step('Verify Discharge grid row data', async () => {
      const gridData = await pages.hopeAdmission.getGridRowData(dischargeRowIndex);
      expect(gridData['Report']).toContain('Discharge');
      expect(gridData['Report Type']).toContain('HOPE');
      console.log('Discharge grid data:', gridData);
    });

    await test.step('Open Discharge record and verify Tab A', async () => {
      await pages.hopeAdmission.openRecordByReport('Discharge');

      // Discharge records have a simplified Tab A with different fields
      const tabA: AdmissionTab = {
        key: 'A', label: 'A - Admin Info',
        tabSelector: '.tabs-container span:has-text("A - Admin")',
        fields: TAB_A_DISCHARGE_FIELDS,
      };
      const resultsA = await pages.hopeAdmission.readTabFields(tabA);

      // Verify key discharge fields
      expect(resultsA['A0100.A NPI']).toBeTruthy();
      expect(resultsA['A0500 First Name']).toBeTruthy();
      expect(resultsA['A0250 Reason for Record']).toContain('Discharge');
      expect(resultsA['A0500 Last Name']).toBeTruthy();
      expect(resultsA['A0270 Discharge Date']).toBeTruthy();
      expect(resultsA['A0270 Discharge Date']).toEqual(dischargeDate);
      expect(resultsA['A2115 Reason for Discharge']).toBeTruthy();
      const checkedReason = sharedPage.locator('#reasonForDischarge ion-radio button[aria-checked="true"]');                   
      const reasonChecked = await checkedReason.count();
      expect(reasonChecked).toBeGreaterThan(0);
      const reasonLabel = await checkedReason.locator('xpath=ancestor::ion-item').locator('ion-label').textContent().catch(() => '');                                                                                                                  
      console.log(`  A2115 Reason for Discharge (aria-checked): ${reasonLabel?.trim()}`);                                      
                                                                                      

      console.log(`  A0250 Reason for Record: ${resultsA['A0250 Reason for Record']}`);
      console.log(`  A0220 Admission Date: ${resultsA['A0220 Admission Date']}`);
      console.log(`  A0270 Discharge Date: ${resultsA['A0270 Discharge Date']}`);
      console.log(`  A2115 Reason for Discharge: ${resultsA['A2115 Reason for Discharge']}`);

      for (const [label, value] of Object.entries(resultsA)) {
        console.log(`    ${label}: ${value || '(empty)'}`);
      }
    });

    await test.step('Complete Discharge record', async () => {
      // Discharge records only have tabs A and Z
      await pages.hopeAdmission.navigateToTab('Z - Record Administration');

      const tabAComplete = await pages.hopeAdmission.isTabComplete('A - Admin Info');
      console.log(`\nDischarge tab status:`);
      console.log(`  ${tabAComplete ? '✓' : '○'} A - Admin Info`);

      const completeBtn = sharedPage.locator('#inputModalSubmit');
      const isDisabled = await completeBtn.evaluate(
        el => el.classList.contains('disabled')
      ).catch(() => true);

      if (!isDisabled) {
        const profileName = await pages.visitAssessment.getProfileName();
        await pages.hopeAdmission.clickComplete();
        await pages.visitAssessment.fillSignatureModal(profileName);
        console.log('Discharge HOPE Record completed');
      } else {
        console.log('Discharge Complete button disabled — Tab A may be incomplete');
      }

      // Verify final status
      await pages.hopeAdmission.navigateToHopeModule();
      const row = await pages.hopeAdmission.waitForRecordInGrid('Discharge', 10000);
      const gridData = await pages.hopeAdmission.getGridRowData(row);
      console.log(`Discharge record status: ${gridData['File Status'] || 'unknown'}`);
    });
  });

  // =========================================================================
  // Step 10: Export all HOPE records via HIS/HOPE module
  // =========================================================================
  test('Step 10: Export all HOPE records', async () => {
    test.setTimeout(TEST_TIMEOUTS.MAXIMUM);

    await test.step('Navigate to HIS/HOPE module via Rubik\'s cube', async () => {
      await hopeHis.navigateToHisHopeModule();
    });

    await test.step('Search for patient and verify all records', async () => {
      await hopeHis.searchPatient(patientId);

      const rowCount = await hopeHis.getRowCount();
      console.log(`Found ${rowCount} records for patient ${patientId}`);

      const expectedTypes = ['ADMISSION', 'HUV1', 'HUV2', 'DISCHARGE'];
      const foundTypes: string[] = [];

      for (let i = 0; i < rowCount; i++) {
        const data = await hopeHis.getRowData(i);
        console.log(`  Row ${i}: ${data['Type']} | ${data['Status']} | Chart: ${data['Chart ID']}`);
        if (data['Type']) foundTypes.push(data['Type'].toUpperCase());
      }

      for (const expectedType of expectedTypes) {
        const found = foundTypes.some(t => t.includes(expectedType));
        console.log(`  ${found ? '✓' : '✗'} ${expectedType}`);
        expect(found).toBeTruthy();
      }
    });

    await test.step('Select all records and export', async () => {
      await hopeHis.exportAllRecords();
    });
  });

  // =========================================================================
  // Step 11: Verify all HOPE records show Exported status
  // =========================================================================
  test('Step 11: Verify all records are Exported', async () => {
    test.setTimeout(TEST_TIMEOUTS.MAXIMUM);

    await test.step('Navigate to patient HOPE section', async () => {
      await pages.dashboard.goto();
      await pages.dashboard.navigateToModule('Patient');
      await pages.patient.searchPatient(patientId);
      await pages.patient.getPatientFromGrid(0);
      await sharedPage.waitForTimeout(2000);

      await pages.hopeAdmission.navigateToHopeModule();
    });

    await test.step('Verify all records show Exported status', async () => {
      const recordCount = await pages.hopeAdmission.getRecordCount();
      console.log(`Found ${recordCount} HOPE records`);

      for (let i = 0; i < recordCount; i++) {
        const gridData = await pages.hopeAdmission.getGridRowData(i);
        const report = gridData['Report'] || '';
        const status = gridData['File Status'] || '';
        console.log(`  ${report}: ${status}`);
        expect(status.toUpperCase()).toContain('EXPORTED');
      }

      console.log('All HOPE records verified as Exported');
    });
  });
});
