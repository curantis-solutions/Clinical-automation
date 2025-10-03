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
