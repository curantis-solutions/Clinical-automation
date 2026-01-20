import { Page } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Patient Profile Page Object
 * Handles patient profile sections: Patient Details, Care Team, Benefits, etc.
 */
export class PatientProfilePage extends BasePage {
  // Selectors organized by section
  private readonly selectors = {
    // Navigation
    profileTab: '[data-cy="btn-nav-bar-item-profile"]',

    // Patient Details Section
    patientDetailsHeader: '[id="tab-t0-0"]',

    // Caller Form
    addCallerBtn: '[data-cy="btn-add-caller"]',
    callerReferralType: '[data-cy="select-referral-type"] > #undefined > .button-inner',
    callerRelation: '[data-cy="select-relation"]',
    radioButtonOption: (index: number) => `[id*='rb-']`,
    callerPhysicianSearch: 'input[data-cy="input-search-physician"]',
    physicianSearchResult: '[class*="searchOptionName"]',
    saveCallerBtn: '[data-cy="btn-save"]',

    // Referrer Form
    addReferrerBtn: '[data-cy="btn-add-referrer"]',
    sameAsCallerCheckbox: '[data-cy="checkbox-same-as-caller"]',
    saveReferrerBtn: '[data-cy="btn-save"]',

    // Referring Physician Form
    addReferringPhysicianBtn: '[data-cy="btn-add-referring-physician"]',
    sameAsReferrerCheckbox: '[data-cy="checkbox-same-as-referrer"]',
    saveReferringPhysicianBtn: '[data-cy="btn-save"]',

    // Ordering Physician Form
    addOrderingPhysicianBtn: '[data-cy="btn-add-ordering-physician"]',
    sameAsReferringCheckbox: '[data-cy="checkbox-same-as-referrer"]',
    saveOrderingPhysicianBtn: '[data-cy="btn-save"]',

    // Diagnosis
    diagnosisHeader: "[href*='/patient-details/diagnosis']",
    addDiagnosis: '[data-cy="btn-add-diagnosis"]',
    primaryDiagnosis: '#primaryDiagnosisInput > [data-cy="input-primary-diagnosis"]',
    primaryDiagnosisOptions: (code: string) => `[data-cy="options-primary-diagnosis-${code}"]`,
    saveDiagnosis: '[data-cy="btn-save"]',
    cancelDiagnosis: '[data-cy="btn-cancel"]',

    // Admit Patient
    admitReferralBtn: '[data-cy="btn-admit-patient"]',
    admitDateInput: '#admitDate',
    admitDateSubmit: '#inputModalSubmit',
    pickerToolbarButton: '[class="picker-toolbar-button"] button',
    statusTab: 'a[href="#/referral-tabs/patient/patient-details/status"]',
  };

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to Profile tab
   */
  async navigateToProfileTab(): Promise<void> {
    await this.page.waitForTimeout(2000); // Wait for page to stabilize after patient selection
    await this.waitForElement(this.selectors.profileTab);
    await this.page.locator(this.selectors.profileTab).click();
    await this.page.waitForTimeout(3000); // Wait for profile to load
    console.log('✅ Navigated to Profile tab');
  }

  /**
   * Search and select a physician from dropdown
   * @param physicianName - Full name of the physician to search
   */
  private async searchAndSelectPhysician(physicianName: string): Promise<void> {
    const searchInput = this.page.locator(this.selectors.callerPhysicianSearch);
    await searchInput.click({ clickCount: 3 }); // Select all existing text
    await searchInput.fill(physicianName);
    await this.page.waitForTimeout(1000); // Wait for search results

    // Click on the search result containing the physician name
    const result = this.page.locator(this.selectors.physicianSearchResult).filter({ hasText: physicianName });
    await result.click();
    await this.page.waitForTimeout(1000);
    console.log(`✅ Selected physician: ${physicianName}`);
  }

  /**
   * Select a radio button option by index
   * @param index - Index of the radio button (0-based)
   */
  private async selectRadioOption(index: number): Promise<void> {
    const radioButtons = this.page.locator(this.selectors.radioButtonOption(index));
    await radioButtons.nth(index).click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Add Caller information
   * @param physicianName - Name of the physician to search and select
   * @param referralTypeIndex - Index of referral type (default: 0 for first option)
   * @param relationIndex - Index of relation (default: 16)
   */
  async addCaller(
    physicianName: string,
    referralTypeIndex: number = 0,
    relationIndex: number = 16
  ): Promise<void> {
    console.log('📋 Adding Caller...');

    // Click Add Caller button
    await this.page.locator(this.selectors.addCallerBtn).scrollIntoViewIfNeeded();
    await this.page.locator(this.selectors.addCallerBtn).click({ force: true });
    await this.page.waitForTimeout(6000); // Wait for form to load

    // Select Referral Type
    await this.page.locator(this.selectors.callerReferralType).scrollIntoViewIfNeeded();
    await this.page.locator(this.selectors.callerReferralType).click({ force: true });
    await this.page.waitForTimeout(3000);
    await this.selectRadioOption(referralTypeIndex);

    // Select Relation
    const relationSelect = this.page.locator(this.selectors.callerRelation);
    await relationSelect.scrollIntoViewIfNeeded();
    await relationSelect.click();
    await this.page.waitForTimeout(1000);
    await this.selectRadioOption(relationIndex);

    // Search and select physician
    await this.searchAndSelectPhysician(physicianName);

    // Save caller
    await this.page.locator(this.selectors.saveCallerBtn).click();
    await this.page.waitForTimeout(1000);
    console.log('✅ Caller added successfully');
  }

  /**
   * Add Referrer information
   * @param sameAsCaller - If true, uses "Same as Caller" checkbox
   */
  async addReferrer(sameAsCaller: boolean = true): Promise<void> {
    console.log('📋 Adding Referrer...');

    await this.page.waitForTimeout(2000);
    const addBtn = this.page.locator(this.selectors.addReferrerBtn);
    await addBtn.scrollIntoViewIfNeeded();
    await addBtn.click();
    await this.page.waitForTimeout(1000);

    if (sameAsCaller) {
      await this.page.locator(this.selectors.sameAsCallerCheckbox).click();
    }

    await this.page.locator(this.selectors.saveReferrerBtn).click();
    await this.page.waitForTimeout(2000);
    console.log('✅ Referrer added successfully');
  }

  /**
   * Add Referring Physician information
   * @param sameAsReferrer - If true, uses "Same as Referrer" checkbox
   */
  async addReferringPhysician(sameAsReferrer: boolean = true): Promise<void> {
    console.log('📋 Adding Referring Physician...');

    const addBtn = this.page.locator(this.selectors.addReferringPhysicianBtn);
    await addBtn.scrollIntoViewIfNeeded();
    await addBtn.click();
    await this.page.waitForTimeout(1000);

    if (sameAsReferrer) {
      await this.page.locator(this.selectors.sameAsReferrerCheckbox).click();
      await this.page.waitForTimeout(1000);
    }

    await this.page.locator(this.selectors.saveReferringPhysicianBtn).click();
    await this.page.waitForTimeout(1000);
    console.log('✅ Referring Physician added successfully');
  }

  /**
   * Add Ordering Physician information
   * @param sameAsReferring - If true, uses "Same as Referring Physician" checkbox
   */
  async addOrderingPhysician(sameAsReferring: boolean = true): Promise<void> {
    console.log('📋 Adding Ordering Physician...');

    const addBtn = this.page.locator(this.selectors.addOrderingPhysicianBtn);
    await addBtn.scrollIntoViewIfNeeded();
    await addBtn.click();
    await this.page.waitForTimeout(1000);

    if (sameAsReferring) {
      await this.page.locator(this.selectors.sameAsReferringCheckbox).click();
      await this.page.waitForTimeout(1000);
    }

    await this.page.locator(this.selectors.saveOrderingPhysicianBtn).click();
    await this.page.waitForTimeout(1000);
    console.log('✅ Ordering Physician added successfully');
  }

  /**
   * Complete all Patient Details sections
   * @param physicianName - Name of the physician for Caller section
   */
  async completePatientDetails(physicianName: string): Promise<void> {
    console.log('\n🏥 Completing Patient Details section...');

    await this.navigateToProfileTab();
    await this.addCaller(physicianName);
    await this.addReferrer(true);
    await this.addReferringPhysician(true);
    await this.addOrderingPhysician(true);

    console.log('✅ Patient Details completed successfully\n');
  }

  /**
   * Add Diagnosis
   * @param primaryDiagnosisText - Text to search for primary diagnosis (e.g., "Malignant")
   * @param primaryDiagnosisCode - Diagnosis code to select (e.g., "C000")
   */
  async addDiagnosis(
    primaryDiagnosisText: string = 'Malignant',
    primaryDiagnosisCode: string = 'C000'
  ): Promise<void> {
    console.log('\n🩺 Adding Diagnosis...');

    await this.navigateToProfileTab();
    await this.page.waitForTimeout(3000);

    // Click Diagnosis header/tab
    await this.page.locator(this.selectors.diagnosisHeader).click();
    await this.page.waitForTimeout(1000);

    // Click Add Diagnosis
    await this.page.locator(this.selectors.addDiagnosis).click();
    await this.page.waitForTimeout(1000);

    // Type primary diagnosis search text
    await this.page.locator(this.selectors.primaryDiagnosis).fill(primaryDiagnosisCode);
    await this.page.waitForTimeout(1000);

    // Select diagnosis option
    await this.page.locator(this.selectors.primaryDiagnosisOptions(primaryDiagnosisCode)).click();
    await this.page.waitForTimeout(1000);

    // Save diagnosis
    await this.page.locator(this.selectors.saveDiagnosis).click();
    await this.page.waitForTimeout(2000);

    console.log(`✅ Diagnosis added: ${primaryDiagnosisCode}\n`);
  }

  /**
   * Select date from date picker (ion-picker)
   * @param date - Date string in MM/DD/YYYY format
   * Selects in order: Year, Day, Month (as per Cypress implementation)
   */
  private async selectDateFromPicker(date: string): Promise<void> {
    const [month, day, year] = date.split('/');

    // Wait for the picker to be visible
    await this.page.locator('.picker-columns').waitFor({ state: 'visible' });
    await this.page.waitForTimeout(500);

    // Select Year (3rd column - index 2)
    await this.page.locator('.picker-col')
      .nth(2)
      .locator('.picker-opt')
      .filter({ hasText: year })
      .click({ force: true });
    await this.page.waitForTimeout(300);

    // Select Day (2nd column - index 1)
    await this.page.locator('.picker-col')
      .nth(1)
      .locator('.picker-opt')
      .filter({ hasText: day.padStart(2, '0') })
      .click({ force: true });
    await this.page.waitForTimeout(300);

    // Select Month (1st column - index 0)
    await this.page.locator('.picker-col')
      .nth(0)
      .locator('.picker-opt')
      .filter({ hasText: month.padStart(2, '0') })
      .click({ force: true });
    await this.page.waitForTimeout(300);

    console.log(`✅ Selected date from picker: ${date}`);
  }

  /**
   * Admit patient
   * @param admitDate - Admit date in MM/DD/YYYY format
   */
  async admitPatient(admitDate: string): Promise<void> {
    console.log(`\n🏥 Admitting patient with date: ${admitDate}...`);

    // Click admit patient button
    await this.page.locator(this.selectors.admitReferralBtn).click();
    await this.page.waitForTimeout(1000);

    // Click admit date input
    await this.page.locator(this.selectors.admitDateInput).click();
    await this.page.waitForTimeout(1000);

    // Select date from picker
    await this.selectDateFromPicker(admitDate);

    // Click toolbar button (Done/OK)
    await this.page.locator(this.selectors.pickerToolbarButton).click();
    await this.page.waitForTimeout(1000);

    // Submit admit
    await this.page.locator(this.selectors.admitDateSubmit).click();
    await this.page.waitForTimeout(1000);

    // Wait for status tab to appear (confirmation of successful admit)
    await this.page.locator(this.selectors.statusTab).waitFor({ state: 'attached' });
    await this.page.waitForTimeout(1000);

    console.log('✅ Patient admitted successfully\n');
  }
}
