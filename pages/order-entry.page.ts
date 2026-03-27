import { Page } from '@playwright/test';
import { BasePage } from './base.page';
import { DateHelper } from '../utils/date-helper';
import { selectNgOptionByLabel, selectNgOption, fillInputByLabel } from '../utils/form-helpers';
import {
  OrderType,
  NonMedicationOrderType,
  OrderRole,
  OrderApprovalType,
  VFDiscipline,
  VisitFrequencyOrderData,
  NonMedicationOrderData,
  MedicationOrderData,
  CompoundMedicationOrderData,
  LOCOrderData,
  IntakeOrderData,
  DiscontinueOrderData,
  HospiceCoverageData,
  MARDetailsData,
  DocumentUploadData,
} from '../types/order.types';

/**
 * Order Entry Page Object
 * Handles all Order Entry functionality including:
 * - Visit Frequency orders
 * - Non-Medication orders (DME, Other, Supplies, Treatment)
 * - Medication orders (standard, compound/free text)
 * - Level of Care orders
 * - Intake Orders
 * - Document Upload
 * - Hospice Coverage
 * - Order grid operations (sort, filter, search, discontinue)
 */
export class OrderEntryPage extends BasePage {
  private readonly selectors = {
    // Navigation
    orderEntryBtn: '[class*="orderEntryBtn"]',
    exitOrderEntry: '[data-cy="btn-exit-order-entry-page"]',
    intakeOrdersBtn: '[data-cy="btn-intake-orders"]',
    levelOfCare:'a[href*="level-of-care"]',

    // Add Order
    addOrderBtn: '[data-cy="btn-create-new-order-for-patient"]',
    orderTypeDropdown: '[data-cy="select-order-type-dropdown"]',
    orderTypeOption: (type: string) => `[class="ng-option"] span:has-text("${type}")`,

    // Common Form Fields — each order type uses a different data-cy for the name input
    nameFieldByType: {
      DME: '[data-cy="input-type-of-durable-medical-equipment"] input',
      Other: '[data-cy="input-type-of-order"] input',
      Supplies: '[data-cy="input-type-of-supplies"] input',
      Treatment: '[data-cy="input-type-of-treatment"] input',
    } as Record<string, string>,
    // DME uses "input-issue"; Other/Supplies/Treatment use voice-ion-textarea "input-order-instructions"
    descriptionFieldByType: {
      DME: '[data-cy="input-issue"] input',
      Other: '[data-cy="input-order-instructions"] textarea',
      Supplies: '[data-cy="input-order-instructions"] textarea',
      Treatment: '[data-cy="input-order-instructions"] textarea',
    } as Record<string, string>,
    startDateBtn: '[data-cy="date-order-start-date"]',
    discontinueDateField: '[data-cy="date-discontinue-date"]',
    orderingProviderInput: '[data-cy="select-ordering-provider"] input',
    providerDropdownOption: '.ng-option-label',

    // Order Approval
    verbalRadio: '[data-cy="radio-verbal"] button',
    writtenRadio: '[data-cy="radio-written"] button',
    readBackCheckbox: '[data-cy="checkbox-e-sign-verification"] button',
    readBackVerified: '[data-cy="checkbox-read-back-and-verified"] button',

    // Submit / Cancel
    submitBtn: '.button-md-success > .button-inner',
    proceedBtn: '[data-cy="btn-proceed"]',
    cancelBtn: '.footer > .button-md-danger > .button-inner',
    discontinuesubmitBtn: '.discontinue-footer > .button:nth-child(2)',

    // Visit Frequency Fields
    disciplineDropdown: '[data-cy="select-discipline"]',
    otherDisciplineDropdown: '[data-cy="select-other-discipline"]',
    // VF form fields are ng-select dropdowns found by label proximity
    // Visit(s), Frequency, Duration, Duration Timeframe are ng-select comboboxes
    prnCheckbox: '[data-cy="checkbox-prn"]',
    prnReasonInput: 'input[data-cy="input-prn-reason"]',
    prnQuantityInput: 'input[data-cy="input-prn-quantity"]',
    serviceDeclinedCheckbox: '[data-cy="checkbox-service-declined"]',
    dateDeclinedField: '[data-cy="date-declined"]',
    declinedReasonDropdown: '[data-cy="select-declined-reason"]',
    vfDescription: '[data-cy="value-description"]',

    // Non-Medication Fields (DME, Other, Supplies, Treatment)
    bodySystemsDropdown: '[data-cy="select-body-systems"]',

    // Medication Fields
    medicationSearchInput: '[data-cy="select-name"] input',
    medicationOption: '.ng-option-label',
    strengthDropdown: '[data-cy="select-strength"]',
    strengthInput: '[data-cy="select-strength"] input',
    dosageInput: '[data-cy="input-medication-dosage"] input',
    routeInput: '[data-cy="input-route"] input',
    frequencyInput: '[data-cy="input-medication-frequency"] input',
    marCheckbox: '[data-cy="checkbox-mar"]',
    marTimeInput: '[data-cy="input-mar-time"]',
    marDaysOfWeekDropdown: '[data-cy="select-mar-days"]',
    marAdministrationDropdown: '[data-cy="select-mar-administration"]',
    marNotesInput: '[data-cy="input-mar-notes"]',

    // Compound/Free Text Medication
    compoundFreeTextCheckbox: '[data-cy="checkbox-compound-free-text"]',
    compoundMedNameInput: '[data-cy="input-compound-med-name"]',
    addIngredientBtn: '[data-cy="btn-add-ingredient"]',
    ingredientInput: (index: number) => `[data-cy="input-ingredient-${index}"]`,

    // Level of Care Fields
    levelOfCareDropdown: '[data-cy="select-level-of-care"]',
    careLocationTypeDropdown: '[data-cy="select-care-location-type"]',
    careLocationInput: '[data-cy="select-care-location"] input',
    respiteReasonInput: '.input > [data-cy="input-reason-for-respite"]',
    gipReasonPainCheckbox: '[data-cy="checkbox-pain"]',
    symptomsDropdown: '[data-cy="select-symptoms"]',
    agitationSymptom: '[data-cy="symptoms-option-agitation"]',
    closeSymptomDropdown: '[data-cy="select-symptoms"] [class="ng-arrow"]',

    // Hospice Coverage
    hospicePaysYes: '[data-cy="radio-yes"] button',
    hospicePaysNo: '[data-cy="radio-no"] button',
    reasonForNonCoverageDropdown: '[data-cy="select-reason-non-coverage"]',

    // Document Upload
    uploadFileInput: 'input[data-cy="button-file-upload"]',
    uploadsignedfileInput: 'input[id="my-file-selector"]',
    documentIndicator: '[data-cy="icon-document-indicator"]',

    // Attestation (Provider login)
    attestationCheckbox: '[data-cy="checkbox-attestation"]',
    attestationMessage: '[data-cy="text-attestation-message"]',

    // Order Grid
    orderGrid: '[data-cy="order-grid"]',
    orderRow: '[data-cy="order"]',
    orderRowByIndex: (index: number) => `[data-cy="order"]:nth-child(${index + 1})`,
    caretIcon: '[data-cy="order-created-row-btn-show-order-details"]',
    ellipsisMenu: '[data-cy="order-created-row-btn-show-edit-view-options-popover"]',
    orderDetailsSection: '[data-cy="order-details-header"]',
    historySection: '[data-cy="history-header"]',
    historyReason: '[data-cy="value-history-reason"]',
    historyActionTaken: '[data-cy="value-history-action-taken"]',
    discontinueSection: '[data-cy="discontinue-header"]',
    discontinueReason: '[data-cy="value-discontinue-reason"]',
    discontinueDate: '[data-cy="value-discontinue-date"]',
    discontinueProvider: '[data-cy="value-discontinue-providers-name"]',
    discontinueStatus: '[data-cy="value-discontinue-status"]',

    // Ellipsis Menu Options
    discontinueOption: '[data-cy="btn-discontinue-order"]',
    editHospiceCoverageOption: '[data-cy="btn-amend-hospice-coverage"]',
    voidOrderOption: '[data-cy="btn-void-loc"]',
    addEditMAROption: '[data-cy="btn-add-edit-mar-details"]',
    uploadSignedOrderOption: '[data-cy="btn-upload-signed-order"]',
    convertToOrderOption: '[data-cy="btn-convert-to-order"]',
    editIntakeOrderOption: '[data-cy="btn-edit-intake-order"]',
    deleteIntakeOrderOption: '[data-cy="btn-delete-intake-order"]',
    addOperationalNoteOption: '[data-cy="btn-add-operational-note"]',
    printOrderOption: '[data-cy="btn-print-order"]',

    // Discontinue Popup — dialog has NO data-cy attributes, use role/placeholder selectors
    // These are resolved dynamically in the discontinueOrder() method

    // Void Order Popup
    voidDateField: 'cur-date-picker[ng-reflect-name="voidDate"]',
    voidReasonInput: 'input[ng-reflect-name="voidReason"]',
    voidSubmitBtn: '.cancel-footer > button:nth-child(2)',

    // Edit Hospice Coverage Popup
    hospiceCoverageYesRadio: 'input[id="hospiceDoesPay"]',
    hospiceCoverageNoRadio: 'input[id="hospiceDoesNotPay"]',
    hospiceCoverageReasonDropdown: 'input[id="coverageDesignation"]',
    editHospiceCoverage:'[id="coverageDesignation"] input',
    hospiceCoverageSubmitBtn: 'button[id="inputModalSubmit"]',

    // MAR Details Popup
    marPopupCheckbox: 'input[id="needs-to-be-added-to-mar-checkbox"]',
    marPopupShowDetails: '[data-cy="link-show-hide-mar-details"]',
    marPopupTimeHourUp: '[class="ngb-tp-hour"] button:nth-child(1)',
    marPopupTimeMinUp: '[class="ngb-tp-minute"] button:nth-child(1)',
    marPopupAddTimeBtn: 'button[id="add-time-button"]',
    marPopupDaysOfWeek: '[id="days-of-the-week-selector"] input',
    marPopupSelectAllDays: 'input[id="select-all"]',
    marPopupAdminDropdown: '[formcontrolname="selectedAdministrationFrequency"] input',
    marPopupNotesInput: '[id="additional-notes-text-area"] input',
    marPopupSubmitBtn: '[id="btn-submit-add-edit-mar-details-modal"]',

    // Operational Note Popup
    operationalNoteInput: '[data-cy="input-operational-note"]',
    operationalNoteSaveBtn: '[data-cy="btn-save-note"]',

    // Grid Controls
    hideDiscontinuedToggle: '[data-cy="toggle-hide-discontinued-canceled-rejected-orders"]',
    searchInput: 'input.searchbar-input',
    filterTypeDropdown: '[data-cy="select-order-type"]',
    filterSignedDropdown: '[data-cy="select-filter-signed-status"]',
    filterTeamsDropdown: '[data-cy="select-filter-teams"]',
    dateFilter: '[data-cy="date-filter"]',
    dateFrom: '[data-cy="date-activities-from-date-picker"]',
    dateTo: '[data-cy="date-activites-to-date-picker"]',
    sortColumnHeader: (column: string) => `[data-cy="header-${column}"]`,
    printAllBtn: '[data-cy="btn-print-all"]',
    printFilteredBtn: '[data-cy="btn-print-filtered"]',

    // Warning Messages
    warningMessage: '.errorText, [class*="warning"], [class*="alert-warning"]',
    disciplineWarning: 'span.disciplineErrorText, [class*="disciplineErrorText"]',
    datePickerWarning: 'span.datePickerErrorText, [class*="datePickerErrorText"]',
    duplicateWarning: '.errorText:has-text("already exists")',

    // Intake Orders Page
    intakeOrderGrid: '[data-cy="intake-order-grid"]',
    intakeAddBtn: '[data-cy="btn-add-intake-order"]',
  };

  constructor(page: Page) {
    super(page);
  }

  // ============================================
  // Navigation
  // ============================================

  async navigateToOrderEntry(): Promise<void> {
    await this.page.locator(this.selectors.orderEntryBtn).scrollIntoViewIfNeeded();
    await this.page.locator(this.selectors.orderEntryBtn).click();
    await this.page.waitForTimeout(3000);
    console.log('Navigated to Order Entry');
  }
  async navigateToLevelOfCare(): Promise<void> {
    await this.page.locator(this.selectors.levelOfCare).first().scrollIntoViewIfNeeded();
    await this.page.locator(this.selectors.levelOfCare).first().click();
    await this.page.waitForTimeout(3000);
    console.log('Navigated to Level of Care Orders');
  }


  async exitOrderEntry(): Promise<void> {
    const exitBtn = this.page.locator(this.selectors.exitOrderEntry);
    try {
      await exitBtn.waitFor({ state: 'visible', timeout: 5000 });
      await exitBtn.click();
      await this.page.waitForTimeout(3000);
      console.log('Exited Order Entry');
    } catch {
      console.log('Exit button not found, may already be on patient page');
    }
  }

  async navigateToIntakeOrders(): Promise<void> {
    await this.page.locator(this.selectors.intakeOrdersBtn).click();
    await this.page.waitForTimeout(3000);
    console.log('Navigated to Intake Orders');
  }

  // ============================================
  // Add Order - Common
  // ============================================

  async clickAddOrder(): Promise<void> {
    await this.page.locator(this.selectors.addOrderBtn).click();
    await this.page.waitForTimeout(2000);
    console.log('Clicked Add Order');
  }

  async selectOrderType(orderType: string): Promise<void> {
    // Map short type names to the actual dropdown option text
    const orderTypeMap: Record<string, string> = {
      'DME': 'Durable Medical Equipment',
      'Medication': 'Medication - non-eRx',
    };
    const displayName = orderTypeMap[orderType] || orderType;

    await this.page.locator(this.selectors.orderTypeDropdown).click();
    await this.page.waitForTimeout(1000);
    await this.page.getByRole('option', { name: displayName }).click();
    await this.page.waitForTimeout(2000);
    console.log(`Selected order type: ${displayName}`);
  }

  async setStartDate(dateString: string): Promise<void> {
    // Try data-cy selector first
    const startDateBtn = this.page.locator(this.selectors.startDateBtn);
    if (await startDateBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      const isDisabled = await startDateBtn.isDisabled().catch(() => false);
      if (isDisabled) {
        console.log('Start date is auto-populated and disabled, skipping');
        return;
      }
      await startDateBtn.click();
      await this.page.waitForTimeout(1000);
      await DateHelper.selectDateFormatted(this.page, dateString);
      console.log(`Set start date: ${dateString}`);
      return;
    }

    // Fallback: find the calendar button near "Order Start Date" label
    const calendarBtn = this.page.locator(
      `xpath=//*[text()[normalize-space()="Order Start Date"]]/ancestor::*[.//button[contains(.,"calendar") or @aria-label="custom calendar"]][1]//button[contains(.,"calendar") or @aria-label="custom calendar"]`
    ).first();

    if (await calendarBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await calendarBtn.click();
      await this.page.waitForTimeout(1000);
      await DateHelper.selectDateFormatted(this.page, dateString);
      console.log(`Set start date via calendar: ${dateString}`);
      return;
    }

    // Last fallback: the date may already be pre-populated
    console.log('Start date appears pre-populated, skipping');
  }

  async selectOrderingProvider(role: OrderRole, providerName: string): Promise<void> {
    switch (role) {
      case 'Registered Nurse (RN)':
      case 'Case Manager':
      case 'NP': {
        await this.page.locator(this.selectors.orderingProviderInput).click();
        await this.page.waitForTimeout(1000);
        await this.page.locator(this.selectors.orderingProviderInput).fill(providerName);
        await this.page.waitForTimeout(2000);
        await this.page.locator(this.selectors.providerDropdownOption).first().click();
        await this.page.waitForTimeout(1000);
        console.log(`Selected provider: ${providerName}`);
        break;
      }
      case 'MD': {
        // Provider auto-populates for MD
        console.log('MD provider auto-populated');
        break;
      }
    }
  }

  async selectApprovalType(approvalType: OrderApprovalType): Promise<void> {
    switch (approvalType) {
      case 'Verbal':
        await this.page.locator(this.selectors.verbalRadio).click();
        await this.page.waitForTimeout(1000);
        console.log('Selected Verbal approval');
        break;
      case 'Written':
        await this.page.locator(this.selectors.writtenRadio).click();
        await this.page.waitForTimeout(1000);
        console.log('Selected Written approval');
        break;
      case 'No Signature Required':
        await this.page.locator('[data-cy="radio-no-signature-required"]').click();
        await this.page.waitForTimeout(1000);
        console.log('Selected No Signature Required');
        break;
    }
  }

  async selectReadBack(): Promise<void> {
    await this.page.locator(this.selectors.readBackCheckbox).click();
    await this.page.waitForTimeout(1000);
    console.log('Selected Read Back checkbox');
  }

  async clickReadBackVerified(): Promise<void> {
    // Checkbox has no data-cy; it's a sibling of the "Read Back and Verified" label text
    // Navigate from the text to parent, then find the checkbox within
    const checkbox = this.page.locator('ion-modal').getByText('Read Back and Verified').locator('..').getByRole('checkbox');
    await checkbox.click({ force: true });
    await this.page.waitForTimeout(1000);
    console.log('Clicked Read back & Verified');
  }

  async submitOrder(): Promise<void> {
    // Try multiple selector strategies for the submit button
    const submitBtn = this.page.locator(this.selectors.submitBtn);
    const submitByRole = this.page.getByRole('button', { name: 'Submit' });

    if (await submitBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await submitBtn.click({ force: true });
    } else {
      await submitByRole.click({ force: true });
    }
    await this.waitForOrderCreation();
    console.log('Order submitted');
  }

  async clickProceed(): Promise<void> {
    // Try Proceed button first, then fall back to Submit
    const proceedBtn = this.page.locator(this.selectors.proceedBtn);
    const submitByRole = this.page.getByRole('button', { name: 'Submit' });

    if (await proceedBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await proceedBtn.click({ force: true });
    } else {
      await submitByRole.click({ force: true });
    }
    await this.waitForOrderCreation();
    console.log('Clicked Proceed/Submit');
  }

  /**
   * Wait for "Creating order..." dialog to appear and disappear
   */
  private async waitForOrderCreation(): Promise<void> {
    // Wait for creating dialog to appear
    const creatingDialog = this.page.getByText('Creating order');
    try {
      await creatingDialog.waitFor({ state: 'visible', timeout: 5000 });
      console.log('Order creation in progress...');
      // Wait for it to disappear (order created)
      await creatingDialog.waitFor({ state: 'hidden', timeout: 30000 });
      console.log('Order creation completed');
    } catch {
      // Dialog may not appear or may have already disappeared
      console.log('Creating dialog not detected, waiting briefly...');
      await this.page.waitForTimeout(3000);
    }
    // Wait for the Add Order modal to close (backdrop can block grid interactions)
    try {
      await this.page.locator('ion-modal.add-order-modal').waitFor({ state: 'hidden', timeout: 10000 });
      console.log('Add Order modal closed');
    } catch {
      console.log('Add Order modal still visible, continuing...');
    }
    await this.page.waitForTimeout(2000);
  }

  async cancelOrder(): Promise<void> {
    // Try data-cy selector first, fallback to button text
    const cancelBtn = this.page.locator(this.selectors.cancelBtn);
    if (await cancelBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await cancelBtn.click();
    } else {
      await this.page.locator('button:has-text("Cancel")').first().click();
    }
    await this.page.waitForTimeout(2000);
    console.log('Cancelled order form');
  }

  // ============================================
  // Visit Frequency Order
  // ============================================

  async selectDiscipline(discipline: VFDiscipline): Promise<void> {
    await this.page.locator(this.selectors.disciplineDropdown).click();
    await this.page.waitForTimeout(1000);
    await this.page.locator('[class*="ng-option"] span')
      .filter({ hasText: discipline })
      .click();
    await this.page.waitForTimeout(1000);
    console.log(`Selected discipline: ${discipline}`);
  }

  async selectOtherDiscipline(otherDiscipline: string): Promise<void> {
    await this.page.locator(this.selectors.otherDisciplineDropdown).click();
    await this.page.waitForTimeout(1000);

    // Check if it's a custom discipline (not in the standard list)
    const option = this.page.locator('[class*="ng-option"] span')
      .filter({ hasText: otherDiscipline });

    if (await option.count() > 0) {
      await option.click();
    } else {
      // Type custom discipline and select "Other (custom)" option
      await this.page.locator(this.selectors.otherDisciplineDropdown + ' input').fill(otherDiscipline);
      await this.page.waitForTimeout(1000);
      await this.page.locator('[class*="ng-option"]').first().click();
    }
    await this.page.waitForTimeout(1000);
    console.log(`Selected other discipline: ${otherDiscipline}`);
  }

  async fillVisitCount(count: number): Promise<void> {
    await selectNgOptionByLabel(this.page, 'Visit(s)', String(count));
    console.log(`Filled visit count: ${count}`);
  }

  async selectTimeInterval(interval: string): Promise<void> {
    await selectNgOptionByLabel(this.page, 'Frequency', interval);
    console.log(`Selected time interval: ${interval}`);
  }

  async selectDuration(duration: string): Promise<void> {
    await selectNgOptionByLabel(this.page, 'Duration', duration);
    console.log(`Selected duration: ${duration}`);
  }

  async enablePRN(): Promise<void> {
    const prnCb = this.page.locator(this.selectors.prnCheckbox);
    if (await prnCb.isVisible({ timeout: 2000 }).catch(() => false)) {
      await prnCb.click();
    } else {
      // Non-eRx: checkbox near "PRN" text
      await this.page.getByText('PRN', { exact: true }).locator('..').locator('ion-checkbox, input[type="checkbox"]').first().click({ force: true });
    }
    await this.page.waitForTimeout(1000);
    console.log('Enabled PRN checkbox');
  }

  async fillPRNDetails(reason: string, quantity: number): Promise<void> {
    await this.page.locator(this.selectors.prnReasonInput).fill(reason);
    await this.page.waitForTimeout(500);

    // PRN Quantity is a readonly spinner (data-cy="input-quantity") defaulting to 1
    // Use arrow up/down buttons to set the desired value
    const qtyInput = this.page.locator('input[data-cy="input-quantity"]');
    const currentVal = parseInt(await qtyInput.getAttribute('ng-reflect-model') || '1', 10);
    if (quantity > currentVal) {
      for (let i = 0; i < quantity - currentVal; i++) {
        await this.page.locator('img[alt="arrow up"]').click();
        await this.page.waitForTimeout(300);
      }
    } else if (quantity < currentVal) {
      for (let i = 0; i < currentVal - quantity; i++) {
        await this.page.locator('img[alt="arrow down"]').click();
        await this.page.waitForTimeout(300);
      }
    }
    console.log(`Filled PRN details - reason: ${reason}, quantity: ${quantity}`);
  }

  async enableServiceDeclined(): Promise<void> {
    await this.page.locator(this.selectors.serviceDeclinedCheckbox).click();
    await this.page.waitForTimeout(1000);
    console.log('Enabled Service Declined checkbox');
  }

  async fillServiceDeclinedDetails(dateDeclined: string, reason: string): Promise<void> {
    await this.page.locator(this.selectors.dateDeclinedField).click();
    await this.page.waitForTimeout(500);
    await DateHelper.selectDateFormatted(this.page, dateDeclined);

    await this.page.locator(this.selectors.declinedReasonDropdown).click();
    await this.page.waitForTimeout(1000);
    await this.page.locator('[class*="ng-option"] span')
      .filter({ hasText: reason })
      .first()
      .click();
    await this.page.waitForTimeout(500);
    console.log(`Filled service declined: date=${dateDeclined}, reason=${reason}`);
  }

  async getVFDescription(): Promise<string> {
    const desc = await this.page.locator('[data-cy="value-description"]').textContent({ timeout: 5000 }).catch(() => '');
    return desc || '';
  }

  /**
   * Enter a complete Visit Frequency order
   */
  async addVisitFrequencyOrder(data: VisitFrequencyOrderData): Promise<void> {
    console.log('\n--- Adding Visit Frequency Order ---');

    await this.clickAddOrder();
    await this.selectOrderType('Visit Frequency');

    await this.selectDiscipline(data.discipline);

    if (data.discipline === 'Other' && data.otherDiscipline) {
      await this.selectOtherDiscipline(data.otherDiscipline);
    }

    await this.fillVisitCount(data.numberOfVisits);
    await this.selectTimeInterval(data.timeInterval);
    await this.selectDuration(data.duration);

    if (data.isPRN && data.prnReason && data.prnQuantity) {
      await this.enablePRN();
      await this.fillPRNDetails(data.prnReason, data.prnQuantity);
    }

    if (data.isServiceDeclined && data.dateDeclined && data.declinedReason) {
      await this.enableServiceDeclined();
      await this.fillServiceDeclinedDetails(data.dateDeclined, data.declinedReason);
    }

    await this.setStartDate(data.startDate);
    await this.selectOrderingProvider(data.role, data.orderingProvider);
    await this.selectApprovalType(data.approvalType);

    await this.clickProceed();
    console.log('Visit Frequency order submitted\n');
  }

  // ============================================
  // Non-Medication Orders (DME, Other, Supplies, Treatment)
  // ============================================

  async fillOrderName(name: string, orderType?: NonMedicationOrderType): Promise<void> {
    // Each non-medication order type has a different data-cy for the name input
    const selector = orderType
      ? this.selectors.nameFieldByType[orderType]
      : null;

    if (selector) {
      const input = this.page.locator(selector);
      await input.scrollIntoViewIfNeeded();
      await input.click();
      await input.fill(name);
    } else {
      // Fallback: find the first visible text input with placeholder "Please be specific"
      const input = this.page.locator('input[placeholder="Please be specific"]').first();
      await input.scrollIntoViewIfNeeded();
      await input.click();
      await input.fill(name);
    }
    await this.page.waitForTimeout(500);
    console.log(`Filled order name: ${name}`);
  }

  async selectHospicePays(hospicePays: boolean): Promise<void> {
    const label = hospicePays ? 'Yes' : 'No';
    const dataCySelector = hospicePays ? this.selectors.hospicePaysYes : this.selectors.hospicePaysNo;
    const dataCyBtn = this.page.locator(dataCySelector);
    if (await dataCyBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await dataCyBtn.click();
    } else {
      // Fallback: use radio role
      await this.page.getByRole('radio', { name: label }).click({ force: true });
    }
    await this.page.waitForTimeout(1000);
    console.log(`Selected hospice pays: ${label}`);
  }

  async selectReasonForNonCoverage(reason: string): Promise<void> {
    await this.page.locator(this.selectors.reasonForNonCoverageDropdown).click();
    await this.page.waitForTimeout(1000);
    await this.page.locator('[class*="ng-option"] span')
      .filter({ hasText: reason })
      .click();
    await this.page.waitForTimeout(500);
    console.log(`Selected non-coverage reason: ${reason}`);
  }

  /**
   * Select body systems dropdown (DME only).
   * This is a multi-select ng-select with checkbox options.
   */
  async selectBodySystems(system: string): Promise<void> {
    await this.page.locator(this.selectors.bodySystemsDropdown).click({ force: true });
    await this.page.waitForTimeout(1000);
    await this.page.getByRole('option', { name: system }).click();
    await this.page.waitForTimeout(500);
    // Close the dropdown by clicking outside
    await this.page.locator(this.selectors.bodySystemsDropdown).locator('.ng-arrow').click({ force: true }).catch(() => {});
    await this.page.waitForTimeout(500);
    console.log(`Selected body system: ${system}`);
  }

  /**
   * Enter a complete Non-Medication order (DME, Other, Supplies, or Treatment)
   */
  async addNonMedicationOrder(data: NonMedicationOrderData): Promise<void> {
    console.log(`\n--- Adding ${data.orderType} Order ---`);

    await this.clickAddOrder();
    await this.selectOrderType(data.orderType);

    await this.fillOrderName(data.name, data.orderType);

    // DME has Body Systems (required) and Issue fields
    if (data.orderType === 'DME') {
      if (data.bodySystem) {
        await this.selectBodySystems(data.bodySystem);
      }
      if (data.description) {
        const issueInput = this.page.locator(this.selectors.descriptionFieldByType['DME']);
        await issueInput.click();
        await issueInput.fill(data.description);
        await this.page.waitForTimeout(500);
      }
    } else if (data.description) {
      // Other/Supplies/Treatment use voice-ion-textarea for "Order Instructions"
      const descSelector = this.selectors.descriptionFieldByType[data.orderType];
      if (descSelector) {
        const textarea = this.page.locator(descSelector);
        if (await textarea.isVisible({ timeout: 2000 }).catch(() => false)) {
          await textarea.click();
          await textarea.fill(data.description);
          await this.page.waitForTimeout(500);
        }
      }
    }

    // Hospice Coverage is required for all non-med order types
    if (data.hospicePays !== undefined) {
      await this.selectHospicePays(data.hospicePays);
      if (!data.hospicePays && data.reasonForNonCoverage) {
        await this.selectReasonForNonCoverage(data.reasonForNonCoverage);
      }
    }

    await this.setStartDate(data.startDate);

    await this.selectOrderingProvider(data.role, data.orderingProvider);
    await this.selectApprovalType(data.approvalType);

    // Other, Treatment, and Medication orders require "Read back & Verified" when approval is Verbal
    if (data.approvalType === 'Verbal' && ['Other', 'Treatment'].includes(data.orderType)) {
      await this.clickReadBackVerified();
    }

    await this.submitOrder();
    console.log(`${data.orderType} order submitted\n`);
  }

  // ============================================
  // Medication Orders
  // ============================================

  async searchMedication(medicationName: string): Promise<void> {
    await this.page.locator(this.selectors.medicationSearchInput).click();
    await this.page.waitForTimeout(500);
    await this.page.locator(this.selectors.medicationSearchInput).fill(medicationName);
    await this.page.waitForTimeout(2000);
    // Select the first option whose text contains the medication name
    const matchingOption = this.page.locator(this.selectors.medicationOption)
      .filter({ hasText: medicationName })
      .first();
    if (await matchingOption.isVisible({ timeout: 3000 }).catch(() => false)) {
      await matchingOption.click();
    } else {
      // Fallback to first option if no exact text match
      await this.page.locator(this.selectors.medicationOption).first().click();
    }
    await this.page.waitForTimeout(1000);
    console.log(`Selected medication: ${medicationName}`);
  }

  async selectStrength(strength: string): Promise<void> {
    await this.page.locator(this.selectors.strengthDropdown).click();
    await this.page.waitForTimeout(1000);
    await this.page.locator('[class*="ng-option"] span')
      .filter({ hasText: strength })
      .click();
    await this.page.waitForTimeout(500);
    console.log(`Selected strength: ${strength}`);
  }

  async enterCustomStrength(strength: string): Promise<void> {
    await this.page.locator(this.selectors.strengthInput).fill(strength);
    await this.page.waitForTimeout(1000);
    // Click "Other (custom strength)" option
    await this.page.locator('[class*="ng-option"]')
      .filter({ hasText: `Other (${strength})` })
      .click();
    await this.page.waitForTimeout(500);
    console.log(`Entered custom strength: ${strength}`);
  }

  /**
   * Find a plain text input by its label in the non-eRx medication form.
   * Uses positional indexing of "Please be specific" placeholder fields
   * since the Ionic inputs don't have data-cy attributes.
   */
  private findFormFieldByLabel(labelText: string) {
    const fieldPositions: Record<string, number> = {
      'Route': 0,
      'Dosage': 1,
      'Frequency': 2,
      'Symptoms': 3,
    };
    const pos = fieldPositions[labelText];
    if (pos !== undefined) {
      return this.page.getByPlaceholder('Please be specific', { exact: true }).nth(pos);
    }
    return this.page.getByPlaceholder('Please be specific', { exact: true }).first();
  }

  async fillDosage(dosage: string): Promise<void> {
    const dcInput = this.page.locator(this.selectors.dosageInput).first();
    if (await dcInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await dcInput.fill(dosage);
    } else {
      await this.findFormFieldByLabel('Dosage').fill(dosage);
    }
    await this.page.waitForTimeout(500);
    console.log(`Filled dosage: ${dosage}`);
  }

  async selectRoute(route: string): Promise<void> {
    const routeInput = this.page.locator(this.selectors.routeInput);
    if (await routeInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await routeInput.fill(route);
    } else {
      // Fallback: plain text input near "Route" label
      await this.findFormFieldByLabel('Route').fill(route);
    }
    await this.page.waitForTimeout(500);
    console.log(`Selected route: ${route}`);
  }

  async selectFrequency(frequency: string): Promise<void> {
    const freqInput = this.page.locator(this.selectors.frequencyInput);
    if (await freqInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await freqInput.fill(frequency);
    } else {
      // Non-eRx: plain text input near "Frequency" label
      await this.findFormFieldByLabel('Frequency').fill(frequency);
    }
    await this.page.waitForTimeout(500);
    console.log(`Selected frequency: ${frequency}`);
  }

  async enableMAR(): Promise<void> {
    const marCb = this.page.locator(this.selectors.marCheckbox);
    if (await marCb.isVisible({ timeout: 2000 }).catch(() => false)) {
      await marCb.click();
    } else {
      // Non-eRx: checkbox near "Medication Administration Record (MAR)" text
      await this.page.getByText('Medication Administration Record').locator('..').locator('ion-checkbox, input[type="checkbox"]').first().click({ force: true });
    }
    await this.page.waitForTimeout(1000);
    console.log('Enabled MAR checkbox');
  }

  async fillMARTime(time: string): Promise<void> {
    await this.page.locator(this.selectors.marTimeInput).fill(time);
    await this.page.waitForTimeout(500);
    console.log(`Filled MAR time: ${time}`);
  }

  async selectMARDaysOfWeek(days: string[]): Promise<void> {
    await this.page.locator(this.selectors.marDaysOfWeekDropdown).click();
    await this.page.waitForTimeout(1000);
    for (const day of days) {
      await this.page.locator('[class*="ng-option"] span')
        .filter({ hasText: day })
        .click();
      await this.page.waitForTimeout(300);
    }
    // Close dropdown
    await this.page.locator(this.selectors.marDaysOfWeekDropdown + ' [class="ng-arrow"]').click();
    await this.page.waitForTimeout(500);
    console.log(`Selected MAR days: ${days.join(', ')}`);
  }

  async selectMARAdministration(administration: string): Promise<void> {
    await this.page.locator(this.selectors.marAdministrationDropdown).click();
    await this.page.waitForTimeout(1000);
    await this.page.locator('[class*="ng-option"] span')
      .filter({ hasText: administration })
      .click();
    await this.page.waitForTimeout(500);
    console.log(`Selected MAR administration: ${administration}`);
  }

  async fillMARNotes(notes: string): Promise<void> {
    await this.page.locator(this.selectors.marNotesInput).fill(notes);
    await this.page.waitForTimeout(500);
    console.log('Filled MAR notes');
  }

  /**
   * Enter a complete Medication order
   */
  async addMedicationOrder(data: MedicationOrderData): Promise<void> {
    console.log('\n--- Adding Medication Order ---');

    await this.clickAddOrder();
    await this.selectOrderType('Medication - non-eRx');

    await this.searchMedication(data.medicationName);
    if (data.route) await this.selectRoute(data.route);

    if (data.customStrength) {
      await this.enterCustomStrength(data.customStrength);
    } else if (data.strength) {
      await this.selectStrength(data.strength);
    } else {
      // Strength dropdown is already open after medication selection — do NOT click the
      // ng-select container (it toggles closed and clears the value).
      // Instead, directly click the first option from the open dropdown panel.
      const panelOption = this.page.locator('.ng-dropdown-panel .ng-option').first();
      if (await panelOption.isVisible({ timeout: 3000 }).catch(() => false)) {
        await panelOption.click();
        await this.page.waitForTimeout(500);
        console.log('Selected first strength option from open panel');
      } else {
        // Dropdown not open — clear any stale value, then click to expand and pick first item
        const clearBtn = this.page.locator('[data-cy="select-strength"] .ng-clear-wrapper');
        if (await clearBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
          await clearBtn.click();
          await this.page.waitForTimeout(500);
          console.log('Cleared strength value');
        }
        // Click the combobox input to expand the dropdown
        const comboInput = this.page.locator('[data-cy="select-strength"] input[role="combobox"]');
        await comboInput.click();
        await this.page.waitForTimeout(1500);
        const opt = this.page.locator('.ng-dropdown-panel .ng-option').first();
        if (await opt.isVisible({ timeout: 5000 }).catch(() => false)) {
          await opt.click();
          await this.page.waitForTimeout(500);
          console.log('Selected first strength option');
        } else {
          console.log('WARNING: No strength options available');
        }
      }
    }

    if (data.dosage) await this.fillDosage(data.dosage);
  
    if (data.frequency) await this.selectFrequency(data.frequency);

    if (data.isPRN && data.prnReasons) {
      await this.enablePRN();
      const prnInput = this.page.locator(this.selectors.prnReasonInput);
      if (await prnInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await prnInput.fill(data.prnReasons);
      } else {
        // Non-eRx: PRN reason is the "Symptoms" text input
        await this.findFormFieldByLabel('Symptoms').fill(data.prnReasons);
      }
      await this.page.waitForTimeout(500);
    }

    if (data.isMAR) {
      await this.enableMAR();
      // Non-eRx form: MAR details are behind "Add (MAR) Details" popup, not inline
      const marTimeField = this.page.locator(this.selectors.marTimeInput);
      if (await marTimeField.isVisible({ timeout: 2000 }).catch(() => false)) {
        if (data.marTime) await this.fillMARTime(data.marTime);
        if (data.marDaysOfWeek) await this.selectMARDaysOfWeek(data.marDaysOfWeek);
        if (data.marAdministration) await this.selectMARAdministration(data.marAdministration);
        if (data.marNotes) await this.fillMARNotes(data.marNotes);
      } else {
        console.log('MAR details not inline — add via ellipsis menu after order creation');
      }
    }

    if (data.hospicePays !== undefined) {
      await this.selectHospicePays(data.hospicePays);
      if (!data.hospicePays && data.reasonForNonCoverage) {
        await this.selectReasonForNonCoverage(data.reasonForNonCoverage);
      }
    }

    await this.selectOrderingProvider(data.role, data.orderingProvider);
    await this.selectApprovalType(data.approvalType);

    if (data.role === 'Registered Nurse (RN)' && data.approvalType === 'Verbal') {
      await this.clickReadBackVerified();
    }

    await this.submitOrder();
    console.log('Medication order submitted\n');
  }

  // ============================================
  // Compound/Free Text Medication Order
  // ============================================

  async enableCompoundFreeText(): Promise<void> {
    await this.page.locator(this.selectors.compoundFreeTextCheckbox).click();
    await this.page.waitForTimeout(1000);
    console.log('Enabled Compound/Free Text Medication');
  }

  async fillCompoundMedName(name: string): Promise<void> {
    await this.page.locator(this.selectors.compoundMedNameInput).fill(name);
    await this.page.waitForTimeout(500);
    console.log(`Filled compound med name: ${name}`);
  }

  async addIngredient(index: number, ingredient: string): Promise<void> {
    if (index > 0) {
      await this.page.locator(this.selectors.addIngredientBtn).click();
      await this.page.waitForTimeout(500);
    }
    await this.page.locator(this.selectors.ingredientInput(index)).fill(ingredient);
    await this.page.waitForTimeout(500);
    console.log(`Added ingredient ${index + 1}: ${ingredient}`);
  }

  /**
   * Enter a Compound/Free Text Medication order
   */
  async addCompoundMedicationOrder(data: CompoundMedicationOrderData): Promise<void> {
    console.log('\n--- Adding Compound Medication Order ---');

    await this.clickAddOrder();
    await this.selectOrderType('Medication');
    await this.enableCompoundFreeText();

    await this.fillCompoundMedName(data.medicationName);

    for (let i = 0; i < data.ingredients.length; i++) {
      await this.addIngredient(i, data.ingredients[i]);
    }

    if (data.dosage) await this.fillDosage(data.dosage);
    if (data.route) await this.selectRoute(data.route);
    if (data.frequency) await this.selectFrequency(data.frequency);

    await this.selectOrderingProvider(data.role, data.orderingProvider);
    await this.selectApprovalType(data.approvalType);

    await this.submitOrder();
    console.log('Compound medication order submitted\n');
  }

  // ============================================
  // Level of Care Orders
  // ============================================

  async selectLevelOfCare(locType: string): Promise<void> {
    await this.page.locator(this.selectors.levelOfCareDropdown).click();
    await this.page.waitForTimeout(1000);
    await this.page.locator('[class*="ng-option"] span')
      .filter({ hasText: locType })
      .click();
    await this.page.waitForTimeout(2000);
    console.log(`Selected Level of Care: ${locType}`);
  }

  async selectCareLocationType(locationType: string): Promise<void> {
    await this.page.locator(this.selectors.careLocationTypeDropdown).click();
    await this.page.waitForTimeout(1000);
    await this.page.locator('[class*="ng-option"] span')
      .filter({ hasText: locationType })
      .click();
    await this.page.waitForTimeout(1000);
    console.log(`Selected care location type: ${locationType}`);
  }

  async selectCareLocation(facility: string): Promise<void> {
    await this.page.locator(this.selectors.careLocationInput).click();
    await this.page.locator(this.selectors.careLocationInput).fill(facility);
    await this.page.waitForTimeout(2000);
    await this.page.locator('[class*="ng-option"] span')
      .filter({ hasText: facility })
      .click();
    await this.page.waitForTimeout(1000);
    console.log(`Selected care location: ${facility}`);
  }

  async fillRespiteReason(reason: string): Promise<void> {
    await this.page.locator(this.selectors.respiteReasonInput).click();
    await this.page.locator(this.selectors.respiteReasonInput).fill(reason);
    await this.page.waitForTimeout(500);
    console.log(`Filled respite reason: ${reason}`);
  }

  async selectGIPReasonPain(): Promise<void> {
    await this.page.locator(this.selectors.gipReasonPainCheckbox).click();
    await this.page.waitForTimeout(500);
    console.log('Selected GIP reason: Pain');
  }

  async selectSymptoms(): Promise<void> {
    await this.page.locator(this.selectors.symptomsDropdown).click();
    await this.page.waitForTimeout(500);
    await this.page.locator(this.selectors.agitationSymptom).click();
    await this.page.waitForTimeout(500);
    await this.page.locator(this.selectors.closeSymptomDropdown).click();
    await this.page.waitForTimeout(500);
    console.log('Selected symptoms: Agitation');
  }

  /**
   * Enter a complete Level of Care order
   */
  async addLOCOrder(data: LOCOrderData): Promise<void> {
    console.log(`\n--- Adding LOC Order: ${data.locType} ---`);

    await this.clickAddOrder();
    await this.selectOrderType('Level of Care');
    await this.selectLevelOfCare(data.locType);

    switch (data.locType) {
      case 'Routine Home Care':
        await this.selectCareLocationType(data.careLocationType || 'Home');
        break;

      case 'Respite Care':
        if (data.respiteReason) await this.fillRespiteReason(data.respiteReason);
        await this.selectCareLocationType(data.careLocationType || 'Q5004');
        if (data.facility) await this.selectCareLocation(data.facility);
        break;

      case 'General In-Patient':
        if (data.gipReasonPain) await this.selectGIPReasonPain();
        await this.selectCareLocationType(data.careLocationType || 'Q5009');
        if (data.facility) await this.selectCareLocation(data.facility);
        break;

      case 'Continuous Care':
        await this.selectSymptoms();
        await this.selectCareLocationType(data.careLocationType || 'Q5002');
        if (data.facility) await this.selectCareLocation(data.facility);
        break;
    }

    await this.setStartDate(data.startDate);
    await this.selectOrderingProvider(data.role, data.orderingProvider);

    if (data.role === 'MD') {
      await this.selectReadBack();
    } else {
      await this.selectApprovalType('Verbal');
    }

    await this.submitOrder();
    console.log(`LOC order (${data.locType}) submitted\n`);
  }

  // ============================================
  // Intake Orders
  // ============================================

  async clickAddIntakeOrder(): Promise<void> {
    await this.page.locator(this.selectors.intakeAddBtn).click();
    await this.page.waitForTimeout(2000);
    console.log('Clicked Add Intake Order');
  }

  async addIntakeOrder(data: IntakeOrderData): Promise<void> {
    console.log(`\n--- Adding Intake Order: ${data.orderType} ---`);

    await this.clickAddIntakeOrder();
    await this.selectOrderType(data.orderType);

    if (data.name) {
      await this.fillOrderName(data.name);
    }

    if (data.startDate) {
      await this.setStartDate(data.startDate);
    }

    await this.submitOrder();
    console.log('Intake order submitted\n');
  }

  async convertIntakeToOrder(): Promise<void> {
    await this.clickEllipsisOnRow(0);
    await this.page.locator(this.selectors.convertToOrderOption).click();
    await this.page.waitForTimeout(3000);
    console.log('Clicked Convert to Order');
  }

  async editIntakeOrder(): Promise<void> {
    await this.clickEllipsisOnRow(0);
    await this.page.locator(this.selectors.editIntakeOrderOption).click();
    await this.page.waitForTimeout(2000);
    console.log('Clicked Edit Intake Order');
  }

  async deleteIntakeOrder(): Promise<void> {
    await this.clickEllipsisOnRow(0);
    await this.page.locator(this.selectors.deleteIntakeOrderOption).click();
    await this.page.waitForTimeout(2000);
    console.log('Clicked Delete Intake Order');
  }

  // ============================================
  // Document Upload
  // ============================================

  async uploadDocument(filePaths: string[]): Promise<void> {
    const fileInput = this.page.locator(this.selectors.uploadFileInput);
    await fileInput.setInputFiles(filePaths);
    await this.page.waitForTimeout(3000);
    console.log(`Uploaded ${filePaths.length} document(s)`);
  }

  async clickDocumentIndicator(rowIndex: number = 0): Promise<void> {
    const row = this.page.locator(this.selectors.orderRow).nth(rowIndex);
    await row.locator(this.selectors.documentIndicator).click();
    await this.page.waitForTimeout(2000);
    console.log('Clicked document indicator');
  }

  async uploadSignedOrder(filePaths: string[]): Promise<void> {
    await this.page.locator(this.selectors.uploadSignedOrderOption).click();
    await this.page.waitForTimeout(2000);
    // await this.uploadDocument(filePaths);
     const fileInput = this.page.locator(this.selectors.uploadsignedfileInput);
    await fileInput.setInputFiles(filePaths);
    await this.page.waitForTimeout(3000);
    console.log(`Uploaded ${filePaths.length} document(s)`);
    console.log('Uploaded signed order document');
  }

  // ============================================
  // Order Grid Operations
  // ============================================

  async clickEllipsisOnRow(rowIndex: number): Promise<void> {
    const rows = this.page.locator(this.selectors.orderRow);
    // Use .first() because rows with discontinued sub-rows contain multiple ellipsis icons
    await rows.nth(rowIndex).locator(this.selectors.ellipsisMenu).first().click();
    await this.page.waitForTimeout(1000);
    console.log(`Clicked ellipsis on row ${rowIndex}`);
  }

  async clickCaretOnRow(rowIndex: number): Promise<void> {
    const rows = this.page.locator(this.selectors.orderRow);
    // Use .first() because rows with discontinued sub-rows contain multiple caret icons
    await rows.nth(rowIndex).locator(this.selectors.caretIcon).first().click();
    await this.page.waitForTimeout(2000);
    console.log(`Clicked caret on row ${rowIndex}`);
  }

  async getOrderDetailsText(rowIndex: number): Promise<string> {
    await this.clickCaretOnRow(rowIndex);
    // Wait for details section to be visible, then get the full expanded row text
    await this.page.locator(this.selectors.orderDetailsSection).first().waitFor({ state: 'visible', timeout: 10000 });
    // Get the row's parent container which includes both the order row and the expanded details
    const rows = this.page.locator(this.selectors.orderRow);
    const rowParent = rows.nth(rowIndex).locator('xpath=..');
    const details = await rowParent.innerText();
    return details || '';
  }

  async getHistoryText(rowIndex: number): Promise<string> {
    // Try to get the history reason value (the actual content, not just the header)
    const historyReason = this.page.locator(this.selectors.historyReason);
    try {
      await historyReason.waitFor({ state: 'visible', timeout: 5000 });

      // Expand "More" link if text is truncated by wrapped-text component
      const moreLink = historyReason.locator('a:has-text("More")');
      if (await moreLink.isVisible({ timeout: 1000 }).catch(() => false)) {
        await moreLink.click();
        await this.page.waitForTimeout(500);
      }

      const text = (await historyReason.textContent())?.trim() || '';
      console.log(`History reason text: ${text}`);
      return text;
    } catch {
      // Fallback: try discontinue reason
      const discReason = this.page.locator(this.selectors.discontinueReason);
      if (await discReason.isVisible({ timeout: 3000 }).catch(() => false)) {
        const moreLink = discReason.locator('a:has-text("More")');
        if (await moreLink.isVisible({ timeout: 1000 }).catch(() => false)) {
          await moreLink.click();
          await this.page.waitForTimeout(500);
        }
        const text = (await discReason.textContent())?.trim() || '';
        console.log(`Discontinue reason text (fallback): ${text}`);
        return text;
      }

      console.log('No history or discontinue reason found');
      return '';
    }
  }

  async getOrderRowCount(): Promise<number> {
    await this.page.waitForTimeout(2000);
    return await this.page.locator('[data-cy="order"]').count();
  }

  async getGridCellText(rowIndex: number, columnName: string): Promise<string> {
    const row = this.page.locator(this.selectors.orderRow).nth(rowIndex);
    // const cell = row.locator(`[data-cy="cell-${columnName}"]`);
    const cell = row.locator(`[data-cy=columnName]`);
    return (await cell.textContent()) || '';
  }

  async toggleHideDiscontinued(): Promise<void> {
    // Try data-cy selector first, fallback to checkbox near label text
    const toggle = this.page.locator(this.selectors.hideDiscontinuedToggle);
    if (await toggle.isVisible({ timeout: 2000 }).catch(() => false)) {
      await toggle.click();
    } else {
      await this.page.locator('text=Hide Discontinued').locator('..').locator('input[type="checkbox"], ion-checkbox').first().click();
    }
    await this.page.waitForTimeout(2000);
    console.log('Toggled hide discontinued orders');
  }

  // ============================================
  // Discontinue Order
  // ============================================

  async discontinueOrder(rowIndex: number, data: DiscontinueOrderData): Promise<void> {
    console.log(`\n--- Discontinuing order at row ${rowIndex} ---`);

    await this.clickEllipsisOnRow(rowIndex);
    await this.page.locator(this.selectors.discontinueOption).click();
    await this.page.waitForTimeout(2000);

    // The discontinue dialog has NO data-cy attributes — use role/placeholder selectors

    // Fill discontinue date — click the calendar button in the dialog, then pick date
    const dialogCalendarBtn = this.page.locator('cur-date-picker[ng-reflect-name="discontinueDate"] button');
    if (await dialogCalendarBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await dialogCalendarBtn.click();
      await this.page.waitForTimeout(1000);
      await DateHelper.selectDateFormatted(this.page, data.discontinueDate);
    } else {
      // Fallback: type date directly into the date input
      const dateInput = this.page.locator('ion-modal input[placeholder="MM/DD/YYYY"]').first();
      await dateInput.click();
      await dateInput.fill(data.discontinueDate);
      await this.page.waitForTimeout(500);
    }

    // Close datepicker if still open (ngb-dp-week can block elements below)
    // Do NOT press Escape — it closes the entire modal. Click the calendar button to toggle it off.
    if (await this.page.locator('ngb-datepicker').isVisible({ timeout: 1000 }).catch(() => false)) {
      await dialogCalendarBtn.click({ force: true });
      await this.page.waitForTimeout(1000);
    }

    // Fill provider name if provided — combobox in dialog with "Search Provider" placeholder
    if (data.discontinueProviderName) {
      const providerCombobox = this.page.locator('ion-modal').getByRole('combobox').first();
      await providerCombobox.click();
      await providerCombobox.fill(data.discontinueProviderName);
      await this.page.waitForTimeout(2000);
      await this.page.locator('.ng-option-label').first().click();
      await this.page.waitForTimeout(500);
    }

    // Fill reason — textarea with placeholder "Please be specific"
    const reasonInput = this.page.locator('ion-modal textarea[placeholder="Please be specific"], ion-modal input[placeholder="Please be specific"]').first();
    await reasonInput.click();
    await reasonInput.fill(data.discontinueReason);
    await this.page.waitForTimeout(500);

    // Select approval type — radio labels are siblings of radio inputs, click the label text
    if (data.approvalType == 'Verbal') 
      {        
    await this.page.locator('.radio-item [ng-reflect-value="verbal"]').click();
    await this.page.waitForTimeout(500); }
    else
    {      await this.page.locator('.radio-item [ng-reflect-value="written"]').click();
      await this.page.waitForTimeout(500);
    }

    // Service declined checkbox
    if (data.isServiceDeclined) {
      const serviceDeclinedCheckbox = this.page.locator('ion-modal').getByRole('checkbox').first();
      await serviceDeclinedCheckbox.click();
      await this.page.waitForTimeout(1000);
    }

    // Click Submit button in dialog
    await this.page.locator(this.selectors.discontinuesubmitBtn).click();
    await this.page.waitForTimeout(5000);
    console.log('Order discontinued\n');
  }

  // ============================================
  // Void Order (LOC)
  // ============================================

  async voidOrder(rowIndex: number, reason: string): Promise<void> {
    console.log(`\n--- Voiding order at row ${rowIndex} ---`);

    await this.clickEllipsisOnRow(rowIndex);
    await this.page.locator(this.selectors.voidOrderOption).click();
    await this.page.waitForTimeout(2000);

    await this.page.locator(this.selectors.voidReasonInput).fill(reason);
    await this.page.waitForTimeout(500);

    await this.page.locator(this.selectors.voidSubmitBtn).click();
    await this.page.waitForTimeout(5000);
    console.log('Order voided\n');
  }

  // ============================================
  // Edit Hospice Coverage
  // ============================================

  async editHospiceCoverage(rowIndex: number, data: HospiceCoverageData): Promise<void> {
    console.log(`\n--- Editing hospice coverage for row ${rowIndex} ---`);

    await this.clickEllipsisOnRow(rowIndex);
    await this.page.locator(this.selectors.editHospiceCoverageOption).click();
    await this.page.waitForTimeout(2000);

    if (data.hospicePays) {
      await this.page.locator(this.selectors.hospiceCoverageYesRadio).click();
    } else {
      await this.page.locator(this.selectors.hospiceCoverageNoRadio).click();
      await this.page.waitForTimeout(500);
      if (data.reasonForNonCoverage) {
        // Click the reason dropdown using the following-sibling of the label
        // const reasonDropdown = this.page.getByText('Reason for Non-Coverage').locator('xpath=following-sibling::*[1]');
        // await reasonDropdown.click();
        await this.page.locator(this.selectors.editHospiceCoverage).click();
        await this.page.waitForTimeout(1000);
        await this.page.locator('[class*="ng-option"] span')
          .filter({ hasText: data.reasonForNonCoverage })
          .click();
        await this.page.waitForTimeout(500);
      }
    }

    await this.page.locator(this.selectors.hospiceCoverageSubmitBtn).click();
    await this.page.waitForTimeout(3000);
    console.log('Hospice coverage updated\n');
  }

  // ============================================
  // Add/Edit MAR Details
  // ============================================

  async addEditMARDetails(rowIndex: number, data: MARDetailsData): Promise<void> {
    console.log(`\n--- Adding/Editing MAR details for row ${rowIndex} ---`);

    await this.clickEllipsisOnRow(rowIndex);
    await this.page.locator(this.selectors.addEditMAROption).click();
    await this.page.waitForTimeout(2000);

    // Check the MAR checkbox to enable
    if (data.enabled) {
      await this.page.locator(this.selectors.marPopupCheckbox).click({ force: true });
      await this.page.waitForTimeout(500);
      console.log('Checked MAR checkbox');

      // Click "Add (MAR) Details" link to expand detail fields
      const showDetails = this.page.locator(this.selectors.marPopupShowDetails);
      if (await showDetails.isVisible({ timeout: 2000 }).catch(() => false)) {
        await showDetails.click();
        await this.page.waitForTimeout(1000);
        console.log('Expanded MAR detail fields');
      }
    }

    // Set time using hour/minute caret buttons then click Add Time
    if (data.time) {
      const [hours, minutes] = data.time.split(':').map(Number);

      // Click hour up caret to set hour (each click increments by 1 from empty)
      for (let i = 0; i < hours; i++) {
        await this.page.locator(this.selectors.marPopupTimeHourUp).click();
        await this.page.waitForTimeout(100);
      }

      // Minutes field starts empty — click up once then down once to initialize to "00"
      // Then click up for the desired minute value
      await this.page.locator(this.selectors.marPopupTimeMinUp).click();
      await this.page.waitForTimeout(100);
      if (minutes === 0) {
        // We clicked up to "01", click down to get back to "00"
        await this.page.locator('[class="ngb-tp-minute"] button:nth-child(3)').click();
        await this.page.waitForTimeout(100);
      } else {
        // Already at "01" from the init click, click up (minutes - 1) more times
        for (let i = 1; i < minutes; i++) {
          await this.page.locator(this.selectors.marPopupTimeMinUp).click();
          await this.page.waitForTimeout(100);
        }
      }

      // Click "Add Time" button
      await this.page.locator(this.selectors.marPopupAddTimeBtn).click();
      await this.page.waitForTimeout(500);
      console.log(`Set MAR time: ${data.time}`);
    }

    // Select days of week
    if (data.daysOfWeek) {
      if (data.daysOfWeek.length === 7) {
        // Select All if all 7 days
        await this.page.locator(this.selectors.marPopupSelectAllDays).click({ force: true });
        await this.page.waitForTimeout(500);
        console.log('Selected all days of week');
      } else {
        // Click individual day checkboxes
        const dayCheckboxes = this.page.locator(this.selectors.marPopupDaysOfWeek);
        const count = await dayCheckboxes.count();
        for (let i = 0; i < count; i++) {
          const label = await dayCheckboxes.nth(i).getAttribute('id') || '';
          const dayName = label.replace('-checkbox', '');
          if (data.daysOfWeek.some(d => d.toLowerCase() === dayName.toLowerCase())) {
            await dayCheckboxes.nth(i).click({ force: true });
            await this.page.waitForTimeout(200);
          }
        }
        console.log(`Selected days: ${data.daysOfWeek.join(', ')}`);
      }
    }

    // Select administration frequency
    if (data.administration) {
      await this.page.locator(this.selectors.marPopupAdminDropdown).click();
      await this.page.waitForTimeout(500);
      await this.page.locator(this.selectors.marPopupAdminDropdown).fill(data.administration);
      await this.page.waitForTimeout(1000);
      await this.page.locator('.ng-option-label').filter({ hasText: data.administration }).first().click();
      await this.page.waitForTimeout(500);
      console.log(`Selected administration: ${data.administration}`);
    }

    if (data.additionalNotes) {
      await this.page.locator(this.selectors.marPopupNotesInput).fill(data.additionalNotes);
      await this.page.waitForTimeout(500);
    }

    // Submit
    const submitBtn = this.page.locator(this.selectors.marPopupSubmitBtn);
    if (await submitBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await submitBtn.click();
    } else {
      await this.page.getByRole('button', { name: /submit/i }).first().click();
    }
    await this.page.waitForTimeout(3000);
    console.log('MAR details updated\n');
  }

  // ============================================
  // Operational Notes
  // ============================================

  async addOperationalNote(rowIndex: number, note: string): Promise<void> {
    console.log(`\n--- Adding operational note for row ${rowIndex} ---`);

    await this.clickEllipsisOnRow(rowIndex);
    await this.page.locator(this.selectors.addOperationalNoteOption).click();
    await this.page.waitForTimeout(2000);

    await this.page.locator(this.selectors.operationalNoteInput).fill(note);
    await this.page.waitForTimeout(500);

    await this.page.locator(this.selectors.operationalNoteSaveBtn).click();
    await this.page.waitForTimeout(3000);
    console.log('Operational note added\n');
  }

  // ============================================
  // Grid Search, Filter, Sort
  // ============================================

  async searchOrders(searchTerm: string): Promise<void> {
    await this.page.locator(this.selectors.searchInput).fill(searchTerm);
    await this.page.waitForTimeout(2000);
    console.log(`Searched orders: ${searchTerm}`);
  }

  async clearSearch(): Promise<void> {
    await this.page.locator(this.selectors.searchInput).fill('');
    await this.page.waitForTimeout(1000);
    console.log('Cleared search');
  }

  async filterByOrderType(orderType: string): Promise<void> {
    await this.page.locator(this.selectors.filterTypeDropdown).click();
    await this.page.waitForTimeout(1000);
    await this.page.locator('[class*="ng-option"] span')
      .filter({ hasText: orderType })
      .click();
    await this.page.waitForTimeout(1000);
    console.log(`Filtered by order type: ${orderType}`);
  }

  async filterBySignedStatus(status: string): Promise<void> {
    await this.page.locator(this.selectors.filterSignedDropdown).click();
    await this.page.waitForTimeout(1000);
    await this.page.locator('[class*="ng-option"] span')
      .filter({ hasText: status })
      .click();
    await this.page.waitForTimeout(1000);
    console.log(`Filtered by signed status: ${status}`);
  }

  async sortByColumn(columnName: string): Promise<void> {
    await this.page.locator(this.selectors.sortColumnHeader(columnName)).click();
    await this.page.waitForTimeout(1000);
    console.log(`Sorted by column: ${columnName}`);
  }

  // ============================================
  // Attestation (Provider Login)
  // ============================================

  async isAttestationVisible(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.attestationMessage);
  }

  async clickAttestationCheckbox(): Promise<void> {
    await this.page.locator(this.selectors.attestationCheckbox).click();
    await this.page.waitForTimeout(500);
    console.log('Clicked attestation checkbox');
  }

  async getAttestationMessage(): Promise<string> {
    const text = await this.page.locator(this.selectors.attestationMessage).textContent();
    return text || '';
  }

  async clearOrderingProvider(): Promise<void> {
    // Click the X button to remove auto-populated provider
    await this.page.locator('[data-cy="select-ordering-provider"] .ng-clear-wrapper').click();
    await this.page.waitForTimeout(1000);
    console.log('Cleared ordering provider');
  }

  // ============================================
  // Warning Messages
  // ============================================

  async getWarningMessage(type?: 'discipline' | 'datePicker'): Promise<string> {
    if (type === 'discipline') {
      const warning = this.page.locator(this.selectors.disciplineWarning);
      if (await warning.isVisible({ timeout: 3000 }).catch(() => false)) {
        return (await warning.textContent()) || '';
      }
      return '';
    }

    if (type === 'datePicker') {
      // Wait for the element to appear in DOM first
      try {
        await this.page.waitForSelector('[class*="datePickerErrorText"]', { state: 'attached', timeout: 10000 });
      } catch {
        console.log('datePickerErrorText element not found in DOM');
        return '';
      }
      const warning = this.page.locator(this.selectors.datePickerWarning).first();
      return (await warning.textContent()) || '';
    }

    // Default: return first visible warning (discipline first, then datePicker, then generic)
    const disciplineWarning = this.page.locator(this.selectors.disciplineWarning);
    if (await disciplineWarning.isVisible({ timeout: 2000 }).catch(() => false)) {
      return (await disciplineWarning.textContent()) || '';
    }

    const datePickerWarning = this.page.locator(this.selectors.datePickerWarning);
    if (await datePickerWarning.isVisible({ timeout: 2000 }).catch(() => false)) {
      return (await datePickerWarning.textContent()) || '';
    }

    // Fallback: generic warning/error selectors
    const classWarning = this.page.locator(this.selectors.warningMessage);
    if (await classWarning.isVisible({ timeout: 2000 }).catch(() => false)) {
      return (await classWarning.textContent()) || '';
    }

    return '';
  }

  async isDuplicateWarningVisible(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.duplicateWarning);
  }

  // ============================================
  // Verification Helpers
  // ============================================

  async isOrderOnGrid(nameOrDescription: string): Promise<boolean> {
    const gridText = await this.page.locator(this.selectors.orderGrid).textContent();
    return (gridText || '').includes(nameOrDescription);
  }

  async getSignedStatus(rowIndex: number): Promise<string> {
    // Wait for grid to load, then check row text for signed status
    const row = this.page.locator(this.selectors.orderRow).nth(rowIndex);
    await row.waitFor({ state: 'visible', timeout: 10000 });
    const rowText = (await row.textContent()) || '';
    console.log(`Row ${rowIndex} text: ${rowText.substring(0, 120)}...`);
    if (rowText.includes('e-signed')) return 'e-signed';
    if (rowText.includes('Rejected')) return 'Rejected';
    if (rowText.includes('Yes')) return 'Yes';
    if (rowText.includes('No')) return 'No';
    return '';
  }

  async getOrderedBy(rowIndex: number): Promise<string> {
    return await this.getGridCellText(rowIndex, 'ordered-by');
  }

  async isSubmitEnabled(): Promise<boolean> {
    const btn = this.page.locator(this.selectors.submitBtn);
    const isDisabled = await btn.isDisabled();
    return !isDisabled;
  }

  async isProceedEnabled(): Promise<boolean> {
    const btn = this.page.locator(this.selectors.proceedBtn);
    const isDisabled = await btn.isDisabled();
    return !isDisabled;
  }
}
