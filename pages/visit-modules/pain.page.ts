import { Page } from '@playwright/test';

/**
 * Data interface for Pain module
 */
export interface PainData {
  /** Assessment With checkboxes: patientResponsibleParty, caregiver, family */
  assessmentWith?: string[];
  /** Pain assessment tool to use: flacc, wongBaker, numeric, abbey, painAD, verbal */
  painTool?: string;
  /** Has neuropathic pain: yes/no */
  neuropathicPain?: string;
  /** Currently experiencing pain: yes/no */
  experiencingPain?: string;
  /** Symptom impact: notImpacted, mildImpact, moderateImpact, severeImpact, patientNotExperiencingTheSymptom */
  symptomImpact?: string;
  /** Impact area checkboxes: intakeOnly, dailyActivities, fatigueWeakness, sleep, concentration, cognitiveImpairment, abilityToInteract, emotionalDistress, spiritualDistress */
  impactAreas?: string[];
  /** Explanation text */
  explanation?: string;
  /** Active pain: yes/no */
  activePain?: string;
  /** Was comprehensive pain assessment done: yes/no */
  painAssessmentDone?: string;
  /** Scheduled opioid: yes/no */
  scheduledOpioid?: string;
  /** Scheduled opioid comment */
  opioidComment?: string;
  /** PRN opioid: yes/no */
  prnOpioid?: string;
  /** PRN opioid comment */
  prnComment?: string;
  /** Comprehensive Pain Assessment — pain score (0-10 for Numeric tool) */
  painScore?: number;
  /** Comprehensive Pain Assessment — location: Acute, Chronic, etc. */
  painLocation?: string;
  /** Comprehensive Pain Assessment — note for Step 3 */
  painNote?: string;
}

/**
 * Pain Module Page Object
 *
 * Cards: Pain Assessment (with tool buttons), Active Pain,
 * Comprehensive Pain Assessment, Opioid Administration, Notes
 */
export class PainModulePage {
  readonly page: Page;

  private readonly selectors = {
    // ── Assessment With (shared component) ──────────────────────────────
    assessmentWithCheckbox: (item: string) => `[data-cy="checkbox-assessmentWithCheck-${item}"]`,

    // ── Pain Assessment Tool Buttons ────────────────────────────────────
    painToolButton: (tool: string) => `[data-cy="button-tool-${tool}"]`,
    clearAllButton: '[data-cy="button-clear-all"]',

    // ── Pain Assessment Radios ──────────────────────────────────────────
    neuropathicPainRadio: (answer: string) => `[data-cy="radio-patientHasNeuropathicPain-${answer}"]`,
    experiencingPainRadio: (answer: string) => `[data-cy="radio-experiencingPainQuestion-${answer}"]`,

    // ── Symptom Impact ──────────────────────────────────────────────────
    symptomImpactRadio: (answer: string) => `[data-cy="radio-rankSymptomImpact-${answer}"]`,
    impactAreaCheckbox: (area: string) => `[data-cy="checkbox-explainSymptomImpactCheck-${area}"]`,
    otherSymptomArea: '[data-cy="input-otherSymptomArea"] input',
    explanationTextarea: '[data-cy="input-explanation"] textarea',

    // ── Active Pain ─────────────────────────────────────────────────────
    activePainRadio: (answer: string) => `[data-cy="radio-activePainWith-${answer}"]`,

    // ── J0910.A&B Comprehensive Pain Assessment question ────────────────
    painAssessmentDoneRadio: (answer: string) => `[data-cy="radio-wasPainDoneQuestion-${answer}"]`,

    // ── J0910.C Comprehensive Pain Assessment modal (wound-modal) ────────
    addSiteBtn: '#addSiteBtn',
    // Step 1: Tool selection + score
    modalToolButton: (tool: string) => `wound-modal button:has-text("${tool}")`,
    numericRange: '#numericToolRange',
    rangeKnob: '#numericToolRange .range-knob-handle',
    // Navigation
    modalNextBtn: '#nextStepBtn',
    modalPrevBtn: '#prevStepBtn',
    modalCancelBtn: '#cancelBtn',
    // Step 2: Location buttons (Acute, Chronic, etc.)
    locationButton: (loc: string) => `wound-modal button:has-text("${loc}")`,
    // Step 3: Pain detail dropdowns (ion-select with popover)
    painTypeSelect: '#type',
    painCharacterSelect: '#character',
    painSeveritySelect: '#descriptiveSeverity',
    painFrequencySelect: '#frequency',
    painDurationSelect: '#duration',
    painOnsetSelect: '#onset',
    // Step 3: Pain questions (textareas, not dropdowns)
    painQuestion1: '#painQuestion1 textarea',
    painQuestion2: '#painQuestion2 textarea',
    painQuestion3: '#painQuestion3 textarea',
    painQuestion4: '#painQuestion4 textarea',

    // ── Opioid Administration ───────────────────────────────────────────
    scheduledOpioidRadio: (answer: string) => `[data-cy="radio-scheduledOpioidInitiatedOrContinued-${answer}"]`,
    opioidCommentTextarea: '[data-cy="input-opioidComment"] textarea',
    prnOpioidRadio: (answer: string) => `[data-cy="radio-prnOpioidInitiatedOrContinued-${answer}"]`,
    prnCommentTextarea: '[data-cy="input-prnComment"] textarea',
  };

  constructor(page: Page) {
    this.page = page;
  }

  private async clickElement(selector: string): Promise<void> {
    const el = this.page.locator(selector);
    if (await el.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Skip if the element itself or its inner button is disabled
      const selfDisabled = await el.getAttribute('aria-disabled').catch(() => null);
      if (selfDisabled === 'true') return;
      const btnDisabled = await el.locator('button[aria-disabled="true"]').count().catch(() => 0);
      if (btnDisabled > 0) return;
      await el.scrollIntoViewIfNeeded();
      await el.click({ force: true });
      await this.page.waitForTimeout(300);
    }
  }

  private async fillTextarea(selector: string, text: string): Promise<void> {
    const el = this.page.locator(selector);
    if (await el.isVisible({ timeout: 2000 }).catch(() => false)) {
      await el.fill(text);
      await this.page.waitForTimeout(200);
    }
  }

  async fillPain(data: PainData): Promise<void> {
    console.log('Filling Pain module...');

    // Assessment With — only click if checkboxes are enabled (disabled on Pain page)
    if (data.assessmentWith) {
      for (const item of data.assessmentWith) {
        const checkbox = this.page.locator(this.selectors.assessmentWithCheckbox(item));
        const isDisabled = await checkbox.locator('button').getAttribute('aria-disabled').catch(() => 'true');
        if (isDisabled !== 'true') {
          await this.clickElement(this.selectors.assessmentWithCheckbox(item));
        }
      }
      console.log(`  Assessment With: checked where enabled`);
    }

    // J0900 Pain Screening — select tool and set rating on main page
    // This data maps to the Comprehensive Pain Assessment modal
    if (data.painTool) {
      const toolMap: Record<string, string> = {
        'FLACC': 'flacc', 'Flacc': 'flacc', 'flacc': 'flacc',
        'Wong-Baker': 'wongBaker', 'wongBaker': 'wongBaker',
        'Numeric': 'numeric', 'numeric': 'numeric',
        'Abbey': 'abbey', 'abbey': 'abbey',
        'PAIN-AD': 'painAD', 'painAD': 'painAD',
        'Verbal': 'verbal', 'verbal': 'verbal',
      };
      const toolKey = toolMap[data.painTool] || data.painTool.toLowerCase();
      // Click the tool button on the main page J0900 section
      const toolBtn = this.page.locator(`[data-cy="button-tool-${toolKey}"]`).first();
      await toolBtn.scrollIntoViewIfNeeded();
      await toolBtn.click();
      await this.page.waitForTimeout(2000);
      console.log(`  J0900 Pain Tool: ${data.painTool}`);

      // Set pain rating on the range slider that appears after tool selection
      if (data.painScore !== undefined) {
        const mainRange = this.page.locator('pain-screening-tool #numericToolRange');
        await mainRange.waitFor({ state: 'visible', timeout: 5000 });
        await this.setPainRating(data.painScore, 'pain-screening-tool #numericToolRange');
        console.log(`  J0900 Pain Rating: ${data.painScore}`);
      }
    }

    // Neuropathic Pain
    if (data.neuropathicPain) {
      await this.clickElement(this.selectors.neuropathicPainRadio(data.neuropathicPain));
      console.log(`  Neuropathic Pain: ${data.neuropathicPain}`);
    }

    // Experiencing Pain
    if (data.experiencingPain) {
      await this.clickElement(this.selectors.experiencingPainRadio(data.experiencingPain));
      console.log(`  Experiencing Pain: ${data.experiencingPain}`);
    }

    // Symptom Impact
    if (data.symptomImpact) {
      await this.clickElement(this.selectors.symptomImpactRadio(data.symptomImpact));
      console.log(`  Symptom Impact: ${data.symptomImpact}`);
    }

    // Impact Areas
    if (data.impactAreas) {
      for (const area of data.impactAreas) {
        await this.clickElement(this.selectors.impactAreaCheckbox(area));
      }
      console.log(`  Impact Areas: ${data.impactAreas.join(', ')}`);
    }

    // Explanation
    if (data.explanation) {
      await this.fillTextarea(this.selectors.explanationTextarea, data.explanation);
      console.log(`  Explanation: ${data.explanation}`);
    }

    // Active Pain
    if (data.activePain) {
      await this.clickElement(this.selectors.activePainRadio(data.activePain));
      console.log(`  Active Pain: ${data.activePain}`);
    }

    // Comprehensive Pain Assessment
    if (data.painAssessmentDone) {
      await this.clickElement(this.selectors.painAssessmentDoneRadio(data.painAssessmentDone));
      console.log(`  Pain Assessment Done: ${data.painAssessmentDone}`);
    }

    // Scheduled Opioid
    if (data.scheduledOpioid) {
      await this.clickElement(this.selectors.scheduledOpioidRadio(data.scheduledOpioid));
      console.log(`  Scheduled Opioid: ${data.scheduledOpioid}`);
    }
    if (data.opioidComment) {
      await this.fillTextarea(this.selectors.opioidCommentTextarea, data.opioidComment);
      console.log(`  Opioid Comment: ${data.opioidComment}`);
    }

    // PRN Opioid
    if (data.prnOpioid) {
      await this.clickElement(this.selectors.prnOpioidRadio(data.prnOpioid));
      console.log(`  PRN Opioid: ${data.prnOpioid}`);
    }
    if (data.prnComment) {
      await this.fillTextarea(this.selectors.prnCommentTextarea, data.prnComment);
      console.log(`  PRN Comment: ${data.prnComment}`);
    }

    // Comprehensive Pain Assessment (J0910.C) — multi-step modal
    if (data.painAssessmentDone === 'yes') {
      await this.fillComprehensivePainAssessment(data);
    }

    console.log('Pain module filled');
  }

  /**
   * Set pain rating on an ion-range slider by clicking the correct tick position.
   * The slider has ticks at 0%, 10%, 20%... for values 0-10.
   */
  private async setPainRating(score: number, rangeSelector?: string): Promise<void> {
    const selector = rangeSelector || '#numericToolRange';
    const range = this.page.locator(selector);
    if (!await range.isVisible({ timeout: 3000 }).catch(() => false)) return;

    const box = await range.boundingBox();
    if (!box) return;

    // Calculate tick position: score 0 = left edge, score 10 = right edge
    const percentage = score / 10;
    const clickX = box.x + (box.width * percentage);
    const clickY = box.y + box.height / 2;
    await this.page.mouse.click(clickX, clickY);
    await this.page.waitForTimeout(500);
  }

  /**
   * Select first option from an ion-select popover inside the modal.
   */
  private async selectFirstIonOption(selector: string): Promise<void> {
    const el = this.page.locator(selector);
    if (await el.isVisible({ timeout: 2000 }).catch(() => false)) {
      await el.click();
      await this.page.waitForTimeout(1000);
      await this.page.locator('ion-popover.select-popover ion-item').first().click({ force: true });
      await this.page.waitForTimeout(500);
    }
  }

  /**
   * Fill the J0910.C Comprehensive Pain Assessment modal.
   * Flow:
   *   Step 1: Select tool → Set score on slider → Next
   *   Step 2: Select location (Acute/Chronic) → Next
   *   Step 3: Fill Type, Character, Severity, Frequency, Duration, Onset, Pain Questions → Submit
   */
  async fillComprehensivePainAssessment(data: PainData): Promise<void> {
    // Click the + button to open the modal
    const addBtn = this.page.locator(this.selectors.addSiteBtn);
    await addBtn.waitFor({ state: 'visible', timeout: 5000 });
    await addBtn.click({ force: true });
    await this.page.waitForTimeout(2000);
    console.log('  Opened Comprehensive Pain Assessment modal');

    const nextBtn = this.page.locator(this.selectors.modalNextBtn);

    // ── Step 1: Tool and score auto-mapped from J0900 Pain Screening ────
    // The modal inherits the tool selection and score from the main page
    // Next should already be enabled — click it to go to Step 2
    await this.page.waitForTimeout(1000);
    await nextBtn.click();
    await this.page.waitForTimeout(1500);
    console.log('  Step 1: Tool/score inherited from J0900 → Next to Step 2');

    // ── Step 2: Location + Pain Details (all in sidebar) ────────────────
    // Check "Generalized" checkbox
    const generalizedCheckbox = this.page.locator('#unspecifiedLocationPain');
    if (await generalizedCheckbox.isVisible({ timeout: 3000 }).catch(() => false)) {
      const isChecked = await generalizedCheckbox.getAttribute('aria-checked');
      if (isChecked !== 'true') {
        await generalizedCheckbox.click({ force: true });
        await this.page.waitForTimeout(500);
      }
      console.log('  Step 2: Location: Generalized');
    }

    // Fill all required dropdowns: Type, Character, Severity, Frequency, Duration, Onset
    await this.selectFirstIonOption(this.selectors.painTypeSelect);
    console.log('  Step 2: Type selected');

    await this.selectFirstIonOption(this.selectors.painCharacterSelect);
    console.log('  Step 2: Character selected');

    await this.selectFirstIonOption(this.selectors.painSeveritySelect);
    console.log('  Step 2: Severity selected');

    await this.selectFirstIonOption(this.selectors.painFrequencySelect);
    console.log('  Step 2: Frequency selected');

    await this.selectFirstIonOption(this.selectors.painDurationSelect);
    console.log('  Step 2: Duration selected');

    await this.selectFirstIonOption(this.selectors.painOnsetSelect);
    console.log('  Step 2: Onset selected');

    // Click Next → Step 3 (Pain Questions)
    await this.page.waitForTimeout(500);
    await nextBtn.click();
    await this.page.waitForTimeout(1500);
    console.log('  → Next to Step 3');

    // ── Step 3: Pain Questions (textareas) + Note ─────────────────────
    await this.fillTextarea(this.selectors.painQuestion1, 'Rest and medication help relieve pain');
    console.log('  Step 3: Q1 — What makes pain worse/better');

    await this.fillTextarea(this.selectors.painQuestion2, 'Mild impact on quality of life');
    console.log('  Step 3: Q2 — How pain affects quality of life');

    await this.fillTextarea(this.selectors.painQuestion3, 'Minimal impact on daily activities');
    console.log('  Step 3: Q3 — How pain affects ADLs');

    // Submit — click Next to finalize
    await nextBtn.click();
    await this.page.waitForTimeout(3000);
    console.log('  Comprehensive Pain Assessment submitted');
  }

  /** Convenience: fill with complete defaults (no pain) */
  async fillAllPain(): Promise<void> {
    await this.fillPain({
      assessmentWith: ['patientResponsibleParty'],
      painTool: 'numeric',
      neuropathicPain: 'no',
      experiencingPain: 'no',
      symptomImpact: 'patientNotExperiencingTheSymptom',
      activePain: 'no',
      painAssessmentDone: 'no',
      scheduledOpioid: 'no',
      prnOpioid: 'no',
    });
  }
}
