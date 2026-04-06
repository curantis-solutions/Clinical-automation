import { Page } from '@playwright/test';

/**
 * Data interface for Gastrointestinal module
 */
export interface GastrointestinalData {
  /** Bowel regimen: yes/no/patientDeclinedTreatment */
  bowelRegimen?: string;
  /** Treatment checkboxes (when bowelRegimen=yes): enema, increasedFiber, laxatives, prescriptiveMedication, suppositories */
  treatments?: string[];
  /** BM type: regular/irregular */
  bmType?: string;
  /** BM irregular type (when bmType=irregular): diarrhea/constipation */
  bmIrregular?: string;
  /** Abdomen state checkboxes: largeAndExtendsOutward, hardBoardLike, soft, flabby, flat, hurtsWhenTouched, rounded, presenceOfRash */
  abdomenState?: string[];
  /** Condition toggles */
  distention?: boolean;
  colostomy?: boolean;
  ileostomy?: boolean;
  vomiting?: boolean;
  nausea?: boolean;
}

/**
 * Gastrointestinal Module Page Object
 */
export class GastrointestinalModulePage {
  readonly page: Page;

  private readonly selectors = {
    // ── Bowel Regimen ────────────────────────────────────────────────
    bowelRegimenRadio: (answer: string) => `[data-cy="radio-patientHasBowelRegimen-${answer}"]`,
    treatmentCheckbox: (type: string) => `[data-cy="checkbox-treatmentsCheck-${type}"]`,

    // ── Bowel Sounds ────────────────────────────────────────────────
    bowelSoundsLeftUpper: '[data-cy="select-bowelSoundsLeftUpper"]',
    bowelSoundsLeftLower: '[data-cy="select-bowelSoundsLeftLower"]',
    bowelSoundsRightUpper: '[data-cy="select-bowelSoundsRightUpper"]',
    bowelSoundsRightLower: '[data-cy="select-bowelSoundsRightLower"]',

    // ── Most Recent BM ──────────────────────────────────────────────
    bmTypeRadio: (answer: string) => `[data-cy="radio-bmType-${answer}"]`,
    bmIrregularRadio: (answer: string) => `[data-cy="radio-bmIrregular-${answer}"]`,
    bmConsistency: '[data-cy="select-bmConsistency"]',
    bmAmount: '[data-cy="select-bmAmount"]',
    bmColor: '[data-cy="select-bmColor"]',
    bmFrequencyUnit: '[data-cy="select-bmFrequencyUnit"]',

    // ── Abdomen ─────────────────────────────────────────────────────
    abdomenCheckbox: (state: string) => `[data-cy="checkbox-abdomenStateCheck-${state}"]`,

    // ── Condition Toggles ───────────────────────────────────────────
    distentionToggle: '[data-cy="toggle-abdominalDistention"]',
    colostomyToggle: '[data-cy="toggle-colostomy"]',
    ileostomyToggle: '[data-cy="toggle-ileostomy"]',
    vomitingToggle: '[data-cy="toggle-vomiting"]',
    nauseaToggle: '[data-cy="toggle-nausea"]',
  };

  constructor(page: Page) {
    this.page = page;
  }

  private async clickElement(selector: string): Promise<void> {
    const el = this.page.locator(selector);
    if (await el.isVisible({ timeout: 2000 }).catch(() => false)) {
      const selfDisabled = await el.getAttribute('aria-disabled').catch(() => null);
      if (selfDisabled === 'true') return;
      const btnDisabled = await el.locator('button[aria-disabled="true"]').count().catch(() => 0);
      if (btnDisabled > 0) return;
      await el.scrollIntoViewIfNeeded();
      await el.click({ force: true });
      await this.page.waitForTimeout(300);
    }
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

  async fillGastrointestinal(data: GastrointestinalData): Promise<void> {
    console.log('Filling Gastrointestinal module...');

    // Bowel Regimen
    if (data.bowelRegimen) {
      await this.clickElement(this.selectors.bowelRegimenRadio(data.bowelRegimen));
      console.log(`  Bowel Regimen: ${data.bowelRegimen}`);

      // Treatments (enabled when bowelRegimen=yes)
      if (data.bowelRegimen === 'yes' && data.treatments) {
        await this.page.waitForTimeout(500);
        for (const t of data.treatments) {
          await this.clickElement(this.selectors.treatmentCheckbox(t));
        }
        console.log(`  Treatments: ${data.treatments.join(', ')}`);
      }
    }

    // BM Type
    if (data.bmType) {
      await this.clickElement(this.selectors.bmTypeRadio(data.bmType));
      console.log(`  BM Type: ${data.bmType}`);

      // BM Irregular type (when irregular)
      if (data.bmType === 'irregular' && data.bmIrregular) {
        await this.page.waitForTimeout(500);
        await this.clickElement(this.selectors.bmIrregularRadio(data.bmIrregular));
        console.log(`  BM Irregular: ${data.bmIrregular}`);
      }

      // BM details selects (consistency, amount, color)
      await this.selectFirstIonOption(this.selectors.bmConsistency);
      console.log('  BM Consistency: first option');
      await this.selectFirstIonOption(this.selectors.bmAmount);
      console.log('  BM Amount: first option');
      await this.selectFirstIonOption(this.selectors.bmColor);
      console.log('  BM Color: first option');
    }

    // Abdomen
    if (data.abdomenState) {
      for (const state of data.abdomenState) {
        await this.clickElement(this.selectors.abdomenCheckbox(state));
      }
      console.log(`  Abdomen: ${data.abdomenState.join(', ')}`);
    }

    // Condition toggles
    if (data.distention) { await this.clickElement(this.selectors.distentionToggle); console.log('  Distention: ON'); }
    if (data.colostomy) { await this.clickElement(this.selectors.colostomyToggle); console.log('  Colostomy: ON'); }
    if (data.ileostomy) { await this.clickElement(this.selectors.ileostomyToggle); console.log('  Ileostomy: ON'); }
    if (data.vomiting) { await this.clickElement(this.selectors.vomitingToggle); console.log('  Vomiting: ON'); }
    if (data.nausea) { await this.clickElement(this.selectors.nauseaToggle); console.log('  Nausea: ON'); }

    console.log('Gastrointestinal module filled');
  }

  /** Convenience: fill with defaults */
  async fillAllGastrointestinal(): Promise<void> {
    await this.fillGastrointestinal({
      bowelRegimen: 'no',
      bmType: 'regular',
      abdomenState: ['soft'],
    });
  }
}
