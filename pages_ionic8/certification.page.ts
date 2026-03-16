import { Page } from '@playwright/test';
import { BasePage } from '../pages/base.page';
import { CertificationType } from '../types/certification.types';
import { DateHelper } from '../utils/date-helper';

/**
 * Certification Page Object — Ionic 8 (qa2)
 *
 * VERIFIED via MCP Playwright on qa2 (2026-03-12).
 *
 * KEY CHANGES from Ionic 4 (qa1):
 * - Navigation: [data-cy="btn-nav-bar-item-certifications"] SAME
 * - Add button: ion-fab-button[data-cy="btn-add-certification"] (was btn-add-certifications)
 * - Verbal section: container-verbal-title, content-verbal-certificates, table-verbal-certifications
 * - Written section: container-written-title, content-written-certificates, table-written-certifications
 * - Verbal row: ion-row[data-cy="row-verbal-certificate-{index}"] (new)
 * - Written row: ion-row[data-cy="row-written-certificate-{index}"] (new)
 * - Verbal options: btn-certification-options-{index} (same)
 * - Written options: btn-certification-written-options-{index} (same)
 * - Verbal details: btn-certification-details-options-{index} (same)
 * - Written details: btn-certifications-written-details-{index} (same)
 * - History toggle: icon-verbal-history-toggle-{index}, icon-written-history-toggle-{index}
 * - More icons: icon-verbal-more-{index}, icon-written-more-{index}
 * - Column data-cy on verbal/written rows: col-verbal-benefit-period-{i}, col-verbal-date-{i}, etc.
 * - Header columns: col-header-benefit-period, col-header-verbal-date, etc.
 * - Card: no card-certifications anymore — uses section containers instead
 *
 * FORM SELECTORS (MCP-verified 2026-03-12):
 * - Physician inputs are ion-input (need `[data-cy="..."] input` pattern)
 * - No ng-selects in cert form — physician search is custom ion-input + dropdown toggle
 * - Save/Cancel: btn-save-certification-v2 / btn-cancel-certification-v2 (NOT btn-save/btn-cancel)
 * - Narrative: ion-textarea (NOT native textarea)
 */
export class CertificationPage extends BasePage {
  private readonly selectors = {
    // Navigation
    certificationsNavTab: '[data-cy="btn-nav-bar-item-certifications"]',

    // === List View ===
    addCertificationButton: '[data-cy="btn-add-certification"]',

    // Verbal section
    verbalTitle: '[data-cy="container-verbal-title"]',
    verbalContent: '[data-cy="content-verbal-certificates"]',
    verbalTable: '[data-cy="table-verbal-certifications"]',
    verbalTableData: '[data-cy="content-verbal-table"]',
    verbalHeaderRow: '[data-cy="row-verbal-header"]',
    verbalCertRow: (index: number) => `[data-cy="row-verbal-certificate-${index}"]`,
    verbalOptions: (index: number) => `[data-cy="btn-certification-options-${index}"]`,
    verbalDetails: (index: number) => `[data-cy="btn-certification-details-options-${index}"]`,
    verbalMore: (index: number) => `[data-cy="icon-verbal-more-${index}"]`,
    verbalHistoryToggle: (index: number) => `[data-cy="icon-verbal-history-toggle-${index}"]`,

    // Verbal row data
    verbalBenefitPeriod: (index: number) => `[data-cy="col-verbal-benefit-period-${index}"]`,
    verbalDate: (index: number) => `[data-cy="col-verbal-date-${index}"]`,
    verbalReceiverName: (index: number) => `[data-cy="col-verbal-receiver-name-rm-${index}"]`,
    verbalCertifyingPhysician: (index: number) => `[data-cy="col-verbal-certifying-physician-rm-${index}"]`,
    verbalCertifyingReceivedDate: (index: number) => `[data-cy="col-verbal-certifying-received-date-${index}"]`,
    verbalAttendingReceiver: (index: number) => `[data-cy="col-verbal-attending-receiver-rm-${index}"]`,
    verbalAttendingPhysician: (index: number) => `[data-cy="col-verbal-attending-physician-rm-${index}"]`,
    verbalAttendingReceivedDate: (index: number) => `[data-cy="col-verbal-attending-received-date-${index}"]`,
    verbalStatus: (index: number) => `[data-cy="col-verbal-status-${index}"]`,
    verbalActions: (index: number) => `[data-cy="col-verbal-actions-${index}"]`,

    // Written section
    writtenTitle: '[data-cy="container-written-title"]',
    writtenContent: '[data-cy="content-written-certificates"]',
    writtenTable: '[data-cy="table-written-certifications"]',
    writtenTableData: '[data-cy="content-written-table"]',
    writtenHeaderRow: '[data-cy="row-written-header"]',
    writtenCertRow: (index: number) => `[data-cy="row-written-certificate-${index}"]`,
    writtenOptions: (index: number) => `[data-cy="btn-certification-written-options-${index}"]`,
    writtenDetails: (index: number) => `[data-cy="btn-certifications-written-details-${index}"]`,
    writtenMore: (index: number) => `[data-cy="icon-written-more-${index}"]`,
    writtenHistoryToggle: (index: number) => `[data-cy="icon-written-history-toggle-${index}"]`,
    writtenHeaderAction: '[data-cy="icon-written-header-action"]',

    // Written row data
    writtenBenefitPeriod: '[data-cy="col-written-benefit-period"]',
    writtenFromDate: '[data-cy="col-written-from-date"]',
    writtenToDate: '[data-cy="col-written-to-date"]',
    writtenCertifyingPhysician: '[data-cy="col-written-certifying-physician-rm"]',
    writtenCertifyingReceivedDate: '[data-cy="col-written-certifying-received-date"]',
    writtenAttendingPhysician: '[data-cy="col-written-attending-physician-rm"]',
    writtenAttendingReceivedDate: '[data-cy="col-written-attending-received-date"]',
    writtenStatus: '[data-cy="col-written-status"]',
    writtenActions: (index: number) => `[data-cy="col-written-actions-${index}"]`,

    // Edit menu item (ion-item in popover, no data-cy)
    editMenuItem: 'ion-item:has-text("Edit")',

    // === Form selectors (MCP-verified 2026-03-12) ===
    verbalRadio: '[data-cy="radio-certification-verbal"]',
    writtenRadio: '[data-cy="radio-certification-written"]',
    hospicePhysicianInput: '[data-cy="input-hospice-physician"] input',
    attendingPhysicianInput: '[data-cy="input-attending-physician"] input',
    narrativeStatement: '[data-cy="textarea-brief-narrative-statement"] textarea',
    narrativeOnFileCheckbox: '[data-cy="checkbox-narrative-on-file"]',
    signatureReceivedCheckbox: '[data-cy="checkbox-signature-received"]',

    // === Benefit Period ===
    benefitPeriodDropdownVerbal: '[data-cy="btn-show-benefits-periods"]',
    benefitPeriodDropdownWritten1: '[data-cy="btn-show-benefits-periods"]',
    benefitPeriodDropdownWritten2: '[data-cy="btn-show-benefits-periods-2"]',
    benefitPeriodOptionVerbal: (index: number) => `[data-cy="btn-set-benefits-period${index}"]`,
    benefitPeriodOptionWritten: (index: number) => `[data-cy="btn-set-benefits-period-${index}"]`,

    // === Physician Toggles/Options ===
    hospicePhysicianToggleVerbal: '[data-cy="btn-show-certifying-physician-options-true"]',
    hospicePhysicianOptionVerbal: (index: number) => `[data-cy="btn-show-certifying-physician-options-${index}"]`,
    hospicePhysicianToggleWritten: '[data-cy="btn-show-certifying-true"]',
    hospicePhysicianOptionWritten: (index: number) => `[data-cy="btn-set-physician-${index}"]`,

    // === Date Pickers ===
    certifyingObtainedOnPicker: '[data-cy="date-obtained-on-picker"]',
    certifyingSignedOnPicker: '[data-cy="date-signed-on-picker"]',
    attendingObtainedOnPicker: '[data-cy="date-obtained-on"]',
    attendingSignedOnPicker: '[data-cy="date-signed-on-picker2"]',

    // === Received By (Verbal Only) ===
    certifyingReceivedByInput: '[data-cy="input-recieved-by"] input',
    attendingReceivedByInput: '[data-cy="input-received-by"] input',

    // === Attending Physician Toggles ===
    attendingPhysicianToggleVerbal: '[data-cy="btn-show-physician-options-true"]',
    attendingPhysicianOptionVerbal: (index: number) => `[data-cy="btn-attending-physician-options${index}"]`,
    attendingPhysicianToggleWritten: '[data-cy="btn-show-physician-options"]',
    attendingPhysicianOptionWritten: (index: number) => `[data-cy="btn-set-attending-physician-${index}"]`,

    // === Edit Mode ===
    reasonForChangeInput: '[data-cy="textarea-reason-for-change"] textarea',

    // Action Buttons
    saveButton: '[data-cy="btn-save-certification-v2"]',
    cancelButton: '[data-cy="btn-cancel-certification-v2"]',
  };

  constructor(page: Page) {
    super(page);
  }

  // Navigation
  async navigateToCertificationsTab(): Promise<void> {
    const navButton = this.page.locator(this.selectors.certificationsNavTab).last();
    await navButton.scrollIntoViewIfNeeded();
    await navButton.click();
    await this.page.waitForTimeout(1000);
  }

  // Add
  async clickAddCertification(): Promise<void> {
    await this.page.locator(this.selectors.addCertificationButton).click();
    await this.page.waitForTimeout(1000);
  }

  // Edit
  async openVerbalCertificationEdit(index: number = 0): Promise<void> {
    await this.page.locator(this.selectors.verbalOptions(index)).click();
    await this.page.waitForTimeout(500);
    await this.page.locator(this.selectors.editMenuItem).click();
    await this.page.waitForTimeout(1000);
  }

  async openWrittenCertificationEdit(index: number = 0): Promise<void> {
    await this.page.locator(this.selectors.writtenOptions(index)).click();
    await this.page.waitForTimeout(500);
    await this.page.locator(this.selectors.editMenuItem).click();
    await this.page.waitForTimeout(1000);
  }

  // Visibility
  async isVerbalCertificationVisible(index: number = 0): Promise<boolean> {
    return await this.isElementVisible(this.selectors.verbalOptions(index));
  }

  async isWrittenCertificationVisible(index: number = 0): Promise<boolean> {
    return await this.isElementVisible(this.selectors.writtenOptions(index));
  }

  // Form type selection
  async selectVerbalCertification(): Promise<void> {
    await this.page.locator(this.selectors.verbalRadio).click();
    await this.page.waitForTimeout(2000);
  }

  async selectWrittenCertification(): Promise<void> {
    await this.page.locator(this.selectors.writtenRadio).click();
    await this.page.waitForTimeout(2000);
  }

  // Form Actions
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

  async isSaveButtonVisible(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.saveButton);
  }

  // ============================================
  // Benefit Period Selection
  // ============================================

  async selectBenefitPeriod(index: number, certType: CertificationType): Promise<void> {
    if (certType === 'Verbal') {
      await this.page.locator(this.selectors.benefitPeriodDropdownVerbal).click();
      await this.page.waitForTimeout(500);
      await this.page.locator(this.selectors.benefitPeriodOptionVerbal(index)).click();
    } else {
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
  // Physician Search Helper
  // ============================================

  private async searchAndSelectPhysician(
    inputSelector: string,
    optionSelector: string,
    name: string,
    optionIndex: number
  ): Promise<void> {
    const input = this.page.locator(inputSelector);
    await input.waitFor({ state: 'visible', timeout: 10000 });
    await this.page.waitForTimeout(1000);

    let retries = 0;
    while (retries < 5 && !(await input.isEnabled())) {
      await this.page.waitForTimeout(1000);
      retries++;
    }

    await input.clear();
    await input.pressSequentially(name, { delay: 200 });
    await this.page.waitForTimeout(1500);
    await this.page.locator(optionSelector).click();
    await this.page.waitForTimeout(1000);
  }

  // ============================================
  // Received By Hint
  // ============================================

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
      return null;
    } catch {
      return null;
    }
  }

  // ============================================
  // Verbal Methods
  // ============================================

  async fillHospicePhysicianVerbal(name: string, optionIndex: number = 0): Promise<void> {
    await this.searchAndSelectPhysician(
      this.selectors.hospicePhysicianInput,
      this.selectors.hospicePhysicianOptionVerbal(optionIndex),
      name, optionIndex
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
      name, optionIndex
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
  // Written Methods
  // ============================================

  async fillHospicePhysicianWritten(name: string, optionIndex: number = 0): Promise<void> {
    await this.searchAndSelectPhysician(
      this.selectors.hospicePhysicianInput,
      this.selectors.hospicePhysicianOptionWritten(optionIndex),
      name, optionIndex
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
      name, optionIndex
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
    const textarea = this.page.locator(this.selectors.narrativeStatement).first();
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
  }

  async toggleSignatureReceived(): Promise<void> {
    await this.page.locator(this.selectors.signatureReceivedCheckbox).click();
    await this.page.waitForTimeout(500);
  }

  // ============================================
  // Edit Mode
  // ============================================

  async fillReasonForChange(reason: string): Promise<void> {
    const target = this.page.locator(this.selectors.reasonForChangeInput);
    await target.waitFor({ state: 'visible', timeout: 10000 });
    await target.click();
    await target.fill(reason);
    console.log(`Filled reason for change: ${reason}`);
  }
}
