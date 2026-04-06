import { Page } from '@playwright/test';

/**
 * Data interface for Respiratory module
 */
export interface RespiratoryData {
  // ── Breath Sounds ─────────────────────────────────────────────────
  /** Breath sounds same as bilateral toggle */
  breathSoundsSame?: boolean;

  // ── Shortness of Breath (J2030/J2040) ─────────────────────────────
  /** SOB screening: yes/no */
  sobScreening?: string;
  /** SOB right now: yes/no (appears when screening=yes) */
  sobNow?: string;
  /** Treatment initiated: yes/patientDecline/no (appears when screening=yes) */
  treatmentInitiated?: string;
  /** Treatment types: opioids, otherMedications, oxygen, nonMedications */
  treatmentTypes?: string[];
  /** Symptom impact: notImpacted, mildImpact, moderateImpact, severeImpact, patientNotExperiencingTheSymptom */
  symptomImpact?: string;
  /** Impact areas: intakeOnly, dailyActivities, fatigueWeakness, sleep, concentration, cognitiveImpairment, abilityToInteract, emotionalDistress, spiritualDistress */
  impactAreas?: string[];
  /** Explanation text */
  explanation?: string;

  // ── Cough ─────────────────────────────────────────────────────────
  /** Enable cough toggle */
  cough?: boolean;

  // ── Respiratory Infection ─────────────────────────────────────────
  /** Enable URI toggle */
  uri?: boolean;
  /** Enable pneumonia toggle */
  pneumonia?: boolean;

  // ── O2 Saturation ─────────────────────────────────────────────────
  /** Patient on oxygen: yesInitiated, yesContinued, noRoomAir */
  patientOnOxygen?: string;
  /** O2 saturation value */
  o2Saturation?: string;

  // ── Mechanical Support Toggles ────────────────────────────────────
  apap?: boolean;
  cpap?: boolean;
  biLevel?: boolean;
  ventSupport?: boolean;
  nebulizer?: boolean;
  apnea?: boolean;
}

/**
 * Respiratory Module Page Object
 */
export class RespiratoryModulePage {
  readonly page: Page;

  private readonly selectors = {
    // ── Breath Sounds ───────────────────────────────────────────────
    breathSoundsSameToggle: '[data-cy="toggle-breathSoundsSame"]',
    leftUpperSounds: '[data-cy="select-leftUpperSounds"]',
    leftLowerSounds: '[data-cy="select-leftLowerSounds"]',
    rightUpperSounds: '[data-cy="select-rightUpperSounds"]',
    rightMiddleSounds: '[data-cy="select-rightMiddleSounds"]',
    rightLowerSounds: '[data-cy="select-rightLowerSounds"]',

    // ── Shortness of Breath ─────────────────────────────────────────
    sobScreeningRadio: (answer: string) => `[data-cy="radio-shortnessOfBreathScreening-${answer}"]`,
    sobNowRadio: (answer: string) => `[data-cy="radio-shortnessOfBreathNow-${answer}"]`,
    treatmentInitiatedRadio: (answer: string) => `[data-cy="radio-treatmentInitiated-${answer}"]`,
    treatmentTypeCheckbox: (type: string) => `[data-cy="checkbox-treatmentTypeCheck-${type}"]`,
    symptomImpactRadio: (impact: string) => `[data-cy="radio-rankSymptomImpact-${impact}"]`,
    impactAreaCheckbox: (area: string) => `[data-cy="checkbox-explainSymptomImpactCheck-${area}"]`,
    explanationTextarea: '[data-cy="input-explanation"] textarea',

    // ── Cough / Infection Toggles ───────────────────────────────────
    coughToggle: '[data-cy="toggle-patientCough"]',
    uriToggle: '[data-cy="toggle-upperRespiratoryInfection"]',
    pneumoniaToggle: '[data-cy="toggle-pneumonia"]',
    pneumoniaVaccineToggle: '[data-cy="toggle-pneumoniaVaccine"]',

    // ── O2 Saturation ───────────────────────────────────────────────
    oxygenRadio: (answer: string) => `[data-cy="radio-patientOnOxygen-${answer}"]`,
    deliverySource: '[data-cy="select-deliverySource"]',
    deliveryFrequency: '[data-cy="select-deliveryFrequency"]',
    o2Saturation: '[data-cy="number-input-o2saturation"] input',

    // ── Mechanical Support Toggles ──────────────────────────────────
    apapToggle: '[data-cy="toggle-hasApap"]',
    cpapToggle: '[data-cy="toggle-hasCpap"]',
    biLevelToggle: '[data-cy="toggle-hasBiLevelBiPapVpap"]',
    ventSupportToggle: '[data-cy="toggle-hasVentilatorySupport"]',
    nebulizerToggle: '[data-cy="toggle-hasBreathingTreatmentNebulizer"]',
    apneaToggle: '[data-cy="toggle-hasApnea"]',
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

  async fillRespiratory(data: RespiratoryData): Promise<void> {
    console.log('Filling Respiratory module...');

    // ── SOB Screening ───────────────────────────────────────────────
    if (data.sobScreening) {
      await this.clickElement(this.selectors.sobScreeningRadio(data.sobScreening));
      console.log(`  SOB Screening: ${data.sobScreening}`);

      // If yes — fill additional SOB fields
      if (data.sobScreening === 'yes') {
        await this.page.waitForTimeout(1000);

        if (data.sobNow) {
          await this.clickElement(this.selectors.sobNowRadio(data.sobNow));
          console.log(`  SOB Now: ${data.sobNow}`);
        }

        if (data.treatmentInitiated) {
          await this.clickElement(this.selectors.treatmentInitiatedRadio(data.treatmentInitiated));
          console.log(`  Treatment Initiated: ${data.treatmentInitiated}`);
        }

        if (data.treatmentTypes) {
          for (const type of data.treatmentTypes) {
            await this.clickElement(this.selectors.treatmentTypeCheckbox(type));
          }
          console.log(`  Treatment Types: ${data.treatmentTypes.join(', ')}`);
        }

        if (data.symptomImpact) {
          await this.clickElement(this.selectors.symptomImpactRadio(data.symptomImpact));
          console.log(`  Symptom Impact: ${data.symptomImpact}`);
        }

        if (data.impactAreas) {
          for (const area of data.impactAreas) {
            await this.clickElement(this.selectors.impactAreaCheckbox(area));
          }
          console.log(`  Impact Areas: ${data.impactAreas.join(', ')}`);
        }

        if (data.explanation) {
          const textarea = this.page.locator(this.selectors.explanationTextarea);
          if (await textarea.isVisible({ timeout: 2000 }).catch(() => false)) {
            await textarea.fill(data.explanation);
            console.log(`  Explanation: ${data.explanation}`);
          }
        }
      }
    }

    // ── Cough ───────────────────────────────────────────────────────
    if (data.cough) {
      await this.clickElement(this.selectors.coughToggle);
      console.log('  Cough: toggle ON');
    }

    // ── Respiratory Infection ───────────────────────────────────────
    if (data.uri) {
      await this.clickElement(this.selectors.uriToggle);
      console.log('  URI: toggle ON');
    }
    if (data.pneumonia) {
      await this.clickElement(this.selectors.pneumoniaToggle);
      console.log('  Pneumonia: toggle ON');
    }

    // ── O2 Saturation ───────────────────────────────────────────────
    if (data.patientOnOxygen) {
      await this.clickElement(this.selectors.oxygenRadio(data.patientOnOxygen));
      console.log(`  O2: ${data.patientOnOxygen}`);
    }

    if (data.o2Saturation) {
      const o2Input = this.page.locator(this.selectors.o2Saturation);
      if (await o2Input.isVisible({ timeout: 2000 }).catch(() => false)) {
        await o2Input.fill(data.o2Saturation);
        console.log(`  O2 Saturation: ${data.o2Saturation}%`);
      }
    }

    // ── Mechanical Support Toggles ──────────────────────────────────
    if (data.apap) { await this.clickElement(this.selectors.apapToggle); console.log('  APAP: toggle ON'); }
    if (data.cpap) { await this.clickElement(this.selectors.cpapToggle); console.log('  CPAP: toggle ON'); }
    if (data.biLevel) { await this.clickElement(this.selectors.biLevelToggle); console.log('  BiLevel: toggle ON'); }
    if (data.ventSupport) { await this.clickElement(this.selectors.ventSupportToggle); console.log('  Vent Support: toggle ON'); }
    if (data.nebulizer) { await this.clickElement(this.selectors.nebulizerToggle); console.log('  Nebulizer: toggle ON'); }
    if (data.apnea) { await this.clickElement(this.selectors.apneaToggle); console.log('  Apnea: toggle ON'); }

    console.log('Respiratory module filled');
  }

  /** Convenience: fill with SOB=No, O2=Room Air */
  async fillAllRespiratory(): Promise<void> {
    await this.fillRespiratory({
      sobScreening: 'no',
      patientOnOxygen: 'noRoomAir',
    });
  }
}
