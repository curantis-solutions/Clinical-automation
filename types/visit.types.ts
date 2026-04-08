/**
 * Visit Type Configuration — Curantis Clinical
 *
 * Config-driven approach for all visit types.
 * Replaces hardcoded role/type strings throughout the codebase.
 * Each entry confirmed via Playwright MCP exploration on 2026-04-08.
 */

// ── Roles ──

export type VisitRole = 'Medical Director' | 'Registered Nurse';

// ── Complete Flow ──

/** How the Complete button behaves */
export type CompleteFlowType =
  | 'task'        // 1-step: Task modal (dates + times + mileage)
  | 'signature'   // 2-step: Signature modal → Task modal (INA only)
  | 'discharge';  // Discharge modal: acknowledges patient expired (Postmortem only)

// ── Recording Flow ──

/**
 * Identifies which recording flow implementation to use.
 * Types that share identical assessment pages use the same flow key.
 */
export type RecordingFlowKey =
  | 'F2F'               // Face to Face: 2 sections (Vitals + Face To Face)
  | 'INA'               // Initial Nursing Assessment: 17 sections + HIS preview
  | 'STANDARD_RN_17'    // 17 sections (same as INA but 1-step complete, no HIS)
  | 'STANDARD_RN_18'    // 18 sections (17 + Supervisory Visit)
  | 'SUPERVISORY'       // 2 sections (Supervisory Visit + Hospice Aide)
  | 'HOSPICE_AIDE'      // 2 sections (Hospice Aide Care Plan + Summary)
  | 'POSTMORTEM'        // 3 sections (Death Assessment + Vitals + Summary)
  | 'EXTERNAL_F2F'      // 1 section (External Face To Face Visit)
  | 'LCD';              // 13 sections (disease-specific)

// ── Section Metadata ──

export interface VisitSection {
  /** Display name exactly as shown in left nav */
  name: string;
  /** URL segment (e.g., "vitals", "faceToFaceMD", "summary") */
  urlSegment: string;
  /** Nav button icon name for accessible name matching (e.g., "vitals", "summary") */
  navIconName?: string;
}

// ── Narrative Config ──

export interface NarrativeConfig {
  /** Button ID to open narrative modal */
  addButtonId: string;
  /** Modal style: origin-category (INA/standard RN) vs subject-description (F2F) */
  style: 'origin-category' | 'subject-description';
  /** Default origin for test data */
  defaultOrigin?: string;
  /** Default category for test data */
  defaultCategory?: string;
}

// ── Visit Type Config ──

export interface VisitTypeConfig {
  /** Stable programmatic key */
  key: string;
  /** Role to select in Create Visit modal */
  role: VisitRole;
  /** Exact label in Create Visit modal Type dropdown */
  typeLabel: string;
  /** Exact label shown in Care Plan visit grid */
  gridLabel: string;
  /** URL segment the assessment page navigates to after creation */
  initialUrlSegment: string;
  /** Left nav sections (ordered) */
  sections: VisitSection[];
  /** Complete flow type */
  completeFlow: CompleteFlowType;
  /** Recording flow key for workflow dispatch */
  recordingFlow: RecordingFlowKey;
  /** Whether HIS Report preview is required before Complete */
  requiresHISPreview: boolean;
  /** Whether F2F attestation section exists */
  hasAttestation: boolean;
  /** Whether Vitals section has Blood Pressure */
  hasVitals: boolean;
  /** Narrative config (if the visit type has a narrative section) */
  narrative?: NarrativeConfig;
  /** Validation message pattern when Complete fails */
  validationRequired?: string;
  /** Human-readable description */
  description: string;
}

// ── Shared Section Lists ──

const STANDARD_17_SECTIONS: VisitSection[] = [
  { name: 'Symptom Summary', urlSegment: 'symptomSummary' },
  { name: 'Vitals', urlSegment: 'vitals', navIconName: 'vitals' },
  { name: 'Preferences', urlSegment: 'preferences' },
  { name: 'Neurological', urlSegment: 'neurological' },
  { name: 'Pain', urlSegment: 'pain' },
  { name: 'Respiratory', urlSegment: 'respiratory' },
  { name: 'Cardiovascular', urlSegment: 'cardiovascular' },
  { name: 'Gastrointestinal', urlSegment: 'gastrointestinal' },
  { name: 'Genitourinary', urlSegment: 'genitourinary' },
  { name: 'Nutritional & Metabolic', urlSegment: 'nutritionalMetabolic' },
  { name: 'Skin', urlSegment: 'skin' },
  { name: 'Musculoskeletal', urlSegment: 'musculoskeletal' },
  { name: 'ADLs/Functional Needs', urlSegment: 'adlsFunctionalNeeds' },
  { name: 'Precautions, Safety & Teachings', urlSegment: 'precautionsSafetyTeachings' },
  { name: 'Hospice Aide', urlSegment: 'hospiceAide' },
  { name: 'Military History', urlSegment: 'militaryHistory' },
  { name: 'Summary', urlSegment: 'summary', navIconName: 'summary' },
];

const STANDARD_18_SECTIONS: VisitSection[] = [
  ...STANDARD_17_SECTIONS.slice(0, 14), // Through Precautions, Safety & Teachings
  { name: 'Supervisory Visit', urlSegment: 'supervisoryVisit' },
  ...STANDARD_17_SECTIONS.slice(14),    // Hospice Aide, Military History, Summary
];

const INA_NARRATIVE: NarrativeConfig = {
  addButtonId: 'narrativesCardAdd',
  style: 'origin-category',
  defaultOrigin: 'Pain',
  defaultCategory: 'Pain Assessment',
};

const F2F_NARRATIVE: NarrativeConfig = {
  addButtonId: 'clinicalNarrativesCardAdd',
  style: 'subject-description',
};

// ── The Config ──

export const VISIT_TYPES = {
  F2F: {
    key: 'F2F',
    role: 'Medical Director' as const,
    typeLabel: 'Face to Face Visit',
    gridLabel: 'Face to Face Visit',
    initialUrlSegment: 'vitals',
    sections: [
      { name: 'Vitals', urlSegment: 'vitals' },
      { name: 'Face To Face', urlSegment: 'faceToFaceMD' },
    ],
    completeFlow: 'task' as const,
    recordingFlow: 'F2F' as const,
    requiresHISPreview: false,
    hasAttestation: true,
    hasVitals: true,
    narrative: F2F_NARRATIVE,
    description: 'Medical Director face-to-face encounter (required from BP3+)',
  },

  INA: {
    key: 'INA',
    role: 'Registered Nurse' as const,
    typeLabel: 'Initial Nursing Assessment',
    gridLabel: 'Initial Nursing Assessment',
    initialUrlSegment: 'symptomSummary',
    sections: STANDARD_17_SECTIONS,
    completeFlow: 'signature' as const,
    recordingFlow: 'INA' as const,
    requiresHISPreview: true,
    hasAttestation: false,
    hasVitals: true,
    narrative: INA_NARRATIVE,
    description: 'Initial nursing assessment (17 sections, HIS preview + signature required)',
  },

  INITIAL_COMPREHENSIVE: {
    key: 'INITIAL_COMPREHENSIVE',
    role: 'Registered Nurse' as const,
    typeLabel: 'Initial/Comprehensive Assessment',
    gridLabel: 'Initial/Comprehensive Assessment',
    initialUrlSegment: 'symptomSummary',
    sections: STANDARD_17_SECTIONS,
    completeFlow: 'task' as const,
    recordingFlow: 'STANDARD_RN_17' as const,
    requiresHISPreview: false,
    hasAttestation: false,
    hasVitals: true,
    narrative: INA_NARRATIVE,
    description: '17-section assessment (same as INA layout, 1-step complete)',
  },

  COMPREHENSIVE: {
    key: 'COMPREHENSIVE',
    role: 'Registered Nurse' as const,
    typeLabel: 'Comprehensive Assessment',
    gridLabel: 'Comprehensive Assessment',
    initialUrlSegment: 'symptomSummary',
    sections: STANDARD_18_SECTIONS,
    completeFlow: 'task' as const,
    recordingFlow: 'STANDARD_RN_18' as const,
    requiresHISPreview: false,
    hasAttestation: false,
    hasVitals: true,
    narrative: INA_NARRATIVE,
    description: '18-section assessment (17 + Supervisory Visit)',
  },

  ROUTINE: {
    key: 'ROUTINE',
    role: 'Registered Nurse' as const,
    typeLabel: 'Routine',
    gridLabel: 'Routine',
    initialUrlSegment: 'symptomSummary',
    sections: STANDARD_18_SECTIONS,
    completeFlow: 'task' as const,
    recordingFlow: 'STANDARD_RN_18' as const,
    requiresHISPreview: false,
    hasAttestation: false,
    hasVitals: true,
    narrative: INA_NARRATIVE,
    validationRequired: 'Summary is required. Vitals is required. At least 1 section(s) other than summary vitals is required to complete.',
    description: 'Standard routine RN visit (18 sections)',
  },

  EMERGENT: {
    key: 'EMERGENT',
    role: 'Registered Nurse' as const,
    typeLabel: 'Emergent',
    gridLabel: 'Emergent',
    initialUrlSegment: 'symptomSummary',
    sections: STANDARD_18_SECTIONS,
    completeFlow: 'task' as const,
    recordingFlow: 'STANDARD_RN_18' as const,
    requiresHISPreview: false,
    hasAttestation: false,
    hasVitals: true,
    narrative: INA_NARRATIVE,
    description: 'Emergent RN visit (same 18 sections as Routine)',
  },

  WATCH_CARE: {
    key: 'WATCH_CARE',
    role: 'Registered Nurse' as const,
    typeLabel: 'Watch Care Visit',
    gridLabel: 'Watch Care Visit',
    initialUrlSegment: 'symptomSummary',
    sections: STANDARD_18_SECTIONS,
    completeFlow: 'task' as const,
    recordingFlow: 'STANDARD_RN_18' as const,
    requiresHISPreview: false,
    hasAttestation: false,
    hasVitals: true,
    narrative: INA_NARRATIVE,
    description: 'Watch care visit (same 18 sections as Routine)',
  },

  PHONE_CALL: {
    key: 'PHONE_CALL',
    role: 'Registered Nurse' as const,
    typeLabel: 'Phone Call',
    gridLabel: 'Phone Call',
    initialUrlSegment: 'symptomSummary',
    sections: STANDARD_18_SECTIONS,
    completeFlow: 'task' as const,
    recordingFlow: 'STANDARD_RN_18' as const,
    requiresHISPreview: false,
    hasAttestation: false,
    hasVitals: true,
    narrative: INA_NARRATIVE,
    validationRequired: 'Summary is required.',
    description: 'Phone call visit (same 18 sections as Routine, only Summary required)',
  },

  SUPERVISORY: {
    key: 'SUPERVISORY',
    role: 'Registered Nurse' as const,
    typeLabel: 'Supervisory Visit',
    gridLabel: 'Supervisory Visit',
    initialUrlSegment: 'supervisoryVisit',
    sections: [
      { name: 'Supervisory Visit', urlSegment: 'supervisoryVisit' },
      { name: 'Hospice Aide', urlSegment: 'hospiceAide' },
    ],
    completeFlow: 'task' as const,
    recordingFlow: 'SUPERVISORY' as const,
    requiresHISPreview: false,
    hasAttestation: false,
    hasVitals: false,
    validationRequired: 'Supervisory Visit is required.',
    description: 'Supervisory visit (2 sections only)',
  },

  HOSPICE_AIDE_ROUTINE: {
    key: 'HOSPICE_AIDE_ROUTINE',
    role: 'Registered Nurse' as const,
    typeLabel: 'Hospice Aide Routine',
    gridLabel: 'Hospice Aide Routine',
    initialUrlSegment: 'hospiceAideHACarePlanRN',
    sections: [
      { name: 'Hospice Aide Care Plan', urlSegment: 'hospiceAideHACarePlanRN' },
      { name: 'Summary', urlSegment: 'summary' },
    ],
    completeFlow: 'task' as const,
    recordingFlow: 'HOSPICE_AIDE' as const,
    requiresHISPreview: false,
    hasAttestation: false,
    hasVitals: false,
    narrative: INA_NARRATIVE,
    description: 'Hospice aide routine visit (2 sections)',
  },

  POSTMORTEM: {
    key: 'POSTMORTEM',
    role: 'Registered Nurse' as const,
    typeLabel: 'Postmortem Encounter',
    gridLabel: 'Postmortem Encounter',
    initialUrlSegment: 'deathAssessment',
    sections: [
      { name: 'Death Assessment', urlSegment: 'deathAssessment' },
      { name: 'Vitals', urlSegment: 'vitals' },
      { name: 'Summary', urlSegment: 'summary' },
    ],
    completeFlow: 'discharge' as const,
    recordingFlow: 'POSTMORTEM' as const,
    requiresHISPreview: false,
    hasAttestation: false,
    hasVitals: true,
    narrative: INA_NARRATIVE,
    validationRequired: 'Death Assessment is required. Summary is required.',
    description: 'Postmortem encounter — discharges patient as Expired',
  },

  EXTERNAL_F2F: {
    key: 'EXTERNAL_F2F',
    role: 'Registered Nurse' as const,
    typeLabel: 'External Face to Face Visit',
    gridLabel: 'External Face to Face Visit',
    initialUrlSegment: 'faceToFaceExternal',
    sections: [
      { name: 'External Face To Face Visit', urlSegment: 'faceToFaceExternal' },
    ],
    completeFlow: 'task' as const,
    recordingFlow: 'EXTERNAL_F2F' as const,
    requiresHISPreview: false,
    hasAttestation: false,
    hasVitals: false,
    description: 'External F2F visit — Conducted By field + upload doc note',
  },

  LCD: {
    key: 'LCD',
    role: 'Registered Nurse' as const,
    typeLabel: 'LCD',
    gridLabel: 'LCD',
    initialUrlSegment: 'lcdGeneralDecline1',
    sections: [
      { name: 'General Decline 1', urlSegment: 'lcdGeneralDecline1' },
      { name: 'General Decline 2', urlSegment: 'lcdGeneralDecline2' },
      { name: 'Cancer', urlSegment: 'lcdCancer' },
      { name: 'Non-Cancer', urlSegment: 'lcdNonCancer' },
      { name: 'ALS', urlSegment: 'lcdAls' },
      { name: 'Dementia', urlSegment: 'lcdDementia' },
      { name: 'Heart Disease', urlSegment: 'lcdHeartDisease' },
      { name: 'HIV Disease', urlSegment: 'lcdHivDisease' },
      { name: 'Liver Disease', urlSegment: 'lcdLiverDisease' },
      { name: 'Pulmonary Disease', urlSegment: 'lcdPulmonaryDisease' },
      { name: 'Renal Disease', urlSegment: 'lcdRenalDisease' },
      { name: 'Stroke and Coma', urlSegment: 'lcdStrokeAndComa' },
      { name: 'Additional', urlSegment: 'lcdAdditional' },
    ],
    completeFlow: 'task' as const,
    recordingFlow: 'LCD' as const,
    requiresHISPreview: false,
    hasAttestation: false,
    hasVitals: false,
    description: 'Local Coverage Determination (13 disease-specific sections)',
  },
} as const satisfies Record<string, VisitTypeConfig>;

// ── Type Helpers ──

export type VisitTypeKey = keyof typeof VISIT_TYPES;

/** Get config by key */
export function getVisitType(key: VisitTypeKey): VisitTypeConfig {
  return VISIT_TYPES[key];
}

/** Find config by the exact Type dropdown label */
export function findVisitTypeByLabel(typeLabel: string): VisitTypeConfig | undefined {
  return Object.values(VISIT_TYPES).find(vt => vt.typeLabel === typeLabel);
}

/** Get all visit types for a given role */
export function getVisitTypesForRole(role: VisitRole): VisitTypeConfig[] {
  return Object.values(VISIT_TYPES).filter(vt => vt.role === role);
}

/** Get all visit type keys for a given recording flow */
export function getVisitTypesByFlow(flow: RecordingFlowKey): VisitTypeConfig[] {
  return Object.values(VISIT_TYPES).filter(vt => vt.recordingFlow === flow);
}
