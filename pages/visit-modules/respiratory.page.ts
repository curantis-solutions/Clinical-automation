import { Page } from '@playwright/test';

/**
 * Respiratory Module Page Object
 *
 * Cards: Respiratory Rate, Breath Sounds, Shortness of Breath, Cough,
 * Respiratory Infection, O2 Saturation, Mechanical Support (APAP/CPAP/BiLevel),
 * Ventilatory Support, Breathing Treatment, Apnea, Other Issues, Notes
 */
export class RespiratoryModulePage {
  readonly page: Page;

  private readonly selectors = {
    // ── Breath Sounds ───────────────────────────────────────────────────
    leftUpperSounds: '[data-cy="select-leftUpperSounds"]',
    leftLowerSounds: '[data-cy="select-leftLowerSounds"]',
    breathSoundsSameToggle: '[data-cy="toggle-breathSoundsSame"]',
    rightUpperSounds: '[data-cy="select-rightUpperSounds"]',
    rightMiddleSounds: '[data-cy="select-rightMiddleSounds"]',
    rightLowerSounds: '[data-cy="select-rightLowerSounds"]',

    // ── Shortness of Breath ─────────────────────────────────────────────
    sobScreeningRadio: (answer: string) => `[data-cy="radio-shortnessOfBreathScreening-${answer}"]`,
    sobNowRadio: (answer: string) => `[data-cy="radio-shortnessOfBreathNow-${answer}"]`,
    treatmentInitiatedRadio: (answer: string) => `[data-cy="radio-treatmentInitiated-${answer}"]`,

    // ── Cough ───────────────────────────────────────────────────────────
    coughToggle: '[data-cy="toggle-patientCough"]',

    // ── Respiratory Infection ────────────────────────────────────────────
    uriToggle: '[data-cy="toggle-upperRespiratoryInfection"]',
    pneumoniaToggle: '[data-cy="toggle-pneumonia"]',
    pneumoniaVaccineToggle: '[data-cy="toggle-pneumoniaVaccine"]',

    // ── O2 Saturation ───────────────────────────────────────────────────
    oxygenRadio: (answer: string) => `[data-cy="radio-patientOnOxygen-${answer}"]`,
    o2Saturation: '[data-cy="number-input-o2saturation"] input',

    // ── Mechanical Support Toggles ──────────────────────────────────────
    apapToggle: '[data-cy="toggle-hasApap"]',
    cpapToggle: '[data-cy="toggle-hasCpap"]',
    biLevelToggle: '[data-cy="toggle-hasBiLevelBiPapVpap"]',
    ventSupportToggle: '[data-cy="toggle-hasVentilatorySupport"]',
    nebuliserToggle: '[data-cy="toggle-hasBreathingTreatmentNebulizer"]',
    apneaToggle: '[data-cy="toggle-hasApnea"]',
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

  async fillAllRespiratory(): Promise<void> {
    console.log('Filling Respiratory module...');

    // Shortness of Breath screening
    await this.clickRadio(this.selectors.sobScreeningRadio('no'));
    console.log('  SOB Screening: No');

    // O2 — room air
    await this.clickRadio(this.selectors.oxygenRadio('noRoomAir'));
    console.log('  O2: Room Air');

    // All toggles remain off (default)
    console.log('  All condition toggles: default (off)');
    console.log('Respiratory module filled');
  }
}
