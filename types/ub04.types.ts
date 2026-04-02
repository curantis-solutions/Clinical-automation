/**
 * UB-04 Form Field Definitions
 * Maps UB-04 CMS-1450 box numbers to expected values for claim PDF verification.
 * Supports all claim types: 81A (NOE), 812, 813, 811, 814.
 */

/**
 * Revenue line item for Box 42-49 verification.
 * Each line represents one service line on the UB-04 form.
 */
export interface Ub04RevenueLineItem {
  /** Box 42: Revenue Code (e.g., "0651") */
  revenueCode?: string;
  /** Box 43: Description (e.g., "Routine Home Care (1-60)") */
  description?: string;
  /** Box 44: HCPCS / Rate / HIPPS Code (e.g., "Q5001") */
  hcpcsCode?: string;
  /** Box 45: Service Date (MMDDYY) */
  serviceDate?: string;
  /** Box 46: Service Units */
  serviceUnits?: string;
  /** Box 47: Total Charges for this line */
  totalCharges?: string;
}

/**
 * Expected UB-04 field values for PDF verification.
 * Each field corresponds to a UB-04 box number.
 *
 * Usage:
 * - Set to a non-empty string to verify it IS present in the PDF.
 * - Set to empty string ('') to verify it is NOT present (field should be blank).
 * - Omit (undefined) to skip verification for that field.
 * - For arrays (revenueLineItems, diagnosisCodes): set to [] to verify empty,
 *   or provide items to verify each is present.
 */
export interface Ub04ExpectedFields {
  // === Provider Info ===
  /** Box 1: Provider Name */
  box1_providerName?: string;

  // === Claim Identifiers ===
  /** Box 3a: PAT CNTL # — Claim ID */
  box3a_claimId?: string;
  /** Box 3b: MED REC # — Patient Chart ID */
  box3b_chartId?: string;
  /** Box 4: Type of Bill (e.g., '81A', '812', '813', '811', '814') */
  box4_billType?: string;
  /** Box 5: Federal Tax Number */
  box5_fedTaxNo?: string;

  // === Statement Period ===
  /** Box 6 FROM: Statement Covers Period start date (MM/DD/YYYY) */
  box6_fromDate?: string;
  /** Box 6 THROUGH: Statement Covers Period end date (MM/DD/YYYY) — empty for NOE */
  box6_throughDate?: string;

  // === Patient Info ===
  /** Box 8: Patient Name — "LastName, FirstName MI" */
  box8_patientName?: string;
  /** Box 10: Patient Birthdate (MM/DD/YYYY) */
  box10_birthdate?: string;
  /** Box 11: Patient Sex (M/F) */
  box11_sex?: string;
  /** Box 12: Admission Date (MMDDYY) */
  box12_admissionDate?: string;

  // === Admission Info ===
  /** Box 14: Priority (Type) of Admission or Visit */
  box14_admissionType?: string;
  /** Box 15: Point of Origin for Admission or Visit (SRC) */
  box15_sourceOfAdmission?: string;
  /** Box 17: Patient Discharge Status */
  box17_status?: string;

  // === Occurrence / Condition ===
  /** Box 31: Occurrence Code (e.g., '27' for BPSD) */
  box31_occurrenceCode?: string;
  /** Box 31: Occurrence Date (MMDDYY) */
  box31_occurrenceDate?: string;
  /** Box 32-35: Condition Codes — set to [] to verify empty, or provide code strings */
  box32to35_conditionCodes?: string[];

  /** Box 35: Occurrence Span Code (e.g., '77' for non-covered days) */
  box35_occurrenceSpanCode?: string;
  /** Box 35: Occurrence Span From Date (MMDDYY) */
  box35_occurrenceSpanFromDate?: string;
  /** Box 35: Occurrence Span Through Date (MMDDYY) */
  box35_occurrenceSpanToDate?: string;

  // === Revenue Line Items (Box 42-49) ===
  /** Box 42-49: Revenue line items — set to [] to verify empty (no RLIS) */
  revenueLineItems?: Ub04RevenueLineItem[];
  /** Box 47: Total charges (grand total at bottom) */
  box47_totalCharges?: string;

  // === Payer Info ===
  /** Box 50: Payer Name */
  box50_payerName?: string;
  /** Box 60: Insured's Unique ID (e.g., Medicare number) */
  box60_insuredId?: string;

  // === Diagnosis ===
  /** Box 67-72: Diagnosis Codes (ICD-10) — provide codes to verify each is present */
  diagnosisCodes?: string[];

  // === Physician ===
  /** Box 76: Attending Physician Last Name */
  box76_attendingLastName?: string;
  /** Box 76: Attending Physician NPI */
  box76_attendingNpi?: string;
}

// === Date Helper ===

/** Convert MM/DD/YYYY to MMDDYY for UB-04 date fields */
export function toUb04Date(date: string): string {
  const [mm, dd, yyyy] = date.split('/');
  return `${mm}${dd}${yyyy.substring(2)}`;
}

// === Builder Functions ===

/**
 * Build expected UB-04 fields for a Notice (81A) claim.
 * NOE has no revenue items, no through date, no condition codes.
 */
export function buildNoticeUb04Expected(params: {
  claimId: string;
  chartId: string;
  patientName: string;
  payerName: string;
  admitDate: string;   // MM/DD/YYYY
  bpsd: string;        // MM/DD/YYYY — Benefit Period Start Date
}): Ub04ExpectedFields {
  return {
    box3a_claimId: params.claimId,
    box3b_chartId: params.chartId,
    box4_billType: '81A',
    box6_fromDate: params.admitDate,
    box6_throughDate: '',                // Empty for NOE
    box8_patientName: params.patientName,
    box14_admissionType: '3',
    box15_sourceOfAdmission: '9',
    box17_status: '30',
    box31_occurrenceCode: '27',
    box31_occurrenceDate: toUb04Date(params.bpsd),
    box32to35_conditionCodes: [],        // Empty for NOE
    revenueLineItems: [],                // Empty for NOE (no RLIS)
    box50_payerName: params.payerName,
  };
}

/**
 * Build expected UB-04 fields for a regular hospice claim (812/813/811/814).
 * Regular claims have revenue line items, through date, diagnosis codes, etc.
 */
export function buildClaimUb04Expected(params: {
  claimId: string;
  chartId: string;
  patientName: string;
  payerName: string;
  billType: '811' | '812' | '813' | '814';
  fromDate: string;      // MM/DD/YYYY — service start
  throughDate: string;    // MM/DD/YYYY — service end
  admitDate: string;      // MM/DD/YYYY
  bpsd: string;           // MM/DD/YYYY
  revenueLineItems?: Ub04RevenueLineItem[];
  totalCharges?: string;
  diagnosisCodes?: string[];
  attendingLastName?: string;
  attendingNpi?: string;
}): Ub04ExpectedFields {
  return {
    box3a_claimId: params.claimId,
    box3b_chartId: params.chartId,
    box4_billType: params.billType,
    box6_fromDate: params.fromDate,
    box6_throughDate: params.throughDate,
    box8_patientName: params.patientName,
    box12_admissionDate: toUb04Date(params.admitDate),
    box14_admissionType: '3',
    box15_sourceOfAdmission: '9',
    box17_status: '30',
    box31_occurrenceCode: '27',
    box31_occurrenceDate: toUb04Date(params.bpsd),
    revenueLineItems: params.revenueLineItems,
    box47_totalCharges: params.totalCharges,
    box50_payerName: params.payerName,
    diagnosisCodes: params.diagnosisCodes,
    box76_attendingLastName: params.attendingLastName,
    box76_attendingNpi: params.attendingNpi,
  };
}
