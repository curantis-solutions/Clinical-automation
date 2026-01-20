/**
 * HOPE (Hospice Outcomes and Patient Evaluation) Type Definitions
 * Used across all HOPE assessment tests
 */

/**
 * Symptom Impact Levels
 * Maps to HIS (Hospice Item Set) coding standards
 */
export type SymptomImpactLevel =
  | 'NoSymptoms'      // 9 - Patient not experiencing the symptom
  | 'NoImpact'        // 0 - Not Impacted
  | 'MildImpact'      // 1 - Mild Impact
  | 'ModerateImpact'  // 2 - Moderate Impact
  | 'SevereImpact';   // 3 - Severe Impact

/**
 * Preference Response Types
 */
export type PreferenceResponse =
  | 'Yes'      // Yes and discussion occurred with date
  | 'No'       // No
  | 'Refuse';  // Yes but patient refused to discuss

/**
 * Bowel Issue Types
 */
export type BowelIssueType =
  | 'Constipation'
  | 'Diarrhea'
  | 'Regular'
  | 'None';

/**
 * Living Arrangement Types
 */
export type LivingArrangement =
  | 'Alone'
  | 'With Others in Home'
  | 'Congregate Home';

/**
 * Assistance Level Types
 */
export type AssistanceLevel =
  | 'None'
  | 'Occasional'
  | 'Regular Nighttime Only'
  | 'Regular';

/**
 * Individual Symptom Data
 */
export interface SymptomData {
  pain: string;
  shortnessOfBreath: string;
  anxiety: string;
  nausea: string;
  vomiting: string;
  diarrhea: string;
  constipation: string;
  agitation: string;
}

/**
 * HOPE Section A - Administration
 */
export interface AdministrationData {
  language: string;
  interpreter?: string;
  livingArrangement: LivingArrangement;
  assistanceLevel: AssistanceLevel;
}

/**
 * HOPE Section F - Preferences
 */
export interface PreferencesData {
  cpr: {
    response: PreferenceResponse;
    discussionDate?: string;
    hasAlert?: boolean;
  };
  lifeSustaining: {
    response: PreferenceResponse;
    discussionDate?: string;
    hasAlert?: boolean;
  };
  hospitalization: {
    response: PreferenceResponse;
    discussionDate?: string;
    hasAlert?: boolean;
  };
  spiritual: {
    response: PreferenceResponse;
    discussionDate?: string;
  };
}

/**
 * HOPE Section J - Clinical
 */
export interface ClinicalData {
  imminentDeath?: 'Yes' | 'No';
  painScreening?: string;
  painActiveProblem?: string;
  painAssessment?: string;
  neuropathicPain?: string;
  shortnessOfBreath?: string;
  symptomImpact: SymptomData;
  symptomReassessment?: string;
}

/**
 * HOPE Section M - Skin Conditions
 */
export interface SkinConditionsData {
  pressureUlcer?: 'Yes' | 'No';
  stagingUlcer?: 'Yes' | 'No';
  diabeticFootUlcer?: 'Yes' | 'No';
  otherWounds?: 'Yes' | 'No';
  noneOfAbove?: 'Yes' | 'No';
  hasAlert?: boolean;
  pressureDeviceChair?: 'Yes' | 'No';
  pressureDeviceBed?: 'Yes' | 'No';
}

/**
 * HOPE Section N - Medications
 */
export interface MedicationsData {
  scheduledOpioid: 'Yes' | 'No';
  prnOpioid: 'Yes' | 'No';
  bowelRegimen: 'Yes' | 'No' | 'No, but there is documentation of why a bowel regimen was not initiated or continued';
}

/**
 * Complete HOPE Preview Expectations
 */
export interface HOPEPreviewExpectations {
  administration: AdministrationData;
  preferences: PreferencesData;
  clinical: ClinicalData;
  skinConditions?: SkinConditionsData;
  medications: MedicationsData;
}

/**
 * INV Visit Configuration
 */
export interface InvVisitConfig {
  role: string;
  preferenceResponse: PreferenceResponse;
  cprmsg?: string;
  lifeSustainingMsg?: string;
  bowelType: BowelIssueType;
  bowelRegimen: 'Yes' | 'No' | 'NowithDocument';
  impactLevel: SymptomImpactLevel;
}

/**
 * Alert Verification Configuration
 */
export interface AlertConfig {
  inv: {
    expected: boolean;
    daysFromAdmit: number;
  };
  huv1?: {
    expected: boolean;
    daysFromAdmit: number;
  };
}

/**
 * Patient Admission Configuration
 */
export interface PatientAdmissionConfig {
  admissionDateOffset: number; // Negative for past dates, 0 for today
  patientIdSuffix: string; // e.g., 'NoimpactSym', 'MildSym'
  expectedAlerts: AlertConfig;
}

/**
 * HIS (Hospice Item Set) Record Data
 */
export interface HISRecordData {
  status: string;
  npi: string;
  cmsNumber: string;
  site: string;
  admissionDate: string;
  ssn: string; // Can be masked
  dateOfBirth: string;
  demographics: {
    firstName: string;
    lastName: string;
    gender: string;
  };
  payer: {
    medicare?: string;
    medicaid?: string;
  };
}

/**
 * Complete Test Data Configuration
 */
export interface HOPETestConfig {
  admission?: PatientAdmissionConfig;
  visit?: InvVisitConfig;
  expectations?: HOPEPreviewExpectations;
  his?: HISRecordData;
}
