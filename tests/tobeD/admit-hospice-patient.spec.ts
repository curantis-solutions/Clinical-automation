import { test, expect } from '@playwright/test';
import * as dotenv from 'dotenv';
import { faker } from '@faker-js/faker';
import { createPageObjectsForPage } from '../../fixtures/page-objects.fixture';
import { BenefitData } from '../../pages/benefits.page';
import { WrittenCertificationData } from '../../pages/certifications.page';
import { PatientData } from '../../types/patient.types';
import { executeStep } from '../../utils/error-handler';
import { setupPatientChartListener, saveTestData, loadTestData, getPatientId } from '../../utils/api-helper';
import { TestDataManager } from '../../utils/test-data-manager';
import { CredentialManager } from '../../utils/credential-manager';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

/**
 * Admit Hospice Patient Test
 * This test recreates the Cypress admitHospice.cy.js workflow
 *
 * Test Steps:
 * 1. Login and navigate to Patients page
 * 2. Add a new Hospice patient
 * 3. Complete patient profile (caller, referrer, physicians)
 * 4. Add care team members
 * 5. Add attending physician
 * 6. Add caregiver
 * 7. Add diagnosis
 * 8. Complete benefits
 * 9. Complete certifications
 * 10. Complete consents
 * 11. Admit the patient
 */

test.describe('Admit Hospice Patient - End-to-End Flow', () => {
  let patientFirstName: string;
  let patientLastName: string;
  let patientId: number | undefined;

  test('Complete Hospice Patient Admit Workflow', async ({ page }) => {
    // Set longer timeout for this complex workflow (10 minutes)
    test.setTimeout(600000);

    // Load patient ID from saved test data
    const testData = loadTestData();
    patientId = testData.patientId;
    patientFirstName = testData.patientFirstName || '';
    patientLastName = testData.patientLastName || '';

    console.log(`\n📂 Loaded test data:`);
    console.log(`   Patient ID: ${patientId}`);
    console.log(`   Patient Name: ${patientFirstName} ${patientLastName}`);
    console.log(`   SSN: ${testData.patientSSN}`);

    // Setup API interception to capture patient ID (for future runs)
    setupPatientChartListener(page, (capturedPatientId, response) => {
      patientId = capturedPatientId;
      console.log(`\n🎯 Patient ID captured: ${patientId}`);
      console.log(`📊 Patient Status: ${response.patientStatus}`);
      console.log(`🏥 Care Type: ${response.careType}\n`);
    });

    // Initialize all page objects from fixture
    const pages = createPageObjectsForPage(page);
    const today = new Date();
    const physicianName = TestDataManager.getPhysician();
    const todayFormatted = `${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}/${today.getFullYear()}`;
    // ============================================
    // Step 1: Login (one time for entire flow)
    // ============================================
    await test.step('Step 1: Login to Application', async () => {
      console.log('\n🔐 Logging in...');
      await pages.login.goto();
      const credentials = CredentialManager.getCredentials(undefined, 'RN');
      await pages.login.login(credentials.username, credentials.password);
    });

    // ============================================
    // Step 2: Navigate to Patients and Add Patient
    // ============================================
    await test.step('Step 2: Navigate to Patients', async () => {
      console.log('\n📋 Step 2: Navigate to Patients');
      await pages.dashboard.goto();
      await pages.dashboard.navigateToModule('Patient');
    });

    // ============================================
    // Step 3: Add Hospice Patient
    // ============================================
    await test.step('Step 3: Add New Hospice Patient', async () => {
      console.log('\n👤 Step 3: Add Hospice Patient');

      await pages.patient.clickAddPatient();

      // Generate random patient data using Faker
      patientFirstName = faker.person.firstName();
      patientLastName = faker.person.lastName();
      const middleInitial = faker.person.middleName().charAt(0);

      console.log(`📝 Generated Patient: ${patientFirstName} ${patientLastName}`);

      const patientData: PatientData = {
        careType: 'Hospice',
        demographics: {
          firstName: patientFirstName,
          lastName: patientLastName,
          middleInitial: middleInitial,
          ssn: faker.string.numeric(9), // 9-digit SSN
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

      // Wait for API interception to capture patient ID
      await page.waitForTimeout(3000);

      console.log(`✅ Patient created: ${patientFirstName} ${patientLastName}`);

      // Save patient data to file for use across tests
      saveTestData({
        patientFirstName: patientFirstName,
        patientLastName: patientLastName,
        patientSSN: patientData.demographics.ssn,
        patientId: patientId, // This will be populated by the API interceptor
        testRunTimestamp: new Date().toISOString()
      });

      console.log(`💾 Patient data saved for test suite use`);
    }); 

    // ============================================
    // Step 4: Search and Select Patient
    // ============================================
    await test.step('Step 4: Search and Verify Patient', async () => {
      console.log('\n🔍 Step 4: Search and Select Patient');

      if (!patientId) {
        throw new Error('Patient ID not found in test data. Please run the patient creation step first.');
      }

      console.log(`🔎 Searching for patient by ID: ${patientId}`);
      await pages.patient.searchPatient(String(patientId));
      await page.waitForTimeout(5000);

      const patientChartId = await pages.patient.getPatientChartId();
      expect(patientChartId).toContain(patientId?.toString() || '');
      console.log(`✅ Patient Chart ID verified: ${patientChartId}`);

      await pages.patient.getPatientFromGrid(0);
    });

    // ============================================
    // Step 5: Complete Patient Details
    // ============================================
    await test.step('Step 5: Complete Patient Details', async () => {
      console.log('\n📋 Step 5: Complete Patient Details');
      console.log(`Using Physician: ${physicianName}`);
      await pages.patientProfile.completePatientDetails(physicianName);
    });

    // ============================================
    // Step 6: Complete Care Team
    // ============================================
    await test.step('Step 6: Complete Care Team', async () => {
      console.log('\n👥 Step 6: Complete Care Team');
      const careTeamName = TestDataManager.getCareTeam();
      await pages.careTeam.completeCareTeam(careTeamName);
    });

    // ============================================
    // Step 7: Add Attending Physician
    // ============================================
    await test.step('Step 7: Add Attending Physician', async () => {
      console.log('\n👨‍⚕️ Step 7: Add Attending Physician');
      await pages.careTeam.addAttendingPhysician(physicianName, todayFormatted);
    });

    // ============================================
    // Step 8: Add Caregiver
    // ============================================
    await test.step('Step 8: Add Caregiver', async () => {
      console.log('\n👨‍👩‍👧 Step 8: Add Caregiver');
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
    });

    // ============================================
    // Step 9: Add Order Entry - Level of Care
    // ============================================
    await test.step('Step 9: Add Order Entry - Level of Care', async () => {
      console.log('\n📝 Step 9: Add Order Entry - Level of Care');
      await pages.orderManagement.addOELOCbytype({
        role: 'Registered Nurse (RN)',
        physician: physicianName,
        locType: 'Routine Home Care',
        startDate: todayFormatted,
      });
    });

    // ============================================
    // Step 10: Add Diagnosis
    // ============================================
    await test.step('Step 10: Add Diagnosis', async () => {
      console.log('\n🩺 Step 10: Add Diagnosis');
      await pages.patientProfile.addDiagnosis('Malignant', 'C000');
    });

    // ============================================
    // Step 11: Complete Benefits
    // ============================================
    await test.step('Step 11: Complete Benefits', async () => {
      console.log('\n💳 Step 11: Complete Benefits');

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

      await executeStep(
        page,
        'Complete Benefits Form',
        async () => {
          await pages.benefits.completeBenefitsForm(benefitData);
          await page.waitForTimeout(8000);
        },
        3 // Retry 3 times
      );
    });

    // ============================================
    // Step 12: Complete Certifications
    // ============================================
    await test.step('Step 12: Complete Written Certification', async () => {
      console.log('\n📄 Step 12: Complete Written Certification');

      const certificationData: WrittenCertificationData = {
        hospicePhysician: physicianName,
        signedOnDate: todayFormatted,
        attendingPhysician: physicianName,
        attendingSignedOnDate: todayFormatted,
        role: 'RN',
        narrativeStatement: 'Test narrative statement for certification',
      };

      await pages.certifications.completeWrittenCertification(certificationData);
    });

    // ============================================
    // Step 13: Complete Consents
    // ============================================
    await test.step('Step 13: Complete Consents', async () => {
      console.log('\n📝 Step 13: Complete Consents');
      // Using RI consents as per the original test
      await pages.consents.completeRIConsents();
      await page.waitForTimeout(1000);
    });

    // ============================================
    // Step 14: Admit Patient and Verify
    // ============================================
    await test.step('Step 14: Admit Patient and Verify', async () => {
      console.log('\n🏥 Step 14: Admit Patient');

      // Calculate admit date (30 days in the past as per original test)
      const admitDate = new Date();
      admitDate.setDate(admitDate.getDate() - 30);
      const admitDateFormatted = `${String(admitDate.getMonth() + 1).padStart(2, '0')}/${String(admitDate.getDate()).padStart(2, '0')}/${admitDate.getFullYear()}`;

      await pages.patientProfile.admitPatient(admitDateFormatted);
      await page.waitForTimeout(1000);

      // Verify Admission
      console.log('\n✅ Verifying Admission');

      // Check that we're on the status tab (confirmation of successful admit)
      const statusTabExists = await page.locator('a[href="#/referral-tabs/patient/patient-details/status"]').isVisible();
      expect(statusTabExists).toBeTruthy();

      console.log('\n🎉 SUCCESS! Hospice patient admitted successfully!');
      console.log(`📋 Patient: ${patientFirstName} ${patientLastName}`);
      console.log(`📅 Admit Date: ${admitDateFormatted}`);
    });
  });
});
