import { Page } from '@playwright/test';
import { BasePage } from '../pages/base.page';
import { BillRate, PatientLiability } from '../types/benefit.types';
import { selectNgOption, selectNgOptionByIndex, selectDateFromPicker, clickCalendarButtonByLabel } from '../utils/form-helpers';

/**
 * Benefits Add Page Object — Ionic 8 (qa2)
 *
 * VERIFIED via MCP Playwright on qa2 (2026-03-05).
 *
 * KEY CHANGES from Ionic 4 (qa1):
 * - Navigation: [data-cy="btn-nav-bar-item-benefits"] SAME
 * - Add button: ion-fab-button[data-cy="btn-add-benefit"] (was btn-add-payer)
 * - Benefits card: ion-card[data-cy="card-patient-benefits"] (new)
 * - Benefits header: ion-card-header[data-cy="header-benefits"] (new)
 * - Benefits grid: ion-grid[data-cy="grid-patient-benefits"] (new)
 * - Benefits table component: patient-benefits-table[data-cy="component-patient-benefits-table"]
 * - Active benefit row: ion-row[data-cy="row-active-benefit-{index}"] (new)
 * - Benefit row component: patient-benefits-row[data-cy="component-active-benefit-row-{index}"]
 * - Show details: ion-row[data-cy="btn-show-details-benefit-{index}"] (new)
 * - Column details: ion-col[data-cy="btn-benefits-details-{index}"]
 * - Header columns: col-header-payer-level, col-header-payer-type, col-header-payer-name,
 *   col-header-subscriber-id, col-header-effective-date, col-header-expired-date (new)
 * - Disenroll button: ion-button[data-cy="btn-disenroll"] (new)
 * - Tabs: ion-tab-button[data-cy="tab-payers"], tab-eligibility (new sub-tabs)
 * - Scrollable container: div[data-cy="container-benefits-scrollable"] (new)
 *
 * NOTE: Add/Edit form selectors need separate verification when form is opened.
 * The list view selectors above are verified.
 */
export class BenefitsAddPage extends BasePage {
  private readonly selectors = {
    // === Navigation ===
    benefitsNavBarItem: '[data-cy="btn-nav-bar-item-benefits"]',
    addBenefitButton: '[data-cy="btn-add-benefit"]',

    // === Benefits List View ===
    benefitsCard: '[data-cy="card-patient-benefits"]',
    benefitsHeader: '[data-cy="header-benefits"]',
    benefitsGrid: '[data-cy="grid-patient-benefits"]',
    benefitsTable: '[data-cy="component-patient-benefits-table"]',
    benefitsScrollable: '[data-cy="container-benefits-scrollable"]',
    activeBenefitRow: (index: number) => `[data-cy="row-active-benefit-${index}"]`,
    benefitRowComponent: (index: number) => `[data-cy="component-active-benefit-row-${index}"]`,
    showDetailsBenefit: (index: number) => `[data-cy="btn-show-details-benefit-${index}"]`,
    benefitDetails: (index: number) => `[data-cy="btn-benefits-details-${index}"]`,
    headerRow: '[data-cy="row-header-active-benefits"]',

    // === Header Column Labels ===
    colHeaderPayerLevel: '[data-cy="col-header-payer-level"]',
    colHeaderPayerType: '[data-cy="col-header-payer-type"]',
    colHeaderPayerName: '[data-cy="col-header-payer-name"]',
    colHeaderSubscriberId: '[data-cy="col-header-subscriber-id"]',
    colHeaderEffectiveDate: '[data-cy="col-header-effective-date"]',
    colHeaderExpiredDate: '[data-cy="col-header-expired-date"]',

    // === Sub-tabs (Ionic 8 specific) ===
    payersTab: '[data-cy="tab-payers"]',
    eligibilityTab: '[data-cy="tab-eligibility"]',

    // === Disenroll Button (new in Ionic 8) ===
    disenrollButton: '[data-cy="btn-disenroll"]',

    // === Form selectors (carry over from qa1 — verify when form opens) ===
    payerLevel: '[data-cy="select-payer-level-list"]',
    payerType: '[data-cy="select-payer-type-list"]',
    payerName: '[data-cy="select-payer-name"]',
    payerEffectiveDate: '[data-cy="date-payer-effective-date"]',
    dateOfBirth: '[data-cy="date-birth"]',
    medicareNumber: '[data-cy="input-medicare-number"]',
    medicaidNumber: '[data-cy="input-medicaid-number"]',
    planName: '[data-cy="select-plan-name"]',
    relationshipToPatient: '[data-cy="select-relationships"]',
    groupNumber: '[data-cy="input-group-number"]',
    firstName: '[data-cy="input-first-name"]',
    lastName: '[data-cy="input-last-name"]',
    address: '[data-cy="input-address"]',
    city: '[data-cy="input-city"]',
    state: '[data-cy="input-state"]',
    zipCode: '[data-cy="input-zipcode"]',
    phone: '[data-cy="input-phone"]',
    email: '[data-cy="input-email"]',
    middleInitial: '[data-cy="input-middle-initial"]',
    zipExtension: '[data-cy="input-zipcode-extension"]',
    additionalInfo: '[data-cy="textarea-additional-info"]',
    vbidCheckbox: '[data-cy="checkbox-vbid"]',
    medicaidPendingCheckbox: '[data-cy="checkbox-medicaid-pending"]',
    patientEligibilityVerified: '[data-cy="checkbox-patient-eligivility"]',
    policyNumber: (index: number) => `[data-cy="input-policy-number-${index}"]`,
    benefitElectionDate: '[data-cy="date-benefit-election-date"]',
    admitBenefitPeriod: '[data-cy="input-admit-benefit-period"]',
    benefitPeriodStartDate: '[data-cy="date-admit-benefit-period-start-date"]',
    highDaysUsed: '[data-cy="input-routine-home-care-high-days-used"]',

    // === Room And Board Fields ===
    billingEffectiveDate: (index: number) => `[data-cy="date-billing-effective-date-${index}"]`,
    billingExpiredDate: (index: number) => `[data-cy="date-billing-expired-date-${index}"]`,
    billRate: (index: number) => `#billing-rate-${index}`,
    careLevel: (index: number) => `#care-level-${index}`,
    addBillingEffectiveDate: '[data-cy="btn-add-billing-effective-date"]',
    patientLiability: '[data-cy="select-patient-liability"]',
    liabilityAmount: '[data-cy="input-liability-amount"]',
    liabilityFromDate: '[data-cy="date-liability-from"]',
    liabilityToDate: '[data-cy="date-liability-to"]',

    // === Edit Functionality ===
    showMoreOptions: (index: number) => `[data-cy="btn-show-more-options-${index}"]`,
    editBenefitOption: '[data-cy="btn-edit-benefit"]',
    copyBenefitOption: '[data-cy="btn-copy-benefit"]',
    holdBenefitOption: '[data-cy="btn-hold-benefit"]',

    // === Form Actions ===
    saveButton: '[data-cy="btn-save"]',
    cancelButton: '[data-cy="btn-cancel"]',

    // === Toast ===
    toastMessage: '.toast-message',
    successToast: '.toast-success',
    errorToast: '.toast-error',
  };

  constructor(page: Page) {
    super(page);
  }

  // Navigation
  async navigateToBenefits(): Promise<void> {
    await this.page.locator(this.selectors.benefitsNavBarItem).last().click();
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(1000);
  }

  async clickAddBenefit(): Promise<void> {
    await this.page.locator(this.selectors.addBenefitButton).click();
    await this.page.waitForTimeout(1000);
  }

  // Sub-tabs
  async clickPayersTab(): Promise<void> {
    await this.page.locator(this.selectors.payersTab).click();
    await this.page.waitForTimeout(500);
  }

  async clickEligibilityTab(): Promise<void> {
    await this.page.locator(this.selectors.eligibilityTab).click();
    await this.page.waitForTimeout(500);
  }

  // Disenroll
  async clickDisenroll(): Promise<void> {
    await this.page.locator(this.selectors.disenrollButton).click();
    await this.page.waitForTimeout(1000);
  }

  // Form Actions
  async clickSave(): Promise<void> {
    await this.page.locator(this.selectors.saveButton).click();
  }

  async clickCancel(): Promise<void> {
    await this.page.locator(this.selectors.cancelButton).click();
  }

  async isSaveButtonEnabled(): Promise<boolean> {
    return await this.page.locator(this.selectors.saveButton).isEnabled();
  }

  // Toast
  async waitForSuccessToast(timeout: number = 5000): Promise<void> {
    await this.page.locator(this.selectors.successToast).waitFor({ state: 'visible', timeout });
  }

  async hasErrorToast(): Promise<boolean> {
    return await this.page.locator(this.selectors.errorToast).isVisible();
  }

  // ============================================
  // Selector Access
  // ============================================

  getSelector(key: keyof typeof this.selectors): string {
    const selector = this.selectors[key];
    if (typeof selector === 'function') {
      throw new Error(`Selector ${key} requires an index parameter`);
    }
    return selector;
  }

  // ============================================
  // Add Payer / Edit
  // ============================================

  async clickAddPayer(): Promise<void> {
    await this.page.locator(this.selectors.addBenefitButton).click();
    await this.page.waitForTimeout(1000);
  }

  async clickMoreButtonByPayerLevel(payerLevel: string): Promise<void> {
    console.log(`Looking for More button for payer level: ${payerLevel}`);
    await this.page.waitForTimeout(1000);

    // Find the row containing the payer level text, then click its more-options icon
    const rows = this.page.locator('[data-cy^="row-active-benefit-"]');
    const count = await rows.count();

    for (let i = 0; i < count; i++) {
      const rowText = await rows.nth(i).textContent({ timeout: 2000 }).catch(() => '');
      if (rowText && rowText.includes(payerLevel)) {
        await this.page.locator(this.selectors.showMoreOptions(i)).click();
        console.log(`Clicked More options at index ${i} for ${payerLevel}`);
        await this.page.waitForTimeout(500);
        return;
      }
    }

    // Fallback: click first more-options button
    if (count > 0) {
      await this.page.locator(this.selectors.showMoreOptions(0)).click();
      await this.page.waitForTimeout(500);
      return;
    }

    throw new Error(`Could not find More button for payer level: ${payerLevel}`);
  }

  async clickEditButton(): Promise<void> {
    await this.page.locator(this.selectors.editBenefitOption).click();
    await this.page.waitForTimeout(1000);
  }

  // ============================================
  // Payer Selection Methods
  // ============================================

  async selectPayerLevel(level: string): Promise<void> {
    await selectNgOption(this.page, this.selectors.payerLevel, level);
  }

  async selectPayerType(type: string): Promise<void> {
    await selectNgOption(this.page, this.selectors.payerType, type);
  }

  async selectPayerName(searchText: string, optionIndex: number = 0): Promise<void> {
    // Payer Name is an ng-select with type-ahead search
    const ngSelect = this.page.locator(this.selectors.payerName);
    await ngSelect.click();
    await this.page.waitForTimeout(500);
    const input = ngSelect.locator('input');
    await input.fill(searchText);
    await this.page.waitForTimeout(1500);
    const dropdown = this.page.locator('ng-dropdown-panel .ng-option');
    await dropdown.nth(optionIndex).click();
    await this.page.waitForTimeout(500);
  }

  async toggleVbid(): Promise<void> {
    await this.page.locator(this.selectors.vbidCheckbox).click();
  }

  // ============================================
  // HIS/HOPE Methods
  // ============================================

  async fillMedicareNumber(number: string): Promise<void> {
    await this.fill(`${this.selectors.medicareNumber} input`, number);
  }

  async fillMedicaidNumber(number: string): Promise<void> {
    await this.fill(`${this.selectors.medicaidNumber} input`, number);
  }

  async toggleMedicaidPending(): Promise<void> {
    await this.page.locator(this.selectors.medicaidPendingCheckbox).click();
  }

  // ============================================
  // Plan Details Methods
  // ============================================

  async selectPlanName(planName: string): Promise<void> {
    await selectNgOption(this.page, this.selectors.planName, planName);
  }

  async selectPlanNameByIndex(index: number): Promise<void> {
    console.log(`Selecting Plan Name by index: ${index}`);
    await this.page.waitForTimeout(1000);
    await selectNgOptionByIndex(this.page, this.selectors.planName, index);
  }

  async togglePatientEligibilityVerified(): Promise<void> {
    if (await this.page.locator(this.selectors.patientEligibilityVerified).count() > 0) {
      await this.page.locator(this.selectors.patientEligibilityVerified).click();
    } else {
      const eligibilityLabel = this.page.getByText("Patient's Eligibility Verified", { exact: true });
      if (await eligibilityLabel.count() > 0) {
        const parentContainer = eligibilityLabel.locator('xpath=ancestor::*[1]');
        const checkbox = parentContainer.locator('ion-checkbox').first();
        if (await checkbox.count() > 0) {
          await checkbox.click({ force: true });
        } else {
          await eligibilityLabel.click({ force: true });
        }
      }
    }
    await this.page.waitForTimeout(500);
  }

  // ============================================
  // Subscriber Details Methods
  // ============================================

  async selectRelationshipToPatient(relationship: string): Promise<void> {
    await selectNgOption(this.page, this.selectors.relationshipToPatient, relationship);
  }

  async fillGroupNumber(groupNumber: string): Promise<void> {
    const input = this.page.locator(this.selectors.groupNumber).locator('input');
    await input.scrollIntoViewIfNeeded();
    await input.click();
    await input.clear();
    await input.pressSequentially(groupNumber, { delay: 50 });
    await this.page.waitForTimeout(500);
  }

  async fillFirstName(firstName: string): Promise<void> {
    await this.fill(`${this.selectors.firstName} input`, firstName);
  }

  async fillLastName(lastName: string): Promise<void> {
    await this.fill(`${this.selectors.lastName} input`, lastName);
  }

  async fillMiddleInitial(middleInitial: string): Promise<void> {
    await this.fill(`${this.selectors.middleInitial} input`, middleInitial);
  }

  async fillAddress(address: string): Promise<void> {
    await this.fill(`${this.selectors.address} input`, address);
  }

  async fillCity(city: string): Promise<void> {
    await this.fill(`${this.selectors.city} input`, city);
  }

  async selectSubscriberState(state: string): Promise<void> {
    console.log(`Selecting subscriber state: ${state}`);
    await selectNgOption(this.page, this.selectors.state, state);
  }

  async fillZipCode(zipCode: string): Promise<void> {
    await this.fill(`${this.selectors.zipCode} input`, zipCode);
  }

  async fillZipExtension(zipExtension: string): Promise<void> {
    await this.fill(`${this.selectors.zipExtension} input`, zipExtension);
  }

  async fillPhone(phone: string): Promise<void> {
    await this.fill(`${this.selectors.phone} input`, phone);
  }

  async fillEmail(email: string): Promise<void> {
    await this.fill(`${this.selectors.email} input`, email);
  }

  async fillAdditionalInfo(info: string): Promise<void> {
    await this.page.locator(`${this.selectors.additionalInfo} textarea`).fill(info);
  }

  // ============================================
  // Policy / Subscriber ID Methods
  // ============================================

  async fillPolicyNumber(policyNumber: string, index: number = 0): Promise<void> {
    await this.page.waitForTimeout(1000);

    const addModeSelector = `[data-cy="input-policy-number-${index}"]`;
    const editModeSelector = `[data-cy="input-susbscriber-id-${index}"]`;

    const editModeCount = await this.page.locator(editModeSelector).count();
    const selector = editModeCount > 0 ? editModeSelector : addModeSelector;

    const input = this.page.locator(`${selector} input`);
    await input.scrollIntoViewIfNeeded();
    await input.click({ force: true });
    await input.fill(policyNumber);
  }

  // ============================================
  // Hospice Eligibility Methods
  // ============================================

  async fillAdmitBenefitPeriod(period: string): Promise<void> {
    const input = this.page.locator(`${this.selectors.admitBenefitPeriod} input`);
    await input.clear();
    await input.fill(period);
  }

  async fillHighDaysUsed(days: string): Promise<void> {
    await this.fill(`${this.selectors.highDaysUsed} input`, days);
  }

  // ============================================
  // Room And Board Methods
  // ============================================

  async fillBenefitPeriodStartDate(date: string): Promise<void> {
    console.log(`Filling Benefit Period Start Date: ${date}`);
    await this.page.waitForTimeout(1000);
    const datePicker = this.page.locator(this.selectors.benefitPeriodStartDate);
    const calendarBtn = datePicker.locator('button');
    await calendarBtn.click();
    await this.page.waitForTimeout(500);
    await selectDateFromPicker(this.page, date);
  }

  async fillBillingEffectiveDate(date: string, index: number = 0): Promise<void> {
    console.log(`Filling Billing Effective Date: ${date}`);
    await this.page.waitForTimeout(1000);
    await clickCalendarButtonByLabel(this.page, 'Billing Effective Date');
    await this.page.waitForTimeout(500);
    await selectDateFromPicker(this.page, date);
  }

  async selectBillRate(rate: BillRate, index: number = 0): Promise<void> {
    console.log(`Selecting Bill Rate: ${rate}`);
    const idSelector = this.selectors.billRate(index);
    if (await this.page.locator(idSelector).count() > 0) {
      await selectNgOption(this.page, idSelector, rate);
      return;
    }

    const billRateLabel = this.page.getByText('Bill Rate', { exact: true });
    if (await billRateLabel.count() > 0) {
      const labelParent = billRateLabel.locator('xpath=ancestor::*[3]');
      const dropdown = labelParent.locator('ng-select, [class*="select"], input').first();
      if (await dropdown.isVisible({ timeout: 3000 }).catch(() => false)) {
        await dropdown.click({ force: true });
        await this.page.waitForTimeout(1000);
        try {
          await this.page.waitForSelector('ng-dropdown-panel', { state: 'visible', timeout: 5000 });
          await this.page.locator('ng-dropdown-panel .ng-option-label').filter({ hasText: rate }).first().click({ force: true });
        } catch {
          const combobox = labelParent.getByRole('combobox');
          await combobox.click();
          await this.page.waitForTimeout(500);
          await this.page.getByText(rate, { exact: false }).first().click();
        }
      }
    }
  }

  async selectCareLevel(level: string, index: number = 0): Promise<void> {
    console.log(`Selecting Care Level: ${level}`);
    const idSelector = this.selectors.careLevel(index);
    if (await this.page.locator(idSelector).count() > 0) {
      await selectNgOption(this.page, idSelector, level);
      return;
    }

    const careLevelLabel = this.page.getByText('Care Level', { exact: true });
    if (await careLevelLabel.count() > 0) {
      const labelParent = careLevelLabel.locator('xpath=ancestor::*[3]');
      const dropdown = labelParent.locator('ng-select, [class*="select"], input').first();
      if (await dropdown.isVisible({ timeout: 3000 }).catch(() => false)) {
        await dropdown.click({ force: true });
        await this.page.waitForTimeout(1000);
        try {
          await this.page.waitForSelector('ng-dropdown-panel', { state: 'visible', timeout: 5000 });
          await this.page.locator('ng-dropdown-panel .ng-option-label').filter({ hasText: level }).first().click({ force: true });
        } catch {
          const combobox = labelParent.getByRole('combobox');
          await combobox.click();
          await this.page.waitForTimeout(500);
          await this.page.getByText(level, { exact: false }).first().click();
        }
      }
    }
  }

  async selectPatientLiability(value: PatientLiability): Promise<void> {
    await selectNgOption(this.page, this.selectors.patientLiability, value);
  }

  async fillLiabilityAmount(amount: number): Promise<void> {
    await this.page.locator(`input${this.selectors.liabilityAmount}`).fill(amount.toString());
  }

  async fillLiabilityDates(fromDate: string, toDate: string): Promise<void> {
    console.log(`Filling Liability Dates: From ${fromDate} To ${toDate}`);

    const fromLabel = this.page.getByText('From', { exact: true });
    const fromParent = fromLabel.locator('..');
    const fromCalendarBtn = fromParent.getByRole('button', { name: 'custom calendar' });
    await fromCalendarBtn.click();
    await this.page.waitForTimeout(1000);
    await this.page.locator('ngb-datepicker').waitFor({ state: 'visible', timeout: 5000 });
    await selectDateFromPicker(this.page, fromDate);
    await this.page.waitForTimeout(1000);

    const toLabel = this.page.getByText('To', { exact: true });
    const toParent = toLabel.locator('..');
    const toCalendarBtn = toParent.getByRole('button', { name: 'custom calendar' });
    await toCalendarBtn.click();
    await this.page.waitForTimeout(1000);
    await this.page.locator('ngb-datepicker').waitFor({ state: 'visible', timeout: 5000 });
    await selectDateFromPicker(this.page, toDate);
  }
}
