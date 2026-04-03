import { Page } from '@playwright/test';

/**
 * Preferences Module Page Object
 *
 * Handles all cards in the Preferences assessment module:
 * - Assessment With (checkboxes)
 * - HOPE Diagnosis (radio group + checkboxes)
 * - HOPE Administration (selects + radio)
 * - F2000. HIS - CPR Preference (radio)
 * - Patient preference for CPR (radio + select)
 * - POLST (radio)
 * - MOST (radio)
 * - F2100. Other Life Sustaining Treatments (radio)
 * - F2200. Further Hospitalizations (radio)
 * - F3000. Spiritual/Existential Concerns (radio)
 * - Signs of Imminent Death (checkboxes)
 * - Notes
 */
export class PreferencesModulePage {
  readonly page: Page;

  private readonly selectors = {
    // ── Assessment With Card ────────────────────────────────────────────
    assessmentWithPatient: '[data-cy="checkbox-assessmentWithCheck-patientResponsibleParty"]',
    assessmentWithCaregiver: '[data-cy="checkbox-assessmentWithCheck-caregiver"]',
    assessmentWithFamily: '[data-cy="checkbox-assessmentWithCheck-family"]',

    // ── HOPE Diagnosis Card ─────────────────────────────────────────────
    diagnosisRadio: (option: string) => `[data-cy="radio-principleDiagnosisOptions-${option}"]`,

    // ── HOPE Administration Card ────────────────────────────────────────
    languageSelect: '[data-cy="select-languages"]',
    interpreterRadio: (answer: string) => `[data-cy="radio-interpreterAssist-${answer}"]`,
    livingArrangementsSelect: '[data-cy="select-livingArrangements"]',
    levelOfAssistanceSelect: '[data-cy="select-levelOfAssistance"]',

    // ── F2000. HIS - CPR Preference ─────────────────────────────────────
    cprAskedRadio: (answer: string) => `[data-cy="radio-wasPatientAskedForPreferences-${answer}"]`,

    // ── Patient preference for CPR ──────────────────────────────────────
    understandCprRadio: (answer: string) => `[data-cy="radio-patientUnderstandCpr-${answer}"]`,
    wantCprRadio: (answer: string) => `[data-cy="radio-patientWantCpr-${answer}"]`,
    outOfHospitalDnrRadio: (answer: string) => `[data-cy="radio-outOfHospitalDnr-${answer}"]`,
    codeStatusSelect: '[data-cy="select-codeStatus"]',

    // ── POLST ───────────────────────────────────────────────────────────
    polstRadio: (answer: string) => `[data-cy="radio-patientHasPolst-${answer}"]`,

    // ── MOST ────────────────────────────────────────────────────────────
    mostRadio: (answer: string) => `[data-cy="radio-patientHasMost-${answer}"]`,

    // ── F2100. Other Life Sustaining Treatments ─────────────────────────
    lifeSustainingRadio: (answer: string) =>
      `[data-cy="radio-wasPatientResponsibleAskedAboutLifeSustainingTreatments-${answer}"]`,

    // ── F2200. Further Hospitalizations ─────────────────────────────────
    hospitalizationRadio: (answer: string) =>
      `[data-cy="radio-patientWantFurtherHospitalizations-${answer}"]`,

    // ── F3000. Spiritual/Existential Concerns ───────────────────────────
    spiritualRadio: (answer: string) =>
      `[data-cy="radio-doesPatientReportSpiritualExistentialConcerns-${answer}"]`,
  };

  constructor(page: Page) {
    this.page = page;
  }

  // ── Helper: click a radio by data-cy ──────────────────────────────────
  private async clickRadio(selector: string): Promise<void> {
    await this.page.locator(selector).click({ force: true });
    await this.page.waitForTimeout(300);
  }

  // ── Helper: click a checkbox by data-cy ───────────────────────────────
  private async clickCheckbox(selector: string): Promise<void> {
    await this.page.locator(selector).click({ force: true });
    await this.page.waitForTimeout(300);
  }

  // ── Helper: select first option in ion-select popover ─────────────────
  private async selectFirstOption(selectLocator: string): Promise<void> {
    await this.page.locator(selectLocator).click();
    await this.page.waitForTimeout(1000);
    await this.page.locator('ion-popover.select-popover ion-item').first().click({ force: true });
    await this.page.waitForTimeout(500);
  }

  // ══════════════════════════════════════════════════════════════════════
  // Fill All Preferences (quick path — selects one option per section)
  // ══════════════════════════════════════════════════════════════════════

  async fillAllPreferences(): Promise<void> {
    console.log('Filling Preferences module...');

    // 1. Assessment With — check Patient
    await this.clickCheckbox(this.selectors.assessmentWithPatient);
    console.log('  Assessment With: Patient checked');

    // 2. HOPE Diagnosis — select Cancer
    await this.clickRadio(this.selectors.diagnosisRadio('cancer'));
    console.log('  HOPE Diagnosis: Cancer');

    // 3. HOPE Administration — select first options for dropdowns
    await this.selectFirstOption(this.selectors.livingArrangementsSelect);
    console.log('  Living Arrangements: first option');
    await this.selectFirstOption(this.selectors.levelOfAssistanceSelect);
    console.log('  Level of Assistance: first option');
    await this.clickRadio(this.selectors.interpreterRadio('no'));
    console.log('  Interpreter: No');

    // 4. F2000. HIS - CPR Preference
    await this.clickRadio(this.selectors.cprAskedRadio('yesDiscussionOccurred'));
    console.log('  CPR Asked: Yes and discussion occurred');

    // 5. Patient preference for CPR
    await this.clickRadio(this.selectors.understandCprRadio('yes'));
    console.log('  Understand CPR: Yes');
    await this.clickRadio(this.selectors.wantCprRadio('no'));
    console.log('  Want CPR: No');
    await this.clickRadio(this.selectors.outOfHospitalDnrRadio('yes'));
    console.log('  Out-of-hospital DNR: Yes');
    await this.selectFirstOption(this.selectors.codeStatusSelect);
    console.log('  Code Status: first option');

    // 6. POLST
    await this.clickRadio(this.selectors.polstRadio('no'));
    console.log('  POLST: No');

    // 7. MOST
    await this.clickRadio(this.selectors.mostRadio('no'));
    console.log('  MOST: No');

    // 8. F2100. Other Life Sustaining Treatments
    await this.clickRadio(this.selectors.lifeSustainingRadio('yesAndDiscussed'));
    console.log('  Life Sustaining Treatments Asked: Yes and discussed');

    // 9. F2200. Further Hospitalizations
    const hospRadio = this.page.locator(this.selectors.hospitalizationRadio('no'));
    if (await hospRadio.isVisible({ timeout: 2000 }).catch(() => false)) {
      await this.clickRadio(this.selectors.hospitalizationRadio('no'));
      console.log('  Further Hospitalizations: No');
    }

    // 10. F3000. Spiritual/Existential Concerns
    const spiritRadio = this.page.locator(this.selectors.spiritualRadio('no'));
    if (await spiritRadio.isVisible({ timeout: 2000 }).catch(() => false)) {
      await this.clickRadio(this.selectors.spiritualRadio('no'));
      console.log('  Spiritual Concerns: No');
    }

    console.log('Preferences module filled');
  }
}
