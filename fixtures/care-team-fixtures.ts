/**
 * Care Team Test Data
 * Single object - fill in only the fields you need
 * Workflow reads directly from this - empty/undefined fields are skipped
 */

import { DateHelper } from '../utils/date-helper';

/**
 * Care Team Role Types
 */
export type CareTeamRole =
  | 'Social Worker'
  | 'Spiritual Advisor'
  | 'Registered Nurse'
  | 'Medical Director'
  | 'Nurse Practitioner'
  | 'LVN/LPN'
  | 'Physical Therapist'
  | 'Occupational Therapist'
  | 'Speech Therapist'
  | 'Dietitian'
  | 'Bereavement Counselor'
  | 'Hospice Aide'
  | 'Volunteer Coordinator';

/**
 * Relationship types for caregiver
 */
export type CaregiverRelationship =
  | 'Spouse'
  | 'Child'
  | 'Parent'
  | 'Sibling'
  | 'Brother'
  | 'Sister'
  | 'Grandparent'
  | 'Grandchild'
  | 'Friend'
  | 'Neighbor'
  | 'Other'
  | 'Legal Guardian'
  | 'Power of Attorney';

/**
 * Care Team Selection Data
 */
export interface CareTeamSelectionData {
  teamName?: string;
  roles?: CareTeamRole[];
}

/**
 * Attending Physician Form Data
 */
export interface AttendingPhysicianFormData {
  searchName?: string;
  startDate?: string;
  endDate?: string;
  isPrimary?: boolean;
}

/**
 * Caregiver Form Data
 */
export interface CaregiverFormData {
  relation?: CaregiverRelationship;
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  isPrimaryContact?: boolean;
  isEmergencyContact?: boolean;
  isLegalRepresentative?: boolean;
  isHealthcareProxy?: boolean;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  zipExtension?: string;
}

/**
 * Complete Care Team Form Data
 */
export interface CareTeamFormData {
  careTeam?: CareTeamSelectionData;
  attendingPhysician?: AttendingPhysicianFormData;
  caregiver?: CaregiverFormData;
}

/**
 * Care Team Names by Environment and Tenant
 * Used by workflow to dynamically select the correct team name
 */
export const CARE_TEAM_NAMES: Record<string, Record<string, string>> = {
  qa: {
    cth: 'acyIDGQA',
    integrum: 'Default Team',
  },
  staging: {
    cth: 'Team 1',
  },
  prod: {
    cth: 'Team 1',
    cch: 'Primary Team',
  },
};

/**
 * Default Physician Names by Environment and Tenant
 * Used when no specific physician name is provided
 */
export const DEFAULT_PHYSICIAN_NAMES: Record<string, Record<string, string>> = {
  qa: {
    cth: 'cypresslast',
    integrum: 'test',
  },
  staging: {
    cth: 'cypress',
  },
  prod: {
    cth: 'Smith',
    cch: 'Jones',
  },
};

/**
 * Care Team form data - fill in only the fields you want to use
 * Empty strings and undefined values are skipped by the workflow
 *
 * Usage:
 * 1. Fill in the fields you need below
 * 2. Call: await pages.careTeamWorkflow.completeCareTeamSetup();
 *    Or:   await pages.careTeamWorkflow.addAttendingPhysician();
 *    Or:   await pages.careTeamWorkflow.addCaregiver();
 */
export const CARE_TEAM_FORM_DATA: CareTeamFormData = {
  // === Care Team Selection ===
  careTeam: {
    teamName: '',                           // Leave empty - workflow looks up from CARE_TEAM_NAMES based on env/tenant
    roles: [                                // Roles to add to the care team
      'Social Worker',
      'Spiritual Advisor',
      'Registered Nurse',
      'Medical Director',
    ],
  },

  // === Attending Physician ===
  attendingPhysician: {
    searchName: '',                         // Leave empty - workflow looks up from DEFAULT_PHYSICIAN_NAMES
    startDate: '',                          // MM/DD/YYYY format, empty = use today's date
    endDate: '',                            // MM/DD/YYYY format (optional)
    isPrimary: true,                        // Set as primary physician
  },

  // === Caregiver/Family ===
  caregiver: {
    relation: 'Spouse',                     // Relationship to patient
    firstName: 'Test',                      // Caregiver first name
    lastName: 'Caregiver',                  // Caregiver last name
    phone: '2145551234',                    // Phone number
    email: '',                              // Email address (optional)
    isPrimaryContact: true,                 // Set as primary contact
    isEmergencyContact: false,              // Set as emergency contact
    isLegalRepresentative: false,           // Set as legal representative
    isHealthcareProxy: false,               // Set as healthcare proxy
    address: '123 Main St',                 // Street address
    city: 'Irving',                         // City
    state: 'TX',                            // State
    zipCode: '75061',                       // 5-digit zip
    zipExtension: '',                       // 4-digit extension (optional)
  },
};

/**
 * Create a fresh care team data object with optional overrides
 * Use this for parallel tests to avoid shared state
 *
 * @example
 * // Default care team setup
 * const careTeamData = createCareTeamData();
 *
 * @example
 * // Custom caregiver
 * const customData = createCareTeamData({
 *   caregiver: { relation: 'Child', firstName: 'John', lastName: 'Doe' }
 * });
 */
export function createCareTeamData(overrides?: Partial<CareTeamFormData>): CareTeamFormData {
  const base = JSON.parse(JSON.stringify(CARE_TEAM_FORM_DATA));
  if (overrides) {
    if (overrides.careTeam) {
      base.careTeam = { ...base.careTeam, ...overrides.careTeam };
    }
    if (overrides.attendingPhysician) {
      base.attendingPhysician = { ...base.attendingPhysician, ...overrides.attendingPhysician };
    }
    if (overrides.caregiver) {
      base.caregiver = { ...base.caregiver, ...overrides.caregiver };
    }
  }
  return base;
}

/**
 * Create attending physician data with optional overrides
 *
 * @example
 * const physicianData = createAttendingPhysicianData({ searchName: 'Smith' });
 */
export function createAttendingPhysicianData(overrides?: Partial<AttendingPhysicianFormData>): AttendingPhysicianFormData {
  return { ...CARE_TEAM_FORM_DATA.attendingPhysician, ...overrides };
}

/**
 * Create caregiver data with optional overrides
 *
 * @example
 * const caregiverData = createCaregiverData({ relation: 'Child', firstName: 'Jane' });
 */
export function createCaregiverData(overrides?: Partial<CaregiverFormData>): CaregiverFormData {
  return { ...CARE_TEAM_FORM_DATA.caregiver, ...overrides };
}
