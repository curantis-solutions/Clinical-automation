/**
 * HOPE Test Scenario Configuration Types
 *
 * Data-driven configs that define what varies across HOPE test scenarios:
 * visit type, symptom severity, modules to fill, and expected outcomes.
 */

import { HOPEVisitDialogOptions } from '../pages/visit-add-dialog.page';
import { PreferencesData } from '../pages/visit-modules/preferences.page';
import { PainData } from '../pages/visit-modules/pain.page';
import { NeurologicalData } from '../pages/visit-modules/neurological.page';
import { RespiratoryData } from '../pages/visit-modules/respiratory.page';
import { GastrointestinalData } from '../pages/visit-modules/gastrointestinal.page';
import { SkinData } from '../pages/visit-modules/skin.page';
import { SummaryData } from '../pages/visit-modules/summary.page';
import { HospiceAideData } from '@pages/visit-modules/hospice-aide.page';

/** Logical HOPE visit type (auto-detected by system based on timing/severity) */
export type HOPEVisitType = 'INV' | 'HUV' | 'SFV';

/**
 * Module fill configuration for a single visit.
 * Only specified modules get filled; others are skipped or quick-filled.
 */
export interface VisitModuleFills {
  preferences?: PreferencesData;
  pain?: PainData;
  neurological?: NeurologicalData;
  respiratory?: RespiratoryData;
  gastrointestinal?: GastrointestinalData;
  skin?: SkinData;
  HospiceAide?: HospiceAideData;
  summary?: SummaryData;
  /** Modules to auto-fill with first-option defaults via quickFillModule() */
  //quickFillModules?: string[];
}

/**
 * Configuration for a single HOPE visit scenario.
 */
export interface HOPEVisitScenarioConfig {
  /** Scenario ID for logging (e.g., 'S1', 'S2') */
  scenarioId: string;
  /** Human-readable description */
  description: string;
  /** Logical visit type */
  visitType: HOPEVisitType;
  /** Role string for VisitAddDialogPage.selectRole() */
  role: string;
  /** Actual dropdown label for VisitAddDialogPage.selectType() */
  uiVisitType: string;
  /** HOPE dialog questions (SFV, HUV1, HUV2) — answered after role/type selection */
  hopeDialogOptions?: HOPEVisitDialogOptions;
  /** What data to enter in each module */
  moduleFills: VisitModuleFills;
  /** Whether Plan of Care issues should be accepted after fill */
  acceptPlanOfCareIssues: boolean;
  /** Whether to preview HOPE report after fill */
  previewHopeReport: boolean;
  /** Whether completing this visit should trigger an SFV requirement */
  expectsSFV: boolean;
  /** Nested SFV config — present when expectsSFV is true */
  sfvConfig?: HOPEVisitScenarioConfig;
}

/**
 * HOPE admission record verification config.
 */
export interface HOPEAdmissionVerifyConfig {
  /** Which tabs to verify (e.g., ['A', 'F', 'I', 'J', 'M', 'N', 'Z']) */
  tabs: string[];
  /** Whether to complete the record after verification */
  completeRecord: boolean;
  /** Whether to fill Payor Info in Tab A */
  fillPayerInfo: boolean;
  /** Tabs expected to have checkmarks */
  expectedTabsComplete?: string[];
  /** Tabs expected WITHOUT checkmarks (e.g., 'J' when SFV pending) */
  expectedTabsIncomplete?: string[];
}

/**
 * Complete patient chain scenario config.
 * Defines the full dependency chain for one test patient.
 */
export interface HOPEPatientChainConfig {
  /** Key for test-data persistence (e.g., 'hopePatientA') */
  patientKey: string;
  /** Description for test output */
  description: string;
  /** Ordered list of visit scenarios to execute */
  visits: HOPEVisitScenarioConfig[];
  /** Admission record verification config */
  admissionVerification: HOPEAdmissionVerifyConfig;
  /** Whether to include discharge at end of chain */
  includeDischarge: boolean;
}
