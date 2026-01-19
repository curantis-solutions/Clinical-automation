import { test, expect, Page, BrowserContext } from '@playwright/test';
import { createPageObjectsForPage, PageObjects } from '../../fixtures/page-objects.fixture';
import { CredentialManager } from '../../utils/credential-manager';
import * as dotenv from 'dotenv';
import { HOPEVisitWorkflow } from '../../workflows/hope-visit.workflow';
import { INV_VISIT_CONFIGS, HOPE_YES_SEVERE_CONFIG } from '../../fixtures/hope-fixtures';
import { loadTestData } from '../../utils/api-helper';
import { TestDataManager } from '../../utils/test-data-manager';

dotenv.config({ path: '.env.local' });

/**
 * HOPE Visit Test - Yes Preferences with Severe Symptoms
 *
 * This test:
 * 1. Searches for the patient admitted with "Severe" suffix
 * 2. Performs INV visit with Yes preferences and severe symptoms
 * 3. Validates complete HOPE preview report
 * 4. Validates HIS record data
 */

// Shared state across tests
let sharedPage: Page;
let sharedContext: BrowserContext;
let pages: PageObjects;
let hopeVisitWorkflow: HOPEVisitWorkflow;
let patientId: number | undefined;

test.describe.serial('HOPE Visit - Yes Preferences with Severe Symptoms', () => {

  test.beforeAll(async ({ browser }) => {
    // Create a new browser context with standard settings
    sharedContext = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      ignoreHTTPSErrors: true,
      baseURL: CredentialManager.getBaseUrl(),
    });

    // Create single page instance for all tests
    sharedPage = await sharedContext.newPage();

    // Set longer timeouts for slower environments
    sharedPage.setDefaultTimeout(30000);
    sharedPage.setDefaultNavigationTimeout(30000);

    // Initialize all page objects using the factory
    pages = createPageObjectsForPage(sharedPage);

    // Initialize workflow
    hopeVisitWorkflow = new HOPEVisitWorkflow(sharedPage);

    // Load test data
    const testData = loadTestData();
    patientId = testData.patientId;
  });

  test.afterAll(async () => {
    if (sharedContext) {
      await sharedContext.close();
    }
  });

  test('Step 01: Login as RN', async () => {
    test.setTimeout(120000);

    await pages.login.goto();
    const credentials = CredentialManager.getCredentials(undefined, 'RN');
    await pages.login.login(credentials.username, credentials.password);
    await sharedPage.waitForURL(/dashboard/, { timeout: 15000 });

    console.log('Step 1 Complete: Logged in successfully');
  });

  test('Step 02: Search for Patient with Severe symptoms', async () => {
    test.setTimeout(120000);

    if (!patientId) {
      throw new Error('Patient ID not found. Please run admit-hospice-inv-severe.spec.ts first');
    }

    console.log(`Using Patient ID: ${patientId}`);

    await pages.dashboard.goto();
    await pages.dashboard.navigateToModule('Patient');

    // Search for patient by ID
    await pages.patient.searchPatient(String(patientId));
    await sharedPage.waitForTimeout(5000);
    await pages.patient.getPatientFromGrid(0);
    await sharedPage.waitForTimeout(5000);

    // Navigate to Care Plan
    await sharedPage.locator('a[href*="care-plan"]').click();
    await sharedPage.waitForTimeout(5000);

    console.log('Step 2 Complete: Patient found and Care Plan opened');
  });

  test('Step 03: Add Initial Nursing Assessment Visit', async () => {
    test.setTimeout(180000);

    await hopeVisitWorkflow.addHospiceVisit(
      'Initial Nursing Assessment',
      INV_VISIT_CONFIGS.YES_SEVERE.role
    );

    console.log('Step 3 Complete: INV visit added');
  });

  test('Step 04: Perform INV Visit - Yes Preferences, Severe Symptoms', async () => {
    test.setTimeout(600000);

    await hopeVisitWorkflow.performInvVisitHope(INV_VISIT_CONFIGS.YES_SEVERE);

    console.log('Step 4 Complete: INV visit performed');
  });

  test('Step 05: Complete and Sign Visit', async () => {
    test.setTimeout(180000);

    const userName = TestDataManager.getRNSign();
    await hopeVisitWorkflow.taskEsignby(userName);

    console.log('Step 5 Complete: Visit completed and signed');
    await sharedPage.waitForTimeout(5000);
  });

  test('Step 06: Navigate to HOPE Preview', async () => {
    test.setTimeout(120000);

    // Navigate to HIS tab
    await sharedPage.locator('a[href*="his-record"]').click();
    await sharedPage.waitForTimeout(3000);

    // Click HOPE Report button
    await pages.hopePreview.clickHopeReport();
    await sharedPage.waitForTimeout(5000);

    console.log('Step 6 Complete: HOPE Preview opened');
  });

  test('Step 07: Validate Complete HOPE Preview Report', async () => {
    test.setTimeout(120000);

    await pages.hopePreview.validateCompleteHOPEPreview(HOPE_YES_SEVERE_CONFIG);

    console.log('\n SUCCESS! HOPE Visit completed and validated!');
    console.log('Visit Type: Initial Nursing Assessment');
    console.log('Preferences: Yes (CPR, Life-Sustaining, Hospitalization)');
    console.log('Symptoms: Severe Impact');
    console.log('Skin: Pressure Ulcer/Injury and Stasis Ulcer documented');
    console.log('Medications: Opioids and bowel regimen active');
  });
});
