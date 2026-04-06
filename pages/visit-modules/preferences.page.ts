import { Page } from '@playwright/test';

/**
 * Data interface for Preferences module
 */
export interface PreferencesData {
  /** Assessment With checkboxes: patientResponsibleParty, caregiver, family */
  assessmentWith?: string[];
  /** HOPE Diagnosis: cancer, dementia, neurologicalCondition, stroke, copd, hopeCardiovascular, heartFailure, liverDisease, renalDisease, noneOfTheAbove */
  hopeDiagnosis?: string;
  /** Interpreter assist: yes, no, unableToDetermine */
  interpreterAssist?: string;
  /** CPR asked: yesDiscussionOccurred, yesRefusedToDiscuss, no */
  cprAsked?: string;
  /** Understand CPR: yes, no, refusedToDiscuss, didNotAsk */
  understandCpr?: string;
  /** Want CPR: yes, no, refusedToDiscuss, didNotAsk */
  wantCpr?: string;
  /** Out of hospital DNR: yes, no, refusedToDiscuss, didNotAsk */
  outOfHospitalDnr?: string;
  /** POLST: yes, no, refusedToDiscuss, didNotAsk */
  polst?: string;
  /** MOST: yes, no, refusedToDiscuss, didNotAsk */
  most?: string;
  /** Life sustaining treatments asked: yesAndDiscussed, yesAndRefused, no */
  lifeSustainingTreatmentsAsked?: string;
  /** Further hospitalizations: yes, no, refusedToDiscuss, didNotAsk */
  furtherHospitalizations?: string;
  /** Spiritual concerns: yes, no */
  spiritualConcerns?: string;
}

/**
 * Preferences Module Page Object
 */
export class PreferencesModulePage {
  readonly page: Page;

  private readonly selectors = {
    assessmentWithCheckbox: (item: string) => `[data-cy="checkbox-assessmentWithCheck-${item}"]`,
    diagnosisRadio: (option: string) => `[data-cy="radio-principleDiagnosisOptions-${option}"]`,
    languageSelect: '[data-cy="select-languages"]',
    interpreterRadio: (answer: string) => `[data-cy="radio-interpreterAssist-${answer}"]`,
    livingArrangementsSelect: '[data-cy="select-livingArrangements"]',
    levelOfAssistanceSelect: '[data-cy="select-levelOfAssistance"]',
    cprAskedRadio: (answer: string) => `[data-cy="radio-wasPatientAskedForPreferences-${answer}"]`,
    understandCprRadio: (answer: string) => `[data-cy="radio-patientUnderstandCpr-${answer}"]`,
    wantCprRadio: (answer: string) => `[data-cy="radio-patientWantCpr-${answer}"]`,
    outOfHospitalDnrRadio: (answer: string) => `[data-cy="radio-outOfHospitalDnr-${answer}"]`,
    codeStatusSelect: '[data-cy="select-codeStatus"]',
    polstRadio: (answer: string) => `[data-cy="radio-patientHasPolst-${answer}"]`,
    mostRadio: (answer: string) => `[data-cy="radio-patientHasMost-${answer}"]`,
    lifeSustainingRadio: (answer: string) =>
      `[data-cy="radio-wasPatientResponsibleAskedAboutLifeSustainingTreatments-${answer}"]`,
    hospitalizationRadio: (answer: string) =>
      `[data-cy="radio-patientWantFurtherHospitalizations-${answer}"]`,
    spiritualRadio: (answer: string) =>
      `[data-cy="radio-doesPatientReportSpiritualExistentialConcerns-${answer}"]`,
  };

  constructor(page: Page) {
    this.page = page;
  }

  private async clickRadio(selector: string): Promise<void> {
    const el = this.page.locator(selector);
    if (await el.isVisible({ timeout: 2000 }).catch(() => false)) {
      await el.click({ force: true });
      await this.page.waitForTimeout(300);
    }
  }

  private async clickCheckbox(selector: string): Promise<void> {
    const el = this.page.locator(selector);
    if (await el.isVisible({ timeout: 2000 }).catch(() => false)) {
      await el.click({ force: true });
      await this.page.waitForTimeout(300);
    }
  }

  private async selectFirstOption(selectLocator: string): Promise<void> {
    const el = this.page.locator(selectLocator);
    if (await el.isVisible({ timeout: 2000 }).catch(() => false)) {
      await el.click();
      await this.page.waitForTimeout(1000);
      await this.page.locator('ion-popover.select-popover ion-item').first().click({ force: true });
      await this.page.waitForTimeout(500);
    }
  }

  async fillPreferences(data: PreferencesData): Promise<void> {
    console.log('Filling Preferences module...');

    if (data.assessmentWith) {
      for (const item of data.assessmentWith) {
        await this.clickCheckbox(this.selectors.assessmentWithCheckbox(item));
      }
      console.log(`  Assessment With: ${data.assessmentWith.join(', ')}`);
    }

    if (data.hopeDiagnosis) {
      await this.clickRadio(this.selectors.diagnosisRadio(data.hopeDiagnosis));
      console.log(`  HOPE Diagnosis: ${data.hopeDiagnosis}`);
    }

    // HOPE Administration — selects
    await this.selectFirstOption(this.selectors.livingArrangementsSelect);
    console.log('  Living Arrangements: first option');
    await this.selectFirstOption(this.selectors.levelOfAssistanceSelect);
    console.log('  Level of Assistance: first option');

    if (data.interpreterAssist) {
      await this.clickRadio(this.selectors.interpreterRadio(data.interpreterAssist));
      console.log(`  Interpreter: ${data.interpreterAssist}`);
    }

    if (data.cprAsked) {
      await this.clickRadio(this.selectors.cprAskedRadio(data.cprAsked));
      console.log(`  CPR Asked: ${data.cprAsked}`);
    }

    if (data.understandCpr) {
      await this.clickRadio(this.selectors.understandCprRadio(data.understandCpr));
      console.log(`  Understand CPR: ${data.understandCpr}`);
    }

    if (data.wantCpr) {
      await this.clickRadio(this.selectors.wantCprRadio(data.wantCpr));
      console.log(`  Want CPR: ${data.wantCpr}`);
    }

    if (data.outOfHospitalDnr) {
      await this.clickRadio(this.selectors.outOfHospitalDnrRadio(data.outOfHospitalDnr));
      console.log(`  Out-of-hospital DNR: ${data.outOfHospitalDnr}`);
    }

    await this.selectFirstOption(this.selectors.codeStatusSelect);
    console.log('  Code Status: first option');

    if (data.polst) {
      await this.clickRadio(this.selectors.polstRadio(data.polst));
      console.log(`  POLST: ${data.polst}`);
    }

    if (data.most) {
      await this.clickRadio(this.selectors.mostRadio(data.most));
      console.log(`  MOST: ${data.most}`);
    }

    if (data.lifeSustainingTreatmentsAsked) {
      await this.clickRadio(this.selectors.lifeSustainingRadio(data.lifeSustainingTreatmentsAsked));
      console.log(`  Life Sustaining Treatments: ${data.lifeSustainingTreatmentsAsked}`);
    }

    if (data.furtherHospitalizations) {
      await this.clickRadio(this.selectors.hospitalizationRadio(data.furtherHospitalizations));
      console.log(`  Further Hospitalizations: ${data.furtherHospitalizations}`);
    }

    if (data.spiritualConcerns) {
      await this.clickRadio(this.selectors.spiritualRadio(data.spiritualConcerns));
      console.log(`  Spiritual Concerns: ${data.spiritualConcerns}`);
    }

    console.log('Preferences module filled');
  }

  /** Convenience: fill with defaults */
  async fillAllPreferences(): Promise<void> {
    await this.fillPreferences({
      assessmentWith: ['patientResponsibleParty'],
      hopeDiagnosis: 'cancer',
      interpreterAssist: 'no',
      cprAsked: 'yesDiscussionOccurred',
      understandCpr: 'yes',
      wantCpr: 'no',
      outOfHospitalDnr: 'yes',
      polst: 'no',
      most: 'no',
      lifeSustainingTreatmentsAsked: 'yesAndDiscussed',
    });
  }
}
