import { Page } from '@playwright/test';

/**
 * Data interface for Gastrointestinal module
 */
/**
 * Data for Vomiting card (expanded when toggle ON)
 */
export interface VomitingData {
  /** Severity score 0-10 (range tick index) */
  severity?: number;
  /** Description of contents text */
  contents?: string;
  /** Frequency numerator */
  frequencyNumerator?: string;
  /** Frequency denominator */
  frequencyDenominator?: string;
  /** Check "Unknown" for date instead of picking */
  dateUnknown?: boolean;
  /** Check "Unknown" for time instead of picking */
  timeUnknown?: boolean;
  /** Amount text */
  amount?: string;
  /** Symptom impact: notImpacted/mildImpact/moderateImpact/severeImpact/patientNotExperiencingTheSymptom */
  symptomImpact?: string;
  /** Impact area checkboxes: intakeOnly, dailyActivities, fatigueWeakness, sleep, concentration, etc. */
  impactAreas?: string[];
  /** Explanation text */
  explanation?: string;
}

/**
 * Data for Nausea card (expanded when toggle ON)
 */
export interface NauseaData {
  /** Score 0-10 (range tick index) */
  score?: number;
  /** Frequency: constant/intermittent */
  frequency?: string;
  /** Symptom impact: notImpacted/mildImpact/moderateImpact/severeImpact/patientNotExperiencingTheSymptom */
  symptomImpact?: string;
  /** Impact area checkboxes */
  impactAreas?: string[];
  /** Explanation text */
  explanation?: string;
}

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
  /** Vomiting card data (fill after toggle ON) */
  vomitingData?: VomitingData;
  /** Nausea card data (fill after toggle ON) */
  nauseaData?: NauseaData;
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

    // ── Vomiting Card (expanded) ────────────────────────────────────
    vomitingCard: '[data-cy="card-header-vomiting"]',
    vomitingSeverityRange: '[data-cy="input-vomitingSeverity-range"]',
    vomitingContents: '[data-cy="input-vomitingContents"]',
    vomitingFreqNumerator: '[data-cy="number-input-vomitingFrequencyNumerator"]',
    vomitingFreqDenominator: '[data-cy="number-input-vomitingFrequencyDenominator"]',
    vomitingFreqUnit: '[data-cy="select-vomitingFrequencyUnit"]',
    vomitingDateUnknown: '[data-cy="checkbox-unknown-vomitingMostRecent-date"]',
    vomitingTimeUnknown: '[data-cy="checkbox-unknown-vomitingMostRecent-time"]',
    vomitingAmount: '[data-cy="input-vomitingAmount"]',

    // ── Nausea Card (expanded) ──────────────────────────────────────
    nauseaCard: '[data-cy="card-header-nausea"]',
    nauseaSeverityRange: '[data-cy="input-nauseaSeverity-range"]',
    nauseaFrequencyRadio: (answer: string) => `[data-cy="radio-nauseaFrequency-${answer}"]`,

    // ── Shared Symptom Impact (scoped by card) ──────────────────────
    symptomImpactRadio: (answer: string) => `[data-cy="radio-rankSymptomImpact-${answer}"]`,
    impactAreaCheckbox: (area: string) => `[data-cy="checkbox-explainSymptomImpactCheck-${area}"]`,
    explanationTextarea: '[data-cy="input-explanation"]',
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
    if (data.vomiting) {
      await this.clickElement(this.selectors.vomitingToggle);
      console.log('  Vomiting: ON');
      await this.page.waitForTimeout(1000);
      if (data.vomitingData) {
        await this.fillVomiting(data.vomitingData);
      }
    }
    if (data.nausea) {
      await this.clickElement(this.selectors.nauseaToggle);
      console.log('  Nausea: ON');
      await this.page.waitForTimeout(1000);
      if (data.nauseaData) {
        await this.fillNausea(data.nauseaData);
      }
    }

    console.log('Gastrointestinal module filled');
  }

  /**
   * Get the card container for scoping selectors to a specific card
   */
  private getCardScope(cardHeaderSelector: string) {
    return this.page.locator(cardHeaderSelector).locator('xpath=ancestor::ion-card');
  }

  /**
   * Set a range slider score by clicking the nth range-tick within a scoped range element
   */
  private async setRangeScore(rangeSelector: string, score: number): Promise<void> {
    const range = this.page.locator(rangeSelector);
    if (await range.isVisible({ timeout: 3000 }).catch(() => false)) {
      // Ticks are 0-indexed: tick at index `score` maps to value `score`
      const tick = range.locator('.range-tick').nth(score);
      if (await tick.isVisible({ timeout: 2000 }).catch(() => false)) {
        await tick.click({ force: true });
        await this.page.waitForTimeout(500);
      }
    }
  }

  async fillVomiting(data: VomitingData): Promise<void> {
    const card = this.getCardScope(this.selectors.vomitingCard);

    // Severity range (0-10)
    if (data.severity !== undefined) {
      await this.setRangeScore(this.selectors.vomitingSeverityRange, data.severity);
      console.log(`  Vomiting Severity: ${data.severity}`);
    }

    // Description of contents
    if (data.contents) {
      const textarea = card.locator(this.selectors.vomitingContents);
      if (await textarea.isVisible({ timeout: 2000 }).catch(() => false)) {
        await textarea.click();
        await textarea.pressSequentially(data.contents, { delay: 30 });
        console.log(`  Vomiting Contents: ${data.contents}`);
      }
    }

    // Frequency numerator/denominator
    if (data.frequencyNumerator) {
      const input = this.page.locator(this.selectors.vomitingFreqNumerator);
      if (await input.isVisible({ timeout: 2000 }).catch(() => false)) {
        await input.click({ clickCount: 3 });
        await this.page.keyboard.press('Backspace');
        await input.pressSequentially(data.frequencyNumerator, { delay: 50 });
      }
    }
    if (data.frequencyDenominator) {
      const input = this.page.locator(this.selectors.vomitingFreqDenominator);
      if (await input.isVisible({ timeout: 2000 }).catch(() => false)) {
        await input.click({ clickCount: 3 });
        await this.page.keyboard.press('Backspace');
        await input.pressSequentially(data.frequencyDenominator, { delay: 50 });
      }
    }
    if (data.frequencyNumerator || data.frequencyDenominator) {
      // Select first frequency unit
      await this.selectFirstIonOption(this.selectors.vomitingFreqUnit);
      console.log(`  Vomiting Frequency: ${data.frequencyNumerator || ''}x per ${data.frequencyDenominator || ''}`);
    }

    // Date/Time unknown checkboxes
    if (data.dateUnknown) {
      await this.clickElement(this.selectors.vomitingDateUnknown);
      console.log('  Vomiting Date: Unknown');
    }
    if (data.timeUnknown) {
      await this.clickElement(this.selectors.vomitingTimeUnknown);
      console.log('  Vomiting Time: Unknown');
    }

    // Amount
    if (data.amount) {
      const input = card.locator(this.selectors.vomitingAmount);
      if (await input.isVisible({ timeout: 2000 }).catch(() => false)) {
        await input.click();
        await input.pressSequentially(data.amount, { delay: 30 });
        console.log(`  Vomiting Amount: ${data.amount}`);
      }
    }

    // Symptom Impact — scoped to vomiting card
    if (data.symptomImpact) {
      const radio = card.locator(this.selectors.symptomImpactRadio(data.symptomImpact));
      const item = radio.locator('xpath=ancestor::ion-item');
      await item.click({ force: true });
      await this.page.waitForTimeout(500);
      console.log(`  Vomiting Symptom Impact: ${data.symptomImpact}`);
    }

    // Impact areas — scoped to vomiting card
    if (data.impactAreas) {
      for (const area of data.impactAreas) {
        const cb = card.locator(this.selectors.impactAreaCheckbox(area));
        const item = cb.locator('xpath=ancestor::ion-item');
        if (await item.isVisible({ timeout: 2000 }).catch(() => false)) {
          await item.click({ force: true });
          await this.page.waitForTimeout(300);
        }
      }
      console.log(`  Vomiting Impact Areas: ${data.impactAreas.join(', ')}`);
    }

    // Explanation — scoped to vomiting card
    if (data.explanation) {
      const textarea = card.locator(this.selectors.explanationTextarea);
      if (await textarea.isVisible({ timeout: 2000 }).catch(() => false)) {
        await textarea.click();
        await textarea.pressSequentially(data.explanation, { delay: 30 });
        console.log(`  Vomiting Explanation: ${data.explanation}`);
      }
    }
  }

  async fillNausea(data: NauseaData): Promise<void> {
    const card = this.getCardScope(this.selectors.nauseaCard);

    // Score range (0-10)
    if (data.score !== undefined) {
      await this.setRangeScore(this.selectors.nauseaSeverityRange, data.score);
      console.log(`  Nausea Score: ${data.score}`);
    }

    // Frequency (constant/intermittent)
    if (data.frequency) {
      const radio = card.locator(this.selectors.nauseaFrequencyRadio(data.frequency));
      const item = radio.locator('xpath=ancestor::ion-item');
      await item.click({ force: true });
      await this.page.waitForTimeout(500);
      console.log(`  Nausea Frequency: ${data.frequency}`);
    }

    // Symptom Impact — scoped to nausea card
    if (data.symptomImpact) {
      const radio = card.locator(this.selectors.symptomImpactRadio(data.symptomImpact));
      const item = radio.locator('xpath=ancestor::ion-item');
      await item.click({ force: true });
      await this.page.waitForTimeout(500);
      console.log(`  Nausea Symptom Impact: ${data.symptomImpact}`);
    }

    // Impact areas — scoped to nausea card
    if (data.impactAreas) {
      for (const area of data.impactAreas) {
        const cb = card.locator(this.selectors.impactAreaCheckbox(area));
        const item = cb.locator('xpath=ancestor::ion-item');
        if (await item.isVisible({ timeout: 2000 }).catch(() => false)) {
          await item.click({ force: true });
          await this.page.waitForTimeout(300);
        }
      }
      console.log(`  Nausea Impact Areas: ${data.impactAreas.join(', ')}`);
    }

    // Explanation — scoped to nausea card
    if (data.explanation) {
      const textarea = card.locator(this.selectors.explanationTextarea);
      if (await textarea.isVisible({ timeout: 2000 }).catch(() => false)) {
        await textarea.click();
        await textarea.pressSequentially(data.explanation, { delay: 30 });
        console.log(`  Nausea Explanation: ${data.explanation}`);
      }
    }
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
