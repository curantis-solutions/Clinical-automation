/**
 * Level of Care (LOC) Type Definitions
 * Discriminated union types for LOC order forms (Routine Home Care, Respite, GIP, Continuous)
 */

export type LOCType = 'Routine Home Care' | 'Respite Care' | 'General In-Patient' | 'Continuous Care';

export type CareLocationType =
  | 'Q5001-Home'
  | 'Q5002-Assisted Living'
  | 'Q5003-Long-Term Care'
  | 'Q5004-Skilled Nursing'
  | 'Q5005-Inpatient Hospital'
  | 'Q5006-Inpatient Hospice'
  | 'Q5007-Long-Term Care Hospital'
  | 'Q5008-Inpatient Psychiatric'
  | 'Q5009-Not Otherwise Specified'
  | 'Q5010-Hospice Residential';

export type OrderApprovalType = 'MD' | 'Verbal' | 'Written';

/** Base fields common to all LOC types */
interface LOCFormDataBase {
  careLocationType?: string;
  careLocation?: string;
  startDate?: string;
  orderingProvider?: string;
  providerNotes?: string;
  approvalType?: OrderApprovalType;
}

export interface RoutineHomeCareFormData extends LOCFormDataBase {
  locType: 'Routine Home Care';
}

export interface RespiteCareFormData extends LOCFormDataBase {
  locType: 'Respite Care';
  reasonForRespite?: string;
}

export interface GeneralInPatientFormData extends LOCFormDataBase {
  locType: 'General In-Patient';
  gipReasons?: string[];
}

export interface ContinuousCareFormData extends LOCFormDataBase {
  locType: 'Continuous Care';
  symptoms?: string[];
}

/** Discriminated union of all LOC form data types */
export type LOCOrderFormData =
  | RoutineHomeCareFormData
  | RespiteCareFormData
  | GeneralInPatientFormData
  | ContinuousCareFormData;

/** Void order fields */
export interface LOCVoidData {
  voidDate?: string; // Pre-populated with today — only set to override
  voidReason: string;
}
