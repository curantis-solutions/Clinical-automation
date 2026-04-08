import { Page } from '@playwright/test';
import { BasePage } from './base.page';
import { CertificationType } from '../types/certification.types';
import { DateHelper } from '../utils/date-helper';

/**
 * Certification Page Object
 * Handles the certifications list/details view AND the add/edit popup form.
 *
 * IMPORTANT: Verbal and Written forms use different data-cy selectors for many
 * similar elements. Methods are split by cert type where selectors differ.
 */
export class CertificationPage extends BasePage {
  private readonly selectors = {
    // =============================================
    // Navigation
    // =============================================
    certificationsNavTab: '[data-cy="btn-nav-bar-item-certifications"]',

    // =============================================
    // List / Details View Selectors
    // =============================================

    // === Main Content ===
    content: '[data-cy="content-certificate-consents"]',
    mainRow: '[data-cy="row-main"]',
    mainCol: '[data-cy="col-main"]',

    // === Certifications Card ===
    certificationsCard: '[data-cy="card-certifications"]',
    certificationsCardContent: '[data-cy="content-certifications"]',
    certificationsContainer: '[data-cy="container-certifications"]',
    certificationsList: '[data-cy="list-certifications"]',

    // === Certifications Header (Patient View) ===
    certificationsHeaderRow: '[data-cy="row-certifications-header"]',
    certificationsIconsContainer: '[data-cy="container-certifications-icons"]',
    addCertificationFab: '[data-cy="fab-add-certification"]',
    addCertificationButton: '[data-cy="btn-add-certifications"]',

    // === Certifications Table ===
    certificatesListContainer: '[data-cy="container-certificates-list"]',
    certificatesHeaderRow: '[data-cy="row-certificates-header"]',
    certTypeColumnHeader: '[data-cy="col-header-cert-type"]',
    certTypeLabel: '[data-cy="label-header-cert-type"]',
    certTypeSortIcon: '[data-cy="icon-sort-cert-type"]',

    // === Pagination ===
    paginationContainer: '[data-cy="container-pagination"]',
    firstPageButton: '[data-cy="btn-first-page"]',
    prevPageButton: '[data-cy="btn-prev-page"]',
    pageMinus2Button: '[data-cy="btn-page-minus-2"]',
    pageMinus1Button: '[data-cy="btn-page-minus-1"]',
    currentPageButton: '[data-cy="btn-current-page"]',
    pagePlus1Button: '[data-cy="btn-page-plus-1"]',
    pagePlus2Button: '[data-cy="btn-page-plus-2"]',
    nextPageButton: '[data-cy="btn-next-page"]',
    lastPageButton: '[data-cy="btn-last-page"]',

    // === Initial Certification (Referral View) ===
    initialCertHeaderRow: '[data-cy="row-initial-cert-header"]',
    initialCertLabel: '[data-cy="label-initial-certification"]',
    certActionsContainer: '[data-cy="container-cert-actions"]',
    addCertFab: '[data-cy="fab-add-cert"]',
    addCertButton: '[data-cy="btn-add-cert"]',
    addCertIcon: '[data-cy="icon-add-cert"]',
    certIconsContainer: '[data-cy="container-cert-icons"]',
    certMoreIcon: '[data-cy="icon-cert-more"]',
    certToggleIcon: '[data-cy="icon-cert-toggle"]',

    // === Certification Row Actions (Referral View) ===
    // Current cert (topmost row): btn-certification-written-options-0
    // Previous certs (descending): btn-previous-written-certification-options0, ...options1
    certificationOptions: (index: number) => `[data-cy="btn-certification-options-${index}"]`,
    certificationWrittenOptions: (index: number) => `[data-cy="btn-certification-written-options-${index}"]`,
    previousCertificationWrittenOptions: (index: number) => `[data-cy="btn-previous-written-certification-options${index}"]`,
    certificationDetails: (index: number) => `[data-cy="btn-certification-details-options-${index}"]`,
    certificationWrittenDetails: (index: number) => `[data-cy="btn-certifications-written-details-${index}"]`,
    editMenuItem: 'button:has-text("Edit")',

    // =============================================
    // Form (Add/Edit Popup) Selectors
    // =============================================

    // === Certification Type Radios ===
    verbalRadio: '[data-cy="radio-certification-verbal"]',
    writtenRadio: '[data-cy="radio-certification-written"]',

    // === Benefit Period ===
    // Note: Verbal uses plural "benefits", Written uses singular "benefit"
    benefitPeriodInputVerbal: '[data-cy="input-benefits-period-dates"]',
    benefitPeriodInputWritten: '[data-cy="input-benefit-period-dates"]',
    benefitPeriodDropdownVerbal: '[data-cy="btn-show-benefits-periods"]',
    benefitPeriodDropdownWritten1: '[data-cy="btn-show-benefits-periods"]',
    benefitPeriodDropdownWritten2: '[data-cy="btn-show-benefits-periods-2"]',
    // Note: Verbal has NO dash before index, Written has dash before index
    benefitPeriodOptionVerbal: (index: number) => `[data-cy="btn-set-benefits-period${index}"]`,
    benefitPeriodOptionWritten: (index: number) => `[data-cy="btn-set-benefits-period-${index}"]`,

    // === Hospice (Certifying) Physician ===
    hospicePhysicianInput: 'input[data-cy="input-hospice-physician"]',
    // Verbal toggle/options
    hospicePhysicianToggleVerbal: '[data-cy="btn-show-certifying-physician-options-true"]',
    hospicePhysicianOptionVerbal: (index: number) => `[data-cy="btn-show-certifying-physician-options-${index}"]`,
    hospicePhysicianCloseVerbal: '[data-cy="btn-show-certifying-physician-options-false"]',
    // Written toggle/options
    hospicePhysicianToggleWritten: '[data-cy="btn-show-certifying-true"]',
    hospicePhysicianOptionWritten: (index: number) => `[data-cy="btn-set-physician-${index}"]`,
    hospicePhysicianCloseWritten: '[data-cy="btn-show-certifying-false"]',

    // === Hospice Date Pickers ===
    certifyingObtainedOnPicker: '[data-cy="date-obtained-on-picker"]',  // Verbal
    certifyingSignedOnPicker: '[data-cy="date-signed-on-picker"]',      // Written

    // === Verbal Only: Received By ===
    certifyingReceivedByInput: 'input[data-cy="input-recieved-by"]',    // Note: typo in data-cy
    attendingReceivedByInput: 'input[data-cy="input-received-by"]',     // Correct spelling

    // === Attending Physician ===
    attendingPhysicianInput: 'input[data-cy="input-attending-physician"]',
    // Verbal toggle/options (no dash before index)
    attendingPhysicianToggleVerbal: '[data-cy="btn-show-physician-options-true"]',
    attendingPhysicianOptionVerbal: (index: number) => `[data-cy="btn-attending-physician-options${index}"]`,
    attendingPhysicianCloseVerbal: '[data-cy="btn-show-attending-physicians-options-false"]',
    // Written toggle/options (with dash before index)
    attendingPhysicianToggleWritten: '[data-cy="btn-show-physician-options"]',
    attendingPhysicianOptionWritten: (index: number) => `[data-cy="btn-set-attending-physician-${index}"]`,
    attendingPhysicianCloseWritten: '[data-cy="btn-show-attending-physician-options"]',

    // === Attending Date Pickers ===
    attendingObtainedOnPicker: '[data-cy="date-obtained-on"]',          // Verbal
    attendingSignedOnPicker: '[data-cy="date-signed-on-picker2"]',      // Written

    // === Written Only: Narrative & Checkboxes ===
    narrativeStatement: 'textarea[data-cy="input-narrative-statement"]',
    narrativeOnFileCheckbox: '[data-cy="checkbox-narrative-on-file"]',
    signatureReceivedCheckbox: '[data-cy="checkbox-signature-received"]',

    // === Edit Mode: Reason for Change ===
    // Reuses "input-narrative-statement" data-cy; use .nth(1) for 2nd instance
    reasonForChangeInput: '[data-cy="input-narrative-statement"]',

    // === Action Buttons ===
    saveButton: '[data-cy="btn-save"]',
    cancelButton: '[data-cy="btn-cancel"]',
  };

  constructor(page: Page) {
    super(page);
  }

  // ============================================
  // Navigation
  // ============================================

  async navigateToCertificationsTab(): Promise<void> {
    const navButton = this.page.locator(this.selectors.certificationsNavTab);
    await navButton.scrollIntoViewIfNeeded();
    await navButton.click();
    await this.page.waitForTimeout(1000);
    console.log('Navigated to Certifications tab');
  }

  // ============================================
  // List / Details View — Visibility
  // ============================================

  async isPageVisible(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.content);
  }

  async isCertificationsCardVisible(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.certificationsCard);
  }

  // ============================================
  // List / Details View — Patient View
  // ============================================

  async clickAddCertification(): Promise<void> {
    await this.page.locator(this.selectors.addCertificationButton).click();
    await this.page.waitForTimeout(1000);
    console.log('Clicked Add Certification button');
  }

  async isCertificationsTableVisible(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.certificatesListContainer);
  }

  async sortByColumn(column: string): Promise<void> {
    const columnSelector = `${this.selectors.certificatesHeaderRow} ion-col:has-text("${column}")`;
    await this.page.locator(columnSelector).click();
    await this.page.waitForTimeout(500);
    console.log(`Sorted certifications by: ${column}`);
  }

  async sortByCertType(): Promise<void> {
    await this.page.locator(this.selectors.certTypeColumnHeader).click();
    await this.page.waitForTimeout(500);
    console.log('Sorted by Cert Type');
  }

  async clickCertificationRow(index: number): Promise<void> {
    const rows = this.page.locator(`${this.selectors.certificatesListContainer} ion-row.certificates-values`);
    await rows.nth(index).click();
    await this.page.waitForTimeout(1000);
    console.log(`Clicked certification row at index: ${index}`);
  }

  async getCertificationRowCount(): Promise<number> {
    const rows = this.page.locator(`${this.selectors.certificatesListContainer} ion-row.certificates-values`);
    return await rows.count();
  }

  async getCertificationRowData(index: number): Promise<{
    certType: string;
    staffName: string;
    staffId: string;
    payers: string;
    certifyingPhysician: string;
    verbalDate: string;
    signedDate: string;
  }> {
    const row = this.page.locator(`${this.selectors.certificatesListContainer} ion-row.certificates-values`).nth(index);
    const cols = row.locator('ion-col');

    return {
      certType: (await cols.nth(0).textContent())?.trim() || '',
      staffName: (await cols.nth(1).textContent())?.trim() || '',
      staffId: (await cols.nth(2).textContent())?.trim() || '',
      payers: (await cols.nth(3).textContent())?.trim() || '',
      certifyingPhysician: (await cols.nth(4).textContent())?.trim() || '',
      verbalDate: (await cols.nth(5).textContent())?.trim() || '',
      signedDate: (await cols.nth(6).textContent())?.trim() || '',
    };
  }

  // ============================================
  // List / Details View — Pagination
  // ============================================

  async isPaginationVisible(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.paginationContainer);
  }

  async goToFirstPage(): Promise<void> {
    await this.page.locator(this.selectors.firstPageButton).click();
    await this.page.waitForTimeout(500);
    console.log('Navigated to first page');
  }

  async goToPreviousPage(): Promise<void> {
    await this.page.locator(this.selectors.prevPageButton).click();
    await this.page.waitForTimeout(500);
    console.log('Navigated to previous page');
  }

  async goToNextPage(): Promise<void> {
    await this.page.locator(this.selectors.nextPageButton).click();
    await this.page.waitForTimeout(500);
    console.log('Navigated to next page');
  }

  async goToLastPage(): Promise<void> {
    await this.page.locator(this.selectors.lastPageButton).click();
    await this.page.waitForTimeout(500);
    console.log('Navigated to last page');
  }

  async getCurrentPageNumber(): Promise<string> {
    return (await this.page.locator(this.selectors.currentPageButton).textContent())?.trim() || '';
  }

  // ============================================
  // List / Details View — Initial Certification (Referral View)
  // ============================================

  async isInitialCertificationVisible(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.initialCertHeaderRow);
  }

  async clickAddInitialCertification(): Promise<void> {
    await this.page.locator(this.selectors.addCertButton).click();
    await this.page.waitForTimeout(1000);
    console.log('Clicked Add Initial Certification button');
  }

  async clickCertMoreIcon(): Promise<void> {
    await this.page.locator(this.selectors.certMoreIcon).click();
    await this.page.waitForTimeout(500);
    console.log('Clicked certification more icon');
  }

  async toggleCertificationDetails(): Promise<void> {
    await this.page.locator(this.selectors.certToggleIcon).click();
    await this.page.waitForTimeout(500);
    console.log('Toggled certification details');
  }

  // ============================================
  // List / Details View — Row Actions (Referral View)
  // ============================================

  /**
   * Open the current (topmost) Written cert for editing.
   * Uses btn-certification-written-options-{index}.
   */
  async openWrittenCertificationEdit(index: number = 0): Promise<void> {
    await this.page.locator(this.selectors.certificationWrittenOptions(index)).click();
    await this.page.waitForTimeout(500);
    await this.page.locator(this.selectors.editMenuItem).click();
    await this.page.waitForTimeout(1000);
    console.log(`Opened current Written certification ${index} in edit mode`);
  }

  /**
   * Open a previous (non-current) Written cert for editing.
   * Grid is descending: index 0 = second-most-recent BP, index 1 = third, etc.
   * Uses btn-previous-written-certification-options{index}.
   */
  async openPreviousWrittenCertificationEdit(index: number = 0): Promise<void> {
    await this.page.locator(this.selectors.previousCertificationWrittenOptions(index)).click();
    await this.page.waitForTimeout(500);
    await this.page.locator(this.selectors.editMenuItem).click();
    await this.page.waitForTimeout(1000);
    console.log(`Opened previous Written certification ${index} in edit mode`);
  }

  async openVerbalCertificationEdit(index: number = 0): Promise<void> {
    await this.page.locator(this.selectors.certificationOptions(index)).click();
    await this.page.waitForTimeout(500);
    await this.page.locator(this.selectors.editMenuItem).click();
    await this.page.waitForTimeout(1000);
    console.log(`Opened Verbal certification ${index} in edit mode`);
  }

  async isVerbalCertificationVisible(index: number = 0): Promise<boolean> {
    return await this.isElementVisible(this.selectors.certificationOptions(index));
  }

  async isWrittenCertificationVisible(index: number = 0): Promise<boolean> {
    return await this.isElementVisible(this.selectors.certificationWrittenOptions(index));
  }

  // ============================================
  // Form — Certification Type Selection
  // ============================================

  async selectVerbalCertification(): Promise<void> {
    await this.page.locator(this.selectors.verbalRadio).click();
    await this.page.waitForTimeout(2000);
    console.log('Selected Verbal certification type');
  }

  async selectWrittenCertification(): Promise<void> {
    await this.page.locator(this.selectors.writtenRadio).click();
    await this.page.waitForTimeout(2000);
    console.log('Selected Written certification type');
  }

  // ============================================
  // Form — Benefit Period Selection
  // ============================================

  async selectBenefitPeriod(index: number, certType: CertificationType): Promise<void> {
    if (certType === 'Verbal') {
      await this.page.locator(this.selectors.benefitPeriodDropdownVerbal).click();
      await this.page.waitForTimeout(500);
      await this.page.locator(this.selectors.benefitPeriodOptionVerbal(index)).click();
    } else {
      // Written: try the second dropdown button first, fall back to the first
      const dropdown2 = this.page.locator(this.selectors.benefitPeriodDropdownWritten2);
      const dropdown1 = this.page.locator(this.selectors.benefitPeriodDropdownWritten1);

      if (await dropdown2.isVisible({ timeout: 2000 }).catch(() => false)) {
        await dropdown2.click();
      } else {
        await dropdown1.click();
      }
      await this.page.waitForTimeout(500);
      await this.page.locator(this.selectors.benefitPeriodOptionWritten(index)).click();
    }
    await this.page.waitForTimeout(1000);
    console.log(`Selected benefit period index: ${index} (${certType})`);
  }

  // ============================================
  // Form — Physician Search & Select (Private Helper)
  // ============================================

  /**
   * Search for a physician by typing char-by-char, then select from results.
   * Physician fields require pressSequentially for the autocomplete to work.
   */
  private async searchAndSelectPhysician(
    inputSelector: string,
    optionSelector: string,
    name: string,
    optionIndex: number
  ): Promise<void> {
    const input = this.page.locator(inputSelector);

    // Wait for input to be visible and enabled
    await input.waitFor({ state: 'visible', timeout: 10000 });
    await this.page.waitForTimeout(1000);

    // Wait for field to be enabled (disabled until benefit period selected)
    let retries = 0;
    while (retries < 5 && !(await input.isEnabled())) {
      await this.page.waitForTimeout(1000);
      retries++;
    }

    await input.clear();
    await input.pressSequentially(name, { delay: 200 });
    await this.page.waitForTimeout(1500);

    // Click the option
    await this.page.locator(optionSelector).click();
    await this.page.waitForTimeout(1000);
  }

  // ============================================
  // Form — Received By Hint Text (Verbal Only)
  // ============================================

  /**
   * Read the red hint text that shows "Please enter your name as it shows here: {name}"
   * and extract the expected name value.
   * @returns The expected name (e.g., "Nancy MD") or null if not found
   */
  async getReceivedByHintName(): Promise<string | null> {
    try {
      const hintElements = this.page.locator('.invalid-signature.errorText');
      const count = await hintElements.count();

      for (let i = 0; i < count; i++) {
        const text = await hintElements.nth(i).textContent();
        if (text && text.includes('as it shows here:')) {
          const match = text.split('as it shows here:')[1]?.trim();
          if (match) {
            console.log(`Captured received-by hint name: "${match}"`);
            return match;
          }
        }
      }

      console.log('No received-by hint text found');
      return null;
    } catch {
      console.log('Failed to read received-by hint text');
      return null;
    }
  }

  // ============================================
  // Form — Verbal Methods
  // ============================================

  async fillHospicePhysicianVerbal(name: string, optionIndex: number = 0): Promise<void> {
    await this.searchAndSelectPhysician(
      this.selectors.hospicePhysicianInput,
      this.selectors.hospicePhysicianOptionVerbal(optionIndex),
      name,
      optionIndex
    );
    console.log(`Set hospice physician (Verbal): ${name}`);
  }

  async fillCertifyingObtainedOn(date: string): Promise<void> {
    await this.page.locator(this.selectors.certifyingObtainedOnPicker).click();
    await this.page.waitForTimeout(500);
    await DateHelper.selectDateFormatted(this.page, date);
    console.log(`Set certifying obtained on: ${date}`);
  }

  async fillCertifyingReceivedBy(name: string): Promise<void> {
    const input = this.page.locator(this.selectors.certifyingReceivedByInput);
    await input.waitFor({ state: 'visible', timeout: 10000 });
    await input.clear();
    await input.fill(name);
    console.log(`Set certifying received by: ${name}`);
  }

  async fillAttendingPhysicianVerbal(name: string, optionIndex: number = 0): Promise<void> {
    await this.searchAndSelectPhysician(
      this.selectors.attendingPhysicianInput,
      this.selectors.attendingPhysicianOptionVerbal(optionIndex),
      name,
      optionIndex
    );
    console.log(`Set attending physician (Verbal): ${name}`);
  }

  async fillAttendingObtainedOn(date: string): Promise<void> {
    await this.page.locator(this.selectors.attendingObtainedOnPicker).click();
    await this.page.waitForTimeout(500);
    await DateHelper.selectDateFormatted(this.page, date);
    console.log(`Set attending obtained on: ${date}`);
  }

  async fillAttendingReceivedBy(name: string): Promise<void> {
    const input = this.page.locator(this.selectors.attendingReceivedByInput);
    await input.waitFor({ state: 'visible', timeout: 10000 });
    await input.clear();
    await input.fill(name);
    console.log(`Set attending received by: ${name}`);
  }

  // ============================================
  // Form — Written Methods
  // ============================================

  async fillHospicePhysicianWritten(name: string, optionIndex: number = 0): Promise<void> {
    await this.searchAndSelectPhysician(
      this.selectors.hospicePhysicianInput,
      this.selectors.hospicePhysicianOptionWritten(optionIndex),
      name,
      optionIndex
    );
    console.log(`Set hospice physician (Written): ${name}`);
  }

  async fillCertifyingSignedOn(date: string): Promise<void> {
    await this.page.locator(this.selectors.certifyingSignedOnPicker).click();
    await this.page.waitForTimeout(500);
    await DateHelper.selectDateFormatted(this.page, date);
    console.log(`Set certifying signed on: ${date}`);
  }

  async fillAttendingPhysicianWritten(name: string, optionIndex: number = 0): Promise<void> {
    await this.searchAndSelectPhysician(
      this.selectors.attendingPhysicianInput,
      this.selectors.attendingPhysicianOptionWritten(optionIndex),
      name,
      optionIndex
    );
    console.log(`Set attending physician (Written): ${name}`);
  }

  async fillAttendingSignedOn(date: string): Promise<void> {
    await this.page.locator(this.selectors.attendingSignedOnPicker).click();
    await this.page.waitForTimeout(500);
    await DateHelper.selectDateFormatted(this.page, date);
    console.log(`Set attending signed on: ${date}`);
  }

  async fillBriefNarrativeStatement(text: string): Promise<void> {
    const textarea = this.page.locator(this.selectors.narrativeStatement);
    await textarea.waitFor({ state: 'visible', timeout: 10000 });
    if (!(await textarea.isEnabled())) {
      console.log('Brief narrative statement textarea is disabled — skipping');
      return;
    }
    await textarea.click();
    await textarea.fill(text);
    console.log('Filled brief narrative statement');
  }

  async toggleNarrativeOnFile(): Promise<void> {
    await this.page.locator(this.selectors.narrativeOnFileCheckbox).click();
    await this.page.waitForTimeout(500);
    console.log('Toggled narrative on file checkbox');
  }

  async toggleSignatureReceived(): Promise<void> {
    await this.page.locator(this.selectors.signatureReceivedCheckbox).click();
    await this.page.waitForTimeout(500);
    console.log('Toggled signature received checkbox');
  }

  // ============================================
  // Form — Edit Mode
  // ============================================

  /**
   * Fill Reason for Change field (edit mode only).
   * The "Reason for Change" reuses the `input-narrative-statement` data-cy attribute.
   * In edit mode it is the last occurrence on the page.
   */
  async fillReasonForChange(reason: string): Promise<void> {
    const inputs = this.page.locator(this.selectors.reasonForChangeInput);
    const count = await inputs.count();
    const target = inputs.nth(count - 1);
    await target.waitFor({ state: 'visible', timeout: 10000 });
    await target.click();
    await target.fill(reason);
    console.log(`Filled reason for change: ${reason}`);
  }

  // ============================================
  // Form — Action Buttons
  // ============================================

  async clickSave(): Promise<void> {
    await this.page.locator(this.selectors.saveButton).click({ force: true });
    await this.page.waitForTimeout(2000);
    console.log('Clicked Save');
  }

  async clickCancel(): Promise<void> {
    await this.page.locator(this.selectors.cancelButton).click();
    await this.page.waitForTimeout(1000);
    console.log('Clicked Cancel');
  }

  async isSaveButtonEnabled(): Promise<boolean> {
    const button = this.page.locator(this.selectors.saveButton);
    return await button.isEnabled();
  }

  async isSaveButtonVisible(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.saveButton);
  }

  // ── Read Cert Row Data ──

  /**
   * Read the certifying (hospice) physician name from a Written cert row.
   * Written row columns: BP | From | To | Hospice Physician | Signed | Attending | Signed | Completed
   * Hospice Physician is column index 3 (0-based).
   * @param rowIndex - 0-based cert row index (default 0)
   */
  async getWrittenCertifyingPhysicianName(rowIndex = 0): Promise<string> {
    return await this.getWrittenCertColumnText(rowIndex, 3);
  }

  /**
   * Read the attending physician name from a Written cert row.
   * Attending Physician is column index 5 (0-based).
   * @param rowIndex - 0-based cert row index (default 0)
   */
  async getWrittenAttendingPhysicianName(rowIndex = 0): Promise<string> {
    return await this.getWrittenCertColumnText(rowIndex, 5);
  }

  /**
   * Read text from a specific column in a Written cert data row.
   * Uses the details button as anchor to find the row, then reads nth ion-col.
   */
  private async getWrittenCertColumnText(rowIndex: number, colIndex: number): Promise<string> {
    const detailsBtn = this.page.locator(this.selectors.certificationWrittenDetails(rowIndex));
    const row = detailsBtn.locator('xpath=ancestor::ion-row[1]');
    const cols = row.locator('ion-col');
    const text = await cols.nth(colIndex).textContent();
    return text?.trim() ?? '';
  }
}
