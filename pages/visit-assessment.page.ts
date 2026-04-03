import { Page } from '@playwright/test';

/**
 * Visit Assessment Page Object
 *
 * Handles the visit assessment page after a visit is created.
 * Manages module navigation (sidebar), vital card modals, and visit action buttons.
 */
export class VisitAssessmentPage {
  readonly page: Page;

  private readonly selectors = {
    // ── Breadcrumb / Title ──────────────────────────────────────────────
    mainTitle: '[data-cy="label-navbar-main-title"]',
    sectionTitle: '[data-cy="label-navbar-section-title"]',

    // ── Module Navigation (sidebar) ─────────────────────────────────────
    moduleNav: (name: string) => `button:has-text("${name}")`,
    symptomSummaryNav: 'button:has-text("Symptom Summary")',
    vitalsNav: 'button:has-text("Vitals")',
    preferencesNav: 'button:has-text("Preferences")',
    neurologicalNav: 'button:has-text("Neurological")',
    painNav: 'button:has-text("Pain")',
    respiratoryNav: 'button:has-text("Respiratory")',
    cardiovascularNav: 'button:has-text("Cardiovascular")',
    gastrointestinalNav: 'button:has-text("Gastrointestinal")',
    genitourinaryNav: 'button:has-text("Genitourinary")',
    nutritionalMetabolicNav: 'button:has-text("Nutritional & Metabolic")',
    skinNav: 'button:has-text("Skin")',
    musculoskeletalNav: 'button:has-text("Musculoskeletal")',
    adlsNav: 'button:has-text("ADLs/Functional Needs")',
    precautionsNav: 'button:has-text("Precautions, Safety & Teachings")',
    hospiceAideNav: 'button:has-text("Hospice Aide")',
    militaryHistoryNav: 'button:has-text("Military History")',
    summaryNav: 'button:has-text("Summary")',

    // ── Top Action Buttons ──────────────────────────────────────────────
    planOfCareBtn: '.planOfCareBtn',
    orderEntryBtn: '[data-cy="btn-open-order-entry-page"]',

    // ── Bottom Action Buttons ───────────────────────────────────────────
    hopeReportBtn: '[data-cy="btn-hope-report"]',
    cancelVisitBtn: '[data-cy="btn-cancel-visit"]',
    continueLaterBtn: '[data-cy="btn-save-and-continue"]',
    completeBtn: '[data-cy="btn-complete-visit"]',
    exitPlanOfCareBtn: 'button:has-text("Exit Plan of Care")',

    // ── Vital Card Pattern ──────────────────────────────────────────────
    cardHeader: (cardName: string) => `[data-cy="card-header-${cardName}"]`,
    cardAddBtn: (cardName: string) => `[data-cy="button-${cardName}-add"]`,
    declineToggle: '[data-cy="toggle-declineCard"]',

    // ── Vital Modal (shared across all vital cards) ─────────────────────
    inputModal: 'ion-modal.show-page',
    modalHeader: '[data-cy="label-input-modal-header"]',
    modalSubmit: '[data-cy="btn-input-modal-submit"]',
    modalCancel: '[data-cy="btn-input-modal-cancel"]',

    // ── Blood Pressure Modal ────────────────────────────────────────────
    bpLocation: '[data-cy="select-bloodPressureLocation"]',
    bpPosition: '[data-cy="select-bloodPressurePosition"]',
    bpSystolic: '[data-cy="number-input-bloodPressureSystolic"] input',
    bpDiastolic: '[data-cy="number-input-bloodPressureDiastolic"] input',

    // ── Temperature Modal ───────────────────────────────────────────────
    tempRoute: '[data-cy="select-temperatureRoute"]',
    tempValue: '[data-cy="number-input-temperature"] input',

    // ── Pulse Modal ─────────────────────────────────────────────────────
    pulseRhythm: '[data-cy="select-pulseRhythm"]',
    pulseStrength: '[data-cy="select-pulseStrength"]',
    pulseLocation: '[data-cy="select-pulseLocation"]',
    pulseValue: '[data-cy="number-input-heartRate"] input',

    // ── Respiratory Rate Modal ──────────────────────────────────────────
    respirationType: '[data-cy="select-respirationType"]',
    respRateValue: '[data-cy="number-input-respiratoryRate"] input',
    o2SatValue: '[data-cy="number-input-o2saturation"] input',

    // ── Height Card (inline, not modal) ─────────────────────────────────
    heightCurrentFeet: '[data-cy="input-heightCurrentLengthFeet"] input',
    heightCurrentInches: '[data-cy="input-heightCurrentLengthInches"] input',

    // ── Weight Modal ────────────────────────────────────────────────────
    weightLbs: '[data-cy="input-weightConversion-lbs"] input',
    weightKg: '[data-cy="input-weightConversion-kg"] input',

    // ── COVID Screening ─────────────────────────────────────────────────
    covidRadio: (question: string, answer: 'yes' | 'no') =>
      `[data-cy="radio-covid19-${question}-${answer}"]`,

    // ── Notes Card ──────────────────────────────────────────────────────
    notesAddBtn: '[data-cy="button-notes-add"]',
  };

  constructor(page: Page) {
    this.page = page;
  }

  // ══════════════════════════════════════════════════════════════════════
  // Module Navigation
  // ══════════════════════════════════════════════════════════════════════

  async navigateToModule(moduleName: string): Promise<void> {
    let selector: string;
    if (moduleName === 'Summary') {
      selector = '#summaryNavButton';
    } else if (moduleName === 'Symptom Summary') {
      selector = '#symptomSummaryNavButton';
    } else {
      selector = this.selectors.moduleNav(moduleName);
    }
    await this.page.locator(selector).click();

    // Wait for "Saving..." dialog to appear and disappear
    const savingDialog = this.page.getByText('Saving...');
    try {
      await savingDialog.waitFor({ state: 'visible', timeout: 3000 });
      await savingDialog.waitFor({ state: 'hidden', timeout: 15000 });
    } catch {
      // Saving dialog may not appear if no changes were made
    }
    await this.page.waitForTimeout(1000);
    console.log(`Navigated to module: ${moduleName}`);
  }

  async getSectionTitle(): Promise<string> {
    return (await this.page.locator(this.selectors.sectionTitle).textContent())?.trim() ?? '';
  }

  // ══════════════════════════════════════════════════════════════════════
  // Vital Card Modal — Generic Pattern
  // ══════════════════════════════════════════════════════════════════════

  async openCardModal(cardName: string): Promise<void> {
    await this.page.locator(this.selectors.cardAddBtn(cardName)).click();
    await this.page.locator(this.selectors.inputModal).waitFor({ state: 'visible', timeout: 5000 });
    await this.page.waitForTimeout(500);
    console.log(`Opened ${cardName} modal`);
  }

  async submitCardModal(): Promise<void> {
    await this.page.locator(this.selectors.modalSubmit).click();
    await this.page.waitForTimeout(2000);
    console.log('Submitted card modal');
  }

  async cancelCardModal(): Promise<void> {
    await this.page.locator(this.selectors.modalCancel).click();
    await this.page.waitForTimeout(1000);
  }

  // ══════════════════════════════════════════════════════════════════════
  // Blood Pressure
  // ══════════════════════════════════════════════════════════════════════

  /**
   * Select the first option from an ion-select popover.
   * ion-select with interface="popover" opens a popover with ion-radio options.
   */
  private async selectFirstIonOption(selectLocator: string): Promise<void> {
    await this.page.locator(selectLocator).click();
    await this.page.waitForTimeout(1000);
    const popoverOption = this.page.locator('ion-popover.select-popover ion-item').first();
    await popoverOption.click({ force: true });
    await this.page.waitForTimeout(500);
  }

  /**
   * Fill ALL required ion-select dropdowns in the current modal by selecting first option.
   * Reads every ion-select inside the modal, checks if it has "Please Select" placeholder,
   * and selects the first option.
   */
  private async fillAllRequiredSelects(): Promise<void> {
    const modal = this.page.locator('page-input-modal');
    const selects = modal.locator('ion-select');
    const count = await selects.count();

    for (let i = 0; i < count; i++) {
      const sel = selects.nth(i);
      const text = await sel.locator('.select-text').textContent().catch(() => '');
      const placeholder = text?.trim();

      // Only fill if it shows "Please Select" (unfilled required field)
      if (placeholder === 'Please Select') {
        const dataCy = await sel.getAttribute('data-cy') ?? `ion-select-${i}`;
        await sel.click();
        await this.page.waitForTimeout(1000);
        await this.page.locator('ion-popover.select-popover ion-item').first().click({ force: true });
        await this.page.waitForTimeout(500);
        console.log(`  Selected first option for: ${dataCy}`);
      }
    }
  }

  /**
   * Generic method to open a vital card modal, fill all required selects,
   * fill specified number inputs by data-cy, and submit.
   */
  async fillCardModal(cardName: string, fields: Record<string, string>): Promise<void> {
    await this.openCardModal(cardName);

    // Auto-fill all required dropdowns
    await this.fillAllRequiredSelects();

    // Fill each specified field
    for (const [dataCy, value] of Object.entries(fields)) {
      const input = this.page.locator(`[data-cy="${dataCy}"] input`);
      if (await input.isVisible({ timeout: 2000 }).catch(() => false)) {
        await input.fill(value);
        console.log(`  Filled ${dataCy}: ${value}`);
      }
    }

    await this.submitCardModal();
    console.log(`${cardName} card completed`);
  }

  async fillBloodPressure(systolic: string, diastolic: string): Promise<void> {
    await this.fillCardModal('bloodPressure', {
      'number-input-bloodPressureSystolic': systolic,
      'number-input-bloodPressureDiastolic': diastolic,
    });
    console.log(`Blood Pressure: ${systolic}/${diastolic}`);
  }

  // ══════════════════════════════════════════════════════════════════════
  // Temperature
  // ══════════════════════════════════════════════════════════════════════

  async fillTemperature(value: string): Promise<void> {
    await this.fillCardModal('temperatureCardTitle', {
      'number-input-temperature': value,
    });
    console.log(`Temperature: ${value}`);
  }

  // ══════════════════════════════════════════════════════════════════════
  // Pulse
  // ══════════════════════════════════════════════════════════════════════

  async fillPulse(value: string): Promise<void> {
    await this.fillCardModal('pulse', {
      'number-input-heartRate': value,
    });
    console.log(`Pulse: ${value}`);
  }

  // ══════════════════════════════════════════════════════════════════════
  // Respiratory Rate
  // ══════════════════════════════════════════════════════════════════════

  async fillRespiratoryRate(value: string, o2sat?: string): Promise<void> {
    const fields: Record<string, string> = {
      'number-input-respiratoryRate': value,
    };
    if (o2sat) fields['number-input-o2saturation'] = o2sat;

    await this.fillCardModal('respiratoryRate', fields);
    console.log(`Respiratory Rate: ${value}${o2sat ? `, O2: ${o2sat}%` : ''}`);
  }

  // ══════════════════════════════════════════════════════════════════════
  // Height (inline fields, not modal)
  // ══════════════════════════════════════════════════════════════════════

  async fillHeight(feet: string, inches: string): Promise<void> {
    await this.page.locator(this.selectors.heightCurrentFeet).fill(feet);
    await this.page.locator(this.selectors.heightCurrentInches).fill(inches);
    await this.page.waitForTimeout(500);
    console.log(`Height: ${feet}' ${inches}"`);
  }

  // ══════════════════════════════════════════════════════════════════════
  // Weight
  // ══════════════════════════════════════════════════════════════════════

  async fillWeight(lbs: string): Promise<void> {
    await this.fillCardModal('weight', {
      'input-weightConversion-lbs': lbs,
    });
    console.log(`Weight: ${lbs} lbs`);
  }

  // ══════════════════════════════════════════════════════════════════════
  // COVID Screening
  // ══════════════════════════════════════════════════════════════════════

  async fillCovidScreeningAllNo(): Promise<void> {
    const questions = [
      'familyEngagedInInternationalTravel',
      'familyHaveRespiratoryIllness',
      'familyWithSignsOfCovid',
      'familyHadContactWithSomeoneUnderCovidInvestigation',
      'patientResidesInTransmissionArea',
    ];
    for (const q of questions) {
      await this.page.locator(this.selectors.covidRadio(q, 'no')).click();
      await this.page.waitForTimeout(300);
    }
    console.log('COVID screening: all No');
  }

  // ══════════════════════════════════════════════════════════════════════
  // Visit Actions
  // ══════════════════════════════════════════════════════════════════════

  // ══════════════════════════════════════════════════════════════════════
  // Generic Module Fill — handles any module with radio groups and selects
  // ══════════════════════════════════════════════════════════════════════

  /**
   * Fill all visible required radio groups on the current page by selecting first option.
   * Scans for radio groups that have no selection (ng-pristine/ng-invalid).
   */
  async fillAllRequiredRadios(): Promise<void> {
    // Find all radio groups that are invalid (required but not filled)
    const invalidForms = this.page.locator('form.ng-invalid ion-radio-group, form.ng-invalid dynamic-input');
    const count = await invalidForms.count();

    for (let i = 0; i < count; i++) {
      const group = invalidForms.nth(i);
      const firstRadio = group.locator('ion-radio').first();
      if (await firstRadio.isVisible({ timeout: 1000 }).catch(() => false)) {
        await firstRadio.click({ force: true });
        await this.page.waitForTimeout(200);
      }
    }
  }

  /**
   * Navigate to a module, fill all required selects and radios, then navigate away to save.
   * This is a quick-fill approach that selects first option for every required field.
   */
  async quickFillModule(moduleName: string, nextModuleName?: string): Promise<void> {
    await this.navigateToModule(moduleName);

    // Fill all required ion-select dropdowns (uses the modal pattern from Vitals)
    // For inline forms (not modals), fill required selects on the page
    const pageSelects = this.page.locator('ion-select');
    const selectCount = await pageSelects.count();
    for (let i = 0; i < selectCount; i++) {
      const sel = pageSelects.nth(i);
      if (!await sel.isVisible().catch(() => false)) continue;
      const text = await sel.locator('.select-text').textContent().catch(() => '');
      if (text?.trim() === 'Please Select') {
        try {
          await sel.click();
          await this.page.waitForTimeout(1000);
          const option = this.page.locator('ion-popover.select-popover ion-item').first();
          if (await option.isVisible({ timeout: 2000 }).catch(() => false)) {
            await option.click({ force: true });
            await this.page.waitForTimeout(500);
          }
        } catch { /* skip if popover fails */ }
      }
    }

    // Navigate to next module to save (if provided)
    if (nextModuleName) {
      await this.navigateToModule(nextModuleName);
    }

    console.log(`Quick-filled module: ${moduleName}`);
  }

  // ══════════════════════════════════════════════════════════════════════
  // Visit Actions
  // ══════════════════════════════════════════════════════════════════════

  async clickPlanOfCare(): Promise<void> {
    await this.page.locator(this.selectors.planOfCareBtn).click();
    await this.page.waitForTimeout(3000);
    console.log('Opened Plan of Care');
  }

  async clickExitPlanOfCare(): Promise<void> {
    await this.page.locator(this.selectors.exitPlanOfCareBtn).click();
    await this.page.waitForTimeout(3000);
    console.log('Exited Plan of Care');
  }

  async clickHopeReportPreview(): Promise<void> {
    await this.page.locator(this.selectors.hopeReportBtn).click();
    await this.page.waitForTimeout(3000);
    console.log('Opened HOPE Report Preview');
  }

  async clickCancelVisit(): Promise<void> {
    await this.page.locator(this.selectors.cancelVisitBtn).click();
    await this.page.waitForTimeout(2000);
    console.log('Clicked Cancel Visit');
  }

  async clickContinueLater(): Promise<void> {
    await this.page.locator(this.selectors.continueLaterBtn).click();
    await this.page.waitForTimeout(3000);
    console.log('Clicked Continue Later');
  }

  async clickComplete(): Promise<void> {
    await this.page.locator(this.selectors.completeBtn).click();
    await this.page.waitForTimeout(3000);
    console.log('Clicked Complete');
  }
}
