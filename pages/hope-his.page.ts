import { Page, expect } from '@playwright/test';

/**
 * HOPE/HIS Module Page Object
 *
 * Handles the global HIS/HOPE module accessed via the Rubik's cube menu.
 * Contains: Not Exported / Exported tabs, search, filter, grid, export flow.
 */
export class HopeHisPage {
  readonly page: Page;

  private readonly selectors = {
    // ── Tabs ───────────────────────────────────────────────────────────
    notExportedTab: '[data-cy="btn-tab-not-exported"]',
    exportedTab: '[data-cy="btn-tab-exported"]',

    // ── Search & Filter ────────────────────────────────────────────────
    searchBar: '[data-cy="searchbar-search-his"] input.searchbar-input',
    filterBtn: '[data-cy="btn-apply-filters"]',
    clearFilterBtn: '[data-cy="btn-clear-filters"]',
    exportBtn: '[data-cy="btn-export"]',

    // ── Grid (Not Exported) ────────────────────────────────────────────
    headerCheckbox: 'ion-row.pc-20 ion-checkbox button',
    gridRows: 'not-exported-row ion-row.billing-row',
    gridRowCheckbox: (index: number) => `not-exported-row:nth-child(${index + 1}) ion-checkbox button`,

    // ── Row Columns ────────────────────────────────────────────────────
    rowPatient: (index: number) => `not-exported-row:nth-child(${index + 1}) .name-col ion-label`,
    rowChartId: (index: number) => `not-exported-row:nth-child(${index + 1}) .chart-id-col ion-label`,
    rowType: (index: number) => `not-exported-row:nth-child(${index + 1}) .type-col:nth-child(5) ion-label`,
    rowStatus: (index: number) => `not-exported-row:nth-child(${index + 1}) .type-col:last-of-type ion-label`,

    // ── Export Popup ───────────────────────────────────────────────────
    exportPopup: 'his-popup',
    exportAllRadio: 'his-popup input[type="radio"]:first-of-type',
    exportProceedBtn: '[data-cy="btn-submit"]',
    exportCancelBtn: '[data-cy="btn-cancel"]',
  };

  constructor(page: Page) {
    this.page = page;
  }

  // ══════════════════════════════════════════════════════════════════════
  // Navigation
  // ══════════════════════════════════════════════════════════════════════

  /**
   * Navigate to HIS/HOPE module via Rubik's cube menu.
   * Uses the same pattern as DashboardPage.navigateToModule().
   */
  async navigateToHisHopeModule(): Promise<void> {
    // Click Rubik's cube (same selector as DashboardPage)
    const rubiksCube = this.page.locator('[data-cy="btn-options-applications"]').first();
    await rubiksCube.waitFor({ state: 'visible', timeout: 10000 });
    await rubiksCube.click();
    await this.page.waitForTimeout(2000);

    // Click HIS/HOPE inside the popover menu (scope to popover to avoid nav bar match)
    const popover = this.page.locator('ion-popover.apps-popover');
    const hisHopeItem = popover.locator('text=HIS/HOPE').first();
    if (await hisHopeItem.isVisible({ timeout: 5000 }).catch(() => false)) {
      await hisHopeItem.click();
    } else {
      // Fallback: try clicking any menu item containing HIS/HOPE
      await this.page.locator('ion-popover :has-text("HIS/HOPE")').first().click({ force: true });
    }
    await this.page.waitForTimeout(3000);

    // Wait for the page to load
    await this.page.locator(this.selectors.notExportedTab).waitFor({ state: 'visible', timeout: 15000 });
    console.log('Navigated to HIS/HOPE module');
  }

  // ══════════════════════════════════════════════════════════════════════
  // Search
  // ══════════════════════════════════════════════════════════════════════

  /**
   * Search for a patient by name or chart ID
   */
  async searchPatient(searchTerm: string): Promise<void> {
    const searchInput = this.page.locator(this.selectors.searchBar);
    await searchInput.click();
    await searchInput.fill(searchTerm);
    await this.page.waitForTimeout(1000);

    // Click Filter to apply search
    await this.page.locator(this.selectors.filterBtn).click();
    await this.page.waitForTimeout(3000);
    console.log(`Searched for: ${searchTerm}`);
  }

  // ══════════════════════════════════════════════════════════════════════
  // Grid
  // ══════════════════════════════════════════════════════════════════════

  /**
   * Get the number of rows in the grid
   */
  async getRowCount(): Promise<number> {
    return await this.page.locator(this.selectors.gridRows).count();
  }

  /**
   * Read row data by index
   */
  async getRowData(index: number): Promise<Record<string, string>> {
    const row = this.page.locator(this.selectors.gridRows).nth(index);
    const cols = row.locator('ion-col ion-label');
    const labels = ['Patient', 'Chart ID', 'HIS/HOPE', 'Type', 'Record Type', 'Admit Date', 'Discharge Date', 'Status', 'Created Date', 'Submit By Date'];

    const data: Record<string, string> = {};
    const count = await cols.count();
    for (let i = 0; i < Math.min(count, labels.length); i++) {
      data[labels[i]] = (await cols.nth(i).textContent())?.trim() || '';
    }
    return data;
  }

  /**
   * Get all record types visible in the grid (e.g., ['HUV1', 'HUV2', 'DISCHARGE', 'ADMISSION'])
   */
  async getVisibleRecordTypes(): Promise<string[]> {
    const rows = this.page.locator(this.selectors.gridRows);
    const count = await rows.count();
    const types: string[] = [];

    for (let i = 0; i < count; i++) {
      // Type column is the 5th column (index 3 in 0-based, but with checkbox col it shifts)
      const typeCol = rows.nth(i).locator('.type-col ion-label').first();
      const text = (await typeCol.textContent())?.trim() || '';
      if (text) types.push(text);
    }
    return types;
  }

  /**
   * Click the header checkbox to select/deselect all rows
   */
  async selectAllRows(): Promise<void> {
    const headerCheckbox = this.page.locator(this.selectors.headerCheckbox);
    await headerCheckbox.click({ force: true });
    await this.page.waitForTimeout(1000);
    console.log('Selected all rows');
  }

  // ══════════════════════════════════════════════════════════════════════
  // Export Flow
  // ══════════════════════════════════════════════════════════════════════

  /**
   * Click the Export button
   */
  async clickExport(): Promise<void> {
    const exportBtn = this.page.locator(this.selectors.exportBtn);

    // Wait for Export to become enabled (needs at least one row selected)
    for (let i = 0; i < 10; i++) {
      const disabled = await exportBtn.getAttribute('disabled');
      if (disabled === null) break;
      await this.page.waitForTimeout(500);
    }

    await exportBtn.click();
    await this.page.waitForTimeout(2000);
    console.log('Clicked Export');
  }

  /**
   * In the export popup, select "Export all (ignore errors)" and click Proceed
   */
  async exportAllAndProceed(): Promise<void> {
    // Wait for the popup
    const popup = this.page.locator(this.selectors.exportPopup);
    await popup.waitFor({ state: 'visible', timeout: 10000 });
    console.log('Export popup opened');

    // Select "Export all (ignore errors)" — first radio button
    const exportAllRadio = popup.locator('input[type="radio"]').first();
    await exportAllRadio.click({ force: true });
    await this.page.waitForTimeout(1000);
    console.log('  Selected: Export all (ignore errors)');

    // Click Proceed
    const proceedBtn = popup.locator('[data-cy="btn-submit"]');

    // Wait for Proceed to become enabled
    for (let i = 0; i < 10; i++) {
      const disabled = await proceedBtn.getAttribute('disabled');
      if (disabled === null) break;
      await this.page.waitForTimeout(500);
    }

    await proceedBtn.click({ force: true });
    await this.page.waitForTimeout(5000);
    console.log('  Clicked Proceed — export started');
  }

  /**
   * Full export flow: select all → export → export all & proceed
   */
  async exportAllRecords(): Promise<void> {
    console.log('\nExporting all HOPE records...');
    await this.selectAllRows();
    await this.clickExport();
    await this.exportAllAndProceed();
    console.log('Export completed');
  }

  // ══════════════════════════════════════════════════════════════════════
  // Tabs
  // ══════════════════════════════════════════════════════════════════════

  /**
   * Click the "Not Exported" tab
   */
  async clickNotExportedTab(): Promise<void> {
    await this.page.locator(this.selectors.notExportedTab).click();
    await this.page.waitForTimeout(2000);
    console.log('Clicked Not Exported tab');
  }

  /**
   * Click the "Exported" tab
   */
  async clickExportedTab(): Promise<void> {
    await this.page.locator(this.selectors.exportedTab).click();
    await this.page.waitForTimeout(2000);
    console.log('Clicked Exported tab');
  }
}
