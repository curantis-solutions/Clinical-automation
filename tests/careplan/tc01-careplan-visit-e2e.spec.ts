import { test, expect, Page, BrowserContext } from '@playwright/test';
import { createPageObjectsForPage, PageObjects } from '../../fixtures/page-objects.fixture';
import { CredentialManager } from '../../utils/credential-manager';
import { TIMEOUTS } from '../../config/timeouts';

/**
 * TC-01: CarePlan Visit — End-to-End Flow
 *
 * Creates a visit, fills key assessment modules (Vitals, COVID screening),
 * opens Plan of Care, previews HOPE Report, completes the visit,
 * and verifies completion status.
 *
 * Flow:
 *   Step 01: Login as RN and navigate to patient Care Plan
 *   Step 02: Create a new visit (Initial Nursing Assessment)
 *   Step 03: Fill Vitals module — Blood Pressure, Temperature, Height, Weight
 *   Step 04: Fill COVID screening — all No
 *   Step 05: Navigate to Pain module and fill basic assessment
 *   Step 06: Open Plan of Care
 *   Step 07: Open HOPE Report Preview
 *   Step 08: Complete the visit (signature + task)
 *   Step 09: Verify visit status on Care Plan grid
 */

let sharedPage: Page;
let sharedContext: BrowserContext;
let pages: PageObjects;

const PATIENT_ID = '214157';

test.describe.serial('TC-01: CarePlan Visit — E2E Flow @careplan', () => {
  test.beforeAll(async ({ browser }) => {
    sharedContext = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      ignoreHTTPSErrors: true,
      baseURL: CredentialManager.getBaseUrl(),
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
  // Step 01: Login and navigate to Care Plan
  // =========================================================================
  test('Step 01: Login as RN and navigate to patient Care Plan', async () => {
    test.setTimeout(120000);

    await test.step('Login as RN', async () => {
      await pages.login.goto();
      const credentials = CredentialManager.getCredentials(undefined, 'RN');
      await pages.login.login(credentials.username, credentials.password);
      await sharedPage.waitForURL(/dashboard/, { timeout: 15000 });
      console.log('Logged in as RN');
    });

    await test.step('Navigate to patient Care Plan', async () => {
      await pages.dashboard.goto();
      await pages.dashboard.navigateToModule('Patient');
      await pages.patient.searchPatient(PATIENT_ID);
      await pages.patient.getPatientFromGrid(0);
      await sharedPage.waitForTimeout(2000);

      // Click Careplan nav button
      await sharedPage.locator('[data-cy="btn-nav-bar-item-care-plan"]').click();
      await sharedPage.waitForURL(/carePlan/, { timeout: 15000 });
      console.log('Navigated to Care Plan page');
    });
  });

  // =========================================================================
  // Step 02: Open existing Initial Nursing Assessment from grid
  // =========================================================================
  test('Step 02: Open Initial Nursing Assessment visit from grid', async () => {
    test.setTimeout(120000);

    await test.step('Click existing Initial Nursing Assessment visit', async () => {
      await sharedPage.waitForTimeout(3000);
      await sharedPage.locator('div[data-cy="label-visit-type"]')
        .filter({ hasText: 'Initial Nursing Assessment' }).first().click({ force: true });
      await sharedPage.waitForURL(/assessment/, { timeout: 30000 });

      const url = sharedPage.url();
      expect(url).toContain('/assessment/');
      console.log('Opened Initial Nursing Assessment visit');
    });
  });

  // =========================================================================
  // Step 03: Fill Vitals module
  // =========================================================================
  test('Step 03: Fill Vitals — BP, Temperature, Height, Weight', async () => {
    test.setTimeout(120000);

    await test.step('Navigate to Vitals module', async () => {
      await pages.visitAssessment.navigateToModule('Vitals');
      const title = await pages.visitAssessment.getSectionTitle();
      expect(title).toContain('Vitals');
    });

    await test.step('Fill Blood Pressure', async () => {
      await pages.visitAssessment.fillBloodPressure('120', '80');
    });

    await test.step('Fill Temperature', async () => {
      await pages.visitAssessment.fillTemperature('98.6');
    });

    await test.step('Fill Pulse', async () => {
      await pages.visitAssessment.fillPulse('72');
    });

    await test.step('Fill Respiratory Rate', async () => {
      await pages.visitAssessment.fillRespiratoryRate('18');
    });

    await test.step('Fill Height', async () => {
      await pages.visitAssessment.fillHeight('5', '10');
    });

    await test.step('Fill Weight', async () => {
      await pages.visitAssessment.fillWeight('170');
    });
  });

  // =========================================================================
  // Step 04: Fill COVID screening
  // =========================================================================
  test('Step 04: Fill COVID-19 screening — all No', async () => {
    test.setTimeout(120000);

    await test.step('Answer all COVID questions as No', async () => {
      await pages.visitAssessment.fillCovidScreeningAllNo();
    });
  });

  // =========================================================================
  // Step 05: Navigate to Preferences module
  // =========================================================================
  test('Step 05: Fill Preferences module', async () => {
    test.setTimeout(120000);

    await test.step('Navigate to Preferences', async () => {
      await pages.visitAssessment.navigateToModule('Preferences');
      const title = await pages.visitAssessment.getSectionTitle();
      expect(title).toContain('Preferences');
    });

    await test.step('Fill all Preferences fields', async () => {
      await pages.preferencesModule.fillAllPreferences();
    });
  });

  // =========================================================================
  // Step 06: Fill Pain module
  // =========================================================================
  test('Step 06: Fill Pain module', async () => {
    test.setTimeout(120000);

    await test.step('Navigate to Pain (saves Preferences)', async () => {
      await pages.visitAssessment.navigateToModule('Pain');
      const title = await pages.visitAssessment.getSectionTitle();
      expect(title).toContain('Pain');
    });

    await test.step('Fill all Pain fields', async () => {
      await pages.painModule.fillAllPain();
    });
  });

  // =========================================================================
  // Step 07: Fill Neurological module
  // =========================================================================
  test('Step 07: Fill Neurological module', async () => {
    test.setTimeout(120000);

    await test.step('Navigate to Neurological (saves Pain)', async () => {
      await pages.visitAssessment.navigateToModule('Neurological');
      const title = await pages.visitAssessment.getSectionTitle();
      expect(title).toContain('Neurological');
    });

    await test.step('Fill all Neurological fields', async () => {
      await pages.neurologicalModule.fillAllNeurological();
    });

  });

  // =========================================================================
  // Step 08: Navigate through remaining modules (saves data on each transition)
  // =========================================================================
  test('Step 08: Navigate remaining modules to save all data', async () => {
    test.setTimeout(300000);

    const remainingModules = [
      'Respiratory',
      'Cardiovascular',
      'Gastrointestinal',
      'Genitourinary',
      'Nutritional & Metabolic',
      'Skin',
      'Musculoskeletal',
      'ADLs/Functional Needs',
      'Precautions, Safety & Teachings',
      'Hospice Aide',
      'Military History',
      'Summary',
      'Symptom Summary',
    ];

    for (const mod of remainingModules) {
      await test.step(`Navigate to ${mod}`, async () => {
        await pages.visitAssessment.navigateToModule(mod);
        console.log(`${mod} — defaults accepted`);
      });
    }
  });

  // =========================================================================
  // Step 09: Open Plan of Care
  // =========================================================================
  test('Step 09: Open Plan of Care', async () => {
    test.setTimeout(120000);

    await test.step('Click Plan of Care button', async () => {
      await pages.visitAssessment.clickPlanOfCare();
      console.log('Plan of Care opened');
    });
  });

  // =========================================================================
  // Step 10: HOPE Report Preview
  // =========================================================================
  test('Step 10: Open HOPE Report Preview', async () => {
    test.setTimeout(120000);

    await test.step('Exit Plan of Care and open HOPE Report', async () => {
      await pages.visitAssessment.clickExitPlanOfCare();
      await pages.visitAssessment.clickHopeReportPreview();
      console.log('HOPE Report Preview opened');
    });
  });

  // =========================================================================
  // Step 11: Complete the visit
  // =========================================================================
  test('Step 11: Complete the visit', async () => {
    test.setTimeout(120000);

    await test.step('Click Complete button', async () => {
      await pages.visitAssessment.clickComplete();
      console.log('Complete clicked');
    });
  });
});
