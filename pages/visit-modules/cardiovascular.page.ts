import { Page } from '@playwright/test';

/**
 * Cardiovascular Module Page Object
 *
 * Cards: Cardiovascular (decline), Blood Pressure, Pulse, Capillary Refill,
 * Edema, Ejection Fraction, History of MI, Heart Failure History,
 * Pacemaker, Defibrillator, Risk for Arrest, Arrhythmias, Other Issues, Notes
 */
export class CardiovascularModulePage {
  readonly page: Page;

  private readonly selectors = {
    declineToggle: '[data-cy="toggle-declineCard"]',

    // ── Capillary Refill ────────────────────────────────────────────────
    capillaryRefillRadio: (answer: string) => `[data-cy="radio-capillaryRefill-${answer}"]`,

    // ── Ejection Fraction ───────────────────────────────────────────────
    ejectionFraction: '[data-cy="number-input-ejectionFractionRange"] input',
    ejectionFractionUnknown: '[data-cy="checkbox-ejectionFractionUnknownCheck-unknown"]',

    // ── Toggles ─────────────────────────────────────────────────────────
    historyOfMIToggle: '[data-cy="toggle-patientHasHistoryOfMI"]',
    heartFailureToggle: '[data-cy="toggle-patientHasHistoryOfHeartFailure"]',
    pacemakerToggle: '[data-cy="toggle-hasPacemaker"]',
    defibrillatorToggle: '[data-cy="toggle-hasDefibrillator"]',
    riskArrestToggle: '[data-cy="toggle-atRiskForCardiopulmonaryArrest"]',
    arrhythmiasToggle: '[data-cy="toggle-patientHasArrhythmias"]',
  };

  constructor(page: Page) {
    this.page = page;
  }

  async fillAllCardiovascular(): Promise<void> {
    console.log('Filling Cardiovascular module...');

    // Capillary Refill
    const refillRadio = this.page.locator(this.selectors.capillaryRefillRadio('twoSecond'));
    if (await refillRadio.isVisible({ timeout: 2000 }).catch(() => false)) {
      await refillRadio.click({ force: true });
      await this.page.waitForTimeout(300);
      console.log('  Capillary Refill: 2 seconds');
    }

    // Ejection Fraction — check unknown
    const efUnknown = this.page.locator(this.selectors.ejectionFractionUnknown);
    if (await efUnknown.isVisible({ timeout: 2000 }).catch(() => false)) {
      await efUnknown.click({ force: true });
      await this.page.waitForTimeout(300);
      console.log('  Ejection Fraction: Unknown');
    }

    // All toggles remain off (default)
    console.log('  All condition toggles: default (off)');
    console.log('Cardiovascular module filled');
  }
}
