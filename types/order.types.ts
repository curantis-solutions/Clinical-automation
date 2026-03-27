/**
 * Order Types - Interfaces for all order-related data
 */

export type OrderType =
  | 'Level of Care'
  | 'Visit Frequency'
  | 'Medication'
  | 'DME'
  | 'Other'
  | 'Supplies'
  | 'Treatment';

export type NonMedicationOrderType = 'DME' | 'Other' | 'Supplies' | 'Treatment';

export type LOCType = 'Routine Home Care' | 'Respite Care' | 'General In-Patient' | 'Continuous Care';

export type OrderRole = 'MD' | 'Registered Nurse (RN)' | 'NP' | 'Case Manager';

export type OrderApprovalType = 'Verbal' | 'Written' | 'No Signature Required';

export type VFDiscipline =
  | 'Bereavement'
  | 'Hospice Aide'
  | 'Skilled Nurse'
  | 'Social Worker'
  | 'Spiritual Advisor'
  | 'Volunteer'
  | 'Other';

export type OtherDiscipline =
  | 'Dietician'
  | 'Occupational Therapy'
  | 'Physical Therapy'
  | 'Respiratory Therapy'
  | 'Speech Therapy';

export type SignedStatus = 'Yes' | 'No' | 'e-signed' | 'Rejected';

/** Visit Frequency Order Data */
export interface VisitFrequencyOrderData {
  discipline: VFDiscipline;
  otherDiscipline?: OtherDiscipline | string;
  numberOfVisits: number;
  timeInterval: string;
  duration: string;
  isPRN?: boolean;
  prnReason?: string;
  prnQuantity?: number;
  isServiceDeclined?: boolean;
  dateDeclined?: string;
  declinedReason?: string;
  startDate: string;
  orderingProvider: string;
  role: OrderRole;
  approvalType: OrderApprovalType;
}

/** Non-Medication Order Data (DME, Other, Supplies, Treatment) */
export interface NonMedicationOrderData {
  orderType: NonMedicationOrderType;
  name: string;
  description?: string;
  bodySystem?: string; // Required for DME only
  startDate: string;
  orderingProvider: string;
  role: OrderRole;
  approvalType: OrderApprovalType;
  hospicePays?: boolean;
  reasonForNonCoverage?: string;
}

/** Medication Order Data */
export interface MedicationOrderData {
  medicationName: string;
  strength?: string;
  customStrength?: string;
  dosage?: string;
  route?: string;
  frequency?: string;
  isPRN?: boolean;
  prnReasons?: string;
  isMAR?: boolean;
  marTime?: string;
  marDaysOfWeek?: string[];
  marAdministration?: string;
  marNotes?: string;
  startDate?: string;
  discontinueDate?: string;
  orderingProvider: string;
  role: OrderRole;
  approvalType: OrderApprovalType;
  hospicePays?: boolean;
  reasonForNonCoverage?: string;
}

/** Compound/Free Text Medication Order Data */
export interface CompoundMedicationOrderData {
  medicationName: string;
  ingredients: string[];
  dosage?: string;
  route?: string;
  frequency?: string;
  startDate?: string;
  orderingProvider: string;
  role: OrderRole;
  approvalType: OrderApprovalType;
}

/** Level of Care Order Data */
export interface LOCOrderData {
  locType: LOCType;
  startDate: string;
  orderingProvider: string;
  role: OrderRole;
  facility?: string;
  respiteReason?: string;
  gipReasonPain?: boolean;
  symptoms?: string[];
  careLocationType?: string;
}

/** Intake Order Data */
export interface IntakeOrderData {
  orderType: OrderType;
  name: string;
  description?: string;
  startDate?: string;
}

/** Discontinue Order Data */
export interface DiscontinueOrderData {
  discontinueDate: string;
  discontinueProviderName?: string;
  discontinueReason: string;
  approvalType: OrderApprovalType;
  isServiceDeclined?: boolean;
  dateDeclined?: string;
  declinedReason?: string;
}

/** Hospice Coverage Edit Data */
export interface HospiceCoverageData {
  hospicePays: boolean;
  reasonForNonCoverage?: string;
}

/** MAR Details Data */
export interface MARDetailsData {
  enabled: boolean;
  time?: string;
  daysOfWeek?: string[];
  administration?: string;
  additionalNotes?: string;
}

/** Document Upload Data */
export interface DocumentUploadData {
  filePaths: string[];
}

/** Order Grid Row for verification */
export interface OrderGridRow {
  orderNumber?: string;
  orderType?: string;
  nameDescription?: string;
  orderedBy?: string;
  startDate?: string;
  discontinueDate?: string;
  signedStatus?: string;
}

/** Provider Panel Order for verification */
export interface ProviderPanelOrder {
  patientId?: string;
  patientName?: string;
  orderNumber?: string;
  orderType?: string;
  description?: string;
}
