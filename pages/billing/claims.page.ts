import { Page, expect } from '@playwright/test';
import { BasePage } from '../base.page';
import { TIMEOUTS } from '../../config/timeouts';
import { NoticeExpectedData, NoticeRowData, NonCoveredDetail } from '../../types/billing.types';
import { PdfHelper } from '../../utils/pdf-helper';
import { selectDateFromPicker } from '../../utils/form-helpers';

/**
 * Claims Page Object
 * Handles interactions with the Billing > Claim Management grid, tabs, and filters.
 * All selectors confirmed via MCP Playwright exploration (2026-03-26/27/30).
 */
export class ClaimsPage extends BasePage {
  private readonly selectors = {
    // === Filter Panel ===
    careTypeDropdown: '[data-cy="select-care-type"]',
    filterButton: '[data-cy="btn-apply-filters-os"]',
    clearFiltersButton: '[data-cy="btn-clear-filter-button-pressed"]',

    // === Claims Grid ===
    searchInput: '[data-cy="searchbar-search-claim-management"] input',
    gridRowCounter: '[data-cy^="label-claim-id-"]',
    claimId: (i: number) => `[data-cy="label-claim-id-${i}"]`,
    patientName: (i: number) => `[data-cy="label-patient-name-${i}"]`,
    patientChartId: (i: number) => `[data-cy="label-patient-external-id-${i}"]`,
    billTypeCell: (i: number) => `[data-cy="label-bill-type-${i}"]`,
    expandRow: (i: number) => `[data-cy="btn-show-details-${i}"]`,

    // === READY tab grid columns ===
    payerName: (i: number) => `[data-cy="label-payer-name-${i}"]`,
    serviceStartDate: (i: number) => `[data-cy="label-service-start-date-${i}"]`,
    serviceEndDate: (i: number) => `[data-cy="label-service-end-date-${i}"]`,
    daysSinceAdmit: (i: number) => `[data-cy="label-days-since-admit-${i}"]`,
    siaAmount: (i: number) => `[data-cy="label-total-sia-${i}"]`,
    claimTotalAmount: (i: number) => `[data-cy="label-billed-total-${i}"]`,
    conditionCode: (i: number) => `[data-cy="label-condition-code-${i}"]`,

    // === Checkboxes ===
    masterCheckbox: '[data-cy="checkbox-toggle-select-all"]',
    rowCheckbox: (i: number) => `[data-cy="checkbox-toggle-claim-${i}"]`,

    // === Action Buttons ===
    generateClaimButton: 'button:has-text("Generate Claim")',

    // === Document link ===
    downloadButton: (i: number) => `[data-cy="btn-download-pdf-${i}"]`,

    // === REVIEW-only columns ===
    errorCount: (i: number) => `[data-cy="label-claim-validation-dto-list-${i}"]`,

    // === Expanded Claim Detail tabs ===
    claimDetailsTab: '[data-cy="btn-label-claim-details"]',
    claimEditsLogTab: '[data-cy="btn-label-claim-edits-log"]',

    // === RLIS headers ===
    rlisServiceDateHeader: '[data-cy="label-service-date"]',
    rlisRevenueHeader: '[data-cy="label-revenue"]',
    rlisRevenueData: '[data-cy^="label-rlis-revenue-"], [data-cy^="label-revenue-code-"]',

    // === REVIEW tab errors ===
    errorMessage: (i: number) => `[data-cy="label-error-message-${i}"]`,

    // === Occurrence Code 77 / Non-Covered Details ===
    unfundedDaysIcon: (i: number) => `[data-cy="btn-show-modal-days-since-admit-${i}"]`,
    nonCoveredDetailsTab: '[data-cy="label-reason-for-nonCoveredDetails"]',
    nonCoveredReason: (i: number) => `[data-cy="label-claimUF.reason-${i}"]`,
    nonCoveredDateRange: (i: number) => `[data-cy="label-change.startEndDate-${i}"]`,
    occurrencePopover: 'div.statuspopover',
    popoverBackdrop: 'ion-popover ion-backdrop',

    // === Generate Claim Modal ===
    modalPostDateInput: 'ion-modal #date-value',
  };

  /** Field name → selector function map for generic row value reads */
  private readonly fieldSelectors: Record<string, (i: number) => string> = {
    claimId: this.selectors.claimId,
    patientName: this.selectors.patientName,
    patientChartId: this.selectors.patientChartId,
    payerName: this.selectors.payerName,
    serviceStart: this.selectors.serviceStartDate,
    serviceEnd: this.selectors.serviceEndDate,
    daysSinceAdmit: this.selectors.daysSinceAdmit,
    siaAmount: this.selectors.siaAmount,
    claimTotalAmount: this.selectors.claimTotalAmount,
    billType: this.selectors.billTypeCell,
    conditionCode: this.selectors.conditionCode,
  };

  constructor(page: Page) {
    super(page);
  }

  // ── Navigation & Filtering ──

  /**
   * Switch to the specified main tab and apply the Hospice care type filter.
   * Tab switching resets the filter — we re-apply each time.
   */
  async navigateTo(tab: 'Ready' | 'Review', secondaryTab?: 'Claims' | 'Notices' | 'R&B'): Promise<void> {
    const tabText = tab === 'Ready' ? 'READY' : 'REVIEW';
    await this.page.getByText(tabText, { exact: true }).click();
    await this.page.waitForTimeout(500);

    await this.page.locator(this.selectors.careTypeDropdown).click();
    await this.page.getByTestId('input-filtered-options-0').getByText('Hospice').click();
    await this.page.locator(this.selectors.filterButton).click();
    await this.waitForPageLoad();

    if (secondaryTab && secondaryTab !== 'Claims') {
      await this.switchSecondaryTab(secondaryTab);
    }

    await this.waitForGridStable(this.selectors.gridRowCounter);
  }

  /**
   * Switch to a secondary tab (Claims / Notices / R&B).
   */
  async switchSecondaryTab(tab: 'Claims' | 'Notices' | 'R&B'): Promise<void> {
    if (tab !== 'Claims') {
      await this.page.getByText(tab, { exact: true }).click();
      await this.page.waitForTimeout(1000);
    }
  }

  /**
   * Search within the claims grid by patient chart ID or name.
   */
  async searchByPatient(identifier: string): Promise<void> {
    const searchInput = this.page.locator(this.selectors.searchInput);
    await searchInput.waitFor({ state: 'visible', timeout: TIMEOUTS.ELEMENT });
    await searchInput.fill(identifier);
    await searchInput.press('Enter');
    await this.page.waitForTimeout(1000);
    await this.waitForGridStable(this.selectors.gridRowCounter);
  }

  // ── Grid Read Methods ──

  /**
   * Get the text value of any grid column for a given row.
   */
  async getRowFieldValue(rowIndex: number, field: string): Promise<string> {
    const selectorFn = this.fieldSelectors[field];
    if (!selectorFn) throw new Error(`Unknown claim field: "${field}". Valid: ${Object.keys(this.fieldSelectors).join(', ')}`);
    const text = await this.getText(selectorFn(rowIndex));
    return text?.trim() ?? '';
  }

  /**
   * Get the number of visible rows in the claims grid.
   */
  async getVisibleRowCount(): Promise<number> {
    return await this.waitForGridStable(this.selectors.gridRowCounter);
  }

  /**
   * Read all displayed field values from a Notice grid row.
   */
  async readNoticeRowData(rowIndex: number): Promise<NoticeRowData> {
    return {
      patientName: await this.getRowFieldValue(rowIndex, 'patientName'),
      patientChartId: await this.getRowFieldValue(rowIndex, 'patientChartId'),
      payerName: await this.getRowFieldValue(rowIndex, 'payerName'),
      serviceStart: await this.getRowFieldValue(rowIndex, 'serviceStart'),
      serviceEnd: await this.getRowFieldValue(rowIndex, 'serviceEnd'),
      daysSinceAdmit: await this.getRowFieldValue(rowIndex, 'daysSinceAdmit'),
      billType: await this.getRowFieldValue(rowIndex, 'billType'),
      siaAmount: await this.getRowFieldValue(rowIndex, 'siaAmount'),
      claimTotalAmount: await this.getRowFieldValue(rowIndex, 'claimTotalAmount'),
      conditionCode: await this.getRowFieldValue(rowIndex, 'conditionCode'),
    };
  }

  // ── Grid Search / Find Methods ──

  /**
   * Find the row index matching a given bill type.
   * @returns 0-based row index, or -1 if not found
   */
  async findRowByBillType(billType: string): Promise<number> {
    const rowCount = await this.getVisibleRowCount();
    for (let i = 0; i < rowCount; i++) {
      const cellText = await this.getRowFieldValue(i, 'billType');
      if (cellText === billType) return i;
    }
    return -1;
  }

  /**
   * Find a row matching both patient chart ID and bill type.
   * @returns 0-based row index, or -1 if not found
   */
  async findRowByPatientAndBillType(patientId: string, billType: string): Promise<number> {
    const rowCount = await this.getVisibleRowCount();
    for (let i = 0; i < rowCount; i++) {
      const chartId = await this.getRowFieldValue(i, 'patientChartId');
      const type = await this.getRowFieldValue(i, 'billType');
      if (chartId === patientId && type === billType) return i;
    }
    return -1;
  }

  // ── Grid Assertions ──

  /**
   * Assert that a specific claim bill type is visible in the grid.
   */
  async assertClaimTypeVisible(type: '811' | '812' | '813' | '814' | '81A'): Promise<void> {
    const row = await this.findRowByBillType(type);
    if (row < 0) {
      const rowCount = await this.getVisibleRowCount();
      throw new Error(`Bill type "${type}" not found in grid (${rowCount} rows visible)`);
    }
  }

  /**
   * Assert the exact number of claims visible in the grid.
   */
  async assertClaimCount(expected: number): Promise<void> {
    const actual = await this.getVisibleRowCount();
    if (actual !== expected) {
      throw new Error(`Expected ${expected} claims but found ${actual}`);
    }
  }

  /**
   * Assert that no claims are present (used after search in Review tab).
   */
  async assertNoReviewErrors(): Promise<void> {
    const rowCount = await this.getVisibleRowCount();
    if (rowCount > 0) {
      throw new Error(`Expected 0 claims in Review tab but found ${rowCount}`);
    }
  }

  // ── Notice Assertion (reads + asserts grid fields) ──

  /**
   * Assert Notice (81A) grid field values against expected data.
   * Composite assert-and-return: reads the row, compares each field, throws on mismatch, returns actual data.
   * Does NOT verify UB04 link or RLIS — call those separately.
   */
  async assertNoticeGridFields(rowIndex: number, expected: NoticeExpectedData): Promise<NoticeRowData> {
    const actual = await this.readNoticeRowData(rowIndex);

    const errors: string[] = [];
    const check = (field: string, actual: string, expected: string, partial = false) => {
      if (partial ? !actual.includes(expected) : actual !== expected) {
        errors.push(`${field}: expected "${expected}", got "${actual}"`);
      }
    };

    check('Patient name', actual.patientName, expected.patientName, true);
    check('Payer name', actual.payerName, expected.payerName, true);
    check('Chart ID', actual.patientChartId, expected.patientChartId);
    check('Service start', actual.serviceStart, expected.serviceStart);
    check('Service end', actual.serviceEnd, expected.serviceEnd);
    check('Days since admit', actual.daysSinceAdmit, String(expected.daysSinceAdmit));
    check('Bill type', actual.billType, expected.billType);
    check('SIA amount', actual.siaAmount, expected.siaAmount);
    check('Claim total', actual.claimTotalAmount, expected.claimTotalAmount);
    check('Condition code', actual.conditionCode, expected.conditionCode);

    if (errors.length > 0) {
      throw new Error(`Notice grid field mismatches:\n  ${errors.join('\n  ')}`);
    }

    return actual;
  }

  /**
   * Verify UB04 link visible + RLIS absent for a Notice row.
   * Call after assertNoticeGridFields if you want the full check.
   */
  async assertNoticeDocAndRlis(rowIndex: number): Promise<void> {
    await this.assertUb04LinkVisible(rowIndex);
    await this.expandClaimRow(rowIndex);
    await this.switchClaimDetailTab('Claim Details');
    await this.assertRlisDataAbsent();
  }

  /**
   * Composite assert-and-return: verifies all grid fields + UB04 link + RLIS absence, returns actual data.
   */
  async assertNoticeDetails(rowIndex: number, expected: NoticeExpectedData): Promise<NoticeRowData> {
    const actual = await this.assertNoticeGridFields(rowIndex, expected);
    await this.assertNoticeDocAndRlis(rowIndex);
    return actual;
  }

  // ── Document Link Assertions ──

  /**
   * Assert UB04 document link is visible for a row (Notices).
   */
  async assertUb04LinkVisible(rowIndex: number): Promise<void> {
    await this.assertDocumentLinkType(rowIndex, 'UB04');
  }

  /**
   * Assert PDF document link is visible for a row (regular Claims).
   */
  async assertPdfLinkVisible(rowIndex: number): Promise<void> {
    await this.assertDocumentLinkType(rowIndex, 'PDF');
  }

  private async assertDocumentLinkType(rowIndex: number, expectedType: 'UB04' | 'PDF'): Promise<void> {
    const downloadBtn = this.page.locator(this.selectors.downloadButton(rowIndex));
    await downloadBtn.waitFor({ state: 'visible', timeout: TIMEOUTS.ELEMENT });
    const container = downloadBtn.locator('xpath=ancestor::div[contains(@class,"action-icons")]');
    const text = await container.textContent();
    if (!text?.includes(expectedType)) {
      throw new Error(`Expected ${expectedType} link at row ${rowIndex}, but found: "${text?.trim()}"`);
    }
  }

  // ── Expanded Claim Detail ──

  async expandClaimRow(rowIndex: number): Promise<void> {
    await this.page.locator(this.selectors.expandRow(rowIndex)).click();
    await this.page.waitForTimeout(500);
  }

  async switchClaimDetailTab(tab: 'Claim Details' | 'Claim Edits Log' | 'Claim Notes'): Promise<void> {
    if (tab === 'Claim Details') {
      await this.page.locator(this.selectors.claimDetailsTab).first().click();
    } else if (tab === 'Claim Edits Log') {
      await this.page.locator(this.selectors.claimEditsLogTab).click();
    } else {
      await this.page.getByText('Claim Notes', { exact: true }).click();
    }
    await this.page.waitForTimeout(500);
  }

  async getClaimErrorCount(rowIndex: number): Promise<number> {
    const text = await this.getText(this.selectors.errorCount(rowIndex));
    return text ? parseInt(text.trim(), 10) : 0;
  }

  async getErrorMessages(): Promise<string[]> {
    const messages: string[] = [];
    let i = 0;
    while (true) {
      const locator = this.page.locator(this.selectors.errorMessage(i));
      if (await locator.count() === 0) break;
      const text = await locator.textContent();
      if (text) messages.push(text.trim());
      i++;
    }
    return messages;
  }

  // ── RLIS Assertions ──

  async assertRlisDataAbsent(): Promise<void> {
    const headersVisible = await this.page.locator(this.selectors.rlisServiceDateHeader).count();
    if (headersVisible === 0) {
      throw new Error('Claim Details tab not active (no RLIS headers found)');
    }
    const hasRevenue = await this.page.locator(this.selectors.rlisRevenueHeader).count();
    if (hasRevenue > 0) {
      throw new Error('Expected no RLIS data for Notice, but Revenue column found');
    }
  }

  async assertRlisDataPresent(): Promise<void> {
    const hasRevenue = await this.page.locator(this.selectors.rlisRevenueHeader).count();
    if (hasRevenue === 0) {
      throw new Error('Expected RLIS data for Claim, but Revenue column not found');
    }
  }

  // ── Polling ──

  async waitForReprocessingComplete(patientId: string, timeout = 120_000): Promise<void> {
    await expect(async () => {
      await this.navigateTo('Review');
      await this.searchByPatient(patientId);
      await this.assertNoReviewErrors();
    }).toPass({ timeout, intervals: [5_000] });
  }

  // ── Checkbox & Submission ──

  async selectClaimRow(rowIndex: number): Promise<void> {
    await this.page.locator(this.selectors.rowCheckbox(rowIndex)).click();
    await this.page.waitForTimeout(300);
  }

  async clickGenerateClaim(): Promise<void> {
    const btn = this.page.locator(this.selectors.generateClaimButton);
    await btn.waitFor({ state: 'visible', timeout: TIMEOUTS.ELEMENT });
    await btn.click();
    await this.waitForPageLoad();
  }

  /**
   * Complete the "Batch to be submitted" modal after clicking Generate Claim.
   * Opens datepicker, selects the given date (defaults to today), clicks Submit Batch, closes success dialog.
   * @param postDate - MM/DD/YYYY format. Defaults to today's date.
   */
  async completeGenerateClaimModal(postDate?: string): Promise<void> {
    const postDateInput = this.page.locator(this.selectors.modalPostDateInput);
    await postDateInput.waitFor({ state: 'visible', timeout: 10_000 });
    await postDateInput.click();
    await this.page.waitForTimeout(500);

    if (!postDate) {
      const today = new Date();
      postDate = `${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}/${today.getFullYear()}`;
    }
    console.log(`Selecting date: ${postDate}`);
    await selectDateFromPicker(this.page, postDate);
    await this.page.waitForTimeout(500);

    const submitBtn = this.page.getByRole('button', { name: 'Submit Batch' });
    await submitBtn.click();
    await this.page.waitForTimeout(2000);

    const closeBtn = this.page.getByRole('button', { name: 'Close', exact: true });
    await closeBtn.waitFor({ state: 'visible', timeout: 15_000 });
    await closeBtn.click();
    await this.page.waitForTimeout(1000);
  }

  // ── PDF Download ──

  async downloadClaimPdf(rowIndex: number): Promise<string> {
    const text = await PdfHelper.downloadAndExtractText(
      this.page,
      this.selectors.downloadButton(rowIndex)
    );
    await this.dismissDownloadDialog();
    return text;
  }

  // ── Occurrence Code 77 / Non-Covered Details ──

  /**
   * Check if the "Unfunded Days" info icon is visible for a claim row.
   * This icon indicates occurrence code 77 (non-covered days).
   */
  async isUnfundedDaysIconVisible(rowIndex: number): Promise<boolean> {
    return await this.page.locator(this.selectors.unfundedDaysIcon(rowIndex)).isVisible();
  }

  /**
   * Click the "Unfunded Days" info icon and read the occurrence popover text.
   * Dismisses the popover after reading. Returns the popover message.
   */
  async getOccurrencePopoverText(rowIndex: number): Promise<string> {
    await this.page.locator(this.selectors.unfundedDaysIcon(rowIndex)).click();
    const popover = this.page.locator(this.selectors.occurrencePopover);
    await popover.waitFor({ state: 'visible', timeout: 5_000 });
    const text = (await popover.textContent()) || '';

    // Dismiss popover — press Escape then wait for it to disappear
    await this.page.keyboard.press('Escape');
    await this.page.waitForTimeout(500);

    // If popover is still visible, force-click the backdrop as fallback
    const stillVisible = await this.page.locator('ion-popover').isVisible();
    if (stillVisible) {
      await this.page.locator(this.selectors.popoverBackdrop).click({ force: true });
      await this.page.waitForTimeout(500);
    }

    return text.trim();
  }

  /**
   * Read Non-Covered Details from the expanded claim detail tab.
   * The claim row must already be expanded. Switches to the Non-Covered Details tab,
   * reads the reason and combined date range, and parses into separate start/end dates.
   */
  async readNonCoveredDetails(rowIndex: number): Promise<NonCoveredDetail> {
    await this.page.locator(this.selectors.nonCoveredDetailsTab).click();
    await this.page.waitForTimeout(500);

    const reason = (await this.page.locator(this.selectors.nonCoveredReason(rowIndex)).textContent()) || '';
    const dateRange = (await this.page.locator(this.selectors.nonCoveredDateRange(rowIndex)).textContent()) || '';

    // Parse combined "MM/DD/YYYY - MM/DD/YYYY" into separate dates
    const parts = dateRange.trim().split(' - ');
    return {
      reason: reason.trim(),
      startDate: parts[0]?.trim() || '',
      endDate: parts[1]?.trim() || '',
    };
  }
}
