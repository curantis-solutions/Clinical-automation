import { test, expect } from '@playwright/test';
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
import { setupPatientChartListener } from '../../utils/api-helper';
import { DateCalculator, AlertValidator } from '../../utils/hope-helpers';

dotenv.config({ path: '.env.local' });

/**
 * Admit Hospice Patient - INV Moderate Impact Symptoms
 *
 * This test:
 * 1. Admits a hospice patient 9 days in the past
 * 2. Validates INV alert (admission + 5 days)
 * 3. Validates HUV1 alert (admission + 15 days)
 */

test.describe('Admit Hospice Patient - INV Moderate Impact Symptoms', () => {
  let patientFirstName: string;
  let patientLastName: string;
  let patientId: number | undefined;
  let admitDateFormatted: string;

  test('Admit patient and validate INV/HUV1 alerts - Moderate Impact Symptoms', async ({ page }) => {
    test.setTimeout(600000);

    // Setup API interception
    setupPatientChartListener(page, (capturedPatientId, response) => {
      patientId = capturedPatientId;
      console.log(`\n🎯 Patient ID captured: ${patientId}`);
    });

    // Initialize page objects
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    const patientPage = new PatientPage(page);
    const patientProfilePage = new PatientProfilePage(page);
    const careTeamPage = new CareTeamPage(page);
    const benefitsPage = new BenefitsPage(page);
    const certificationsPage = new CertificationsPage(page);
    const consentsPage = new ConsentsPage(page);
    const orderManagementPage = new OrderManagementPage(page);
    const alertValidator = new AlertValidator(page);

    const physicianName = process.env.TEST_PHYSICIAN || 'Dr. Smith';
    const todayFormatted = DateCalculator.getTodaysDate();

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
    // Step 2: Add Hospice Patient
    // ============================================
    console.log('\n👤 Step 2: Add Hospice Patient - Moderate Impact');

    await dashboardPage.goto();
    await dashboardPage.navigateToModule('Patient');
    await patientPage.clickAddPatient();

    patientFirstName = faker.person.firstName();
    patientLastName = `Moderate${faker.person.lastName()}`;

    console.log(`📝 Generated Patient: ${patientFirstName} ${patientLastName}`);

    const patientData: PatientData = {
      careType: 'Hospice',
      demographics: {
        firstName: patientFirstName,
        lastName: patientLastName,
        middleInitial: faker.person.middleName().charAt(0),
        ssn: faker.string.numeric(9),
        dateOfBirth: '03/25/1958',
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
        religion: 'Baptist',
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

    await page.waitForTimeout(3000);

    // ============================================
    // Step 3: Search and Select Patient
    // ============================================
    console.log('\n🔍 Step 3: Search and Select Patient');

    if (!patientId) {
      throw new Error('Patient ID not captured from API');
    }

    await patientPage.searchPatient(String(patientId));
    await page.waitForTimeout(5000);
    await patientPage.getPatientFromGrid(0);

    // ============================================
    // Step 4: Complete Patient Details
    // ============================================
    console.log('\n📋 Step 4: Complete Patient Details');

    await patientProfilePage.completePatientDetails(physicianName);

    // ============================================
    // Step 5: Complete Care Team
    // ============================================
    console.log('\n👥 Step 5: Complete Care Team');

    const careTeamName = process.env.TEST_CARE_TEAM || 'Default Team';
    await careTeamPage.completeCareTeam(careTeamName);

    // ============================================
    // Step 6: Add Attending Physician
    // ============================================
    console.log('\n👨‍⚕️ Step 6: Add Attending Physician');

    await careTeamPage.addAttendingPhysician(physicianName, todayFormatted);

    // ============================================
    // Step 7: Add Caregiver
    // ============================================
    console.log('\n👨‍👩‍👧 Step 7: Add Caregiver');

    await careTeamPage.addCaregiver({
      relation: 'Wife',
      firstName: 'Linda',
      lastName: 'Williams',
      phone: '2145557890',
      address: faker.location.streetAddress(),
      city: 'Dallas',
      state: 'TX',
      zipCode: '75212',
    });

    // ============================================
    // Step 8: Add Order Entry - Level of Care
    // ============================================
    console.log('\n📝 Step 8: Add Order Entry - Level of Care');

    await orderManagementPage.addOELOCbytype({
      role: 'Registered Nurse (RN)',
      physician: physicianName,
      locType: 'Routine Home Care',
      startDate: todayFormatted,
    });

    // ============================================
    // Step 9: Add Diagnosis
    // ============================================
    console.log('\n🩺 Step 9: Add Diagnosis');

    await patientProfilePage.addDiagnosis('Malignant', 'C509');

    // ============================================
    // Step 10: Complete Benefits
    // ============================================
    console.log('\n💳 Step 10: Complete Benefits');

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

    await benefitsPage.completeBenefitsForm(benefitData);
    await page.waitForTimeout(5000);

    // ============================================
    // Step 11: Complete Certifications
    // ============================================
    console.log('\n📄 Step 11: Complete Written Certification');

    const certificationData: WrittenCertificationData = {
      hospicePhysician: physicianName,
      signedOnDate: todayFormatted,
      attendingPhysician: physicianName,
      attendingSignedOnDate: todayFormatted,
      role: 'MD',
      narrativeStatement: 'Patient with advanced breast cancer, moderate symptoms, prognosis 6 months or less',
    };

    await certificationsPage.completeWrittenCertification(certificationData);

    // ============================================
    // Step 12: Complete Consents
    // ============================================
    console.log('\n📝 Step 12: Complete Consents');

    await consentsPage.completeRIConsents();
    await page.waitForTimeout(1000);

    // ============================================
    // Step 13: Admit Patient (9 days ago)
    // ============================================
    console.log('\n🏥 Step 13: Admit Patient (9 days ago)');

    // Admit 9 days in the past
    admitDateFormatted = DateCalculator.getPastDate(9);
    console.log(`📅 Admit Date: ${admitDateFormatted}`);

    await patientProfilePage.admitPatient(admitDateFormatted);
    await page.waitForTimeout(3000);

    // ============================================
    // Step 14: Validate INV and HUV1 Alerts
    // ============================================
    console.log('\n✅ Step 14: Validate INV and HUV1 Alerts');

    // Calculate expected alert dates
    const invDueDate = DateCalculator.calculateINVDate(admitDateFormatted);
    const huv1DueDate = DateCalculator.calculateHUV1Date(admitDateFormatted);

    console.log(`📅 Expected INV Due Date: ${invDueDate}`);
    console.log(`📅 Expected HUV1 Due Date: ${huv1DueDate}`);

    // Validate alerts
    await alertValidator.verifyBothAlerts(invDueDate, huv1DueDate);

    console.log('\n🎉 SUCCESS! Patient admitted with Moderate Impact symptoms - Alerts validated!');
    console.log(`📋 Patient: ${patientFirstName} ${patientLastName}`);
    console.log(`🆔 Patient ID: ${patientId}`);
    console.log(`📅 Admit Date: ${admitDateFormatted}`);
    console.log(`🔔 INV Due: ${invDueDate}`);
    console.log(`🔔 HUV1 Due: ${huv1DueDate}`);
  });
});
