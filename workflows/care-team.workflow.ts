import { Page } from '@playwright/test';
import { CareTeamPage, CaregiverData, AttendingPhysicianData } from '../pages/care-team.page';
import {
  CARE_TEAM_FORM_DATA,
  CARE_TEAM_NAMES,
  CareTeamFormData,
  CaregiverFormData,
  AttendingPhysicianFormData,
  CareTeamRole,
  createCareTeamData,
  createAttendingPhysicianData,
  createCaregiverData,
} from '../fixtures/care-team-fixtures';
import { DateHelper } from '../utils/date-helper';
import { TestDataManager } from '../utils/test-data-manager';

/**
 * Care Team Workflow
 * Handles add/edit operations for care team, attending physicians, and caregivers
 * Reads data directly from CARE_TEAM_FORM_DATA fixture
 */
export class CareTeamWorkflow {
  private readonly careTeamPage: CareTeamPage;

  constructor(private page: Page) {
    this.careTeamPage = new CareTeamPage(page);
  }

  // ============================================
  // Care Team Setup Methods
  // ============================================

  /**
   * Complete care team setup - navigate, select team, and add roles
   * @param mode - 'add' to add new roles, 'edit' to edit existing (future use)
   * @param customData - Optional custom data for parallel tests
   *
   * @example
   * // Use fixture data
   * await careTeamWorkflow.completeCareTeamSetup('add');
   *
   * @example
   * // Use custom data
   * const customData = createCareTeamData({ careTeam: { teamName: 'Custom Team' } });
   * await careTeamWorkflow.completeCareTeamSetup('add', customData);
   */
  async completeCareTeamSetup(
    mode: 'add' | 'edit' = 'add',
    customData?: CareTeamFormData
  ): Promise<void> {
    const data = customData || CARE_TEAM_FORM_DATA;
    const careTeamData = data.careTeam;

    console.log(`\n${mode === 'add' ? 'Setting up' : 'Editing'} Care Team...`);

    // Navigate to Care Team tab
    await this.careTeamPage.navigateToCareTeam();

    // Select care team
    const teamName = careTeamData?.teamName || this.getCareTeamNameForEnv();
    console.log(`Selecting care team: ${teamName}`);
    await this.careTeamPage.selectCareTeam(teamName);

    // Add roles if specified
    if (careTeamData?.roles && careTeamData.roles.length > 0) {
      for (const role of careTeamData.roles) {
        await this.addRoleMember(role);
      }
    }

    console.log('Care Team setup completed successfully');
  }

  /**
   * Navigate to Care Team section (standalone)
   */
  async navigateToCareTeam(): Promise<void> {
    console.log('Navigating to Care Team section...');
    await this.careTeamPage.navigateToCareTeam();
    console.log('Navigated to Care Team section');
  }

  /**
   * Select care team from dropdown
   * @param teamName - Optional team name (uses fixture/env if not provided)
   */
  async selectCareTeam(teamName?: string): Promise<void> {
    const name = teamName || this.getCareTeamNameForEnv();
    await this.careTeamPage.selectCareTeam(name);
  }

  /**
   * Add a specific role member to the care team
   * @param role - Role to add
   * @param memberIndex - Index of member to select from dropdown (default: 0)
   */
  async addRoleMember(role: CareTeamRole, memberIndex: number = 0): Promise<void> {
    console.log(`Adding ${role}...`);
    await this.careTeamPage.addTeamRoleMember(role, memberIndex);
  }

  /**
   * Edit a specific role member
   * @param role - Role to edit
   */
  async editRoleMember(role: CareTeamRole): Promise<void> {
    console.log(`Editing ${role}...`);
    await this.careTeamPage.editTeamRoleMember(role);
  }

  /**
   * Delete a specific role member
   * @param role - Role to delete
   */
  async deleteRoleMember(role: CareTeamRole): Promise<void> {
    console.log(`Deleting ${role}...`);
    await this.careTeamPage.deleteTeamRoleMember(role);
  }

  /**
   * Add standard care team roles (Social Worker, Spiritual Advisor, RN, Medical Director)
   */
  async addStandardRoles(): Promise<void> {
    console.log('Adding standard care team roles...');
    await this.careTeamPage.addSocialWorker();
    await this.careTeamPage.addSpiritualAdvisor();
    await this.careTeamPage.addRegisteredNurse();
    await this.careTeamPage.addMedicalDirector();
    console.log('Standard roles added successfully');
  }

  // ============================================
  // Attending Physician Methods
  // ============================================

  /**
   * Add or edit attending physician
   * @param mode - 'add' or 'edit'
   * @param fieldsToEdit - Array of fields to edit in edit mode
   * @param editIndex - Index of physician to edit (for edit mode)
   * @param customData - Optional custom data for parallel tests
   *
   * @example
   * // Add using fixture data
   * await careTeamWorkflow.fillAttendingPhysician('add');
   *
   * @example
   * // Edit existing physician
   * await careTeamWorkflow.fillAttendingPhysician('edit', ['startDate'], 0);
   *
   * @example
   * // Add with custom data
   * const physicianData = createAttendingPhysicianData({ searchName: 'Dr. Smith' });
   * await careTeamWorkflow.fillAttendingPhysician('add', [], 0, physicianData);
   */
  async fillAttendingPhysician(
    mode: 'add' | 'edit' = 'add',
    fieldsToEdit: string[] = [],
    editIndex: number = 0,
    customData?: AttendingPhysicianFormData
  ): Promise<void> {
    const data = customData || CARE_TEAM_FORM_DATA.attendingPhysician;

    console.log(`\n${mode === 'add' ? 'Adding' : 'Editing'} Attending Physician...`);

    /**
     * Determine if a field should be edited/filled
     */
    const shouldEdit = (field: string): boolean => {
      return (
        (mode !== 'edit' || fieldsToEdit.includes(field)) &&
        data?.[field as keyof AttendingPhysicianFormData] !== undefined &&
        data?.[field as keyof AttendingPhysicianFormData] !== null &&
        data?.[field as keyof AttendingPhysicianFormData] !== ''
      );
    };

    if (mode === 'add') {
      await this.careTeamPage.clickAddAttendingPhysician();
    } else {
      await this.careTeamPage.editAttendingPhysician(editIndex);
    }

    // Select physician
    if (shouldEdit('searchName') || mode === 'add') {
      const physicianName = data?.searchName || this.getPhysicianNameForEnv();
      await this.careTeamPage.selectAttendingPhysician(physicianName);
    }

    // Set start date
    if (shouldEdit('startDate') || mode === 'add') {
      const startDate = data?.startDate || DateHelper.getTodaysDate();
      await this.careTeamPage.selectPhysicianStartDate(startDate);
    }

    // Click Done to save
    await this.careTeamPage.clickDone();
    await this.page.waitForTimeout(1000);

    // Handle any confirmation dialogs
    await this.handleConfirmationDialog();

    console.log(`${mode === 'add' ? 'Added' : 'Edited'} Attending Physician successfully`);
  }

  /**
   * Add attending physician using simplified data object
   * @param data - Attending physician data
   */
  async addAttendingPhysician(data?: AttendingPhysicianData): Promise<void> {
    const physicianData: AttendingPhysicianData = {
      searchName: data?.searchName || this.getPhysicianNameForEnv(),
      startDate: data?.startDate || DateHelper.getTodaysDate(),
      endDate: data?.endDate,
    };

    await this.careTeamPage.addAttendingPhysician(physicianData);
    await this.handleConfirmationDialog();
  }

  /**
   * Edit existing attending physician
   * @param index - Index of physician to edit (0-based)
   * @param fieldsToEdit - Array of field names to edit
   * @param customData - New data for the fields
   */
  async editAttendingPhysician(
    index: number = 0,
    fieldsToEdit: string[] = [],
    customData?: Partial<AttendingPhysicianFormData>
  ): Promise<void> {
    await this.fillAttendingPhysician('edit', fieldsToEdit, index, customData as AttendingPhysicianFormData);
  }

  // ============================================
  // Caregiver/Family Methods
  // ============================================

  /**
   * Add or edit caregiver
   * @param mode - 'add' or 'edit'
   * @param fieldsToEdit - Array of fields to edit in edit mode
   * @param editIndex - Index of caregiver to edit (for edit mode)
   * @param customData - Optional custom data for parallel tests
   *
   * @example
   * // Add using fixture data
   * await careTeamWorkflow.fillCaregiverDetails('add');
   *
   * @example
   * // Edit existing caregiver
   * await careTeamWorkflow.fillCaregiverDetails('edit', ['phone', 'address'], 0);
   *
   * @example
   * // Add with custom data
   * const caregiverData = createCaregiverData({ relation: 'Child', firstName: 'Jane' });
   * await careTeamWorkflow.fillCaregiverDetails('add', [], 0, caregiverData);
   */
  async fillCaregiverDetails(
    mode: 'add' | 'edit' = 'add',
    fieldsToEdit: string[] = [],
    editIndex: number = 0,
    customData?: CaregiverFormData
  ): Promise<void> {
    const data = customData || CARE_TEAM_FORM_DATA.caregiver;

    console.log(`\n${mode === 'add' ? 'Adding' : 'Editing'} Caregiver...`);

    /**
     * Determine if a field should be edited/filled
     */
    const shouldEdit = (field: string): boolean => {
      return (
        (mode !== 'edit' || fieldsToEdit.includes(field)) &&
        data?.[field as keyof CaregiverFormData] !== undefined &&
        data?.[field as keyof CaregiverFormData] !== null &&
        data?.[field as keyof CaregiverFormData] !== ''
      );
    };

    if (mode === 'add') {
      await this.careTeamPage.clickAddCaregiver();
    } else {
      await this.careTeamPage.editCaregiver(editIndex);
    }

    // === Basic Information ===
    if (shouldEdit('relation')) {
      await this.careTeamPage.selectRelationship(data?.relation || 'Spouse');
    }

    if (shouldEdit('firstName')) {
      await this.careTeamPage.fillCaregiverFirstName(data?.firstName || 'Test');
    }

    if (shouldEdit('lastName')) {
      await this.careTeamPage.fillCaregiverLastName(data?.lastName || 'Caregiver');
    }

    if (shouldEdit('phone')) {
      await this.careTeamPage.fillCaregiverPhone(data?.phone || '2145551234');
    }

    if (shouldEdit('email') && data?.email) {
      await this.careTeamPage.fillCaregiverEmail(data.email);
    }

    // === Contact Checkboxes ===
    if (shouldEdit('isPrimaryContact') && data?.isPrimaryContact) {
      await this.careTeamPage.togglePrimaryContact();
    }

    if (shouldEdit('isEmergencyContact') && data?.isEmergencyContact) {
      await this.careTeamPage.toggleEmergencyContact();
    }

    if (shouldEdit('isLegalRepresentative') && data?.isLegalRepresentative) {
      await this.careTeamPage.toggleLegalRepresentative();
    }

    if (shouldEdit('isHealthcareProxy') && data?.isHealthcareProxy) {
      await this.careTeamPage.toggleHealthcareProxy();
    }

    // === Address Information ===
    if (shouldEdit('address')) {
      await this.careTeamPage.fillCaregiverAddress(data?.address || '123 Main St');
    }

    if (shouldEdit('city')) {
      await this.careTeamPage.fillCaregiverCity(data?.city || 'Irving');
    }

    if (shouldEdit('state')) {
      await this.careTeamPage.selectCaregiverState(data?.state || 'TX');
    }

    if (shouldEdit('zipCode')) {
      await this.careTeamPage.fillCaregiverZipCode(data?.zipCode || '75061');
    }

    if (shouldEdit('zipExtension') && data?.zipExtension) {
      await this.careTeamPage.fillCaregiverZipExtension(data.zipExtension);
    }

    // Small wait before saving
    await this.page.waitForTimeout(500);

    // Click Done to save
    await this.careTeamPage.clickDone();
    await this.page.waitForTimeout(1000);

    // Handle any confirmation dialogs
    await this.handleConfirmationDialog();

    console.log(`${mode === 'add' ? 'Added' : 'Edited'} Caregiver successfully`);
  }

  /**
   * Add caregiver using simplified data object
   * @param data - Caregiver data
   */
  async addCaregiver(data?: CaregiverData): Promise<void> {
    const caregiverData: CaregiverData = {
      relation: data?.relation || CARE_TEAM_FORM_DATA.caregiver?.relation || 'Spouse',
      firstName: data?.firstName || CARE_TEAM_FORM_DATA.caregiver?.firstName || 'Test',
      lastName: data?.lastName || CARE_TEAM_FORM_DATA.caregiver?.lastName || 'Caregiver',
      phone: data?.phone || CARE_TEAM_FORM_DATA.caregiver?.phone || '2145551234',
      email: data?.email,
      address: data?.address || CARE_TEAM_FORM_DATA.caregiver?.address || '123 Main St',
      city: data?.city || CARE_TEAM_FORM_DATA.caregiver?.city || 'Irving',
      state: data?.state || CARE_TEAM_FORM_DATA.caregiver?.state || 'TX',
      zipCode: data?.zipCode || CARE_TEAM_FORM_DATA.caregiver?.zipCode || '75061',
      zipExtension: data?.zipExtension,
      isPrimaryContact: data?.isPrimaryContact ?? CARE_TEAM_FORM_DATA.caregiver?.isPrimaryContact ?? true,
    };

    await this.careTeamPage.addCaregiver(caregiverData);
    await this.handleConfirmationDialog();
  }

  /**
   * Edit existing caregiver
   * @param index - Index of caregiver to edit (0-based)
   * @param fieldsToEdit - Array of field names to edit
   * @param customData - New data for the fields
   */
  async editCaregiver(
    index: number = 0,
    fieldsToEdit: string[] = [],
    customData?: Partial<CaregiverFormData>
  ): Promise<void> {
    await this.fillCaregiverDetails('edit', fieldsToEdit, index, customData as CaregiverFormData);
  }

  /**
   * Delete a caregiver
   * @param index - Index of caregiver to delete (0-based)
   */
  async deleteCaregiver(index: number = 0): Promise<void> {
    await this.careTeamPage.deleteCaregiver(index);
    await this.handleConfirmationDialog();
  }

  // ============================================
  // Complete Workflows
  // ============================================

  /**
   * Complete full care team workflow:
   * 1. Navigate to Care Team
   * 2. Select care team and add roles
   * 3. Add attending physician
   * 4. Add caregiver
   *
   * @param customData - Optional custom data for the entire workflow
   *
   * @example
   * // Use all fixture data
   * await careTeamWorkflow.completeFullCareTeamWorkflow();
   *
   * @example
   * // Use custom data
   * const customData = createCareTeamData({
   *   caregiver: { relation: 'Child', firstName: 'Jane' },
   *   attendingPhysician: { searchName: 'Dr. Smith' }
   * });
   * await careTeamWorkflow.completeFullCareTeamWorkflow(customData);
   */
  async completeFullCareTeamWorkflow(customData?: CareTeamFormData): Promise<void> {
    const data = customData || CARE_TEAM_FORM_DATA;

    console.log('\n========================================');
    console.log('Starting Complete Care Team Workflow');
    console.log('========================================');

    // Step 1: Care Team Setup
    await this.completeCareTeamSetup('add', data);

    // Step 2: Add Attending Physician
    if (data.attendingPhysician) {
      await this.fillAttendingPhysician('add', [], 0, data.attendingPhysician);
    }

    // Step 3: Add Caregiver
    if (data.caregiver) {
      await this.fillCaregiverDetails('add', [], 0, data.caregiver);
    }

    console.log('========================================');
    console.log('Care Team Workflow Completed Successfully');
    console.log('========================================\n');
  }

  // ============================================
  // Private Helper Methods
  // ============================================

  /**
   * Get care team name based on environment and tenant
   */
  private getCareTeamNameForEnv(): string {
    const env = (process.env.TEST_ENV || 'qa').toLowerCase();
    const tenant = (process.env.TENANT || 'cth').toLowerCase();

    return CARE_TEAM_NAMES[env]?.[tenant] || CARE_TEAM_NAMES['qa']['cth'];
  }

  /**
   * Get default physician name based on environment and tenant
   */
  private getPhysicianNameForEnv(): string {
    return TestDataManager.getPhysician();
  }

  /**
   * Handle confirmation dialogs that may appear after save operations
   */
  private async handleConfirmationDialog(): Promise<void> {
    try {
      // Handle "Proceed" button
      const proceedButton = this.page.locator('button:has-text("Proceed")');
      if (await proceedButton.isVisible({ timeout: 2000 })) {
        await proceedButton.click();
        await this.page.waitForTimeout(1000);
      }
    } catch {
      // Proceed button not present, continue
    }

    try {
      // Handle ion-alert dialogs
      const ionAlert = this.page.locator('ion-alert');
      if (await ionAlert.isVisible({ timeout: 2000 })) {
        console.log('Found ion-alert dialog, dismissing...');
        const alertButton = ionAlert.locator('button').first();
        if (await alertButton.isVisible({ timeout: 1000 })) {
          await alertButton.click();
          console.log('Dismissed ion-alert dialog');
          await this.page.waitForTimeout(1000);
        }
      }
    } catch {
      // No ion-alert present, continue
    }

    try {
      // Handle standard alert dialogs
      const alertOkButton = this.page.locator('.alert-button-default, [data-cy="btn-alert-ok"]');
      if (await alertOkButton.isVisible({ timeout: 1000 })) {
        await alertOkButton.click();
        await this.page.waitForTimeout(500);
      }
    } catch {
      // No standard alert present, continue
    }
  }

  // ============================================
  // Verification Methods
  // ============================================

  /**
   * Check if care team is selected
   */
  async isCareTeamSelected(): Promise<boolean> {
    return await this.careTeamPage.isCareTeamSelected();
  }

  /**
   * Check if a specific role has a member assigned
   * @param role - Role name to check
   */
  async isRoleAssigned(role: CareTeamRole): Promise<boolean> {
    return await this.careTeamPage.isRoleAssigned(role);
  }

  /**
   * Get the number of caregivers listed
   */
  async getCaregiverCount(): Promise<number> {
    return await this.careTeamPage.getCaregiverCount();
  }

  /**
   * Get the number of attending physicians listed
   */
  async getAttendingPhysicianCount(): Promise<number> {
    return await this.careTeamPage.getAttendingPhysicianCount();
  }

  /**
   * Wait for success toast notification
   */
  async waitForSuccessToast(timeout: number = 5000): Promise<void> {
    await this.careTeamPage.waitForSuccessToast(timeout);
  }

  /**
   * Check for error toast notification
   */
  async hasErrorToast(): Promise<boolean> {
    return await this.careTeamPage.hasErrorToast();
  }

  /**
   * Get currently selected care team name
   */
  async getSelectedCareTeam(): Promise<string | null> {
    return await this.careTeamPage.getSelectedCareTeam();
  }
}
