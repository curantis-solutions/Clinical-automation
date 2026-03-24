import { Page } from '@playwright/test';
import { BasePage } from '../pages/base.page';
import { RelatedDiagnosisType, PrincipleDiagnosisOption } from '../types/diagnosis.types';

/**
 * Diagnosis Page Object — Ionic 8 (qa2)
 *
 * VERIFIED via MCP Playwright on qa2 (2026-03-05).
 *
 * KEY CHANGES from Ionic 4 (qa1):
 * - Tab navigation: ion-tab-button[data-cy="tab-diagnosis"] (was role="tab":has-text("Diagnosis"))
 * - Edit icon: ion-icon[data-cy="btn-edit-diagnosis"] (same data-cy, tag changed)
 * - Edit option: button with "Edit" text in popover (was btn-edit-option)
 * - Primary input: ng-select[data-cy="input-primary-diagnosis"] (was [data-cy] input nested)
 *   → Now use ng-select directly, not nested input
 * - Secondary input: ng-select[data-cy="secondary-diagnosis"] (same data-cy)
 * - Date pickers: cur-date-picker[data-cy="datetime-start-date-primary"] etc. (new)
 * - Form: form[data-cy="form-diagnosis"] (new)
 * - Save/Cancel: ion-button[data-cy="btn-save"], ion-button[data-cy="btn-cancel"]
 *   (was #inputModalSubmit, #inputModalCancel)
 * - Add related: a[data-cy="btn-add-related-diagnosis"] (same)
 * - Section container: ion-row[data-cy="section-diagnosis"] (new)
 * - Diagnosis content: div[data-cy="content-diagnosis"] (new)
 * - Active panel: div[data-cy="panel-diagnosis-active"] (new)
 */
export class DiagnosisPage extends BasePage {
  private readonly selectors = {
    // Navigation
    diagnosisTab: '[data-cy="tab-diagnosis"]',

    // List view
    diagnosisSection: '[data-cy="section-diagnosis"]',
    diagnosisContent: '[data-cy="content-diagnosis"]',
    diagnosisPanel: '[data-cy="panel-diagnosis-active"]',
    addDiagnosisButton: '[data-cy="btn-add-diagnosis"]',
    editDiagnosisIcon: '[data-cy="btn-edit-diagnosis"]',

    // Edit popover options (ion-item, not button)
    editOptionButton: '[data-cy="btn-edit-option"]',
    historyOptionButton: 'button:has-text("History")',

    // Form
    form: '[data-cy="form-diagnosis"]',
    primaryDiagnosisSelect: '[data-cy="input-primary-diagnosis"]',
    primaryDiagnosisInput: '[data-cy="input-primary-diagnosis"] input',
    secondaryDiagnosisSelect: '[data-cy="secondary-diagnosis"]',
    secondaryDiagnosisInput: '[data-cy="secondary-diagnosis"] input',

    // Date pickers (NEW in Ionic 8)
    startDatePrimary: '[data-cy="datetime-start-date-primary"]',
    endDatePrimary: '[data-cy="datetime-end-date-primary"]',
    startDateSecondary: '[data-cy="datetime-start-date-secondary"]',
    endDateSecondary: '[data-cy="datetime-end-date-secondary"]',

    // Related/Unrelated (indexed, 0-based) — verify these when form has related entries
    relatedRadio: (i: number) => `[data-cy="radio-related-diagnosis-${i}"]`,
    unrelatedRadio: (i: number) => `[data-cy="radio-unrelated-diagnosis-${i}"]`,
    relatedDiagnosisInput: (i: number) => `[data-cy="input-related-diagnosis-input-${i}"] input`,
    removeRelatedDiagnosis: (i: number) => `[data-cy="btn-remove-related-diagnosis-${i}"]`,
    addRelatedDiagnosisLink: '[data-cy="btn-add-related-diagnosis"]',

    // Dropdown results (ng-select pattern)
    dropdownContainer: 'ng-dropdown-panel',
    dropdownOptions: 'ng-dropdown-panel .ng-option',

    // Form actions — CHANGED from #inputModalSubmit/#inputModalCancel
    saveButton: '[data-cy="btn-save"]',
    cancelButton: '[data-cy="btn-cancel"]',

    // Principle Diagnosis Options
    principleDiagnosisRadio: (opt: string) => `[data-cy="radio-principleDiagnosisOptions-${opt}"]`,

    // Display values
    primaryDiagnosisCode: '[data-cy="text-diagnosis-primary-code"]',
    primaryStartDate: '[data-cy="text-diagnosis-primary-start-date"]',
    primaryEndDate: '[data-cy="text-diagnosis-primary-end-date"]',
    primaryPhysician: '[data-cy="text-diagnosis-primary-physician"]',
  };

  constructor(page: Page) {
    super(page);
  }

  // Navigation
  async navigateToDiagnosisTab(): Promise<void> {
    const tab = this.page.locator(this.selectors.diagnosisTab).locator('visible=true');
    await tab.scrollIntoViewIfNeeded();
    await tab.click();
    await this.page.waitForTimeout(1500);
  }

  // List View Actions
  async clickAddDiagnosis(): Promise<void> {
    await this.page.locator(this.selectors.addDiagnosisButton).click();
    await this.page.waitForTimeout(1000);
  }

  async clickEditDiagnosis(): Promise<void> {
    await this.page.locator(this.selectors.editDiagnosisIcon).click();
    await this.page.waitForTimeout(500);
    await this.page.locator(this.selectors.editOptionButton).click();
    await this.page.waitForTimeout(1000);
  }

  // Dropdown Helpers
  async getDropdownResultCount(): Promise<number> {
    try {
      await this.page.locator(this.selectors.dropdownOptions).first().waitFor({ state: 'visible', timeout: 10000 });
      return await this.page.locator(this.selectors.dropdownOptions).count();
    } catch {
      return 0;
    }
  }

  // Search & Select (ng-select type-ahead pattern)
  async searchAndSelectDiagnosis(
    selectSelector: string,
    searchText: string,
    optionIndex: number = 0
  ): Promise<string> {
    const ngSelect = this.page.locator(selectSelector);
    await ngSelect.click();
    await this.page.waitForTimeout(500);
    const input = ngSelect.locator('input');
    await input.fill(searchText);
    await this.page.waitForTimeout(3000); // wait for API results

    const options = this.page.locator('ng-dropdown-panel .ng-option');
    await options.first().waitFor({ state: 'visible', timeout: 10000 });
    const count = await options.count();
    if (count === 0) throw new Error(`No ICD-10 results for: "${searchText}"`);
    if (optionIndex >= count) throw new Error(`Option index ${optionIndex} exceeds results (${count})`);

    const option = options.nth(optionIndex);
    const selectedText = (await option.textContent())?.trim() || '';
    await option.click();
    await this.page.waitForTimeout(1000);
    return selectedText;
  }

  async fillPrimaryDiagnosis(searchText: string, optionIndex: number = 0): Promise<string> {
    return await this.searchAndSelectDiagnosis(this.selectors.primaryDiagnosisSelect, searchText, optionIndex);
  }

  async fillSecondaryDiagnosis(searchText: string, optionIndex: number = 0): Promise<string> {
    return await this.searchAndSelectDiagnosis(this.selectors.secondaryDiagnosisSelect, searchText, optionIndex);
  }

  // Related/Unrelated Diagnoses
  async addRelatedDiagnosis(
    offset: number,
    type: RelatedDiagnosisType,
    searchText: string,
    optionIndex: number = 0
  ): Promise<string> {
    const existingCount = await this.page.locator('[data-cy^="btn-remove-related-diagnosis-"]').count();
    await this.page.locator(this.selectors.addRelatedDiagnosisLink).click();
    await this.page.waitForTimeout(1000);

    const actualIndex = existingCount;
    if (type === 'related') {
      await this.page.locator(this.selectors.relatedRadio(actualIndex)).click({ force: true });
    } else {
      await this.page.locator(this.selectors.unrelatedRadio(actualIndex)).click({ force: true });
    }
    await this.page.waitForTimeout(500);

    const inputSelector = this.selectors.relatedDiagnosisInput(actualIndex);
    const input = this.page.locator(inputSelector);
    await input.waitFor({ state: 'visible', timeout: 10000 });
    await input.focus();
    await input.pressSequentially(searchText, { delay: 150 });
    await this.page.waitForTimeout(3000);

    const options = this.page.locator(this.selectors.dropdownOptions);
    await options.last().waitFor({ state: 'visible', timeout: 10000 });
    const option = options.last();
    const selectedText = (await option.textContent())?.trim() || '';
    await option.click();
    await this.page.waitForTimeout(1000);
    return selectedText;
  }

  // Principle Diagnosis
  async isPrincipleDiagnosisVisible(): Promise<boolean> {
    return await this.isElementVisible(
      this.selectors.principleDiagnosisRadio('cancer')
    );
  }

  async selectPrincipleDiagnosisOption(option: PrincipleDiagnosisOption): Promise<void> {
    await this.page.locator(this.selectors.principleDiagnosisRadio(option)).click();
    await this.page.waitForTimeout(500);
  }

  // Form Actions — CHANGED selectors
  async clickSave(): Promise<void> {
    await this.page.locator(this.selectors.saveButton).click({ force: true });
    await this.page.waitForTimeout(2000);
  }

  async clickCancel(): Promise<void> {
    await this.page.locator(this.selectors.cancelButton).click();
    await this.page.waitForTimeout(1000);
  }

  async isSaveButtonEnabled(): Promise<boolean> {
    return await this.page.locator(this.selectors.saveButton).isEnabled();
  }
}
