import { Page } from '@playwright/test';

/**
 * Data interface for Summary module
 */
export interface SummaryData {
  /** Add a Coordination of Care entry */
  addCoordinationOfCare?: boolean;
  /** Description text for coordination of care */
  coordinationDescription?: string;
  /** Add a Narrative entry */
  addNarrative?: boolean;
  /** Narrative text */
  narrativeText?: string;
}

/**
 * Summary Module Page Object
 *
 * Cards: Coordination of Care (modal with Relation, Contact, Via, Description)
 *        Narratives (modal with text)
 */
export class SummaryModulePage {
  readonly page: Page;

  private readonly selectors = {
    // ── Coordination of Care ────────────────────────────────────────
    coordinationAddBtn: '[data-cy="button-coordinationOfCare-add"]',
    coordinationRelation: '[data-cy="select-coordinationRelation"]',
    coordinationContact: '[data-cy="select-coordinationPerson"]',
    coordinationVia: '[data-cy="select-coordinationVia"]',
    coordinationDescription: '[data-cy="input-coordinationDescription"] textarea',

    // ── Narratives ──────────────────────────────────────────────────
    narrativesAddBtn: '#narrativesCardAdd',
    narrativeOrigin: '[data-cy="select-narrativeOrigin"]',
    narrativeCategory: '[data-cy="select-narrativeCategory"]',
    narrativeDescription: '[data-cy="input-narrativeDescription"] textarea',

    // ── Modal buttons ───────────────────────────────────────────────
    modalSubmit: '[data-cy="btn-input-modal-submit"]',
    modalCancel: '[data-cy="btn-input-modal-cancel"]',
  };

  constructor(page: Page) {
    this.page = page;
  }

  private async selectFirstIonOption(selector: string): Promise<void> {
    const el = this.page.locator(selector);
    if (await el.isVisible({ timeout: 2000 }).catch(() => false)) {
      await el.click();
      await this.page.waitForTimeout(1000);
      await this.page.locator('ion-popover.select-popover ion-item').first().click({ force: true });
      await this.page.waitForTimeout(500);
    }
  }

  async fillSummary(data: SummaryData): Promise<void> {
    console.log('Filling Summary module...');

    if (data.addCoordinationOfCare) {
      await this.addCoordinationOfCare(data.coordinationDescription);
    }

    if (data.addNarrative) {
      await this.addNarrative(data.narrativeText);
    }

    console.log('Summary module filled');
  }

  async addCoordinationOfCare(description?: string): Promise<void> {
    // Click add button
    await this.page.locator(this.selectors.coordinationAddBtn).click({ force: true });
    await this.page.waitForTimeout(2000);

    // Wait for modal
    const modalHeader = this.page.locator('[data-cy="label-input-modal-header"]');
    await modalHeader.waitFor({ state: 'visible', timeout: 5000 });
    console.log('  Opened Coordination of Care modal');

    // Relation (required)
    await this.selectFirstIonOption(this.selectors.coordinationRelation);
    console.log('  Relation: first option');

    // Contact (required)
    await this.selectFirstIonOption(this.selectors.coordinationContact);
    console.log('  Contact: first option');

    // Via (required)
    await this.selectFirstIonOption(this.selectors.coordinationVia);
    console.log('  Via: first option');

    // Description (required) — use pressSequentially for Angular
    const descTextarea = this.page.locator(this.selectors.coordinationDescription);
    await descTextarea.waitFor({ state: 'visible', timeout: 3000 });
    await descTextarea.click();
    await descTextarea.pressSequentially(description || 'Coordinated care with family regarding patient plan', { delay: 30 });
    await this.page.waitForTimeout(500);
    console.log(`  Description: ${description || 'Coordinated care with family'}`);

    // Submit
    await this.page.locator(this.selectors.modalSubmit).click();
    await this.page.waitForTimeout(3000);
    console.log('  Coordination of Care submitted');
  }

  async addNarrative(text?: string): Promise<void> {
    // Click narratives add button
    await this.page.locator(this.selectors.narrativesAddBtn).click({ force: true });
    await this.page.waitForTimeout(2000);

    // Wait for modal
    const modalHeader = this.page.locator('[data-cy="label-input-modal-header"]');
    await modalHeader.waitFor({ state: 'visible', timeout: 5000 });
    console.log('  Opened Narratives modal');

    // Origin (required) — select first option
    await this.selectFirstIonOption(this.selectors.narrativeOrigin);
    console.log('  Origin: first option');

    // Category — only enabled for certain Origins; skip if disabled
    await this.page.waitForTimeout(1000);
    const categoryEl = this.page.locator(this.selectors.narrativeCategory);
    const isDisabled = await categoryEl.evaluate(
      (el) => el.classList.contains('select-disabled'),
    ).catch(() => true);
    if (!isDisabled) {
      await this.selectFirstIonOption(this.selectors.narrativeCategory);
      console.log('  Category: first option');
    } else {
      console.log('  Category: disabled for this Origin, skipping');
    }

    // Description (required) — use pressSequentially for Angular
    const descTextarea = this.page.locator(this.selectors.narrativeDescription);
    await descTextarea.waitFor({ state: 'visible', timeout: 3000 });
    await descTextarea.click();
    await descTextarea.pressSequentially(text || 'Patient visit narrative summary', { delay: 30 });
    await this.page.waitForTimeout(500);
    console.log(`  Description: ${text || 'Patient visit narrative summary'}`);

    // Submit
    await this.page.locator(this.selectors.modalSubmit).click();
    await this.page.waitForTimeout(3000);
    console.log('  Narrative submitted');
  }

  /** Convenience: no entries */
  async isCoordinationOfCareVisible(): Promise<boolean> {
    return this.page.locator('[data-cy="label-coordinationOfCare"]')
      .isVisible({ timeout: 5000 }).catch(() => false);
  }
}
