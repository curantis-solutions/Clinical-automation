import { Page, expect } from '@playwright/test';
import { BasePage } from './base.page';
import { selectDateFromPicker, clickCalendarButtonByLabel } from '../utils/form-helpers';

/**
 * Visit Recording Page Object — CR-2993+
 * Handles the visit recording flow within Care Plan:
 * - Create Visit modal (role, type, submit)
 * - Visit recording form (vitals BP, F2F narrative/attestation, completion)
 * - Edit existing visits
 *
 * Navigation: Patient Details → Care Plan → Add Visit (+) → Create Visit modal
 * URL pattern: /#/patient/{patientId}/assessment/{assessmentId}/vitals
 *              /#/patient/{patientId}/assessment/{assessmentId}/faceToFaceMD
 *
 * Selectors confirmed via MCP UI exploration on 2026-04-06
 */
export class VisitRecordingPage extends BasePage {
  private readonly selectors = {
    // ============================================
    // Create Visit Modal
    // Triggered by clicking + on Visit(s) section in Care Plan
    // ============================================
    createVisitTitle: 'text=Create Visit',
    modal: 'ion-modal',                                      // generic ion-modal scope
    activeModal: 'ion-modal.show-page',                      // visible/active modal
    roleDropdownBtn: 'button:has-text("Role")',              // ion-select trigger
    typeDropdownBtn: 'button:has-text("Type")',              // ion-select trigger
    prnVisitCheckbox: 'ion-checkbox',                        // PRN Visit checkbox
    commentsInput: 'textarea[placeholder=""]',               // Comments textbox
    createVisitSubmitBtn: 'ion-modal button:has-text("Submit")',
    createVisitCancelBtn: 'ion-modal button:has-text("Cancel")',
    modalRoleBtn: 'ion-modal button:has-text("Role")',       // Role button scoped to modal
    modalTypeBtn: 'ion-modal button:has-text("Type")',       // Type button scoped to modal
    modalSubmitBtnText: 'ion-modal button:has-text("Submit")', // Submit button scoped to modal

    // ============================================
    // Generic Role/Radio/Button Selectors (parameterized)
    // ============================================
    radioByName: (name: string) => `ion-radio-group ion-item:has-text("${name}") ion-radio`,
    buttonByName: (name: string) => `button:has-text("${name}")`,
    textExact: (text: string) => `text="${text}"`,            // exact text match locator

    // ============================================
    // Assessment Left Nav (inside visit recording)
    // ============================================
    vitalsNavBtn: 'button:has-text("Vitals")',               // Left nav — Vitals section
    f2fNavBtn: 'button:has-text("Face To Face")',            // Left nav — Face To Face section
    summaryNavBtnRegex: 'button[aria-label^="summary icon"], button:has-text("Summary")', // Summary nav — avoids "Symptom Summary"

    // ============================================
    // Action Buttons (top of assessment)
    // ============================================
    cancelVisitBtn: 'button:has-text("Cancel Visit")',
    continueLaterBtn: 'button:has-text("Continue Later")',
    completeBtn: 'button:has-text("Complete")',

    // ============================================
    // Vitals — Blood Pressure
    // BP modal triggered by + button on Blood Pressure section
    // ============================================
    bpAddBtn: '#bloodPressureAdd',                           // + button on Blood Pressure row
    bpNumberInputs: 'ion-modal input[type="number"]',        // systolic (first), diastolic (second)
    bpLocationBtn: 'button:has-text("Location")',            // BP Location dropdown
    bpPositionBtn: 'button:has-text("Position")',            // BP Position dropdown
    modalSubmitBtn: '[data-cy="btn-input-modal-submit"]',    // shared submit btn across modals
    modalCancelBtn: '[data-cy="btn-input-modal-cancel"]',    // shared cancel btn across modals

    // ============================================
    // Face To Face Section
    // URL: /assessment/{id}/faceToFaceMD
    // ============================================
    narrativeAddBtn: '#clinicalNarrativesCardAdd',           // + button on Clinical Narrative
    narrativeSubjectInput: 'ion-modal [role="textbox"]',     // First textbox in narrative modal (Subject)
    narrativeDescriptionInput: 'ion-modal textarea[aria-label="Please specify"], ion-modal [aria-label="Please specify"]', // Description textbox
    attestationText: 'p:has-text("I confirm that I,")',      // pre-filled attestation paragraph
    attestationCheckbox: 'ion-checkbox:has-text("By checking this box and typing my name")', // F2F attestation checkbox
    attestationSignatoryInput: '[placeholder="Name of Signatory"]', // Signatory name input
    attestationDateInput: '[data-cy="date-input-attestationSignOnDate-date"]',  // ion-picker date
    ionPickerDoneBtn: 'button:has-text("Done")',             // ion-picker Done button

    // ============================================
    // Complete Visit Popup (Task modal)
    // Triggered by clicking Complete button
    // ============================================
    completePopupTitle: 'text=Task',
    onCallCheckbox: '[data-cy="checkbox-onCallCheck-onCall"]',
    startDateInput: '#assessmentStartDate input#date-value',       // ngb-datepicker — must use calendar, not fill()
    startDateCalendarBtn: '#assessmentStartDate button',
    startHoursInput: 'ion-modal textbox[name="Hours"] >> nth=0',
    startMinutesInput: 'ion-modal textbox[name="Minutes"] >> nth=0',
    endDateInput: '#assessmentEndDate input#date-value',           // ngb-datepicker — must use calendar, not fill()
    endDateCalendarBtn: '#assessmentEndDate button',
    endHoursInput: 'ion-modal textbox[name="Hours"] >> nth=1',
    endMinutesInput: 'ion-modal textbox[name="Minutes"] >> nth=1',
    mileageInput: '[data-cy="number-input-mileage"]',
    overlapAckCheckbox: '[data-cy="checkbox-ackOverlapCheck-acknowledgeOverlappingVisitText"]',
    completePopupSubmitBtn: '[data-cy="btn-input-modal-submit"]',
    completePopupCancelBtn: '[data-cy="btn-input-modal-cancel"]',
    ngbDatepicker: 'ngb-datepicker',                               // ngb-datepicker calendar overlay
    calendarBtnCustom: 'ion-modal.show-page button:has-text("custom calendar")', // calendar icon buttons in modal
    hoursInput: 'ion-modal.show-page input[aria-label="Hours"]',   // Hours textbox in active modal
    minutesInput: 'ion-modal.show-page input[aria-label="Minutes"]', // Minutes textbox in active modal
    inputRequiredMsg: 'p:has-text("Input Required")',              // Input Required validation message

    // ============================================
    // Care Plan Visit Grid — Edit existing visit
    // ============================================
    visitRowEditBtn: '[data-cy="icon-create"]',

    // ============================================
    // Edit Visit Modal (edit-visit-time component)
    // Triggered by pencil icon on visit row in Care Plan grid
    // Selectors confirmed via MCP on 2026-04-07
    // ============================================
    editVisitModal: 'edit-visit-time',
    editVisitStartDateInput: '#encounter-date-picker #date-value',
    editVisitStartDateCalBtn: '#encounter-date-picker button.inside-click-datepicker',
    editVisitStartDateClear: '#encounter-date-picker .delete-icon ion-icon[name="close"]',
    editVisitEndDateInput: '#encounter-time-picker #date-value',
    editVisitEndDateCalBtn: '#encounter-time-picker button.inside-click-datepicker',
    editVisitEndDateClear: '#encounter-time-picker .delete-icon ion-icon[name="close"]',
    editVisitSaveBtn: '#inputModalSubmit',
    editVisitCancelBtn: '#inputModalCancel',

    // ============================================
    // Initial Nursing Assessment (INA) — Sections
    // Selectors confirmed via MCP on 2026-04-07
    // ============================================
    inaSummaryNavBtn: '[data-cy="summaryNavButton"]',             // Left nav — Summary section (fallback: text "Summary")
    inaVitalsNavBtn: '[data-cy="vitalsNavButton"]',              // Left nav — Vitals section
    inaNarrativesAddBtn: '#narrativesCardAdd',                   // + button on Narratives card in Summary
    inaNarrativeOriginBtn: 'ion-modal button:has-text("Origin")', // Origin dropdown in narrative modal
    inaNarrativeCategoryBtn: 'ion-modal button:has-text("Category")', // Category dropdown in narrative modal
    inaNarrativeOriginSelect: '[data-cy="select-narrativeOrigin"]',
    inaNarrativeCategorySelect: '[data-cy="select-narrativeCategory"]',
    inaNarrativeDescriptionInput: '[data-cy="input-narrativeDescription"] textarea',
    inaHisReportBtn: '[data-cy="btn-hope-report"]',               // HOPE Report preview — must click before Complete (was btn-his-report)
    inaGoBackBtn: '[data-cy="btn-go-back"]',                     // Go Back To Section (after HOPE preview)

    // ============================================
    // INA Complete — Signature Modal (Step 1 of Complete)
    // Appears after clicking Complete on HIS preview
    // ============================================
    inaSignatureCheckbox: '[data-cy="checkbox-disclaimerChkCheck-labelAcknowledge"]',
    inaSignatureInput: '[data-cy="input-signature"] input',
    inaSignatureHintText: 'p:has-text("Input must match:")',     // Red hint with exact required name

    // ============================================
    // Void/Cancel Visit Dialog
    // ============================================
    voidReasonDropdown: 'text=Select a reason for void/cancelling',
    voidNotesInput: 'ion-modal textarea',
    voidAcknowledgeCheckbox: 'ion-modal ion-checkbox >> nth=-1',   // last checkbox in modal

    // ============================================
    // Generic page elements
    // ============================================
    body: 'body',
    patientInfoText: 'text=Patient Information',
    lastIonCheckbox: 'ion-checkbox >> nth=-1',                     // last ion-checkbox on page
    submitBtn: 'button:has-text("Submit")',                        // generic Submit button

    // ============================================
    // Postmortem Encounter — Death Assessment
    // Selectors confirmed via MCP on 2026-04-08
    // ============================================
    deathAssessmentNavBtn: 'button:has-text("Death Assessment")',
    summaryNavBtn: 'button:has-text("Summary")',
    // Patient Information sub-section
    dateOfDeathPicker: 'text=Date of Death >> .. >> .. >> button',   // ion-picker trigger (2 parents up)
    timeOfDeathPicker: 'text=Time of Death >> .. >> .. >> button',  // ion-picker trigger (2 parents up)
    locationPatientCare: 'radio[name="Patient\'s Care Location"]', // fallback: use getByRole
    // ============================================
    // Postmortem Complete — Discharge Modal
    // Appears instead of Task modal for Postmortem visits
    // ============================================
    dischargeAcknowledgeCheckbox: 'ion-checkbox:has-text("Please acknowledge")',
  };

  constructor(page: Page) {
    super(page);
  }

  // ============================================
  // Create Visit Modal
  // ============================================

  /**
   * Select visit role in the Create Visit modal.
   * Opens ion-select popover and clicks the matching radio option.
   * @param role - e.g., "Medical Director"
   */
  async selectVisitRole(role: string): Promise<void> {
    // Scope to the Create Visit modal to avoid matching other "Role" text on page
    const modal = this.page.locator(this.selectors.modal);
    await modal.getByRole('button', { name: 'Role' }).click();
    await this.page.waitForTimeout(500);
    await this.page.getByRole('radio', { name: role }).click();
    await this.page.waitForTimeout(500);
    console.log(`Selected visit role: ${role}`);
  }

  /**
   * Select visit type in the Create Visit modal.
   * Opens ion-select popover and clicks the matching radio option.
   * @param type - e.g., "Face to Face Visit"
   */
  async selectVisitType(type: string): Promise<void> {
    const modal = this.page.locator(this.selectors.modal);
    await modal.getByRole('button', { name: 'Type' }).click();
    await this.page.waitForTimeout(500);
    await this.page.getByRole('radio', { name: type }).click();
    await this.page.waitForTimeout(500);
    console.log(`Selected visit type: ${type}`);
  }

  /**
   * Submit the Create Visit form.
   * After submission, navigates to the assessment vitals page.
   */
  async submitNewVisit(): Promise<void> {
    const modal = this.page.locator(this.selectors.modal);
    const submitBtn = modal.getByRole('button', { name: 'Submit' });
    await expect(submitBtn).toBeEnabled({ timeout: 5000 });
    await submitBtn.click();
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(2000);
    console.log('Submitted new visit — navigated to assessment');
  }

  // ============================================
  // White Screen Recovery
  // ============================================

  /**
   * Handle white screen after visit creation.
   * If page loads blank, refresh and navigate back.
   * Returns true if recovery was needed.
   */
  async handleWhiteScreenRecovery(patientId: string): Promise<boolean> {
    await this.page.waitForTimeout(3000);
    const bodyText = await this.page.locator(this.selectors.body).innerText();
    const isBlank = bodyText.trim().length < 50;

    if (isBlank) {
      console.log('White screen detected — recovering...');
      await this.page.reload();
      await this.page.waitForLoadState('networkidle');
      return true;
    }
    return false;
  }

  /**
   * Click a visit row in the Care Plan visits grid to open it for recording.
   * Used after white screen recovery when the visit was created but didn't navigate.
   * @param visitType - e.g., "Face to Face"
   */
  async openVisitFromGrid(visitType: string): Promise<void> {
    // Visit grid rows are generic clickable elements containing the visit type text
    const visitRow = this.page.getByText(visitType, { exact: true }).first();
    if (await visitRow.isVisible({ timeout: 5000 }).catch(() => false)) {
      await visitRow.click();
      await this.page.waitForLoadState('networkidle');
      await this.page.waitForTimeout(3000);
      console.log(`Clicked visit row: ${visitType}`);
    } else {
      console.log(`Visit row "${visitType}" not found — reloading...`);
      await this.page.reload();
      await this.page.waitForLoadState('networkidle');
      await this.page.waitForTimeout(2000);
    }
  }

  // ============================================
  // Assessment Navigation
  // ============================================

  /**
   * Navigate to the Vitals section within the visit recording form.
   */
  async navigateToVitalsSection(): Promise<void> {
    await this.page.locator(this.selectors.vitalsNavBtn).click();
    await this.page.waitForTimeout(2000);
    console.log('Navigated to Vitals section');
  }

  /**
   * Navigate to the Face To Face section within the visit recording form.
   */
  async navigateToF2FSection(): Promise<void> {
    await this.page.locator(this.selectors.f2fNavBtn).click();
    await this.page.waitForTimeout(2000);
    console.log('Navigated to Face To Face section');
  }

  // ============================================
  // Vitals — Blood Pressure
  // ============================================

  /**
   * Fill Blood Pressure in the Vitals section.
   * Opens BP modal, fills location, position, systolic, diastolic, and submits.
   */
  async fillVitalsBloodPressure(
    systolic: string,
    diastolic: string,
    location: string = 'Left Arm',
    position: string = 'Sitting',
  ): Promise<void> {
    // Click + to open BP modal
    await this.page.locator(this.selectors.bpAddBtn).click();
    await this.page.waitForTimeout(1000);

    // Select Location (ion-select → radio popover)
    await this.page.getByRole('button', { name: 'Location' }).click();
    await this.page.waitForTimeout(500);
    await this.page.getByRole('radio', { name: location }).click();
    await this.page.waitForTimeout(500);

    // Select Position (ion-select → radio popover)
    await this.page.getByRole('button', { name: 'Position' }).click();
    await this.page.waitForTimeout(500);
    await this.page.getByRole('radio', { name: position }).click();
    await this.page.waitForTimeout(500);

    // Fill systolic and diastolic (must use input[type="number"], not spinbutton role)
    const numberInputs = this.page.locator(this.selectors.bpNumberInputs);
    await numberInputs.first().fill(systolic);
    await numberInputs.nth(1).fill(diastolic);

    // Submit
    const submitBtn = this.page.locator(this.selectors.modalSubmitBtn);
    await expect(submitBtn).toBeEnabled({ timeout: 5000 });
    await submitBtn.click();
    await this.page.waitForTimeout(1000);

    console.log(`Filled BP: ${systolic}/${diastolic} (${location}, ${position})`);
  }

  // ============================================
  // Face to Face — Clinical Narrative
  // ============================================

  /**
   * Add a Clinical Narrative entry in the F2F section.
   * Clicks + on Clinical Narrative, fills text, and submits.
   */
  async fillF2FNarrative(subject: string, text: string): Promise<void> {
    // Click + to add narrative
    await this.page.locator(this.selectors.narrativeAddBtn).click();
    await this.page.waitForTimeout(1000);

    // Modal has Subject* (required) and Description* (required)
    const modal = this.page.locator(this.selectors.modal);
    await modal.getByRole('textbox').first().fill(subject);
    await modal.getByRole('textbox', { name: 'Please specify' }).fill(text);

    // Submit
    const submitBtn = this.page.locator(this.selectors.modalSubmitBtn);
    await expect(submitBtn).toBeEnabled({ timeout: 5000 });
    await submitBtn.click();
    await this.page.waitForTimeout(1000);

    console.log('Filled F2F Clinical Narrative');
  }

  // ============================================
  // Face to Face — Attestation
  // ============================================

  /**
   * Check the F2F attestation checkbox.
   * "By checking this box and typing my name, I am electronically signing this document."
   */
  async checkF2FAttestation(): Promise<void> {
    await this.page.getByRole('checkbox', { name: 'By checking this box and typing my name' }).click();
    await this.page.waitForTimeout(500);
    console.log('Checked F2F attestation checkbox');
  }

  /**
   * Get the signatory name.
   * The attestation text contains the logged-in user's name.
   * Extract it from the attestation paragraph text.
   */
  async getSignatoryName(): Promise<string> {
    const attestationText = await this.page.locator(this.selectors.attestationText).textContent();
    if (!attestationText) throw new Error('Could not find attestation text');

    // Extract name: "I confirm that I, {NAME} had a face to face encounter..."
    const match = attestationText.match(/I confirm that I, (.+?) had a face to face/);
    if (!match) throw new Error(`Could not extract signatory name from: ${attestationText}`);

    const name = match[1].trim();
    console.log(`Extracted signatory name: ${name}`);
    return name;
  }

  /**
   * Fill the signatory name field in the F2F section.
   * The field is disabled until the attestation checkbox is checked.
   */
  async fillF2FSignatoryName(name: string): Promise<void> {
    const input = this.page.getByPlaceholder('Name of Signatory');
    await expect(input).toBeEnabled({ timeout: 5000 });
    await input.fill(name);
    await this.page.waitForTimeout(500);
    console.log(`Filled signatory name: ${name}`);
  }

  /**
   * Select the F2F attestation date using the ion-picker (scroll wheel).
   * Opens the date picker and accepts the default (today) by clicking Done.
   * @param month - Month name (e.g., "Mar"), defaults to current month
   * @param day - Day number (e.g., "15"), defaults to current day
   * @param year - Year string (e.g., "2026"), defaults to current year
   */
  async fillF2FDate(month?: string, day?: string, year?: string): Promise<void> {
    // Click the date element to open ion-picker
    await this.page.locator(this.selectors.attestationDateInput).click();
    await this.page.waitForTimeout(1000);

    // If specific date requested, scroll the picker columns
    if (month || day || year) {
      await this.page.evaluate(({ month, day, year }) => {
        const cols = document.querySelectorAll('.picker-col');
        // Column 0 = Month, Column 1 = Day, Column 2 = Year
        cols.forEach((col, i) => {
          const targetValue = i === 0 ? month : i === 1 ? day : year;
          if (!targetValue) return;
          const opts = Array.from(col.querySelectorAll('.picker-opt'));
          for (const opt of opts) {
            if (opt.textContent?.trim() === targetValue) {
              (opt as HTMLElement).click();
              break;
            }
          }
        });
      }, { month, day, year });
      await this.page.waitForTimeout(500);
    }

    // Click Done to accept
    await this.page.getByRole('button', { name: 'Done' }).click();
    await this.page.waitForTimeout(500);
    console.log(`Filled F2F attestation date`);
  }

  // ============================================
  // Visit Completion
  // ============================================

  /**
   * Click the Complete button to trigger the completion popup.
   */
  async clickCompleteVisit(): Promise<void> {
    await this.page.locator(this.selectors.completeBtn).click();
    await this.page.waitForTimeout(1000);
    console.log('Clicked Complete button');
  }

  /**
   * Fill start/end date and time in the Complete Visit popup.
   * Dates MUST be picked via ngb-datepicker calendar — fill() does not trigger Angular validation.
   * Uses selectDateFromPicker() from utils/form-helpers.ts.
   * @param startDate - Start date in MM/DD/YYYY format
   * @param endDate - End date in MM/DD/YYYY format
   * @param startTime - { hours: string, minutes: string } e.g., { hours: '10', minutes: '00' }
   * @param endTime - { hours: string, minutes: string } e.g., { hours: '10', minutes: '30' }
   */
  async fillCompleteVisitDates(
    startDate: string,
    endDate: string,
    startTime: { hours: string; minutes: string },
    endTime: { hours: string; minutes: string },
  ): Promise<void> {
    // --- Start Date ---
    await this.fillCompleteStartDate(startDate);

    // --- Start/End Times ---
    await this.fillCompleteTimes(startTime, endTime);

    // --- End Date ---
    await this.fillCompleteEndDate(endDate);

    console.log(`Filled complete visit: ${startDate} ${startTime.hours}:${startTime.minutes} - ${endDate} ${endTime.hours}:${endTime.minutes}`);
  }

  /**
   * Submit the Complete Visit popup.
   */
  async submitCompleteVisit(): Promise<void> {
    const modal = this.page.locator(this.selectors.modal);

    // Check for overlap acknowledgement checkbox and click if visible
    const overlapCheckbox = modal.locator(this.selectors.overlapAckCheckbox);
    if (await overlapCheckbox.isVisible({ timeout: 2000 }).catch(() => false)) {
      await overlapCheckbox.click();
      await this.page.waitForTimeout(500);
      console.log('Checked overlap acknowledgement checkbox');
    }

    const submitBtn = modal.getByRole('button', { name: 'Submit' });
    await expect(submitBtn).toBeEnabled({ timeout: 5000 });
    await submitBtn.click();
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(2000);
    console.log('Submitted Complete Visit');
  }

  /**
   * Click Continue Later to save progress without completing.
   */
  async clickContinueLater(): Promise<void> {
    await this.page.locator(this.selectors.continueLaterBtn).click();
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(2000);
    console.log('Clicked Continue Later');
  }

  /**
   * Cancel the current visit recording.
   */
  async cancelVisit(): Promise<void> {
    await this.page.locator(this.selectors.cancelVisitBtn).click();
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(2000);
    console.log('Cancelled visit');
  }

  // ============================================
  // Edit Existing Visit
  // ============================================

  /**
   * Edit an existing F2F visit's completed date.
   * Opens the Edit Visit modal (edit-visit-time component) from the Care Plan visit grid,
   * clears both start/end dates, picks the new date via calendar, and saves.
   * Selectors confirmed via MCP exploration on 2026-04-07.
   * @param newDate - The new date in MM/DD/YYYY format
   */
  async editF2FVisitDate(newDate: string): Promise<void> {
    // Click the edit (pencil) icon on the F2F visit row
    await this.page.locator(this.selectors.visitRowEditBtn).click();
    await this.page.waitForTimeout(2000);
    console.log('Clicked edit on F2F visit row — Edit Visit popup opened');

    // Wait for the edit-visit-time component to appear
    const modal = this.page.locator(this.selectors.editVisitModal);
    await modal.waitFor({ state: 'visible', timeout: 5000 });

    // --- Start Date ---
    // Clear existing start date via X icon
    await this.page.locator(this.selectors.editVisitStartDateClear).click({ force: true });
    await this.page.waitForTimeout(500);

    // Open start date calendar and pick new date
    await this.page.locator(this.selectors.editVisitStartDateCalBtn).click({ force: true });
    await this.page.waitForTimeout(1000);
    await selectDateFromPicker(this.page, newDate);
    await this.page.waitForTimeout(500);

    // --- End Date ---
    // Clear existing end date via X icon
    await this.page.locator(this.selectors.editVisitEndDateClear).click({ force: true });
    await this.page.waitForTimeout(500);

    // Open end date calendar and pick new date
    await this.page.locator(this.selectors.editVisitEndDateCalBtn).click({ force: true });
    await this.page.waitForTimeout(1000);
    await selectDateFromPicker(this.page, newDate);
    await this.page.waitForTimeout(500);

    // Click Save
    await this.page.locator(this.selectors.editVisitSaveBtn).click({ force: true });
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(2000);
    console.log(`Edited F2F visit date to: ${newDate}`);
  }

  // ============================================
  // Initial Nursing Assessment (INA)
  // ============================================

  /**
   * Navigate to the Vitals section in INA using the data-cy nav button.
   */
  async navigateToINAVitals(): Promise<void> {
    // Use the shared Vitals nav button — same as F2F
    await this.page.locator(this.selectors.vitalsNavBtn).click();
    await this.page.waitForTimeout(2000);
    console.log('Navigated to INA Vitals section');
  }

  /**
   * Navigate to the Summary section in INA.
   * Falls back to text match if data-cy nav button not found.
   */
  async navigateToINASummary(): Promise<void> {
    // "Summary" nav button — regex avoids matching "Symptom Summary"
    await this.page.getByRole('button', { name: /^summary icon/ }).click();
    await this.page.waitForTimeout(2000);
    console.log('Navigated to INA Summary section');
  }

  /**
   * Add a Narrative entry in the Summary section.
   * Opens the Narratives modal, fills description (required), and submits.
   * Origin and Category are optional — left as "Please Select" if not provided.
   * @param description - Narrative description text (required)
   * @param origin - Optional origin selection (e.g., "Patient")
   * @param category - Optional category selection (e.g., "General")
   */
  /**
   * Add a Narrative in the INA Summary section.
   * Uses ion-select → popover → radio pattern for Origin and Category.
   *
   * Some origins (General, Symptom Summary, Preferences) disable Category.
   * Section-specific origins (Pain, Vitals, Respiratory, etc.) enable Category.
   * If category is provided, it will be selected; if not, it's skipped.
   *
   * @param description - Narrative description text (required)
   * @param origin - Origin option name (required, e.g., "Pain", "General", "Vitals")
   * @param category - Category option name (optional — only select if provided and enabled)
   */
  async fillINANarrative(
    description: string,
    origin: string,
    category?: string,
  ): Promise<void> {
    await this.page.locator(this.selectors.inaNarrativesAddBtn).click();
    await this.page.waitForTimeout(1000);

    // Select Origin (required — ion-select → radio popover opens outside modal)
    const modal = this.page.locator(this.selectors.modal);
    await modal.getByRole('button', { name: 'Origin' }).click();
    await this.page.waitForTimeout(1000);
    await this.page.getByRole('radio', { name: origin, exact: true }).click();
    await this.page.waitForTimeout(1500);

    // Select Category if provided and enabled
    if (category) {
      const categoryBtn = modal.getByRole('button', { name: 'Category' });
      const isDisabled = await categoryBtn.isDisabled().catch(() => true);
      if (!isDisabled) {
        await categoryBtn.click();
        await this.page.waitForTimeout(1000);
        await this.page.getByRole('radio', { name: category, exact: true }).click();
        await this.page.waitForTimeout(1000);
      } else {
        console.log(`Category disabled for origin "${origin}" — skipping`);
      }
    }

    // Fill Description (required) — use data-cy selector, then type to trigger Angular change detection
    const descInput = this.page.locator(this.selectors.inaNarrativeDescriptionInput);
    await descInput.click();
    await descInput.fill(description);
    await this.page.waitForTimeout(500);
    // Trigger change detection with a keyboard event
    await descInput.press('Tab');
    await this.page.waitForTimeout(500);

    // Submit
    const submitBtn = this.page.locator(this.selectors.modalSubmitBtn);
    await expect(submitBtn).toBeEnabled({ timeout: 10000 });
    await submitBtn.click();
    await this.page.waitForTimeout(1000);

    console.log(`Filled INA Narrative (origin: ${origin}${category ? ', category: ' + category : ''})`);
  }

  /**
   * Click the HIS Report preview button.
   * Must be clicked before Complete — acts as a validation gate.
   */
  async clickHISReportPreview(): Promise<void> {
    await this.page.locator(this.selectors.inaHisReportBtn).click();
    await this.page.waitForTimeout(3000);
    console.log('Clicked HIS Report preview');
  }

  /**
   * Complete the INA visit — two-step process:
   * Step 1: Signature modal (acknowledge checkbox + electronic signature)
   * Step 2: Task modal (start/end dates + times — same as F2F)
   *
   * @param visitDate - Visit date in MM/DD/YYYY format
   * @param startTime - Start time { hours, minutes }
   * @param endTime - End time { hours, minutes }
   */
  async completeINAVisit(
    visitDate: string,
    startTime: { hours: string; minutes: string },
    endTime: { hours: string; minutes: string },
  ): Promise<void> {
    // Click Complete
    await this.page.locator(this.selectors.completeBtn).click();
    await this.page.waitForTimeout(2000);

    // --- Step 1: Signature Modal ---
    await this.fillINASignatureAndSubmit();

    // --- Step 2: Task Modal (dates/times — same as F2F) ---
    await this.fillCompleteVisitDates(visitDate, visitDate, startTime, endTime);
    await this.submitCompleteVisit();

    console.log(`INA visit completed: ${visitDate} ${startTime.hours}:${startTime.minutes} - ${endTime.hours}:${endTime.minutes}`);
  }

  /**
   * Fill the INA signature modal:
   * 1. Check the acknowledge checkbox
   * 2. Read the required signature name from the hint text
   * 3. Type the signature
   * 4. Submit
   */
  async fillINASignatureAndSubmit(): Promise<void> {
    const modal = this.page.locator(this.selectors.activeModal);

    // Check acknowledge checkbox
    await modal.locator(this.selectors.inaSignatureCheckbox).click();
    await this.page.waitForTimeout(500);

    // Type any character first to trigger the hint text
    const sigInput = modal.locator(this.selectors.inaSignatureInput);
    await sigInput.fill('x');
    await this.page.waitForTimeout(500);

    // Read the required name from hint: "Input must match: {name}"
    const hintLocator = modal.locator(this.selectors.inaSignatureHintText);
    const hintText = await hintLocator.textContent({ timeout: 3000 }).catch(() => '');
    const match = hintText?.match(/Input must match:\s*(.+)/);
    const requiredName = match ? match[1].trim() : '';

    if (!requiredName) {
      throw new Error('Could not extract required signature name from hint text');
    }

    // Clear and type the correct name
    await sigInput.fill(requiredName);
    await this.page.waitForTimeout(500);

    // Submit signature modal
    const submitBtn = modal.locator(this.selectors.modalSubmitBtn);
    await expect(submitBtn).toBeEnabled({ timeout: 5000 });
    await submitBtn.click();
    await this.page.waitForTimeout(2000);

    console.log(`INA signature submitted: ${requiredName}`);
  }

  // ============================================
  // Debug helpers — Complete popup date exploration
  // ============================================

  /**
   * Check if the Complete popup (Task modal) is visible.
   */
  async isCompletePopupVisible(): Promise<boolean> {
    return await this.page.locator(this.selectors.activeModal).isVisible().catch(() => false);
  }

  /**
   * Try multiple approaches to open and fill the start date in the Complete popup.
   * Returns true if the date was successfully filled.
   */
  async fillCompleteStartDate(date: string): Promise<boolean> {
    // Approach 1: Click calendar button inside #assessmentStartDate
    const calBtn = this.page.locator(this.selectors.startDateCalendarBtn);
    if (await calBtn.isVisible().catch(() => false)) {
      await calBtn.click();
      await this.page.waitForTimeout(1500);
    }

    let dpVisible = await this.page.locator(this.selectors.ngbDatepicker).isVisible().catch(() => false);

    // Approach 2: Click the input directly
    if (!dpVisible) {
      console.log('Start date: calendar btn did not open picker, trying input click...');
      const input = this.page.locator(this.selectors.startDateInput);
      await input.click();
      await this.page.waitForTimeout(1500);
      dpVisible = await this.page.locator(this.selectors.ngbDatepicker).isVisible().catch(() => false);
    }

    if (dpVisible) {
      await selectDateFromPicker(this.page, date);
      await this.page.locator(this.selectors.ngbDatepicker).waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
      await this.page.waitForTimeout(500);
      console.log(`Start date filled: ${date}`);
      return true;
    }

    console.log('Start date: could not open datepicker');
    return false;
  }

  /**
   * Try multiple approaches to open and fill the end date in the Complete popup.
   * Returns true if the date was successfully filled.
   */
  async fillCompleteEndDate(date: string): Promise<boolean> {
    const modal = this.page.locator(this.selectors.activeModal);

    // Approach 1: Second calendar button in modal
    const calBtns = modal.getByRole('button', { name: 'custom calendar' });
    const calCount = await calBtns.count();
    console.log(`End date: ${calCount} calendar buttons in modal`);

    if (calCount >= 2) {
      await calBtns.nth(1).click();
      await this.page.waitForTimeout(1500);
    }

    let dpVisible = await this.page.locator(this.selectors.ngbDatepicker).isVisible().catch(() => false);
    console.log(`End date approach 1 (nth(1) cal btn): datepicker visible = ${dpVisible}`);

    // Approach 2: Click end date input
    if (!dpVisible) {
      const endInput = this.page.locator(this.selectors.endDateInput);
      if (await endInput.isVisible().catch(() => false)) {
        await endInput.click();
        await this.page.waitForTimeout(1500);
        dpVisible = await this.page.locator(this.selectors.ngbDatepicker).isVisible().catch(() => false);
        console.log(`End date approach 2 (input click): datepicker visible = ${dpVisible}`);
      }
    }

    // Approach 3: JS click on second date-value input
    if (!dpVisible) {
      await this.page.evaluate(() => {
        const modal = document.querySelector('ion-modal.show-page');
        const inputs = modal?.querySelectorAll('input#date-value') || [];
        if (inputs.length >= 2) (inputs[1] as HTMLElement).click();
      });
      await this.page.waitForTimeout(1500);
      dpVisible = await this.page.locator(this.selectors.ngbDatepicker).isVisible().catch(() => false);
      console.log(`End date approach 3 (JS click): datepicker visible = ${dpVisible}`);
    }

    if (dpVisible) {
      await selectDateFromPicker(this.page, date);
      await this.page.locator(this.selectors.ngbDatepicker).waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
      await this.page.waitForTimeout(500);
      console.log(`End date filled: ${date}`);
      return true;
    }

    console.log('End date: could not open datepicker');
    return false;
  }

  /**
   * Fill start/end times in the Complete popup.
   */
  async fillCompleteTimes(
    startTime: { hours: string; minutes: string },
    endTime: { hours: string; minutes: string },
  ): Promise<void> {
    const modal = this.page.locator(this.selectors.activeModal);
    const hoursInputs = modal.getByRole('textbox', { name: 'Hours' });
    const minutesInputs = modal.getByRole('textbox', { name: 'Minutes' });

    await hoursInputs.first().fill(startTime.hours);
    await minutesInputs.first().fill(startTime.minutes);
    await hoursInputs.nth(1).fill(endTime.hours);
    await minutesInputs.nth(1).fill(endTime.minutes);
    await this.page.waitForTimeout(300);

    console.log(`Times filled: ${startTime.hours}:${startTime.minutes} - ${endTime.hours}:${endTime.minutes}`);
  }

  /**
   * Check if the Complete popup Submit button is enabled.
   */
  async isCompleteSubmitEnabled(): Promise<boolean> {
    const modal = this.page.locator(this.selectors.activeModal);
    return !(await modal.locator(this.selectors.completePopupSubmitBtn).isDisabled());
  }

  /**
   * Get the count of "Input Required" messages in the Complete popup.
   */
  async getCompleteInputRequiredCount(): Promise<number> {
    const modal = this.page.locator(this.selectors.activeModal);
    return await modal.locator(this.selectors.inputRequiredMsg).count();
  }

  // ============================================
  // Assessment Page — Wait for Ready
  // ============================================

  /**
   * Wait for the assessment page to be fully loaded after visit creation.
   * Looks for a nav button matching the given section name.
   * @param sectionName - Section to wait for (e.g., "Vitals", "Death Assessment", "Summary")
   */
  async waitForAssessmentReady(sectionName: string): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    await this.page.locator(this.selectors.buttonByName(sectionName)).first()
      .waitFor({ state: 'visible', timeout: 30000 });
    console.log(`Assessment ready — "${sectionName}" nav button visible`);
  }

  // ============================================
  // Postmortem Encounter — Death Assessment
  // ============================================

  /**
   * Navigate to the Death Assessment section.
   */
  async navigateToDeathAssessment(): Promise<void> {
    await this.page.locator(this.selectors.deathAssessmentNavBtn).first().click();
    await this.page.waitForTimeout(2000);
    console.log('Navigated to Death Assessment section');
  }

  /**
   * Navigate to the Summary section (generic — works for Postmortem, Standard RN, etc.).
   */
  async navigateToSummary(): Promise<void> {
    await this.page.getByRole('button', { name: /^summary icon/ }).click();
    await this.page.waitForTimeout(2000);
    console.log('Navigated to Summary section');
  }

  /**
   * Fill the Death Assessment Patient Information fields.
   * Uses ion-picker (scroll wheel) for Date and Time of Death — click Done to accept.
   * @param month - Month abbreviation (e.g., "Apr")
   * @param day - Day number (e.g., "8")
   * @param year - Year (e.g., "2026")
   * @param hour - Hour in 24h format (e.g., "10")
   * @param minute - Minute (e.g., "00")
   * @param location - "Patient's Care Location" or "Other"
   */
  async fillDeathAssessment(options: {
    month?: string;
    day?: string;
    year?: string;
    hour?: string;
    minute?: string;
    location?: string;
  } = {}): Promise<void> {
    // Scroll to Patient Information
    await this.page.locator(this.selectors.patientInfoText).first().scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(500);

    // --- Date of Death (ion-picker: Month / Day / Year) ---
    await this.page.locator(this.selectors.dateOfDeathPicker).first().click();
    await this.page.waitForTimeout(1000);

    // Select month/day/year in picker if provided, otherwise accept defaults
    if (options.month) {
      await this.page.getByRole('button', { name: options.month, exact: true }).click();
      await this.page.waitForTimeout(300);
    }
    if (options.day) {
      // Day column — use evaluate to click the right column's button
      await this.page.evaluate((day) => {
        const cols = document.querySelectorAll('.picker-col');
        if (cols[1]) {
          const opts = Array.from(cols[1].querySelectorAll('.picker-opt'));
          for (const opt of opts) {
            if (opt.textContent?.trim() === day) {
              (opt as HTMLElement).click();
              break;
            }
          }
        }
      }, options.day);
      await this.page.waitForTimeout(300);
    }
    if (options.year) {
      await this.page.getByRole('button', { name: options.year, exact: true }).click();
      await this.page.waitForTimeout(300);
    }
    await this.page.getByRole('button', { name: 'Done' }).click();
    await this.page.waitForTimeout(500);
    console.log(`Date of Death set: ${options.month ?? 'default'} ${options.day ?? 'default'} ${options.year ?? 'default'}`);

    // --- Location of Death ---
    const loc = options.location ?? "Patient's Care Location";
    await this.page.getByRole('radio', { name: loc }).click();
    await this.page.waitForTimeout(500);
    console.log(`Location of Death: ${loc}`);

    // --- Time of Death (ion-picker: Hour / Minute) ---
    await this.page.locator(this.selectors.timeOfDeathPicker).first().click();
    await this.page.waitForTimeout(1000);

    if (options.hour) {
      // Hour column
      await this.page.evaluate((hour) => {
        const cols = document.querySelectorAll('.picker-col');
        if (cols[0]) {
          const opts = Array.from(cols[0].querySelectorAll('.picker-opt'));
          for (const opt of opts) {
            if (opt.textContent?.trim() === hour) {
              (opt as HTMLElement).click();
              break;
            }
          }
        }
      }, options.hour);
      await this.page.waitForTimeout(300);
    }
    if (options.minute) {
      // Minute column
      await this.page.evaluate((minute) => {
        const cols = document.querySelectorAll('.picker-col');
        if (cols[1]) {
          const opts = Array.from(cols[1].querySelectorAll('.picker-opt'));
          for (const opt of opts) {
            if (opt.textContent?.trim() === minute) {
              (opt as HTMLElement).click();
              break;
            }
          }
        }
      }, options.minute);
      await this.page.waitForTimeout(300);
    }
    await this.page.getByRole('button', { name: 'Done' }).click();
    await this.page.waitForTimeout(500);
    console.log(`Time of Death set: ${options.hour ?? 'default'}:${options.minute ?? 'default'}`);
  }

  /**
   * Complete a Postmortem visit — two-step:
   * Step 1: Discharge Patient modal (acknowledge checkbox + submit)
   * Step 2: Task modal (start/end dates + times — same as other visit types)
   * WARNING: This will discharge the patient as Expired.
   *
   * @param visitDate - Visit date in MM/DD/YYYY format
   * @param startTime - Start time { hours, minutes }
   * @param endTime - End time { hours, minutes }
   */
  async completePostmortemVisit(
    visitDate: string,
    startTime: { hours: string; minutes: string },
    endTime: { hours: string; minutes: string },
  ): Promise<void> {
    // Click Complete
    await this.page.locator(this.selectors.completeBtn).click();
    await this.page.waitForTimeout(2000);

    // --- Step 1: Discharge Patient modal ---
    const checkbox = this.page.locator(this.selectors.lastIonCheckbox);
    await checkbox.click();
    await this.page.waitForTimeout(500);

    const submitBtn = this.page.locator(this.selectors.submitBtn);
    await expect(submitBtn).toBeEnabled({ timeout: 5000 });
    await submitBtn.click();
    await this.page.waitForTimeout(3000);
    console.log('Discharge acknowledged');

    // --- Step 2: Task modal (dates + times) ---
    await this.fillCompleteVisitDates(visitDate, visitDate, startTime, endTime);
    await this.submitCompleteVisit();

    console.log(`Postmortem visit completed: ${visitDate} — patient discharged as Expired`);
  }
}
