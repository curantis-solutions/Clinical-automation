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
import { setupPatientChartListener, saveTestData } from '../../utils/api-helper';

dotenv.config({ path: '.env.local' });

/**
 * Admit Hospice Patient Test - With Detailed Steps Reporting
 *
 * This test breaks down the workflow into 13 reportable steps for better visibility in test reports.
 */

test.describe('Admit Hospice Patient - End-to-End Flow', () => {
  let patientFirstName: string;
  let patientLastName: string;
  let patientId: number | undefined;
  let patientData: PatientData;

  test('Complete Hospice Patient Admit Workflow - 13 Steps', async ({ page }) => {
    test.setTimeout(600000); // 10 minutes

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

    const today = new Date();
    const physicianName = process.env.TEST_PHYSICIAN || 'Cypress';
    const todayFormatted = `${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}/${today.getFullYear()}`;

    // Setup API interception
    setupPatientChartListener(page, (capturedPatientId) => {
      patientId = capturedPatientId;
    });

    // ====================================================================
    // STEP 1: Login
    // ====================================================================
    await test.step('Step 1: Login to Application', async () => {
      await loginPage.goto();
      await loginPage.login(
        process.env.QA_USER_RN || 'testuser',
        process.env.QA_USER_RN_PWD || 'testpassword'
      );
      console.log('✅ Step 1 Complete: Logged in successfully');
    });

    // ====================================================================
    // STEP 2: Navigate and Add Hospice Patient
    // ====================================================================
    await test.step('Step 2: Add New Hospice Patient', async () => {
      await dashboardPage.goto();
      await dashboardPage.navigateToModule('Patient');
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
      await page.waitForTimeout(3000);

      // Save test data
      saveTestData({
        patientFirstName,
        patientLastName,
        patientSSN: patientData.demographics.ssn,
        patientId,
        testRunTimestamp: new Date().toISOString()
      });

      console.log(`✅ Step 2 Complete: Patient created - ${patientFirstName} ${patientLastName}`);
    });

    // ====================================================================
    // STEP 3: Search and Verify Patient
    // ====================================================================
    await test.step('Step 3: Search and Verify Patient', async () => {
      if (!patientId) {
        throw new Error('Patient ID not captured from API');
      }

      await patientPage.searchPatient(String(patientId));
      await page.waitForTimeout(5000);

      const patientChartId = await patientPage.getPatientChartId();
      expect(patientChartId).toContain(patientId?.toString() || '');

      await patientPage.getPatientFromGrid(0);
      console.log(`✅ Step 3 Complete: Patient verified - ID ${patientId}`);
    });

    // ====================================================================
    // STEP 4: Complete Patient Details
    // ====================================================================
    await test.step('Step 4: Complete Patient Details', async () => {
      await patientProfilePage.completePatientDetails(physicianName);
      console.log('✅ Step 4 Complete: Patient details added');
    });

    // ====================================================================
    // STEP 5: Complete Care Team
    // ====================================================================
    await test.step('Step 5: Complete Care Team', async () => {
      const careTeamName = process.env.TEST_CARE_TEAM || 'ACypressIdg';
      await careTeamPage.completeCareTeam(careTeamName);
      console.log('✅ Step 5 Complete: Care team configured');
    });

    // ====================================================================
    // STEP 6: Add Attending Physician
    // ====================================================================
    await test.step('Step 6: Add Attending Physician', async () => {
      await careTeamPage.addAttendingPhysician(physicianName, todayFormatted);
      console.log('✅ Step 6 Complete: Attending physician added');
    });

    // ====================================================================
    // STEP 7: Add Caregiver
    // ====================================================================
    await test.step('Step 7: Add Caregiver', async () => {
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
      console.log('✅ Step 7 Complete: Caregiver added');
    });

    // ====================================================================
    // STEP 8: Add Order Entry (Level of Care)
    // ====================================================================
    await test.step('Step 8: Add Order Entry - Level of Care', async () => {
      await orderManagementPage.addOELOCbytype({
        role: 'Registered Nurse (RN)',
        physician: physicianName,
        locType: 'Routine Home Care',
        startDate: todayFormatted,
      });
      console.log('✅ Step 8 Complete: Order entry added');
    });

    // ====================================================================
    // STEP 9: Add Diagnosis
    // ====================================================================
    await test.step('Step 9: Add Diagnosis', async () => {
      await patientProfilePage.addDiagnosis('Malignant', 'C000');
      console.log('✅ Step 9 Complete: Diagnosis added');
    });

    // ====================================================================
    // STEP 10: Complete Benefits
    // ====================================================================
    await test.step('Step 10: Complete Benefits', async () => {
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
      await page.waitForTimeout(5000);
      console.log('✅ Step 10 Complete: Benefits configured');
    });

    // ====================================================================
    // STEP 11: Complete Certifications
    // ====================================================================
    await test.step('Step 11: Complete Written Certification', async () => {
      const certificationData: WrittenCertificationData = {
        hospicePhysician: physicianName,
        signedOnDate: todayFormatted,
        attendingPhysician: physicianName,
        attendingSignedOnDate: todayFormatted,
        role: 'RN',
        narrativeStatement: 'Test narrative statement for certification',
      };

      await certificationsPage.completeWrittenCertification(certificationData);
      console.log('✅ Step 11 Complete: Certification completed');
    });

    // ====================================================================
    // STEP 12: Complete Consents
    // ====================================================================
    await test.step('Step 12: Complete Consents', async () => {
      await consentsPage.completeRIConsents();
      await page.waitForTimeout(1000);
      console.log('✅ Step 12 Complete: Consents signed');
    });

    // ====================================================================
    // STEP 13: Admit Patient and Verify
    // ====================================================================
    await test.step('Step 13: Admit Patient and Verify', async () => {
      const admitDate = new Date();
      admitDate.setDate(admitDate.getDate() - 30);
      const admitDateFormatted = `${String(admitDate.getMonth() + 1).padStart(2, '0')}/${String(admitDate.getDate()).padStart(2, '0')}/${admitDate.getFullYear()}`;

      await patientProfilePage.admitPatient(admitDateFormatted);
      await page.waitForTimeout(1000);

      // Verify admission
      const statusTabExists = await page.locator('a[href="#/referral-tabs/patient/patient-details/status"]').isVisible();
      expect(statusTabExists).toBeTruthy();

      console.log(`✅ Step 13 Complete: Patient admitted on ${admitDateFormatted}`);
      console.log(`\n🎉 SUCCESS! All 13 steps completed for ${patientFirstName} ${patientLastName} (ID: ${patientId})`);
    });
  });
});
