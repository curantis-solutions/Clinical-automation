import { Page } from '@playwright/test';

/**
 * Data interface for Pain module
 */
export interface PainData {
  /** Has neuropathic pain: yes/no */
  neuropathicPain?: string;
  /** Currently experiencing pain: yes/no */
  experiencingPain?: string;
  /** Symptom impact: notImpacted, mildImpact, moderateImpact, severeImpact, patientNotExperiencingTheSymptom */
  symptomImpact?: string;
  /** Impact area checkboxes */
  impactAreas?: string[];
  /** Active pain: yes/no */
  activePain?: string;
  /** Was comprehensive pain assessment done: yes/no */
  painAssessmentDone?: string;
  /** Scheduled opioid: yes/no */
  scheduledOpioid?: string;
  /** PRN opioid: yes/no */
  prnOpioid?: string;
}

/**
 * Pain Module Page Object
 *
 * Cards: Pain Assessment, Active Pain, Comprehensive Pain Assessment, Opioid Administration, Notes
 */
export class PainModulePage {
  readonly page: Page;

  private readonly selectors = {
    neuropathicPainRadio: (answer: string) => `[data-cy="radio-patientHasNeuropathicPain-${answer}"]`,
    experiencingPainRadio: (answer: string) => `[data-cy="radio-experiencingPainQuestion-${answer}"]`,
    symptomImpactRadio: (answer: string) => `[data-cy="radio-rankSymptomImpact-${answer}"]`,
    impactAreaCheckbox: (area: string) => `[data-cy="checkbox-explainSymptomImpactCheck-${area}"]`,
    activePainRadio: (answer: string) => `[data-cy="radio-activePainWith-${answer}"]`,
    painAssessmentDoneRadio: (answer: string) => `[data-cy="radio-wasPainDoneQuestion-${answer}"]`,
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

  async fillPain(data: PainData): Promise<void> {
    console.log('Filling Pain module...');

    if (data.neuropathicPain) {
      await this.clickRadio(this.selectors.neuropathicPainRadio(data.neuropathicPain));
      console.log(`  Neuropathic Pain: ${data.neuropathicPain}`);
    }

    if (data.experiencingPain) {
      await this.clickRadio(this.selectors.experiencingPainRadio(data.experiencingPain));
      console.log(`  Experiencing Pain: ${data.experiencingPain}`);
    }

    if (data.symptomImpact) {
      await this.clickRadio(this.selectors.symptomImpactRadio(data.symptomImpact));
      console.log(`  Symptom Impact: ${data.symptomImpact}`);
    }

    if (data.impactAreas) {
      for (const area of data.impactAreas) {
        const checkbox = this.page.locator(this.selectors.impactAreaCheckbox(area));
        if (await checkbox.isVisible({ timeout: 1000 }).catch(() => false)) {
          await checkbox.click({ force: true });
          await this.page.waitForTimeout(200);
        }
      }
      console.log(`  Impact Areas: ${data.impactAreas.join(', ')}`);
    }

    if (data.activePain) {
      await this.clickRadio(this.selectors.activePainRadio(data.activePain));
      console.log(`  Active Pain: ${data.activePain}`);
    }

    if (data.painAssessmentDone) {
      await this.clickRadio(this.selectors.painAssessmentDoneRadio(data.painAssessmentDone));
      console.log(`  Pain Assessment Done: ${data.painAssessmentDone}`);
    }

    if (data.scheduledOpioid) {
      await this.clickRadio(this.selectors.scheduledOpioidRadio(data.scheduledOpioid));
      console.log(`  Scheduled Opioid: ${data.scheduledOpioid}`);
    }

    if (data.prnOpioid) {
      await this.clickRadio(this.selectors.prnOpioidRadio(data.prnOpioid));
      console.log(`  PRN Opioid: ${data.prnOpioid}`);
    }

    console.log('Pain module filled');
  }

  /** Convenience: fill with defaults (no pain, no opioids) */
  async fillAllPain(): Promise<void> {
    await this.fillPain({
      neuropathicPain: 'no',
      experiencingPain: 'no',
      symptomImpact: 'patientNotExperiencingTheSymptom',
      activePain: 'no',
      painAssessmentDone: 'no',
      scheduledOpioid: 'no',
      prnOpioid: 'no',
    });
  }
}
