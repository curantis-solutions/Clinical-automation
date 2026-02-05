import { Page } from '@playwright/test';
import { ConsentsPage } from '../pages_new/consents.page';

/**
 * Consents Workflow
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
   *
   * Use this method when you need to set different values for different consent fields.
   * Unlike `fillConsents()` which sets all fields to the same value, this method
   * allows granular control over each consent field.
   *
   * Automatically detects whether to add new or edit existing consents.
   * Only the fields specified in the consents object will be updated.
   *
   * @param consents - Object containing individual consent values
   * @param consents.allRecordsObtained - All Records Obtained field ('yes' or 'no')
   * @param consents.roiConsent - Release of Information Consent field ('yes' or 'no')
   * @param consents.cahpsReporting - CAHPS Reporting field ('yes' or 'no')
   * @param consents.hospiceElectionForm - Hospice Election Form field ('yes' or 'no')
   * @param consents.healthCareProxy - Health Care Proxy field ('yes' or 'no')
   * @param consents.acknowledgmentOfCare - Acknowledgment of Care field ('yes' or 'no')
   * @param consents.financialPowerOfAttorney - Financial Power of Attorney field ('yes' or 'no')
   * @param consents.durablePowerOfAttorney - Durable Power of Attorney field ('yes' or 'no')
   * @param consents.providerReferralOrders - Provider Referral/Orders field ('yes' or 'no')
   *
   * @example
   * // Set all required consents to 'yes', optional ones to 'no'
   * await consentsWorkflow.fillConsentsCustom({
   *   allRecordsObtained: 'yes',
   *   roiConsent: 'yes',
   *   cahpsReporting: 'no',
   *   hospiceElectionForm: 'yes',
   *   healthCareProxy: 'no',
   *   acknowledgmentOfCare: 'yes',
   *   financialPowerOfAttorney: 'no',
   *   durablePowerOfAttorney: 'no',
   *   providerReferralOrders: 'yes',
   * });
   *
   * @example
   * // Only update specific fields (partial update)
   * await consentsWorkflow.fillConsentsCustom({
   *   roiConsent: 'yes',
   *   healthCareProxy: 'yes',
   * });
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
