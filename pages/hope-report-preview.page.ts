import { Page } from '@playwright/test';

/**
 * HOPE Report Preview validation result
 */
export interface HopeReportValidation {
  /** Total warning cards found */
  warningCount: number;
  /** Sections with warnings (text of each warning) */
  warnings: string[];
  /** All populated answers keyed by readable label */
  populated: Record<string, string>;
}

/**
 * HOPE Report Preview Page Object
 *
 * Read-only page that aggregates data from all assessment modules into HOPE sections.
 * All element IDs map to question/answer pairs rendered by `hope-preview-report` component.
 *
 * Sections:
 *   A. Administration — Language, Living Arrangements, Living Assistance
 *   F. Preferences — CPR, Life-Sustaining, Hospitalization, Spiritual
 *   I. Active Diagnosis — Principal Diagnosis Options, Other Conditions
 *   J. Health Conditions — Imminent Death, Pain Screening, Pain Active,
 *      Comprehensive Pain, Neuropathic Pain, SOB Screening, SOB Treatment,
 *      Symptom Impact Screening, Symptom Impact (per-symptom)
 *   M. Skin — Skin Conditions, Types, Treatments
 *   N. Medications — Scheduled Opioid, PRN Opioid, Bowel Regimen
 */
export class HopeReportPreviewPage {
  readonly page: Page;

  // ── All answer element IDs grouped by HOPE section ─────────────────
  private readonly answerIds = {
    // Section A — Administration
    administration: {
      hopeLanguageAnswer: 'Language',
      hopeInterpreterAssistAnswer: 'Interpreter Assist',
      hopeLivingArrangementsAnswer: 'Living Arrangements',
      hopeLevelOfAssistanceAnswer: 'Level of Assistance',
    },

    // Section F — Preferences
    preferences: {
      hisCprPreferenceAnswer: 'CPR Preference',
      hisCprPreferenceDateAnswer: 'CPR Preference Date',
      hisOtherLifeSustainingTreatmentAnswer: 'Life-Sustaining Treatment',
      hisOtherLifeSustainingTreatmentDateAnswer: 'Life-Sustaining Date',
      hisHospitalizationPreferenceAnswer: 'Hospitalization Preference',
      hisHospitalizationPreferenceDateAnswer: 'Hospitalization Date',
      hisExistentialConcernsAnswer: 'Spiritual/Existential Concerns',
      hisExistentialConcernsDateAnswer: 'Spiritual/Existential Date',
    },

    // Section I — Active Diagnosis: Principal
    principalDiagnosis: {
      cancerAnswer: 'Cancer',
      dementiaAnswer: 'Dementia',
      neurologicalConditionAnswer: 'Neurological Condition',
      strokeAnswer: 'Stroke',
      copdAnswer: 'COPD',
      hopeCardiovascularAnswer: 'Cardiovascular',
      heartFailureAnswer: 'Heart Failure',
      liverDiseaseAnswer: 'Liver Disease',
      renalDiseaseAnswer: 'Renal Disease',
      noneOfTheAboveAnswer: 'None of the Above',
    },

    // Section I — Active Diagnosis: Other Conditions
    otherConditions: {
      otherCancerAnswer: 'I0100 Cancer',
      otherHeartFailureAnswer: 'I0600 Heart Failure',
      otherPeripheralVascularDiseaseAnswer: 'I0900 PVD/PAD',
      otherCardiovascularAnswer: 'I0950 Cardiovascular',
      otherLiverDiseaseAnswer: 'I1101 Liver Disease',
      otherRenalDiseaseAnswer: 'I1510 Renal Disease',
      otherSepsisAnswer: 'I2102 Sepsis',
      otherDiabetesMellitusAnswer: 'I2900 Diabetes',
      otherNeuropathyAnswer: 'I2910 Neuropathy',
      otherStrokeAnswer: 'I4501 Stroke',
      otherDementiaAnswer: 'I4801 Dementia',
      otherNeurologicalConditionsAnswer: 'I5150 Neurological',
      otherSeizureDisorderAnswer: 'I5401 Seizure Disorder',
      otherCOPDAnswer: 'I6202 COPD',
      otherMedicalConditionAnswer: 'I8005 Other Medical',
    },

    // Section J — Health Conditions: Pain
    pain: {
      hopeImminentDeathAnswer: 'J0050 Imminent Death',
      hisScreenedForPainAnswer: 'J0900 Screened for Pain',
      hisScreenedForPainDateAnswer: 'J0900 Pain Screening Date',
      hisPatientPainSeverityAnswer: 'J0900 Pain Severity',
      hisStandardizedPainToolAnswer: 'J0900 Pain Tool Used',
      hisActivePainAnswer: 'J0905 Active Pain',
      hisComprehensivePainAnswer: 'J0910 Comprehensive Pain',
      hisComprehensivePainDateAnswer: 'J0910 Comprehensive Pain Date',
      hiscomprehensivePainToolAnswer: 'J0910 Comprehensive Pain Tool',
      hopeNeurophaticPainAnswer: 'J0915 Neuropathic Pain',
    },

    // Section J — J0910.C Comprehensive Pain Assessment Methods (multi-value)
    comprehensivePainMethods: {
      baseId: 'hisChangedMethodsAnswer',
      label: 'J0910 Comprehensive Pain Methods',
      maxItems: 8,
    },

    // Section J — Health Conditions: Respiratory
    respiratory: {
      hisShortnessOfBreathAnswer: 'J2030 SOB Screening',
      hisShortnessOfBreathDateAnswer: 'J2030 SOB Screening Date',
      hisScreeningIndicateShortnessOfBreathAnswer: 'J2030 SOB Indicated',
      hisShortnessOfBreathTreatmentInitiatedAnswer: 'J2040 SOB Treatment',
      hisShortnessOfBreathTreatmentInitiatedDateAnswer: 'J2040 SOB Treatment Date',
    },

    // Section J — Symptom Impact
    symptomImpact: {
      isSymptomImpactScreeningCompletedAnswer: 'J2050 Symptom Impact Screening',
      painSymptomAnswer: 'J2051 Pain Impact',
      shortnessOfBreathSymptomAnswer: 'J2051 SOB Impact',
      anxietySymptomAnswer: 'J2051 Anxiety Impact',
      nauseaSymptomAnswer: 'J2051 Nausea Impact',
      vomitingSymptomAnswer: 'J2051 Vomiting Impact',
      diarrheaSymptomAnswer: 'J2051 Diarrhea Impact',
      constipationSymptomAnswer: 'J2051 Constipation Impact',
      agitationSymptomAnswer: 'J2051 Agitation Impact',
    },

    // Section J — J2052 Symptom Reassessment
    symptomReassessment: {
      noFollowupRequiredAnswer: 'J2052 No Followup Required',
    },

    // Section M — Skin Conditions
    skin: {
      doesPatientHaveOneOrMoreSkinConditionsAnswer: 'M1190 Skin Conditions',
      diabeticFootUlcersWoundAnswer: 'M1195 Diabetic Foot Ulcers',
      openLesionWoundAnswer: 'M1195 Open Lesion',
      pressureUlcerInjuryWoundAnswer: 'M1195 Pressure Ulcer/Injury',
      rashWoundAnswer: 'M1195 Rash',
      skinTearWoundAnswer: 'M1195 Skin Tear',
      surgicalWoundAnswer: 'M1195 Surgical Wound',
      ulcersOtherThanDiabeticOrPressureWoundAnswer: 'M1195 Other Ulcers',
      moistureAssociatedSkinDamageWoundAnswer: 'M1195 Moisture Damage',
      noSkinConditionsPresentAnswer: 'M1195 None Present',
    },

    // Section M — Skin Treatments
    skinTreatments: {
      apressureReducingDeviceForChairAnswer: 'M1200 Pressure Device Chair',
      bpressureReducingDeviceForBedAnswer: 'M1200 Pressure Device Bed',
      cturningRepositioningProgramAnswer: 'M1200 Turning/Repositioning',
      dnutritionOrHydrationInterventionToManageSkinProblemsAnswer: 'M1200 Nutrition/Hydration',
      epressureUlcerInjuryCareAnswer: 'M1200 Pressure Ulcer Care',
      fsurgicalWoundCareAnswer: 'M1200 Surgical Wound Care',
      gapplicationOfNonSurgicalDressingsWithOrWithoutTopicalMedicationsOtherThanToFeetAnswer: 'M1200 Non-Surgical Dressings',
      happlicationOfOintmentsMedicationsOtherThanToFeetAnswer: 'M1200 Ointments/Medications',
      iapplicationOfDressingsToFeetWithOrWithoutTopicalMedicationsAnswer: 'M1200 Dressings to Feet',
      jincontinenceManagementAnswer: 'M1200 Incontinence Mgmt',
      znoneOfTheAboveWereProvidedAnswer: 'M1200 None Provided',
    },

    // Section N — Medications
    medications: {
      hisOpoidAnswer: 'N0500 Scheduled Opioid',
      hisOpoidDateAnswer: 'N0500 Scheduled Opioid Date',
      hisPrnOpoidAnswer: 'N0510 PRN Opioid',
      hisPrnOpoidDateAnswer: 'N0510 PRN Opioid Date',
      hisBowelRegimentAnswer: 'N0520 Bowel Regimen',
      hisBowelRegimentDateAnswer: 'N0520 Bowel Regimen Date',
    },
  };

  // ── All question element IDs grouped by section ────────────────────
  private readonly questionIds = {
    hopeLanguageQuestion: 'A1110 Language Question',
    hopeInterpreterAssistQuestion: 'A1110 Interpreter Question',
    hopeLivingArrangementsQuestion: 'A1905 Living Arrangements Question',
    hopeLevelOfAssistanceQuestion: 'A1910 Level of Assistance Question',
    hisCprPreferenceQuestion: 'F2000 CPR Question',
    hisCprPreferenceDateQuestion: 'F2000 CPR Date Question',
    hisOtherLifeSustainingTreatmentQuestion: 'F2100 Life-Sustaining Question',
    hisHospitalizationPreferenceQuestion: 'F2200 Hospitalization Question',
    hisExistentialConcernsQuestion: 'F3000 Spiritual Question',
    hopeImminentDeathQuestion: 'J0050 Imminent Death Question',
    hisScreenedForPainQuestion: 'J0900 Pain Screening Question',
    hisPatientPainSeverityQuestion: 'J0900 Pain Severity Question',
    hisStandardizedPainToolQuestion: 'J0900 Pain Tool Question',
    hisActivePainQuestion: 'J0905 Active Pain Question',
    hisComprehensivePainQuestion: 'J0910 Comprehensive Pain Question',
    hopeNeurophaticPainQuestion: 'J0915 Neuropathic Pain Question',
    hisShortnessOfBreathQuestion: 'J2030 SOB Screening Question',
    hisShortnessOfBreathTreatmentInitiatedQuestion: 'J2040 SOB Treatment Question',
    isSymptomImpactScreeningCompletedQuestion: 'J2050 Screening Question',
    painSymptomQuestion: 'J2051 Pain Question',
    shortnessOfBreathSymptomQuestion: 'J2051 SOB Question',
    anxietySymptomQuestion: 'J2051 Anxiety Question',
    nauseaSymptomQuestion: 'J2051 Nausea Question',
    vomitingSymptomQuestion: 'J2051 Vomiting Question',
    diarrheaSymptomQuestion: 'J2051 Diarrhea Question',
    constipationSymptomQuestion: 'J2051 Constipation Question',
    agitationSymptomQuestion: 'J2051 Agitation Question',
    doesPatientHaveOneOrMoreSkinConditionsQuestion: 'M1190 Skin Conditions Question',
    hisBowelRegimentQuestion: 'N0520 Bowel Regimen Question',
    hisOpoidQuestion: 'N0500 Opioid Question',
    hisPrnOpoidQuestion: 'N0510 PRN Opioid Question',
  };

  private readonly selectors = {
    reportContainer: 'hope-preview-report',
    warningCard: '.warning-card',
    sectionHeader: '.section-header',
    cardHeader: '.card-header',
    cardContent: '.card-content',
    closeBtn: '[data-cy="btn-hope-report-close"], button:has-text("Close"), ion-back-button',
  };

  constructor(page: Page) {
    this.page = page;
  }

  // ══════════════════════════════════════════════════════════════════════
  // Core helpers
  // ══════════════════════════════════════════════════════════════════════

  async waitForLoad(): Promise<void> {
    await this.page.locator(this.selectors.reportContainer).waitFor({
      state: 'visible',
      timeout: 15000,
    });
    await this.page.waitForTimeout(2000);
    console.log('HOPE Report Preview loaded');
  }

  async getAnswerById(id: string): Promise<string> {
    const el = this.page.locator(`#${id}`);
    if (await el.isVisible({ timeout: 3000 }).catch(() => false)) {
      return (await el.textContent())?.trim() || '';
    }
    return '';
  }

  async getQuestionById(id: string): Promise<string> {
    const el = this.page.locator(`#${id}`);
    if (await el.isVisible({ timeout: 2000 }).catch(() => false)) {
      return (await el.textContent())?.trim() || '';
    }
    return '';
  }

  /**
   * Read multi-value answers (e.g. hisChangedMethodsAnswer0..N).
   * Returns a comma-separated string of all found values.
   */
  async getMultiValueAnswers(baseId: string, maxItems: number): Promise<string[]> {
    const values: string[] = [];
    for (let i = 0; i < maxItems; i++) {
      const el = this.page.locator(`#${baseId}${i}`);
      if (await el.isVisible({ timeout: 1000 }).catch(() => false)) {
        const text = (await el.textContent())?.trim();
        if (text) values.push(text);
      }
    }
    return values;
  }

  async getWarningCount(): Promise<number> {
    return await this.page.locator(this.selectors.warningCard).count();
  }

  async getWarnings(): Promise<string[]> {
    const warnings = this.page.locator(this.selectors.warningCard);
    const count = await warnings.count();
    const texts: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await warnings.nth(i).textContent();
      if (text) texts.push(text.trim());
    }
    return texts;
  }

  // ══════════════════════════════════════════════════════════════════════
  // Section-level validation methods
  // ══════════════════════════════════════════════════════════════════════

  /**
   * Read all answers in a section by its answer ID map.
   * Returns record of { label → answer text }.
   */
  private async readSection(idMap: Record<string, string>): Promise<Record<string, string>> {
    const results: Record<string, string> = {};
    for (const [id, label] of Object.entries(idMap)) {
      results[label] = await this.getAnswerById(id);
    }
    return results;
  }

  async validateAdministration(): Promise<Record<string, string>> {
    const r = await this.readSection(this.answerIds.administration);
    console.log('  Section A — Administration:', r);
    return r;
  }

  async validatePreferences(): Promise<Record<string, string>> {
    const r = await this.readSection(this.answerIds.preferences);
    console.log('  Section F — Preferences:', r);
    return r;
  }

  async validatePrincipalDiagnosis(): Promise<Record<string, string>> {
    const r = await this.readSection(this.answerIds.principalDiagnosis);
    console.log('  Section I — Principal Diagnosis:', r);
    return r;
  }

  async validateOtherConditions(): Promise<Record<string, string>> {
    const r = await this.readSection(this.answerIds.otherConditions);
    console.log('  Section I — Other Conditions:', r);
    return r;
  }

  async validatePain(): Promise<Record<string, string>> {
    const r = await this.readSection(this.answerIds.pain);

    // J0910.C Comprehensive Pain Methods (multi-value: hisChangedMethodsAnswer0..7)
    const methods = await this.getMultiValueAnswers(
      this.answerIds.comprehensivePainMethods.baseId,
      this.answerIds.comprehensivePainMethods.maxItems,
    );
    r[this.answerIds.comprehensivePainMethods.label] = methods.join(', ');

    console.log('  Section J — Pain:', r);
    return r;
  }

  async validateRespiratory(): Promise<Record<string, string>> {
    const r = await this.readSection(this.answerIds.respiratory);
    console.log('  Section J — Respiratory:', r);
    return r;
  }

  async validateSymptomImpact(): Promise<Record<string, string>> {
    const r = await this.readSection(this.answerIds.symptomImpact);
    console.log('  Section J — Symptom Impact:', r);
    return r;
  }

  async validateSymptomReassessment(): Promise<Record<string, string>> {
    const r = await this.readSection(this.answerIds.symptomReassessment);
    console.log('  Section J — Symptom Reassessment:', r);
    return r;
  }

  async validateSkin(): Promise<Record<string, string>> {
    const r = await this.readSection(this.answerIds.skin);
    console.log('  Section M — Skin Conditions:', r);
    return r;
  }

  async validateSkinTreatments(): Promise<Record<string, string>> {
    const r = await this.readSection(this.answerIds.skinTreatments);
    console.log('  Section M — Skin Treatments:', r);
    return r;
  }

  async validateMedications(): Promise<Record<string, string>> {
    const r = await this.readSection(this.answerIds.medications);
    console.log('  Section N — Medications:', r);
    return r;
  }

  // ══════════════════════════════════════════════════════════════════════
  // Full validation
  // ══════════════════════════════════════════════════════════════════════

  async validateAll(): Promise<HopeReportValidation> {
    await this.waitForLoad();

    const warningCount = await this.getWarningCount();
    const warnings = await this.getWarnings();

    console.log(`HOPE Report: ${warningCount} warning(s) found`);
    warnings.forEach((w, i) => console.log(`  Warning ${i + 1}: ${w.substring(0, 100)}`));

    const populated: Record<string, string> = {};

    const sections = [
      await this.validateAdministration(),
      await this.validatePreferences(),
      await this.validatePrincipalDiagnosis(),
      await this.validateOtherConditions(),
      await this.validatePain(),
      await this.validateRespiratory(),
      await this.validateSymptomImpact(),
      await this.validateSymptomReassessment(),
      await this.validateSkin(),
      await this.validateSkinTreatments(),
      await this.validateMedications(),
    ];

    for (const section of sections) {
      Object.assign(populated, section);
    }

    // Log summary of populated vs empty
    const filledCount = Object.values(populated).filter(v => v !== '').length;
    const emptyCount = Object.values(populated).filter(v => v === '').length;
    console.log(`HOPE Report Summary: ${filledCount} populated, ${emptyCount} empty, ${warningCount} warnings`);

    return { warningCount, warnings, populated };
  }

  // ══════════════════════════════════════════════════════════════════════
  // Close
  // ══════════════════════════════════════════════════════════════════════

  async close(): Promise<void> {
    const closeBtn = this.page.locator(this.selectors.closeBtn).first();
    if (await closeBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await closeBtn.click();
      await this.page.waitForTimeout(2000);
      console.log('Closed HOPE Report Preview');
    }
  }
}
