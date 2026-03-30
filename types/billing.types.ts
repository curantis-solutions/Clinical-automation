/**
 * Billing Type Definitions
 * Used for billing claim verification (Claims, Notices, R&B)
 */

/** Bill types for hospice claims */
export type BillType = '811' | '812' | '813' | '814' | '81A';

/** Claim document type — Claims use PDF, Notices use UB04 */
export type ClaimDocumentType = 'PDF' | 'UB04';

/** Download format options for 837 Batch Options modal */
export type BatchDownloadFormat = '837' | 'CSV';

/** Download format options for AR Download Claim modal */
export type ARDownloadFormat = 'UB-04' | '837' | 'CSV';

/**
 * Expected data for a Notice (81A) claim in the Ready > Notices tab.
 *
 * All values are captured from the test flow — never hardcoded:
 * - patientName: captured when patient is created/navigated (from patient grid)
 * - payerName: captured when benefit is added (returned by fillBenefitDetails)
 * - patientChartId: from patient creation or fixture
 * - serviceStart: = admit date from fixture
 * - daysSinceAdmit: computed via DateHelper.calculateDaysSinceAdmit()
 * - Other fields: constant for all NOE claims
 */
export interface NoticeExpectedData {
  /** Patient full name as displayed in billing grid — captured from patient grid after creation */
  patientName: string;
  /** Payer name as displayed in billing grid — captured from fillBenefitDetails return value */
  payerName: string;
  /** Patient chart ID — from patient creation or fixture */
  patientChartId: string;
  /** Service start date = admit date (MM/DD/YYYY) — from fixture */
  serviceStart: string;
  /** Service end date — blank ("-") for NOE */
  serviceEnd: string;
  /** Days since admit — computed via DateHelper.calculateDaysSinceAdmit() */
  daysSinceAdmit: number;
  /** Bill type — always '81A' for Notices */
  billType: '81A';
  /** SIA amount — "$0.00" for NOE */
  siaAmount: string;
  /** Claim total amount — "$0.00" for NOE */
  claimTotalAmount: string;
  /** Condition code — blank ("-") for NOE */
  conditionCode: string;
}

/**
 * Actual Notice row data read from the billing grid.
 * Returned by ClaimsPage.readNoticeRowData() — captures all displayed values.
 */
export interface NoticeRowData {
  patientName: string;
  patientChartId: string;
  payerName: string;
  serviceStart: string;
  serviceEnd: string;
  daysSinceAdmit: string;
  billType: string;
  siaAmount: string;
  claimTotalAmount: string;
  conditionCode: string;
}

/** Row data from the 837 Batch Management grid */
export interface BatchRowData {
  payerType: string;
  payerName: string;
  batchName: string;
  batchBalance: string;
  siaBalance: string;
  totalClaims: string;
  postDate: string;
  generatedBy: string;
  status: string;
}

/** Row data from the 837 Batch expanded detail (individual claims within a batch) */
export interface BatchDetailRowData {
  patientId: string;
  patientName: string;
  payerName: string;
  claimId: string;
  claimBalance: string;
  siaTotal: string;
  claimTotal: string;
}

/** Row data from the Accounts Receivable grid */
export interface ARRowData {
  patientChartId: string;
  patientName: string;
  payerName: string;
  claimId: string;
  serviceStart: string;
  serviceEnd: string;
  status: string;
  billedAmount: string;
  payments: string;
  recoupments: string;
  adjustments: string;
  claimBalance: string;
  postDate: string;
}
