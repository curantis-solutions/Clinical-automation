import { Page } from '@playwright/test';
import { BasePage } from './base.page';
import { DateHelper } from '../utils/date-helper';

/**
 * Level of Care (LOC) Page Object
 * Handles the Order Entry LOC form: add new LOC orders, void existing orders,
 * and interact with the order list grid.
 *
 * LOC types: Routine Home Care, Respite Care, General In-Patient, Continuous Care
 * Each type has conditional fields that appear after selection.
 */
export class LOCPage extends BasePage {
  private readonly selectors = {
    // =============================================
    // Navigation
    // =============================================
    profileTab: '[data-cy="btn-nav-bar-item-profile"]',
    orderEntryBtn: '[class*="orderEntryBtn"]',
    addOrderBtn: '[data-cy="btn-create-new-order-for-patient"]',
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
    reasonForRespiteInput: '.input > [data-cy="input-reason-for-respite"]',

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
    submitBtnFallback: '.button-md-success > .button-inner',
    cancelBtn: '[data-cy="btn-cancel-order"]',

    // =============================================
    // Void Order
    // =============================================
    orderOptionsBtn: '[data-cy="order-created-row-btn-show-edit-view-options-popover"]',
    voidOrderMenuItem: '[data-cy="btn-void-loc"]',
    voidDatePicker: '.cancel-modal-container cur-date-picker input',
    voidReasonInput: '.cancel-modal-container input[placeholder="Please be specific"]',
    voidSubmitBtn: '.cancel-footer button.save-button',
    voidCancelBtn: '.cancel-footer button.cancel-button',
    confirmVoidBtn: 'ion-alert button:has-text("Yes")',

    // =============================================
    // Order List Grid
    // =============================================
    orderRows: 'ion-row[data-cy="order"]',
    hideSignedOrdersCheckbox: '[data-cy="toggle-hide-signed-orders"]',

    // =============================================
    // Add Order Modal (auto-prompted after void)
    // =============================================
    addOrderModalProceed: 'ion-footer.add-order-modal-footer button.button-md-success',

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
    await this.page.locator(this.selectors.profileTab).click();
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
    await this.page.waitForTimeout(1000);
    const exitButton = this.page.locator(this.selectors.exitOrderEntryBtn);
    try {
      await exitButton.waitFor({ state: 'visible', timeout: 5000 });
      await exitButton.click();
      await this.page.waitForTimeout(5000);
      console.log('Exited Order Management');
    } catch {
      console.log('Exit button not found, may already be on patient page');
    }
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
    const textarea = this.page.locator(this.selectors.providerNotesTextarea);
    await textarea.waitFor({ state: 'visible', timeout: 10000 });
    await textarea.click();
    await textarea.fill(text);
    console.log('Filled provider notes');
  }

  // ============================================
  // Action Buttons
  // ============================================

  async clickSubmit(): Promise<void> {
    // The Add Order modal uses "Proceed" (in ion-footer), not "Submit"
    const proceedBtn = this.page.locator(this.selectors.addOrderModalProceed);
    const submitBtn = this.page.locator(this.selectors.submitBtn);
    const fallbackBtn = this.page.locator(this.selectors.submitBtnFallback);

    if (await proceedBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await proceedBtn.click({ force: true });
    } else if (await submitBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await submitBtn.click({ force: true });
    } else {
      await fallbackBtn.click({ force: true });
    }
    await this.page.waitForTimeout(10000);
    console.log('Submitted/Proceeded order');
  }

  async clickCancel(): Promise<void> {
    await this.page.locator(this.selectors.cancelBtn).click();
    await this.page.waitForTimeout(1000);
    console.log('Cancelled order');
  }

  async isSubmitEnabled(): Promise<boolean> {
    const submitBtn = this.page.locator(this.selectors.submitBtn);
    if (await submitBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      return await submitBtn.isEnabled();
    }
    return await this.page.locator(this.selectors.submitBtnFallback).isEnabled();
  }

  async isLOCFormVisible(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.levelOfCareSelect);
  }

  // ============================================
  // Void Order
  // ============================================

  async openVoidOrder(orderIndex: number = 0): Promise<void> {
    const optionsBtn = this.page.locator(this.selectors.orderRows).nth(orderIndex).locator(this.selectors.orderOptionsBtn);
    await optionsBtn.click();
    await this.page.waitForTimeout(500);
    await this.page.locator(this.selectors.voidOrderMenuItem).click();
    await this.page.waitForTimeout(2000);
    console.log(`Opened Void Order dialog for order index: ${orderIndex}`);
  }

  async fillVoidDate(date: string): Promise<void> {
    const input = this.page.locator(this.selectors.voidDatePicker);
    // force: true needed — a parent <div class="form-group"> intercepts pointer events
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
    console.log(`Filled void reason: ${reason}`);
  }

  async submitVoid(): Promise<void> {
    await this.page.locator(this.selectors.voidSubmitBtn).click();
    await this.page.waitForTimeout(2000);

    // Handle confirmation dialog if it appears
    const confirmBtn = this.page.locator(this.selectors.confirmVoidBtn);
    if (await confirmBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await confirmBtn.click();
      await this.page.waitForTimeout(2000);
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
   * Uncheck "Hide Signed Orders" so signed orders are visible in the grid.
   */
  async unhideSignedOrders(): Promise<void> {
    const toggle = this.page.locator(this.selectors.hideSignedOrdersCheckbox);
    if (await toggle.isVisible({ timeout: 3000 }).catch(() => false)) {
      const innerBtn = toggle.locator('button');
      const isChecked = await innerBtn.getAttribute('aria-checked');
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
    // Look for a row containing the LOC type
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
   * @param timeout - Max wait time in ms (default 10000)
   * @returns true if rows appeared, false if timed out
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
   * Checks that the row contains "Level of Care" and does NOT contain "Voided".
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
