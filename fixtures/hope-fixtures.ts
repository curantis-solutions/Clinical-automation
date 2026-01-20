/**
 * HOPE Test Fixtures
 * Predefined configurations for common test scenarios
 */

import { SymptomData, HOPEPreviewExpectations, InvVisitConfig, SymptomImpactLevel } from '../types/hope.types';

/**
 * Symptom Impact Value Constants
 */
export const SYMPTOM_IMPACT_VALUES = {
  NOT_EXPERIENCING: '9 - Patient not experiencing the symptom',
  NO_IMPACT: '0 - Not Impacted',
  MILD: '1 - Mild Impact',
  MODERATE: '2 - Moderate Impact',
  SEVERE: '3 - Severe Impact',
} as const;

/**
 * Helper to create symptom data based on impact level
 */
export function createSymptomProfile(
  impactLevel: SymptomImpactLevel,
  bowelException: 'Constipation' | 'Diarrhea' | 'None' = 'None'
): SymptomData {
  let baseValue: string;

  switch (impactLevel) {
    case 'NoSymptoms':
      return {
        pain: SYMPTOM_IMPACT_VALUES.NOT_EXPERIENCING,
        shortnessOfBreath: SYMPTOM_IMPACT_VALUES.NOT_EXPERIENCING,
        anxiety: SYMPTOM_IMPACT_VALUES.NOT_EXPERIENCING,
        nausea: SYMPTOM_IMPACT_VALUES.NOT_EXPERIENCING,
        vomiting: SYMPTOM_IMPACT_VALUES.NOT_EXPERIENCING,
        diarrhea: SYMPTOM_IMPACT_VALUES.NOT_EXPERIENCING,
        constipation: SYMPTOM_IMPACT_VALUES.NOT_EXPERIENCING,
        agitation: SYMPTOM_IMPACT_VALUES.NOT_EXPERIENCING,
      };

    case 'NoImpact':
      baseValue = SYMPTOM_IMPACT_VALUES.NO_IMPACT;
      break;

    case 'MildImpact':
      baseValue = SYMPTOM_IMPACT_VALUES.MILD;
      break;

    case 'ModerateImpact':
      baseValue = SYMPTOM_IMPACT_VALUES.MODERATE;
      break;

    case 'SevereImpact':
      baseValue = SYMPTOM_IMPACT_VALUES.SEVERE;
      break;

    default:
      throw new Error(`Unknown impact level: ${impactLevel}`);
  }

  // Create base profile with all symptoms at the specified level
  const profile: SymptomData = {
    pain: baseValue,
    shortnessOfBreath: baseValue,
    anxiety: baseValue,
    nausea: baseValue,
    vomiting: baseValue,
    diarrhea: baseValue,
    constipation: baseValue,
    agitation: baseValue,
  };

  // Apply bowel exception (one bowel symptom is "not experiencing")
  if (bowelException === 'Constipation') {
    profile.constipation = SYMPTOM_IMPACT_VALUES.NOT_EXPERIENCING;
  } else if (bowelException === 'Diarrhea') {
    profile.diarrhea = SYMPTOM_IMPACT_VALUES.NOT_EXPERIENCING;
  } else if (impactLevel === 'NoImpact') {
    // For NoImpact, both bowel issues are "not experiencing"
    profile.diarrhea = SYMPTOM_IMPACT_VALUES.NOT_EXPERIENCING;
    profile.constipation = SYMPTOM_IMPACT_VALUES.NOT_EXPERIENCING;
  }

  return profile;
}

/**
 * Predefined Symptom Profiles
 */
export const SYMPTOM_PROFILES = {
  NO_SYMPTOMS: createSymptomProfile('NoSymptoms'),
  NO_IMPACT: createSymptomProfile('NoImpact'),
  MILD_WITH_DIARRHEA: createSymptomProfile('MildImpact', 'Constipation'),
  MODERATE_WITH_CONSTIPATION: createSymptomProfile('ModerateImpact', 'Diarrhea'),
  SEVERE_WITH_DIARRHEA: createSymptomProfile('SevereImpact', 'Constipation'),
} as const;

/**
 * Reassessment Messages
 */
export const REASSESSMENT_MESSAGES = {
  NO_FOLLOWUP: 'No followup is required',
  MODERATE_FOLLOWUP: 'Moderate impact symptoms maintained',
  SEVERE_FOLLOWUP: 'Severe impact symptoms including',
} as const;

/**
 * Preference Alert Messages
 */
export const PREFERENCE_ALERTS = {
  NO_DISCUSSION: 'YOU HAVE NOT INDICATED THAT A DISCUSSION HAS OCCURRED',
  REFUSED_TO_DISCUSS: 'Yes but patient refused to discuss',
} as const;

/**
 * Skin Condition Alert Messages
 */
export const SKIN_ALERTS = {
  NO_WOUNDS: 'You have not indicated any wounds or skin conditions',
} as const;

/**
 * Common Test Configurations
 */

/**
 * Configuration for "Yes" preference responses with moderate symptoms
 */
export const HOPE_YES_MODERATE_CONFIG: Partial<HOPEPreviewExpectations> = {
  administration: {
    language: 'English',
    interpreter: 'No',
    livingArrangement: 'With Others in Home',
    assistanceLevel: 'Regular',
  },
  preferences: {
    cpr: { response: 'Yes', hasAlert: false },
    lifeSustaining: { response: 'Yes', hasAlert: false },
    hospitalization: { response: 'Yes', hasAlert: false },
    spiritual: { response: 'Yes' },
  },
  clinical: {
    imminentDeath: 'No',
    symptomImpact: SYMPTOM_PROFILES.MODERATE_WITH_CONSTIPATION,
    symptomReassessment: REASSESSMENT_MESSAGES.MODERATE_FOLLOWUP,
  },
  skinConditions: {
    pressureUlcer: 'No',
    stagingUlcer: 'No',
    diabeticFootUlcer: 'Yes',
    otherWounds: 'No',
    noneOfAbove: 'No',
    pressureDeviceChair: 'Yes',
    pressureDeviceBed: 'No',
  },
  medications: {
    scheduledOpioid: 'Yes',
    prnOpioid: 'Yes',
    bowelRegimen: 'Yes',
  },
};

/**
 * Configuration for "Yes" preference responses with severe symptoms
 */
export const HOPE_YES_SEVERE_CONFIG: Partial<HOPEPreviewExpectations> = {
  ...HOPE_YES_MODERATE_CONFIG,
  clinical: {
    imminentDeath: 'No',
    symptomImpact: SYMPTOM_PROFILES.SEVERE_WITH_DIARRHEA,
    symptomReassessment: REASSESSMENT_MESSAGES.SEVERE_FOLLOWUP,
  },
};

/**
 * Configuration for "No" preference responses with no symptoms
 */
export const HOPE_NO_SYMPTOMS_CONFIG: Partial<HOPEPreviewExpectations> = {
  administration: {
    language: 'French',
    interpreter: 'No',
    livingArrangement: 'With Others in Home',
    assistanceLevel: 'Regular Nighttime Only',
  },
  preferences: {
    cpr: { response: 'No', hasAlert: true },
    lifeSustaining: { response: 'No', hasAlert: true },
    hospitalization: { response: 'No', hasAlert: true },
    spiritual: { response: 'No' },
  },
  clinical: {
    symptomImpact: SYMPTOM_PROFILES.NO_SYMPTOMS,
    symptomReassessment: REASSESSMENT_MESSAGES.NO_FOLLOWUP,
  },
  skinConditions: {
    pressureUlcer: 'No',
    stagingUlcer: 'No',
    diabeticFootUlcer: 'No',
    otherWounds: 'No',
    noneOfAbove: 'Yes',
    pressureDeviceChair: 'No',
    pressureDeviceBed: 'No',
  },
  medications: {
    scheduledOpioid: 'No',
    prnOpioid: 'No',
    bowelRegimen: 'No, but there is documentation of why a bowel regimen was not initiated or continued',
  },
};

/**
 * Configuration for "No" preference responses with mild symptoms
 */
export const HOPE_NO_MILD_CONFIG: Partial<HOPEPreviewExpectations> = {
  administration: {
    language: 'English',
    interpreter: 'No',
    livingArrangement: 'With Others in Home',
    assistanceLevel: 'Regular',
  },
  preferences: {
    cpr: { response: 'No', hasAlert: true },
    lifeSustaining: { response: 'No', hasAlert: true },
    hospitalization: { response: 'No', hasAlert: true },
    spiritual: { response: 'No' },
  },
  clinical: {
    symptomImpact: SYMPTOM_PROFILES.MILD_WITH_DIARRHEA,
    symptomReassessment: REASSESSMENT_MESSAGES.NO_FOLLOWUP,
  },
  skinConditions: {
    hasAlert: true,
    pressureDeviceChair: 'Yes',
    pressureDeviceBed: 'No',
  },
  medications: {
    scheduledOpioid: 'No',
    prnOpioid: 'No',
    bowelRegimen: 'No',
  },
};

/**
 * Configuration for "Refuse" preference responses with no impact
 */
export const HOPE_REFUSE_NO_IMPACT_CONFIG: Partial<HOPEPreviewExpectations> = {
  administration: {
    language: 'Korean',
    livingArrangement: 'Congregate Home',
    assistanceLevel: 'Occasional',
  },
  preferences: {
    cpr: { response: 'Refuse', hasAlert: false },
    lifeSustaining: { response: 'Refuse', hasAlert: false },
    hospitalization: { response: 'Refuse', hasAlert: false },
    spiritual: { response: 'Refuse' },
  },
  clinical: {
    imminentDeath: 'Yes',
    symptomImpact: SYMPTOM_PROFILES.NO_IMPACT,
    symptomReassessment: REASSESSMENT_MESSAGES.NO_FOLLOWUP,
  },
  medications: {
    scheduledOpioid: 'No',
    prnOpioid: 'No',
    bowelRegimen: 'No',
  },
};

/**
 * INV Visit Configuration Templates
 */
export const INV_VISIT_CONFIGS = {
  YES_MODERATE: {
    role: 'Registered Nurse (RN)',
    preferenceResponse: 'Yes',
    cprmsg: 'Yes',
    lifeSustainingMsg: 'Yes',
    bowelType: 'Constipation',
    bowelRegimen: 'Yes',
    impactLevel: 'ModerateImpact',
  } as InvVisitConfig,

  YES_SEVERE: {
    role: 'Registered Nurse (RN)',
    preferenceResponse: 'Yes',
    cprmsg: 'Yes',
    lifeSustainingMsg: 'Yes',
    bowelType: 'Diarrhea',
    bowelRegimen: 'Yes',
    impactLevel: 'SevereImpact',
  } as InvVisitConfig,

  NO_SYMPTOMS: {
    role: 'Registered Nurse (RN)',
    preferenceResponse: 'No',
    cprmsg: 'No',
    lifeSustainingMsg: 'NowithDocument',
    bowelType: 'Regular',
    bowelRegimen: 'NowithDocument',
    impactLevel: 'NoSymptoms',
  } as InvVisitConfig,

  NO_MILD: {
    role: 'Registered Nurse (RN)',
    preferenceResponse: 'No',
    cprmsg: 'No',
    lifeSustainingMsg: 'No',
    bowelType: 'Diarrhea',
    bowelRegimen: 'No',
    impactLevel: 'MildImpact',
  } as InvVisitConfig,

  REFUSE_NO_IMPACT: {
    role: 'Registered Nurse (RN)',
    preferenceResponse: 'Refuse',
    cprmsg: 'No',
    lifeSustainingMsg: 'NowithDocument',
    bowelType: 'Regular',
    bowelRegimen: 'No',
    impactLevel: 'NoImpact',
  } as InvVisitConfig,
} as const;
