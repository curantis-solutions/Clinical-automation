import { Page } from '@playwright/test';

/**
 * Pain Module Page Object
 *
 * Cards: Pain Assessment, Active Pain, Comprehensive Pain Assessment, Opioid Administration, Notes
 */
export class PainModulePage {
  readonly page: Page;

  private readonly selectors = {
    // ── Pain Assessment Card ────────────────────────────────────────────
    neuropathicPainRadio: (answer: string) => `[data-cy="radio-patientHasNeuropathicPain-${answer}"]`,
    experiencingPainRadio: (answer: string) => `[data-cy="radio-experiencingPainQuestion-${answer}"]`,
    symptomImpactRadio: (answer: string) => `[data-cy="radio-rankSymptomImpact-${answer}"]`,

    // ── Active Pain Card ────────────────────────────────────────────────
    activePainRadio: (answer: string) => `[data-cy="radio-activePainWith-${answer}"]`,

    // ── Comprehensive Pain Assessment Card ───────────────────────────────
    painAssessmentDoneRadio: (answer: string) => `[data-cy="radio-wasPainDoneQuestion-${answer}"]`,

    // ── Opioid Administration Card ──────────────────────────────────────
    scheduledOpioidRadio: (answer: string) => `[data-cy="radio-scheduledOpioidInitiatedOrContinued-${answer}"]`,
    prnOpioidRadio: (answer: string) => `[data-cy="radio-prnOpioidInitiatedOrContinued-${answer}"]`,
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

  async fillAllPain(): Promise<void> {
    console.log('Filling Pain module...');

    // Pain Assessment
    await this.clickRadio(this.selectors.neuropathicPainRadio('no'));
    console.log('  Neuropathic Pain: No');

    await this.clickRadio(this.selectors.experiencingPainRadio('no'));
    console.log('  Experiencing Pain: No');

    await this.clickRadio(this.selectors.symptomImpactRadio('patientNotExperiencingTheSymptom'));
    console.log('  Symptom Impact: Not experiencing');

    // Active Pain
    await this.clickRadio(this.selectors.activePainRadio('no'));
    console.log('  Active Pain: No');

    // Comprehensive Pain Assessment
    await this.clickRadio(this.selectors.painAssessmentDoneRadio('no'));
    console.log('  Pain Assessment Done: No');

    // Opioid Administration
    await this.clickRadio(this.selectors.scheduledOpioidRadio('no'));
    console.log('  Scheduled Opioid: No');

    await this.clickRadio(this.selectors.prnOpioidRadio('no'));
    console.log('  PRN Opioid: No');

    console.log('Pain module filled');
  }
}
