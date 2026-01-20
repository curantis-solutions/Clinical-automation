/**
 * Patient Profile type definitions
 * Used for completing patient profile after initial admission
 */

/**
 * Caller information
 */
export interface CallerData {
  physicianName: string;
  referralType?: string;  // Optional: defaults to first option if not provided
  relation?: string;      // Optional: defaults to option if not provided
}

/**
 * Referrer information
 */
export interface ReferrerData {
  sameAsCaller: boolean;
  // Future: Add manual entry fields if needed
  // firstName?: string;
  // lastName?: string;
  // phoneNumber?: string;
}

/**
 * Referring Physician information
 */
export interface ReferringPhysicianData {
  sameAsReferrer: boolean;
  // Future: Add manual entry or search fields if needed
}

/**
 * Ordering Physician information
 */
export interface OrderingPhysicianData {
  sameAsReferring: boolean;
  // Future: Add manual entry or search fields if needed
}

/**
 * Complete Patient Details section data
 */
export interface PatientDetailsData {
  caller: CallerData;
  referrer: ReferrerData;
  referringPhysician: ReferringPhysicianData;
  orderingPhysician: OrderingPhysicianData;
}

/**
 * Default Patient Details data for quick testing
 * Uses "same as" checkboxes for all sections
 */
export const defaultPatientDetails = (physicianName: string): PatientDetailsData => ({
  caller: {
    physicianName,
  },
  referrer: {
    sameAsCaller: true,
  },
  referringPhysician: {
    sameAsReferrer: true,
  },
  orderingPhysician: {
    sameAsReferring: true,
  },
});
