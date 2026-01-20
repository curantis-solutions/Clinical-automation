import { test } from '@playwright/test';
import { LoginPage } from '../../pages/login.page';
import { DashboardPage } from '../../pages/dashboard.page';
import { PatientPage } from '../../pages/patient.page';
import { loadTestData } from '../../utils/api-helper';
import { CredentialManager } from '../../utils/credential-manager';

/**
 * Selector Extraction Test
 *
 * This test opens a visit and pauses so you can:
 * 1. Manually inspect each section (Vitals, Preferences, etc.)
 * 2. Extract the correct data-cy selectors
 * 3. Document them for the new page object
 */

test.describe('Extract HOPE Selectors', () => {
  test('Open visit and pause for selector extraction', async ({ page }) => {
    test.setTimeout(900000); // 15 minutes

    const testData = loadTestData();
    const patientId = testData.patientId;

    if (!patientId) {
      throw new Error('Patient ID not found');
    }

    console.log('\n🌍 Environment Configuration:');
    console.log(`   Environment: ${CredentialManager.getEnvironmentName()}`);
    console.log(`   Base URL: ${CredentialManager.getBaseUrl()}`);
    console.log(`📂 Using Patient ID: ${patientId}`);

    // Initialize page objects
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    const patientPage = new PatientPage(page);

    // ============================================
    // Step 1: Login
    // ============================================
    console.log('\n🔐 Step 1: Login');
    await loginPage.goto();
    const credentials = CredentialManager.getCredentials(undefined, 'RN');
    await loginPage.login(credentials.username, credentials.password);

    // ============================================
    // Step 2: Navigate to Patient
    // ============================================
    console.log('\n🔍 Step 2: Navigate to Patient');
    await dashboardPage.goto();
    await dashboardPage.navigateToModule('Patient');
    await patientPage.searchPatient(String(patientId));
    await page.waitForTimeout(5000);
    await patientPage.getPatientFromGrid(0);
    await page.waitForTimeout(5000);

    // ============================================
    // Step 3: Open Visit
    // ============================================
    console.log('\n🏥 Step 3: Opening Visit');
    await page.locator('[data-cy="btn-nav-bar-item-care-plan"]').click();
    await page.waitForTimeout(5000);

    // Click first visit to open it
    await page.locator('[data-cy="label-visit-id"]').first().click();
    await page.waitForTimeout(5000);

    console.log('\n✅ Visit is now open!');
    console.log('\n📝 INSTRUCTIONS FOR SELECTOR EXTRACTION:');
    console.log('='.repeat(60));
    console.log('1. The visit is now open in the browser');
    console.log('2. Click through each section: Vitals, Preferences, Neurological, Pain, etc.');
    console.log('3. For each section, use browser DevTools to inspect elements');
    console.log('4. Look for data-cy attributes or other unique selectors');
    console.log('5. Document selectors in the format:');
    console.log('   - Section name');
    console.log('   - Element purpose (e.g., "Add BP button", "Systolic input")');
    console.log('   - Selector value (e.g., [data-cy="button-bloodPressure-add"])');
    console.log('='.repeat(60));
    console.log('\n⏸️  Test will pause here. Press Ctrl+C when done extracting selectors.\n');

    // Pause indefinitely so you can inspect
    await page.pause();
  });
});
