/**
 * =============================================================================
 * REUSABLE ADD PATIENT WORKFLOW FUNCTION
 * =============================================================================
 *
 * This module provides a reusable function to add patients with configurable
 * parameters for different care types and patient information.
 *
 * USAGE:
 * import { addPatientWorkflow, PatientWorkflowConfig } from './patient-creation.workflow';
 *
 * const config: PatientWorkflowConfig = {
 *   careType: 'Hospice',
 *   demographics: { ... },
 *   contactInfo: { ... },
 *   address: { ... }
 * };
 *
 * await addPatientWorkflow(page, config);
 *
 * =============================================================================
 */

import { Page } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { DashboardPage } from '../../pages/dashboard.page';
import { PatientPagenew } from '../../pages/patient.pagenew';
import { CareType, Gender } from '../../types/patient.types';
import { setupPatientChartListener } from '../../utils/api-helper';
import { PatientDataFixture, updateFixtureRuntimeData } from '../../fixtures/patient-data.fixture';


/**
 * Configuration interface for patient workflow
 */
export interface PatientWorkflowConfig {
  // Care Type (required)
  careType: CareType;

  // Demographics (all required except optional fields)
  demographics: {
    firstName?: string;  // Auto-generated if not provided
    lastName?: string;   // Auto-generated if not provided
    middleInitial?: string;
    ssn?: string;        // Auto-generated if not provided
    dateOfBirth: string; // Format: MM/DD/YYYY
    gender: Gender;
    veteran: boolean;
    nickname?: string;
  };

  // Contact Information (required)
  contactInfo: {
    phoneNumber?: string;    // Auto-generated if not provided
    emailAddress?: string;   // Auto-generated if not provided
  };

  // Address Information (required)
  address: {
    streetAddress?: string;  // Auto-generated if not provided
    city: string;
    state: string;           // e.g., 'TX', 'CA'
    zipCode: string;
    zipCodeExt?: string;
    county?: string;
    sameAddress?: boolean;   // Default: true
  };

  // Additional Information (optional)
  additionalInfo?: {
    maritalStatus?: string;
    firstLanguage?: string;
    religion?: string;
    ethnicity?: string;
    ethnicityHope?: string;
    raceHope?: string;
    skilledBed?: boolean;    // For Hospice only
  };

  // Login Credentials (optional - uses default if not provided)
  credentials?: {
    username?: string;
    password?: string;
    role?: string;           // e.g., 'RN', 'MD', 'SW'
  };

  // Options
  options?: {
    skipLogin?: boolean;     // If already logged in
    skipNavigation?: boolean; // If already on Patient page
    returnToPatientList?: boolean; // Navigate back to patient list after creation
  };
}

/**
 * Result returned after patient workflow completion
 */
export interface PatientWorkflowResult {
  success: boolean;
  patientId?: number;
  patientFirstName: string;
  patientLastName: string;
  patientSSN: string;
  error?: string;
  url?: string;
}

/**
 * Main reusable function to add a patient
 * @param page - Playwright Page object
 * @param config - Patient workflow configuration
 * @returns Patient workflow result with patient details
 */
export async function addPatientWorkflow(
  page: Page,
  config: PatientWorkflowConfig
): Promise<PatientWorkflowResult> {
  // Initialize page objects
  const dashboardPage = new DashboardPage(page);
  const patientPage = new PatientPagenew(page);

  // Storage for patient data
  let patientId: number | undefined;
  let patientFirstName: string = '';
  let patientLastName: string = '';
  let patientSSN: string = '';

  try {


    // ===========================================================================
    // STEP 3: SETUP API LISTENER
    // ===========================================================================
    setupPatientChartListener(page, (capturedPatientId) => {
      patientId = capturedPatientId;
      console.log(`📋 Captured Patient ID: ${patientId}`);
    });

    // ===========================================================================
    // STEP 4: CLICK ADD PATIENT
    // ===========================================================================
    console.log('➕ Opening Add Patient form...');
    await patientPage.clickAddPatient();
    await page.waitForTimeout(1500);

    const careTypeSelector = '[data-cy="radio-type-of-care-hospice"]';
    await page.waitForSelector(careTypeSelector, { timeout: 10000 });
    console.log('✅ Add Patient form opened');

    // ===========================================================================
    // STEP 5: GENERATE/PREPARE PATIENT DATA
    // ===========================================================================
    console.log('📝 Preparing patient data...');

    // Generate missing fields
    patientFirstName = config.demographics.firstName || faker.person.firstName();
    patientLastName = config.demographics.lastName || faker.person.lastName();
    patientSSN = config.demographics.ssn || faker.string.numeric(9);

    const patientData = {
      careType: config.careType,
      demographics: {
        firstName: patientFirstName,
        lastName: patientLastName,
        middleInitial: config.demographics.middleInitial || faker.person.middleName().charAt(0),
        nickname: config.demographics.nickname,
        ssn: patientSSN,
        dateOfBirth: config.demographics.dateOfBirth,
        gender: config.demographics.gender,
        veteran: config.demographics.veteran,
      },
      contactInfo: {
        phoneNumber: config.contactInfo.phoneNumber || faker.phone.number(),
        emailAddress: config.contactInfo.emailAddress || faker.internet.email({
          firstName: patientFirstName,
          lastName: patientLastName,
        }),
      },
      address: {
        streetAddress: config.address.streetAddress || faker.location.streetAddress(),
        city: config.address.city,
        state: config.address.state,
        zipCode: config.address.zipCode,
        zipCodeExt: config.address.zipCodeExt,
        county: config.address.county,
        sameAddress: config.address.sameAddress ?? true,
      },
      additionalInfo: config.additionalInfo || {
        maritalStatus: 'Married',
        firstLanguage: 'English',
        religion: 'Christian',
        ethnicity: 'Not Hispanic',
        ethnicityHope: 'Not Hispanic',
        raceHope: 'White',
        skilledBed: false,
      },
    };

    console.log(`  → Patient: ${patientFirstName} ${patientLastName}`);
    console.log(`  → Care Type: ${config.careType}`);

    // ===========================================================================
    // STEP 6: FILL PATIENT FORM
    // ===========================================================================
    console.log('📝 Filling patient form...');

    // Select Care Type
    await patientPage.selectCareType(config.careType);
    console.log('  ✓ Care type selected');

    // Fill Demographics
    await patientPage.fillDemographics(patientData);
    console.log('  ✓ Demographics filled');

    // Fill Additional Info
    await patientPage.fillAdditionalInfo(patientData);
    console.log('  ✓ Additional info filled');

    // Fill Contact Info
    await patientPage.fillContactInfo(patientData);
    console.log('  ✓ Contact info filled');

    // Fill Address
    await patientPage.fillAddress(patientData);
    console.log('  ✓ Address filled');

    // Fill Hospice-specific fields (if applicable)
    if (config.careType === 'Hospice') {
      const skilledBed = patientData.additionalInfo?.skilledBed ?? false;
      await patientPage.fillHospiceSpecificFields(skilledBed);
      console.log('  ✓ Hospice fields filled');
    }

    // ===========================================================================
    // STEP 7: SAVE PATIENT
    // ===========================================================================
    console.log('💾 Saving patient...');
    await patientPage.savePatient();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    console.log('✅ Patient saved successfully');

    // ===========================================================================
    // STEP 8: RETURN TO PATIENT LIST (if requested)
    // ===========================================================================
    if (config.options?.returnToPatientList) {
      console.log('🔙 Returning to patient list...');
      await page.goBack();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
    }

    // ===========================================================================
    // RETURN RESULT
    // ===========================================================================
    const result: PatientWorkflowResult = {
      success: true,
      patientId,
      patientFirstName,
      patientLastName,
      patientSSN,
      url: page.url(),
    };

    console.log('\n' + '='.repeat(70));
    console.log('🎉 PATIENT CREATED SUCCESSFULLY');
    console.log('='.repeat(70));
    console.log(`  Name:        ${patientFirstName} ${patientLastName}`);
    console.log(`  SSN:         ${patientSSN}`);
    console.log(`  DOB:         ${config.demographics.dateOfBirth}`);
    console.log(`  Gender:      ${config.demographics.gender}`);
    console.log(`  Patient ID:  ${patientId || 'Not captured'}`);
    console.log(`  Care Type:   ${config.careType}`);
    console.log('='.repeat(70) + '\n');

    return result;

  } catch (error) {
    console.error('❌ Patient workflow failed:', error);

    return {
      success: false,
      patientFirstName: patientFirstName || 'Unknown',
      patientLastName: patientLastName || 'Unknown',
      patientSSN: patientSSN || 'Unknown',
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Add patient using fixture data
 * @param page - Playwright Page object
 * @param fixture - Patient data fixture from patient-data.fixture.ts
 * @param options - Optional workflow options (skipLogin, skipNavigation, etc.)
 * @returns Patient workflow result with patient details
 */
export async function addPatientFromFixture(
  page: Page,
  fixture: PatientDataFixture,
  options?: {
    skipLogin?: boolean;
    skipNavigation?: boolean;
    returnToPatientList?: boolean;
    credentials?: {
      username?: string;
      password?: string;
      role?: string;
    };
  }
): Promise<PatientWorkflowResult> {
  console.log(`\n📋 Using fixture: ${fixture.fixtureName}`);
  console.log(`   Description: ${fixture.description}`);

  // Convert fixture to workflow config
  const config: PatientWorkflowConfig = {
    careType: fixture.careType,
    demographics: fixture.demographics,
    contactInfo: fixture.contactInfo,
    address: fixture.address,
    additionalInfo: fixture.additionalInfo,
    credentials: options?.credentials,
    options: {
      skipLogin: options?.skipLogin,
      skipNavigation: options?.skipNavigation,
      returnToPatientList: options?.returnToPatientList,
    },
  };

  // Use the main workflow function
  const result = await addPatientWorkflow(page, config);

  // Store patient ID and URL back to fixture if successful
  if (result.success && result.patientId) {
    updateFixtureRuntimeData(fixture, {
      patientId: result.patientId,
      url: result.url,
    });
  }

  return result;
}
