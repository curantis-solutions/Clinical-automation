/**
 * Benefit Type Definitions
 * Used for patient benefits management (Primary, Secondary, Room And Board)
 */

/**
 * Payer Level Options
 * - Primary: First benefit type (always available)
 * - Secondary: Available after Primary exists
 * - Room And Board: Available after Primary exists (Hospice only, not Palliative)
 */
export type PayerLevel = 'Primary' | 'Secondary' | 'Room And Board';

/**
 * Payer Type Options
 * - Primary/Secondary: Medicare, Medicaid, Commercial
 * - Room And Board: Commercial, Medicaid (no Medicare)
 */
export type PayerType = 'Medicare' | 'Medicaid' | 'Commercial';

/**
 * Bill Rate Options (Room And Board only)
 * - Bill at Facility Rate: Requires Care Level selection
 * - Bill at Payer Room and Board Rate: Care Level not shown
 */
export type BillRate = 'Bill at Facility Rate' | 'Bill at Payer Room and Board Rate';

/**
 * Patient Liability Options (Room And Board Eligibility)
 */
export type PatientLiability = 'Yes' | 'No';

/**
 * Relationship to Patient Options
 */
export type RelationshipToPatient =
  | 'Self'
  | 'Spouse'
  | 'Child'
  | 'Parent'
  | 'Grandparent'
  | 'Other';

/**
 * Care Level Options (Room And Board - Bill at Facility Rate)
 */
export type CareLevel =
  | 'Regular - GeneralRoom'
  | 'Regular - SemiPrivateRoom'
  | 'Regular - PrivateRoom'
  | 'Respite - GeneralRoom'
  | 'Respite - SemiPrivateRoom'
  | 'Respite - PrivateRoom';

/**
 * Complete Benefit Form Data Interface
 * Covers all fields for Primary, Secondary, and Room And Board benefits
 */
export interface BenefitFormData {
  // === Required Fields (All Benefit Types) ===
  /** Payer level selection */
  payerLevel: PayerLevel;
  /** Payer type selection */
  payerType: PayerType;
  /** Payer name (searchable dropdown) */
  payerName: string;
  /** Payer effective date (MM/DD/YYYY) */
  payerEffectiveDate: string;

  // === Room And Board Specific Required Fields ===
  /** Billing effective date (MM/DD/YYYY) - Room And Board only */
  billingEffectiveDate?: string;
  /** Bill rate selection - Room And Board only */
  billRate?: BillRate;
  /** Care level - Required only when billRate = 'Bill at Facility Rate' */
  careLevel?: CareLevel | string;

  // === Optional Fields ===
  /** VBID checkbox */
  vbid?: boolean;
  /** Medicare number */
  medicareNumber?: string;
  /** Medicaid number */
  medicaidNumber?: string;
  /** Medicaid pending checkbox */
  medicaidPending?: boolean;
  /** Plan name index (for selecting from dropdown by index) */
  planNameIndex?: number;
  /** Plan name text (for selecting from dropdown by text) */
  planName?: string;
  /** Patient eligibility verified checkbox */
  patientEligibilityVerified?: boolean;

  // === Subscriber Details ===
  /** Relationship to patient */
  relationshipToPatient?: RelationshipToPatient | string;
  /** Group number */
  groupNumber?: string;
  /** Subscriber date of birth (MM/DD/YYYY) */
  subscriberDateOfBirth?: string;
  /** Subscriber first name */
  subscriberFirstName?: string;
  /** Subscriber last name */
  subscriberLastName?: string;
  /** Subscriber middle initial */
  subscriberMiddleInitial?: string;
  /** Subscriber address */
  subscriberAddress?: string;
  /** Subscriber city */
  subscriberCity?: string;
  /** Subscriber state */
  subscriberState?: string;
  /** Subscriber zip code */
  subscriberZipCode?: string;
  /** Subscriber zip extension */
  subscriberZipExtension?: string;
  /** Subscriber phone */
  subscriberPhone?: string;
  /** Subscriber email */
  subscriberEmail?: string;
  /** Additional info */
  additionalInfo?: string;
  /** Subscriber/Policy ID */
  subscriberId?: string;
  /** Subscriber effective date (MM/DD/YYYY) */
  subscriberEffectiveDate?: string;
  /** Subscriber expired date (MM/DD/YYYY) */
  subscriberExpiredDate?: string;

  // === Hospice Eligibility Details (Primary/Secondary) ===
  /** Benefit election date (MM/DD/YYYY) */
  benefitElectionDate?: string;
  /** Admit benefit period */
  admitBenefitPeriod?: string | number;
  /** Benefit period start date (MM/DD/YYYY) */
  benefitPeriodStartDate?: string;
  /** High days used (Routine Home Care) */
  highDaysUsed?: string | number;
  /** Previous hospice start date (MM/DD/YYYY) */
  previousHospiceStartDate?: string;
  /** Previous hospice discharge date (MM/DD/YYYY) */
  previousHospiceDischargeDate?: string;
  /** Date of final bill (MM/DD/YYYY) */
  dateOfFinalBill?: string;
  /** Notice accepted date (MM/DD/YYYY) — only available post-admission */
  noticeAcceptedDate?: string;

  // === Room And Board Eligibility Details ===
  /** Patient liability */
  patientLiability?: PatientLiability;
  /** Liability amount */
  liabilityAmount?: number;
  /** Liability from date (MM/DD/YYYY) */
  liabilityFromDate?: string;
  /** Liability to date (MM/DD/YYYY) */
  liabilityToDate?: string;
}
