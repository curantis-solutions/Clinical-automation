import { test, expect, chromium, Browser, Page } from '@playwright/test';
import { AuthHelper } from '../../../helpers/auth.helper';
import { PatientHelper } from '../../../helpers/patient.helper';
import { DashboardPage } from '../../../pages/dashboard.page';
import { CredentialManager } from '../../../utils/credential-manager';
import { TestDataManager } from '../../../utils/test-data-manager';

test.describe('Patient Management Tests @smoke', () => {
  let browser: Browser;
  let page: Page;
  let createdPatientName: string = ''; // Shared variable to store created patient name

  // Launch browser once before all tests
  test.beforeAll(async () => {
    browser = await chromium.launch({
      headless: CredentialManager.isHeadless(),
      slowMo: Number(process.env.SLOWMO) || 0
    });

    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      ignoreHTTPSErrors: true,
      baseURL: CredentialManager.getBaseUrl()
    });

    page = await context.newPage();
    console.log('🚀 Browser launched for patient management tests');
  });

  // Close browser after all tests
  test.afterAll(async () => {
    await browser.close();
    console.log('🔒 Browser closed');
  });

  test('Create Hospice patient and verify in grid', async () => {
    test.setTimeout(120000);

    // Step 1: Login using existing AuthHelper
    console.log('🔐 Step 1: Logging in...');
    await AuthHelper.login(page);

    // Step 2: Create Hospice patient
    console.log('\n🏥 Step 2: Creating Hospice patient...');
    const patient = await PatientHelper.createPatient(page, 'Hospice');
    createdPatientName = patient.demographics.firstName; // Store for next test
    console.log('\n📋 Created Patient Details:');
    console.log(`   Name: ${patient.demographics.firstName} ${patient.demographics.lastName}`);
    console.log(`   SSN: ${patient.demographics.ssn}`);
    console.log(`   DOB: ${patient.demographics.dateOfBirth}`);
    console.log(`   Care Type: ${patient.careType}`);
    await page.screenshot({
      path: `screenshots/patient-created-${Date.now()}.png`,
      fullPage: true
    });

    // Navigate to Patient module
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.navigateToModule('Patient');

    // Step 3: Search and verify created patient
    const found = await PatientHelper.searchAndVerifyPatient(page, createdPatientName);

    // Verify patient was found
    expect(found).toBeTruthy();
    console.log(`\n✅ Test completed successfully!`);

    // Take screenshot of search results
    await page.screenshot({
      path: `screenshots/patient-search-results-${Date.now()}.png`,
      fullPage: true
    });
  });

  test.skip('Create Palliative patient with custom data', async () => {
    test.setTimeout(120000);

    // Step 1: Login
    await AuthHelper.login(page);

    // Step 2: Create Palliative patient with some custom data
    const customPatient = await PatientHelper.createPatient(page, 'Palliative', {
      demographics: {
        firstName: 'TestPal',
        lastName: 'Patient',
        ssn: '123-45-6789',
        dateOfBirth: '01/15/1960',
        gender: 'Female',
        veteran: true,
      },
      contactInfo: {
        phoneNumber: '2145551234',
        emailAddress: 'testpal@example.com',
      },
    });

    console.log('\n📋 Created Custom Patient:');
    console.log(`   Name: ${customPatient.demographics.firstName} ${customPatient.demographics.lastName}`);
    console.log(`   Care Type: ${customPatient.careType}`);

    // Search and verify
    const found = await PatientHelper.searchAndVerifyPatient(page, customPatient.demographics.firstName);
    expect(found).toBeTruthy();

    console.log(`\n✅ Custom patient test completed!`);
  });

  test.skip('Create Evaluation patient using convenience method', async () => {
    test.setTimeout(120000);

    // Step 1: Login
    await AuthHelper.login(page);

    // Step 2: Create Evaluation patient using convenience method
    const patient = await PatientHelper.createEvaluationPatient(page);

    console.log('\n📋 Created Evaluation Patient:');
    console.log(`   Name: ${patient.demographics.firstName} ${patient.demographics.lastName}`);

    // Search and verify
    const found = await PatientHelper.searchAndVerifyPatient(page, patient.demographics.firstName);
    expect(found).toBeTruthy();

    console.log(`\n✅ Evaluation patient test completed!`);
  });

  test.skip('Create and verify patient in one workflow', async () => {
    test.setTimeout(120000);

    // Step 1: Login
    await AuthHelper.login(page);

    // Step 2: Create and verify patient (complete workflow)
    const patient = await PatientHelper.createAndVerifyPatient(page, 'Hospice');

    console.log('\n✅ Complete workflow test passed!');
    console.log(`   Patient: ${patient.demographics.firstName} ${patient.demographics.lastName}`);
  });

  test('Complete patient details section', async () => {
    test.setTimeout(180000);

    // Step 1: Use existing patient (from previous test or fallback)
    const patientName = createdPatientName || 'AutoQAThomas1759338297768';
    console.log(`\n📋 Using patient: ${patientName}`);

    // Step 2: Navigate to Patient module
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.navigateToModule('Patient');

    // Step 3: Search and open patient
    await PatientHelper.searchAndOpenPatient(page, patientName);

    // Step 4: Complete Patient Details section
    const physicianName = TestDataManager.getPhysician();
    console.log(`📋 Using physician: ${physicianName} (from ${TestDataManager.getTenant()} tenant)`);

    await PatientHelper.completePatientDetails(page, physicianName);

    console.log('\n✅ Patient Details completed!');
    console.log(`   Patient: ${patientName}`);
    console.log(`   Physician: ${physicianName}`);
    console.log(`   Tenant: ${TestDataManager.getTenant()}`);

    // Take screenshot
    await page.screenshot({
      path: `screenshots/patient-details-completed-${Date.now()}.png`,
      fullPage: true
    });
  });
});
