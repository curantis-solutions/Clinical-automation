/**
 * HOPE Scenario Data Configurations
 *
 * Defines concrete test data for each patient chain.
 * Each config specifies: visit type, module fills, expected outcomes.
 *
 * Patient A: No SFV chain (all symptoms 0/1/9) → S1 → S3 → S5 → S7
 * Patient B: With SFV chain (some symptoms 2/3) → S2 → S4 → S6 → S7
 */

import { HOPEPatientChainConfig, HOPEVisitScenarioConfig } from '../types/hope-scenarios.types';

// ═══════════════════════════════════════════════════════════════════════
// Shared Quick-Fill Module Lists
// ═══════════════════════════════════════════════════════════════════════

/** Modules that need quick-fill for INV visits (not HOPE-specific) */
const INV_QUICK_FILL_MODULES = [
  'Cardiovascular',
  'Genitourinary',
  'Nutritional & Metabolic',
  'Musculoskeletal',
  'ADLs/Functional Needs',
  'Precautions, Safety & Teachings',
  'Hospice Aide',
  'Military History',
  'Summary',
];

/** Modules that need quick-fill for HUV/SFV visits */
const HUV_QUICK_FILL_MODULES = [
  'Cardiovascular',
  'Genitourinary',
  'Nutritional & Metabolic',
  'Musculoskeletal',
  'ADLs/Functional Needs',
  'Precautions, Safety & Teachings',
  'Hospice Aide',
  'Military History',
  'Summary',
];

// ═══════════════════════════════════════════════════════════════════════
// Patient A — No SFV (All symptoms 0, 1, or 9)
// Chain: S1 (INV) → S3 (HUV1) → S5 (HUV2) → S7 (Discharge)
// ═══════════════════════════════════════════════════════════════════════

/** S1: INV — All symptoms 0/1/9, no SFV triggered */
const S1_INV_NO_SFV: HOPEVisitScenarioConfig = {
  scenarioId: 'S1',
  description: 'Admit Patient and Complete INV (No SFV)',
  visitType: 'INV',
  role: 'Registered Nurse (RN)',
  uiVisitType: 'Initial Nursing Assessment',
  acceptPlanOfCareIssues: true,
  previewHopeReport: true,
  expectsSFV: false,
  moduleFills: {
    preferences: {
   assessmentWith: ['patientResponsibleParty'],
        hopeDiagnosis: 'cancer',
        otherConditions: 'Neuropathy',
        interpreterAssist: 'yes',
        levelOfAssistance: 'independent',
        cprAsked: 'yesDiscussionOccurred',
        understandCpr: 'yes',
        wantCpr: 'no',
        outOfHospitalDnr: 'yes',
        codeStatus: 'fullCode',
        polst: 'no',
        most: 'no',
        lifeSustainingTreatmentsAsked: 'yesAndDiscussed',
        wantLifeSustainingTreatments: 'no',
        furtherHospitalizations: 'yesAndDiscussed',
        wantfurtherHospitalizations: 'no',
        spiritualConcernsAsk: 'yesAndDiscussed',
        haveSpiritualConcerns: 'no',
        signsOfImminentDeath: 'no',
        notes: 'Patient prefers to avoid hospitalization and aggressive treatments.',
    },
    neurological: {
      oriented: ['person', 'place', 'time', 'situation'],
      conditions: {
        anxiety: {
           score: 3,
          symptomImpact: 'mildImpact', // code 1
        },
        agitation: {
           score: 2,
          symptomImpact: 'mildImpact', // code 1
        },
      },
    },
    pain: {
        assessmentWith: ['patientResponsibleParty'],
        painTool: 'Numeric',
        painScore: 2,
        neuropathicPain: 'yes',
        experiencingPain: 'yes',
        symptomImpact: 'mildImpact',
        impactAreas: ['sleep', 'emotionalDistress'],
        explanation: 'Mild pain with movement, managed with PRN medication',
        activePain: 'no',
        painAssessmentDone: 'yes',
        scheduledOpioid: 'yes',
        prnOpioid: 'yes',
        painNote: 'Patient reports mild pain in joints, especially with activity. No neuropathic characteristics. Pain is currently well-managed with PRN opioids as needed for movement-related discomfort.',
    },
    respiratory: {
       sobScreening: 'yes',
        sobNow: 'yes',
        treatmentInitiated: 'yes',
        treatmentTypes: ['opioids'],
        symptomImpact: 'mildImpact',
        impactAreas: ['dailyActivities', 'sleep'],
        notes: 'Patient experiences mild shortness of breath with exertion, such as walking or climbing stairs. SOB is currently managed with opioid medications as needed'
    },
    gastrointestinal: {
      bowelRegimen: 'yes',
        treatments: ['laxatives'],
        bmType: 'irregular',
        bmIrregular: 'constipation',
        abdomenState: ['soft'],
        vomiting: true,
        vomitingData: {
          severity: 3,
          dateUnknown: true,
          timeUnknown: true,
          symptomImpact: 'mildImpact',
          impactAreas: ['intakeOnly'],
          explanation: 'Mild vomiting managed with medication',
        },
        nausea: true,
        nauseaData: {
          score: 2,
          frequency: 'intermittent',
          symptomImpact: 'mildImpact',
          impactAreas: ['intakeOnly'],
          explanation: 'Intermittent nausea with meals',
        },
    },
    skin: {
      addWound: true,
        locationTitle: 'Left Ankle',
        width: '2',
        length: '3',
        depth: '1',
        painScore: 3,
        woundCareTreatment: 'Clean and dress wound daily',
        woundStatus: 'active',
        injuryTreatments: ['pressureUlcerInjuryCare', 'applicationOfNonSurgicalDressings'],
    },
    HospiceAide: {
        addTask: true,
        assistance: 'assist',
        frequencyOccurrence: '2',
        frequencyDuration: '1',
      },
    summary: {
        addNarrative: true,
        narrativeText: 'Patient assessed during routine visit. Vitals stable.',
    },
    //quickFillModules: INV_QUICK_FILL_MODULES,
  },
};

/** S3: HUV1 — All symptoms 0/1/9, no SFV triggered */
const S3_HUV1_NO_SFV: HOPEVisitScenarioConfig = {
  scenarioId: 'S3',
    description: 'Complete HUV1 (No SFV)',
  visitType: 'HUV',
  role: 'Registered Nurse (RN)',
  uiVisitType: 'Routine',
  hopeDialogOptions: { isSFV: false, isHUV1: true },
  acceptPlanOfCareIssues: false,
  previewHopeReport: true,
  expectsSFV: false,
  moduleFills: {
    preferences: {
      signsOfImminentDeath: 'no',
    },
    neurological: {
      conditions: {
        anxiety: {
          symptomImpact: 'patientNotExperiencingTheSymptom',
        },
        agitation: {
          symptomImpact: 'patientNotExperiencingTheSymptom',
        },
      },
    },
    pain: {
      symptomImpact: 'patientNotExperiencingTheSymptom',
      scheduledOpioid: 'no',
      prnOpioid: 'no',
    },
    respiratory: {
	    sobScreening: 'yes', 
      symptomImpact: 'patientNotExperiencingTheSymptom',
    },
    gastrointestinal: {
      bowelRegimen: 'no',
      bmType: 'regular',
      abdomenState: ['soft'],
	  vomiting: true,
      vomitingData: {
          symptomImpact: 'patientNotExperiencingTheSymptom',
          },
        nausea: true,
        nauseaData: {
          symptomImpact: 'patientNotExperiencingTheSymptom',
        },
    },
    skin: {
      injuryTreatments: ['noneOfTheAbove'],
    },
   
	 summary: {
        addNarrative: true,
        narrativeText: 'Patient assessed during routine visit. Vitals stable.',
    },
	 //quickFillModules: HUV_QUICK_FILL_MODULES,
  },
};

/** S5: HUV2 — All symptoms 0/1/9, no SFV triggered */
const S5_HUV2_NO_SFV: HOPEVisitScenarioConfig = {
  scenarioId: 'S5',
  description: 'Complete HUV2 (No SFV)',
  visitType: 'HUV',
  role: 'Registered Nurse (RN)',
  uiVisitType: 'Emergent',
  hopeDialogOptions: { isSFV: false, isHUV2: true },
  acceptPlanOfCareIssues: false,
  previewHopeReport: true,
  expectsSFV: false,
  moduleFills: {
    preferences: {
      signsOfImminentDeath: 'no',
    },
    neurological: {
      conditions: {
        anxiety: {
          symptomImpact: 'patientNotExperiencingTheSymptom',
        },
        agitation: {
          symptomImpact: 'patientNotExperiencingTheSymptom',
        },
      },
    },
    pain: {
      symptomImpact: 'patientNotExperiencingTheSymptom',
      scheduledOpioid: 'no',
      prnOpioid: 'no',
    },
    respiratory: {
      sobScreening: 'yes',
      symptomImpact: 'patientNotExperiencingTheSymptom',
    },
    gastrointestinal: {
      bowelRegimen: 'no',
      bmType: 'regular',
      abdomenState: ['soft'],
      vomiting: true,
      vomitingData: {
        symptomImpact: 'patientNotExperiencingTheSymptom',
      },
      nausea: true,
      nauseaData: {
        symptomImpact: 'patientNotExperiencingTheSymptom',
      },
    },
    skin: {
      injuryTreatments: ['noneOfTheAbove'],
    },
    summary: {
      addNarrative: true,
      narrativeText: 'HUV2 visit completed. Patient stable.',
    },
  },
};

/** S7: Discharge (no visit fill needed — discharge triggers auto HOPE record) */
const S7_DISCHARGE: HOPEVisitScenarioConfig = {
  scenarioId: 'S7',
  description: 'HOPE Discharge',
  visitType: 'INV', // placeholder — discharge is not a standard visit
  role: 'Registered Nurse (RN)',
  uiVisitType: 'Routine', // placeholder
  acceptPlanOfCareIssues: false,
  previewHopeReport: false,
  expectsSFV: false,
  moduleFills: {},
};

/** Complete Patient A chain config */
export const PATIENT_A_NO_SFV: HOPEPatientChainConfig = {
  patientKey: 'hopePatientA',
  description: 'Patient A — No SFV lifecycle (S1 → S3 → S5 → S7)',
  visits: [S1_INV_NO_SFV, S3_HUV1_NO_SFV, S5_HUV2_NO_SFV, S7_DISCHARGE],
  admissionVerification: {
    tabs: ['A', 'F', 'I', 'J', 'M', 'N', 'Z'],
    completeRecord: true,
    fillPayerInfo: true,
    expectedTabsComplete: ['A', 'F', 'I', 'J', 'M', 'N'],
  },
  includeDischarge: true,
};

// ═══════════════════════════════════════════════════════════════════════
// Patient B — With SFV (Some symptoms moderate/severe → triggers SFV)
// Chain: S2 (INV+SFV) → S4 (HUV1+SFV) → S6 (HUV2+SFV) → S7 (Discharge)
// ═══════════════════════════════════════════════════════════════════════

/** SFV follow-up config — resolves moderate symptoms with mild values */
const SFV_AFTER_INV: HOPEVisitScenarioConfig = {
  scenarioId: 'S2-SFV',
  description: 'SFV after INV — resolve moderate symptoms',
  visitType: 'SFV',
  role: 'Registered Nurse (RN)',
  uiVisitType: 'Routine',
  hopeDialogOptions: { isSFV: true },
  acceptPlanOfCareIssues: true,
  previewHopeReport: false,
  expectsSFV: false,
  moduleFills: {
    preferences: {
      signsOfImminentDeath: 'no',
    },
    neurological: {
      conditions: {
        anxiety: {
          symptomImpact: 'notImpacted', // code 0 — resolved
        },
        agitation: {
          symptomImpact: 'notImpacted',
        },
      },
    },
    pain: {
      symptomImpact: 'notImpacted',
      scheduledOpioid: 'no',
      prnOpioid: 'no',
    },
    respiratory: {
      symptomImpact: 'notImpacted',
    },
    gastrointestinal: {
      bowelRegimen: 'no',
      bmType: 'regular',
      abdomenState: ['soft'],
    },
    summary: {
      addNarrative: true,
      narrativeText: 'SFV completed. Symptoms reassessed and resolved.',
    },
    //quickFillModules: HUV_QUICK_FILL_MODULES,
  },
};

/** S2: INV with moderate symptoms — triggers SFV */
const S2_INV_WITH_SFV: HOPEVisitScenarioConfig = {
  scenarioId: 'S2',
  description: 'Admit Patient and Complete INV (With SFV)',
  visitType: 'INV',
  role: 'Registered Nurse (RN)',
  uiVisitType: 'Initial Nursing Assessment',
  acceptPlanOfCareIssues: true,
  previewHopeReport: true,
  expectsSFV: true,
  sfvConfig: SFV_AFTER_INV,
  moduleFills: {
    preferences: {
      assessmentWith: ['patientResponsibleParty'],
      hopeDiagnosis: 'cancer',
      interpreterAssist: 'no',
      cprAsked: 'yesDiscussionOccurred',
      understandCpr: 'yes',
      wantCpr: 'no',
      outOfHospitalDnr: 'yes',
      codeStatus: 'dnr',
      polst: 'no',
      most: 'no',
      lifeSustainingTreatmentsAsked: 'yesAndDiscussed',
      wantLifeSustainingTreatments: 'no',
      furtherHospitalizations: 'yes',
      wantfurtherHospitalizations: 'no',
      spiritualConcernsAsk: 'yesAndDiscussed',
      haveSpiritualConcerns: 'no',
      signsOfImminentDeath: 'no',
    },
    neurological: {
      oriented: ['person', 'place', 'time', 'situation'],
      conditions: {
        anxiety: {
          symptomImpact: 'moderateImpact', // code 2 — triggers SFV
        },
        agitation: {
          symptomImpact: 'mildImpact', // code 1
        },
      },
    },
    pain: {
      painTool: 'numeric',
      painScore: 3,
      neuropathicPain: 'no',
      experiencingPain: 'yes',
      symptomImpact: 'moderateImpact', // code 2 — triggers SFV
      activePain: 'yes',
      painAssessmentDone: 'yes',
      scheduledOpioid: 'yes',
      prnOpioid: 'yes',
    },
    respiratory: {
      sobScreening: 'yes',
      sobNow: 'yes',
      treatmentInitiated: 'yes',
      treatmentTypes: ['opioids'],
      symptomImpact: 'mildImpact', // code 1
      patientOnOxygen: 'noRoomAir',
    },
    gastrointestinal: {
      bowelRegimen: 'yes',
      treatments: ['laxatives'],
      bmType: 'regular',
      abdomenState: ['soft'],
      vomiting: true,
      vomitingData: {
        symptomImpact: 'notImpacted', // code 0
      },
      nausea: true,
      nauseaData: {
        symptomImpact: 'notImpacted', // code 0
      },
    },
    skin: {
      injuryTreatments: ['noneOfTheAbove'],
    },
    //quickFillModules: INV_QUICK_FILL_MODULES,
  },
};

/** SFV follow-up config for HUV visits */
const SFV_AFTER_HUV: HOPEVisitScenarioConfig = {
  scenarioId: 'SFV-HUV',
  description: 'SFV after HUV — resolve moderate symptoms',
  visitType: 'SFV',
  role: 'Registered Nurse (RN)',
  uiVisitType: 'Routine',
  hopeDialogOptions: { isSFV: true },
  acceptPlanOfCareIssues: true,
  previewHopeReport: false,
  expectsSFV: false,
  moduleFills: {
    neurological: {
      conditions: {
        anxiety: {
          symptomImpact: 'notImpacted',
        },
        agitation: {
          symptomImpact: 'notImpacted',
        },
      },
    },
    pain: {
      symptomImpact: 'notImpacted',
      scheduledOpioid: 'no',
      prnOpioid: 'no',
    },
    respiratory: {
      symptomImpact: 'notImpacted',
    },
    gastrointestinal: {
      bowelRegimen: 'no',
      bmType: 'regular',
      abdomenState: ['soft'],
    },
    summary: {
      addNarrative: true,
      narrativeText: 'SFV after HUV completed. Symptoms reassessed and resolved.',
    },
    //quickFillModules: HUV_QUICK_FILL_MODULES,
  },
};

/** S4: HUV1 with moderate symptoms — triggers SFV */
const S4_HUV1_WITH_SFV: HOPEVisitScenarioConfig = {
  scenarioId: 'S4',
  description: 'Complete HUV1 (With SFV)',
  visitType: 'HUV',
  role: 'Registered Nurse (RN)',
  uiVisitType: 'Routine',
  hopeDialogOptions: { isSFV: false, isHUV1: true },
  acceptPlanOfCareIssues: true,
  previewHopeReport: true,
  expectsSFV: true,
  sfvConfig: { ...SFV_AFTER_HUV, scenarioId: 'S4-SFV', description: 'SFV after HUV1' },
  moduleFills: {
    preferences: {
      signsOfImminentDeath: 'no',
    },
    neurological: {
      conditions: {
        anxiety: {
          symptomImpact: 'moderateImpact', // code 2 — triggers SFV
        },
        agitation: {
          symptomImpact: 'mildImpact',
        },
      },
    },
    pain: {
      symptomImpact: 'moderateImpact', // code 2
      scheduledOpioid: 'yes',
      prnOpioid: 'yes',
    },
    respiratory: {
      symptomImpact: 'mildImpact',
    },
    gastrointestinal: {
      bowelRegimen: 'yes',
      treatments: ['laxatives'],
      bmType: 'regular',
      abdomenState: ['soft'],
      vomiting: true,
      vomitingData: {
        symptomImpact: 'notImpacted',
      },
      nausea: true,
      nauseaData: {
        symptomImpact: 'notImpacted',
      },
    },
    skin: {
      injuryTreatments: ['noneOfTheAbove'],
    },
    //quickFillModules: HUV_QUICK_FILL_MODULES,
  },
};

/** S6: HUV2 with moderate symptoms — triggers SFV */
const S6_HUV2_WITH_SFV: HOPEVisitScenarioConfig = {
  scenarioId: 'S6',
  description: 'Complete HUV2 (With SFV)',
  visitType: 'HUV',
  role: 'Registered Nurse (RN)',
  uiVisitType: 'Routine',
  hopeDialogOptions: { isSFV: false, isHUV2: true },
  acceptPlanOfCareIssues: true,
  previewHopeReport: true,
  expectsSFV: true,
  sfvConfig: { ...SFV_AFTER_HUV, scenarioId: 'S6-SFV', description: 'SFV after HUV2' },
  moduleFills: {
    ...S4_HUV1_WITH_SFV.moduleFills,
  },
};

/** Complete Patient B chain config */
export const PATIENT_B_WITH_SFV: HOPEPatientChainConfig = {
  patientKey: 'hopePatientB',
  description: 'Patient B — With SFV lifecycle (S2 → S4 → S6 → S7)',
  visits: [S2_INV_WITH_SFV, S4_HUV1_WITH_SFV, S6_HUV2_WITH_SFV, S7_DISCHARGE],
  admissionVerification: {
    tabs: ['A', 'F', 'I', 'J', 'M', 'N', 'Z'],
    completeRecord: false, // Don't complete until SFV is done
    fillPayerInfo: true,
    expectedTabsComplete: ['A', 'F', 'I', 'M', 'N'],
    expectedTabsIncomplete: ['J'], // Section J requires SFV
  },
  includeDischarge: true,
};
