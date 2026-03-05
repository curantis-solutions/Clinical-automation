import { Page } from '@playwright/test';
import { BasePage } from './base.page';
import { RelatedDiagnosisType, PrincipleDiagnosisOption } from '../types/diagnosis.types';

/**
 * Diagnosis Page Object
 * Handles the Diagnosis tab — add/edit diagnosis form with ICD-10 search-select inputs.
 *
 * VERIFIED selectors via MCP Playwright inspection (2026-03-04).
 *
 * Search pattern: Type slowly → dropdown with ICD-10 results → click to select.
 * Dropdown results appear as clickable items inside a container after the input.
 */
export class DiagnosisPage extends BasePage {
  private readonly selectors = {
    // ── Navigation ─────────────────────────────────────────────────────────
    diagnosisTab: '[role="tab"]:has-text("Diagnosis")',

    // ── List view ──────────────────────────────────────────────────────────
    diagnosisPanel: '[role="tabpanel"]',
    addDiagnosisButton: '[data-cy="btn-add-diagnosis"]',
    editDiagnosisIcon: '[data-cy="btn-edit-diagnosis"]',
    editOptionButton: '[data-cy="btn-edit-option"]',
    diagnosisDetails: '[role="tabpanel"] .diagnosis-details, [role="tabpanel"] .diagnosisData',

    // ── Form — Primary & Secondary ─────────────────────────────────────────
    primaryDiagnosisInput: '[data-cy="input-primary-diagnosis"] input',
    secondaryDiagnosisInput: '[data-cy="secondary-diagnosis"] input',

    // ── Form — Related/Unrelated (indexed, 0-based) ────────────────────────
    relatedRadio: (i: number) => `[data-cy="radio-related-diagnosis-${i}"]`,
    unrelatedRadio: (i: number) => `[data-cy="radio-unrelated-diagnosis-${i}"]`,
    relatedDiagnosisInput: (i: number) => `[data-cy="input-related-diagnosis-input-${i}"] input`,
    removeRelatedDiagnosis: (i: number) => `[data-cy="btn-remove-related-diagnosis-${i}"]`,
    addRelatedDiagnosisLink: '[data-cy="btn-add-related-diagnosis"]',

    // ── Dropdown results (shared across all diagnosis inputs) ──────────────
    // Container has a close icon div + .searchOptionName items as siblings
    dropdownContainer: '.searchOptionsContainer',
    dropdownOptions: '.searchOptionsContainer .searchOptionName',

    // ── ICD code toggle ────────────────────────────────────────────────────
    icdCodeToggle: '[data-cy="btn-hide-icd-code"]',

    // ── Form actions ───────────────────────────────────────────────────────
    saveButton: '#inputModalSubmit',
    cancelButton: '#inputModalCancel',

    // ── Principle Diagnosis Options (contextual, appears after save) ───────
    principleDiagnosisRadio: (opt: string) => `[data-cy="radio-principleDiagnosisOptions-${opt}"]`,
  };

  constructor(page: Page) {
    super(page);
  }

  // ---------------------------------------------------------------------------
  // Navigation
  // ---------------------------------------------------------------------------

  async navigateToDiagnosisTab(): Promise<void> {
    const tab = this.page.locator(this.selectors.diagnosisTab);
    await tab.scrollIntoViewIfNeeded();
    await tab.click();
    await this.page.waitForTimeout(1500);
    console.log('Navigated to Diagnosis tab');
  }

  // ---------------------------------------------------------------------------
  // List View Actions
  // ---------------------------------------------------------------------------

  async clickAddDiagnosis(): Promise<void> {
    await this.page.locator(this.selectors.addDiagnosisButton).click();
    await this.page.waitForTimeout(1000);
    console.log('Clicked Add Diagnosis button');
  }

  async clickEditDiagnosis(): Promise<void> {
    await this.page.locator(this.selectors.editDiagnosisIcon).click();
    await this.page.waitForTimeout(500);
    await this.page.locator(this.selectors.editOptionButton).click();
    await this.page.waitForTimeout(1000);
    console.log('Clicked Edit Diagnosis option');
  }

  async getDiagnosisDisplayText(): Promise<string | null> {
    try {
      const el = this.page.locator(this.selectors.diagnosisDetails);
      if (await el.isVisible({ timeout: 3000 })) {
        const text = await el.textContent({ timeout: 5000 });
        return text?.trim() || null;
      }
      return null;
    } catch {
      return null;
    }
  }

  // ---------------------------------------------------------------------------
  // Dropdown Helpers
  // ---------------------------------------------------------------------------

  async isDropdownVisible(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.dropdownContainer);
  }

  async getDropdownResultCount(): Promise<number> {
    try {
      await this.page.waitForSelector(this.selectors.dropdownOptions, { timeout: 10000 });
      return await this.page.locator(this.selectors.dropdownOptions).count();
    } catch {
      return 0;
    }
  }

  // ---------------------------------------------------------------------------
  // Search & Select (generic for any diagnosis input)
  // ---------------------------------------------------------------------------

  /**
   * Type slowly into a diagnosis input, wait for dropdown results, and select by index.
   * @returns The text of the selected option for verification.
   */
  async searchAndSelectDiagnosis(
    inputSelector: string,
    searchText: string,
    optionIndex: number = 0
  ): Promise<string> {
    const input = this.page.locator(inputSelector);
    await input.waitFor({ state: 'visible', timeout: 10000 });
    await input.click();
    // Only clear if input has existing content (avoid triggering events on empty fields)
    const currentValue = await input.inputValue();
    if (currentValue) {
      await input.clear();
      await this.page.waitForTimeout(500);
    }
    await input.pressSequentially(searchText, { delay: 150 });
    await this.page.waitForTimeout(3000);

    // Wait for dropdown results
    const resultCount = await this.getDropdownResultCount();
    if (resultCount === 0) {
      console.warn(`No ICD-10 results found for: "${searchText}"`);
      throw new Error(`No ICD-10 results found for: "${searchText}"`);
    }

    if (optionIndex >= resultCount) {
      throw new Error(
        `Option index ${optionIndex} exceeds available results (${resultCount}) for: "${searchText}"`
      );
    }

    // Click the option (use .nth() since container has a close icon div before the options)
    const option = this.page.locator(this.selectors.dropdownOptions).nth(optionIndex);
    const selectedText = (await option.textContent())?.trim() || '';
    await option.click();
    await this.page.waitForTimeout(1000);

    console.log(`Selected diagnosis: "${selectedText}" for search "${searchText}"`);
    return selectedText;
  }

  // ---------------------------------------------------------------------------
  // Primary & Secondary Diagnosis
  // ---------------------------------------------------------------------------

  async fillPrimaryDiagnosis(searchText: string, optionIndex: number = 0): Promise<string> {
    return await this.searchAndSelectDiagnosis(
      this.selectors.primaryDiagnosisInput,
      searchText,
      optionIndex
    );
  }

  async fillSecondaryDiagnosis(searchText: string, optionIndex: number = 0): Promise<string> {
    return await this.searchAndSelectDiagnosis(
      this.selectors.secondaryDiagnosisInput,
      searchText,
      optionIndex
    );
  }

  // ---------------------------------------------------------------------------
  // Related / Unrelated Diagnoses
  // ---------------------------------------------------------------------------

  /**
   * Count existing related/unrelated diagnosis rows in the edit form.
   * Existing rows are disabled; new ones are appended after them.
   */
  async getExistingRelatedCount(): Promise<number> {
    // Count all remove icons — each row (existing or new) has one
    const removeIcons = this.page.locator('[data-cy^="btn-remove-related-diagnosis-"]');
    return await removeIcons.count();
  }

  /**
   * Add a related/unrelated diagnosis entry.
   * Automatically determines the correct index based on existing entries.
   * @param offset - 0-based offset within the NEW entries being added in this edit session
   */
  async addRelatedDiagnosis(
    offset: number,
    type: RelatedDiagnosisType,
    searchText: string,
    optionIndex: number = 0
  ): Promise<string> {
    // Count existing rows to calculate the actual DOM index
    const existingCount = await this.getExistingRelatedCount();
    console.log(`Existing related diagnosis rows: ${existingCount}`);

    // Click "Add Related/Unrelated" link to add a new row
    await this.page.locator(this.selectors.addRelatedDiagnosisLink).click();
    await this.page.waitForTimeout(1000);

    // The new row index = existingCount (0-based)
    const actualIndex = existingCount;
    console.log(`New related diagnosis will use index: ${actualIndex}`);

    // Select Related or Unrelated radio (force click — div.item-inner intercepts)
    if (type === 'related') {
      await this.page.locator(this.selectors.relatedRadio(actualIndex)).click({ force: true });
    } else {
      await this.page.locator(this.selectors.unrelatedRadio(actualIndex)).click({ force: true });
    }
    await this.page.waitForTimeout(500);

    // Type into the related diagnosis input and select from dropdown
    const inputSelector = this.selectors.relatedDiagnosisInput(actualIndex);
    const input = this.page.locator(inputSelector);
    await input.waitFor({ state: 'visible', timeout: 10000 });
    await input.focus();
    await input.pressSequentially(searchText, { delay: 150 });
    await this.page.waitForTimeout(3000);

    // Wait for and click the dropdown result
    // Use the last visible .searchOptionName (the new row's dropdown, not the disabled existing one)
    const options = this.page.locator(this.selectors.dropdownOptions);
    await options.last().waitFor({ state: 'visible', timeout: 10000 });

    const resultCount = await options.count();
    if (resultCount === 0) {
      throw new Error(`No ICD-10 results found for related diagnosis: "${searchText}"`);
    }

    // Click the last matching option (from the active/new row's dropdown)
    const option = options.last();
    const selectedText = (await option.textContent())?.trim() || '';
    await option.click();
    await this.page.waitForTimeout(1000);
    console.log(`Selected related diagnosis: "${selectedText}" for search "${searchText}"`);
    return selectedText;
  }

  async removeRelatedDiagnosis(index: number): Promise<void> {
    await this.page.locator(this.selectors.removeRelatedDiagnosis(index)).click();
    await this.page.waitForTimeout(500);
    console.log(`Removed related diagnosis at index ${index}`);
  }

  // ---------------------------------------------------------------------------
  // Principle Diagnosis Options (contextual — appears after save for certain diagnoses)
  // ---------------------------------------------------------------------------

  async isPrincipleDiagnosisVisible(): Promise<boolean> {
    // Check for any principle diagnosis radio button
    return await this.isElementVisible(
      this.selectors.principleDiagnosisRadio('cancer')
    );
  }

  async selectPrincipleDiagnosisOption(option: PrincipleDiagnosisOption): Promise<void> {
    const selector = this.selectors.principleDiagnosisRadio(option);
    await this.page.locator(selector).click();
    await this.page.waitForTimeout(500);
    console.log(`Selected principle diagnosis option: ${option}`);
  }

  // ---------------------------------------------------------------------------
  // Form Actions
  // ---------------------------------------------------------------------------

  async clickSave(): Promise<void> {
    await this.page.locator(this.selectors.saveButton).click();
    await this.page.waitForTimeout(2000);
    console.log('Clicked Save on diagnosis form');
  }

  async clickCancel(): Promise<void> {
    await this.page.locator(this.selectors.cancelButton).click();
    await this.page.waitForTimeout(1000);
    console.log('Clicked Cancel on diagnosis form');
  }

  async isSaveButtonEnabled(): Promise<boolean> {
    const button = this.page.locator(this.selectors.saveButton);
    return await button.isEnabled();
  }
}
