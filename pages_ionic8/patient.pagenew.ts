import { Page } from '@playwright/test';
import { BasePage } from '../pages/base.page';
import { PatientData, CareType } from '../types/patient.types';
import { DateHelper } from '../utils/date-helper';

/**
 * Patient Page Object — Ionic 8 (qa2)
 *
 * VERIFIED via MCP Playwright on qa2 (2026-03-11).
 *
 * KEY FINDINGS — qa2 Add Patient form opens as an ion-modal dialog.
 * Care type, gender, veteran are RADIO BUTTONS (same as qa1), NOT ng-selects.
 * Many selectors match qa1 exactly. Dropdowns (prefix, suffix, marital status,
 * language, religion, ethnicity, state, county) are ng-selects.
 *
 * Verified data-cy attributes (from ion-modal on qa2):
 * - Form: form-patient-details
 * - Care type radios: radio-type-of-care-hospice, radio-type-of-care-palliative, radio-type-of-care-evaluation
 * - Gender radios: radio-gender-male, radio-gender-female
 * - Veteran radios: radio-veteran-yes, radio-veteran-no
 * - SSN unknown: checkbox-unknown
 * - Ethnicity (HIS): select-his-ethnicity (NOT select-ethnicity)
 * - Phone: input-phone (NOT input-phone-number)
 * - Email: input-email (NOT input-email-address)
 * - Zip ext: input-zip-code-ext (NOT input-zip-extension)
 * - Same address: checkbox-same-address (NOT checkbox-same-as-home-address)
 * - Save: btn-add-patient-save (NOT btn-save-patient-details)
 * - Cancel: btn-add-patient-cancel (NOT btn-cancel-patient-details)
 * - Living will radios: radio-living-will-yes, radio-living-will-no
 * - Skilled bed radios: radio-skilled-bed-yes, radio-skilled-bed-no
 * - County: select-county (ng-select, NOT input-county)
 * - Add patient button: icon-add (on patient list page)
 */
export class PatientPagenew extends BasePage {
  private readonly selectors = {
    // Patient List
    searchBar: '[data-cy="input-search-patients"]',
    patientRow: (index: number) => `[data-cy="item-patient-${index}"]`,
    patientCheckbox: (index: number) => `[data-cy="checkbox-patient-${index}"]`,

    // Add Patient
    addPatientButton: '[data-cy="btn-add-patient"]',

    // Patient Form (opens as ion-modal)
    patientForm: '[data-cy="form-patient-details"]',

    // Care Type — radio buttons
    careTypeRadio: (type: string) => `[data-cy="radio-type-of-care-${type.toLowerCase()}"]`,

    // Demographics
    firstName: '[data-cy="input-first-name"]',
    middleInitial: '[data-cy="input-middle-initial"]',
    lastName: '[data-cy="input-last-name"]',
    prefix: '[data-cy="select-prefix"]',
    suffix: '[data-cy="select-suffix"]',
    nickname: '[data-cy="input-nickname"]',
    ssn: '[data-cy="input-ssn"]',
    ssnUnknown: '[data-cy="checkbox-unknown"]',
    dateOfBirth: '[data-cy="date-of-birth"]',

    // Gender — radio buttons
    genderRadio: (gender: string) => `[data-cy="radio-gender-${gender.toLowerCase()}"]`,

    // Veteran — radio buttons
    veteranRadio: (value: string) => `[data-cy="radio-veteran-${value.toLowerCase()}"]`,

    // Additional Info (ng-selects)
    maritalStatus: '[data-cy="select-marital-status"]',
    firstLanguage: '[data-cy="select-first-language"]',
    religion: '[data-cy="select-religion"]',
    ethnicity: '[data-cy="select-his-ethnicity"]',
    ethnicityHope: '[data-cy="select-hope-ethnicity"]',
    raceHope: '[data-cy="select-hope-race"]',

    // Contact Info
    phoneNumber: '[data-cy="input-phone"]',
    emailAddress: '[data-cy="input-email"]',

    // Address
    streetAddress: '[data-cy="input-street-address"]',
    city: '[data-cy="input-city"]',
    state: '[data-cy="select-state"]',
    zipCode: '[data-cy="input-zip"]',
    zipCodeExt: '[data-cy="input-zip-code-ext"]',
    county: '[data-cy="select-county"]',
    sameAddress: '[data-cy="checkbox-same-address"]',

    // Referral Location
    locationType: '[data-cy="select-location-type"]',
    locationTypeValue: '[data-cy="select-location-type-value"]',

    // Living will — radio buttons
    livingWillYes: '[data-cy="radio-living-will-yes"]',
    livingWillNo: '[data-cy="radio-living-will-no"]',

    // Skilled bed — radio buttons
    skilledBedYes: '[data-cy="radio-skilled-bed-yes"]',
    skilledBedNo: '[data-cy="radio-skilled-bed-no"]',

    // Actions (inside modal footer)
    saveButton: '[data-cy="btn-add-patient-save"]',
    cancelButton: '[data-cy="btn-add-patient-cancel"]',

    // ng-select helpers
    ngOption: '[class*="ng-option"] span',
    ngSearchInput: '[data-cy="input-search-input"]',
    ngFilteredOption: (index: number) => `[data-cy="input-filtered-options-${index}"]`,
  };

  constructor(page: Page) {
    super(page);
  }

  /**
   * Helper to select from an ng-select dropdown by clicking and selecting option.
   * Returns true if option was found and selected, false if not found.
   */
  private async selectNgOption(selector: string, value: string): Promise<boolean> {
    const el = this.page.locator(selector);
    await el.scrollIntoViewIfNeeded();
    await el.click({ timeout: 10000 });
    await this.page.waitForTimeout(500);
    const option = this.page.locator(this.selectors.ngOption).filter({ hasText: value }).first();
    try {
      await option.click({ timeout: 5000 });
      await this.page.waitForTimeout(500);
      // Close dropdown for multiselect ng-selects (they stay open after selection)
      await this.closeNgDropdown(selector);
      return true;
    } catch {
      // Option not found — close dropdown
      console.log(`⚠️ ng-select option "${value}" not found in ${selector}, skipping`);
      await this.closeNgDropdown(selector);
      return false;
    }
  }

  private async closeNgDropdown(selector: string): Promise<void> {
    const dropdown = this.page.locator('ng-dropdown-panel');
    if (await dropdown.isVisible({ timeout: 500 }).catch(() => false)) {
      const ngArrow = this.page.locator(`${selector} .ng-arrow-wrapper`);
      if (await ngArrow.isVisible({ timeout: 500 }).catch(() => false)) {
        await ngArrow.click();
      } else {
        await this.page.keyboard.press('Tab');
      }
      await this.page.waitForTimeout(300);
    }
  }

  /**
   * Click Add Patient button
   */
  async clickAddPatient(): Promise<void> {
    await this.page.waitForSelector(this.selectors.addPatientButton, { state: 'attached', timeout: 15000 });
    await this.page.waitForTimeout(1000);
    await this.page.locator(this.selectors.addPatientButton).click({ force: true });
    console.log('Clicked Add Patient button');
  }

  /**
   * Select care type (radio button on qa2)
   */
  async selectCareType(careType: CareType): Promise<void> {
    const radio = this.selectors.careTypeRadio(careType);
    await this.page.waitForSelector(radio, { state: 'visible', timeout: 10000 });
    await this.page.locator(radio).click({ force: true });
    console.log(`Selected care type: ${careType}`);
  }

  /**
   * Fill patient demographics section
   */
  async fillDemographics(patientData: PatientData): Promise<void> {
    const { demographics } = patientData;

    // First Name
    await this.page.locator(`${this.selectors.firstName} input`).fill(demographics.firstName);

    // Last Name
    await this.page.locator(`${this.selectors.lastName} input`).fill(demographics.lastName);

    // Middle Initial (optional)
    if (demographics.middleInitial) {
      await this.page.locator(`${this.selectors.middleInitial} input`).fill(demographics.middleInitial);
    }

    // Nickname (optional)
    if (demographics.nickname) {
      await this.page.locator(`${this.selectors.nickname} input`).fill(demographics.nickname);
    }

    // SSN
    await this.page.locator(`${this.selectors.ssn} input`).fill(demographics.ssn);

    // Date of Birth — cur-date-picker
    await this.page.locator(this.selectors.dateOfBirth).click();
    await this.page.waitForTimeout(1000);
    console.log(`Setting date of birth: ${demographics.dateOfBirth}`);
    await DateHelper.selectDateFormatted(this.page, demographics.dateOfBirth);

    // Gender — radio button
    await this.page.locator(this.selectors.genderRadio(demographics.gender)).click({ force: true });

    // Veteran Status — radio button
    const veteranText = demographics.veteran ? 'yes' : 'no';
    await this.page.locator(this.selectors.veteranRadio(veteranText)).click({ force: true });

    console.log(`Filled demographics: ${demographics.firstName} ${demographics.lastName}`);
  }

  /**
   * Fill additional info (marital status, language, religion, ethnicity)
   */
  async fillAdditionalInfo(patientData: PatientData): Promise<void> {
    if (!patientData.additionalInfo) return;

    const { additionalInfo } = patientData;

    if (additionalInfo.maritalStatus) {
      await this.selectNgOption(this.selectors.maritalStatus, additionalInfo.maritalStatus);
    }

    if (additionalInfo.firstLanguage) {
      await this.selectNgOption(this.selectors.firstLanguage, additionalInfo.firstLanguage);
    }

    if (additionalInfo.religion) {
      await this.selectNgOption(this.selectors.religion, additionalInfo.religion);
    }

    if (additionalInfo.ethnicity) {
      await this.selectNgOption(this.selectors.ethnicity, additionalInfo.ethnicity);
    }

    if (additionalInfo.ethnicityHope) {
      await this.selectNgOption(this.selectors.ethnicityHope, additionalInfo.ethnicityHope);
    }

    if (additionalInfo.raceHope) {
      await this.selectNgOption(this.selectors.raceHope, additionalInfo.raceHope);
    }

    console.log('Filled additional info');
  }

  /**
   * Fill contact information
   */
  async fillContactInfo(patientData: PatientData): Promise<void> {
    const { contactInfo } = patientData;

    await this.page.locator(`${this.selectors.phoneNumber} input`).fill(contactInfo.phoneNumber);
    await this.page.locator(`${this.selectors.emailAddress} input`).fill(contactInfo.emailAddress);

    console.log('Filled contact info');
  }

  /**
   * Fill address information
   */
  async fillAddress(patientData: PatientData): Promise<void> {
    const { address } = patientData;

    await this.page.locator(`${this.selectors.streetAddress} input`).fill(address.streetAddress);
    await this.page.locator(`${this.selectors.city} input`).fill(address.city);

    // State — ng-select
    await this.selectNgOption(this.selectors.state, address.state);

    await this.page.locator(`${this.selectors.zipCode} input`).fill(address.zipCode);

    if (address.zipCodeExt) {
      await this.page.locator(`${this.selectors.zipCodeExt} input`).fill(address.zipCodeExt);
    }

    // Same Address checkbox
    if (address.sameAddress) {
      await this.page.locator(this.selectors.sameAddress).click({ force: true });
      await this.page.waitForTimeout(500);
    }

    console.log('Filled address info');
  }

  /**
   * Fill Hospice-specific fields (skilled bed radio)
   */
  async fillHospiceSpecificFields(skilledBed: boolean): Promise<void> {
    const selector = skilledBed ? this.selectors.skilledBedYes : this.selectors.skilledBedNo;
    await this.page.locator(selector).click({ force: true });
    console.log(`Set skilled bed: ${skilledBed}`);
  }

  /**
   * Save patient
   */
  async savePatient(): Promise<void> {
    await this.page.locator(this.selectors.saveButton).click();
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(2000);
    console.log('Patient saved successfully');
  }

  /**
   * Search for patient
   */
  async searchPatient(searchTerm: string): Promise<void> {
    await this.waitForElement(this.selectors.searchBar);
    await this.page.locator(`${this.selectors.searchBar} input`).fill(searchTerm);
    await this.page.locator(`${this.selectors.searchBar} input`).press('Enter');
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(3000);
    console.log(`Searched for patient: ${searchTerm}`);
  }

  /**
   * Click patient row to open chart (no separate profile link — click the row)
   */
  async getPatientFromGrid(index: number = 0): Promise<void> {
    const row = this.selectors.patientRow(index);
    await this.waitForElement(row);
    await this.page.locator(row).click();
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(1000);
    console.log(`Clicked patient at index: ${index}`);
  }

  /**
   * Verify patient exists in grid
   */
  async verifyPatientInGrid(index: number = 0): Promise<boolean> {
    const patientSelector = this.selectors.patientRow(index);
    return await this.isElementVisible(patientSelector);
  }

  /**
   * Get patient name from grid by index.
   * Row children: [checkbox, MRN, ID, LastName, FirstName, Team, CareType, Status]
   */
  async getPatientNameFromGrid(index: number): Promise<{ firstName: string; lastName: string } | null> {
    const row = this.selectors.patientRow(index);
    try {
      await this.waitForElement(row, 5000);
      const rowEl = this.page.locator(row);
      // Child divs: 0=checkbox, 1=MRN, 2=ID, 3=LastName, 4=FirstName
      const lastName = await rowEl.locator('> div').nth(3).textContent();
      const firstName = await rowEl.locator('> div').nth(4).textContent();
      if (lastName || firstName) {
        return {
          lastName: lastName?.trim() || '',
          firstName: firstName?.trim() || '',
        };
      }
      return null;
    } catch {
      console.error(`Failed to get patient name at index ${index}`);
      return null;
    }
  }

  /**
   * Get all patient names from current grid page
   */
  async getAllPatientNamesFromGrid(): Promise<Array<{ firstName: string; lastName: string; index: number }>> {
    const patients: Array<{ firstName: string; lastName: string; index: number }> = [];

    for (let i = 0; i < 20; i++) {
      const exists = await this.isElementVisible(this.selectors.patientRow(i));
      if (!exists) break;

      const name = await this.getPatientNameFromGrid(i);
      if (name && (name.firstName || name.lastName)) {
        patients.push({ ...name, index: i });
      }
    }

    console.log(`Found ${patients.length} patients in grid`);
    return patients;
  }

  /**
   * Verify if a specific patient name exists in the grid
   */
  async verifyPatientNameInGrid(searchTerm: string): Promise<{
    found: boolean;
    index: number;
    matchedName?: string;
    matchType?: 'firstName' | 'lastName' | 'fullName';
  }> {
    const patients = await this.getAllPatientNamesFromGrid();
    const searchLower = searchTerm.toLowerCase().trim();

    for (const patient of patients) {
      const firstNameLower = patient.firstName.toLowerCase();
      const lastNameLower = patient.lastName.toLowerCase();
      const fullNameLower = `${patient.firstName} ${patient.lastName}`.toLowerCase();
      const reverseFullNameLower = `${patient.lastName} ${patient.firstName}`.toLowerCase();

      if (firstNameLower.includes(searchLower) || searchLower.includes(firstNameLower)) {
        return { found: true, index: patient.index, matchedName: `${patient.firstName} ${patient.lastName}`, matchType: 'firstName' };
      }
      if (lastNameLower.includes(searchLower) || searchLower.includes(lastNameLower)) {
        return { found: true, index: patient.index, matchedName: `${patient.firstName} ${patient.lastName}`, matchType: 'lastName' };
      }
      if (fullNameLower.includes(searchLower) || reverseFullNameLower.includes(searchLower)) {
        return { found: true, index: patient.index, matchedName: `${patient.firstName} ${patient.lastName}`, matchType: 'fullName' };
      }
    }

    return { found: false, index: -1 };
  }
}
