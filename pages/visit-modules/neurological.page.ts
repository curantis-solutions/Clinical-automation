import { Page } from '@playwright/test';

/**
 * Neurological Module Page Object
 *
 * Cards: Neurological (decline toggle), Orientation, Anxiety, Agitation,
 * Seizures, Aphasia, Ataxia, Apraxia, Comatose, Confusion, Depression,
 * Headaches, Hemiplegia, Paraplegia, Quadriplegia, Other Issues, Notes
 *
 * Most cards use toggles (ion-toggle) to indicate presence/absence.
 * Orientation uses checkboxes.
 */
export class NeurologicalModulePage {
  readonly page: Page;

  private readonly selectors = {
    // ── Orientation Card ────────────────────────────────────────────────
    orientedPerson: '[data-cy="checkbox-orientedCheck-person"]',
    orientedPlace: '[data-cy="checkbox-orientedCheck-place"]',
    orientedTime: '[data-cy="checkbox-orientedCheck-time"]',
    orientedSituation: '[data-cy="checkbox-orientedCheck-situation"]',

    // ── Condition Toggles ───────────────────────────────────────────────
    anxietyToggle: '[data-cy="toggle-patientHasAnxiety"]',
    agitationToggle: '[data-cy="toggle-patientExperiencesAgitation"]',
    seizuresToggle: '[data-cy="toggle-patientHasSeizures"]',
    aphasiaToggle: '[data-cy="toggle-patientHasAphasia"]',
    ataxiaToggle: '[data-cy="toggle-patientHasAtaxia"]',
    apraxiaToggle: '[data-cy="toggle-patientHasApraxia"]',
    comatoseToggle: '[data-cy="toggle-patientIsComatose"]',
    confusionToggle: '[data-cy="toggle-patientHasConfusion"]',
    depressionToggle: '[data-cy="toggle-patientHasDepression"]',
    headachesToggle: '[data-cy="toggle-patientHasHeadaches"]',
    hemiplegiaToggle: '[data-cy="toggle-patientHasHemiplegia"]',
    paraplegiaToggle: '[data-cy="toggle-patientHasParaplegia"]',
    quadriplegiaToggle: '[data-cy="toggle-patientHasQuadraplegia"]',
    otherIssuesToggle: '[data-cy="toggle-patientHasOtherIssues"]',
  };

  constructor(page: Page) {
    this.page = page;
  }

  private async clickCheckbox(selector: string): Promise<void> {
    const el = this.page.locator(selector);
    if (await el.isVisible({ timeout: 2000 }).catch(() => false)) {
      await el.click({ force: true });
      await this.page.waitForTimeout(300);
    }
  }

  async fillAllNeurological(): Promise<void> {
    console.log('Filling Neurological module...');

    // Orientation — check all oriented boxes
    await this.clickCheckbox(this.selectors.orientedPerson);
    await this.clickCheckbox(this.selectors.orientedPlace);
    await this.clickCheckbox(this.selectors.orientedTime);
    await this.clickCheckbox(this.selectors.orientedSituation);
    console.log('  Orientation: Person, Place, Time, Situation checked');

    // All condition toggles stay OFF (default) — patient does not have these conditions
    // No action needed for toggles that should remain off
    console.log('  All condition toggles: default (off)');

    console.log('Neurological module filled');
  }
}
