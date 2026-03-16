import { Page } from '@playwright/test';
import { CareTeamPage, CaregiverData, AttendingPhysicianData } from '../pages_ionic8/care-team.page';
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
 * Care Team Workflow (Ionic 8)
 * Handles add/edit operations for care team, attending physicians, and caregivers
 */
export class CareTeamWorkflow {
  private readonly careTeamPage: CareTeamPage;

  constructor(private page: Page) {
    this.careTeamPage = new CareTeamPage(page);
  }

  // ============================================
  // Care Team Setup Methods
  // ============================================

  async completeCareTeamSetup(
    mode: 'add' | 'edit' = 'add',
    customData?: CareTeamFormData
  ): Promise<void> {
    const data = customData || CARE_TEAM_FORM_DATA;
    const careTeamData = data.careTeam;

    console.log(`\n${mode === 'add' ? 'Setting up' : 'Editing'} Care Team...`);

    await this.careTeamPage.navigateToCareTeam();

    const teamName = careTeamData?.teamName || this.getCareTeamNameForEnv();
    console.log(`Selecting care team: ${teamName}`);
    await this.careTeamPage.selectCareTeam(teamName);

    if (careTeamData?.roles && careTeamData.roles.length > 0) {
      for (const role of careTeamData.roles) {
        await this.addRoleMember(role);
      }
    }

    console.log('Care Team setup completed successfully');
  }

  async navigateToCareTeam(): Promise<void> {
    console.log('Navigating to Care Team section...');
    await this.careTeamPage.navigateToCareTeam();
    console.log('Navigated to Care Team section');
  }

  async selectCareTeam(teamName?: string): Promise<void> {
    const name = teamName || this.getCareTeamNameForEnv();
    await this.careTeamPage.selectCareTeam(name);
  }

  async addRoleMember(role: CareTeamRole, memberIndex: number = 0): Promise<void> {
    console.log(`Adding ${role}...`);
    await this.careTeamPage.addTeamRoleMember(role, memberIndex);
  }

  async editRoleMember(role: CareTeamRole): Promise<void> {
    console.log(`Editing ${role}...`);
    await this.careTeamPage.editTeamRoleMember(role);
  }

  async deleteRoleMember(role: CareTeamRole): Promise<void> {
    console.log(`Deleting ${role}...`);
    await this.careTeamPage.deleteTeamRoleMember(role);
  }

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

  async fillAttendingPhysician(
    mode: 'add' | 'edit' = 'add',
    fieldsToEdit: string[] = [],
    editIndex: number = 0,
    customData?: AttendingPhysicianFormData
  ): Promise<void> {
    const data = customData || CARE_TEAM_FORM_DATA.attendingPhysician;

    console.log(`\n${mode === 'add' ? 'Adding' : 'Editing'} Attending Physician...`);

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

    if (shouldEdit('searchName') || mode === 'add') {
      const physicianName = data?.searchName || this.getPhysicianNameForEnv();
      await this.careTeamPage.selectAttendingPhysician(physicianName);
    }

    if (shouldEdit('startDate') || mode === 'add') {
      const startDate = data?.startDate || DateHelper.getTodaysDate();
      await this.careTeamPage.selectPhysicianStartDate(startDate);
    }

    await this.careTeamPage.clickPhysicianSave();
    await this.page.waitForTimeout(1000);

    await this.handleConfirmationDialog();

    console.log(`${mode === 'add' ? 'Added' : 'Edited'} Attending Physician successfully`);
  }

  async addAttendingPhysician(data?: AttendingPhysicianData): Promise<void> {
    const physicianData: AttendingPhysicianData = {
      searchName: data?.searchName || this.getPhysicianNameForEnv(),
      startDate: data?.startDate || DateHelper.getTodaysDate(),
      endDate: data?.endDate,
    };

    await this.careTeamPage.addAttendingPhysician(physicianData);
    await this.handleConfirmationDialog();
  }

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

  async fillCaregiverDetails(
    mode: 'add' | 'edit' = 'add',
    fieldsToEdit: string[] = [],
    editIndex: number = 0,
    customData?: CaregiverFormData
  ): Promise<void> {
    const data = customData || CARE_TEAM_FORM_DATA.caregiver;

    console.log(`\n${mode === 'add' ? 'Adding' : 'Editing'} Caregiver...`);

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

    await this.page.waitForTimeout(500);

    await this.careTeamPage.clickCaregiverSave();
    await this.page.waitForTimeout(1000);

    await this.handleConfirmationDialog();

    console.log(`${mode === 'add' ? 'Added' : 'Edited'} Caregiver successfully`);
  }

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

  async editCaregiver(
    index: number = 0,
    fieldsToEdit: string[] = [],
    customData?: Partial<CaregiverFormData>
  ): Promise<void> {
    await this.fillCaregiverDetails('edit', fieldsToEdit, index, customData as CaregiverFormData);
  }

  async deleteCaregiver(index: number = 0): Promise<void> {
    await this.careTeamPage.deleteCaregiver(index);
    await this.handleConfirmationDialog();
  }

  // ============================================
  // Complete Workflows
  // ============================================

  async completeFullCareTeamWorkflow(customData?: CareTeamFormData): Promise<void> {
    const data = customData || CARE_TEAM_FORM_DATA;

    console.log('\n========================================');
    console.log('Starting Complete Care Team Workflow');
    console.log('========================================');

    await this.completeCareTeamSetup('add', data);

    if (data.attendingPhysician) {
      await this.fillAttendingPhysician('add', [], 0, data.attendingPhysician);
    }

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

  private getCareTeamNameForEnv(): string {
    const env = (process.env.TEST_ENV || 'qa').toLowerCase();
    const tenant = (process.env.TENANT || 'cth').toLowerCase();

    return CARE_TEAM_NAMES[env]?.[tenant] || CARE_TEAM_NAMES['qa']['cth'];
  }

  private getPhysicianNameForEnv(): string {
    return TestDataManager.getPhysician();
  }

  private async handleConfirmationDialog(): Promise<void> {
    try {
      const proceedButton = this.page.locator('button:has-text("Proceed")');
      if (await proceedButton.isVisible({ timeout: 2000 })) {
        await proceedButton.click();
        await this.page.waitForTimeout(1000);
      }
    } catch {
      // Proceed button not present, continue
    }

    try {
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

  async isCareTeamSelected(): Promise<boolean> {
    return await this.careTeamPage.isCareTeamSelected();
  }

  async isRoleAssigned(role: CareTeamRole): Promise<boolean> {
    return await this.careTeamPage.isRoleAssigned(role);
  }

  async getCaregiverCount(): Promise<number> {
    return await this.careTeamPage.getCaregiverCount();
  }

  async getAttendingPhysicianCount(): Promise<number> {
    return await this.careTeamPage.getAttendingPhysicianCount();
  }

  async waitForSuccessToast(timeout: number = 5000): Promise<void> {
    await this.careTeamPage.waitForSuccessToast(timeout);
  }

  async hasErrorToast(): Promise<boolean> {
    return await this.careTeamPage.hasErrorToast();
  }

  async getSelectedCareTeam(): Promise<string | null> {
    return await this.careTeamPage.getSelectedCareTeam();
  }
}
