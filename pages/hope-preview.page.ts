import { Page, expect } from '@playwright/test';
import { BasePage } from './base.page';
import {
  AdministrationData,
  PreferencesData,
  ClinicalData,
  SkinConditionsData,
  MedicationsData,
  HOPEPreviewExpectations,
} from '../types/hope.types';
import { PREFERENCE_ALERTS, SKIN_ALERTS } from '../fixtures/hope-fixtures';

/**
 * HOPE Preview Page Object
 * Handles validation of HOPE (Hospice Outcomes and Patient Evaluation) preview report
 */
export class HopePreviewPage extends BasePage {
  private readonly selectors = {
    // HOPE Report Button
    hopeReportBtn: '[data-cy="btn-hope-report"]',

    // Section A - Administration
    languageQuestion: '[data-cy="text-A1110-question"]',
    languageAnswer: '[data-cy="text-A1110-answer"]',
    interpreterQuestion: '[data-cy="text-A1110A-question"]',
    interpreterAnswer: '[data-cy="text-A1110A-answer"]',
    livingArrangementQuestion: '[data-cy="text-A1950-question"]',
    livingArrangementAnswer: '[data-cy="text-A1950-answer"]',
    assistanceLevelQuestion: '[data-cy="text-A1910-question"]',
    assistanceLevelAnswer: '[data-cy="text-A1910-answer"]',

    // Section F - Preferences
    cprPreferenceQuestion: '[data-cy="text-F2000-question"]',
    cprPreferenceAnswer: '[data-cy="text-F2000-answer"]',
    cprDiscussionDate: '[data-cy="text-F2010-answer"]',
    cprAlert: '[data-cy="alert-F2000"]',

    lifeSustainingQuestion: '[data-cy="text-F2100-question"]',
    lifeSustainingAnswer: '[data-cy="text-F2100-answer"]',
    lifeSustainingDiscussionDate: '[data-cy="text-F2110-answer"]',
    lifeSustainingAlert: '[data-cy="alert-F2100"]',

    hospitalizationQuestion: '[data-cy="text-F2200-question"]',
    hospitalizationAnswer: '[data-cy="text-F2200-answer"]',
    hospitalizationDiscussionDate: '[data-cy="text-F2210-answer"]',
    hospitalizationAlert: '[data-cy="alert-F2200"]',

    spiritualQuestion: '[data-cy="text-F3000-question"]',
    spiritualAnswer: '[data-cy="text-F3000-answer"]',
    spiritualDiscussionDate: '[data-cy="text-F3010-answer"]',

    // Section J - Clinical
    imminentDeathQuestion: '[data-cy="text-J0050-question"]',
    imminentDeathAnswer: '[data-cy="text-J0050-answer"]',

    painScreeningQuestion: '[data-cy="text-J0900-question"]',
    painScreeningAnswer: '[data-cy="text-J0900-answer"]',

    painActiveProblemQuestion: '[data-cy="text-J0905-question"]',
    painActiveProblemAnswer: '[data-cy="text-J0905-answer"]',

    painAssessmentQuestion: '[data-cy="text-J0910-question"]',
    painAssessmentAnswer: '[data-cy="text-J0910-answer"]',

    neuropathicPainQuestion: '[data-cy="text-J0915-question"]',
    neuropathicPainAnswer: '[data-cy="text-J0915-answer"]',

    shortnessOfBreathQuestion: '[data-cy="text-J2030-question"]',
    shortnessOfBreathAnswer: '[data-cy="text-J2030-answer"]',

    symptomImpactScreeningQuestion: '[data-cy="text-J2050-question"]',
    symptomImpactScreeningAnswer: '[data-cy="text-J2050-answer"]',

    // J2051 - Initial Symptom Impact
    j2051PainAnswer: '[data-cy="text-J2051A-answer"]',
    j2051ShortnessOfBreathAnswer: '[data-cy="text-J2051B-answer"]',
    j2051AnxietyAnswer: '[data-cy="text-J2051C-answer"]',
    j2051NauseaAnswer: '[data-cy="text-J2051D-answer"]',
    j2051VomitingAnswer: '[data-cy="text-J2051E-answer"]',
    j2051DiarrheaAnswer: '[data-cy="text-J2051F-answer"]',
    j2051ConstipationAnswer: '[data-cy="text-J2051G-answer"]',
    j2051AgitationAnswer: '[data-cy="text-J2051H-answer"]',

    // J2052 - Symptom Reassessment
    symptomReassessmentQuestion: '[data-cy="text-J2052-question"]',
    symptomReassessmentAnswer: '[data-cy="text-J2052-answer"]',

    // Section M - Skin Conditions
    skinConditionsQuestion: '[data-cy="text-M1195-question"]',
    pressureUlcerAnswer: '[data-cy="text-M1195A-answer"]',
    stagingUlcerAnswer: '[data-cy="text-M1195B-answer"]',
    diabeticFootUlcerAnswer: '[data-cy="text-M1195C-answer"]',
    otherWoundsAnswer: '[data-cy="text-M1195D-answer"]',
    noneOfAboveAnswer: '[data-cy="text-M1195E-answer"]',
    skinAlert: '[data-cy="alert-M1195"]',

    pressureDeviceChairQuestion: '[data-cy="text-M1200A-question"]',
    pressureDeviceChairAnswer: '[data-cy="text-M1200A-answer"]',
    pressureDeviceBedQuestion: '[data-cy="text-M1200B-question"]',
    pressureDeviceBedAnswer: '[data-cy="text-M1200B-answer"]',

    // Section N - Medications
    scheduledOpioidQuestion: '[data-cy="text-N0200A-question"]',
    scheduledOpioidAnswer: '[data-cy="text-N0200A-answer"]',

    prnOpioidQuestion: '[data-cy="text-N0200B-question"]',
    prnOpioidAnswer: '[data-cy="text-N0200B-answer"]',

    bowelRegimenQuestion: '[data-cy="text-N0200C-question"]',
    bowelRegimenAnswer: '[data-cy="text-N0200C-answer"]',
  };

  constructor(page: Page) {
    super(page);
  }

  /**
   * Click HOPE Report button to open preview
   */
  async clickHopeReport(): Promise<void> {
    await this.page.locator(this.selectors.hopeReportBtn).click();
    await this.page.waitForTimeout(2000);
    console.log('✅ Opened HOPE report preview');
  }

  /**
   * Validate Section A - Administration
   */
  async validateAdministrationSection(expected: AdministrationData): Promise<void> {
    console.log('\n📋 Validating HOPE Section A - Administration...');

    // Language
    const languageAnswer = await this.page.locator(this.selectors.languageAnswer).textContent();
    expect(languageAnswer?.trim()).toBe(expected.language);
    console.log(`✅ Language: ${expected.language}`);

    // Interpreter (if specified)
    if (expected.interpreter !== undefined) {
      const interpreterAnswer = await this.page.locator(this.selectors.interpreterAnswer).textContent();
      expect(interpreterAnswer?.trim()).toBe(expected.interpreter);
      console.log(`✅ Interpreter: ${expected.interpreter}`);
    }

    // Living Arrangement
    const livingAnswer = await this.page.locator(this.selectors.livingArrangementAnswer).textContent();
    expect(livingAnswer?.trim()).toBe(expected.livingArrangement);
    console.log(`✅ Living Arrangement: ${expected.livingArrangement}`);

    // Assistance Level
    const assistanceAnswer = await this.page.locator(this.selectors.assistanceLevelAnswer).textContent();
    expect(assistanceAnswer?.trim()).toBe(expected.assistanceLevel);
    console.log(`✅ Assistance Level: ${expected.assistanceLevel}`);

    console.log('✅ Section A validated successfully\n');
  }

  /**
   * Validate Section F - Preferences
   */
  async validatePreferencesSection(expected: PreferencesData): Promise<void> {
    console.log('\n📋 Validating HOPE Section F - Preferences...');

    // CPR Preference
    await this.validatePreference(
      'CPR',
      this.selectors.cprPreferenceAnswer,
      this.selectors.cprDiscussionDate,
      this.selectors.cprAlert,
      expected.cpr
    );

    // Life-Sustaining Treatment
    await this.validatePreference(
      'Life-Sustaining Treatment',
      this.selectors.lifeSustainingAnswer,
      this.selectors.lifeSustainingDiscussionDate,
      this.selectors.lifeSustainingAlert,
      expected.lifeSustaining
    );

    // Hospitalization
    await this.validatePreference(
      'Hospitalization',
      this.selectors.hospitalizationAnswer,
      this.selectors.hospitalizationDiscussionDate,
      this.selectors.hospitalizationAlert,
      expected.hospitalization
    );

    // Spiritual Concerns
    await this.validatePreference(
      'Spiritual Concerns',
      this.selectors.spiritualAnswer,
      this.selectors.spiritualDiscussionDate,
      null,
      expected.spiritual
    );

    console.log('✅ Section F validated successfully\n');
  }

  /**
   * Helper to validate individual preference
   */
  private async validatePreference(
    name: string,
    answerSelector: string,
    dateSelector: string,
    alertSelector: string | null,
    expected: { response: string; discussionDate?: string; hasAlert?: boolean }
  ): Promise<void> {
    const answer = await this.page.locator(answerSelector).textContent();

    if (expected.response === 'Yes') {
      expect(answer?.trim()).toBe('Yes');
      if (expected.discussionDate) {
        const date = await this.page.locator(dateSelector).textContent();
        expect(date?.trim()).toBe(expected.discussionDate);
      }
    } else if (expected.response === 'No') {
      expect(answer?.trim()).toBe('No');
      if (expected.hasAlert && alertSelector) {
        const alert = await this.page.locator(alertSelector).textContent();
        expect(alert).toContain(PREFERENCE_ALERTS.NO_DISCUSSION);
      }
    } else if (expected.response === 'Refuse') {
      expect(answer?.trim()).toContain(PREFERENCE_ALERTS.REFUSED_TO_DISCUSS);
      if (expected.discussionDate) {
        const date = await this.page.locator(dateSelector).textContent();
        expect(date?.trim()).toBe(expected.discussionDate);
      }
    }

    console.log(`✅ ${name}: ${expected.response}`);
  }

  /**
   * Validate Section J - Clinical
   */
  async validateClinicalSection(expected: ClinicalData): Promise<void> {
    console.log('\n📋 Validating HOPE Section J - Clinical...');

    // Imminent Death
    if (expected.imminentDeath) {
      const imminentDeath = await this.page.locator(this.selectors.imminentDeathAnswer).textContent();
      expect(imminentDeath?.trim()).toBe(expected.imminentDeath);
      console.log(`✅ Imminent Death: ${expected.imminentDeath}`);
    }

    // Pain Screening
    if (expected.painScreening) {
      const painScreening = await this.page.locator(this.selectors.painScreeningAnswer).textContent();
      expect(painScreening?.trim()).toBe(expected.painScreening);
      console.log(`✅ Pain Screening: ${expected.painScreening}`);
    }

    // Symptom Impact (J2051)
    await this.validateSymptomImpact(expected.symptomImpact);

    // Symptom Reassessment (J2052)
    if (expected.symptomReassessment) {
      const reassessment = await this.page.locator(this.selectors.symptomReassessmentAnswer).textContent();
      expect(reassessment).toContain(expected.symptomReassessment);
      console.log(`✅ Symptom Reassessment: ${expected.symptomReassessment}`);
    }

    console.log('✅ Section J validated successfully\n');
  }

  /**
   * Validate J2051 - Symptom Impact
   */
  async validateSymptomImpact(expected: {
    pain: string;
    shortnessOfBreath: string;
    anxiety: string;
    nausea: string;
    vomiting: string;
    diarrhea: string;
    constipation: string;
    agitation: string;
  }): Promise<void> {
    console.log('📊 Validating J2051 - Symptom Impact...');

    const symptoms = [
      { name: 'Pain', selector: this.selectors.j2051PainAnswer, expected: expected.pain },
      { name: 'Shortness of Breath', selector: this.selectors.j2051ShortnessOfBreathAnswer, expected: expected.shortnessOfBreath },
      { name: 'Anxiety', selector: this.selectors.j2051AnxietyAnswer, expected: expected.anxiety },
      { name: 'Nausea', selector: this.selectors.j2051NauseaAnswer, expected: expected.nausea },
      { name: 'Vomiting', selector: this.selectors.j2051VomitingAnswer, expected: expected.vomiting },
      { name: 'Diarrhea', selector: this.selectors.j2051DiarrheaAnswer, expected: expected.diarrhea },
      { name: 'Constipation', selector: this.selectors.j2051ConstipationAnswer, expected: expected.constipation },
      { name: 'Agitation', selector: this.selectors.j2051AgitationAnswer, expected: expected.agitation },
    ];

    for (const symptom of symptoms) {
      const answer = await this.page.locator(symptom.selector).textContent();
      expect(answer?.trim()).toBe(symptom.expected);
      console.log(`  ✅ ${symptom.name}: ${symptom.expected}`);
    }
  }

  /**
   * Validate Section M - Skin Conditions
   */
  async validateSkinConditionsSection(expected: SkinConditionsData): Promise<void> {
    console.log('\n📋 Validating HOPE Section M - Skin Conditions...');

    if (expected.hasAlert) {
      const alert = await this.page.locator(this.selectors.skinAlert).textContent();
      expect(alert).toContain(SKIN_ALERTS.NO_WOUNDS);
      console.log(`✅ Skin Alert: ${SKIN_ALERTS.NO_WOUNDS}`);
    }

    if (expected.pressureUlcer) {
      const answer = await this.page.locator(this.selectors.pressureUlcerAnswer).textContent();
      expect(answer?.trim()).toBe(expected.pressureUlcer);
      console.log(`✅ Pressure Ulcer: ${expected.pressureUlcer}`);
    }

    if (expected.diabeticFootUlcer) {
      const answer = await this.page.locator(this.selectors.diabeticFootUlcerAnswer).textContent();
      expect(answer?.trim()).toBe(expected.diabeticFootUlcer);
      console.log(`✅ Diabetic Foot Ulcer: ${expected.diabeticFootUlcer}`);
    }

    if (expected.noneOfAbove) {
      const answer = await this.page.locator(this.selectors.noneOfAboveAnswer).textContent();
      expect(answer?.trim()).toBe(expected.noneOfAbove);
      console.log(`✅ None of Above: ${expected.noneOfAbove}`);
    }

    if (expected.pressureDeviceChair) {
      const answer = await this.page.locator(this.selectors.pressureDeviceChairAnswer).textContent();
      expect(answer?.trim()).toBe(expected.pressureDeviceChair);
      console.log(`✅ Pressure Device Chair: ${expected.pressureDeviceChair}`);
    }

    if (expected.pressureDeviceBed) {
      const answer = await this.page.locator(this.selectors.pressureDeviceBedAnswer).textContent();
      expect(answer?.trim()).toBe(expected.pressureDeviceBed);
      console.log(`✅ Pressure Device Bed: ${expected.pressureDeviceBed}`);
    }

    console.log('✅ Section M validated successfully\n');
  }

  /**
   * Validate Section N - Medications
   */
  async validateMedicationsSection(expected: MedicationsData): Promise<void> {
    console.log('\n📋 Validating HOPE Section N - Medications...');

    const scheduledOpioid = await this.page.locator(this.selectors.scheduledOpioidAnswer).textContent();
    expect(scheduledOpioid?.trim()).toBe(expected.scheduledOpioid);
    console.log(`✅ Scheduled Opioid: ${expected.scheduledOpioid}`);

    const prnOpioid = await this.page.locator(this.selectors.prnOpioidAnswer).textContent();
    expect(prnOpioid?.trim()).toBe(expected.prnOpioid);
    console.log(`✅ PRN Opioid: ${expected.prnOpioid}`);

    const bowelRegimen = await this.page.locator(this.selectors.bowelRegimenAnswer).textContent();
    expect(bowelRegimen?.trim()).toBe(expected.bowelRegimen);
    console.log(`✅ Bowel Regimen: ${expected.bowelRegimen}`);

    console.log('✅ Section N validated successfully\n');
  }

  /**
   * Validate Complete HOPE Preview
   */
  async validateCompleteHOPEPreview(expectations: HOPEPreviewExpectations): Promise<void> {
    console.log('\n🔍 Validating Complete HOPE Preview Report...\n');

    await this.validateAdministrationSection(expectations.administration);
    await this.validatePreferencesSection(expectations.preferences);
    await this.validateClinicalSection(expectations.clinical);

    if (expectations.skinConditions) {
      await this.validateSkinConditionsSection(expectations.skinConditions);
    }

    await this.validateMedicationsSection(expectations.medications);

    console.log('🎉 HOPE Preview validation complete!\n');
  }
}
