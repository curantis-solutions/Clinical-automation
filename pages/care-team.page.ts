import { Page } from '@playwright/test';
import { BasePage } from './base.page';
import { DateHelper } from '../utils/date-helper';

/**
 * Care Team Page Object
 * Handles care team management: adding team members, attending physicians, caregivers
 */

export interface CaregiverData {
  relation: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

export class CareTeamPage extends BasePage {
  private readonly selectors = {
    // Navigation
    careTeamNavBarItem: '[data-cy="btn-nav-bar-item-care-team"]',

    // Team Selection
    teamCare: '[data-cy="select-care-team"]',
    teamCareOption: (index: number) => `[data-cy="input-filtered-options-${index}"]`,
    searchInput: '[data-cy="input-search-input"]',

    // Care Team Role Management
    addCareTeamRole: '[data-cy="btn-add-care-team-role"]',
    careTeamRole: '[data-cy="select-team-role"]',
    member: '[data-cy="select-person"]',

    // Role Options Buttons
    socialWorkerOptions: "[data-cy='btn-current-physician-options-Social Worker']",
    spiritualAdvisorOptions: "[data-cy='btn-current-physician-options-Spiritual Advisor']",
    registeredNurseOptions: "[data-cy='btn-current-physician-options-Registered Nurse']",
    medicalDirectorOptions: "[data-cy='btn-current-physician-options-Medical Director']",
    addRoleOption: "[data-cy='btn-add-option']",

    // Attending Physician
    addAttendingPhysician: '[data-cy="btn-add-physician"]',
    editAttendingPhysician: '[data-cy="btn-current-physician-0"]',
    clickEditAttendingPhysician: '[data-cy="btn-edit-option"]',
    selectAttPhysician: '[data-cy="select-select-physician"]',
    searchAttPhysician: '[data-cy="input-search-input"]',
    selectAttPhysicianlist: 'div[class="option"][data-cy*="input-filtered-options"]',
    startDatePhysician: '[data-cy="datetime-picker-start"]',
    dateValue: '#date-value',
    attPhysicianDone: '[data-cy="btn-done"]',

    // Caregiver/Family
    addCaregiver: '[data-cy="btn-add-caregiver"]',
    relationShip: '[data-cy="select-relationship"]',
    selectRelationlist: 'div[class="option"][data-cy*="input-filtered-options"]',
    firstName: '[data-cy="input-first-name"]',
    lastName: '[data-cy="input-last-name"]',
    phone: '[data-cy="input-phone"]',
    primaryContact: '[data-cy="checkbox-primary-contact"]',
    address: '[data-cy="input-address"]',
    city: '[data-cy="input-city"]',
    state: '[data-cy="select-state"]',
    zipCode: '[data-cy="input-zipcode"]',
    zipExtension: '[data-cy="input-zip-extension"]',

    // Common Buttons
    done: '[data-cy="btn-done"]',
    cancel: '[data-cy="btn-cancel"]',
    save: '[data-cy="btn-save"]',
  };

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to Care Team tab
   */
  async navigateToCareTeamTab(): Promise<void> {
    await this.page.waitForTimeout(2000);
    await this.waitForElement(this.selectors.careTeamNavBarItem);
    await this.page.locator(this.selectors.careTeamNavBarItem).click();
    await this.page.waitForTimeout(5000);
    console.log('✅ Navigated to Care Team tab');
  }

  /**
   * Select care team
   * @param teamName - Name of the team to search and select
   */
  async selectCareTeam(teamName: string): Promise<void> {
    console.log(`📋 Selecting care team: ${teamName}`);

    await this.page.locator(this.selectors.teamCare).click();
    await this.page.waitForTimeout(1000);

    await this.page.locator(this.selectors.searchInput).click();
    await this.page.locator(this.selectors.searchInput).fill(teamName);
    await this.page.waitForTimeout(1000);

    await this.page.locator(this.selectors.teamCareOption(0)).click();
    await this.page.waitForTimeout(1000);

    console.log(`✅ Selected care team: ${teamName}`);
  }

  /**
   * Add a team role member
   * @param roleSelector - Selector for the role options button (e.g., socialWorkerOptions)
   * @param memberIndex - Index of the member to select (default: 0)
   */
  private async addTeamRoleMember(roleSelector: string, memberIndex: number = 0): Promise<void> {
    await this.page.locator(roleSelector).click();
    await this.page.waitForTimeout(1000);

    await this.page.locator(this.selectors.addRoleOption).click();
    await this.page.waitForTimeout(1000);

    await this.page.locator(this.selectors.member).click();
    await this.page.waitForTimeout(1000);

    await this.page.locator(this.selectors.teamCareOption(memberIndex)).click({ force: true });
    await this.page.waitForTimeout(1000);

    await this.page.locator(this.selectors.done).click({ force: true });
    await this.page.waitForTimeout(1000);
  }

  /**
   * Add Social Worker to care team
   */
  async addSocialWorker(memberIndex: number = 0): Promise<void> {
    console.log('📋 Adding Social Worker...');
    await this.addTeamRoleMember(this.selectors.socialWorkerOptions, memberIndex);
    console.log('✅ Social Worker added');
  }

  /**
   * Add Spiritual Advisor to care team
   */
  async addSpiritualAdvisor(memberIndex: number = 0): Promise<void> {
    console.log('📋 Adding Spiritual Advisor...');
    await this.addTeamRoleMember(this.selectors.spiritualAdvisorOptions, memberIndex);
    console.log('✅ Spiritual Advisor added');
  }

  /**
   * Add Registered Nurse to care team
   */
  async addRegisteredNurse(memberIndex: number = 0): Promise<void> {
    console.log('📋 Adding Registered Nurse...');
    await this.addTeamRoleMember(this.selectors.registeredNurseOptions, memberIndex);
    console.log('✅ Registered Nurse added');
  }

  /**
   * Add Medical Director to care team
   */
  async addMedicalDirector(memberIndex: number = 0): Promise<void> {
    console.log('📋 Adding Medical Director...');
    await this.addTeamRoleMember(this.selectors.medicalDirectorOptions, memberIndex);
    console.log('✅ Medical Director added');
  }

  /**
   * Complete care team setup with all roles
   * @param teamName - Name of the team to select
   */
  async completeCareTeam(teamName: string): Promise<void> {
    console.log('\n🏥 Completing Care Team setup...');

    await this.navigateToCareTeamTab();
    await this.selectCareTeam(teamName);
    await this.addSocialWorker();
    await this.addSpiritualAdvisor();
    await this.addRegisteredNurse();
    await this.addMedicalDirector();

    console.log('✅ Care Team completed successfully\n');
  }

  /**
   * Add Attending Physician
   * @param physicianName - Name of the physician to search and select
   * @param startDate - Start date in MM/DD/YYYY format
   */
  async addAttendingPhysician(physicianName: string, startDate: string): Promise<void> {
    console.log(`📋 Adding Attending Physician: ${physicianName}`);

    await this.page.locator(this.selectors.addAttendingPhysician).scrollIntoViewIfNeeded();
    await this.page.locator(this.selectors.addAttendingPhysician).click();
    await this.page.waitForTimeout(2000);

    // Select physician
    await this.page.locator(this.selectors.selectAttPhysician).click();
    await this.page.waitForTimeout(6000);

    await this.page.locator(this.selectors.searchAttPhysician).click();
    await this.page.locator(this.selectors.searchAttPhysician).fill(physicianName);
    await this.page.waitForTimeout(1000);

    await this.page.locator(this.selectors.selectAttPhysicianlist)
      .filter({ hasText: new RegExp(physicianName, 'i') })
      .first()
      .click();
    await this.page.waitForTimeout(1000);

    // Set start date
    await this.page.locator(this.selectors.dateValue).click();
    await this.page.waitForTimeout(1000);
    console.log(`Setting start date: ${startDate}`);
    await DateHelper.selectDateFormatted(this.page, startDate);

    // Save
    await this.page.locator(this.selectors.attPhysicianDone).click({ force: true });
    await this.page.waitForTimeout(1000);

    console.log('✅ Attending Physician added successfully');
  }

  /**
   * Add Caregiver/Family member
   * @param caregiverData - Caregiver information (relation is required, other fields optional)
   */
  async addCaregiver(caregiverData: CaregiverData): Promise<void> {
    console.log(`📋 Adding Caregiver: ${caregiverData.relation}`);

    await this.page.locator(this.selectors.addCaregiver).click();
    await this.page.waitForTimeout(1000);

    // Select relationship
    await this.page.locator(this.selectors.relationShip).click();
    await this.page.waitForTimeout(1000);
    await this.page.locator(this.selectors.selectRelationlist)
      .filter({ hasText: caregiverData.relation })
      .first()
      .click();

    // Fill caregiver details with provided data or defaults
    const firstName = caregiverData.firstName || 'Test';
    await this.page.locator(this.selectors.firstName).click();
    await this.page.locator(this.selectors.firstName).fill(firstName);
    await this.page.waitForTimeout(1000);

    const lastName = caregiverData.lastName || 'Caregiver';
    await this.page.locator(this.selectors.lastName).click();
    await this.page.locator(this.selectors.lastName).fill(lastName);
    await this.page.waitForTimeout(1000);

    const phone = caregiverData.phone || '2144533456';
    await this.page.locator(this.selectors.phone).click();
    await this.page.locator(this.selectors.phone).fill(phone);

    // Set as primary contact
    await this.page.locator(this.selectors.primaryContact).click();
    await this.page.waitForTimeout(1000);

    // Fill address with provided data or defaults
    const address = caregiverData.address || '123 Main St';
    await this.page.locator(this.selectors.address).click();
    await this.page.locator(this.selectors.address).fill(address);

    const city = caregiverData.city || 'Irving';
    await this.page.locator(this.selectors.city).click();
    await this.page.locator(this.selectors.city).fill(city);

    // Select state
    const state = caregiverData.state || 'TX';
    await this.page.locator(this.selectors.state).click();
    await this.page.waitForTimeout(1000);
    await this.page.getByText(state, { exact: true }).click();

    const zipCode = caregiverData.zipCode || '75212';
    await this.page.locator(this.selectors.zipCode).click();
    await this.page.locator(this.selectors.zipCode).fill(zipCode);

    // Save
    await this.page.locator(this.selectors.done).click({ force: true });
    await this.page.waitForTimeout(1000);

    console.log('✅ Caregiver added successfully');
  }
}
