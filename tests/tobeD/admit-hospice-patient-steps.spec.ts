import { test, expect } from '@playwright/test';
import * as dotenv from 'dotenv';
import { faker } from '@faker-js/faker';
import { createPageObjectsForPage } from '../../fixtures/page-objects.fixture';
import { BenefitData } from '../../pages/benefits.page';
import { WrittenCertificationData } from '../../pages/certifications.page';
import { PatientData } from '../../types/patient.types';
import { setupPatientChartListener, saveTestData } from '../../utils/api-helper';
import { TestDataManager } from '../../utils/test-data-manager';
import { CredentialManager } from '../../utils/credential-manager';

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

    // Initialize page objects from fixture
    const pages = createPageObjectsForPage(page);

    const today = new Date();
    const physicianName = TestDataManager.getPhysician();
    const todayFormatted = `${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}/${today.getFullYear()}`;

    // Setup API interception
    setupPatientChartListener(page, (capturedPatientId) => {
      patientId = capturedPatientId;
    });

    // ====================================================================
    // STEP 1: Login
    // ====================================================================
    await test.step('Step 1: Login to Application', async () => {
      await pages.login.goto();
      const credentials = CredentialManager.getCredentials(undefined, 'RN');
      await pages.login.login(credentials.username, credentials.password);
      console.log('✅ Step 1 Complete: Logged in successfully');
    });

    // ====================================================================
    // STEP 2: Navigate and Add Hospice Patient
    // ====================================================================
    await test.step('Step 2: Add New Hospice Patient', async () => {
      await pages.dashboard.goto();
      await pages.dashboard.navigateToModule('Patient');
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

      await pages.patient.searchPatient(String(patientId));
      await page.waitForTimeout(5000);

      const patientChartId = await pages.patient.getPatientChartId();
      expect(patientChartId).toContain(patientId?.toString() || '');

      await pages.patient.getPatientFromGrid(0);
      console.log(`✅ Step 3 Complete: Patient verified - ID ${patientId}`);
    });

    // ====================================================================
    // STEP 4: Complete Patient Details
    // ====================================================================
    await test.step('Step 4: Complete Patient Details', async () => {
      await pages.patientProfile.completePatientDetails(physicianName);
      console.log('✅ Step 4 Complete: Patient details added');
    });

    // ====================================================================
    // STEP 5: Complete Care Team
    // ====================================================================
    await test.step('Step 5: Complete Care Team', async () => {
      const careTeamName = TestDataManager.getCareTeam();
      await pages.careTeam.completeCareTeam(careTeamName);
      console.log('✅ Step 5 Complete: Care team configured');
    });

    // ====================================================================
    // STEP 6: Add Attending Physician
    // ====================================================================
    await test.step('Step 6: Add Attending Physician', async () => {
      await pages.careTeam.addAttendingPhysician(physicianName, todayFormatted);
      console.log('✅ Step 6 Complete: Attending physician added');
    });

    // ====================================================================
    // STEP 7: Add Caregiver
    // ====================================================================
    await test.step('Step 7: Add Caregiver', async () => {
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
      console.log('✅ Step 7 Complete: Caregiver added');
    });

    // ====================================================================
    // STEP 8: Add Order Entry (Level of Care)
    // ====================================================================
    await test.step('Step 8: Add Order Entry - Level of Care', async () => {
      await pages.orderManagement.addOELOCbytype({
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
      await pages.patientProfile.addDiagnosis('Malignant', 'C000');
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

      await pages.benefits.completeBenefitsForm(benefitData);
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

      await pages.certifications.completeWrittenCertification(certificationData);
      console.log('✅ Step 11 Complete: Certification completed');
    });

    // ====================================================================
    // STEP 12: Complete Consents
    // ====================================================================
    await test.step('Step 12: Complete Consents', async () => {
      await pages.consents.completeRIConsents();
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

      await pages.patientProfile.admitPatient(admitDateFormatted);
      await page.waitForTimeout(1000);

      // Verify admission
      const statusTabExists = await page.locator('a[href="#/referral-tabs/patient/patient-details/status"]').isVisible();
      expect(statusTabExists).toBeTruthy();

      console.log(`✅ Step 13 Complete: Patient admitted on ${admitDateFormatted}`);
      console.log(`\n🎉 SUCCESS! All 13 steps completed for ${patientFirstName} ${patientLastName} (ID: ${patientId})`);
    });
  });
});
