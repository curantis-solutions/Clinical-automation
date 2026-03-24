/**
 * =============================================================================
 * PATIENT DATA FIXTURES
 * =============================================================================
 *
 * This file contains predefined patient data configurations for testing.
 * Use these fixtures to ensure consistent test data across different tests.
 *
 * USAGE:
 * import { PATIENT_FIXTURES } from '../fixtures/patient-data.fixture';
 * const patientData = PATIENT_FIXTURES.HOSPICE_MALE_VETERAN;
 *
 * =============================================================================
 */

import { CareType, Gender } from '../types/patient.types';

/**
 * Patient Data Fixture Interface
 */
export interface PatientDataFixture {
  // Fixture metadata
  fixtureName: string;
  description: string;

  // Care Type
  careType: CareType;

  // Demographics
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

  // Contact Information
  contactInfo: {
    phoneNumber?: string;
    emailAddress?: string;
  };

  // Address Information
  address: {
    streetAddress?: string;
    city: string;
    state: string;
    zipCode: string;
    zipCodeExt?: string;
    county?: string;
    sameAddress?: boolean;
  };

  // Additional Information
  additionalInfo?: {
    maritalStatus?: string;
    firstLanguage?: string;
    religion?: string;
    ethnicity?: string;
    ethnicityHope?: string;
    raceHope?: string;
    skilledBed?: boolean;
  };

  // Referral Information (Optional)
  referralInfo?: {
    caller?: {
      referralType?: string;
      relation?: string;
      searchName?: string;
    };
    referrer?: {
      relation?: string;
      searchName?: string;
      sameAsCaller?: boolean;
    };
    referringPhysician?: {
      relation?: string;
      searchName?: string;
      sameAsReferrer?: boolean;
    };
    orderingPhysician?: {
      relation?: string;
      searchName?: string;
      sameAsReferringPhysician?: boolean;
    };
  };

  // Runtime data (populated during test execution)
  runtimeData?: {
    patientId?: number;
    createdAt?: string;
    url?: string;
  };
}

/**
 * =============================================================================
 * HOSPICE PATIENT FIXTURES
 * =============================================================================
 */

export const HOSPICE: PatientDataFixture = {
  fixtureName: 'HOSPICE',
  description: 'Hospice male patient, veteran, married, with skilled bed',
  careType: 'Hospice',
 demographics: {
    // firstName, lastName, middleInitial, ssn, nickname will be auto-generated
    dateOfBirth: '01/15/1950',
    gender: 'Male',
    veteran: true,
  },
  contactInfo: {
    // phoneNumber and emailAddress will be auto-generated
  },
  address: {
    // streetAddress will be auto-generated
    city: 'Dallas',
    state: 'TX',
    zipCode: '75201',
    sameAddress: true,
  },
  additionalInfo: {
    maritalStatus: 'Married',
    firstLanguage: 'English',
    religion: 'Christian',
    ethnicity: 'White',
    ethnicityHope: 'No, Not of Hispanic',
    raceHope: 'White',
    skilledBed: true,
  },
  referralInfo: {
    caller: {
      referralType: 'Call',
      relation: 'Physician',
      searchName: 'cypresslast',
    },
    referrer: {
      relation: 'Physician',
      sameAsCaller: false,
    },
    referringPhysician: {
      sameAsReferrer: false,
      searchName: 'cypresslast',
    },
    orderingPhysician: {
      sameAsReferringPhysician: false,
      searchName: 'cypresslast',
    },
  },
};



/**
 * =============================================================================
 * FIXTURE COLLECTION
 * =============================================================================
 */

export const PATIENT_FIXTURES = {
  // Hospice Patients
  HOSPICE,

};

/**
 * Get a random patient fixture
 */
export function getRandomPatientFixture(): PatientDataFixture {
  const fixtureKeys = Object.keys(PATIENT_FIXTURES);
  const randomKey = fixtureKeys[Math.floor(Math.random() * fixtureKeys.length)];
  return PATIENT_FIXTURES[randomKey as keyof typeof PATIENT_FIXTURES];
}

/**
 * Get all hospice patient fixtures
 */
export function getHospiceFixtures(): PatientDataFixture[] {
  return [
    HOSPICE,
 
  ];
}


/**
 * Update fixture with runtime data (patient ID, URL, etc.)
 * This mutates the fixture object to store data captured during test execution
 */
export function updateFixtureRuntimeData(
  fixture: PatientDataFixture,
  runtimeData: {
    patientId?: number;
    url?: string;
  }
): void {
  if (!fixture.runtimeData) {
    fixture.runtimeData = {};
  }

  if (runtimeData.patientId !== undefined) {
    fixture.runtimeData.patientId = runtimeData.patientId;
  }

  if (runtimeData.url) {
    fixture.runtimeData.url = runtimeData.url;
  }

  fixture.runtimeData.createdAt = new Date().toISOString();

  console.log(`📝 Updated fixture runtime data for: ${fixture.fixtureName}`);
  console.log(`   Patient ID: ${fixture.runtimeData.patientId}`);
  console.log(`   Created At: ${fixture.runtimeData.createdAt}`);
}

/**
 * Get patient ID from fixture runtime data
 */
export function getPatientIdFromFixture(fixture: PatientDataFixture): number | undefined {
  return fixture.runtimeData?.patientId;
}

/**
 * Clear runtime data from fixture (useful for test cleanup)
 */
export function clearFixtureRuntimeData(fixture: PatientDataFixture): void {
  if (fixture.runtimeData) {
    delete fixture.runtimeData.patientId;
    delete fixture.runtimeData.url;
    delete fixture.runtimeData.createdAt;
  }
}
