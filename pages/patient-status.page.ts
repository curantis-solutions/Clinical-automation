import { Page } from '@playwright/test';
import { DateHelper } from '../utils/date-helper';

/**
 * Patient Status Page Object
 *
 * Handles the Status tab on the patient profile page.
 * Used for: discharge, admit date changes, status history verification.
 *
 * Flow:
 *   1. Navigate to Status tab via sidebar
 *   2. Click edit (pencil icon) on History section
 *   3. Change Status modal opens — select status, date, reason
 *   4. Save
 */
export class PatientStatusPage {
  readonly page: Page;

  private readonly selectors = {
    // ── Navigation ─────────────────────────────────────────────────────
    profileTab: '[data-cy="btn-nav-bar-item-profile"]',
    statusTab: 'a.tab-button:has-text("Status")',

    // ── History Section ────────────────────────────────────────────────
    historyEditBtn: '.referral-header-bar .icons ion-icon[name="create"]',
    historyRows: '.history_list .table-values',

    // ── Change Status Modal ────────────────────────────────────────────
    inputStatusSelect: '#inputStatus',
    dischargeDateCalendarBtn: '#discharge-date button.inside-click-datepicker',
    dischargeDateInput: '#discharge-date input#date-value',

    // ── Reason for Discharge (collapsible section) ─────────────────────
    reasonForDischargeToggle: '.section-label:has-text("Reason for Discharge")',
    reasonSelect: '#reason',

    // ── Modal Actions ──────────────────────────────────────────────────
    saveBtn: '#inputModalSubmit',
    cancelBtn: '#inputModalCancel',
  };

  constructor(page: Page) {
    this.page = page;
  }

  // ══════════════════════════════════════════════════════════════════════
  // Navigation
  // ══════════════════════════════════════════════════════════════════════

  /**
   * Navigate to patient profile first, then click the Status tab
   */
  async navigateToStatusTab(): Promise<void> {
    // Navigate to Profile module first (Status tab is inside Profile)
    const profileBtn = this.page.locator(this.selectors.profileTab);
    await profileBtn.waitFor({ state: 'visible', timeout: 10000 });
    await profileBtn.click();
    await this.page.waitForTimeout(3000);
    console.log('Navigated to Profile');

    // Now click the Status tab
    const statusBtn = this.page.locator(this.selectors.statusTab).first();
    await statusBtn.waitFor({ state: 'visible', timeout: 10000 });
    await statusBtn.click();
    await this.page.waitForTimeout(3000);
    console.log('Navigated to Status tab');
  }

  // ══════════════════════════════════════════════════════════════════════
  // History Section
  // ══════════════════════════════════════════════════════════════════════

  /**
   * Click the edit (pencil) icon on the History section header
   * Opens the "Change Status" modal
   */
  async clickEditHistory(): Promise<void> {
    const editBtn = this.page.locator(this.selectors.historyEditBtn).first();
    await editBtn.waitFor({ state: 'visible', timeout: 10000 });
    await editBtn.click();
    await this.page.waitForTimeout(2000);
    console.log('Opened Change Status modal');
  }

  /**
   * Get the current status from the first history row
   */
  async getCurrentStatus(): Promise<string> {
    const firstRow = this.page.locator(this.selectors.historyRows).last();
    const statusCol = firstRow.locator('ion-col').first().locator('span');
    return (await statusCol.textContent())?.trim() || '';
  }

  /**
   * Get history row data by index
   */
  async getHistoryRowData(rowIndex: number): Promise<Record<string, string>> {
    const row = this.page.locator(this.selectors.historyRows).nth(rowIndex);
    const cols = row.locator('ion-col span');
    const labels = ['Status', 'Location', 'Start Date', 'End Date', 'Modified by', 'Staff Name', 'Date/Time Modified', 'Physician'];

    const data: Record<string, string> = {};
    const count = await cols.count();
    for (let i = 0; i < Math.min(count, labels.length); i++) {
      data[labels[i]] = (await cols.nth(i).textContent())?.trim() || '';
    }
    return data;
  }

  // ══════════════════════════════════════════════════════════════════════
  // Change Status Modal
  // ══════════════════════════════════════════════════════════════════════

  /**
   * Select a status from the Input Status dropdown
   * @param status - Status value: 'DISCHARGED', 'ON_SERVICE', etc.
   */
  async selectInputStatus(status: string): Promise<void> {
    const select = this.page.locator(this.selectors.inputStatusSelect);
    await select.click();
    await this.page.waitForTimeout(1000);

    const option = this.page.locator(`ion-radio[ng-reflect-value="${status}"] button`);
    await option.click({ force: true });
    await this.page.waitForTimeout(1000);
    console.log(`  Selected status: ${status}`);
  }

  /**
   * Select discharge date using the calendar datepicker
   * @param dateStr - Date in MM/DD/YYYY format (defaults to today)
   */
  async selectDischargeDate(dateStr?: string): Promise<void> {
    const date = dateStr || DateHelper.getTodaysDate();
    const calendarBtn = this.page.locator(this.selectors.dischargeDateCalendarBtn);

    if (await calendarBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await calendarBtn.click();
      await this.page.waitForTimeout(500);
      await DateHelper.selectDateFormatted(this.page, date);
      console.log(`  Discharge date: ${date}`);
    } else {
      // Date may already be pre-filled
      const input = this.page.locator(this.selectors.dischargeDateInput);
      const currentValue = await input.inputValue().catch(() => '');
      console.log(`  Discharge date (pre-filled): ${currentValue}`);
    }
  }

  /**
   * Expand the "Reason for Discharge" section and select the first reason
   */
  async selectDischargeReason(): Promise<void> {
    // Click the caret to expand the section
    const toggle = this.page.locator(this.selectors.reasonForDischargeToggle)
      .locator('xpath=ancestor::div[contains(@class,"section-2")]')
      .locator('.icons ion-icon');

    if (await toggle.isVisible({ timeout: 3000 }).catch(() => false)) {
      await toggle.click();
      await this.page.waitForTimeout(1000);
      console.log('  Expanded Reason for Discharge section');
    }

    // Select the first reason from the dropdown
    const reasonSelect = this.page.locator(this.selectors.reasonSelect);
    if (await reasonSelect.isVisible({ timeout: 3000 }).catch(() => false)) {
      await reasonSelect.click();
      await this.page.waitForTimeout(1000);

      const firstOption = this.page.locator('ion-popover.select-popover ion-item').first();
      if (await firstOption.isVisible({ timeout: 3000 }).catch(() => false)) {
        await firstOption.click();
        await this.page.waitForTimeout(1000);
        console.log('  Selected first discharge reason');
      }
    }
  }

  /**
   * Click Save on the Change Status modal
   */
  async clickSave(): Promise<void> {
    const saveBtn = this.page.locator(this.selectors.saveBtn);

    // Wait for Save to become enabled
    for (let i = 0; i < 10; i++) {
      const disabled = await saveBtn.getAttribute('disabled');
      if (disabled === null) break;
      await this.page.waitForTimeout(1000);
    }

    await saveBtn.click({ force: true });
    await this.page.waitForTimeout(3000);
    console.log('  Saved status change');
  }

  /**
   * Click Cancel on the Change Status modal
   */
  async clickCancel(): Promise<void> {
    await this.page.locator(this.selectors.cancelBtn).click();
    await this.page.waitForTimeout(1000);
    console.log('  Cancelled status change');
  }

  // ══════════════════════════════════════════════════════════════════════
  // Discharge Flow
  // ══════════════════════════════════════════════════════════════════════

  /**
   * Full discharge flow: navigate to Status tab → edit → select Discharge →
   * set date → select reason → save
   * @param dischargeDate - Date in MM/DD/YYYY format (defaults to today)
   */
  async dischargePatient(dischargeDate?: string): Promise<void> {
    console.log('\nDischarging patient...');

    await this.navigateToStatusTab();
    await this.clickEditHistory();
    await this.selectInputStatus('DISCHARGED');
    await this.selectDischargeDate(dischargeDate);
    await this.selectDischargeReason();
    await this.clickSave();

    console.log('Patient discharged successfully');
  }
}
