import { test, expect, Page } from '@playwright/test';
import * as dotenv from 'dotenv';
import { faker } from '@faker-js/faker';
import { LoginPage } from '../../pages/login.page';
import { DashboardPage } from '../../pages/dashboard.page';
import { PatientPage } from '../../pages/patient.page';
import { PatientProfilePage } from '../../pages/patient-profile.page';
import { CareTeamPage } from '../../pages/care-team.page';
import { BenefitsPage, BenefitData } from '../../pages/benefits.page';
import { CertificationsPage, WrittenCertificationData } from '../../pages/certifications.page';
import { ConsentsPage } from '../../pages/consents.page';
import { OrderManagementPage } from '../../pages/order-management.page';
import { PatientData } from '../../types/patient.types';
import { setupPatientChartListener, saveTestData, loadTestData } from '../../utils/api-helper';

dotenv.config({ path: '.env.local' });

/**
 * Admit Hospice Patient Test - Separate Test Cases
 *
 * Each step appears as a separate test in Currents dashboard
 * Uses test.describe.serial() to ensure steps run in order
 */

// Shared state across tests
let sharedPage: Page;
let patientFirstName: string;
let patientLastName: string;
let patientId: number | undefined;
let patientData: PatientData;

// Page objects - will be initialized in first test
let loginPage: LoginPage;
let dashboardPage: DashboardPage;
let patientPage: PatientPage;
let patientProfilePage: PatientProfilePage;
let careTeamPage: CareTeamPage;
let benefitsPage: BenefitsPage;
let certificationsPage: CertificationsPage;
let consentsPage: ConsentsPage;
let orderManagementPage: OrderManagementPage;

const today = new Date();
const physicianName = process.env.TEST_PHYSICIAN || 'Cypress';
const todayFormatted = `${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}/${today.getFullYear()}`;

test.describe.serial('Admit Hospice Patient - Step by Step', () => {

  test.beforeAll(async ({ browser }) => {
    // Create a persistent context for all tests
    const context = await browser.newContext();
    sharedPage = await context.newPage();
  });

  test('Step 01: Login to Application', async () => {
    test.setTimeout(120000);

    // Initialize page objects
    loginPage = new LoginPage(sharedPage);
    dashboardPage = new DashboardPage(sharedPage);
    patientPage = new PatientPage(sharedPage);
    patientProfilePage = new PatientProfilePage(sharedPage);
    careTeamPage = new CareTeamPage(sharedPage);
    benefitsPage = new BenefitsPage(sharedPage);
    certificationsPage = new CertificationsPage(sharedPage);
    consentsPage = new ConsentsPage(sharedPage);
    orderManagementPage = new OrderManagementPage(sharedPage);

    await loginPage.goto();
    await loginPage.login(
      process.env.QA_USER_RN || 'testuser',
      process.env.QA_USER_RN_PWD || 'testpassword'
    );
    console.log('✅ Step 1 Complete: Logged in successfully');
  });

  test('Step 02: Navigate to Patients', async () => {
    test.setTimeout(120000);

    await dashboardPage.goto();
    await dashboardPage.navigateToModule('Patient');
    console.log('✅ Step 2 Complete: Navigated to Patients module');
  });

  test('Step 03: Add New Hospice Patient', async () => {
    test.setTimeout(120000);

    // Setup API interception
    setupPatientChartListener(sharedPage, (capturedPatientId) => {
      patientId = capturedPatientId;
    });

    await patientPage.clickAddPatient();

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

    await patientPage.selectCareType('Hospice');
    await patientPage.fillDemographics(patientData);
    await patientPage.fillAdditionalInfo(patientData);
    await patientPage.fillContactInfo(patientData);
    await patientPage.fillAddress(patientData);
    await patientPage.fillHospiceSpecificFields(false);
    await patientPage.savePatient();
    await sharedPage.waitForTimeout(3000);

    // Save test data
    saveTestData({
      patientFirstName,
      patientLastName,
      patientSSN: patientData.demographics.ssn,
      patientId,
      testRunTimestamp: new Date().toISOString()
    });

    console.log(`✅ Step 3 Complete: Patient created - ${patientFirstName} ${patientLastName} (ID: ${patientId})`);
  });

  test('Step 04: Search and Verify Patient', async () => {
    test.setTimeout(120000);

    if (!patientId) {
      throw new Error('Patient ID not captured from previous step');
    }

    await patientPage.searchPatient(String(patientId));
    await sharedPage.waitForTimeout(5000);

    const patientChartId = await patientPage.getPatientChartId();
    expect(patientChartId).toContain(patientId?.toString() || '');

    await patientPage.getPatientFromGrid(0);
    console.log(`✅ Step 4 Complete: Patient verified - ID ${patientId}`);
  });

  test('Step 05: Complete Patient Details', async () => {
    test.setTimeout(180000);

    await patientProfilePage.completePatientDetails(physicianName);
    console.log('✅ Step 5 Complete: Patient details added');
  });

  test('Step 06: Complete Care Team', async () => {
    test.setTimeout(180000);

    const careTeamName = process.env.TEST_CARE_TEAM || 'ACypressIdg';
    await careTeamPage.completeCareTeam(careTeamName);
    console.log('✅ Step 6 Complete: Care team configured');
  });

  test('Step 07: Add Attending Physician', async () => {
    test.setTimeout(120000);

    await careTeamPage.addAttendingPhysician(physicianName, todayFormatted);
    console.log('✅ Step 7 Complete: Attending physician added');
  });

  test('Step 08: Add Caregiver', async () => {
    test.setTimeout(120000);

    await careTeamPage.addCaregiver({
      relation: 'Brother',
      firstName: 'John',
      lastName: 'Doe',
      phone: '2144533456',
      address: '123 Main St',
      city: 'Irving',
      state: 'TX',
      zipCode: '75212',
    });
    console.log('✅ Step 8 Complete: Caregiver added');
  });

  test('Step 09: Add Order Entry - Level of Care', async () => {
    test.setTimeout(180000);

    await orderManagementPage.addOELOCbytype({
      role: 'Registered Nurse (RN)',
      physician: physicianName,
      locType: 'Routine Home Care',
      startDate: todayFormatted,
    });
    console.log('✅ Step 9 Complete: Order entry added');
  });

  test('Step 10: Add Diagnosis', async () => {
    test.setTimeout(120000);

    await patientProfilePage.addDiagnosis('Malignant', 'C000');
    console.log('✅ Step 10 Complete: Diagnosis added');
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

    await benefitsPage.completeBenefitsForm(benefitData);
    await sharedPage.waitForTimeout(5000);
    console.log('✅ Step 11 Complete: Benefits configured');
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

    await certificationsPage.completeWrittenCertification(certificationData);
    console.log('✅ Step 12 Complete: Certification completed');
  });

  test('Step 13: Complete Consents', async () => {
    test.setTimeout(120000);

    await consentsPage.completeRIConsents();
    await sharedPage.waitForTimeout(1000);
    console.log('✅ Step 13 Complete: Consents signed');
  });

  test('Step 14: Admit Patient and Verify', async () => {
    test.setTimeout(120000);

    const admitDate = new Date();
    admitDate.setDate(admitDate.getDate() - 30);
    const admitDateFormatted = `${String(admitDate.getMonth() + 1).padStart(2, '0')}/${String(admitDate.getDate()).padStart(2, '0')}/${admitDate.getFullYear()}`;

    await patientProfilePage.admitPatient(admitDateFormatted);
    await sharedPage.waitForTimeout(1000);

    // Verify admission
    const statusTabExists = await sharedPage.locator('a[href="#/referral-tabs/patient/patient-details/status"]').isVisible();
    expect(statusTabExists).toBeTruthy();

    console.log(`✅ Step 14 Complete: Patient admitted on ${admitDateFormatted}`);
    console.log(`\n🎉 SUCCESS! All 14 steps completed for ${patientFirstName} ${patientLastName} (ID: ${patientId})`);
  });
});
