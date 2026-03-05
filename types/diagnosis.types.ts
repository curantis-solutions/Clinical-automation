export interface DiagnosisCode {
  searchText: string;            // Text to type (ICD code or name, e.g. "C801")
  expectedDisplayText?: string;  // Optional: verify selected text contains this
  optionIndex?: number;          // Dropdown result index (0-based, default 0)
}

export type RelatedDiagnosisType = 'related' | 'unrelated';

export interface RelatedDiagnosis {
  type: RelatedDiagnosisType;    // Related or Unrelated radio selection
  diagnosis: DiagnosisCode;      // ICD-10 search-select
}

/** Principle Diagnosis Option (radio buttons, may appear after save based on diagnosis) */
export type PrincipleDiagnosisOption =
  | 'cancer' | 'dementia' | 'neurologicalCondition' | 'stroke'
  | 'copd' | 'hopeCardiovascular' | 'heartFailure'
  | 'liverDisease' | 'renalDisease' | 'noneOfTheAbove';

export interface DiagnosisFormData {
  primaryDiagnosis: DiagnosisCode;
  secondaryDiagnosis?: DiagnosisCode;
  relatedDiagnoses?: RelatedDiagnosis[];
  principleDiagnosisOption?: PrincipleDiagnosisOption;
}
