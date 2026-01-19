import { test, expect, Page, BrowserContext } from '@playwright/test';
import * as dotenv from 'dotenv';
import { faker } from '@faker-js/faker';
import { createPageObjectsForPage, PageObjects } from '../../fixtures/page-objects.fixture';
import { BenefitData } from '../../pages/benefits.page';
import { WrittenCertificationData } from '../../pages/certifications.page';
import { PatientData } from '../../types/patient.types';
import { setupPatientChartListener, saveTestData, loadTestData } from '../../utils/api-helper';
import { TestDataManager } from '../../utils/test-data-manager';
import { CredentialManager } from '../../utils/credential-manager';

dotenv.config({ path: '.env.local' });

/**
 * Admit Hospice Patient Test - Separate Test Cases
 *
 * Each step appears as a separate test in Currents dashboard
 * Uses test.describe.serial() to ensure steps run in order
 */

// Shared state across tests
let sharedPage: Page;
let sharedContext: BrowserContext;
let patientFirstName: string;
let patientLastName: string;
let patientId: number | undefined;
let patientData: PatientData;

// Page objects - will be initialized in first test using factory
let pages: PageObjects;

const today = new Date();
const physicianName = TestDataManager.getPhysician();
const todayFormatted = `${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}/${today.getFullYear()}`;

test.describe.serial('Admit Hospice Patient - Step by Step', () => {

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

    // Initialize page objects using factory (for shared page)
    pages = createPageObjectsForPage(sharedPage);
  });

  test.afterAll(async () => {
    if (sharedContext) {
      await sharedContext.close();
    }
  });

  test('Step 01: Login to Application', async () => {
    test.setTimeout(120000);

    await pages.login.goto();
    const credentials = CredentialManager.getCredentials(undefined, 'RN');
    await pages.login.login(credentials.username, credentials.password);
    await sharedPage.waitForURL(/dashboard/, { timeout: 15000 });

    console.log('Step 1 Complete: Logged in successfully');
  });

  test('Step 02: Navigate to Patients', async () => {
    test.setTimeout(120000);

    await pages.dashboard.goto();
    await pages.dashboard.navigateToModule('Patient');
    console.log('Step 2 Complete: Navigated to Patients module');
  });

  test('Step 03: Add New Hospice Patient', async () => {
    test.setTimeout(120000);

    // Setup API interception
    setupPatientChartListener(sharedPage, (capturedPatientId) => {
      patientId = capturedPatientId;
    });

    await pages.patient.clickAddPatient();

    // Generate patient data
    patientFirstName = faker.person.firstName();
    patientLastName = faker.person.lastName();

    patientData = {
      careType: 'Hospice',
      demographics: {
        firstName: patientFirstName,
        lastName: patientLastName,
        middleInitial: faker.person.middleName().charAt(0),
        ssn: faker.string.numeric(9),
        dateOfBirth: '12/12/2000',
        gender: 'Male',
        veteran: false,
      },
      contactInfo: {
        phoneNumber: faker.phone.number(),
        emailAddress: faker.internet.email(),
      },
      address: {
        streetAddress: faker.location.streetAddress(),
        city: 'Dallas',
        state: 'TX',
        zipCode: '75212',
        sameAddress: true,
      },
      additionalInfo: {
        maritalStatus: 'Married',
        firstLanguage: 'English',
        religion: 'Christian',
        ethnicity: 'Not Hispanic',
        ethnicityHope: 'Not Hispanic',
        raceHope: 'White',
        skilledBed: false,
      },
    };

    await pages.patient.selectCareType('Hospice');
    await pages.patient.fillDemographics(patientData);
    await pages.patient.fillAdditionalInfo(patientData);
    await pages.patient.fillContactInfo(patientData);
    await pages.patient.fillAddress(patientData);
    await pages.patient.fillHospiceSpecificFields(false);
    await pages.patient.savePatient();
    await sharedPage.waitForTimeout(3000);

    // Save test data
    saveTestData({
      patientFirstName,
      patientLastName,
      patientSSN: patientData.demographics.ssn,
      patientId,
      testRunTimestamp: new Date().toISOString()
    });

    console.log(`Step 3 Complete: Patient created - ${patientFirstName} ${patientLastName} (ID: ${patientId})`);
  });

  test('Step 04: Search and Verify Patient', async () => {
    test.setTimeout(120000);

    if (!patientId) {
      throw new Error('Patient ID not captured from previous step');
    }

    await pages.patient.searchPatient(String(patientId));
    await sharedPage.waitForTimeout(5000);

    const patientChartId = await pages.patient.getPatientChartId();
    expect(patientChartId).toContain(patientId?.toString() || '');

    await pages.patient.getPatientFromGrid(0);
    console.log(`Step 4 Complete: Patient verified - ID ${patientId}`);
  });

  test('Step 05: Complete Patient Details', async () => {
    test.setTimeout(180000);

    await pages.patientProfile.completePatientDetails(physicianName);
    console.log('Step 5 Complete: Patient details added');
  });

  test('Step 06: Complete Care Team', async () => {
    test.setTimeout(180000);

    const careTeamName = TestDataManager.getCareTeam();
    await pages.careTeam.completeCareTeam(careTeamName);
    console.log('Step 6 Complete: Care team configured');
  });

  test('Step 07: Add Attending Physician', async () => {
    test.setTimeout(120000);

    await pages.careTeam.addAttendingPhysician(physicianName, todayFormatted);
    console.log('Step 7 Complete: Attending physician added');
  });

  test('Step 08: Add Caregiver', async () => {
    test.setTimeout(120000);

    await pages.careTeam.addCaregiver({
      relation: 'Brother',
      firstName: 'John',
      lastName: 'Doe',
      phone: '2144533456',
      address: '123 Main St',
      city: 'Irving',
      state: 'TX',
      zipCode: '75212',
    });
    console.log('Step 8 Complete: Caregiver added');
  });

  test('Step 09: Add Order Entry - Level of Care', async () => {
    test.setTimeout(180000);

    await pages.orderManagement.addOELOCbytype({
      role: 'Registered Nurse (RN)',
      physician: physicianName,
      locType: 'Routine Home Care',
      startDate: todayFormatted,
    });
    console.log('Step 9 Complete: Order entry added');
  });

  test('Step 10: Add Diagnosis', async () => {
    test.setTimeout(120000);

    await pages.patientProfile.addDiagnosis('Malignant', 'C000');
    console.log('Step 10 Complete: Diagnosis added');
  });

  test('Step 11: Complete Benefits', async () => {
    test.setTimeout(180000);

    const benefitData: BenefitData = {
      payerLevel: 'Primary',
      payerType: 'Medicare',
      subscriberId: '1gg1gg1gg11',
      hisPending: false,
      payerEffectiveDate: todayFormatted,
      relationshipToPatient: 'Self',
      admitBenefitPeriod: 1,
      benefitPeriodStartDate: todayFormatted,
      highDaysUsed: 0,
    };

    await pages.benefits.completeBenefitsForm(benefitData);
    await sharedPage.waitForTimeout(5000);
    console.log('Step 11 Complete: Benefits configured');
  });

  test('Step 12: Complete Written Certification', async () => {
    test.setTimeout(120000);

    const certificationData: WrittenCertificationData = {
      hospicePhysician: physicianName,
      signedOnDate: todayFormatted,
      attendingPhysician: physicianName,
      attendingSignedOnDate: todayFormatted,
      role: 'RN',
      narrativeStatement: 'Test narrative statement for certification',
    };

    await pages.certifications.completeWrittenCertification(certificationData);
    console.log('Step 12 Complete: Certification completed');
  });

  test('Step 13: Complete Consents', async () => {
    test.setTimeout(120000);

    await pages.consents.completeRIConsents();
    await sharedPage.waitForTimeout(1000);
    console.log('Step 13 Complete: Consents signed');
  });

  test('Step 14: Admit Patient and Verify', async () => {
    test.setTimeout(120000);

    const admitDate = new Date();
    admitDate.setDate(admitDate.getDate() - 30);
    const admitDateFormatted = `${String(admitDate.getMonth() + 1).padStart(2, '0')}/${String(admitDate.getDate()).padStart(2, '0')}/${admitDate.getFullYear()}`;

    await pages.patientProfile.admitPatient(admitDateFormatted);
    await sharedPage.waitForTimeout(1000);

    // Save admit date to test data for billing validation
    saveTestData({
      admitDate: admitDateFormatted
    });

    // Verify admission
    const statusTabExists = await sharedPage.locator('a[href="#/referral-tabs/patient/patient-details/status"]').isVisible();
    expect(statusTabExists).toBeTruthy();

    console.log(`Step 14 Complete: Patient admitted on ${admitDateFormatted}`);
    console.log(`\n SUCCESS! All 14 steps completed for ${patientFirstName} ${patientLastName} (ID: ${patientId})`);
  });
});
