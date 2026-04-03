import { Page } from '@playwright/test';

/**
 * Nutritional & Metabolic Module Page Object
 *
 * Cards: Weight Loss, Isolation, Diet, Tube Feeding, Bolus,
 * Continuous Feeding, Feeding Tube Flush, Diabetes, IV, Other Issues, Notes
 */
export class NutritionalMetabolicModulePage {
  readonly page: Page;

  private readonly selectors = {
    declineToggle: '[data-cy="toggle-declineCard"]',
    priorWeightLossRadio: (answer: string) => `[data-cy="radio-priorWeightLoss-${answer}"]`,
    isolationToggle: '[data-cy="toggle-patientInIsolation"]',
    currentDiet: '[data-cy="select-currentDiet"]',
    tubeFeedingToggle: '[data-cy="toggle-patientReceivingTubeFeeding"]',
    bolusToggle: '[data-cy="toggle-patientReceivesBolus"]',
    continuousFeedingToggle: '[data-cy="toggle-patientReceivesContinuousFeeding"]',
    feedingTubeFlushToggle: '[data-cy="toggle-patientReceivesFeedingTubeFlush"]',
    diabetesToggle: '[data-cy="toggle-patientHasDiabetes"]',
    ivToggle: '[data-cy="toggle-patientHasIv"]',
  };

  constructor(page: Page) {
    this.page = page;
  }

  async fillAllNutritionalMetabolic(): Promise<void> {
    console.log('Filling Nutritional & Metabolic module...');

    const weightLossRadio = this.page.locator(this.selectors.priorWeightLossRadio('no'));
    if (await weightLossRadio.isVisible({ timeout: 2000 }).catch(() => false)) {
      await weightLossRadio.click({ force: true });
      await this.page.waitForTimeout(300);
      console.log('  Prior Weight Loss: No');
    }

    // All toggles remain off (default)
    console.log('  All condition toggles: default (off)');
    console.log('Nutritional & Metabolic module filled');
  }
}
