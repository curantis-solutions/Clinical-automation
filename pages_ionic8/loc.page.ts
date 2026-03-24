import { Page } from '@playwright/test';
import { BasePage } from '../pages/base.page';
import { DateHelper } from '../utils/date-helper';

/**
 * Level of Care (LOC) Page Object — Ionic 8 (qa2)
 *
 * VERIFIED via MCP Playwright on qa2 (2026-03-24).
 *
 * KEY CHANGES from Ionic 4 (qa1):
 * - Order rows: tr[data-cy^="row-order-created"] (was ion-row.order-row / ion-row[data-cy="order"])
 * - Order row cells: cell-{field}-{N} data-cy pattern (e.g. cell-type-0, cell-name-description-0)
 * - Order type dropdown: select-order-type-dropdown SAME
 * - LOC form selectors: ALL SAME (select-level-of-care, select-care-location-type, etc.)
 * - Start date: cur-date-picker[data-cy="date-order-start-date"] SAME
 * - Provider notes: voice-ion-textarea[data-cy="input-provider-notes"] (was textarea)
 * - E-sign checkbox: ion-checkbox[data-cy="checkbox-e-sign-verification"] SAME
 * - Submit/Cancel: btn-submit-order / btn-cancel-order SAME
 * - Hide signed orders: ion-toggle[data-cy="toggle-hide-signed-orders"] (was checkbox)
 * - Hide discontinued: ion-toggle[data-cy="toggle-hide-discontinued-canceled-rejected-orders"] (NEW)
 * - Add Order button: btn-add-order (was btn-create-new-order-for-patient)
 * - Options popover: btn-more-options-created-{N} (was order-created-row-btn-show-edit-view-options-popover)
 * - Void menu item: btn-void-loc (ion-item in popover) SAME
 * - Void modal: header-void-order, form-void-order, footer-void-order (NEW)
 * - Void date: input-void-date — disabled/auto-filled with today's date
 * - Void reason: input-void-reason (ion-input, target inner input)
 * - Void save/cancel: btn-save-void-order / btn-cancel-void-order (was btn-submit-void-order)
 * - Void confirm: ion-alert with "Yes"/"No" buttons SAME
 * - Respite reason: input-reason-for-respite (ion-input, target inner input)
 * - Add Order modal: content-add-order-modal, form-add-order, footer-add-order-modal (NEW)
 * - LOC grid content: content-level-of-care, panel-level-of-care-history (NEW)
 * - Order Entry button: btn-open-order-entry-page SAME
 * - Exit button: btn-exit-order-entry-page SAME
 */
export class LOCPage extends BasePage {
  private readonly selectors = {
    // =============================================
    // Navigation
    // =============================================
    profileTab: '[data-cy="btn-nav-bar-item-profile"]',
    orderEntryBtn: '[data-cy="btn-open-order-entry-page"]',
    addOrderBtn: '[data-cy="btn-add-order"]',
    exitOrderEntryBtn: '[data-cy="btn-exit-order-entry-page"]',

    // =============================================
    // Order Type Dropdown
    // =============================================
    orderTypeDropdown: '[data-cy="select-order-type-dropdown"]',

    // =============================================
    // LOC Form — Common Fields
    // =============================================
    levelOfCareSelect: '[data-cy="select-level-of-care"]',
    careLocationTypeSelect: '[data-cy="select-care-location-type"]',
    careLocationSelect: '[data-cy="select-care-location"]',
    careLocationInput: '[data-cy="select-care-location"] input',
    startDatePicker: '[data-cy="date-order-start-date"]',
    orderingProviderSelect: '[data-cy="select-ordering-provider"]',
    orderingProviderInput: '[data-cy="select-ordering-provider"] input',
    providerNotesTextarea: '[data-cy="input-provider-notes"]',

    // =============================================
    // LOC Form — Conditional Fields
    // =============================================

    // Respite Care
    reasonForRespiteInput: '[data-cy="input-reason-for-respite"] input',

    // General In-Patient (GIP) — checkboxes by kebab-case reason
    gipCheckbox: (reason: string) => `[data-cy="checkbox-${this.toKebabCase(reason)}"]`,

    // Continuous Care — multi-select symptoms
    symptomsSelect: '[data-cy="select-symptoms"]',
    symptomOption: (symptom: string) => `[data-cy="symptoms-option-${this.toKebabCase(symptom)}"]`,
    symptomsArrow: '[data-cy="select-symptoms"] [class="ng-arrow"]',

    // =============================================
    // Order Approval
    // =============================================
    verbalRadio: '[data-cy="radio-verbal"]',
    writtenRadio: '[data-cy="radio-written"]',
    eSignCheckbox: '[data-cy="checkbox-e-sign-verification"]',

    // =============================================
    // Action Buttons
    // =============================================
    submitBtn: '[data-cy="btn-submit-order"]',
    cancelBtn: '[data-cy="btn-cancel-order"]',

    // =============================================
    // Void Order
    // =============================================
    orderOptionsBtn: (index: number) => `[data-cy="btn-more-options-created-${index}"]`,
    voidOrderMenuItem: '[data-cy="btn-void-loc"]',
    voidDatePicker: '[data-cy="input-void-date"] input',
    voidReasonInput: '[data-cy="input-void-reason"] input',
    voidSubmitBtn: '[data-cy="btn-save-void-order"]',
    voidCancelBtn: '[data-cy="btn-cancel-void-order"]',
    confirmVoidBtn: 'ion-alert button:has-text("Yes")',

    // =============================================
    // Order List Grid
    // =============================================
    orderRows: 'tr[data-cy^="row-order-created"]',
    hideSignedOrdersToggle: '[data-cy="toggle-hide-signed-orders"]',
    hideDiscontinuedToggle: '[data-cy="toggle-hide-discontinued-canceled-rejected-orders"]',

    // =============================================
    // LOC History (Level of Care tab)
    // =============================================
    locContent: '[data-cy="content-level-of-care"]',
    locHistoryPanel: '[data-cy="panel-level-of-care-history"]',
    locHistoryRows: 'ion-row.table-values.scroll_row',

    // =============================================
    // Add Order Modal
    // =============================================
    addOrderModalContent: '[data-cy="content-add-order-modal"]',
    addOrderModalFooter: '[data-cy="footer-add-order-modal"]',
    addOrderForm: '[data-cy="form-add-order"]',

    // =============================================
    // ng-select generic helpers
    // =============================================
    ngOption: '[class*="ng-option"] span',
    ngOptionLabel: '.ng-option-label',
  };

  constructor(page: Page) {
    super(page);
  }

  /** Convert a string to kebab-case for data-cy attribute matching */
  private toKebabCase(str: string): string {
    return str.toLowerCase().replace(/\s+/g, '-');
  }

  // ============================================
  // Navigation
  // ============================================

  async navigateToProfile(): Promise<void> {
    await this.page.locator(this.selectors.profileTab).last().click();
    await this.page.waitForTimeout(2000);
    console.log('Navigated to Profile tab');
  }

  async navigateToOrderEntry(): Promise<void> {
    await this.page.locator(this.selectors.orderEntryBtn).scrollIntoViewIfNeeded();
    await this.page.locator(this.selectors.orderEntryBtn).click();
    await this.page.waitForTimeout(3000);
    console.log('Navigated to Order Entry');
  }

  async exitOrderManagement(): Promise<void> {
    await this.page.waitForTimeout(3000);
    const exitButton = this.page.locator(this.selectors.exitOrderEntryBtn);
    await exitButton.waitFor({ state: 'visible', timeout: 15000 });
    await exitButton.click();
    await this.page.waitForTimeout(5000);
    console.log('Exited Order Management');
  }

  // ============================================
  // Add Mode
  // ============================================

  async clickAddOrder(): Promise<void> {
    await this.page.locator(this.selectors.addOrderBtn).click();
    await this.page.waitForTimeout(2000);
    console.log('Clicked Add Order');
  }

  async selectOrderType(type: string): Promise<void> {
    await this.page.locator(this.selectors.orderTypeDropdown).click();
    await this.page.waitForTimeout(2000);
    await this.page.locator(this.selectors.ngOption).filter({ hasText: type }).click();
    await this.page.waitForTimeout(2000);
    console.log(`Selected order type: ${type}`);
  }

  // ============================================
  // LOC Form — Common Fields
  // ============================================

  async selectLevelOfCare(locType: string): Promise<void> {
    await this.page.locator(this.selectors.levelOfCareSelect).click();
    await this.page.waitForTimeout(2000);
    await this.page.locator(this.selectors.ngOption).filter({ hasText: locType }).click();
    await this.page.waitForTimeout(2000);
    console.log(`Selected Level of Care: ${locType}`);
  }

  async selectCareLocationType(type: string): Promise<void> {
    await this.page.locator(this.selectors.careLocationTypeSelect).click();
    await this.page.waitForTimeout(2000);
    await this.page.locator(this.selectors.ngOption).filter({ hasText: type }).click();
    await this.page.waitForTimeout(2000);
    console.log(`Selected Care Location Type: ${type}`);
  }

  async searchAndSelectCareLocation(name: string): Promise<void> {
    // Clear any existing selection first (ng-select may auto-populate)
    const clearBtn = this.page.locator(this.selectors.careLocationSelect).locator('.ng-clear-wrapper');
    if (await clearBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await clearBtn.click();
      await this.page.waitForTimeout(500);
    }

    const input = this.page.locator(this.selectors.careLocationInput);
    await input.click();
    await input.fill(name);
    await this.page.waitForTimeout(2000);
    await this.page.locator(this.selectors.ngOption).filter({ hasText: name }).click();
    await this.page.waitForTimeout(2000);
    console.log(`Selected Care Location: ${name}`);
  }

  async setStartDate(date: string): Promise<void> {
    await this.page.locator(this.selectors.startDatePicker).click();
    await this.page.waitForTimeout(500);
    await DateHelper.selectDateFormatted(this.page, date);
    console.log(`Set start date: ${date}`);
  }

  async searchAndSelectOrderingProvider(name: string): Promise<void> {
    const input = this.page.locator(this.selectors.orderingProviderInput);
    await input.click();
    await this.page.waitForTimeout(1000);
    await input.fill(name);
    await this.page.waitForTimeout(2000);
    await this.page.locator(this.selectors.ngOptionLabel).first().click();
    await this.page.waitForTimeout(1000);
    console.log(`Selected Ordering Provider: ${name}`);
  }

  // ============================================
  // LOC Form — Conditional Fields
  // ============================================

  async fillReasonForRespite(reason: string): Promise<void> {
    const input = this.page.locator(this.selectors.reasonForRespiteInput);
    await input.click();
    await input.fill(reason);
    await this.page.waitForTimeout(1000);
    console.log(`Filled Reason for Respite: ${reason}`);
  }

  async selectGIPReasons(reasons: string[]): Promise<void> {
    for (const reason of reasons) {
      await this.page.locator(this.selectors.gipCheckbox(reason)).click();
      await this.page.waitForTimeout(500);
      console.log(`Checked GIP reason: ${reason}`);
    }
  }

  async selectSymptoms(symptoms: string[]): Promise<void> {
    await this.page.locator(this.selectors.symptomsSelect).click();
    await this.page.waitForTimeout(1000);

    for (const symptom of symptoms) {
      await this.page.locator(this.selectors.symptomOption(symptom)).click();
      await this.page.waitForTimeout(500);
      console.log(`Selected symptom: ${symptom}`);
    }

    // Close the dropdown
    await this.page.locator(this.selectors.symptomsArrow).click();
    await this.page.waitForTimeout(1000);
  }

  // ============================================
  // Order Approval
  // ============================================

  async selectApprovalType(type: 'MD' | 'Verbal' | 'Written'): Promise<void> {
    switch (type) {
      case 'MD':
        await this.page.locator(this.selectors.eSignCheckbox).click();
        await this.page.waitForTimeout(2000);
        console.log('Selected E-Sign attestation (MD)');
        break;
      case 'Verbal':
        await this.page.locator(this.selectors.verbalRadio).click();
        await this.page.waitForTimeout(1000);
        console.log('Selected Verbal order approval');
        break;
      case 'Written':
        await this.page.locator(this.selectors.writtenRadio).click();
        await this.page.waitForTimeout(1000);
        console.log('Selected Written order approval');
        break;
    }
  }

  // ============================================
  // Text Fields
  // ============================================

  async fillProviderNotes(text: string): Promise<void> {
    // In Ionic 8, provider notes uses voice-ion-textarea — target the textarea inside
    const textarea = this.page.locator(`${this.selectors.providerNotesTextarea} textarea`);
    await textarea.waitFor({ state: 'visible', timeout: 10000 });
    await textarea.click();
    await textarea.fill(text);
    console.log('Filled provider notes');
  }

  // ============================================
  // Action Buttons
  // ============================================

  async clickSubmit(): Promise<void> {
    const submitBtn = this.page.locator(this.selectors.submitBtn);
    await submitBtn.click({ force: true });
    await this.page.waitForTimeout(10000);
    console.log('Submitted/Proceeded order');
  }

  async clickCancel(): Promise<void> {
    await this.page.locator(this.selectors.cancelBtn).click();
    await this.page.waitForTimeout(1000);
    console.log('Cancelled order');
  }

  async isSubmitEnabled(): Promise<boolean> {
    return await this.page.locator(this.selectors.submitBtn).isEnabled();
  }

  async isLOCFormVisible(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.levelOfCareSelect);
  }

  // ============================================
  // Void Order
  // ============================================

  async openVoidOrder(orderIndex: number = 0): Promise<void> {
    const optionsBtn = this.page.locator(this.selectors.orderOptionsBtn(orderIndex));
    await optionsBtn.click();
    await this.page.waitForTimeout(1000);
    await this.page.locator(this.selectors.voidOrderMenuItem).click();
    await this.page.waitForTimeout(2000);
    console.log(`Opened Void Order dialog for order index: ${orderIndex}`);
  }

  async fillVoidDate(date: string): Promise<void> {
    const input = this.page.locator(this.selectors.voidDatePicker);
    const isDisabled = await input.isDisabled();
    if (isDisabled) {
      console.log('Void date is disabled (auto-filled) — skipping');
      return;
    }
    await input.click({ clickCount: 3, force: true });
    await input.fill(date);
    await this.page.waitForTimeout(500);
    console.log(`Set void date: ${date}`);
  }

  async fillVoidReason(reason: string): Promise<void> {
    const input = this.page.locator(this.selectors.voidReasonInput);
    await input.waitFor({ state: 'visible', timeout: 10000 });
    await input.click();
    await input.fill(reason);
    await this.page.waitForTimeout(500);
    console.log(`Filled void reason: ${reason}`);
  }

  async submitVoid(): Promise<void> {
    await this.page.locator(this.selectors.voidSubmitBtn).click({ force: true });
    await this.page.waitForTimeout(3000);

    // Handle confirmation dialog if it appears
    const confirmBtn = this.page.locator(this.selectors.confirmVoidBtn);
    if (await confirmBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await confirmBtn.click();
      await this.page.waitForTimeout(3000);
    }

    console.log('Void order submitted');
  }

  async cancelVoid(): Promise<void> {
    await this.page.locator(this.selectors.voidCancelBtn).click();
    // Handle "Are you sure you wish to cancel" confirmation
    const confirmYes = this.page.locator(this.selectors.confirmVoidBtn);
    if (await confirmYes.isVisible({ timeout: 3000 }).catch(() => false)) {
      await confirmYes.click();
      await this.page.waitForTimeout(1000);
    }
    console.log('Void order cancelled');
  }

  // ============================================
  // Order List Grid
  // ============================================

  /**
   * Toggle "Hide Signed Orders" off so signed orders are visible in the grid.
   * In Ionic 8 this is an ion-toggle, not a checkbox.
   */
  async unhideSignedOrders(): Promise<void> {
    const toggle = this.page.locator(this.selectors.hideSignedOrdersToggle);
    if (await toggle.isVisible({ timeout: 3000 }).catch(() => false)) {
      const isChecked = await toggle.getAttribute('aria-checked');
      if (isChecked === 'true') {
        await toggle.click();
        await this.page.waitForTimeout(2000);
        console.log('Unchecked "Hide Signed Orders"');
      }
    }
  }

  /**
   * Verify that an order with the given LOC type appears in the grid.
   */
  async verifyOrderInGrid(locType: string): Promise<boolean> {
    const matchingRow = this.page.locator(this.selectors.orderRows).filter({ hasText: locType });
    const count = await matchingRow.count();
    if (count > 0) {
      console.log(`Verified: "${locType}" order found in grid (${count} row(s))`);
      return true;
    }

    console.log(`"${locType}" order NOT found in grid`);
    return false;
  }

  /**
   * Wait for at least one order row to appear in the grid.
   */
  async waitForOrderRows(timeout: number = 10000): Promise<boolean> {
    try {
      await this.page.locator(this.selectors.orderRows).first().waitFor({ state: 'visible', timeout });
      console.log('Order rows loaded in grid');
      return true;
    } catch {
      console.log('No order rows appeared within timeout');
      return false;
    }
  }

  /**
   * Find the first non-voided Level of Care order row index in the grid.
   */
  async findActiveLOCOrderIndex(): Promise<number> {
    const rows = this.page.locator(this.selectors.orderRows);
    const count = await rows.count();
    for (let i = 0; i < count; i++) {
      const rowText = await rows.nth(i).textContent() || '';
      if (rowText.includes('Level of Care') && !rowText.includes('Voided')) {
        console.log(`Found active LOC order at index ${i}`);
        return i;
      }
    }
    throw new Error('No active (non-voided) Level of Care order found in grid');
  }

  async getOrderRowCount(): Promise<number> {
    const rows = this.page.locator(this.selectors.orderRows);
    return await rows.count();
  }

  async getOrderRowData(index: number): Promise<{ text: string }> {
    const row = this.page.locator(this.selectors.orderRows).nth(index);
    const text = (await row.textContent())?.trim() || '';
    return { text };
  }

  async clickOrderDetails(index: number): Promise<void> {
    await this.page.locator(this.selectors.orderRows).nth(index).click();
    await this.page.waitForTimeout(1000);
    console.log(`Clicked order details for row index: ${index}`);
  }
}
