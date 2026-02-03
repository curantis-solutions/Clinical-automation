/**
 * Patient-related type definitions
 */

export type CareType = 'Hospice' | 'Palliative' | 'Evaluation';

export type Gender = 'Male' | 'Female';

export interface PatientDemographics {
  firstName: string;
  lastName: string;
  middleInitial?: string;
  nickname?: string;
  ssn: string;
  dateOfBirth: string; // Format: MM/DD/YYYY
  gender: Gender;
  veteran: boolean;
}

export interface PatientContactInfo {
  phoneNumber: string;
  emailAddress: string;
}

export interface PatientAddress {
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  zipCodeExt?: string;
  county?: string;
  sameAddress?: boolean; // Service address same as home address
}

export interface PatientAdditionalInfo {
  maritalStatus?: string;
  firstLanguage?: string;
  religion?: string;
  ethnicity?: string;
  ethnicityHope?: string;
  raceHope?: string;
  skilledBed?: boolean; // For Hospice only
}

export interface PatientData {
  careType: CareType;
  demographics: PatientDemographics;
  contactInfo: PatientContactInfo;
  address: PatientAddress;
  additionalInfo?: PatientAdditionalInfo;
}

export interface PatientSearchCriteria {
  firstName?: string;
  lastName?: string;
  ssn?: string;
  dateOfBirth?: string;
}

/**
 * Comprehensive Add Patient Form Data
 * Maps to all fields in add-patient-details-popover.html
 */
export interface AddPatientFormData {
  // Type of Care (required)
  careType: CareType;

  // Demographics
  firstName: string;
  middleInitial?: string;
  lastName: string;
  prefix?: string;           // Select option ID
  suffix?: string;           // Select option ID
  nickname?: string;
  ssn?: string;
  ssnUnknown?: boolean;
  codeStatus?: string;       // Select option ID
  dateOfBirth: string;       // Format: MM/DD/YYYY
  gender: 'Male' | 'Female'; // Maps to value '1' or '2'
  veteran: boolean;

  // Additional Info
  maritalStatus?: string;    // Select option ID
  firstLanguage?: string;    // Select option ID
  religion?: string;         // Select option ID
  religionOtherText?: string; // When religion is 'Other'
  ethnicityHis?: string[];   // ng-select multi-select IDs
  ethnicityHope?: string[];  // ng-select multi-select IDs
  raceHope?: string[];       // ng-select multi-select IDs

  // Contact Info
  phoneNumber?: string;
  emailAddress?: string;
  riskPriority?: string;     // Select option ID
  emergencyPreparedness?: string;

  // Home Address
  streetAddress?: string;
  city?: string;
  state?: string;            // State abbreviation e.g., 'TX'
  zipCode?: string;
  zipCodeExt?: string;
  county?: string;

  // Referral Location
  sameAsHomeAddress?: boolean;
  locationType?: string;     // Select option ID
  locationTypeValue?: string; // Search input value

  // Referral Address (when creating new)
  referralName?: string;
  referralStreetAddress?: string;
  referralCity?: string;
  referralState?: string;
  referralZip?: string;
  referralZipCodeExt?: string;
  referralCounty?: string;
  referralPhone?: string;
  referralEmailAddress?: string;

  // Living Will
  livingWill?: boolean;

  // Hospice Specific
  skilledBed?: boolean;
  daysRemaining?: string;    // Select option value (when skilledBed is true)
  roomNumber?: string;       // Input value (when skilledBed is true)
}
