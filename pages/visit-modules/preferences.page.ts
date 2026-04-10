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
  otherConditions?: string;
  preferredLanguage?: string;
  levelOfAssistance?: string;
  interpreterAssist?: string;
  /** CPR asked: yesDiscussionOccurred, yesRefusedToDiscuss, no */
  cprAsked?: string;
  /** Understand CPR: yes, no, refusedToDiscuss, didNotAsk */
  understandCpr?: string;
  /** Want CPR: yes, no, refusedToDiscuss, didNotAsk */
  wantCpr?: string;
  /** Out of hospital DNR: yes, no, refusedToDiscuss, didNotAsk */
  outOfHospitalDnr?: string;
  /** Code status: fullCode, dnr, cmo, other */
  codeStatus?: string;
  /** POLST: yes, no, refusedToDiscuss, didNotAsk */
  polst?: string;
  polstLocation?: string;
  polstPhysician?: string;
  /** MOST: yes, no, refusedToDiscuss, didNotAsk */
  most?: string;
  mostLocation?: string;
  mostPhysician?: string;

  /** Life sustaining treatments asked: yesAndDiscussed, yesAndRefused, no */
  lifeSustainingTreatmentsAsked?: string;
  lifeSustainingTreatmentsDate?: string;
  wantLifeSustainingTreatments?: string;
  
  /** Further hospitalizations: yes, no, refusedToDiscuss, didNotAsk */
  furtherHospitalizations?: string;
  /** Want further hospitalizations: yes, no  */
  wantfurtherHospitalizations?: string;

  /** Spiritual concerns: yes, no */
  spiritualConcernsAsk?: string;
  /** Have spiritual concerns: yes, no */
  haveSpiritualConcerns?: string;
  /** Signs of imminent death: yes, no */
  signsOfImminentDeath?: string;
  notes?: string;
}

/**
 * Preferences Module Page Object
 */
export class PreferencesModulePage {
  readonly page: Page;

  private readonly selectors = {
    // ── Assessment With ─────────────────────────────────────────────
    assessmentWithCheckbox: (item: string) => `[data-cy="checkbox-assessmentWithCheck-${item}"]`,

    // ── HOPE Diagnosis ──────────────────────────────────────────────
    diagnosisRadio: (option: string) => `[data-cy="radio-principleDiagnosisOptions-${option}"]`,

    // ── Other Conditions (checkboxes) ───────────────────────────────
    otherConditionCheckbox: (condition: string) => `[data-cy="checkbox-otherConditionsCheck-${condition}"]`,

    // ── HOPE Administration ─────────────────────────────────────────
    languageSelect: '[data-cy="select-languages"]',
    interpreterRadio: (answer: string) => `[data-cy="radio-interpreterAssist-${answer}"]`,
    livingArrangementsSelect: '[data-cy="select-livingArrangements"]',
    levelOfAssistanceSelect: '[data-cy="select-levelOfAssistance"]',

    // ── CPR Preferences ─────────────────────────────────────────────
    cprAskedRadio: (answer: string) => `[data-cy="radio-wasPatientAskedForPreferences-${answer}"]`,
    understandCprRadio: (answer: string) => `[data-cy="radio-patientUnderstandCpr-${answer}"]`,
    wantCprRadio: (answer: string) => `[data-cy="radio-patientWantCpr-${answer}"]`,
    outOfHospitalDnrRadio: (answer: string) => `[data-cy="radio-outOfHospitalDnr-${answer}"]`,
    codeStatusSelect: '[data-cy="select-codeStatus"]',
    polstRadio: (answer: string) => `[data-cy="radio-patientHasPolst-${answer}"]`,
    mostRadio: (answer: string) => `[data-cy="radio-patientHasMost-${answer}"]`,

    // ── Life-Sustaining Treatments ──────────────────────────────────
    lifeSustainingRadio: (answer: string) =>
      `[data-cy="radio-wasPatientResponsibleAskedAboutLifeSustainingTreatments-${answer}"]`,
    wantLifeSustainingRadio: (answer: string) =>
      `[data-cy="radio-patientWantsLifeSustainingTreatments-${answer}"]`,

    // ── Hospitalization ─────────────────────────────────────────────
    hospitalizationRadio: (answer: string) =>
      `[data-cy="radio-patientPreferenceRegardingHospitalization-${answer}"]`,
    wantHospitalizationRadio: (answer: string) =>
      `[data-cy="radio-patientWantsFurtherHospitalizations-${answer}"]`,

    // ── Spiritual/Existential Concerns ──────────────────────────────
    haveSpiritualConcernsRadio: (answer: string) =>
      `[data-cy="radio-wasPatientOrCaregiverAskedAboutSpiritualExistentialConcerns-${answer}"]`,
    spiritualRadio: (answer: string) =>
      `[data-cy="radio-hasPatientSpiritualConcerns-${answer}"]`,

    // ── Imminent Death ──────────────────────────────────────────────
    imminentDeathRadio: (answer: string) =>
      `[data-cy="radio-patientShowingSignsOfImminentDeath-${answer}"]`,

    // ── Notes ───────────────────────────────────────────────────────
    notesAddBtn: '[data-cy="button-notes-add"]',
  };

  constructor(page: Page) {
    this.page = page;
  }

  private async clickRadio(selector: string): Promise<void> {
    const el = this.page.locator(selector);
    if (await el.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Click the button inside the ion-radio for Angular to register
      const btn = el.locator('button');
      if (await btn.count() > 0) {
        await btn.click({ force: true });
      } else {
        await el.click({ force: true });
      }
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

  /**
   * Select an ion-select option by visible text within the popover
   */
  private async selectOptionByText(selectLocator: string, text: string): Promise<void> {
    const el = this.page.locator(selectLocator);
    if (await el.isVisible({ timeout: 2000 }).catch(() => false)) {
      await el.click();
      await this.page.waitForTimeout(1000);
      const option = this.page.locator('ion-popover.select-popover ion-item').filter({ hasText: text }).first();
      if (await option.isVisible({ timeout: 2000 }).catch(() => false)) {
        await option.click({ force: true });
      } else {
        // Fallback to first option
        await this.page.locator('ion-popover.select-popover ion-item').first().click({ force: true });
      }
      await this.page.waitForTimeout(500);
    }
  }

  async fillPreferences(data: PreferencesData): Promise<void> {
    console.log('Filling Preferences module...');

    // Assessment With
    if (data.assessmentWith) {
      for (const item of data.assessmentWith) {
        await this.clickCheckbox(this.selectors.assessmentWithCheckbox(item));
      }
      console.log(`  Assessment With: ${data.assessmentWith.join(', ')}`);
    }

    // HOPE Diagnosis (principal)
    if (data.hopeDiagnosis) {
      await this.clickRadio(this.selectors.diagnosisRadio(data.hopeDiagnosis));
      console.log(`  HOPE Diagnosis: ${data.hopeDiagnosis}`);
    }

    // Other Conditions (checkboxes)
    if (data.otherConditions) {
      await this.clickCheckbox(this.selectors.otherConditionCheckbox(data.otherConditions));
      console.log(`  Other Conditions: ${data.otherConditions}`);
    }

    // HOPE Administration — selects
    // Language must be selected first to enable interpreter radios
    await this.selectFirstOption(this.selectors.languageSelect);
    console.log('  Language: first option');

    await this.selectFirstOption(this.selectors.livingArrangementsSelect);
    console.log('  Living Arrangements: first option');

    if (data.levelOfAssistance) {
      await this.selectOptionByText(this.selectors.levelOfAssistanceSelect, data.levelOfAssistance);
      console.log(`  Level of Assistance: ${data.levelOfAssistance}`);
    } else {
      await this.selectFirstOption(this.selectors.levelOfAssistanceSelect);
      console.log('  Level of Assistance: first option');
    }

    // Interpreter
    if (data.interpreterAssist) {
      await this.clickRadio(this.selectors.interpreterRadio(data.interpreterAssist));
      console.log(`  Interpreter: ${data.interpreterAssist}`);
    }

    // CPR Preferences
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

    // Code Status
    if (data.codeStatus) {
      await this.selectOptionByText(this.selectors.codeStatusSelect, data.codeStatus);
      console.log(`  Code Status: ${data.codeStatus}`);
    } else {
      await this.selectFirstOption(this.selectors.codeStatusSelect);
      console.log('  Code Status: first option');
    }

    // POLST / MOST
    if (data.polst) {
      await this.clickRadio(this.selectors.polstRadio(data.polst));
      console.log(`  POLST: ${data.polst}`);
    }
    if (data.most) {
      await this.clickRadio(this.selectors.mostRadio(data.most));
      console.log(`  MOST: ${data.most}`);
    }

    // Life-Sustaining Treatments
    if (data.lifeSustainingTreatmentsAsked) {
      await this.clickRadio(this.selectors.lifeSustainingRadio(data.lifeSustainingTreatmentsAsked));
      console.log(`  Life Sustaining Asked: ${data.lifeSustainingTreatmentsAsked}`);
      await this.page.waitForTimeout(500);
    }
    if (data.wantLifeSustainingTreatments) {
      await this.clickRadio(this.selectors.wantLifeSustainingRadio(data.wantLifeSustainingTreatments));
      console.log(`  Want Life Sustaining: ${data.wantLifeSustainingTreatments}`);
    }

    // Hospitalization
    if (data.furtherHospitalizations) {
      await this.clickRadio(this.selectors.hospitalizationRadio(data.furtherHospitalizations));
      console.log(`  Hospitalization Asked: ${data.furtherHospitalizations}`);
      await this.page.waitForTimeout(500);
    }
    if (data.wantfurtherHospitalizations) {
      await this.clickRadio(this.selectors.wantHospitalizationRadio(data.wantfurtherHospitalizations));
      console.log(`  Want Hospitalization: ${data.wantfurtherHospitalizations}`);
    }

    // Spiritual/Existential Concerns — primary question: "Was patient asked?"
    if (data.spiritualConcernsAsk) {
      const primarySelector = this.selectors.haveSpiritualConcernsRadio(data.spiritualConcernsAsk);
      const primaryRadio = this.page.locator(primarySelector);
      // Scroll into view first — spiritual section is often below the fold
      await primaryRadio.scrollIntoViewIfNeeded().catch(() => {});
      await this.page.waitForTimeout(500);
      await this.clickRadio(primarySelector);
      // Verify the click registered
      const checked = await primaryRadio.locator('button').getAttribute('aria-checked').catch(() => 'false');
      console.log(`  Spiritual Concerns Asked: ${data.spiritualConcernsAsk} (aria-checked: ${checked})`);
      await this.page.waitForTimeout(500);
    }
    if (data.haveSpiritualConcerns) {
      // Secondary question — appears after primary = yes
      const secondarySelector = `[data-cy="radio-hasPatientSpiritualConcerns-${data.haveSpiritualConcerns}"]`;
      const secondaryRadio = this.page.locator(secondarySelector);
      await secondaryRadio.scrollIntoViewIfNeeded().catch(() => {});
      await this.page.waitForTimeout(500);
      if (await secondaryRadio.isVisible({ timeout: 3000 }).catch(() => false)) {
        const btn = secondaryRadio.locator('button');
        if (await btn.count() > 0) {
          await btn.click({ force: true });
        } else {
          await secondaryRadio.click({ force: true });
        }
        await this.page.waitForTimeout(300);
        console.log(`  Have Spiritual Concerns: ${data.haveSpiritualConcerns}`);
      } else {
        console.log(`  Have Spiritual Concerns: radio not visible (primary may not have been "yes")`);
      }
    }

    // Imminent Death
    if (data.signsOfImminentDeath) {
      await this.clickRadio(this.selectors.imminentDeathRadio(data.signsOfImminentDeath));
      console.log(`  Signs of Imminent Death: ${data.signsOfImminentDeath}`);
    }

    // Notes (via Notes card add button → category select → description textarea)
    if (data.notes) {
      const notesBtn = this.page.locator(this.selectors.notesAddBtn);
      if (await notesBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await notesBtn.click({ force: true });
        await this.page.waitForTimeout(2000);

        // Category (required) — select first option
        await this.selectFirstOption('[data-cy="select-notesCategory"]');
        console.log('  Notes Category: first option');

        // Description textarea
        const textarea = this.page.locator('page-input-modal ion-textarea textarea');
        if (await textarea.isVisible({ timeout: 3000 }).catch(() => false)) {
          await textarea.click();
          await textarea.pressSequentially(data.notes, { delay: 30 });
          await this.page.waitForTimeout(500);
        }

        // Submit modal
        const submitBtn = this.page.locator('[data-cy="btn-input-modal-submit"]');
        await submitBtn.click();
        await this.page.waitForTimeout(2000);
        console.log(`  Notes: ${data.notes.substring(0, 50)}...`);
      }
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
      furtherHospitalizations: 'yes',
      wantfurtherHospitalizations: 'no',
      spiritualConcernsAsk: 'yesAndDiscussionOccurred',
      signsOfImminentDeath: 'no',
    });
  }
}
