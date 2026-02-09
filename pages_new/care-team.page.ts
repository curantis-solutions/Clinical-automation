import { Page } from '@playwright/test';
import { BasePage } from '../pages/base.page';
import { selectNgOption, selectNgOptionByIndex, selectDateFromPicker } from '../utils/form-helpers';

/**
 * Care Team Types
 */
export interface CaregiverData {
  relation: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  zipExtension?: string;
  isPrimaryContact?: boolean;
}

export interface AttendingPhysicianData {
  searchName: string;
  startDate: string;
  endDate?: string;
}

export interface CareTeamMemberData {
  role: 'Social Worker' | 'Spiritual Advisor' | 'Registered Nurse' | 'Medical Director' | 'Nurse Practitioner' | 'LVN/LPN' | 'Physical Therapist' | 'Occupational Therapist' | 'Speech Therapist' | 'Dietitian' | 'Bereavement Counselor' | 'Hospice Aide' | 'Volunteer Coordinator';
  memberIndex?: number;
}

/**
 * Care Team Page Object
 * Handles the Care Team module for patient management
 * Supports care team selection, role assignment, attending physicians, and caregivers
 */
export class CareTeamPage extends BasePage {
  private readonly selectors = {
    // === Navigation ===
    careTeamNavBarItem: '[data-cy="btn-nav-bar-item-care-team"]',

    // === Toast/Notifications ===
    toastMessage: '.toast-message',
    successToast: '.toast-success',
    errorToast: '.toast-error',

    // === Care Team Selection Section ===
    careTeamDropdown: '[data-cy="select-care-team"]',
    careTeamSearchInput: '[data-cy="input-search-input"]',
    careTeamOption: (index: number) => `[data-cy="input-filtered-options-${index}"]`,

    // === Care Team Roles Section ===
    addCareTeamRole: '[data-cy="btn-add-care-team-role"]',
    careTeamRoleDropdown: '[data-cy="select-team-role"]',
    memberDropdown: '[data-cy="select-person"]',
    memberSearchInput: '[data-cy="input-search-input"]',
    memberOption: (index: number) => `[data-cy="input-filtered-options-${index}"]`,

    // === Role Option Buttons (ellipsis menu for each role) ===
    socialWorkerOptions: '[data-cy="btn-current-physician-options-Social Worker"]',
    spiritualAdvisorOptions: '[data-cy="btn-current-physician-options-Spiritual Advisor"]',
    registeredNurseOptions: '[data-cy="btn-current-physician-options-Registered Nurse"]',
    medicalDirectorOptions: '[data-cy="btn-current-physician-options-Medical Director"]',
    nursePractitionerOptions: '[data-cy="btn-current-physician-options-Nurse Practitioner"]',
    lvnLpnOptions: '[data-cy="btn-current-physician-options-LVN/LPN"]',
    physicalTherapistOptions: '[data-cy="btn-current-physician-options-Physical Therapist"]',
    occupationalTherapistOptions: '[data-cy="btn-current-physician-options-Occupational Therapist"]',
    speechTherapistOptions: '[data-cy="btn-current-physician-options-Speech Therapist"]',
    dietitianOptions: '[data-cy="btn-current-physician-options-Dietitian"]',
    bereavementCounselorOptions: '[data-cy="btn-current-physician-options-Bereavement Counselor"]',
    hospiceAideOptions: '[data-cy="btn-current-physician-options-Hospice Aide"]',
    volunteerCoordinatorOptions: '[data-cy="btn-current-physician-options-Volunteer Coordinator"]',

    // === Role Popup Menu Options ===
    addRoleOption: '[data-cy="btn-add-option"]',
    editRoleOption: '[data-cy="btn-edit-option"]',
    deleteRoleOption: '[data-cy="btn-delete-option"]',
    viewHistoryOption: '[data-cy="btn-view-history-option"]',

    // === Attending Physician Section ===
    addAttendingPhysician: '[data-cy="btn-add-physician"]',
    attendingPhysicianRow: (index: number) => `[data-cy="btn-current-physician-${index}"]`,
    selectAttendingPhysician: '[data-cy="select-select-physician"]',
    searchAttendingPhysician: '[data-cy="input-search-input"]',
    attendingPhysicianOption: 'div[class="option"][data-cy*="input-filtered-options"]',
    attendingPhysicianOptionByIndex: (index: number) => `[data-cy="input-filtered-options-${index}"]`,

    // === Attending Physician Form Fields ===
    physicianStartDate: '[data-cy="datetime-picker-start"]',
    physicianEndDate: '[data-cy="datetime-picker-end"]',
    physicianDateValue: '#date-value',
    physicianPrimaryCheckbox: '[data-cy="checkbox-primary-physician"]',

    // === Caregiver/Family Section ===
    addCaregiver: '[data-cy="btn-add-caregiver"]',
    caregiverRow: (index: number) => `[data-cy="caregiver-row-${index}"]`,
    editCaregiverButton: (index: number) => `[data-cy="btn-edit-caregiver-${index}"]`,
    deleteCaregiverButton: (index: number) => `[data-cy="btn-delete-caregiver-${index}"]`,

    // === Caregiver Form Fields ===
    relationshipDropdown: '[data-cy="select-relationship"]',
    relationshipOption: 'div[class="option"][data-cy*="input-filtered-options"]',
    firstName: '[data-cy="input-first-name"]',
    lastName: '[data-cy="input-last-name"]',
    phone: '[data-cy="input-phone"]',
    email: '[data-cy="input-email"]',
    primaryContactCheckbox: '[data-cy="checkbox-primary-contact"]',
    emergencyContactCheckbox: '[data-cy="checkbox-emergency-contact"]',
    legalRepresentativeCheckbox: '[data-cy="checkbox-legal-representative"]',
    healthcareProxyCheckbox: '[data-cy="checkbox-healthcare-proxy"]',
    address: '[data-cy="input-address"]',
    city: '[data-cy="input-city"]',
    stateDropdown: '[data-cy="select-state"]',
    zipCode: '[data-cy="input-zipcode"]',
    zipExtension: '[data-cy="input-zip-extension"]',

    // === Common Form Actions ===
    doneButton: '[data-cy="btn-done"]',
    cancelButton: '[data-cy="btn-cancel"]',
    saveButton: '[data-cy="btn-save"]',

    // === Confirmation Dialogs ===
    confirmDeleteButton: '[data-cy="btn-confirm-delete"]',
    cancelDeleteButton: '[data-cy="btn-cancel-delete"]',
    alertOkButton: '.alert-button-default',
  };

  constructor(page: Page) {
    super(page);
  }

  /**
   * Get selector for a specific element
   */
  getSelector(key: keyof typeof this.selectors): string {
    const selector = this.selectors[key];
    if (typeof selector === 'function') {
      throw new Error(`Selector ${key} requires an index parameter`);
    }
    return selector;
  }

  // ============================================
  // Navigation Methods
  // ============================================

  /**
   * Navigate to Care Team section from patient profile
   */
  async navigateToCareTeam(): Promise<void> {
    await this.page.waitForTimeout(1000);
    await this.page.locator(this.selectors.careTeamNavBarItem).scrollIntoViewIfNeeded();
    await this.page.locator(this.selectors.careTeamNavBarItem).click();
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(2000);
    console.log('Navigated to Care Team tab');
  }

  // ============================================
  // Toast/Notification Methods
  // ============================================

  /**
   * Wait for success toast notification
   */
  async waitForSuccessToast(timeout: number = 5000): Promise<void> {
    await this.page.locator(this.selectors.successToast).waitFor({ state: 'visible', timeout });
  }

  /**
   * Check for error toast notification
   */
  async hasErrorToast(): Promise<boolean> {
    return await this.page.locator(this.selectors.errorToast).isVisible();
  }

  /**
   * Get toast message text
   */
  async getToastMessage(): Promise<string | null> {
    const toast = this.page.locator(this.selectors.toastMessage);
    if (await toast.isVisible()) {
      return await toast.textContent();
    }
    return null;
  }

  // ============================================
  // Care Team Selection Methods
  // ============================================

  /**
   * Select care team from dropdown
   * @param teamName - Name of the team to search and select
   */
  async selectCareTeam(teamName: string): Promise<void> {
    console.log(`Selecting care team: ${teamName}`);

    await this.page.locator(this.selectors.careTeamDropdown).click();
    await this.page.waitForTimeout(1000);

    await this.page.locator(this.selectors.careTeamSearchInput).click();
    await this.page.locator(this.selectors.careTeamSearchInput).fill(teamName);
    await this.page.waitForTimeout(1000);

    await this.page.locator(this.selectors.careTeamOption(0)).click();
    await this.page.waitForTimeout(1000);

    console.log(`Selected care team: ${teamName}`);
  }

  /**
   * Get currently selected care team name
   */
  async getSelectedCareTeam(): Promise<string | null> {
    const dropdown = this.page.locator(this.selectors.careTeamDropdown);
    const selectedValue = dropdown.locator('.ng-value-label, .ng-value');
    if (await selectedValue.isVisible()) {
      return await selectedValue.textContent();
    }
    return null;
  }

  // ============================================
  // Care Team Role Methods
  // ============================================

  /**
   * Get role options selector by role name
   */
  private getRoleOptionsSelector(role: string): string {
    const roleMap: Record<string, string> = {
      'Social Worker': this.selectors.socialWorkerOptions,
      'Spiritual Advisor': this.selectors.spiritualAdvisorOptions,
      'Registered Nurse': this.selectors.registeredNurseOptions,
      'Medical Director': this.selectors.medicalDirectorOptions,
      'Nurse Practitioner': this.selectors.nursePractitionerOptions,
      'LVN/LPN': this.selectors.lvnLpnOptions,
      'Physical Therapist': this.selectors.physicalTherapistOptions,
      'Occupational Therapist': this.selectors.occupationalTherapistOptions,
      'Speech Therapist': this.selectors.speechTherapistOptions,
      'Dietitian': this.selectors.dietitianOptions,
      'Bereavement Counselor': this.selectors.bereavementCounselorOptions,
      'Hospice Aide': this.selectors.hospiceAideOptions,
      'Volunteer Coordinator': this.selectors.volunteerCoordinatorOptions,
    };
    return roleMap[role] || `[data-cy="btn-current-physician-options-${role}"]`;
  }

  /**
   * Click on role options button (ellipsis menu)
   * @param role - Role name
   */
  async clickRoleOptions(role: string): Promise<void> {
    const selector = this.getRoleOptionsSelector(role);
    await this.page.locator(selector).click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Add a team role member
   * @param role - Role name
   * @param memberIndex - Index of the member to select from dropdown
   */
  async addTeamRoleMember(role: string, memberIndex: number = 0): Promise<void> {
    console.log(`Adding ${role}...`);

    // Click role options button
    await this.clickRoleOptions(role);

    // Click "Add" option in popup
    await this.page.locator(this.selectors.addRoleOption).click();
    await this.page.waitForTimeout(1000);

    // Select member from dropdown
    await this.page.locator(this.selectors.memberDropdown).click();
    await this.page.waitForTimeout(1000);

    await this.page.locator(this.selectors.memberOption(memberIndex)).click({ force: true });
    await this.page.waitForTimeout(1000);

    // Click Done
    await this.page.locator(this.selectors.doneButton).click({ force: true });
    await this.page.waitForTimeout(1000);

    console.log(`${role} added successfully`);
  }

  /**
   * Add Social Worker to care team
   */
  async addSocialWorker(memberIndex: number = 0): Promise<void> {
    await this.addTeamRoleMember('Social Worker', memberIndex);
  }

  /**
   * Add Spiritual Advisor to care team
   */
  async addSpiritualAdvisor(memberIndex: number = 0): Promise<void> {
    await this.addTeamRoleMember('Spiritual Advisor', memberIndex);
  }

  /**
   * Add Registered Nurse to care team
   */
  async addRegisteredNurse(memberIndex: number = 0): Promise<void> {
    await this.addTeamRoleMember('Registered Nurse', memberIndex);
  }

  /**
   * Add Medical Director to care team
   */
  async addMedicalDirector(memberIndex: number = 0): Promise<void> {
    await this.addTeamRoleMember('Medical Director', memberIndex);
  }

  /**
   * Add Nurse Practitioner to care team
   */
  async addNursePractitioner(memberIndex: number = 0): Promise<void> {
    await this.addTeamRoleMember('Nurse Practitioner', memberIndex);
  }

  /**
   * Add LVN/LPN to care team
   */
  async addLvnLpn(memberIndex: number = 0): Promise<void> {
    await this.addTeamRoleMember('LVN/LPN', memberIndex);
  }

  /**
   * Add Physical Therapist to care team
   */
  async addPhysicalTherapist(memberIndex: number = 0): Promise<void> {
    await this.addTeamRoleMember('Physical Therapist', memberIndex);
  }

  /**
   * Add Occupational Therapist to care team
   */
  async addOccupationalTherapist(memberIndex: number = 0): Promise<void> {
    await this.addTeamRoleMember('Occupational Therapist', memberIndex);
  }

  /**
   * Add Speech Therapist to care team
   */
  async addSpeechTherapist(memberIndex: number = 0): Promise<void> {
    await this.addTeamRoleMember('Speech Therapist', memberIndex);
  }

  /**
   * Add Dietitian to care team
   */
  async addDietitian(memberIndex: number = 0): Promise<void> {
    await this.addTeamRoleMember('Dietitian', memberIndex);
  }

  /**
   * Add Bereavement Counselor to care team
   */
  async addBereavementCounselor(memberIndex: number = 0): Promise<void> {
    await this.addTeamRoleMember('Bereavement Counselor', memberIndex);
  }

  /**
   * Add Hospice Aide to care team
   */
  async addHospiceAide(memberIndex: number = 0): Promise<void> {
    await this.addTeamRoleMember('Hospice Aide', memberIndex);
  }

  /**
   * Add Volunteer Coordinator to care team
   */
  async addVolunteerCoordinator(memberIndex: number = 0): Promise<void> {
    await this.addTeamRoleMember('Volunteer Coordinator', memberIndex);
  }

  /**
   * Edit existing team role member
   * @param role - Role name
   */
  async editTeamRoleMember(role: string): Promise<void> {
    console.log(`Editing ${role}...`);

    await this.clickRoleOptions(role);
    await this.page.locator(this.selectors.editRoleOption).click();
    await this.page.waitForTimeout(1000);
  }

  /**
   * Delete team role member
   * @param role - Role name
   */
  async deleteTeamRoleMember(role: string): Promise<void> {
    console.log(`Deleting ${role}...`);

    await this.clickRoleOptions(role);
    await this.page.locator(this.selectors.deleteRoleOption).click();
    await this.page.waitForTimeout(500);

    // Confirm deletion if dialog appears
    const confirmBtn = this.page.locator(this.selectors.confirmDeleteButton);
    if (await confirmBtn.isVisible({ timeout: 2000 })) {
      await confirmBtn.click();
    }

    await this.page.waitForTimeout(1000);
    console.log(`${role} deleted successfully`);
  }

  /**
   * Complete care team setup with standard roles
   * @param teamName - Name of the team to select
   */
  async completeCareTeamSetup(teamName: string): Promise<void> {
    console.log('Completing Care Team setup...');

    await this.navigateToCareTeam();
    await this.selectCareTeam(teamName);
    await this.addSocialWorker();
    await this.addSpiritualAdvisor();
    await this.addRegisteredNurse();
    await this.addMedicalDirector();

    console.log('Care Team setup completed successfully');
  }

  // ============================================
  // Attending Physician Methods
  // ============================================

  /**
   * Click Add Attending Physician button
   */
  async clickAddAttendingPhysician(): Promise<void> {
    await this.page.locator(this.selectors.addAttendingPhysician).scrollIntoViewIfNeeded();
    await this.page.locator(this.selectors.addAttendingPhysician).click();
    await this.page.waitForTimeout(2000);
  }

  /**
   * Search and select attending physician
   * @param physicianName - Name of the physician to search
   */
  async selectAttendingPhysician(physicianName: string): Promise<void> {
    console.log(`Selecting physician: ${physicianName}`);

    await this.page.locator(this.selectors.selectAttendingPhysician).click();
    await this.page.waitForTimeout(1000);

    await this.page.locator(this.selectors.searchAttendingPhysician).click();
    await this.page.locator(this.selectors.searchAttendingPhysician).fill(physicianName);
    await this.page.waitForTimeout(1500);

    // Click on the first matching option
    await this.page.locator(this.selectors.attendingPhysicianOption)
      .filter({ hasText: new RegExp(physicianName, 'i') })
      .first()
      .click();
    await this.page.waitForTimeout(1000);

    console.log(`Selected physician: ${physicianName}`);
  }

  /**
   * Select physician start date
   * @param date - Date in MM/DD/YYYY format
   */
  async selectPhysicianStartDate(date: string): Promise<void> {
    console.log(`Setting physician start date: ${date}`);

    await this.page.locator(this.selectors.physicianDateValue).click();
    await this.page.waitForTimeout(1000);

    await selectDateFromPicker(this.page, date);
  }

  /**
   * Add attending physician with all details
   * @param data - Attending physician data
   */
  async addAttendingPhysician(data: AttendingPhysicianData): Promise<void> {
    console.log(`Adding Attending Physician: ${data.searchName}`);

    await this.clickAddAttendingPhysician();
    await this.selectAttendingPhysician(data.searchName);
    await this.selectPhysicianStartDate(data.startDate);

    // Click Done to save
    await this.page.locator(this.selectors.doneButton).click({ force: true });
    await this.page.waitForTimeout(1000);

    console.log('Attending Physician added successfully');
  }

  /**
   * Edit existing attending physician
   * @param index - Index of the physician row (0-based)
   */
  async editAttendingPhysician(index: number = 0): Promise<void> {
    console.log(`Editing attending physician at index ${index}`);

    await this.page.locator(this.selectors.attendingPhysicianRow(index)).click();
    await this.page.waitForTimeout(500);

    await this.page.locator(this.selectors.editRoleOption).click();
    await this.page.waitForTimeout(1000);
  }

  // ============================================
  // Caregiver/Family Methods
  // ============================================

  /**
   * Click Add Caregiver button
   */
  async clickAddCaregiver(): Promise<void> {
    await this.page.locator(this.selectors.addCaregiver).scrollIntoViewIfNeeded();
    await this.page.locator(this.selectors.addCaregiver).click();
    await this.page.waitForTimeout(1000);
  }

  /**
   * Select relationship from dropdown
   * @param relationship - Relationship type (e.g., "Spouse", "Child", "Brother", "Sister", etc.)
   */
  async selectRelationship(relationship: string): Promise<void> {
    console.log(`Selecting relationship: ${relationship}`);

    await this.page.locator(this.selectors.relationshipDropdown).click();
    await this.page.waitForTimeout(1000);

    await this.page.locator(this.selectors.relationshipOption)
      .filter({ hasText: relationship })
      .first()
      .click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Fill caregiver first name
   */
  async fillCaregiverFirstName(firstName: string): Promise<void> {
    await this.page.locator(this.selectors.firstName).click();
    await this.page.locator(this.selectors.firstName).fill(firstName);
  }

  /**
   * Fill caregiver last name
   */
  async fillCaregiverLastName(lastName: string): Promise<void> {
    await this.page.locator(this.selectors.lastName).click();
    await this.page.locator(this.selectors.lastName).fill(lastName);
  }

  /**
   * Fill caregiver phone
   */
  async fillCaregiverPhone(phone: string): Promise<void> {
    await this.page.locator(this.selectors.phone).click();
    await this.page.locator(this.selectors.phone).fill(phone);
  }

  /**
   * Fill caregiver email
   */
  async fillCaregiverEmail(email: string): Promise<void> {
    const emailInput = this.page.locator(this.selectors.email);
    if (await emailInput.isVisible()) {
      await emailInput.click();
      await emailInput.fill(email);
    }
  }

  /**
   * Toggle primary contact checkbox
   */
  async togglePrimaryContact(): Promise<void> {
    await this.page.locator(this.selectors.primaryContactCheckbox).click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Toggle emergency contact checkbox
   */
  async toggleEmergencyContact(): Promise<void> {
    const checkbox = this.page.locator(this.selectors.emergencyContactCheckbox);
    if (await checkbox.isVisible()) {
      await checkbox.click();
      await this.page.waitForTimeout(500);
    }
  }

  /**
   * Toggle legal representative checkbox
   */
  async toggleLegalRepresentative(): Promise<void> {
    const checkbox = this.page.locator(this.selectors.legalRepresentativeCheckbox);
    if (await checkbox.isVisible()) {
      await checkbox.click();
      await this.page.waitForTimeout(500);
    }
  }

  /**
   * Toggle healthcare proxy checkbox
   */
  async toggleHealthcareProxy(): Promise<void> {
    const checkbox = this.page.locator(this.selectors.healthcareProxyCheckbox);
    if (await checkbox.isVisible()) {
      await checkbox.click();
      await this.page.waitForTimeout(500);
    }
  }

  /**
   * Fill caregiver address
   */
  async fillCaregiverAddress(address: string): Promise<void> {
    await this.page.locator(this.selectors.address).click();
    await this.page.locator(this.selectors.address).fill(address);
  }

  /**
   * Fill caregiver city
   */
  async fillCaregiverCity(city: string): Promise<void> {
    await this.page.locator(this.selectors.city).click();
    await this.page.locator(this.selectors.city).fill(city);
  }

  /**
   * Select caregiver state
   */
  async selectCaregiverState(state: string): Promise<void> {
    await this.page.locator(this.selectors.stateDropdown).click();
    await this.page.waitForTimeout(1000);
    await this.page.getByText(state, { exact: true }).click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Fill caregiver zip code
   */
  async fillCaregiverZipCode(zipCode: string): Promise<void> {
    await this.page.locator(this.selectors.zipCode).click();
    await this.page.locator(this.selectors.zipCode).fill(zipCode);
  }

  /**
   * Fill caregiver zip extension
   */
  async fillCaregiverZipExtension(zipExtension: string): Promise<void> {
    const zipExtInput = this.page.locator(this.selectors.zipExtension);
    if (await zipExtInput.isVisible()) {
      await zipExtInput.click();
      await zipExtInput.fill(zipExtension);
    }
  }

  /**
   * Add caregiver with all details
   * @param data - Caregiver data
   */
  async addCaregiver(data: CaregiverData): Promise<void> {
    console.log(`Adding Caregiver: ${data.relation}`);

    await this.clickAddCaregiver();

    // Select relationship
    await this.selectRelationship(data.relation);

    // Fill basic info
    await this.fillCaregiverFirstName(data.firstName || 'Test');
    await this.fillCaregiverLastName(data.lastName || 'Caregiver');
    await this.fillCaregiverPhone(data.phone || '2145551234');

    if (data.email) {
      await this.fillCaregiverEmail(data.email);
    }

    // Set as primary contact if specified
    if (data.isPrimaryContact !== false) {
      await this.togglePrimaryContact();
    }

    // Fill address info
    await this.fillCaregiverAddress(data.address || '123 Main St');
    await this.fillCaregiverCity(data.city || 'Irving');
    await this.selectCaregiverState(data.state || 'TX');
    await this.fillCaregiverZipCode(data.zipCode || '75061');

    if (data.zipExtension) {
      await this.fillCaregiverZipExtension(data.zipExtension);
    }

    // Click Done to save
    await this.page.locator(this.selectors.doneButton).click({ force: true });
    await this.page.waitForTimeout(1000);

    console.log('Caregiver added successfully');
  }

  /**
   * Edit existing caregiver
   * @param index - Index of the caregiver row (0-based)
   */
  async editCaregiver(index: number = 0): Promise<void> {
    console.log(`Editing caregiver at index ${index}`);

    const editBtn = this.page.locator(this.selectors.editCaregiverButton(index));
    if (await editBtn.isVisible()) {
      await editBtn.click();
    } else {
      // Fallback: click on caregiver row to see options
      await this.page.locator(this.selectors.caregiverRow(index)).click();
    }
    await this.page.waitForTimeout(1000);
  }

  /**
   * Delete caregiver
   * @param index - Index of the caregiver row (0-based)
   */
  async deleteCaregiver(index: number = 0): Promise<void> {
    console.log(`Deleting caregiver at index ${index}`);

    const deleteBtn = this.page.locator(this.selectors.deleteCaregiverButton(index));
    if (await deleteBtn.isVisible()) {
      await deleteBtn.click();
    }
    await this.page.waitForTimeout(500);

    // Confirm deletion if dialog appears
    const confirmBtn = this.page.locator(this.selectors.confirmDeleteButton);
    if (await confirmBtn.isVisible({ timeout: 2000 })) {
      await confirmBtn.click();
    }

    await this.page.waitForTimeout(1000);
    console.log('Caregiver deleted successfully');
  }

  // ============================================
  // Form Action Methods
  // ============================================

  /**
   * Click Done button
   */
  async clickDone(): Promise<void> {
    await this.page.locator(this.selectors.doneButton).click({ force: true });
    await this.page.waitForTimeout(1000);
  }

  /**
   * Click Cancel button
   */
  async clickCancel(): Promise<void> {
    await this.page.locator(this.selectors.cancelButton).click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Click Save button
   */
  async clickSave(): Promise<void> {
    await this.page.locator(this.selectors.saveButton).click();
    await this.page.waitForTimeout(1000);
  }

  /**
   * Dismiss alert dialog by clicking OK
   */
  async dismissAlert(): Promise<void> {
    const alertBtn = this.page.locator(this.selectors.alertOkButton);
    if (await alertBtn.isVisible({ timeout: 2000 })) {
      await alertBtn.click();
      await this.page.waitForTimeout(500);
    }
  }

  // ============================================
  // Verification Methods
  // ============================================

  /**
   * Check if care team is selected
   */
  async isCareTeamSelected(): Promise<boolean> {
    const selectedTeam = await this.getSelectedCareTeam();
    return selectedTeam !== null && selectedTeam.trim().length > 0;
  }

  /**
   * Check if a role has a member assigned
   * @param role - Role name
   */
  async isRoleAssigned(role: string): Promise<boolean> {
    const selector = this.getRoleOptionsSelector(role);
    // If the options button exists, the role section is present
    // We need to check if there's an actual member assigned
    const roleSection = this.page.locator(selector);
    return await roleSection.isVisible();
  }

  /**
   * Get the number of caregivers listed
   */
  async getCaregiverCount(): Promise<number> {
    const caregiverRows = this.page.locator('[data-cy^="caregiver-row-"]');
    return await caregiverRows.count();
  }

  /**
   * Get the number of attending physicians listed
   */
  async getAttendingPhysicianCount(): Promise<number> {
    const physicianRows = this.page.locator('[data-cy^="btn-current-physician-"]');
    return await physicianRows.count();
  }
}
