import { Page, expect } from '@playwright/test';
import { BasePage } from '../base.page';
import { TIMEOUTS } from '../../config/timeouts';
import { BatchRowData, BatchDetailRowData, BatchDownloadFormat } from '../../types/billing.types';

/**
 * 837 Batch Management Page Object
 * Handles interactions with the Billing > 837 Batch Management grid and expanded details.
 * All selectors confirmed via MCP Playwright exploration (2026-03-30).
 */
export class BatchManagementPage extends BasePage {
  private readonly selectors = {
    // === Navigation ===
    mainTab: '[data-cy="btn-tab-eightthirtyseven-management"]',

    // === Search ===
    searchInput: '[data-cy="searchbar-search-eight-thirty-seven"] input',

    // === Summary ===
    batchCount: '[data-cy="label-batch-count"]',
    batchTotal: '[data-cy="label-batch-total"]',

    // === Batch Grid (0-indexed) ===
    gridRowCounter: '[data-cy^="label-batch-name-"]',
    payerType: (i: number) => `[data-cy="label-payer-type-${i}"]`,
    payerName: (i: number) => `[data-cy="label-payer-name-${i}"]`,
    batchName: (i: number) => `[data-cy="label-batch-name-${i}"]`,
    batchBalance: (i: number) => `[data-cy="label-batch-balance-${i}"]`,
    siaBalance: (i: number) => `[data-cy="label-sia-balance-${i}"]`,
    totalClaims: (i: number) => `[data-cy="label-total-claims-${i}"]`,
    postDate: (i: number) => `[data-cy="label-post-date-${i}"]`,
    generatedBy: (i: number) => `[data-cy="label-generated-username-${i}"]`,
    status: (i: number) => `[data-cy="label-post-status-${i}"]`,
    expandRowImg: (i: number) => `[data-cy="img-expand-batch-col-${i}"]`,
    expandRowBtn: (i: number) => `[data-cy="btn-expand-batch-row-${i}"]`,
    rowCheckbox: (i: number) => `[data-cy="chk-toggle-payment-${i}"]`,

    // === Expanded Detail (0-indexed within batch) ===
    detailPatientId: (i: number) => `[data-cy="label-patient-id-${i}"]`,
    detailPatientName: (i: number) => `[data-cy="label-patient-name-${i}"]`,
    detailPayerName: (i: number) => `[data-cy="label-payer-name-${i}"]`,
    detailClaimId: (i: number) => `[data-cy="label-claim-id-${i}"]`,
    detailClaimBalance: (i: number) => `[data-cy="label-claim-balance-${i}"]`,
    detailSiaTotal: (i: number) => `[data-cy="label-sia-total-${i}"]`,
    detailClaimTotal: (i: number) => `[data-cy="label-claim-total-${i}"]`,

    // === Detail Header (non-indexed — anchor for scoping) ===
    detailHeaderPatientChartId: '[data-cy="label-patient-chart-id"]',
  };

  constructor(page: Page) {
    super(page);
  }

  // ── Navigation ──

  async clickMainTab(): Promise<void> {
    await this.page.locator(this.selectors.mainTab).click();
    await this.page.waitForTimeout(1000);
  }

  async navigateToTab(secondaryTab: 'Claims' | 'Notices'): Promise<void> {
    await this.page.getByText(secondaryTab, { exact: true }).click();
    await this.page.waitForTimeout(1000);
    await this.waitForGridStable(this.selectors.gridRowCounter);
  }

  // ── Search ──

  async searchBatch(query: string): Promise<void> {
    const searchInput = this.page.locator(this.selectors.searchInput);
    await searchInput.waitFor({ state: 'visible', timeout: TIMEOUTS.ELEMENT });
    await searchInput.fill(query);
    await searchInput.press('Enter');
    await this.page.waitForTimeout(1000);
    await this.waitForGridStable(this.selectors.gridRowCounter);
  }

  // ── Grid Read Methods ──

  async getBatchRowCount(): Promise<number> {
    return await this.waitForGridStable(this.selectors.gridRowCounter);
  }

  async readBatchRowData(index: number): Promise<BatchRowData> {
    return {
      payerType: (await this.getText(this.selectors.payerType(index)))?.trim() ?? '',
      payerName: (await this.getText(this.selectors.payerName(index)))?.trim() ?? '',
      batchName: (await this.getText(this.selectors.batchName(index)))?.trim() ?? '',
      batchBalance: (await this.getText(this.selectors.batchBalance(index)))?.trim() ?? '',
      siaBalance: (await this.getText(this.selectors.siaBalance(index)))?.trim() ?? '',
      totalClaims: (await this.getText(this.selectors.totalClaims(index)))?.trim() ?? '',
      postDate: (await this.getText(this.selectors.postDate(index)))?.trim() ?? '',
      generatedBy: (await this.getText(this.selectors.generatedBy(index)))?.trim() ?? '',
      status: (await this.getText(this.selectors.status(index)))?.trim() ?? '',
    };
  }

  // ── Grid Search / Find ──

  async findBatchByPayerName(payerName: string): Promise<number> {
    const rowCount = await this.getBatchRowCount();
    for (let i = 0; i < rowCount; i++) {
      const text = (await this.getText(this.selectors.payerName(i)))?.trim() ?? '';
      if (text.includes(payerName)) return i;
    }
    return -1;
  }

  // ── Expand / Detail ──

  async expandBatchRow(index: number): Promise<void> {
    const imgArrow = this.page.locator(this.selectors.expandRowImg(index));
    if (await imgArrow.count() > 0) {
      await imgArrow.click();
    } else {
      await this.page.locator(this.selectors.expandRowBtn(index)).click({ force: true });
    }
    await this.page.waitForTimeout(500);
  }

  /**
   * Wait for and read patient ID from expanded detail.
   * Single search result auto-expands — call after searchBatch().
   */
  async waitForDetailAndGetPatientId(detailIndex = 0): Promise<string> {
    const detailEl = this.page.locator(this.selectors.detailPatientId(detailIndex));
    await detailEl.waitFor({ state: 'visible', timeout: 10_000 });
    const text = await detailEl.textContent();
    return text?.trim() ?? '';
  }

  /**
   * Read expanded detail row data.
   * Uses detail header as anchor to scope and avoid conflicts with batch grid selectors.
   */
  async readDetailRowData(detailIndex: number): Promise<BatchDetailRowData> {
    const detailContainer = this.page.locator(this.selectors.detailHeaderPatientChartId)
      .locator('xpath=ancestor::*[contains(@class,"row") or contains(@class,"grid")]')
      .first()
      .locator('..');

    return {
      patientId: await this.getDetailText(detailContainer, this.selectors.detailPatientId(detailIndex)),
      patientName: await this.getDetailText(detailContainer, this.selectors.detailPatientName(detailIndex)),
      payerName: await this.getDetailText(detailContainer, this.selectors.detailPayerName(detailIndex)),
      claimId: await this.getDetailText(detailContainer, this.selectors.detailClaimId(detailIndex)),
      claimBalance: await this.getDetailText(detailContainer, this.selectors.detailClaimBalance(detailIndex)),
      siaTotal: await this.getDetailText(detailContainer, this.selectors.detailSiaTotal(detailIndex)),
      claimTotal: await this.getDetailText(detailContainer, this.selectors.detailClaimTotal(detailIndex)),
    };
  }

  /**
   * Read text from a detail selector, scoped to the detail container.
   * Falls back to page-level nth() if container scoping fails.
   */
  private async getDetailText(container: ReturnType<Page['locator']>, selector: string): Promise<string> {
    const scoped = container.locator(selector);
    if (await scoped.count() > 0) {
      const text = await scoped.first().textContent();
      return text?.trim() ?? '';
    }
    // Fallback: last instance on page (detail comes after batch grid)
    const pageEl = this.page.locator(selector);
    const count = await pageEl.count();
    const text = await pageEl.nth(Math.max(0, count - 1)).textContent();
    return text?.trim() ?? '';
  }

  // ── Batch Options Modal ──

  async selectBatchRow(index: number): Promise<void> {
    await this.page.locator(this.selectors.rowCheckbox(index)).click();
    // Wait for Batch Options button to become enabled after checkbox selection
    await this.page.getByRole('button', { name: 'Batch Options' }).waitFor({ state: 'visible', timeout: TIMEOUTS.ELEMENT });
    await expect(this.page.getByRole('button', { name: 'Batch Options' })).toBeEnabled({ timeout: TIMEOUTS.ELEMENT });
  }

  /**
   * Open Batch Options modal and return available download formats.
   */
  async openBatchOptionsAndGetFormats(): Promise<string[]> {
    const batchOptionsBtn = this.page.getByRole('button', { name: 'Batch Options' });
    await batchOptionsBtn.click();

    // Wait for the modal download list to fully render with at least one item
    const downloadList = this.page.locator('ion-modal ion-list').first();
    await downloadList.locator('ion-item').first().waitFor({ state: 'visible', timeout: 5000 });

    // Modal renders both "Download Files" and "Send Electronic" sections with duplicate ion-items.
    // Scope to first ion-list (Download Files) to avoid strict mode violations.
    const formats: string[] = [];
    for (const name of ['837', 'CSV', 'UB-04']) {
      const item = downloadList.locator('ion-item').filter({ hasText: name });
      if (await item.count() > 0) formats.push(name);
    }
    return formats;
  }

  /**
   * Select batch, open Batch Options, select format, click Proceed.
   * @returns Available formats (for assertion)
   */
  async downloadBatch(rowIndex: number, format: BatchDownloadFormat): Promise<string[]> {
    await this.selectBatchRow(rowIndex);
    const availableFormats = await this.openBatchOptionsAndGetFormats();

    // Click ion-item in first ion-list (Download Files) — no force, full event dispatch needed for Ionic
    const downloadList = this.page.locator('ion-modal ion-list').first();
    await downloadList.locator('ion-item').filter({ hasText: format }).click();
    await this.page.waitForTimeout(300);

    await expect(this.page.locator('ion-modal').getByRole('button', { name: 'Proceed' }).first()).toBeEnabled({ timeout: TIMEOUTS.ELEMENT });
    await this.page.locator('ion-modal').getByRole('button', { name: 'Proceed' }).first().click({ force: true });
    await this.page.waitForTimeout(1000);

    await this.dismissDownloadDialog();

    return availableFormats;
  }
}
