import { Page } from '@playwright/test';

/**
 * Gastrointestinal Module Page Object
 *
 * Cards: Bowel Regimen, Treatments, Bowel Sounds, Most Recent BM,
 * Abdomen, Colostomy, Ileostomy, Vomiting, Nausea, Other Issues, Notes
 */
export class GastrointestinalModulePage {
  readonly page: Page;

  private readonly selectors = {
    bowelRegimenRadio: (answer: string) => `[data-cy="radio-patientHasBowelRegimen-${answer}"]`,
    bmTypeRadio: (answer: string) => `[data-cy="radio-bmType-${answer}"]`,
    abdomenSoft: '[data-cy="checkbox-abdomenStateCheck-soft"]',
    distentionToggle: '[data-cy="toggle-abdominalDistention"]',
    colostomyToggle: '[data-cy="toggle-colostomy"]',
    ileostomyToggle: '[data-cy="toggle-ileostomy"]',
    vomitingToggle: '[data-cy="toggle-vomiting"]',
    nauseaToggle: '[data-cy="toggle-nausea"]',
  };

  constructor(page: Page) {
    this.page = page;
  }

  async fillAllGastrointestinal(): Promise<void> {
    console.log('Filling Gastrointestinal module...');

    const bowelRadio = this.page.locator(this.selectors.bowelRegimenRadio('no'));
    if (await bowelRadio.isVisible({ timeout: 2000 }).catch(() => false)) {
      await bowelRadio.click({ force: true });
      await this.page.waitForTimeout(300);
      console.log('  Bowel Regimen: No');
    }

    const bmRadio = this.page.locator(this.selectors.bmTypeRadio('regular'));
    if (await bmRadio.isVisible({ timeout: 2000 }).catch(() => false)) {
      await bmRadio.click({ force: true });
      await this.page.waitForTimeout(300);
      console.log('  BM Type: Regular');
    }

    const abdomen = this.page.locator(this.selectors.abdomenSoft);
    if (await abdomen.isVisible({ timeout: 2000 }).catch(() => false)) {
      await abdomen.click({ force: true });
      await this.page.waitForTimeout(300);
      console.log('  Abdomen: Soft');
    }

    console.log('  All condition toggles: default (off)');
    console.log('Gastrointestinal module filled');
  }
}
