import { Page } from '@playwright/test';
import { BasePage } from '../pages/base.page';
import { selectDateFromPicker } from '../utils/form-helpers';

/**
 * Care Team Page Object — Ionic 8 (qa2)
 *
 * VERIFIED via MCP Playwright on qa2 (2026-03-05).
 *
 * KEY CHANGES from Ionic 4 (qa1):
 * - Navigation: [data-cy="btn-nav-bar-item-care-team"] SAME
 * - Care team dropdown: div[data-cy="select-care-team"] (was just [data-cy])
 * - Team role options: btn-team-role-options-{INDEX} (was btn-current-physician-options-{RoleName})
 *   → Roles are now indexed (0=Social Worker, 1=Spiritual Advisor, etc.) NOT named
 * - Role containers: container-team-role-{index}, header-team-role-{index}
 * - Role labels: span[data-cy="label-team-role-name-{index}"]
 * - Attending physician: btn-current-physician-options-{index} (indexed, was by name)
 * - Caregiver: btn-primary-caregiver-options-{index} (new)
 * - Tables: table[data-cy="table-physicians"], table[data-cy="table-caregivers"] (new)
 * - Add buttons: ion-fab-button[data-cy="btn-add-caregiver-fab"], btn-add-physician-fab (new)
 * - Cards: ion-card[data-cy="card-care-team"], card-caregivers, card-physicians (new)
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

export class CareTeamPage extends BasePage {
  private readonly selectors = {
    // === Navigation ===
    careTeamNavBarItem: '[data-cy="btn-nav-bar-item-care-team"]',

    // === Care Team Selection ===
    careTeamDropdown: '[data-cy="select-care-team"]',
    selectedTeamName: '[data-cy="label-selected-team-name"]',
    teamLabel: '[data-cy="label-team"]',

    // === Care Team Roles (INDEX-BASED in Ionic 8) ===
    addCareTeamRole: '[data-cy="btn-add-care-team-role"]',
    teamRoleContainer: (index: number) => `[data-cy="container-team-role-${index}"]`,
    teamRoleHeader: (index: number) => `[data-cy="header-team-role-${index}"]`,
    teamRoleName: (index: number) => `[data-cy="label-team-role-name-${index}"]`,
    teamRoleOptions: (index: number) => `[data-cy="btn-team-role-options-${index}"]`,
    roleOptionsIcon: (index: number) => `[data-cy="icon-options-${index}"]`,
    roleActionsContainer: (index: number) => `[data-cy="container-role-actions-${index}"]`,

    // === Care Team Member Modal ===
    memberModalContent: '[data-cy="content-care-teams-modal"]',
    memberSelect: (index: number) => `[data-cy="select-person-${index}"]`,
    memberModalSave: '[data-cy="btn-done-care-team"]',
    memberModalCancel: '[data-cy="btn-cancel-care-team"]',
    addNewMemberFab: '[data-cy="btn-add-new-member"]',

    // === Role Popup Menu Options (used when role already has a member) ===
    addRoleOption: '[data-cy="btn-add-option"]',
    editRoleOption: '[data-cy="btn-edit-option"]',
    deleteRoleOption: '[data-cy="btn-delete-option"]',
    viewHistoryOption: '[data-cy="btn-view-history-option"]',

    // === Attending Physician Section ===
    addAttendingPhysician: '[data-cy="btn-add-physician"]',
    addPhysicianFab: '[data-cy="btn-add-physician-fab"]',
    addPhysicianIcon: '[data-cy="icon-add-physician"]',
    physicianCard: '[data-cy="card-physicians"]',
    physicianCardHeader: '[data-cy="header-physicians"]',
    physicianCardContent: '[data-cy="content-physicians"]',
    physiciansTable: '[data-cy="table-physicians"]',
    physicianRow: (index: number) => `[data-cy="row-current-physician-${index}"]`,
    physicianName: (index: number) => `[data-cy="cell-current-physician-name-${index}"]`,
    physicianPhone: (index: number) => `[data-cy="cell-current-physician-phone-${index}"]`,
    physicianEmail: (index: number) => `[data-cy="cell-current-physician-email-${index}"]`,
    physicianStartDate: (index: number) => `[data-cy="cell-current-physician-start-date-${index}"]`,
    physicianEndDate: (index: number) => `[data-cy="cell-current-physician-end-date-${index}"]`,
    physicianModifiedBy: (index: number) => `[data-cy="cell-current-physician-modified-by-${index}"]`,
    physicianActions: (index: number) => `[data-cy="cell-current-physician-actions-${index}"]`,
    currentPhysicianOptions: (index: number) => `[data-cy="btn-current-physician-options-${index}"]`,

    // === Caregiver/Family Section ===
    addCaregiver: '[data-cy="btn-add-caregiver"]',
    addCaregiverFab: '[data-cy="btn-add-caregiver-fab"]',
    addCaregiverIcon: '[data-cy="icon-add-caregiver"]',
    caregiverCard: '[data-cy="card-caregivers"]',
    caregiverCardHeader: '[data-cy="header-caregivers"]',
    caregiverCardContent: '[data-cy="content-caregivers"]',
    caregiversTable: '[data-cy="table-caregivers"]',
    caregiverRow: (index: number) => `[data-cy="row-primary-caregiver-${index}"]`,
    caregiverRelation: (index: number) => `[data-cy="cell-primary-caregiver-relation-${index}"]`,
    caregiverName: (index: number) => `[data-cy="cell-primary-caregiver-name-${index}"]`,
    caregiverPhone: (index: number) => `[data-cy="cell-primary-caregiver-phone-${index}"]`,
    caregiverEmail: (index: number) => `[data-cy="cell-primary-caregiver-email-${index}"]`,
    caregiverAddress: (index: number) => `[data-cy="cell-primary-caregiver-address-${index}"]`,
    caregiverActions: (index: number) => `[data-cy="cell-primary-caregiver-actions-${index}"]`,
    primaryCaregiverOptions: (index: number) => `[data-cy="btn-primary-caregiver-options-${index}"]`,

    // === Caregiver Form Fields (same as qa1 for now — verify when form opens) ===
    relationshipDropdown: '[data-cy="select-relationship"]',
    firstName: '[data-cy="input-first-name"]',
    lastName: '[data-cy="input-last-name"]',
    phone: '[data-cy="input-phone"]',
    email: '[data-cy="input-email"]',
    primaryContactCheckbox: '[data-cy="checkbox-primary-contact"]',
    emergencyContactCheckbox: '[data-cy="checkbox-emergency-contact"]',
    address: '[data-cy="input-address"]',
    city: '[data-cy="input-city"]',
    stateDropdown: '[data-cy="select-state"]',
    zipCode: '[data-cy="input-zipcode"]',
    zipExtension: '[data-cy="input-zip-extension"]',

    // === Caregiver Modal Actions (verified on qa2 2026-03-12 via MCP) ===
    caregiverSaveButton: '[data-cy="btn-done-caregiver"]',
    caregiverCancelButton: '[data-cy="btn-cancel-caregiver"]',
    caregiverModalContent: '[data-cy="content-caregiver-modal"]',

    // === Caregiver Checkboxes (additional) ===
    legalRepresentativeCheckbox: '[data-cy="checkbox-legal-representative"]',
    healthcareProxyCheckbox: '[data-cy="checkbox-healthcare-proxy"]',

    // === Attending Physician Form Fields (verified on qa2 2026-03-12 via MCP) ===
    physicianSelect: '[data-cy="select-physician"]',
    physicianStartDatePicker: '[data-cy="input-start-date"]',
    physicianSaveButton: '[data-cy="btn-save-physician"]',
    physicianCancelButton: '[data-cy="btn-cancel-physician"]',
    physicianModalContent: '[data-cy="content-physician-modal"]',

    // === Common Form Actions ===
    doneButton: '[data-cy="btn-done"]',
    cancelButton: '[data-cy="btn-cancel"]',
    saveButton: '[data-cy="btn-save"]',

    // === Confirmation Dialogs ===
    confirmDeleteButton: '[data-cy="btn-confirm-delete"]',
    cancelDeleteButton: '[data-cy="btn-cancel-delete"]',
    alertOkButton: '.alert-button-default',

    // === Toast ===
    toastMessage: '.toast-message',
    successToast: '.toast-success',
    errorToast: '.toast-error',
  };

  constructor(page: Page) {
    super(page);
  }

  // ============================================
  // Navigation
  // ============================================

  async navigateToCareTeam(): Promise<void> {
    await this.page.waitForTimeout(1000);
    const navButton = this.page.locator(this.selectors.careTeamNavBarItem).last();
    await navButton.scrollIntoViewIfNeeded();
    await navButton.click();
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(2000);
  }

  // ============================================
  // Care Team Selection
  // ============================================

  async selectCareTeam(teamName: string): Promise<void> {
    // ng-select: click to open → type in inner input → pick from dropdown
    const ngSelect = this.page.locator(this.selectors.careTeamDropdown);
    await ngSelect.click();
    await this.page.waitForTimeout(500);
    const input = ngSelect.locator('input');
    await input.fill(teamName);
    await this.page.waitForTimeout(1500);
    await this.page.locator('ng-dropdown-panel .ng-option-label').first().click();
    await this.page.waitForTimeout(1000);
  }

  async getSelectedCareTeam(): Promise<string | null> {
    const label = this.page.locator(this.selectors.selectedTeamName);
    if (await label.isVisible()) {
      return await label.textContent();
    }
    return null;
  }

  // ============================================
  // Care Team Role Methods (INDEX-BASED)
  // ============================================

  /**
   * In Ionic 8, role options use index-based selectors.
   * Find the index of a role by searching for its name in the DOM.
   */
  async findRoleIndex(roleName: string): Promise<number> {
    for (let i = 0; i < 20; i++) {
      const nameEl = this.page.locator(this.selectors.teamRoleName(i));
      if (await nameEl.isVisible({ timeout: 500 }).catch(() => false)) {
        const text = await nameEl.textContent();
        if (text?.trim().startsWith(roleName)) return i;
      }
    }
    throw new Error(`Role "${roleName}" not found in care team`);
  }

  async clickRoleOptions(role: string): Promise<void> {
    const index = await this.findRoleIndex(role);
    await this.page.locator(this.selectors.teamRoleOptions(index)).click();
    await this.page.waitForTimeout(500);
  }

  async addTeamRoleMember(role: string, memberIndex: number = 0): Promise<void> {
    // Step 1: Click role options icon → popover opens with Add option
    await this.clickRoleOptions(role);
    await this.page.locator(this.selectors.addRoleOption).click();
    await this.page.waitForSelector(this.selectors.memberModalContent, { timeout: 10000 });
    await this.page.waitForTimeout(500);

    // Step 2: Select member from ng-select (indexed: select-person-0)
    const memberNgSelect = this.page.locator(this.selectors.memberSelect(0));
    await memberNgSelect.click();
    await this.page.waitForTimeout(500);
    const options = this.page.locator('ng-dropdown-panel .ng-option-label');
    await options.nth(memberIndex).click();
    await this.page.waitForTimeout(1000);

    // Step 3: Save
    await this.page.locator(this.selectors.memberModalSave).click({ force: true });
    await this.page.waitForTimeout(1000);
  }

  // Convenience methods
  async addSocialWorker(memberIndex: number = 0): Promise<void> { await this.addTeamRoleMember('Social Worker', memberIndex); }
  async addSpiritualAdvisor(memberIndex: number = 0): Promise<void> { await this.addTeamRoleMember('Spiritual Advisor', memberIndex); }
  async addRegisteredNurse(memberIndex: number = 0): Promise<void> { await this.addTeamRoleMember('Registered Nurse', memberIndex); }
  async addMedicalDirector(memberIndex: number = 0): Promise<void> { await this.addTeamRoleMember('Medical Director', memberIndex); }

  // ============================================
  // Attending Physician
  // ============================================

  async clickAddAttendingPhysician(): Promise<void> {
    await this.page.locator(this.selectors.addAttendingPhysician).scrollIntoViewIfNeeded();
    await this.page.locator(this.selectors.addAttendingPhysician).click();
    await this.page.waitForTimeout(2000);
  }

  async selectAttendingPhysician(physicianName: string): Promise<void> {
    // ng-select: click to open → type in inner input → pick from dropdown
    const ngSelect = this.page.locator(this.selectors.physicianSelect);
    await ngSelect.click();
    await this.page.waitForTimeout(500);
    const input = ngSelect.locator('input');
    await input.fill(physicianName);
    await this.page.waitForTimeout(1500);
    await this.page.locator('ng-dropdown-panel .ng-option-label')
      .filter({ hasText: new RegExp(physicianName, 'i') })
      .first()
      .click();
    await this.page.waitForTimeout(1000);
  }

  // ============================================
  // Caregiver/Family
  // ============================================

  async clickAddCaregiver(): Promise<void> {
    await this.page.locator(this.selectors.addCaregiver).scrollIntoViewIfNeeded();
    await this.page.locator(this.selectors.addCaregiver).click();
    await this.page.waitForTimeout(1000);
  }

  async addCaregiver(data: CaregiverData): Promise<void> {
    await this.clickAddCaregiver();

    // Select relationship (ng-select)
    const relationNgSelect = this.page.locator(this.selectors.relationshipDropdown);
    await relationNgSelect.click();
    await this.page.waitForTimeout(500);
    await this.page.locator('ng-dropdown-panel .ng-option-label')
      .filter({ hasText: data.relation })
      .first()
      .click();
    await this.page.waitForTimeout(500);

    await this.page.locator(`${this.selectors.firstName} input`).click();
    await this.page.locator(`${this.selectors.firstName} input`).fill(data.firstName || 'Test');
    await this.page.locator(`${this.selectors.lastName} input`).click();
    await this.page.locator(`${this.selectors.lastName} input`).fill(data.lastName || 'Caregiver');
    await this.page.locator(`${this.selectors.phone} input`).click();
    await this.page.locator(`${this.selectors.phone} input`).fill(data.phone || '2145551234');

    if (data.isPrimaryContact !== false) {
      await this.page.locator(this.selectors.primaryContactCheckbox).click();
    }

    await this.page.locator(`${this.selectors.address} input`).click();
    await this.page.locator(`${this.selectors.address} input`).fill(data.address || '123 Main St');
    await this.page.locator(`${this.selectors.city} input`).click();
    await this.page.locator(`${this.selectors.city} input`).fill(data.city || 'Irving');

    // State (ng-select)
    const stateNgSelect = this.page.locator(this.selectors.stateDropdown);
    await stateNgSelect.click();
    await this.page.waitForTimeout(500);
    const stateInput = stateNgSelect.locator('input');
    await stateInput.fill(data.state || 'TX');
    await this.page.waitForTimeout(1000);
    await this.page.locator('ng-dropdown-panel .ng-option-label').first().click();
    await this.page.waitForTimeout(500);

    await this.page.locator(`${this.selectors.zipCode} input`).click();
    await this.page.locator(`${this.selectors.zipCode} input`).fill(data.zipCode || '75061');

    await this.page.locator(this.selectors.caregiverSaveButton).click({ force: true });
    await this.page.waitForTimeout(1000);
  }

  // ============================================
  // Form Actions
  // ============================================

  async clickDone(): Promise<void> {
    await this.page.locator(this.selectors.doneButton).click({ force: true });
    await this.page.waitForTimeout(1000);
  }

  async clickPhysicianSave(): Promise<void> {
    await this.page.locator(this.selectors.physicianSaveButton).click({ force: true });
    await this.page.waitForTimeout(1000);
  }

  async clickCaregiverSave(): Promise<void> {
    await this.page.locator(this.selectors.caregiverSaveButton).click({ force: true });
    await this.page.waitForTimeout(1000);
  }

  async clickCancel(): Promise<void> {
    await this.page.locator(this.selectors.cancelButton).click();
    await this.page.waitForTimeout(500);
  }

  async clickSave(): Promise<void> {
    await this.page.locator(this.selectors.saveButton).click();
    await this.page.waitForTimeout(1000);
  }

  // ============================================
  // Edit/Delete Team Role Members
  // ============================================

  async editTeamRoleMember(role: string): Promise<void> {
    console.log(`Editing ${role}...`);
    await this.clickRoleOptions(role);
    await this.page.locator(this.selectors.editRoleOption).click();
    await this.page.waitForTimeout(1000);
  }

  async deleteTeamRoleMember(role: string): Promise<void> {
    console.log(`Deleting ${role}...`);
    await this.clickRoleOptions(role);
    await this.page.locator(this.selectors.deleteRoleOption).click();
    await this.page.waitForTimeout(500);

    const confirmBtn = this.page.locator(this.selectors.confirmDeleteButton);
    if (await confirmBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await confirmBtn.click();
    }
    await this.page.waitForTimeout(1000);
    console.log(`${role} deleted successfully`);
  }

  // ============================================
  // Attending Physician — Extended
  // ============================================

  async selectPhysicianStartDate(date: string): Promise<void> {
    console.log(`Setting physician start date: ${date}`);
    await this.page.locator(this.selectors.physicianStartDatePicker).click();
    await this.page.waitForTimeout(500);
    await selectDateFromPicker(this.page, date);
  }

  async addAttendingPhysician(data: AttendingPhysicianData): Promise<void> {
    console.log(`Adding Attending Physician: ${data.searchName}`);
    await this.clickAddAttendingPhysician();
    await this.selectAttendingPhysician(data.searchName);
    await this.selectPhysicianStartDate(data.startDate);
    await this.page.locator(this.selectors.physicianSaveButton).click({ force: true });
    await this.page.waitForTimeout(1000);
    console.log('Attending Physician added successfully');
  }

  async editAttendingPhysician(index: number = 0): Promise<void> {
    console.log(`Editing attending physician at index ${index}`);
    await this.page.locator(this.selectors.currentPhysicianOptions(index)).click();
    await this.page.waitForTimeout(500);
    await this.page.locator(this.selectors.editRoleOption).click();
    await this.page.waitForTimeout(1000);
  }

  // ============================================
  // Caregiver — Individual Field Methods
  // ============================================

  async selectRelationship(relationship: string): Promise<void> {
    console.log(`Selecting relationship: ${relationship}`);
    const ngSelect = this.page.locator(this.selectors.relationshipDropdown);
    await ngSelect.click();
    await this.page.waitForTimeout(500);
    await this.page.locator('ng-dropdown-panel .ng-option-label')
      .filter({ hasText: relationship })
      .first()
      .click();
    await this.page.waitForTimeout(500);
  }

  async fillCaregiverFirstName(firstName: string): Promise<void> {
    const input = this.page.locator(`${this.selectors.firstName} input`);
    await input.click();
    await input.fill(firstName);
  }

  async fillCaregiverLastName(lastName: string): Promise<void> {
    const input = this.page.locator(`${this.selectors.lastName} input`);
    await input.click();
    await input.fill(lastName);
  }

  async fillCaregiverPhone(phone: string): Promise<void> {
    const input = this.page.locator(`${this.selectors.phone} input`);
    await input.click();
    await input.fill(phone);
  }

  async fillCaregiverEmail(email: string): Promise<void> {
    const emailInput = this.page.locator(`${this.selectors.email} input`);
    if (await emailInput.isVisible()) {
      await emailInput.click();
      await emailInput.fill(email);
    }
  }

  async togglePrimaryContact(): Promise<void> {
    await this.page.locator(this.selectors.primaryContactCheckbox).click();
    await this.page.waitForTimeout(500);
  }

  async toggleEmergencyContact(): Promise<void> {
    const checkbox = this.page.locator(this.selectors.emergencyContactCheckbox);
    if (await checkbox.isVisible()) {
      await checkbox.click();
      await this.page.waitForTimeout(500);
    }
  }

  async toggleLegalRepresentative(): Promise<void> {
    const checkbox = this.page.locator(this.selectors.legalRepresentativeCheckbox);
    if (await checkbox.isVisible()) {
      await checkbox.click();
      await this.page.waitForTimeout(500);
    }
  }

  async toggleHealthcareProxy(): Promise<void> {
    const checkbox = this.page.locator(this.selectors.healthcareProxyCheckbox);
    if (await checkbox.isVisible()) {
      await checkbox.click();
      await this.page.waitForTimeout(500);
    }
  }

  async fillCaregiverAddress(address: string): Promise<void> {
    await this.page.locator(`${this.selectors.address} input`).click();
    await this.page.locator(`${this.selectors.address} input`).fill(address);
  }

  async fillCaregiverCity(city: string): Promise<void> {
    await this.page.locator(`${this.selectors.city} input`).click();
    await this.page.locator(`${this.selectors.city} input`).fill(city);
  }

  async selectCaregiverState(state: string): Promise<void> {
    const ngSelect = this.page.locator(this.selectors.stateDropdown);
    await ngSelect.click();
    await this.page.waitForTimeout(500);
    const input = ngSelect.locator('input');
    await input.fill(state);
    await this.page.waitForTimeout(1000);
    await this.page.locator('ng-dropdown-panel .ng-option-label').first().click();
    await this.page.waitForTimeout(500);
  }

  async fillCaregiverZipCode(zipCode: string): Promise<void> {
    await this.page.locator(`${this.selectors.zipCode} input`).click();
    await this.page.locator(`${this.selectors.zipCode} input`).fill(zipCode);
  }

  async fillCaregiverZipExtension(zipExtension: string): Promise<void> {
    const zipExtInput = this.page.locator(`${this.selectors.zipExtension} input`);
    if (await zipExtInput.isVisible()) {
      await zipExtInput.click();
      await zipExtInput.fill(zipExtension);
    }
  }

  async editCaregiver(index: number = 0): Promise<void> {
    console.log(`Editing caregiver at index ${index}`);
    await this.page.locator(this.selectors.primaryCaregiverOptions(index)).click();
    await this.page.waitForTimeout(500);
    await this.page.locator(this.selectors.editRoleOption).click();
    await this.page.waitForTimeout(1000);
  }

  async deleteCaregiver(index: number = 0): Promise<void> {
    console.log(`Deleting caregiver at index ${index}`);
    await this.page.locator(this.selectors.primaryCaregiverOptions(index)).click();
    await this.page.waitForTimeout(500);
    await this.page.locator(this.selectors.deleteRoleOption).click();
    await this.page.waitForTimeout(500);

    const confirmBtn = this.page.locator(this.selectors.confirmDeleteButton);
    if (await confirmBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await confirmBtn.click();
    }
    await this.page.waitForTimeout(1000);
    console.log('Caregiver deleted successfully');
  }

  // ============================================
  // Verification Methods
  // ============================================

  async isCareTeamSelected(): Promise<boolean> {
    const selectedTeam = await this.getSelectedCareTeam();
    return selectedTeam !== null && selectedTeam.trim().length > 0;
  }

  async isRoleAssigned(role: string): Promise<boolean> {
    try {
      const index = await this.findRoleIndex(role);
      return index >= 0;
    } catch {
      return false;
    }
  }

  async getCaregiverCount(): Promise<number> {
    const caregiverRows = this.page.locator('[data-cy^="row-primary-caregiver-"]');
    return await caregiverRows.count();
  }

  async getAttendingPhysicianCount(): Promise<number> {
    const physicianRows = this.page.locator('[data-cy^="row-current-physician-"]');
    return await physicianRows.count();
  }

  async waitForSuccessToast(timeout: number = 5000): Promise<void> {
    await this.page.locator(this.selectors.successToast).waitFor({ state: 'visible', timeout });
  }

  async hasErrorToast(): Promise<boolean> {
    return await this.page.locator(this.selectors.errorToast).isVisible();
  }

  async getSelectedCareTeamName(): Promise<string | null> {
    return await this.getSelectedCareTeam();
  }
}
