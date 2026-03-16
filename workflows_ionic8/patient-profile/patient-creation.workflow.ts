/**
 * =============================================================================
 * REUSABLE ADD PATIENT WORKFLOW FUNCTION (Ionic 8)
 * =============================================================================
 */

import { Page } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { DashboardPage } from '../../pages_ionic8/dashboard.page';
import { PatientPagenew } from '../../pages_ionic8/patient.pagenew';
import { CareType, Gender } from '../../types/patient.types';
import { setupPatientChartListener } from '../../utils/api-helper';
import { PatientDataFixture, updateFixtureRuntimeData } from '../../fixtures/patient-data.fixture';


/**
 * Configuration interface for patient workflow
 */
export interface PatientWorkflowConfig {
  careType: CareType;
  demographics: {
    firstName?: string;
    lastName?: string;
    middleInitial?: string;
    ssn?: string;
    dateOfBirth: string;
    gender: Gender;
    veteran: boolean;
    nickname?: string;
  };
  contactInfo: {
    phoneNumber?: string;
    emailAddress?: string;
  };
  address: {
    streetAddress?: string;
    city: string;
    state: string;
    zipCode: string;
    zipCodeExt?: string;
    county?: string;
    sameAddress?: boolean;
  };
  additionalInfo?: {
    maritalStatus?: string;
    firstLanguage?: string;
    religion?: string;
    ethnicity?: string;
    ethnicityHope?: string;
    raceHope?: string;
    skilledBed?: boolean;
  };
  credentials?: {
    username?: string;
    password?: string;
    role?: string;
  };
  options?: {
    skipLogin?: boolean;
    skipNavigation?: boolean;
    returnToPatientList?: boolean;
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
 */
export async function addPatientWorkflow(
  page: Page,
  config: PatientWorkflowConfig
): Promise<PatientWorkflowResult> {
  const dashboardPage = new DashboardPage(page);
  const patientPage = new PatientPagenew(page);

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

    // qa2: Add Patient opens as ion-modal with radio buttons for care type
    const formSelector = '[data-cy="form-patient-details"], [data-cy="radio-type-of-care-hospice"]';
    await page.waitForSelector(formSelector, { timeout: 10000 });
    console.log('✅ Add Patient form opened');

    // ===========================================================================
    // STEP 5: GENERATE/PREPARE PATIENT DATA
    // ===========================================================================
    console.log('📝 Preparing patient data...');

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
        ethnicity: 'White',
        ethnicityHope: 'No, Not of Hispanic',
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

    await patientPage.selectCareType(config.careType);
    console.log('  ✓ Care type selected');

    await patientPage.fillDemographics(patientData);
    console.log('  ✓ Demographics filled');

    await patientPage.fillAdditionalInfo(patientData);
    console.log('  ✓ Additional info filled');

    await patientPage.fillContactInfo(patientData);
    console.log('  ✓ Contact info filled');

    await patientPage.fillAddress(patientData);
    console.log('  ✓ Address filled');

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

  const result = await addPatientWorkflow(page, config);

  if (result.success && result.patientId) {
    updateFixtureRuntimeData(fixture, {
      patientId: result.patientId,
      url: result.url,
    });
  }

  return result;
}
