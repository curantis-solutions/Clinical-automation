/**
 * =============================================================================
 * TC-02: HOPE With-SFV Lifecycle — S2 → S4 → S6 → S7
 * =============================================================================
 *
 * Tests the complete HOPE lifecycle for a patient where some symptom impacts
 * are 2 or 3 (moderate/severe), triggering SFV (Symptom Follow-up Visit)
 * after each assessment visit.
 *
 * Chain:
 *   S2: INV + SFV — Complete INV with moderate symptoms, then SFV to resolve
 *   S4: HUV1 + SFV — Complete HUV1 with moderate symptoms, then SFV
 *   S6: HUV2 + SFV — Complete HUV2 with moderate symptoms, then SFV
 *   S7: Discharge — Verify discharge HOPE record
 *
 * Prerequisites:
 *   - Run tc00-hope-patient-setup.spec.ts first to create Patient B
 *   - Patient ID stored in current-test-data.json as hopePatientB
 *
 * Run:
 *   npx playwright test tests/hope/tc02 --headed
 * =============================================================================
 */

import { test, expect, createPageObjectsForPage, type PageObjects } from '../../fixtures/page-objects.fixture';
import { Page, BrowserContext } from '@playwright/test';
import { CredentialManager } from '../../utils/credential-manager';
import { TestDataManager } from '../../utils/test-data-manager';
import { TIMEOUTS, TEST_TIMEOUTS } from '../../config/timeouts';
import { HOPEVisitWorkflow } from '../../workflows/hope-visit.workflow';
import { PATIENT_B_WITH_SFV } from '../../fixtures/hope-scenario-data.fixture';

let sharedPage: Page;
let sharedContext: BrowserContext;
let pages: PageObjects;
let hopeWorkflow: HOPEVisitWorkflow;
let patientId: string;

const CHAIN = PATIENT_B_WITH_SFV;

test.describe.serial(`HOPE: ${CHAIN.description} @hope @with-sfv`, () => {

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
  });

  test.afterAll(async () => {
    if (sharedContext) {
      await sharedContext.close();
    }
  });

  // =========================================================================
  // Step 01: Login and navigate to Patient B's Care Plan
  // =========================================================================
  test('Step 01: Login and navigate to Patient B Care Plan', async () => {
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
      console.log(`Patient B ID: ${patientId}`);

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
  // Step 02: S2 — Complete INV visit (triggers SFV)
  // =========================================================================
  test('Step 02: S2 — Complete INV visit (With SFV)', async () => {
    test.setTimeout(TEST_TIMEOUTS.MAXIMUM);

    const config = CHAIN.visits[0]; // S2 INV with moderate symptoms
    await hopeWorkflow.executeVisit(config);
  });

  // =========================================================================
  // Step 03: S2 — Verify HOPE record shows SFV Pending
  // =========================================================================
  test('Step 03: S2 — Verify HOPE record shows SFV Pending', async () => {
    test.setTimeout(TEST_TIMEOUTS.LONG);

    await test.step('Navigate to HIS/HOPE', async () => {
      await pages.hopeAdmission.navigateToHopeModule();
    });

    await test.step('Verify SFV Pending indicator visible', async () => {
      const sfvPending = await pages.hopeAdmission.isSFVPendingIndicatorVisible();
      expect(sfvPending).toBeTruthy();
      console.log('SFV Pending indicator is visible');
    });

    await test.step('Open record and verify Section J incomplete', async () => {
      await pages.hopeAdmission.openLatestAdmissionRecord();

      // Fill Payor Info in Tab A (always needed)
      await pages.hopeAdmission.navigateToTab('A - Administrative Information');
      await pages.hopeAdmission.selectPayerInformation();

      // Section J should NOT have checkmark (requires SFV)
      const tabJComplete = await pages.hopeAdmission.isTabComplete('J - Health Conditions');
      expect(tabJComplete).toBeFalsy();
      console.log('Section J incomplete (expected — SFV required)');
    });
  });

  // =========================================================================
  // Step 04: S2 — Complete SFV visit
  // =========================================================================
  test('Step 04: S2 — Complete SFV visit', async () => {
    test.setTimeout(TEST_TIMEOUTS.MAXIMUM);

    await test.step('Navigate to Care Plan', async () => {
      await hopeWorkflow.navigateToCarePlan();
    });

    const sfvConfig = CHAIN.visits[0].sfvConfig!;
    await hopeWorkflow.executeVisit(sfvConfig);
  });

  // =========================================================================
  // Step 05: S2 — Verify SFV Pending cleared
  // =========================================================================
  test('Step 05: S2 — Verify SFV Pending cleared', async () => {
    test.setTimeout(TEST_TIMEOUTS.LONG);

    await test.step('Navigate to HIS/HOPE', async () => {
      await pages.hopeAdmission.navigateToHopeModule();
    });

    await test.step('Verify SFV Pending indicator gone', async () => {
      const sfvPending = await pages.hopeAdmission.isSFVPendingIndicatorVisible();
      expect(sfvPending).toBeFalsy();
      console.log('SFV Pending indicator cleared');
    });

    await test.step('Verify all tabs have checkmarks and complete', async () => {
      await pages.hopeAdmission.openLatestAdmissionRecord();

      const tabJComplete = await pages.hopeAdmission.isTabComplete('J - Health Conditions');
      expect(tabJComplete).toBeTruthy();
      console.log('Section J now complete after SFV');

      // Complete the record
      await pages.hopeAdmission.navigateToTab('Z - Record Administration');
      await pages.hopeAdmission.clickComplete();
      const profileName = await pages.visitAssessment.getProfileName();
      await pages.visitAssessment.fillSignatureModal(profileName);
      console.log('HOPE Admission Record completed');
    });
  });

  // =========================================================================
  // Step 06: S4 — Complete HUV1 visit (triggers SFV)
  // =========================================================================
  test('Step 06: S4 — Complete HUV1 visit (With SFV)', async () => {
    test.setTimeout(TEST_TIMEOUTS.MAXIMUM);

    await test.step('Navigate to Care Plan', async () => {
      await hopeWorkflow.navigateToCarePlan();
    });

    const config = CHAIN.visits[1]; // S4 HUV1 with moderate symptoms
    await hopeWorkflow.executeVisit(config);
  });

  // =========================================================================
  // Step 07: S4 — Verify SFV Pending after HUV1
  // =========================================================================
  test('Step 07: S4 — Verify SFV Pending after HUV1', async () => {
    test.setTimeout(TEST_TIMEOUTS.LONG);

    await test.step('Navigate to HIS/HOPE', async () => {
      await pages.hopeAdmission.navigateToHopeModule();
    });

    await test.step('Verify SFV Pending indicator', async () => {
      const sfvPending = await pages.hopeAdmission.isSFVPendingIndicatorVisible();
      expect(sfvPending).toBeTruthy();
      console.log('SFV Pending after HUV1');
    });
  });

  // =========================================================================
  // Step 08: S4 — Complete SFV after HUV1
  // =========================================================================
  test('Step 08: S4 — Complete SFV after HUV1', async () => {
    test.setTimeout(TEST_TIMEOUTS.MAXIMUM);

    await test.step('Navigate to Care Plan', async () => {
      await hopeWorkflow.navigateToCarePlan();
    });

    const sfvConfig = CHAIN.visits[1].sfvConfig!;
    await hopeWorkflow.executeVisit(sfvConfig);
  });

  // =========================================================================
  // Step 09: S4 — Verify SFV cleared, complete HUV1 record
  // =========================================================================
  test('Step 09: S4 — Verify SFV cleared and complete HUV1 record', async () => {
    test.setTimeout(TEST_TIMEOUTS.LONG);

    await test.step('Navigate to HIS/HOPE', async () => {
      await pages.hopeAdmission.navigateToHopeModule();
    });

    await test.step('Verify SFV Pending cleared', async () => {
      const sfvPending = await pages.hopeAdmission.isSFVPendingIndicatorVisible();
      expect(sfvPending).toBeFalsy();
    });

    await test.step('Complete HUV1 HOPE record', async () => {
      await pages.hopeAdmission.openLatestAdmissionRecord();
      await pages.hopeAdmission.navigateToTab('A - Administrative Information');
      await pages.hopeAdmission.selectPayerInformation();
      await pages.hopeAdmission.navigateToTab('Z - Record Administration');
      await pages.hopeAdmission.clickComplete();
      const profileName = await pages.visitAssessment.getProfileName();
      await pages.visitAssessment.fillSignatureModal(profileName);
      console.log('HUV1 HOPE Record completed');
    });
  });

  // =========================================================================
  // Step 10: S6 — Complete HUV2 visit (triggers SFV)
  // =========================================================================
  test('Step 10: S6 — Complete HUV2 visit (With SFV)', async () => {
    test.setTimeout(TEST_TIMEOUTS.MAXIMUM);

    await test.step('Navigate to Care Plan', async () => {
      await hopeWorkflow.navigateToCarePlan();
    });

    const config = CHAIN.visits[2]; // S6 HUV2 with moderate symptoms
    await hopeWorkflow.executeVisit(config);
  });

  // =========================================================================
  // Step 11: S6 — Complete SFV after HUV2 and verify
  // =========================================================================
  test('Step 11: S6 — Complete SFV after HUV2', async () => {
    test.setTimeout(TEST_TIMEOUTS.MAXIMUM);

    await test.step('Verify SFV Pending', async () => {
      await pages.hopeAdmission.navigateToHopeModule();
      const sfvPending = await pages.hopeAdmission.isSFVPendingIndicatorVisible();
      expect(sfvPending).toBeTruthy();
    });

    await test.step('Navigate to Care Plan and complete SFV', async () => {
      await hopeWorkflow.navigateToCarePlan();
      const sfvConfig = CHAIN.visits[2].sfvConfig!;
      await hopeWorkflow.executeVisit(sfvConfig);
    });

    await test.step('Verify SFV cleared and complete record', async () => {
      await pages.hopeAdmission.navigateToHopeModule();
      const sfvPending = await pages.hopeAdmission.isSFVPendingIndicatorVisible();
      expect(sfvPending).toBeFalsy();

      await pages.hopeAdmission.openLatestAdmissionRecord();
      await pages.hopeAdmission.navigateToTab('A - Administrative Information');
      await pages.hopeAdmission.selectPayerInformation();
      await pages.hopeAdmission.navigateToTab('Z - Record Administration');
      await pages.hopeAdmission.clickComplete();
      const profileName = await pages.visitAssessment.getProfileName();
      await pages.visitAssessment.fillSignatureModal(profileName);
      console.log('HUV2 HOPE Record completed');
    });
  });

  // =========================================================================
  // Step 12: S7 — Discharge and verify discharge HOPE record
  // =========================================================================
  test.skip('Step 12: S7 — Discharge and verify HOPE discharge record', async () => {
    test.setTimeout(TEST_TIMEOUTS.MAXIMUM);

    // TODO: Discharge flow needs discovery
    // 1. Discharge patient / Postmortem Visit
    // 2. Navigate to HIS/HOPE
    // 3. Verify discharge HOPE file auto-generated
    // 4. Fill Section A, navigate to Tab Z, complete record
  });
});
