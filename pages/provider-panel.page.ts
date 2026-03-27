import { Page } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Provider Panel Page Object
 * Handles Provider Panel operations:
 * - E-sign orders
 * - Reject orders
 * - Bulk e-sign (selected / all)
 * - Search, sort, collapse/expand
 * - Navigate to patient Order Entry
 */
export class ProviderPanelPage extends BasePage {
  private readonly selectors = {
    // Navigation
    providerPanelBtn: '[data-cy="btn-provider-physician-panel"]',
    exitProviderPanelBtn: '[class*="button-md-danger"]',
    
    // Provider Search
    orderingProviderSearch: '[id="orderingProvider"] input',
    providerOption: '.ng-option-label',

    //Filters
    providerOpensearch:'[class="provider-panel-search-container"] [class="searchbar-input"]',

    // Grid Controls — no data-cy attributes, use role/text selectors in methods
    collapseAllBtn: 'button:has-text("Collapse All")',
    expandAllBtn: 'button:has-text("Expand All")',
    searchInput: 'searchbox, input.searchbar-input, [class*="searchbar-input"]',

    // Order Row — no data-cy; each order row contains checkbox + order number + type + name + icons
    orderRow: 'ion-row.data-row, ion-row.order-row',
    orderEntryBtn: 'button:has-text("Order Entry")',

    // Checkboxes for bulk actions
    orderCheckbox: 'ion-checkbox',

    // Ellipsis Menu — inside more-vertical-ellipsis column, has data-cy="btn-allergy-more"
    ellipsisMenu: '[class*="more-vertical-ellipsis"] [data-cy="btn-allergy-more"]',
    eSignOption: '[data-cy="btn-eSign"]',
    rejectOrderOption: '[data-cy="btn-reject"]',

    // E-Sign Popup
    eSignSubmitBtn: 'button:has-text("Submit"), button:has-text("Confirm")',

    // Reject Popup
    rejectReasonInput: 'textarea, input[placeholder*="reason"], input[placeholder*="Reason"]',
    rejectSubmitBtn: 'button:has-text("Submit"), button:has-text("Confirm")',

    // Bulk Actions Dropdown
    bulkActionsDropdown: '[id="bulkActions"], ng-select:has-text("Actions")',
    eSignSelectedOption: '.ng-option:has-text("e-Sign Selected")',
    eSignAllOption: '.ng-option:has-text("e-Sign All")',

    // Bulk E-Sign Popup
    bulkESignWarningCounter: '[class*="counter"], [class*="warning"]',
    bulkESignSubmitBtn: 'button:has-text("Submit"), button:has-text("Confirm")',

    // Column Headers for sorting
    sortColumnHeader: (column: string) => `[data-cy="header-${column}"]`,
  };

  constructor(page: Page) {
    super(page);
  }

  // ============================================
  // Navigation
  // ============================================

  async navigateToProviderPanel(): Promise<void> {
    await this.page.locator(this.selectors.providerPanelBtn).click();
    await this.page.waitForTimeout(3000);

    // Default tab may be eRx — switch to Orders tab if visible
    const ordersTab = this.page.getByText('Orders', { exact: true }).first();
    if (await ordersTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await ordersTab.click();
      await this.page.waitForTimeout(2000);
      console.log('Switched to Orders tab');
    }
    console.log('Navigated to Provider Panel');
  }

  async exitProviderPanel(): Promise<void> {
    await this.page.locator(this.selectors.exitProviderPanelBtn).click();
    await this.page.waitForTimeout(3000);
    console.log('Exited Provider Panel');
  }

  async navigateToPatientOrderEntry(rowIndex: number = 0): Promise<void> {
    const rows = this.page.locator(this.selectors.orderRow);
    await rows.nth(rowIndex).locator(this.selectors.orderEntryBtn).click();
    await this.page.waitForTimeout(3000);
    console.log('Navigated to patient Order Entry from Provider Panel');
  }

  async clickPatientId(rowIndex: number = 0): Promise<void> {
    const rows = this.page.locator(this.selectors.orderRow);
    await rows.nth(rowIndex).locator(this.selectors.patientIdLink).click();
    await this.page.waitForTimeout(3000);
    console.log('Clicked Patient ID link');
  }

  // ============================================
  // Provider Search
  // ============================================

  async searchProvider(providerName: string): Promise<void> {
    await this.page.locator(this.selectors.orderingProviderSearch).click();
    await this.page.waitForTimeout(500);
    await this.page.locator(this.selectors.orderingProviderSearch).fill(providerName);
    await this.page.waitForTimeout(2000);
    await this.page.locator(this.selectors.providerOption).first().click();
    await this.page.waitForTimeout(2000);
    console.log(`Searched and selected provider: ${providerName}`);
  }

  // ============================================
  // Collapse / Expand
  // ============================================

  async collapseAll(): Promise<void> {
    await this.page.locator(this.selectors.collapseAllBtn).click();
    await this.page.waitForTimeout(1000);
    console.log('Collapsed all orders');
  }

  async expandAll(): Promise<void> {
    await this.page.locator(this.selectors.expandAllBtn).click();
    await this.page.waitForTimeout(1000);
    console.log('Expanded all orders');
  }

  // ============================================
  // E-Sign Single Order
  // ============================================

  async eSignOrder(rowIndex: number): Promise<void> {
    console.log(`\n--- E-signing order at row ${rowIndex} ---`);

    // Click the nth ellipsis (more) icon visible on the page
    const ellipsis = this.page.locator(this.selectors.ellipsisMenu).nth(rowIndex);
    await ellipsis.click();
    await this.page.waitForTimeout(1000);

    await this.page.locator(this.selectors.eSignOption).first().click();
    await this.page.waitForTimeout(2000);

    // Submit e-sign confirmation — look for Submit/Confirm button in popover/dialog
    const submitBtn = this.page.getByRole('button', { name: /submit|confirm|e-sign/i }).first();
    await submitBtn.click();
    await this.page.waitForTimeout(3000);
    console.log('Order e-signed\n');
  }

  // ============================================
  // Reject Single Order
  // ============================================

  async rejectOrder(rowIndex: number, reason: string): Promise<void> {
    console.log(`\n--- Rejecting order at row ${rowIndex} ---`);

    const ellipsis = this.page.locator(this.selectors.ellipsisMenu).nth(rowIndex);
    await ellipsis.click();
    await this.page.waitForTimeout(1000);

    await this.page.locator(this.selectors.rejectOrderOption).first().click();
    await this.page.waitForTimeout(2000);

    // Fill reject reason — find textarea or input in the dialog
    const reasonInput = this.page.locator('ion-modal textarea, ion-modal input[placeholder*="eason"], textarea[placeholder*="eason"]').first();
    await reasonInput.fill(reason);
    await this.page.waitForTimeout(500);

    const submitBtn = this.page.getByRole('button', { name: /submit|confirm|reject/i }).first();
    await submitBtn.click();
    await this.page.waitForTimeout(3000);
    console.log('Order rejected\n');
  }

  // ============================================
  // Bulk Operations
  // ============================================

  async selectOrderCheckbox(rowIndex: number): Promise<void> {
    const rows = this.page.locator(this.selectors.orderRow);
    await rows.nth(rowIndex).locator(this.selectors.orderCheckbox).click();
    await this.page.waitForTimeout(500);
    console.log(`Selected checkbox for row ${rowIndex}`);
  }

  async selectMultipleOrders(rowIndices: number[]): Promise<void> {
    for (const index of rowIndices) {
      await this.selectOrderCheckbox(index);
    }
    console.log(`Selected ${rowIndices.length} orders`);
  }

  async eSignSelectedOrders(): Promise<void> {
    console.log('\n--- E-signing selected orders ---');

    await this.page.locator(this.selectors.bulkActionsDropdown).click();
    await this.page.waitForTimeout(1000);

    await this.page.locator(this.selectors.eSignSelectedOption).click();
    await this.page.waitForTimeout(2000);

    // Verify counter and submit
    await this.page.locator(this.selectors.bulkESignSubmitBtn).click();
    await this.page.waitForTimeout(5000);
    console.log('Selected orders e-signed\n');
  }

  async eSignAllOrders(): Promise<void> {
    console.log('\n--- E-signing all orders ---');

    await this.page.locator(this.selectors.bulkActionsDropdown).click();
    await this.page.waitForTimeout(1000);

    await this.page.locator(this.selectors.eSignAllOption).click();
    await this.page.waitForTimeout(2000);

    await this.page.locator(this.selectors.bulkESignSubmitBtn).click();
    await this.page.waitForTimeout(5000);
    console.log('All orders e-signed\n');
  }

  async getBulkESignCounter(): Promise<string> {
    const text = await this.page.locator(this.selectors.bulkESignWarningCounter).textContent();
    return text || '';
  }

  // ============================================
  // Search & Sort
  // ============================================

  async searchOrders(searchTerm: string): Promise<void> {
    // ion-searchbar wraps an input — target the actual input element
    const searchBox = this.page.locator('.searchbar-input-container input.searchbar-input, input.searchbar-input').first();
    await searchBox.clear();
    await this.page.waitForTimeout(500);
    await searchBox.fill(searchTerm);
    await searchBox.press('Enter');
    await this.page.waitForTimeout(3000);
    console.log(`Searched provider panel: ${searchTerm}`);
  }

  /**
   * E-sign the order matching a specific order ID.
   * Finds the row containing the order ID text, then clicks its ellipsis.
   */
  async eSignOrderById(orderId: string): Promise<void> {
    console.log(`\n--- E-signing order ${orderId} ---`);

    // Navigate from order ID text up to the ion-row, then find the ellipsis within it
    const row = this.page.locator(`text="${orderId}"`).locator('xpath=ancestor::ion-row[1]');
    await row.locator(this.selectors.ellipsisMenu).first().click();
    await this.page.waitForTimeout(1000);

    await this.page.locator(this.selectors.eSignOption).first().click();
    await this.page.waitForTimeout(2000);

    const submitBtn = this.page.getByRole('button', { name: /submit|confirm|e-sign/i }).first();
    await submitBtn.click();
    await this.page.waitForTimeout(3000);
    console.log(`Order ${orderId} e-signed\n`);
  }

  /**
   * Reject the order matching a specific order ID.
   * Finds the row containing the order ID text, then clicks its ellipsis.
   */
  async rejectOrderById(orderId: string, reason: string): Promise<void> {
    console.log(`\n--- Rejecting order ${orderId} ---`);

    // Navigate from order ID text up to the ion-row, then find the ellipsis within it
    const row = this.page.locator(`text="${orderId}"`).locator('xpath=ancestor::ion-row[1]');
    await row.locator(this.selectors.ellipsisMenu).first().click();
    await this.page.waitForTimeout(1000);

    await this.page.locator(this.selectors.rejectOrderOption).first().click();
    await this.page.waitForTimeout(2000);

    const reasonInput = this.page.locator('ion-modal textarea, ion-modal input[placeholder*="eason"], textarea[placeholder*="eason"]').first();
    await reasonInput.fill(reason);
    await this.page.waitForTimeout(500);

    const submitBtn = this.page.getByRole('button', { name: /submit|confirm|reject/i }).first();
    await submitBtn.click();
    await this.page.waitForTimeout(3000);
    console.log(`Order ${orderId} rejected\n`);
  }

  async sortByColumn(columnName: string): Promise<void> {
    await this.page.locator(this.selectors.sortColumnHeader(columnName)).click();
    await this.page.waitForTimeout(1000);
    console.log(`Sorted by column: ${columnName}`);
  }

  // ============================================
  // Verification Helpers
  // ============================================

  async getOrderRowCount(): Promise<number> {
    return await this.page.locator(this.selectors.orderRow).count();
  }

  async isOrderVisible(orderDescription: string): Promise<boolean> {
    const pageContent = await this.page.content();
    return pageContent.includes(orderDescription);
  }

  async isESignOptionAvailable(rowIndex: number): Promise<boolean> {
    const rows = this.page.locator(this.selectors.orderRow);
    await rows.nth(rowIndex).locator(this.selectors.ellipsisMenu).click();
    await this.page.waitForTimeout(1000);

    const isVisible = await this.isElementVisible(this.selectors.eSignOption);
    // Close menu by pressing Escape
    await this.page.keyboard.press('Escape');
    await this.page.waitForTimeout(500);
    return isVisible;
  }

  async isRejectOptionAvailable(rowIndex: number): Promise<boolean> {
    const rows = this.page.locator(this.selectors.orderRow);
    await rows.nth(rowIndex).locator(this.selectors.ellipsisMenu).click();
    await this.page.waitForTimeout(1000);

    const isVisible = await this.isElementVisible(this.selectors.rejectOrderOption);
    await this.page.keyboard.press('Escape');
    await this.page.waitForTimeout(500);
    return isVisible;
  }
}
