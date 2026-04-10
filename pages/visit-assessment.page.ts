import { Page } from '@playwright/test';
import { DateHelper } from '../utils/date-helper';

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
    // Use nav button IDs for modules whose text matches other buttons
    const navButtonIds: Record<string, string> = {
      'Summary': '#summaryNavButton',
      'Symptom Summary': '#symptomSummaryNavButton',
      'Pain': '#painNavButton',
    };

    const selector = navButtonIds[moduleName] || this.selectors.moduleNav(moduleName);
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
    // Get profile name for signature before opening modals
    const profileName = await this.getProfileName();
    console.log(`Profile name for signature: ${profileName}`);

    await this.page.locator(this.selectors.completeBtn).click();
    await this.page.waitForTimeout(3000);
    console.log('Clicked Complete');

    // Handle any confirmation/alert dialogs that may appear before the signature modal
    // The app may show multiple sequential alerts (POC not resolved, HOPE not previewed, etc.)
    // Keep dismissing until the signature modal appears or no more alerts
    const modalHeader = this.page.locator('[data-cy="label-input-modal-header"]');
    for (let attempt = 0; attempt < 5; attempt++) {
      // Check if signature modal already appeared
      if (await modalHeader.isVisible({ timeout: 2000 }).catch(() => false)) {
        break;
      }

      // Look for alert/confirmation dialog buttons ONLY inside ion-alert overlays
      // (NOT page buttons like "Continue Later" which would exit the visit)
      const alertBtn = this.page.locator(
        'ion-alert button, .alert-button-group button'
      ).last();
      if (await alertBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        const btnText = (await alertBtn.textContent())?.trim() || '';
        await alertBtn.click();
        await this.page.waitForTimeout(2000);
        console.log(`Dismissed dialog (${attempt + 1}): "${btnText}"`);
      } else {
        // No alert visible and no modal — wait a bit and retry
        await this.page.waitForTimeout(2000);
      }
    }

    // Wait for the signature/task modal to fully render
    await modalHeader.waitFor({ state: 'visible', timeout: 15000 });
    // Give modal content time to render
    await this.page.waitForTimeout(3000);

    // Determine modal type: signature modal has the signature input in the DOM
    const signatureCount = await this.page.locator('#signatureText, [data-cy="input-signature"]').count();
    const disclaimerCount = await this.page.locator('[data-cy="checkbox-disclaimerChkCheck-labelAcknowledge"]').count();
    const isSignatureModal = signatureCount > 0 || disclaimerCount > 0;
    console.log(`Modal type: ${isSignatureModal ? 'Signature' : 'Task'} (signature=${signatureCount}, disclaimer=${disclaimerCount})`);

    if (isSignatureModal) {
      await this.fillSignatureModal(profileName);
      // After signature, a second modal (task/dates) may appear
      await this.page.waitForTimeout(3000);
      const secondModal = this.page.locator('[data-cy="label-input-modal-header"]');
      if (await secondModal.isVisible({ timeout: 10000 }).catch(() => false)) {
        await this.fillTaskModal();
      }
    } else {
      // Single modal — just the task/dates modal
      await this.fillTaskModal();
    }
  }

  /**
   * Fill the signature modal: check disclaimer, type signature, submit
   */
  async fillSignatureModal(profileName: string): Promise<void> {
    console.log('Signature modal opened');

    // Check "Check to continue" checkbox (only present in visit complete modal)
    const disclaimerBtn = this.page.locator('[data-cy="checkbox-disclaimerChkCheck-labelAcknowledge"] button');
    if (await disclaimerBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await disclaimerBtn.click({ force: true });
      await this.page.waitForTimeout(500);
      console.log('  Checked: Check to continue');
    }

    // Scope to the signature modal to avoid conflicts with background page buttons
    const modal = this.page.locator('page-signature-input-modal, ion-modal.show-page').last();

    // Type signature
    const signatureInput = modal.locator('[data-cy="input-signature"] input, #signatureText input').first();
    await signatureInput.waitFor({ state: 'visible', timeout: 10000 });
    await signatureInput.click();
    await signatureInput.pressSequentially(profileName, { delay: 30 });
    // Tab out to trigger Angular change detection / form validation
    await this.page.keyboard.press('Tab');
    await this.page.waitForTimeout(500);
    console.log(`  Signature: ${profileName}`);

    // Submit — scoped to the modal to avoid clicking Tab Z's #inputModalSubmit
    const submitBtn = modal.locator('#inputModalSubmit');
    await submitBtn.scrollIntoViewIfNeeded().catch(() => {});
    await submitBtn.click({ force: true });
    await this.page.waitForTimeout(3000);
    console.log('  Signature submitted');
  }

  /**
   * Fill the task modal: start/end date+time, mileage, submit
   */
  private async fillTaskModal(): Promise<void> {
    console.log('Task modal opened');

    const today = new Date();
    const dateStr = `${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}/${today.getFullYear()}`;
    const hour = String(today.getHours()).padStart(2, '0');
    const endHour = String((today.getHours() + 1) % 24).padStart(2, '0');

    // Start Date — click calendar icon to open ngb-datepicker and pick the date
    const startCalendarBtn = this.page.locator('#assessmentStartDate button.inside-click-datepicker');
    if (await startCalendarBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await startCalendarBtn.click();
      await this.page.waitForTimeout(500);
      await DateHelper.selectDateFormatted(this.page, dateStr);
      console.log(`  Start Date: ${dateStr}`);
    }

    // Start Time
    const startHourInput = this.page.locator('#assessmentStartTime input[aria-label="Hours"]');
    const startMinInput = this.page.locator('#assessmentStartTime input[aria-label="Minutes"]');
    if (await startHourInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await startHourInput.click({ clickCount: 3 });
      await startHourInput.pressSequentially(hour, { delay: 30 });
      await startMinInput.click({ clickCount: 3 });
      await startMinInput.pressSequentially('00', { delay: 30 });
      await this.page.keyboard.press('Tab');
      await this.page.waitForTimeout(300);
      console.log(`  Start Time: ${hour}:00`);
    }

    // End Date — click calendar icon to open ngb-datepicker and pick the date
    const endCalendarBtn = this.page.locator('#assessmentEndDate button.inside-click-datepicker');
    if (await endCalendarBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await endCalendarBtn.click();
      await this.page.waitForTimeout(500);
      await DateHelper.selectDateFormatted(this.page, dateStr);
      console.log(`  End Date: ${dateStr}`);
    }

    // End Time
    const endHourInput = this.page.locator('#assessmentEndTime input[aria-label="Hours"]');
    const endMinInput = this.page.locator('#assessmentEndTime input[aria-label="Minutes"]');
    if (await endHourInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await endHourInput.click({ clickCount: 3 });
      await endHourInput.pressSequentially(endHour, { delay: 30 });
      await endMinInput.click({ clickCount: 3 });
      await endMinInput.pressSequentially('00', { delay: 30 });
      await this.page.keyboard.press('Tab');
      await this.page.waitForTimeout(300);
      console.log(`  End Time: ${endHour}:00`);
    }

    // Mileage
    const mileageInput = this.page.locator('[data-cy="number-input-mileage"] input');
    if (await mileageInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await mileageInput.click({ clickCount: 3 });
      await mileageInput.pressSequentially('10', { delay: 50 });
      await this.page.keyboard.press('Tab');
      await this.page.waitForTimeout(300);
      console.log('  Mileage: 10');
    }

    // Click somewhere neutral to trigger all blur/change events before submit
    await this.page.locator('.modal-title, [data-cy="label-input-modal-header"]').first().click().catch(() => {});
    await this.page.waitForTimeout(1000);

    // Submit — wait for button to become enabled, then click
    const taskSubmitBtn = this.page.locator('[data-cy="btn-input-modal-submit"]');
    for (let i = 0; i < 10; i++) {
      const disabled = await taskSubmitBtn.getAttribute('disabled');
      if (disabled === null) break;
      await this.page.waitForTimeout(1000);
    }
    await taskSubmitBtn.click({ force: true });
    await this.page.waitForTimeout(5000);
    console.log('  Task submitted — visit complete');
  }

  /**
   * Get the logged-in user's profile name for signature.
   * Opens profile menu, reads name, closes it.
   */
  async getProfileName(): Promise<string> {
    const profileBtn = this.page.locator('#btn-user-profile');
    await profileBtn.click();
    await this.page.waitForTimeout(1000);

    const profileLabel = this.page.locator('.profileName ion-label');
    const name = (await profileLabel.textContent())?.trim() || '';

    // Close profile popover
    await this.page.keyboard.press('Escape');
    await this.page.waitForTimeout(500);

    return name;
  }
}
