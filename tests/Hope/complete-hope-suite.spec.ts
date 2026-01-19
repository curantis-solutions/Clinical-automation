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
import { HopePreviewPage } from '../../pages/hope-preview.page';
import { PatientData } from '../../types/patient.types';
import { setupPatientChartListener, savePatientIdByScenario, getPatientIdByScenario } from '../../utils/api-helper';
import { DateCalculator, AlertValidator } from '../../utils/hope-helpers';
import { HOPEVisitWorkflow } from '../../workflows/hope-visit.workflow';
import { TestDataManager } from '../../utils/test-data-manager';
import { CredentialManager } from '../../utils/credential-manager';
import {
  INV_VISIT_CONFIGS,
  HOPE_REFUSE_NO_IMPACT_CONFIG,
  HOPE_NO_MILD_CONFIG,
  HOPE_YES_MODERATE_CONFIG,
  HOPE_YES_SEVERE_CONFIG,
  HOPE_NO_SYMPTOMS_CONFIG,
} from '../../fixtures/hope-fixtures';

  /*To Run:

  # Run the complete suite (all 6 tests)
  npx playwright test tests/Hope/complete-hope-suite.spec.ts

  # Run just the admission test
  npx playwright test tests/Hope/complete-hope-suite.spec.ts -g "Admit all 5 patients"

  # Run a specific HOPE visit test
  npx playwright test tests/Hope/complete-hope-suite.spec.ts -g "Moderate Impact" */
dotenv.config({ path: '.env.local' });

/**
 * Complete HOPE Test Suite
 *
 * This comprehensive suite:
 * 1. Admits 5 patients with different scenarios
 * 2. Performs HOPE visits on each patient with different data
 * 3. Validates HOPE preview for each scenario
 *
 * Scenarios:
 * - No Impact Symptoms (Refuse preferences)
 * - Mild Impact Symptoms (No preferences)
 * - Moderate Impact Symptoms (Yes preferences)
 * - Severe Impact Symptoms (Yes preferences)
 * - No Symptoms (No preferences)
 */

test.describe('Complete HOPE Test Suite - 5 Patient Scenarios', () => {
  const physicianName = TestDataManager.getPhysician();
  const careTeamName = TestDataManager.getCareTeam();
  const userName = TestDataManager.getRNSign();
  const todayFormatted = DateCalculator.getTodaysDate();

  /**
   * Shared function to admit a patient
   */
  async function admitPatient(
    page: any,
    scenarioType: 'noImpact' | 'mild' | 'moderate' | 'severe' | 'noSymptoms',
    lastNameSuffix: string,
    admissionDateOffset: number
  ): Promise<number> {
    let capturedPatientId: number | undefined;

    // Setup API interception
    setupPatientChartListener(page, (patientId) => {
      capturedPatientId = patientId;
      savePatientIdByScenario(scenarioType, patientId);
      console.log(`\n🎯 Patient ID captured for ${scenarioType}: ${patientId}`);
    });

    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    const patientPage = new PatientPage(page);
    const patientProfilePage = new PatientProfilePage(page);
    const careTeamPage = new CareTeamPage(page);
    const benefitsPage = new BenefitsPage(page);
    const certificationsPage = new CertificationsPage(page);
    const consentsPage = new ConsentsPage(page);
    const orderManagementPage = new OrderManagementPage(page);

    // Login
    console.log('\n🔐 Logging in...');
    await loginPage.goto();
    const credentials = CredentialManager.getCredentials(undefined, 'RN');
    await loginPage.login(credentials.username, credentials.password);

    // Add Patient
    console.log(`\n👤 Adding ${scenarioType} patient`);
    await dashboardPage.goto();
    await dashboardPage.navigateToModule('Patient');
    await patientPage.clickAddPatient();

    const patientFirstName = faker.person.firstName();
    const patientLastName = `${lastNameSuffix}${faker.person.lastName()}`;

    console.log(`📝 Generated Patient: ${patientFirstName} ${patientLastName}`);

    const patientData: PatientData = {
      careType: 'Hospice',
      demographics: {
        firstName: patientFirstName,
        lastName: patientLastName,
        middleInitial: faker.person.middleName().charAt(0),
        ssn: faker.string.numeric(9),
        dateOfBirth: '08/10/1965',
        gender: 'Female',
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
        maritalStatus: 'Divorced',
        firstLanguage: 'English',
        religion: 'Protestant',
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

    if (!capturedPatientId) {
      throw new Error('Patient ID not captured from API');
    }

    // Search and select patient
    console.log('\n🔍 Searching for patient...');
    await patientPage.searchPatient(String(capturedPatientId));
    await page.waitForTimeout(5000);
    await patientPage.getPatientFromGrid(0);

    // Complete patient details
    console.log('\n📋 Completing patient details...');
    await patientProfilePage.completePatientDetails(physicianName);

    // Complete care team
    console.log('\n👥 Completing care team...');
    await careTeamPage.completeCareTeam(careTeamName);

    // Add attending physician
    console.log('\n👨‍⚕️ Adding attending physician...');
    await careTeamPage.addAttendingPhysician(physicianName, todayFormatted);

    // Add caregiver
    console.log('\n👨‍👩‍👧 Adding caregiver...');
    await careTeamPage.addCaregiver({
      relation: 'Son',
      firstName: 'Michael',
      lastName: 'Johnson',
      phone: '2145554567',
      address: faker.location.streetAddress(),
      city: 'Dallas',
      state: 'TX',
      zipCode: '75212',
    });

    // Add order entry
    console.log('\n📝 Adding order entry...');
    await orderManagementPage.addOELOCbytype({
      role: 'Registered Nurse (RN)',
      physician: physicianName,
      locType: 'Routine Home Care',
      startDate: todayFormatted,
    });

    // Add diagnosis
    console.log('\n🩺 Adding diagnosis...');
    await patientProfilePage.addDiagnosis('Malignant', 'C000');

    // Complete benefits
    console.log('\n💳 Completing benefits...');
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

    // Complete certifications
    console.log('\n📄 Completing certifications...');
    const certificationData: WrittenCertificationData = {
      hospicePhysician: physicianName,
      signedOnDate: todayFormatted,
      attendingPhysician: physicianName,
      attendingSignedOnDate: todayFormatted,
      role: 'MD',
      narrativeStatement: `Patient with colon cancer, ${scenarioType} symptoms, prognosis 6 months or less`,
    };

    await certificationsPage.completeWrittenCertification(certificationData);

    // Complete consents
    console.log('\n📝 Completing consents...');
    await consentsPage.completeRIConsents();
    await page.waitForTimeout(1000);

    // Admit patient
    const admitDateFormatted = DateCalculator.getPastDate(admissionDateOffset);
    console.log(`\n🏥 Admitting patient (${admissionDateOffset} days ago): ${admitDateFormatted}`);
    await patientProfilePage.admitPatient(admitDateFormatted);
    await page.waitForTimeout(3000);

    // Validate alerts
    if (admissionDateOffset >= 5) {
      console.log('\n✅ Validating alerts...');
      const alertValidator = new AlertValidator(page);
      const invDueDate = DateCalculator.calculateINVDate(admitDateFormatted);
      const huv1DueDate = DateCalculator.calculateHUV1Date(admitDateFormatted);

      console.log(`📅 Expected INV Due Date: ${invDueDate}`);
      console.log(`📅 Expected HUV1 Due Date: ${huv1DueDate}`);

      await alertValidator.verifyBothAlerts(invDueDate, huv1DueDate);
    }

    console.log(`\n🎉 Patient ${scenarioType} admitted successfully!`);
    console.log(`📋 Patient: ${patientFirstName} ${patientLastName}`);
    console.log(`🆔 Patient ID: ${capturedPatientId}`);

    return capturedPatientId;
  }

  /**
   * Shared function to perform HOPE visit
   */
  async function performHopeVisit(
    page: any,
    scenarioType: 'noImpact' | 'mild' | 'moderate' | 'severe' | 'noSymptoms',
    visitConfig: any,
    hopePreviewConfig: any
  ): Promise<void> {
    const patientId = getPatientIdByScenario(scenarioType);

    if (!patientId) {
      throw new Error(`Patient ID not found for scenario: ${scenarioType}`);
    }

    console.log(`\n📂 Using Patient ID for ${scenarioType}: ${patientId}`);

    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    const patientPage = new PatientPage(page);
    const hopePreviewPage = new HopePreviewPage(page);
    const hopeVisitWorkflow = new HOPEVisitWorkflow(page);

    // Login
    console.log('\n🔐 Logging in...');
    await loginPage.goto();
    const credentials = CredentialManager.getCredentials(undefined, 'RN');
    await loginPage.login(credentials.username, credentials.password);

    // Search and select patient
    console.log(`\n🔍 Searching for ${scenarioType} patient...`);
    await dashboardPage.goto();
    await dashboardPage.navigateToModule('Patient');
    await patientPage.searchPatient(String(patientId));
    await page.waitForTimeout(5000);
    await patientPage.getPatientFromGrid(0);
    await page.waitForTimeout(5000);

    // Navigate to care plan
    await page.locator('a[href*="care-plan"]').click();
    await page.waitForTimeout(5000);

    // Add visit
    console.log('\n🏥 Adding Initial Nursing Assessment visit...');
    await hopeVisitWorkflow.addHospiceVisit('Initial Nursing Assessment', visitConfig.role);

    // Perform HOPE visit
    console.log(`\n📋 Performing INV visit - ${scenarioType}`);
    await hopeVisitWorkflow.performInvVisitHope(visitConfig);

    // Complete and sign visit
    console.log('\n✍️ Completing and signing visit...');
    await hopeVisitWorkflow.taskEsignby(userName);
    console.log('✅ Visit completed and signed');
    await page.waitForTimeout(5000);

    // Navigate to HOPE preview
    console.log('\n📊 Navigating to HOPE preview...');
    await page.locator('a[href*="his-record"]').click();
    await page.waitForTimeout(3000);
    await hopePreviewPage.clickHopeReport();
    await page.waitForTimeout(5000);

    // Validate HOPE preview
    console.log('\n✅ Validating HOPE preview...');
    await hopePreviewPage.validateCompleteHOPEPreview(hopePreviewConfig);

    console.log(`\n🎉 SUCCESS! HOPE visit for ${scenarioType} completed and validated!`);
  }

  // ============================================
  // Test 1: Admit All 5 Patients
  // ============================================
  test.skip('1. Admit all 5 patients with different scenarios', async ({ page }) => {
    test.setTimeout(1800000); // 30 minutes for all 5 patients

    console.log('\n' + '='.repeat(80));
    console.log('🏥 ADMITTING 5 PATIENTS FOR HOPE TEST SUITE');
    console.log('='.repeat(80));

    // Admit Patient 1: No Impact (Refuse preferences)
    console.log('\n' + '='.repeat(80));
    console.log('👤 PATIENT 1: NO IMPACT SYMPTOMS (REFUSE PREFERENCES)');
    console.log('='.repeat(80));
    await admitPatient(page, 'noImpact', 'NoImpact', 8);

    // Admit Patient 2: Mild Impact (No preferences)
    console.log('\n' + '='.repeat(80));
    console.log('👤 PATIENT 2: MILD IMPACT SYMPTOMS (NO PREFERENCES)');
    console.log('='.repeat(80));
    await admitPatient(page, 'mild', 'MildSym', 8);

    // Admit Patient 3: Moderate Impact (Yes preferences)
    console.log('\n' + '='.repeat(80));
    console.log('👤 PATIENT 3: MODERATE IMPACT SYMPTOMS (YES PREFERENCES)');
    console.log('='.repeat(80));
    await admitPatient(page, 'moderate', 'ModSym', 8);

    // Admit Patient 4: Severe Impact (Yes preferences)
    console.log('\n' + '='.repeat(80));
    console.log('👤 PATIENT 4: SEVERE IMPACT SYMPTOMS (YES PREFERENCES)');
    console.log('='.repeat(80));
    await admitPatient(page, 'severe', 'SevSym', 8);

    // Admit Patient 5: No Symptoms (No preferences)
    console.log('\n' + '='.repeat(80));
    console.log('👤 PATIENT 5: NO SYMPTOMS (NO PREFERENCES)');
    console.log('='.repeat(80));
    await admitPatient(page, 'noSymptoms', 'NoSym', 8);

    console.log('\n' + '='.repeat(80));
    console.log('🎉 ALL 5 PATIENTS ADMITTED SUCCESSFULLY!');
    console.log('='.repeat(80));

    // Display summary
    console.log('\n📊 PATIENT SUMMARY:');
    console.log(`1. No Impact: ${getPatientIdByScenario('noImpact')}`);
    console.log(`2. Mild: ${getPatientIdByScenario('mild')}`);
    console.log(`3. Moderate: ${getPatientIdByScenario('moderate')}`);
    console.log(`4. Severe: ${getPatientIdByScenario('severe')}`);
    console.log(`5. No Symptoms: ${getPatientIdByScenario('noSymptoms')}`);
  });

  // ============================================
  // Test 2: HOPE Visit - No Impact (Refuse)
  // ============================================
  test('2. HOPE Visit - No Impact Symptoms (Refuse preferences)', async ({ page }) => {
    test.setTimeout(900000); // 15 minutes

    console.log('\n' + '='.repeat(80));
    console.log('📋 HOPE VISIT 1: NO IMPACT - REFUSE PREFERENCES');
    console.log('='.repeat(80));

    await performHopeVisit(
      page,
      'noImpact',
      INV_VISIT_CONFIGS.REFUSE_NO_IMPACT,
      HOPE_REFUSE_NO_IMPACT_CONFIG
    );
  });

  // ============================================
  // Test 3: HOPE Visit - Mild Impact (No)
  // ============================================
  test('3. HOPE Visit - Mild Impact Symptoms (No preferences)', async ({ page }) => {
    test.setTimeout(900000); // 15 minutes

    console.log('\n' + '='.repeat(80));
    console.log('📋 HOPE VISIT 2: MILD IMPACT - NO PREFERENCES');
    console.log('='.repeat(80));

    await performHopeVisit(
      page,
      'mild',
      INV_VISIT_CONFIGS.NO_MILD,
      HOPE_NO_MILD_CONFIG
    );
  });

  // ============================================
  // Test 4: HOPE Visit - Moderate Impact (Yes)
  // ============================================
  test('4. HOPE Visit - Moderate Impact Symptoms (Yes preferences)', async ({ page }) => {
    test.setTimeout(900000); // 15 minutes

    console.log('\n' + '='.repeat(80));
    console.log('📋 HOPE VISIT 3: MODERATE IMPACT - YES PREFERENCES');
    console.log('='.repeat(80));

    await performHopeVisit(
      page,
      'moderate',
      INV_VISIT_CONFIGS.YES_MODERATE,
      HOPE_YES_MODERATE_CONFIG
    );
  });

  // ============================================
  // Test 5: HOPE Visit - Severe Impact (Yes)
  // ============================================
  test('5. HOPE Visit - Severe Impact Symptoms (Yes preferences)', async ({ page }) => {
    test.setTimeout(900000); // 15 minutes

    console.log('\n' + '='.repeat(80));
    console.log('📋 HOPE VISIT 4: SEVERE IMPACT - YES PREFERENCES');
    console.log('='.repeat(80));

    await performHopeVisit(
      page,
      'severe',
      INV_VISIT_CONFIGS.YES_SEVERE,
      HOPE_YES_SEVERE_CONFIG
    );
  });

  // ============================================
  // Test 6: HOPE Visit - No Symptoms (No)
  // ============================================
  test('6. HOPE Visit - No Symptoms (No preferences)', async ({ page }) => {
    test.setTimeout(900000); // 15 minutes

    console.log('\n' + '='.repeat(80));
    console.log('📋 HOPE VISIT 5: NO SYMPTOMS - NO PREFERENCES');
    console.log('='.repeat(80));

    await performHopeVisit(
      page,
      'noSymptoms',
      INV_VISIT_CONFIGS.NO_SYMPTOMS,
      HOPE_NO_SYMPTOMS_CONFIG
    );
  });
});
