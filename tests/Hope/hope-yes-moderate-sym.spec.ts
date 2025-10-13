import { test } from '@playwright/test';
import * as dotenv from 'dotenv';
import { LoginPage } from '../../pages/login.page';
import { DashboardPage } from '../../pages/dashboard.page';
import { PatientPage } from '../../pages/patient.page';
import { HopePreviewPage } from '../../pages/hope-preview.page';
import { HOPEVisitWorkflow } from '../../workflows/hope-visit.workflow';
import { INV_VISIT_CONFIGS, HOPE_YES_MODERATE_CONFIG } from '../../fixtures/hope-fixtures';
import { loadTestData } from '../../utils/api-helper';

dotenv.config({ path: '.env.local' });

/**
 * HOPE Visit Test - Yes Preferences with Moderate Symptoms
 *
 * This test:
 * 1. Searches for the patient admitted with "Moderate" suffix
 * 2. Performs INV visit with Yes preferences and moderate symptoms
 * 3. Validates complete HOPE preview report
 */

test.describe('HOPE Visit - Yes Preferences with Moderate Symptoms', () => {
  test('Perform INV visit and validate HOPE preview - Moderate Symptoms', async ({ page }) => {
    test.setTimeout(900000); // 15 minutes for complex visit workflow

    // Load test data
    const testData = loadTestData();
    const patientId = testData.patientId;

    if (!patientId) {
      throw new Error('Patient ID not found. Please run admit-hospice-inv-moderate.spec.ts first');
    }

    console.log(`\n📂 Using Patient ID: ${patientId}`);

    // Initialize page objects
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    const patientPage = new PatientPage(page);
    const hopePreviewPage = new HopePreviewPage(page);
    const hopeVisitWorkflow = new HOPEVisitWorkflow(page);

    const userName = process.env.TEST_USERNAME || 'testuser';

    // ============================================
    // Step 1: Login
    // ============================================
    console.log('\n🔐 Step 1: Login');
    await loginPage.goto();
    await loginPage.login(
      process.env.TEST_USERNAME || 'testuser',
      process.env.TEST_PASSWORD || 'testpassword'
    );

    // ============================================
    // Step 2: Search and Select Patient
    // ============================================
    console.log('\n🔍 Step 2: Search for Patient with Moderate symptoms');

    await dashboardPage.goto();
    await dashboardPage.navigateToModule('Patient');

    // Search for patient by ID
    await patientPage.searchPatient(String(patientId));
    await page.waitForTimeout(5000);
    await patientPage.getPatientFromGrid(0);
    await page.waitForTimeout(5000);

    // Navigate to Care Plan
    await page.locator('a[href*="care-plan"]').click();
    await page.waitForTimeout(5000);

    // ============================================
    // Step 3: Add Initial Nursing Assessment Visit
    // ============================================
    console.log('\n🏥 Step 3: Add Initial Nursing Assessment Visit');

    await hopeVisitWorkflow.addHospiceVisit(
      'Initial Nursing Assessment',
      INV_VISIT_CONFIGS.YES_MODERATE.role
    );

    // ============================================
    // Step 4: Perform INV Visit with HOPE
    // ============================================
    console.log('\n📋 Step 4: Perform INV Visit - Yes Preferences, Moderate Symptoms');

    await hopeVisitWorkflow.performInvVisitHope(INV_VISIT_CONFIGS.YES_MODERATE);

    // ============================================
    // Step 5: Complete and Sign Visit
    // ============================================
    console.log('\n✍️ Step 5: Complete and Sign Visit');

    await hopeVisitWorkflow.taskEsignby(userName);

    console.log('✅ Visit completed and signed');
    await page.waitForTimeout(5000);

    // ============================================
    // Step 6: Navigate to HOPE Preview
    // ============================================
    console.log('\n📊 Step 6: Navigate to HOPE Preview');

    // Navigate to HIS tab
    await page.locator('a[href*="his-record"]').click();
    await page.waitForTimeout(3000);

    // Click HOPE Report button
    await hopePreviewPage.clickHopeReport();
    await page.waitForTimeout(5000);

    // ============================================
    // Step 7: Validate Complete HOPE Preview
    // ============================================
    console.log('\n✅ Step 7: Validate Complete HOPE Preview Report');

    await hopePreviewPage.validateCompleteHOPEPreview(HOPE_YES_MODERATE_CONFIG);

    console.log('\n🎉 SUCCESS! HOPE Visit completed and validated!');
    console.log('📋 Visit Type: Initial Nursing Assessment');
    console.log('💭 Preferences: Yes (CPR, Life-Sustaining, Hospitalization)');
    console.log('🌡️ Symptoms: Moderate Impact');
    console.log('🩹 Skin: Diabetic Foot Ulcer documented');
    console.log('💊 Medications: Opioids and bowel regimen active');
  });
});
