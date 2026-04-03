import { Page } from '@playwright/test';

/**
 * Symptom Summary Module Page Object
 *
 * Read-only module that displays a summary of symptom impacts across all modules.
 * Card: Symptom Impact Summary (card-header-symptomImpactSummary)
 *
 * No form fields to fill — this is a display/verification page.
 */
export class SymptomSummaryModulePage {
  readonly page: Page;

  private readonly selectors = {
    symptomImpactSummaryCard: '[data-cy="card-header-symptomImpactSummary"]',
  };

  constructor(page: Page) {
    this.page = page;
  }

  async isSymptomImpactSummaryVisible(): Promise<boolean> {
    return this.page.locator(this.selectors.symptomImpactSummaryCard)
      .isVisible({ timeout: 5000 }).catch(() => false);
  }

  async getSymptomImpactSummaryText(): Promise<string> {
    const card = this.page.locator(this.selectors.symptomImpactSummaryCard).locator('..');
    return (await card.textContent())?.trim() ?? '';
  }
}
