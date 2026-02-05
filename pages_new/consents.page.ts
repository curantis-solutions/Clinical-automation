import { Page } from '@playwright/test';
import { BasePage } from '../pages/base.page';

/**
 * Consents Page Object
 * Handles the Consents section for patient management
 *
 * Note: Some radio buttons share the same data-cy attribute (radio-allow-data-publication-yes/no)
 * and need to be accessed using index-based selectors via nth() methods.
 */
export class ConsentsPage extends BasePage {
  private readonly selectors = {
    // Navigation
    consentsNavBarItem: '[data-cy="btn-nav-bar-item-consents"]',

    // Consents List View
    consentsAddButton: '[data-cy="btn-consents-page"]',
    consentsPageMore: '[data-cy="btn-consents-page-more"]',

    // Consent Form - Radio Buttons (unique selectors)
    allRecordsYes: '[data-cy="radio-all-records-yes"]',
    allRecordsNo: '[data-cy="radio-all-records-no"]',
    roiConsentYes: '[data-cy="radio-roi-consent-yes"]',
    roiConsentNo: '[data-cy="radio-roi-consent-no"]',

    // Consent Form - Radio Buttons (shared selector - use with nth())
    // Index mapping for radio-allow-data-publication-yes/no:
    // 0 = Allow Data Publication For CAHPS Reporting
    // 1 = Hospice Election Form
    // 2 = Health Care Proxy
    // 3 = Acknowledgment of Care
    // 4 = Financial Power of Attorney
    // 5 = Durable Power of Attorney
    // 6 = Provider Referral/Orders
    allowDataPublicationYes: '[data-cy="radio-allow-data-publication-yes"]',
    allowDataPublicationNo: '[data-cy="radio-allow-data-publication-no"]',

    // Form Actions
    saveButton: '[data-cy="btn-save"]',
    cancelButton: '[data-cy="btn-cancel"]',
  };

  // Index mapping for consent types that share the same data-cy attribute
  private readonly consentTypeIndex = {
    cahpsReporting: 0,
    hospiceElectionForm: 1,
    healthCareProxy: 2,
    acknowledgmentOfCare: 3,
    financialPowerOfAttorney: 4,
    durablePowerOfAttorney: 5,
    providerReferralOrders: 6,
  };

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to Consents tab
   */
  async navigateToConsentsTab(): Promise<void> {
    await this.page.waitForTimeout(1000);
    await this.waitForElement(this.selectors.consentsNavBarItem);
    await this.page.locator(this.selectors.consentsNavBarItem).click();
    await this.page.waitForTimeout(1000);
    console.log('✅ Navigated to Consents tab');
  }

  /**
   * Click Add Consents button (FAB)
   * Note: This button only appears when no consent data exists
   */
  async clickAddConsents(): Promise<void> {
    await this.waitForElement(this.selectors.consentsAddButton);
    await this.page.locator(this.selectors.consentsAddButton).click();
    await this.page.waitForTimeout(500);
    console.log('✅ Clicked Add Consents button');
  }

  /**
   * Click More options (3 dots) button
   */
  async clickMoreOptions(): Promise<void> {
    await this.waitForElement(this.selectors.consentsPageMore);
    await this.page.locator(this.selectors.consentsPageMore).click();
    await this.page.waitForTimeout(500);
    console.log('✅ Clicked More options button');
  }

  /**
   * Click Edit (pencil) button to open consents form
   * Note: This button appears after clicking the More options button
   */
  async clickEditButton(): Promise<void> {
    // The edit button is typically a 'create' button that appears after clicking more
    await this.page.getByRole('button', { name: 'create' }).click();
    await this.page.waitForTimeout(1000);
    console.log('✅ Clicked Edit button to open consents form');
  }

  /**
   * Open consents edit form (clicks more + edit)
   */
  async openConsentsForm(): Promise<void> {
    await this.clickMoreOptions();
    await this.clickEditButton();
  }

  // ==================== Consent Selection Methods ====================

  /**
   * Select All Records Obtained
   * @param value - 'yes' or 'no'
   */
  async selectAllRecordsObtained(value: 'yes' | 'no'): Promise<void> {
    const selector = value === 'yes' ? this.selectors.allRecordsYes : this.selectors.allRecordsNo;
    await this.page.locator(selector).click();
    await this.page.waitForTimeout(300);
    console.log(`✅ Selected All Records Obtained: ${value}`);
  }

  /**
   * Select Release of Information Consents Given
   * @param value - 'yes' or 'no'
   */
  async selectRoiConsent(value: 'yes' | 'no'): Promise<void> {
    const selector = value === 'yes' ? this.selectors.roiConsentYes : this.selectors.roiConsentNo;
    await this.page.locator(selector).click();
    await this.page.waitForTimeout(300);
    console.log(`✅ Selected ROI Consent: ${value}`);
  }

  /**
   * Select Allow Data Publication For CAHPS Reporting
   * @param value - 'yes' or 'no'
   */
  async selectCahpsReporting(value: 'yes' | 'no'): Promise<void> {
    await this.selectConsentByIndex('cahpsReporting', value);
    console.log(`✅ Selected CAHPS Reporting: ${value}`);
  }

  /**
   * Select Hospice Election Form
   * @param value - 'yes' or 'no'
   */
  async selectHospiceElectionForm(value: 'yes' | 'no'): Promise<void> {
    await this.selectConsentByIndex('hospiceElectionForm', value);
    console.log(`✅ Selected Hospice Election Form: ${value}`);
  }

  /**
   * Select Health Care Proxy
   * @param value - 'yes' or 'no'
   */
  async selectHealthCareProxy(value: 'yes' | 'no'): Promise<void> {
    await this.selectConsentByIndex('healthCareProxy', value);
    console.log(`✅ Selected Health Care Proxy: ${value}`);
  }

  /**
   * Select Acknowledgment of Care
   * @param value - 'yes' or 'no'
   */
  async selectAcknowledgmentOfCare(value: 'yes' | 'no'): Promise<void> {
    await this.selectConsentByIndex('acknowledgmentOfCare', value);
    console.log(`✅ Selected Acknowledgment of Care: ${value}`);
  }

  /**
   * Select Financial Power of Attorney
   * @param value - 'yes' or 'no'
   */
  async selectFinancialPowerOfAttorney(value: 'yes' | 'no'): Promise<void> {
    await this.selectConsentByIndex('financialPowerOfAttorney', value);
    console.log(`✅ Selected Financial Power of Attorney: ${value}`);
  }

  /**
   * Select Durable Power of Attorney
   * @param value - 'yes' or 'no'
   */
  async selectDurablePowerOfAttorney(value: 'yes' | 'no'): Promise<void> {
    await this.selectConsentByIndex('durablePowerOfAttorney', value);
    console.log(`✅ Selected Durable Power of Attorney: ${value}`);
  }

  /**
   * Select Provider Referral/Orders
   * @param value - 'yes' or 'no'
   */
  async selectProviderReferralOrders(value: 'yes' | 'no'): Promise<void> {
    await this.selectConsentByIndex('providerReferralOrders', value);
    console.log(`✅ Selected Provider Referral/Orders: ${value}`);
  }

  /**
   * Helper method to select consent by index (for shared data-cy attributes)
   * @param consentType - The consent type from consentTypeIndex
   * @param value - 'yes' or 'no'
   */
  private async selectConsentByIndex(
    consentType: keyof typeof this.consentTypeIndex,
    value: 'yes' | 'no'
  ): Promise<void> {
    const index = this.consentTypeIndex[consentType];
    const selector = value === 'yes'
      ? this.selectors.allowDataPublicationYes
      : this.selectors.allowDataPublicationNo;

    await this.page.locator(selector).nth(index).click();
    await this.page.waitForTimeout(300);
  }

  // ==================== Form Actions ====================

  /**
   * Click Save button
   */
  async clickSave(): Promise<void> {
    await this.page.locator(this.selectors.saveButton).click();
    await this.page.waitForTimeout(1000);
    console.log('✅ Clicked Save button');
  }

  /**
   * Click Cancel button
   */
  async clickCancel(): Promise<void> {
    await this.page.locator(this.selectors.cancelButton).click();
    await this.page.waitForTimeout(500);
    console.log('✅ Clicked Cancel button');
  }

  /**
   * Check if Save button is enabled
   */
  async isSaveButtonEnabled(): Promise<boolean> {
    return await this.page.locator(this.selectors.saveButton).isEnabled();
  }

  /**
   * Check if Add Consents button is visible
   */
  async isAddButtonVisible(timeout: number = 2000): Promise<boolean> {
    return await this.page.locator(this.selectors.consentsAddButton)
      .isVisible({ timeout })
      .catch(() => false);
  }

  /**
   * Check if More Options button is visible (indicates existing consents)
   */
  async isMoreButtonVisible(timeout: number = 2000): Promise<boolean> {
    return await this.page.locator(this.selectors.consentsPageMore)
      .isVisible({ timeout })
      .catch(() => false);
  }

  // ==================== Complete Form Methods ====================

  /**
   * Fill all consents with the same value
   * @param value - 'yes' or 'no' for all consents
   */
  async fillAllConsents(value: 'yes' | 'no'): Promise<void> {
    console.log(`\n📋 Filling all consents with: ${value}`);

    await this.selectAllRecordsObtained(value);
    await this.selectRoiConsent(value);
    await this.selectCahpsReporting(value);
    await this.selectHospiceElectionForm(value);
    await this.selectHealthCareProxy(value);
    await this.selectAcknowledgmentOfCare(value);
    await this.selectFinancialPowerOfAttorney(value);
    await this.selectDurablePowerOfAttorney(value);
    await this.selectProviderReferralOrders(value);

    console.log('✅ All consents filled');
  }

  /**
   * Complete consents form with custom values
   * @param consents - Object containing consent values
   */
  async completeConsentsForm(consents: {
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
    console.log('\n📋 Completing Consents form...');

    if (consents.allRecordsObtained) {
      await this.selectAllRecordsObtained(consents.allRecordsObtained);
    }
    if (consents.roiConsent) {
      await this.selectRoiConsent(consents.roiConsent);
    }
    if (consents.cahpsReporting) {
      await this.selectCahpsReporting(consents.cahpsReporting);
    }
    if (consents.hospiceElectionForm) {
      await this.selectHospiceElectionForm(consents.hospiceElectionForm);
    }
    if (consents.healthCareProxy) {
      await this.selectHealthCareProxy(consents.healthCareProxy);
    }
    if (consents.acknowledgmentOfCare) {
      await this.selectAcknowledgmentOfCare(consents.acknowledgmentOfCare);
    }
    if (consents.financialPowerOfAttorney) {
      await this.selectFinancialPowerOfAttorney(consents.financialPowerOfAttorney);
    }
    if (consents.durablePowerOfAttorney) {
      await this.selectDurablePowerOfAttorney(consents.durablePowerOfAttorney);
    }
    if (consents.providerReferralOrders) {
      await this.selectProviderReferralOrders(consents.providerReferralOrders);
    }

    console.log('✅ Consents form completed');
  }
}
