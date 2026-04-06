import { Page } from '@playwright/test';

/**
 * Data interface for Neurological module
 */
export interface NeurologicalData {
  // Orientation — which items to check
  oriented?: ('person' | 'place' | 'time' | 'situation')[];
  disoriented?: ('person' | 'place' | 'time' | 'situation')[];

  // Condition toggles — which to turn ON
  // When turned on, reveals: score range, symptom impact radio, impact checkboxes, explanation
  conditions?: {
    anxiety?: SymptomConditionData;
    agitation?: SymptomConditionData;
    seizures?: SymptomConditionData;
    aphasia?: SymptomConditionData;
    ataxia?: SymptomConditionData;
    apraxia?: SymptomConditionData;
    comatose?: SymptomConditionData;
    confusion?: SymptomConditionData;
    depression?: SymptomConditionData;
    headaches?: SymptomConditionData;
    hemiplegia?: SymptomConditionData;
    paraplegia?: SymptomConditionData;
    quadriplegia?: SymptomConditionData;
    otherIssues?: SymptomConditionData;
  };
}

export interface SymptomConditionData {
  /** Symptom impact: notImpacted, mildImpact, moderateImpact, severeImpact, patientNotExperiencingTheSymptom */
  symptomImpact?: string;
  /** Impact area checkboxes to select */
  impactAreas?: string[];
  /** Explanation text */
  explanation?: string;
}

/**
 * Neurological Module Page Object
 *
 * Cards: Neurological (decline toggle), Orientation, Anxiety, Agitation,
 * Seizures, Aphasia, Ataxia, Apraxia, Comatose, Confusion, Depression,
 * Headaches, Hemiplegia, Paraplegia, Quadriplegia, Other Issues, Notes
 */
export class NeurologicalModulePage {
  readonly page: Page;

  private readonly selectors = {
    // ── Orientation Card ────────────────────────────────────────────────
    orientedCheckbox: (item: string) => `[data-cy="checkbox-orientedCheck-${item}"]`,
    disorientedCheckbox: (item: string) => `[data-cy="checkbox-disorientedCheck-${item}"]`,
    unableToAssessOriented: '[data-cy="checkbox-unableToAssessOrientedCheck-unableToAssess"]',
    unableToAssessDisoriented: '[data-cy="checkbox-unableToAssessDisorientedCheck-unableToAssess"]',

    // ── Condition Toggles ───────────────────────────────────────────────
    toggleMap: {
      anxiety: '[data-cy="toggle-patientHasAnxiety"]',
      agitation: '[data-cy="toggle-patientExperiencesAgitation"]',
      seizures: '[data-cy="toggle-patientHasSeizures"]',
      aphasia: '[data-cy="toggle-patientHasAphasia"]',
      ataxia: '[data-cy="toggle-patientHasAtaxia"]',
      apraxia: '[data-cy="toggle-patientHasApraxia"]',
      comatose: '[data-cy="toggle-patientIsComatose"]',
      confusion: '[data-cy="toggle-patientHasConfusion"]',
      depression: '[data-cy="toggle-patientHasDepression"]',
      headaches: '[data-cy="toggle-patientHasHeadaches"]',
      hemiplegia: '[data-cy="toggle-patientHasHemiplegia"]',
      paraplegia: '[data-cy="toggle-patientHasParaplegia"]',
      quadriplegia: '[data-cy="toggle-patientHasQuadraplegia"]',
      otherIssues: '[data-cy="toggle-patientHasOtherIssues"]',
    } as Record<string, string>,

    // ── Symptom Impact (shared across all condition cards when toggle is ON) ──
    symptomImpactRadio: (impact: string) => `[data-cy="radio-rankSymptomImpact-${impact}"]`,
    impactAreaCheckbox: (area: string) => `[data-cy="checkbox-explainSymptomImpactCheck-${area}"]`,
    explanationTextarea: '[data-cy="input-explanation"] textarea',
  };

  constructor(page: Page) {
    this.page = page;
  }

  private async clickElement(selector: string): Promise<void> {
    const el = this.page.locator(selector);
    if (await el.isVisible({ timeout: 2000 }).catch(() => false)) {
      await el.scrollIntoViewIfNeeded();
      await el.click({ force: true });
      await this.page.waitForTimeout(300);
    }
  }

  private async turnOnToggle(selector: string): Promise<void> {
    const toggle = this.page.locator(selector);
    await toggle.scrollIntoViewIfNeeded();
    await toggle.click({ force: true });
    await this.page.waitForTimeout(500);
  }

  /**
   * Fill the symptom impact fields revealed after a toggle is turned ON.
   * The radio/checkbox selectors are shared — they appear inside the card
   * that was just expanded, so we scope to the nearest visible one.
   */
  private async fillSymptomCondition(
    conditionName: string,
    toggleSelector: string,
    data: SymptomConditionData
  ): Promise<void> {
    // Turn on the toggle
    await this.turnOnToggle(toggleSelector);
    console.log(`  ${conditionName}: toggle ON`);

    // Select symptom impact radio (scoped to the card)
    if (data.symptomImpact) {
      // Find the card containing this toggle and scope the radio
      const card = this.page.locator(toggleSelector).locator('xpath=ancestor::ion-card');
      const radio = card.locator(this.selectors.symptomImpactRadio(data.symptomImpact));
      if (await radio.isVisible({ timeout: 2000 }).catch(() => false)) {
        await radio.click({ force: true });
        await this.page.waitForTimeout(300);
        console.log(`    Symptom Impact: ${data.symptomImpact}`);
      }
    }

    // Check impact area checkboxes
    if (data.impactAreas) {
      const card = this.page.locator(toggleSelector).locator('xpath=ancestor::ion-card');
      for (const area of data.impactAreas) {
        const checkbox = card.locator(this.selectors.impactAreaCheckbox(area));
        if (await checkbox.isVisible({ timeout: 1000 }).catch(() => false)) {
          await checkbox.click({ force: true });
          await this.page.waitForTimeout(200);
        }
      }
      console.log(`    Impact Areas: ${data.impactAreas.join(', ')}`);
    }

    // Fill explanation
    if (data.explanation) {
      const card = this.page.locator(toggleSelector).locator('xpath=ancestor::ion-card');
      const textarea = card.locator(this.selectors.explanationTextarea);
      if (await textarea.isVisible({ timeout: 1000 }).catch(() => false)) {
        await textarea.fill(data.explanation);
        console.log(`    Explanation: ${data.explanation}`);
      }
    }
  }

  /**
   * Fill the Neurological module with parameterized data.
   */
  async fillNeurological(data: NeurologicalData): Promise<void> {
    console.log('Filling Neurological module...');

    // Orientation
    if (data.oriented) {
      for (const item of data.oriented) {
        await this.clickElement(this.selectors.orientedCheckbox(item));
      }
      console.log(`  Oriented: ${data.oriented.join(', ')}`);
    }

    if (data.disoriented) {
      for (const item of data.disoriented) {
        await this.clickElement(this.selectors.disorientedCheckbox(item));
      }
      console.log(`  Disoriented: ${data.disoriented.join(', ')}`);
    }

    // Conditions — turn on toggles and fill revealed fields
    if (data.conditions) {
      for (const [condName, condData] of Object.entries(data.conditions)) {
        const toggleSelector = this.selectors.toggleMap[condName];
        if (toggleSelector && condData) {
          await this.fillSymptomCondition(condName, toggleSelector, condData);
        }
      }
    }

    console.log('Neurological module filled');
  }

  /**
   * Convenience: fill with defaults (oriented x4, no conditions)
   */
  async fillAllNeurological(): Promise<void> {
    await this.fillNeurological({
      oriented: ['person', 'place', 'time', 'situation'],
    });
  }
}
