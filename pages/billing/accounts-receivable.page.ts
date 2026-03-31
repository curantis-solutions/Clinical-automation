import { Page } from '@playwright/test';
import { BasePage } from '../base.page';
import { TIMEOUTS } from '../../config/timeouts';
import { ARRowData, ARDownloadFormat } from '../../types/billing.types';

/**
 * Accounts Receivable Page Object
 * Handles interactions with Billing > Payment Management > Accounts Receivable grid.
 * All selectors confirmed via MCP Playwright exploration (2026-03-30).
 */
export class AccountsReceivablePage extends BasePage {
  private readonly selectors = {
    // === Navigation ===
    sidebarPaymentManagement: '[data-cy="btn-nav-payment-management"]',

    // === Search ===
    searchInput: '[data-cy="input-search"] input',

    // === Grid (0-indexed, uses "-col-{i}" suffix for most columns) ===
    gridRowCounter: '[data-cy^="label-claim-id-col-"]',
    patientChartId: (i: number) => `[data-cy="label-patient-id-${i}"]`,
    patientName: (i: number) => `[data-cy="label-patient-name-${i}"]`,
    payerName: (i: number) => `[data-cy="label-payer-name-${i}"]`,
    claimId: (i: number) => `[data-cy="label-claim-id-col-${i}"]`,
    serviceStart: (i: number) => `[data-cy="label-service-start-col-${i}"]`,
    serviceEnd: (i: number) => `[data-cy="label-service-end-col-${i}"]`,
    claimStatus: (i: number) => `[data-cy="label-claim-status-col-${i}"]`,
    billedAmount: (i: number) => `[data-cy="label-billed-amount-col-${i}"]`,
    payments: (i: number) => `[data-cy="label-total-payment-col-${i}"]`,
    recoupments: (i: number) => `[data-cy="label-total-recoupment-col-${i}"]`,
    adjustments: (i: number) => `[data-cy="label-total-adjustment-col-${i}"]`,
    claimBalance: (i: number) => `[data-cy="label-balance-col-${i}"]`,
    postDate: (i: number) => `[data-cy="label-post-date-col-${i}"]`,
    downloadClaim: (i: number) => `[data-cy="btn-download-claim-col-${i}"]`,
  };

  /** Field name → selector function map (consistent with ClaimsPage.getRowFieldValue) */
  private readonly fieldSelectors: Record<string, (i: number) => string> = {
    patientChartId: this.selectors.patientChartId,
    patientName: this.selectors.patientName,
    payerName: this.selectors.payerName,
    claimId: this.selectors.claimId,
    serviceStart: this.selectors.serviceStart,
    serviceEnd: this.selectors.serviceEnd,
    status: this.selectors.claimStatus,
    billedAmount: this.selectors.billedAmount,
    payments: this.selectors.payments,
    recoupments: this.selectors.recoupments,
    adjustments: this.selectors.adjustments,
    claimBalance: this.selectors.claimBalance,
    postDate: this.selectors.postDate,
  };

  constructor(page: Page) {
    super(page);
  }

  // ── Navigation ──

  async clickSidebarNav(): Promise<void> {
    await this.page.locator(this.selectors.sidebarPaymentManagement).click();
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(500);
  }

  async navigateToTab(secondaryTab: 'Claims' | 'Notices'): Promise<void> {
    await this.page.getByText(secondaryTab, { exact: true }).click();
    await this.page.waitForTimeout(1000);
    await this.waitForGridStable(this.selectors.gridRowCounter);
  }

  // ── Search ──

  async searchByPatient(identifier: string): Promise<void> {
    const searchInput = this.page.locator(this.selectors.searchInput);
    await searchInput.waitFor({ state: 'visible', timeout: TIMEOUTS.ELEMENT });
    await searchInput.fill(identifier);
    await searchInput.press('Enter');
    await this.page.waitForTimeout(1000);
    await this.waitForGridStable(this.selectors.gridRowCounter);
  }

  // ── Grid Read Methods (naming consistent with ClaimsPage) ──

  async getVisibleRowCount(): Promise<number> {
    return await this.waitForGridStable(this.selectors.gridRowCounter);
  }

  async getRowFieldValue(rowIndex: number, field: string): Promise<string> {
    const selectorFn = this.fieldSelectors[field];
    if (!selectorFn) throw new Error(`Unknown AR field: "${field}". Valid: ${Object.keys(this.fieldSelectors).join(', ')}`);
    const text = await this.getText(selectorFn(rowIndex));
    return text?.trim() ?? '';
  }

  async readRowData(rowIndex: number): Promise<ARRowData> {
    return {
      patientChartId: await this.getRowFieldValue(rowIndex, 'patientChartId'),
      patientName: await this.getRowFieldValue(rowIndex, 'patientName'),
      payerName: await this.getRowFieldValue(rowIndex, 'payerName'),
      claimId: await this.getRowFieldValue(rowIndex, 'claimId'),
      serviceStart: await this.getRowFieldValue(rowIndex, 'serviceStart'),
      serviceEnd: await this.getRowFieldValue(rowIndex, 'serviceEnd'),
      status: await this.getRowFieldValue(rowIndex, 'status'),
      billedAmount: await this.getRowFieldValue(rowIndex, 'billedAmount'),
      payments: await this.getRowFieldValue(rowIndex, 'payments'),
      recoupments: await this.getRowFieldValue(rowIndex, 'recoupments'),
      adjustments: await this.getRowFieldValue(rowIndex, 'adjustments'),
      claimBalance: await this.getRowFieldValue(rowIndex, 'claimBalance'),
      postDate: await this.getRowFieldValue(rowIndex, 'postDate'),
    };
  }

  // ── Grid Search / Find ──

  async findRowByPatientId(patientId: string): Promise<number> {
    const rowCount = await this.getVisibleRowCount();
    for (let i = 0; i < rowCount; i++) {
      const text = await this.getRowFieldValue(i, 'patientChartId');
      if (text === patientId) return i;
    }
    return -1;
  }

  // ── Assertions ──

  async assertRowCount(expected: number): Promise<void> {
    const actual = await this.getVisibleRowCount();
    if (actual !== expected) {
      throw new Error(`Expected ${expected} AR rows but found ${actual}`);
    }
  }

  // ── Download Claim Modal ──

  async clickDownloadClaim(rowIndex: number): Promise<void> {
    await this.page.locator(this.selectors.downloadClaim(rowIndex)).click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Open Download Claim modal, select payer, return available format options.
   */
  async openDownloadClaimAndGetFormats(rowIndex: number, payerName: string): Promise<string[]> {
    await this.clickDownloadClaim(rowIndex);

    // Click the ion-item containing the payer (clicking label is intercepted by ion-radio)
    const modal = this.page.locator('ion-modal');
    const payerItem = modal.locator('ion-item').filter({ hasText: payerName });
    await payerItem.waitFor({ state: 'visible', timeout: TIMEOUTS.ELEMENT });
    await payerItem.click({ force: true });
    await this.page.waitForTimeout(500);

    // ion-radio elements don't have aria labels — detect formats by visible text in the modal
    const formats: string[] = [];
    for (const name of ['UB-04', '837', 'CSV']) {
      const label = modal.getByText(name, { exact: true });
      if (await label.count() > 0) formats.push(name);
    }
    return formats;
  }

  /**
   * Open Download Claim, select payer + format, click Proceed.
   * @returns Available formats (for assertion)
   */
  async downloadClaimAs(rowIndex: number, payerName: string, format: ARDownloadFormat): Promise<string[]> {
    const availableFormats = await this.openDownloadClaimAndGetFormats(rowIndex, payerName);

    // Click the ion-item containing the format text (force bypasses ion-radio click overlay)
    const modal = this.page.locator('ion-modal');
    await modal.locator('ion-item').filter({ hasText: format }).click({ force: true });
    await this.page.waitForTimeout(300);

    await this.page.getByRole('button', { name: 'Proceed' }).click();
    await this.page.waitForTimeout(1000);

    return availableFormats;
  }
}
