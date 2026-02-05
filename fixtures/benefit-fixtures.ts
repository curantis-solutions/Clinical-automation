/**
 * Benefit Test Data
 * Single object - fill in only the fields you need
 * Workflow reads directly from this - empty/undefined fields are skipped
 */

import { BenefitFormData, PayerType } from '../types/benefit.types';

// Re-export PayerType for backwards compatibility
export type { PayerType };

/**
 * Benefit type options
 */
export type BenefitType = 'Hospice' | 'Palliative' | 'Room And Board';

/**
 * BenefitType → Environment → Tenant → PayerType → PayerName mapping
 * Used by workflow to dynamically select the correct payer name
 * Note: Room And Board does not support Medicare
 */
export const PAYER_NAMES: Record<BenefitType, Record<string, Record<string, Partial<Record<PayerType, string>>>>> = {
  Hospice: {
    qa: {
      cth: { Medicare: 'Medicare A', Medicaid: 'Medicaid Amy TX', Commercial: 'All Payer Test' },
      integrum: { Medicare: 'Medicare A', Medicaid: 'Medicaid Hospice', Commercial: 'A hospice rate1' },
    },
    staging: {
      cth: { Medicare: '', Medicaid: '', Commercial: '' }, 
    },
    prod: {
      cth: { Medicare: 'Medicare A', Medicaid: 'Automation Medicaid', Commercial: 'All Commercial' },   
    },
  },
  Palliative: {
    qa: {
      cth: { Medicare: 'Medicare Part A', Medicaid: 'NewPalliative Payer', Commercial: 'All Payer Test' },
      integrum: { Medicare: 'Medicare Part A', Medicaid: 'Medicaid SIA', Commercial: 'All Payer' },
    },
    staging: {
      cth: { Medicare: '', Medicaid: '', Commercial: '' },   
    },
    prod: {
      cth: { Medicare: 'Medicare A', Medicaid: 'Medicaid Prod', Commercial: 'Aetna' },
    },
  },
  'Room And Board': {
    qa: {
      cth: { Medicaid: 'Medicaid R&B', Commercial: 'All Payer Test' },
      integrum: { Medicaid: 'Medicaid QA', Commercial: 'A hospice rate1' },
    },
    staging: {
      cth: { Medicaid: '', Commercial: '' }, 
    },
    prod: {
      cth: { Medicaid: 'A rb payer', Commercial: 'All Commercial' },
    },
  },
};

/**
 * Benefit form data - fill in only the fields you want to use
 * Empty strings and undefined values are skipped by the workflow
 *
 * Usage:
 * 1. Fill in the fields you need below
 * 2. Call: await pages.benefitsWorkflow.fillBenefitDetails('add');
 *    Or:   await pages.benefitsWorkflow.fillBenefitDetails('edit', ['field1', 'field2']);
 */
export const BENEFIT_FORM_DATA: Partial<BenefitFormData> = {
  // === Required Fields (All Benefit Types) ===
  payerLevel: 'Primary',                    // 'Primary' | 'Secondary' | 'Room And Board'
  payerType: 'Medicare',                    // 'Medicare' | 'Medicaid' | 'Commercial' (R&B: no Medicare)
  payerName: '',                               // Leave empty - workflow looks up from PAYER_NAMES based on env/tenant/payerType
  payerEffectiveDate: '01/01/2026',                   // MM/DD/YYYY format, empty = use today's date

  // === Room And Board Specific (only fill if payerLevel = 'Room And Board') ===
  billingEffectiveDate: '01/15/2026',                 // MM/DD/YYYY format
  billRate: 'Bill at Facility Rate',                  // 'Bill at Facility Rate' | 'Bill at Payer Room and Board Rate'
  careLevel: 'Regular - GeneralRoom',                 // Required only when billRate = 'Bill at Facility Rate'
                                            // Options: 'Regular - GeneralRoom' | 'Regular - SemiPrivateRoom' |
                                            //          'Regular - PrivateRoom' | 'Respite - GeneralRoom' |
                                            //          'Respite - SemiPrivateRoom' | 'Respite - PrivateRoom'

  // === Optional Fields ===
  vbid: undefined,                          // true to check VBID checkbox
  medicareNumber: '',                       // HIS/HOPE Medicare number
  medicaidNumber: '',                       // HIS/HOPE Medicaid number
  medicaidPending: undefined,               // true to check Medicaid pending
  planNameIndex: 2,                 // Plan name dropdown index (0-based)
  planName: '',                             // Plan name text (alternative to index)
  patientEligibilityVerified: true,    // true to check eligibility verified

  // === Subscriber Details ===
  relationshipToPatient: 'Spouse',                // 'Self' | 'Spouse' | 'Child' | 'Parent' | 'Grandparent' | 'Other'
  groupNumber: 'GRP9087',                  // Group number
  subscriberDateOfBirth: '01/20/1967',                // MM/DD/YYYY format
  subscriberFirstName: 'First',                  // First name
  subscriberLastName: 'Last',                   // Last name
  subscriberMiddleInitial: 'M',              // Middle initial
  subscriberAddress: '100 state',                    // Street address
  subscriberCity: 'Dallas',                       // City
  subscriberState: 'TX',                      // State (dropdown)
  subscriberZipCode: '75002',                    // 5-digit zip
  subscriberZipExtension: '1234',               // 4-digit extension
  subscriberPhone: '4566666666',                      // Phone number
  subscriberEmail: '',                      // Email address
  additionalInfo: '',                       // Additional info textarea
  subscriberId: '9AA9AA9AA88',                 // Subscriber/Policy ID
  subscriberEffectiveDate: '',              // MM/DD/YYYY format
  subscriberExpiredDate: '',                // MM/DD/YYYY format

  // === Hospice Eligibility (skipped for Palliative and Room And Board) ===
  benefitElectionDate: '',                  // MM/DD/YYYY format
  admitBenefitPeriod: '1',                  // Benefit period number
  benefitPeriodStartDate: '01/01/2026',               // MM/DD/YYYY format
  highDaysUsed: '0',                        // Routine Home Care high days
  previousHospiceStartDate: '',             // MM/DD/YYYY format
  previousHospiceDischargeDate: '',         // MM/DD/YYYY format
  dateOfFinalBill: '',                      // MM/DD/YYYY format

  // === Room And Board Eligibility ===
  patientLiability: undefined,                  // 'Yes' | 'No'
  liabilityAmount:undefined ,                     // Liability amount
  liabilityFromDate: '',          // MM/DD/YYYY format
  liabilityToDate: '',            // MM/DD/YYYY format
};

/**
 * Create a fresh benefit data object with optional overrides
 * Use this for parallel tests to avoid shared state
 *
 * @example
 * // Hospice test
 * const hospiceData = createBenefitData({ payerType: 'Medicare' });
 *
 * // Palliative test (can run in parallel)
 * const palliativeData = createBenefitData({ payerType: 'Medicaid' });
 */
export function createBenefitData(overrides?: Partial<BenefitFormData>): Partial<BenefitFormData> {
  return { ...BENEFIT_FORM_DATA, ...overrides };
}
