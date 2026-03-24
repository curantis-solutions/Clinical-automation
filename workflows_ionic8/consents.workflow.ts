import { Page } from '@playwright/test';
import { ConsentsPage } from '../pages_ionic8/consents.page';

/**
 * Consents Workflow (Ionic 8)
 * Handles add/edit operations for patient consents
 */
export class ConsentsWorkflow {
  private readonly consentsPage: ConsentsPage;

  constructor(private page: Page) {
    this.consentsPage = new ConsentsPage(page);
  }

  /**
   * Fill all consents with the specified value and save
   * Automatically detects whether to add new or edit existing consents
   * @param value - 'yes' or 'no' for all consent fields (default: 'yes')
   */
  async fillConsents(value: 'yes' | 'no' = 'yes'): Promise<void> {
    console.log(`\nFilling consents with value: ${value}...`);

    // Navigate to Consents tab
    await this.consentsPage.navigateToConsentsTab();
    await this.page.waitForTimeout(1000);

    // Determine mode based on which button is visible
    const isAddMode = await this.consentsPage.isAddButtonVisible();
    const isEditMode = await this.consentsPage.isMoreButtonVisible();

    if (isAddMode) {
      console.log('No existing consents - adding new...');
      await this.consentsPage.clickAddConsents();
    } else if (isEditMode) {
      console.log('Existing consents found - editing...');
      await this.consentsPage.openConsentsForm();
    } else {
      throw new Error('Neither Add nor Edit button found for consents');
    }

    // Fill all consent fields with the same value
    await this.consentsPage.fillAllConsents(value);

    // Verify save button is enabled before saving
    const isSaveEnabled = await this.consentsPage.isSaveButtonEnabled();
    if (!isSaveEnabled) {
      throw new Error('Save button is not enabled - form may have validation errors');
    }
    console.log('Save button is enabled');

    // Save
    await this.consentsPage.clickSave();
    await this.page.waitForTimeout(1000);

    console.log(`✅ Consents ${isAddMode ? 'added' : 'edited'} successfully`);
  }

  /**
   * Navigate to Consents tab (standalone)
   */
  async navigateToConsents(): Promise<void> {
    await this.consentsPage.navigateToConsentsTab();
  }

  /**
   * Fill consents with custom individual values and save
   */
  async fillConsentsCustom(consents: {
    allRecordsObtained?: 'yes' | 'no';
    roiConsent?: 'yes' | 'no';
    cahpsReporting?: 'yes' | 'no';
    hospiceElectionForm?: 'yes' | 'no';
    healthCareProxy?: 'yes' | 'no';
    acknowledgmentOfCare?: 'yes' | 'no';
    financialPowerOfAttorney?: 'yes' | 'no';
    durablePowerOfAttorney?: 'yes' | 'no';
    providerReferralOrders?: 'yes' | 'no';
  }): Promise<void> {
    console.log('\nFilling consents with custom values...');

    // Navigate to Consents tab
    await this.consentsPage.navigateToConsentsTab();
    await this.page.waitForTimeout(1000);

    // Determine mode based on which button is visible
    const isAddMode = await this.consentsPage.isAddButtonVisible();
    const isEditMode = await this.consentsPage.isMoreButtonVisible();

    if (isAddMode) {
      console.log('No existing consents - adding new...');
      await this.consentsPage.clickAddConsents();
    } else if (isEditMode) {
      console.log('Existing consents found - editing...');
      await this.consentsPage.openConsentsForm();
    } else {
      throw new Error('Neither Add nor Edit button found for consents');
    }

    // Fill consent fields with custom values
    await this.consentsPage.completeConsentsForm(consents);

    // Verify save button is enabled before saving
    const isSaveEnabled = await this.consentsPage.isSaveButtonEnabled();
    if (!isSaveEnabled) {
      throw new Error('Save button is not enabled - form may have validation errors');
    }
    console.log('Save button is enabled');

    // Save
    await this.consentsPage.clickSave();
    await this.page.waitForTimeout(1000);

    console.log(`✅ Consents ${isAddMode ? 'added' : 'edited'} with custom values successfully`);
  }
}
