import { Page } from '@playwright/test';
import { DashboardPage } from '../pages/dashboard.page';
import { PatientPage } from '../pages/patient.page';
import { PatientProfilePage } from '../pages/patient-profile.page';
import { PatientData, CareType } from '../types/patient.types';
import { PatientDataGenerator } from '../utils/patient-data-generator';

/**
 * Patient Helper
 * Orchestrates patient workflows by combining DashboardPage and PatientPage
 * Reuses existing navigation from DashboardPage
 */
export class PatientHelper {
  /**
   * Create a new patient
   * @param page - Playwright page object
   * @param careType - Type of care (Hospice, Palliative, Evaluation)
   * @param patientData - Optional patient data (if not provided, will be generated)
   * @returns Created patient data
   */
  static async createPatient(
    page: Page,
    careType: CareType,
    patientData?: Partial<PatientData>
  ): Promise<PatientData> {
    console.log(`\n🏥 Creating ${careType} patient...`);

    // Step 1: Navigate to Patient module using existing DashboardPage
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.navigateToModule('Patient');

    // Step 2: Generate or use provided patient data
    const fullPatientData = patientData
      ? PatientDataGenerator.generatePatientData(careType, patientData)
      : PatientDataGenerator.generatePatientData(careType);

    // Step 3: Create patient page instance
    const patientPage = new PatientPage(page);

    // Step 4: Click Add Patient
    await patientPage.clickAddPatient();

    // Step 5: Select Care Type
    await patientPage.selectCareType(careType);

    // Step 6: Fill patient form
    await patientPage.fillDemographics(fullPatientData);
    await patientPage.fillContactInfo(fullPatientData);
    await patientPage.fillAddress(fullPatientData);

    // Step 7: Fill additional info (optional)
    if (fullPatientData.additionalInfo) {
      await patientPage.fillAdditionalInfo(fullPatientData);
    }

    // Step 8: Fill Hospice-specific fields if applicable
    if (careType === 'Hospice' && fullPatientData.additionalInfo?.skilledBed !== undefined) {
      await patientPage.fillHospiceSpecificFields(fullPatientData.additionalInfo.skilledBed);
    }

    // Step 9: Save patient
    await patientPage.savePatient();

    console.log(`✅ Patient created successfully: ${fullPatientData.demographics.firstName} ${fullPatientData.demographics.lastName}`);

    // Return the full patient data for verification
    return fullPatientData;
  }

  /**
   * Search for a patient and verify it appears in the grid
   * @param page - Playwright page object
   * @param patientName - Patient name to search for (can be first name, last name, or full name)
   * @returns true if patient found, false otherwise
   */
  static async searchAndVerifyPatient(page: Page, patientName: string): Promise<boolean> {
    console.log(`\n🔍 Searching for patient: ${patientName}`);

    const patientPage = new PatientPage(page);

    // Search for patient
    await patientPage.searchPatient(patientName);

    // Get all patients from grid for logging
    const allPatients = await patientPage.getAllPatientNamesFromGrid();
    console.log(`📊 Search returned ${allPatients.length} result(s)`);

    // Verify patient name appears in grid
    const verificationResult = await patientPage.verifyPatientNameInGrid(patientName);

    if (verificationResult.found) {
      console.log(`✅ Patient found in grid at index ${verificationResult.index}:`);
      console.log(`   Name: ${verificationResult.matchedName}`);
      console.log(`   Match Type: ${verificationResult.matchType}`);

      // Additional verification: ensure it's in the first few results (top 5)
      if (verificationResult.index > 4) {
        console.warn(`⚠️  Patient found but at index ${verificationResult.index} (not in top 5 results)`);
      }
    } else {
      console.error(`❌ Patient NOT found in grid: ${patientName}`);
      console.error(`   Results count: ${allPatients.length}`);

      // Log what was actually found
      if (allPatients.length > 0) {
        console.error(`   Found patients in grid:`);
        allPatients.slice(0, 5).forEach(p => {
          console.error(`     - ${p.firstName} ${p.lastName}`);
        });
      } else {
        console.error(`   No patients found in grid`);
      }
    }

    return verificationResult.found;
  }

  /**
   * Search for a patient and open their details
   * @param page - Playwright page object
   * @param patientName - Patient name to search for
   */
  static async searchAndOpenPatient(page: Page, patientName: string): Promise<void> {
    console.log(`\n🔍 Searching and opening patient: ${patientName}`);

    const patientPage = new PatientPage(page);

    // Search for patient
    await patientPage.searchPatient(patientName);

    // Click on patient in grid
    await patientPage.getPatientFromGrid(0);

    console.log(`✅ Opened patient details: ${patientName}`);
  }

  /**
   * Complete patient creation workflow with search verification
   * @param page - Playwright page object
   * @param careType - Type of care
   * @param patientData - Optional patient data
   * @returns Created patient data
   */
  static async createAndVerifyPatient(
    page: Page,
    careType: CareType,
    patientData?: Partial<PatientData>
  ): Promise<PatientData> {
    // Create patient
    const createdPatient = await this.createPatient(page, careType, patientData);

    // Navigate back to patient list
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.navigateToModule('Patient');

    // Search and verify
    const patientName = createdPatient.demographics.firstName;
    const found = await this.searchAndVerifyPatient(page, patientName);

    if (!found) {
      throw new Error(`Patient verification failed: ${patientName} not found in grid`);
    }

    return createdPatient;
  }

  /**
   * Create a Hospice patient (convenience method)
   */
  static async createHospicePatient(
    page: Page,
    patientData?: Partial<PatientData>
  ): Promise<PatientData> {
    return await this.createPatient(page, 'Hospice', patientData);
  }

  /**
   * Create a Palliative patient (convenience method)
   */
  static async createPalliativePatient(
    page: Page,
    patientData?: Partial<PatientData>
  ): Promise<PatientData> {
    return await this.createPatient(page, 'Palliative', patientData);
  }

  /**
   * Create an Evaluation patient (convenience method)
   */
  static async createEvaluationPatient(
    page: Page,
    patientData?: Partial<PatientData>
  ): Promise<PatientData> {
    return await this.createPatient(page, 'Evaluation', patientData);
  }

  /**
   * Complete Patient Details section in patient profile
   * Must be called after patient is created and opened
   * @param page - Playwright page object
   * @param physicianName - Physician name for Caller section
   */
  static async completePatientDetails(page: Page, physicianName: string): Promise<void> {
    console.log('\n📋 Starting Patient Details workflow...');

    const profilePage = new PatientProfilePage(page);
    await profilePage.completePatientDetails(physicianName);

    console.log('✅ Patient Details workflow completed\n');
  }

  /**
   * Complete patient admission workflow: Create → Search → Open → Complete Details
   * @param page - Playwright page object
   * @param careType - Type of care
   * @param physicianName - Physician name for Patient Details
   * @param patientData - Optional patient data
   * @returns Created patient data
   */
  static async createAndCompletePatientDetails(
    page: Page,
    careType: CareType,
    physicianName: string,
    patientData?: Partial<PatientData>
  ): Promise<PatientData> {
    // Create patient
    const createdPatient = await this.createPatient(page, careType, patientData);

    // Navigate back to patient list
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.navigateToModule('Patient');

    // Search and open patient
    const patientName = createdPatient.demographics.firstName;
    await this.searchAndOpenPatient(page, patientName);

    // Complete Patient Details
    await this.completePatientDetails(page, physicianName);

    return createdPatient;
  }
}
