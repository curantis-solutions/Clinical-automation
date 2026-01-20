import { test, expect, Page, BrowserContext } from '@playwright/test';
import { createPageObjectsForPage, PageObjects } from '../../fixtures/page-objects.fixture';
import { CredentialManager } from '../../utils/credential-manager';
import * as dotenv from 'dotenv';
import { faker } from '@faker-js/faker';
import { BenefitData } from '../../pages/benefits.page';
import { WrittenCertificationData } from '../../pages/certifications.page';
import { PatientData } from '../../types/patient.types';
import { setupPatientChartListener } from '../../utils/api-helper';
import { DateCalculator, AlertValidator } from '../../utils/hope-helpers';
import { TestDataManager } from '../../utils/test-data-manager';

dotenv.config({ path: '.env.local' });

/**
 * Admit Hospice Patient - INV Severe Symptoms
 *
 * This test:
 * 1. Admits a hospice patient 11 days in the past
 * 2. Validates INV alert (admission + 5 days)
 * 3. Validates HUV1 alert (admission + 15 days)
 */

// Shared state across tests
let sharedPage: Page;
let sharedContext: BrowserContext;
let pages: PageObjects;

// Patient data
let patientFirstName: string;
let patientLastName: string;
let patientId: number | undefined;
let admitDateFormatted: string;

test.describe.serial('Admit Hospice Patient - INV Severe Symptoms', () => {

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

  test('Step 02: Add Hospice Patient - Severe Symptoms', async () => {
    test.setTimeout(180000);

    // Setup API interception
    setupPatientChartListener(sharedPage, (capturedPatientId, response) => {
      patientId = capturedPatientId;
      console.log(`\n Patient ID captured: ${patientId}`);
    });

    const physicianName = TestDataManager.getPhysician();
    const todayFormatted = DateCalculator.getTodaysDate();

    await pages.dashboard.goto();
    await pages.dashboard.navigateToModule('Patient');
    await pages.patient.clickAddPatient();

    patientFirstName = faker.person.firstName();
    patientLastName = `Severe${faker.person.lastName()}`;

    console.log(`Generated Patient: ${patientFirstName} ${patientLastName}`);

    const patientData: PatientData = {
      careType: 'Hospice',
      demographics: {
        firstName: patientFirstName,
        lastName: patientLastName,
        middleInitial: faker.person.middleName().charAt(0),
        ssn: faker.string.numeric(9),
        dateOfBirth: '05/20/1955',
        gender: 'Male',
        veteran: true,
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
        maritalStatus: 'Widowed',
        firstLanguage: 'English',
        religion: 'Catholic',
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

    console.log('Step 2 Complete: Patient created');
  });

  test('Step 03: Search and Select Patient', async () => {
    test.setTimeout(120000);

    if (!patientId) {
      throw new Error('Patient ID not captured from API');
    }

    await pages.patient.searchPatient(String(patientId));
    await sharedPage.waitForTimeout(5000);
    await pages.patient.getPatientFromGrid(0);

    console.log(`Step 3 Complete: Patient found - ID ${patientId}`);
  });

  test('Step 04: Complete Patient Details', async () => {
    test.setTimeout(180000);

    const physicianName = TestDataManager.getPhysician();
    await pages.patientProfile.completePatientDetails(physicianName);

    console.log('Step 4 Complete: Patient details added');
  });

  test('Step 05: Complete Care Team', async () => {
    test.setTimeout(180000);

    const careTeamName = TestDataManager.getCareTeam();
    await pages.careTeam.completeCareTeam(careTeamName);

    console.log('Step 5 Complete: Care team configured');
  });

  test('Step 06: Add Attending Physician', async () => {
    test.setTimeout(120000);

    const physicianName = TestDataManager.getPhysician();
    const todayFormatted = DateCalculator.getTodaysDate();
    await pages.careTeam.addAttendingPhysician(physicianName, todayFormatted);

    console.log('Step 6 Complete: Attending physician added');
  });

  test('Step 07: Add Caregiver', async () => {
    test.setTimeout(120000);

    await pages.careTeam.addCaregiver({
      relation: 'Daughter',
      firstName: 'Sarah',
      lastName: 'Smith',
      phone: '2145559876',
      address: faker.location.streetAddress(),
      city: 'Dallas',
      state: 'TX',
      zipCode: '75212',
    });

    console.log('Step 7 Complete: Caregiver added');
  });

  test('Step 08: Add Order Entry - Level of Care', async () => {
    test.setTimeout(180000);

    const physicianName = TestDataManager.getPhysician();
    const todayFormatted = DateCalculator.getTodaysDate();

    await pages.orderManagement.addOELOCbytype({
      role: 'Registered Nurse (RN)',
      physician: physicianName,
      locType: 'Routine Home Care',
      startDate: todayFormatted,
    });

    console.log('Step 8 Complete: Order entry added');
  });

  test('Step 09: Add Diagnosis', async () => {
    test.setTimeout(120000);

    await pages.patientProfile.addDiagnosis('Malignant', 'C341');

    console.log('Step 9 Complete: Diagnosis added');
  });

  test('Step 10: Complete Benefits', async () => {
    test.setTimeout(180000);

    const todayFormatted = DateCalculator.getTodaysDate();

    const benefitData: BenefitData = {
      payerLevel: 'Primary',
      payerType: 'Medicare',
      subscriberId: faker.string.numeric(11),
      hisPending: false,
      payerEffectiveDate: todayFormatted,
      relationshipToPatient: 'Self',
      admitBenefitPeriod: 1,
      benefitPeriodStartDate: todayFormatted,
      highDaysUsed: 0,
    };

    await pages.benefits.completeBenefitsForm(benefitData);
    await sharedPage.waitForTimeout(5000);

    console.log('Step 10 Complete: Benefits configured');
  });

  test('Step 11: Complete Written Certification', async () => {
    test.setTimeout(120000);

    const physicianName = TestDataManager.getPhysician();
    const todayFormatted = DateCalculator.getTodaysDate();

    const certificationData: WrittenCertificationData = {
      hospicePhysician: physicianName,
      signedOnDate: todayFormatted,
      attendingPhysician: physicianName,
      attendingSignedOnDate: todayFormatted,
      role: 'MD',
      narrativeStatement: 'Patient with advanced lung cancer, severe symptoms, prognosis less than 6 months',
    };

    await pages.certifications.completeWrittenCertification(certificationData);

    console.log('Step 11 Complete: Certification completed');
  });

  test('Step 12: Complete Consents', async () => {
    test.setTimeout(120000);

    await pages.consents.completeRIConsents();
    await sharedPage.waitForTimeout(1000);

    console.log('Step 12 Complete: Consents signed');
  });

  test('Step 13: Admit Patient (11 days ago)', async () => {
    test.setTimeout(120000);

    // Admit 11 days in the past
    admitDateFormatted = DateCalculator.getPastDate(11);
    console.log(`Admit Date: ${admitDateFormatted}`);

    await pages.patientProfile.admitPatient(admitDateFormatted);
    await sharedPage.waitForTimeout(3000);

    console.log(`Step 13 Complete: Patient admitted on ${admitDateFormatted}`);
  });

  test('Step 14: Validate INV and HUV1 Alerts', async () => {
    test.setTimeout(120000);

    const alertValidator = new AlertValidator(sharedPage);

    // Calculate expected alert dates
    const invDueDate = DateCalculator.calculateINVDate(admitDateFormatted);
    const huv1DueDate = DateCalculator.calculateHUV1Date(admitDateFormatted);

    console.log(`Expected INV Due Date: ${invDueDate}`);
    console.log(`Expected HUV1 Due Date: ${huv1DueDate}`);

    // Validate alerts
    await alertValidator.verifyBothAlerts(invDueDate, huv1DueDate);

    console.log('\n SUCCESS! Patient admitted with Severe symptoms - Alerts validated!');
    console.log(`Patient: ${patientFirstName} ${patientLastName}`);
    console.log(`Patient ID: ${patientId}`);
    console.log(`Admit Date: ${admitDateFormatted}`);
    console.log(`INV Due: ${invDueDate}`);
    console.log(`HUV1 Due: ${huv1DueDate}`);
  });
});
