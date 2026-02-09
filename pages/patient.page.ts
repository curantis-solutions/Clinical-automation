import { Page, expect } from '@playwright/test';
import { BasePage } from './base.page';
import { PatientData, CareType } from '../types/patient.types';
import { DateHelper } from '@utils/date-helper';

/**
 * Patient Page Object
 * Handles all patient-specific actions (add, search, edit)
 */
export class PatientPage extends BasePage {
  // Selectors from Cypress (data-cy attributes)
  private readonly selectors = {
    // Patient List
    searchBar: '[data-cy="input-search-patients"]',
    patientItem: (index: number) => `[data-cy="item-patient-${index}"]`,
    PatientchartId:'[data-cy="item-patient-0"] div:nth-child(3)',
    // Add Patient
    addPatientButton: '[data-cy="btn-add-patient"]',

    // Care Type Selection
    careTypeHospice: '[data-cy="radio-type-of-care-hospice"]',
    careTypePalliative: '[data-cy="radio-type-of-care-palliative"]',
    careTypeEvaluation: '[data-cy="radio-type-of-care-evaluation"]',

    // Demographics
    firstName: 'input[data-cy="input-first-name"]',
    middleInitial: 'input[data-cy="input-middle-initial"]',
    lastName: 'input[data-cy="input-last-name"]',
    prefix: '[data-cy="select-prefix"]',
    suffix: '[data-cy="select-suffix"]',
    nickname: '[data-cy="input-nickname"]',
    ssn: 'input[data-cy="input-ssn"]',
    ssnUnknown: '[data-cy="checkbox-unknow"]',
    codeStatus: '[data-cy="select-code-status"]',
    dateOfBirth: '[data-cy="date-of-birth"]',
    genderMale: '[data-cy="radio-gender-male"]',
    genderFemale: '[data-cy="radio-gender-female"]',
    veteranYes: '[data-cy="radio-veteran-yes"]',
    veteranNo: '[data-cy="radio-veteran-no"]',

    // Additional Info
    maritalStatus: '[data-cy="select-marital-status"]',
    firstLanguage: '[data-cy="select-first-language"]',
    religion: '[data-cy="select-religion"]',
    religionOtherText: '[data-cy="input-religion-other-text"]',
    ethnicity: '[data-cy="select-his-ethnicity"]',
    ethnicityHope: '[data-cy="select-hope-ethnicity"]',
    raceHope: '[data-cy="select-hope-race"]',

    // Contact Info
    phoneNumber: 'ion-input[data-cy="input-phone"]',
    emailAddress: 'ion-input[data-cy="input-email"]',
    riskPriority: '[data-cy="select-risk-priority"]',
    emergencyPreparedness: '[data-cy="textarea-emergengy-preparedness"]',

    // Address
    streetAddress: 'ion-input[data-cy="input-street-address"]',
    city: 'ion-input[data-cy="input-city"]',
    state: '[data-cy="select-state"]',
    stateOption: (state: string) => `ion-popover [ng-reflect-value="${state}"]`,
    zipCode: 'ion-input[data-cy="input-zip"]',
    zipCodeExt: 'ion-input[data-cy="input-zip-code-ext"]',
    county: 'ion-input[data-cy="input-county"]',
    sameAddress: '[data-cy="checkbox-same-address"]',

    // Referral Location
    locationType: '[data-cy="select-location-type"]',
    locationTypeValue: '[data-cy="input-location-type"]',
    locationTypeValueCheck: '[data-cy="input-location-type-value-check"]',

    // Referral Address (when creating new referral location)
    referralName: '[data-cy="input-referral-name"]',
    referralStreetAddress: '[data-cy="input-address-1-referral"]',
    referralCity: '[data-cy="input-referral-city"]',
    referralState: '[data-cy="select-state"]',
    referralZip: '[data-cy="input-referral-zip"]',
    referralZipCodeExt: '[data-cy="input-referral-zip-code-ext"]',
    referralCounty: '[data-cy="input-country"]',
    referralPhone: '[data-cy="input-referral-phone"]',
    referralEmailAddress: '[data-cy="input-referral-email-address"]',

    // Living Will
    livingWillYes: '[data-cy="radio-living-will-yes"]',
    livingWillNo: '[data-cy="radio-living-will-no"]',

    // Hospice Specific
    skilledBedYes: '[data-cy="radio-skilled-bed-yes"]',
    skilledBedNo: '[data-cy="radio-skilled-bed-no"]',
    daysRemaining: '[data-cy="select-days-remaining"]',
    roomNumber: '[data-cy="input-room-number"]',

    // Actions
    saveButton: '[data-cy="btn-add-patient-save"]',
    cancelButton: '[data-cy="btn-add-patient-cancel"]',
  };

  constructor(page: Page) {
    super(page);
  }

  /**
   * Click Add Patient button
   */
  async clickAddPatient(): Promise<void> {
    await this.waitForElement(this.selectors.addPatientButton);
    await this.page.locator(this.selectors.addPatientButton).click();
    console.log('✅ Clicked Add Patient button');
  }

  /**
   * Select care type
   */
  async selectCareType(careType: CareType): Promise<void> {
    let selector: string;

    switch (careType) {
      case 'Hospice':
        selector = this.selectors.careTypeHospice;
        break;
      case 'Palliative':
        selector = this.selectors.careTypePalliative;
        break;
      case 'Evaluation':
        selector = this.selectors.careTypeEvaluation;
        break;
      default:
        throw new Error(`Invalid care type: ${careType}`);
    }

    await this.waitForElement(selector);
    await this.page.locator(selector).click();
    console.log(`✅ Selected care type: ${careType}`);
  }

  /**
   * Fill patient demographics section
   */
  async fillDemographics(patientData: PatientData): Promise<void> {
    const { demographics } = patientData;

    // First Name
    await this.page.locator(this.selectors.firstName).fill(demographics.firstName);

    // Last Name
    await this.page.locator(this.selectors.lastName).fill(demographics.lastName);

    // Middle Initial (optional)
    if (demographics.middleInitial) {
      await this.page.locator(this.selectors.middleInitial).fill(demographics.middleInitial);
    }

    // Nickname (optional)
    if (demographics.nickname) {
      await this.page.locator(this.selectors.nickname).fill(demographics.nickname);
    }

    // SSN
    await this.page.locator(this.selectors.ssn).fill(demographics.ssn);

    // Date of Birth
    await this.page.locator(this.selectors.dateOfBirth).dblclick();
    await this.page.locator(`${this.selectors.dateOfBirth} input`).fill(demographics.dateOfBirth);
    await this.page.locator(`${this.selectors.dateOfBirth} input`).press('Enter');
    await this.page.waitForTimeout(500);
     await this.page.locator(this.selectors.dateOfBirth).click();
        await this.page.waitForTimeout(1000);
        console.log(`Setting start date: ${demographics.dateOfBirth}`);
        await DateHelper.selectDateFormatted(this.page, demographics.dateOfBirth);

    // Gender
    if (demographics.gender === 'Male') {
      await this.page.locator(this.selectors.genderMale).click();
    } else {
      await this.page.locator(this.selectors.genderFemale).click();
    }

    // Veteran Status
    if (demographics.veteran) {
      await this.page.locator(this.selectors.veteranYes).click();
    } else {
      await this.page.locator(this.selectors.veteranNo).click();
    }

    console.log(`✅ Filled demographics: ${demographics.firstName} ${demographics.lastName}`);
  }

  /**
   * Fill additional info (marital status, language, religion, ethnicity)
   */
  async fillAdditionalInfo(patientData: PatientData): Promise<void> {
    if (!patientData.additionalInfo) return;

    const { additionalInfo } = patientData;

    // Marital Status
    if (additionalInfo.maritalStatus) {
      await this.page.locator(this.selectors.maritalStatus).click();
      await this.page.waitForTimeout(500);
      await this.page.locator('ion-list ion-item').nth(1).click();
    }

    // First Language
    if (additionalInfo.firstLanguage) {
      await this.page.locator(this.selectors.firstLanguage).click();
      await this.page.waitForTimeout(500);
      await this.page.locator('ion-list ion-item').nth(1).click();
    }

    // Religion
    if (additionalInfo.religion) {
      await this.page.locator(this.selectors.religion).click();
      await this.page.waitForTimeout(500);
      await this.page.locator('ion-list ion-item').nth(1).click();
    }

    // Ethnicity (HIS)
    if (additionalInfo.ethnicity) {
      await this.page.locator(this.selectors.ethnicity).click();
      await this.page.waitForTimeout(500);
      await this.page.locator('ng-dropdown-panel>div>div>div').nth(1).click();
    }

    // Ethnicity (HOPE)
    if (additionalInfo.ethnicityHope) {
      await this.page.locator(this.selectors.ethnicityHope).click();
      await this.page.waitForTimeout(500);
      await this.page.locator('ng-dropdown-panel>div>div>div').nth(1).click();
    }

    // Race (HOPE)
    if (additionalInfo.raceHope) {
      await this.page.locator(this.selectors.raceHope).click();
      await this.page.waitForTimeout(500);
      await this.page.locator('ng-dropdown-panel>div>div>div').nth(1).click();
    }

    console.log('✅ Filled additional info');
  }

  /**
   * Fill contact information
   */
  async fillContactInfo(patientData: PatientData): Promise<void> {
    const { contactInfo } = patientData;

    // Phone Number - ion-input requires targeting the input inside
    await this.page.locator(`${this.selectors.phoneNumber} input`).fill(contactInfo.phoneNumber);

    // Email Address - ion-input requires targeting the input inside
    await this.page.locator(`${this.selectors.emailAddress} input`).fill(contactInfo.emailAddress);

    console.log('✅ Filled contact info');
  }

  /**
   * Fill address information
   */
  async fillAddress(patientData: PatientData): Promise<void> {
    const { address } = patientData;

    // Street Address - ion-input requires targeting the input inside
    await this.page.locator(`${this.selectors.streetAddress} input`).fill(address.streetAddress);

    // City - ion-input requires targeting the input inside
    await this.page.locator(`${this.selectors.city} input`).fill(address.city);

    // State
    await this.page.locator(this.selectors.state).click();
    await this.page.waitForTimeout(500);
    await this.page.locator(this.selectors.stateOption(address.state)).scrollIntoViewIfNeeded();
    await this.page.locator(this.selectors.stateOption(address.state)).click();

    // Zip Code - ion-input requires targeting the input inside
    await this.page.locator(`${this.selectors.zipCode} input`).fill(address.zipCode);

    // Zip Code Extension (optional) - ion-input requires targeting the input inside
    if (address.zipCodeExt) {
      await this.page.locator(`${this.selectors.zipCodeExt} input`).fill(address.zipCodeExt);
    }

    // Same Address checkbox (service address same as home)
    if (address.sameAddress) {
      await this.page.locator(this.selectors.sameAddress).click({ force: true });
      await this.page.waitForTimeout(500);
    }

    console.log('✅ Filled address info');
  }

  /**
   * Fill Hospice-specific fields
   */
  async fillHospiceSpecificFields(skilledBed: boolean): Promise<void> {
    if (skilledBed) {
      await this.page.locator(this.selectors.skilledBedYes).click();
    } else {
      await this.page.locator(this.selectors.skilledBedNo).click();
    }
    console.log(`✅ Set skilled bed: ${skilledBed}`);
  }

  /**
   * Save patient
   */
  async savePatient(): Promise<void> {
    await this.page.locator(this.selectors.saveButton).click();
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(2000);
    console.log('✅ Patient saved successfully');
  }

  /**
   * Search for patient
   */
  async searchPatient(searchTerm: string): Promise<void> {
    await this.waitForElement(this.selectors.searchBar);
    // ion-searchbar requires targeting the input inside
    await this.page.locator(`${this.selectors.searchBar} input`).fill(searchTerm);
    await this.page.locator(`${this.selectors.searchBar} input`).press('Enter');
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(3000);
    console.log(`✅ Searched for patient: ${searchTerm}`);
  }

  /**
   * Get patient from grid by index
   */
  async getPatientFromGrid(index: number = 0): Promise<void> {
    const patientSelector = this.selectors.patientItem(index);
    await this.waitForElement(patientSelector);
    await this.page.locator(patientSelector).click();
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(1000);
    console.log(`✅ Clicked patient at index: ${index}`);
  }

  /**
   * Verify patient exists in grid
   */
  async verifyPatientInGrid(index: number = 0): Promise<boolean> {
    const patientSelector = this.selectors.patientItem(index);
    return await this.isElementVisible(patientSelector);
  }

  /**
   * Get patient chart ID from the grid
   * @returns Patient chart ID as string, or null if not found
   */
  async getPatientChartId(): Promise<string | null> {
    try {
      await this.waitForElement(this.selectors.PatientchartId, 10000);
      const chartIdText = await this.page.locator(this.selectors.PatientchartId).textContent();
      return chartIdText?.trim() || null;
    } catch (error) {
      console.error('Failed to get patient chart ID:', error);
      return null;
    }
  }

  /**
   * Get patient name from grid by index
   * Extracts the patient's name from the grid row
   * @param index - Row index (0-based)
   * @returns Object with firstName and lastName, or null if not found
   */
  async getPatientNameFromGrid(index: number): Promise<{ firstName: string; lastName: string } | null> {
    const patientSelector = this.selectors.patientItem(index);

    try {
      await this.waitForElement(patientSelector, 5000);
      const patientRow = this.page.locator(patientSelector);

      // Get all cells from the row
      // Grid structure: MRN | ID | Last Name | First Name | Team | Type of Care | Status
      const cells = await patientRow.locator('td, ion-col, [class*="col"]').allTextContents();

      if (cells.length >= 4) {
        return {
          lastName: cells[2]?.trim() || '',   // Last Name column (index 2)
          firstName: cells[3]?.trim() || ''   // First Name column (index 3)
        };
      }

      return null;
    } catch (error) {
      console.error(`Failed to get patient name at index ${index}`);
      return null;
    }
  }

  /**
   * Get all patient names from current grid page
   * @returns Array of patient name objects with their indices
   */
  async getAllPatientNamesFromGrid(): Promise<Array<{ firstName: string; lastName: string; index: number }>> {
    const patients: Array<{ firstName: string; lastName: string; index: number }> = [];

    // Try to get up to 20 patients (reasonable page size)
    for (let i = 0; i < 20; i++) {
      const patientSelector = this.selectors.patientItem(i);
      const exists = await this.isElementVisible(patientSelector);

      if (!exists) break; // No more patients

      const name = await this.getPatientNameFromGrid(i);
      if (name && (name.firstName || name.lastName)) {
        patients.push({ ...name, index: i });
      }
    }

    console.log(`📋 Found ${patients.length} patients in grid`);
    return patients;
  }

  /**
   * Verify if a specific patient name exists in the grid
   * @param searchTerm - Name to search for (can match first name, last name, or full name)
   * @returns Object with found status, index, and match details
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

      // Check for exact or partial matches
      if (firstNameLower.includes(searchLower) || searchLower.includes(firstNameLower)) {
        return {
          found: true,
          index: patient.index,
          matchedName: `${patient.firstName} ${patient.lastName}`,
          matchType: 'firstName'
        };
      }

      if (lastNameLower.includes(searchLower) || searchLower.includes(lastNameLower)) {
        return {
          found: true,
          index: patient.index,
          matchedName: `${patient.firstName} ${patient.lastName}`,
          matchType: 'lastName'
        };
      }

      if (fullNameLower.includes(searchLower) || reverseFullNameLower.includes(searchLower)) {
        return {
          found: true,
          index: patient.index,
          matchedName: `${patient.firstName} ${patient.lastName}`,
          matchType: 'fullName'
        };
      }
    }

    return { found: false, index: -1 };
  }
}
